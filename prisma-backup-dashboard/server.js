require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const cron = require('cron');

const app = express();
const PORT = process.env.PORT || 8080;
const BACKUP_DIR = path.join(__dirname, 'backups');
const LOG_FILE = path.join(__dirname, 'backup-system.log');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Create backups directory if missing
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

/** Logging Helper */
function logEvent(message, type = 'INFO') {
    const timestamp = new Date().toISOString();
    const formatted = `[${timestamp}] [${type}] ${message}\n`;
    console.log(formatted.trim());
    fs.appendFileSync(LOG_FILE, formatted);
}

/** Backup Execution Logic */
async function executeBackup() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        logEvent('DATABASE_URL is not configured.', 'ERROR');
        return false;
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    let command = '';
    let filename = '';

    if (dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://')) {
        filename = `pg_backup_${timestamp}.sql`;
        const filepath = path.join(BACKUP_DIR, filename);
        // Note: For prisma pooled urls (...?pgbouncer=true), direct pg_dump works if directUrl is also provided. 
        // We assume dbUrl is the direct connection string.
        command = `pg_dump "${dbUrl}" -F p -f "${filepath}"`;
    } else if (dbUrl.startsWith('mysql://')) {
        filename = `mysql_backup_${timestamp}.sql`;
        const filepath = path.join(BACKUP_DIR, filename);
        command = `mysqldump --host=${dbUrl} > "${filepath}"`; // Simplified, regex parse usually needed
        logEvent('Basic MySQL support active. Complex URLs may need regex parsing.', 'WARN');
    } else {
        logEvent('Unsupported database protocol.', 'ERROR');
        return false;
    }

    logEvent(`Starting backup: ${filename}`);

    return new Promise((resolve) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                logEvent(`Backup failed: ${error.message}`, 'ERROR');
                if (stderr) logEvent(`stderr: ${stderr}`, 'ERROR');
                resolve(false);
                return;
            }
            logEvent(`Backup successful: ${filename}`);
            enforceRetentionPolicy();
            resolve(true);
        });
    });
}

/** Backup Rotation Logic */
function enforceRetentionPolicy() {
    const retentionCount = parseInt(process.env.BACKUP_RETENTION_COUNT || '7', 10);

    fs.readdir(BACKUP_DIR, (err, files) => {
        if (err) {
            logEvent(`Failed to read backup dir for rotation: ${err.message}`, 'ERROR');
            return;
        }

        const backups = files
            .filter(f => f.endsWith('.sql') || f.endsWith('.dump') || f.endsWith('.json'))
            .map(f => ({ name: f, time: fs.statSync(path.join(BACKUP_DIR, f)).mtime.getTime() }))
            .sort((a, b) => b.time - a.time); // newest first

        if (backups.length > retentionCount) {
            const toDelete = backups.slice(retentionCount);
            toDelete.forEach(file => {
                try {
                    fs.unlinkSync(path.join(BACKUP_DIR, file.name));
                    logEvent(`Rotated out old backup: ${file.name}`);
                } catch (e) {
                    logEvent(`Failed to delete old backup ${file.name}: ${e.message}`, 'ERROR');
                }
            });
        }
    });
}

/** Cron Setup */
let activeCronJob = null;

function setupSchedule() {
    if (activeCronJob) {
        activeCronJob.stop();
    }

    const schedule = process.env.BACKUP_CRON_SCHEDULE || '0 2 * * *'; // Default 2AM daily

    try {
        activeCronJob = new cron.CronJob(schedule, () => {
            logEvent('Executing scheduled backup...');
            executeBackup();
        });
        activeCronJob.start();
        logEvent(`Scheduled backups active with cron: ${schedule}`);
    } catch (e) {
        logEvent(`Invalid cron schedule '${schedule}': ${e.message}`, 'ERROR');
    }
}


// --- API Endpoints ---

// Get Status & Config
app.get('/api/status', (req, res) => {
    res.json({
        dbUrlConfigured: !!process.env.DATABASE_URL,
        schedule: process.env.BACKUP_CRON_SCHEDULE || '0 2 * * *',
        retention: process.env.BACKUP_RETENTION_COUNT || '7',
        nextRun: (() => {
            try {
                return activeCronJob ? activeCronJob.nextDate().toISO() : null;
            } catch (e) {
                return null;
            }
        })()
    });
});

// Update Config (In a real app, write to .env file too)
app.post('/api/config', (req, res) => {
    const { schedule, retention } = req.body;
    if (schedule) process.env.BACKUP_CRON_SCHEDULE = schedule;
    if (retention) process.env.BACKUP_RETENTION_COUNT = retention;

    setupSchedule();
    res.json({ success: true, message: 'Configuration updated (in-memory).' });
});

// List Backups
app.get('/api/backups', (req, res) => {
    fs.readdir(BACKUP_DIR, (err, files) => {
        if (err) return res.status(500).json({ error: 'Failed to read directory' });

        const backups = files.map(file => {
            const stats = fs.statSync(path.join(BACKUP_DIR, file));
            return {
                name: file,
                size: (stats.size / (1024 * 1024)).toFixed(2) + ' MB',
                date: stats.mtime
            };
        }).sort((a, b) => b.date - a.date);

        res.json(backups);
    });
});

// Download Backup
app.get('/api/backups/:filename', (req, res) => {
    const file = path.join(BACKUP_DIR, req.params.filename);
    if (fs.existsSync(file)) {
        res.download(file);
    } else {
        res.status(404).send('File not found');
    }
});

// Delete Backup
app.delete('/api/backups/:filename', (req, res) => {
    const file = path.join(BACKUP_DIR, req.params.filename);
    if (fs.existsSync(file)) {
        fs.unlinkSync(file);
        logEvent(`User deleted backup: ${req.params.filename}`);
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'File not found' });
    }
});

// Trigger Manual Backup
app.post('/api/backups/trigger', async (req, res) => {
    logEvent('Manual backup triggered via API');
    const success = await executeBackup();
    res.json({ success });
});

// Read Logs
app.get('/api/logs', (req, res) => {
    if (fs.existsSync(LOG_FILE)) {
        res.send(fs.readFileSync(LOG_FILE, 'utf8'));
    } else {
        res.send('No logs yet.');
    }
});

// Process Signal Handling for Graceful Shutdown
process.on('SIGTERM', () => {
    logEvent('SIGTERM received. Shutting down gracefully.');
    if (activeCronJob) activeCronJob.stop();
    process.exit(0);
});

process.on('SIGINT', () => {
    logEvent('SIGINT received. Shutting down gracefully.');
    if (activeCronJob) activeCronJob.stop();
    process.exit(0);
});


// Start App
app.listen(PORT, () => {
    logEvent(`Backup Dashboard running on port ${PORT}`);
    setupSchedule();
});
