"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminStore } from "@/store/adminStore";
import {
    getBackups,
    getBackupConfig,
    createBackup,
    restoreBackup,
    deleteBackup,
    updateBackupConfig,
} from "@/app/actions/backupActions";
import {
    ArrowLeft,
    Database,
    Download,
    RefreshCw,
    Trash2,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Settings,
    RotateCcw,
} from "lucide-react";
import Link from "next/link";

type Backup = {
    id: string;
    status: string;
    size: number | null;
    duration: number | null;
    checksum: string | null;
    triggeredBy: string | null;
    notes: string | null;
    createdAt: Date;
};

type BackupConfig = {
    id: string;
    schedule: string;
    retentionDays: number;
    maxBackups: number;
};

function formatBytes(bytes: number | null): string {
    if (bytes === null || bytes === undefined) return "–";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDuration(ms: number | null): string {
    if (ms === null || ms === undefined) return "–";
    if (ms < 1000) return `${ms} ms`;
    return `${(ms / 1000).toFixed(1)} s`;
}

function StatusBadge({ status }: { status: string }) {
    if (status === "completed") {
        return (
            <span className="flex items-center gap-1 text-green-700 font-semibold">
                <CheckCircle className="h-4 w-4" /> Completed
            </span>
        );
    }
    if (status === "failed") {
        return (
            <span className="flex items-center gap-1 text-red-600 font-semibold">
                <XCircle className="h-4 w-4" /> Failed
            </span>
        );
    }
    return (
        <span className="flex items-center gap-1 text-yellow-600 font-semibold">
            <RefreshCw className="h-4 w-4 animate-spin" /> {status}
        </span>
    );
}

export default function AdminBackupPage() {
    const { isAuthenticated } = useAdminStore();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    const [backups, setBackups] = useState<Backup[]>([]);
    const [config, setConfig] = useState<BackupConfig | null>(null);
    const [loading, setLoading] = useState(false);
    const [actionMsg, setActionMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // Restore dialog state
    const [restoreTarget, setRestoreTarget] = useState<Backup | null>(null);
    const [restoreConfirmation, setRestoreConfirmation] = useState("");
    const [restoring, setRestoring] = useState(false);

    // Config edit state
    const [editingConfig, setEditingConfig] = useState(false);
    const [configDraft, setConfigDraft] = useState<Partial<BackupConfig>>({});

    const loadData = async () => {
        const [b, c] = await Promise.all([getBackups(), getBackupConfig()]);
        setBackups(b as Backup[]);
        setConfig(c as BackupConfig);
    };

    useEffect(() => {
        setMounted(true);
        if (!isAuthenticated) {
            router.push("/admin/login");
        } else {
            loadData();
        }
    }, [isAuthenticated, router]);

    if (!mounted || !isAuthenticated) return null;

    const failedBackups = backups.filter((b) => b.status === "failed");

    const handleCreateBackup = async () => {
        setLoading(true);
        setActionMsg(null);
        const result = await createBackup("admin");
        if (result.success) {
            setActionMsg({ type: "success", text: "Backup created successfully." });
        } else {
            setActionMsg({ type: "error", text: result.error ?? "Backup failed." });
        }
        await loadData();
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this backup? This action cannot be undone.")) return;
        const result = await deleteBackup(id);
        if (!result.success) {
            setActionMsg({ type: "error", text: result.error ?? "Delete failed." });
        } else {
            setActionMsg({ type: "success", text: "Backup deleted." });
        }
        await loadData();
    };

    const handleRestore = async () => {
        if (!restoreTarget) return;
        setRestoring(true);
        setActionMsg(null);
        const result = await restoreBackup(
            restoreTarget.id,
            restoreConfirmation,
            "admin",
        );
        if (result.success) {
            setActionMsg({ type: "success", text: "Database restored successfully. A pre-restore backup was created automatically." });
            setRestoreTarget(null);
            setRestoreConfirmation("");
            await loadData();
        } else {
            setActionMsg({ type: "error", text: result.error ?? "Restore failed." });
        }
        setRestoring(false);
    };

    const handleSaveConfig = async () => {
        if (!config) return;
        const result = await updateBackupConfig(config.id, configDraft, "admin");
        if (result.success) {
            setActionMsg({ type: "success", text: "Configuration saved." });
            setEditingConfig(false);
            await loadData();
        } else {
            setActionMsg({ type: "error", text: result.error ?? "Save failed." });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 text-black">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <Link
                            href="/admin/dashboard"
                            className="flex items-center text-brewery-dark hover:text-brewery-green font-bold mb-4"
                        >
                            <ArrowLeft className="h-5 w-5 mr-2" /> Back to Dashboard
                        </Link>
                        <h1 className="text-4xl font-bold text-brewery-dark flex items-center gap-3">
                            <Database className="h-9 w-9" /> Database Backups
                        </h1>
                    </div>
                    <button
                        onClick={handleCreateBackup}
                        disabled={loading}
                        className="flex items-center gap-2 bg-brewery-dark text-white font-bold px-5 py-3 hover:bg-brewery-green transition-colors disabled:opacity-50"
                    >
                        <Download className="h-5 w-5" />
                        {loading ? "Creating…" : "Create Backup"}
                    </button>
                </div>

                {/* Action feedback */}
                {actionMsg && (
                    <div
                        className={`flex items-center gap-2 p-4 mb-6 border-2 font-medium ${actionMsg.type === "success"
                            ? "border-green-600 bg-green-50 text-green-800"
                            : "border-red-600 bg-red-50 text-red-800"
                            }`}
                    >
                        {actionMsg.type === "success" ? (
                            <CheckCircle className="h-5 w-5 shrink-0" />
                        ) : (
                            <XCircle className="h-5 w-5 shrink-0" />
                        )}
                        {actionMsg.text}
                        <button
                            className="ml-auto text-sm underline"
                            onClick={() => setActionMsg(null)}
                        >
                            Dismiss
                        </button>
                    </div>
                )}

                {/* Failed-backup alert */}
                {failedBackups.length > 0 && (
                    <div className="flex items-start gap-3 p-4 mb-6 border-2 border-yellow-500 bg-yellow-50 text-yellow-900">
                        <AlertTriangle className="h-6 w-6 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-bold">
                                {failedBackups.length} failed backup{failedBackups.length > 1 ? "s" : ""} detected
                            </p>
                            <p className="text-sm mt-1">
                                Review the table below. Create a new backup to ensure you have a recent valid snapshot.
                            </p>
                        </div>
                    </div>
                )}

                {/* Backup History Table */}
                <div className="bg-white border-2 border-black shadow-lg mb-8">
                    <div className="p-6 border-b-2 border-black">
                        <h2 className="text-2xl font-bold text-brewery-dark">Backup History</h2>
                        <p className="text-gray-500 text-sm mt-1">
                            {backups.length} backup{backups.length !== 1 ? "s" : ""} stored
                        </p>
                    </div>

                    {backups.length === 0 ? (
                        <div className="p-10 text-center text-gray-400">
                            <Database className="h-12 w-12 mx-auto mb-3 opacity-30" />
                            <p>No backups yet. Create your first backup above.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-100 border-b-2 border-black">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-bold">Date & Time</th>
                                        <th className="px-4 py-3 text-left font-bold">Status</th>
                                        <th className="px-4 py-3 text-left font-bold">Size</th>
                                        <th className="px-4 py-3 text-left font-bold">Duration</th>
                                        <th className="px-4 py-3 text-left font-bold">Checksum (SHA-256)</th>
                                        <th className="px-4 py-3 text-left font-bold">Triggered By</th>
                                        <th className="px-4 py-3 text-left font-bold">Notes</th>
                                        <th className="px-4 py-3 text-left font-bold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {backups.map((b) => (
                                        <tr key={b.id} className="border-b border-gray-200 hover:bg-gray-50">
                                            <td className="px-4 py-3 font-mono whitespace-nowrap">
                                                {new Date(b.createdAt).toLocaleString("nl-BE")}
                                            </td>
                                            <td className="px-4 py-3">
                                                <StatusBadge status={b.status} />
                                            </td>
                                            <td className="px-4 py-3">{formatBytes(b.size)}</td>
                                            <td className="px-4 py-3">{formatDuration(b.duration)}</td>
                                            <td className="px-4 py-3 font-mono text-xs">
                                                {b.checksum ? b.checksum.slice(0, 12) + "…" : "–"}
                                            </td>
                                            <td className="px-4 py-3">{b.triggeredBy ?? "–"}</td>
                                            <td className="px-4 py-3 text-xs text-gray-500 max-w-xs truncate">
                                                {b.notes ?? "–"}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    {b.status === "completed" && (
                                                        <button
                                                            onClick={() => {
                                                                setRestoreTarget(b);
                                                                setRestoreConfirmation("");
                                                                setActionMsg(null);
                                                            }}
                                                            className="flex items-center gap-1 px-2 py-1 bg-brewery-dark text-white text-xs font-bold hover:bg-brewery-green transition-colors"
                                                            title="Restore this backup"
                                                        >
                                                            <RotateCcw className="h-3 w-3" /> Restore
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDelete(b.id)}
                                                        className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-bold hover:bg-red-200 transition-colors"
                                                        title="Delete backup"
                                                    >
                                                        <Trash2 className="h-3 w-3" /> Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Configuration */}
                {config && (
                    <div className="bg-white border-2 border-black shadow-lg">
                        <div className="p-6 border-b-2 border-black flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-brewery-dark flex items-center gap-2">
                                <Settings className="h-6 w-6" /> Backup Settings
                            </h2>
                            {!editingConfig ? (
                                <button
                                    onClick={() => {
                                        setConfigDraft({
                                            schedule: config.schedule,
                                            retentionDays: config.retentionDays,
                                            maxBackups: config.maxBackups,
                                        });
                                        setEditingConfig(true);
                                    }}
                                    className="text-brewery-dark hover:text-brewery-green font-bold text-sm underline"
                                >
                                    Edit
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleSaveConfig}
                                        className="bg-brewery-dark text-white font-bold px-4 py-1 text-sm hover:bg-brewery-green transition-colors"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => setEditingConfig(false)}
                                        className="border-2 border-black text-black font-bold px-4 py-1 text-sm hover:bg-gray-100 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block font-bold mb-1">Schedule</label>
                                {editingConfig ? (
                                    <select
                                        value={configDraft.schedule ?? config.schedule}
                                        onChange={(e) => setConfigDraft({ ...configDraft, schedule: e.target.value })}
                                        className="border-2 border-black px-3 py-2 w-full"
                                    >
                                        <option value="manual">Manual only</option>
                                        <option value="daily">Daily (via cron)</option>
                                        <option value="weekly">Weekly (via cron)</option>
                                    </select>
                                ) : (
                                    <p className="text-gray-700 capitalize">{config.schedule}</p>
                                )}
                                <p className="text-xs text-gray-400 mt-1">
                                    Automated schedules require a cron job calling <code>/api/backup/cron</code>.
                                </p>
                            </div>
                            <div>
                                <label className="block font-bold mb-1">Retention (days)</label>
                                {editingConfig ? (
                                    <input
                                        type="number"
                                        min={1}
                                        value={configDraft.retentionDays ?? config.retentionDays}
                                        onChange={(e) =>
                                            setConfigDraft({ ...configDraft, retentionDays: Number(e.target.value) })
                                        }
                                        className="border-2 border-black px-3 py-2 w-full"
                                    />
                                ) : (
                                    <p className="text-gray-700">{config.retentionDays} days</p>
                                )}
                            </div>
                            <div>
                                <label className="block font-bold mb-1">Max Backups Stored</label>
                                {editingConfig ? (
                                    <input
                                        type="number"
                                        min={1}
                                        value={configDraft.maxBackups ?? config.maxBackups}
                                        onChange={(e) =>
                                            setConfigDraft({ ...configDraft, maxBackups: Number(e.target.value) })
                                        }
                                        className="border-2 border-black px-3 py-2 w-full"
                                    />
                                ) : (
                                    <p className="text-gray-700">{config.maxBackups}</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Restore confirmation modal */}
            {restoreTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                    <div className="bg-white border-4 border-red-600 shadow-2xl max-w-lg w-full mx-4 p-8">
                        <div className="flex items-center gap-3 mb-4 text-red-700">
                            <AlertTriangle className="h-8 w-8 shrink-0" />
                            <h3 className="text-2xl font-bold">Confirm Restore</h3>
                        </div>

                        <div className="bg-red-50 border border-red-200 p-4 mb-5 text-sm text-red-800 space-y-1">
                            <p><strong>⚠ This will overwrite all current data.</strong></p>
                            <p>Products, Orders, Events, Tickets, and Newsletter subscribers will be replaced with the contents of this backup.</p>
                            <p>A pre-restore safety backup will be created automatically before proceeding.</p>
                            <p className="mt-2">
                                <strong>Backup date:</strong>{" "}
                                {new Date(restoreTarget.createdAt).toLocaleString("nl-BE")}
                            </p>
                            <p>
                                <strong>Checksum:</strong>{" "}
                                <span className="font-mono">{restoreTarget.checksum?.slice(0, 16)}…</span>
                            </p>
                        </div>

                        <label className="block font-bold mb-2">
                            Type <code className="bg-gray-100 px-1">RESTORE</code> to confirm:
                        </label>
                        <input
                            type="text"
                            value={restoreConfirmation}
                            onChange={(e) => setRestoreConfirmation(e.target.value)}
                            className="border-2 border-black px-3 py-2 w-full mb-5 font-mono"
                            placeholder="RESTORE"
                            autoFocus
                        />

                        <div className="flex gap-3">
                            <button
                                onClick={handleRestore}
                                disabled={restoring || restoreConfirmation !== "RESTORE"}
                                className="flex-1 bg-red-600 text-white font-bold py-3 hover:bg-red-700 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
                            >
                                <RotateCcw className="h-5 w-5" />
                                {restoring ? "Restoring…" : "Restore Database"}
                            </button>
                            <button
                                onClick={() => {
                                    setRestoreTarget(null);
                                    setRestoreConfirmation("");
                                }}
                                disabled={restoring}
                                className="flex-1 border-2 border-black text-black font-bold py-3 hover:bg-gray-100 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
