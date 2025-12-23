import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';

// Helper to load .env manually if not loaded (basic implementation)
function loadEnv() {
    try {
        const envPath = path.resolve(process.cwd(), '.env');
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf-8');
            envContent.split('\n').forEach(line => {
                // Simple parser that handles KEY=VALUE
                const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/);
                if (match) {
                    const key = match[1];
                    let value = match[2] || '';

                    // Remove quotes if present
                    if ((value.startsWith('"') && value.endsWith('"')) ||
                        (value.startsWith("'") && value.endsWith("'"))) {
                        value = value.slice(1, -1);
                    }

                    if (!process.env[key]) {
                        process.env[key] = value;
                    }
                }
            });
            console.log('Loaded .env file');
        } else {
            console.log('.env file not found at:', envPath);
        }
    } catch (e) {
        console.error('Failed to load .env manually', e);
    }
}

loadEnv();

const RESEND_API_KEY = process.env.RESEND_API_KEY;

if (!RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY not found in environment.');
    console.log('Please ensure you have a .env file with RESEND_API_KEY defined.');
    process.exit(1);
}

const resend = new Resend(RESEND_API_KEY);

// Use the domain the user specified: webshop.manenbrouw.be
const FROM_EMAIL = 'Man & Brouw <order@webshop.manenbrouw.be>';
// Default to info@manenbrouw.be or take from command line
const TO_EMAIL = process.argv[2] || 'info@manenbrouw.be';

async function sendTestEmail() {
    console.log(`\n🚀 Starting Resend Test Script`);
    console.log(`--------------------------------`);
    console.log(`Using API Key: ${RESEND_API_KEY.slice(0, 5)}...`);
    console.log(`From: ${FROM_EMAIL}`);
    console.log(`To:   ${TO_EMAIL}`);
    console.log(`--------------------------------\n`);

    try {
        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: TO_EMAIL,
            subject: 'Test Email from Man & Brouw Webshop (Domain Verification)',
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">Test Email</h1>
            <p>This is a test email sent to verify the configuration of the domain:</p>
            <p style="background: #f4f4f4; padding: 10px; border-radius: 4px; font-family: monospace;">
                order@webshop.manenbrouw.be
            </p>
            <p>If you received this email, the <strong>DKIM</strong> and <strong>SPF</strong> records are likely working correctly!</p>
            <hr />
            <p style="font-size: 12px; color: #888;">Sent via Resend API on ${new Date().toLocaleString()}</p>
        </div>
      `,
        });

        if (error) {
            console.error('❌ Error sending email:', error);
            console.log('\nPossible reasons:');
            console.log('- The domain "webshop.manenbrouw.be" is not verified in Resend yet.');
            console.log('- The API key is invalid.');
            console.log('- You have reached your sending limit.');
        } else {
            console.log('✅ Email sent successfully!');
            console.log('ID:', data?.id);
        }
    } catch (err) {
        console.error('❌ Exception occurred:', err);
    }
}

sendTestEmail();
