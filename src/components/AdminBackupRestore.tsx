import React, { useState, useEffect, useRef } from 'react';
import {
  Database,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileSpreadsheet,
  FileText,
  Clock,
  Check,
  X,
  Eye,
  Info,
  Layers,
  Users,
  Bell,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import {
  executeFullDatabaseExport,
  downloadSampleCSVTemplate,
  preCheckImportFile,
  commitSmartRestore,
  PreCheckResult,
} from '../utils/backupRestoreEngine';
import { RestoreSummary } from '../types';
import { formatDateToDDMMYYYY, formatDateTimeToDDMMYYYY } from '../utils/dateFormatter';

interface AdminBackupRestoreProps {
  onRefreshUsers: () => Promise<void>;
  showToast: (text: string, type?: 'success' | 'error') => void;
}

export const AdminBackupRestore: React.FC<AdminBackupRestoreProps> = ({
  onRefreshUsers,
  showToast,
}) => {
  // Live stats from Firestore
  const [dbStats, setDbStats] = useState({
    usersCount: 0,
    noticesCount: 0,
    coursesCount: 0,
    resourcesCount: 0,
    loading: true,
  });

  const [lastBackupTime, setLastBackupTime] = useState<string | null>(() => {
    return localStorage.getItem('ntechbay_last_backup_date');
  });

  // Export State
  const [isExporting, setIsExporting] = useState(false);

  // Import / Restore State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [preCheckResult, setPreCheckResult] = useState<PreCheckResult | null>(null);
  const [showDetailPreview, setShowDetailPreview] = useState(false);

  // Restore Execution & Real-time Progress State
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreProgress, setRestoreProgress] = useState<{
    current: number;
    total: number;
    percentage: number;
    message: string;
  }>({
    current: 0,
    total: 0,
    percentage: 0,
    message: '',
  });

  // Completion Modal State
  const [completionSummary, setCompletionSummary] = useState<RestoreSummary | null>(null);
  const [completionDetailFilter, setCompletionDetailFilter] = useState<'all' | 'inserted' | 'skipped' | 'failed'>('all');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch Firestore Collection counts for status display
  const fetchDbCounts = async () => {
    setDbStats((prev) => ({ ...prev, loading: true }));
    try {
      const [usersSnap, noticesSnap, coursesSnap, resourcesSnap] = await Promise.all([
        getDocs(collection(db, 'users')).catch(() => ({ size: 0 })),
        getDocs(collection(db, 'notices')).catch(() => ({ size: 0 })),
        getDocs(collection(db, 'courses')).catch(() => ({ size: 0 })),
        getDocs(collection(db, 'resources')).catch(() => ({ size: 0 })),
      ]);

      setDbStats({
        usersCount: usersSnap.size,
        noticesCount: noticesSnap.size,
        coursesCount: coursesSnap.size,
        resourcesCount: resourcesSnap.size,
        loading: false,
      });
    } catch (err) {
      console.warn('Error fetching DB counts:', err);
      setDbStats((prev) => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchDbCounts();
  }, []);

  // 1. Lossless JSON Export Handler
  const handleExportBackup = async () => {
    setIsExporting(true);
    try {
      const result = await executeFullDatabaseExport();
      setLastBackupTime(new Date().toISOString());
      showToast(
        `Full backup exported successfully! Downloaded ${result.fileName} (${result.totalRecords} records).`,
        'success'
      );
      fetchDbCounts();
    } catch (err: any) {
      console.error('Backup export failed:', err);
      showToast(`Export failed: ${err.message || 'Unknown error occurred'}`, 'error');
    } finally {
      setIsExporting(false);
    }
  };

  // 2. File Selection & Analysis Handler
  const handleFileChange = async (file: File) => {
    setSelectedFile(file);
    setIsAnalyzing(true);
    setPreCheckResult(null);

    try {
      const result = await preCheckImportFile(file);
      setPreCheckResult(result);
      showToast(
        `File analyzed: ${result.totalInFile} total, ${result.toInsertCount} unique new, ${result.skippedDuplicatesCount} duplicates skipped.`,
        'success'
      );
    } catch (err: any) {
      console.error('Pre-check error:', err);
      setSelectedFile(null);
      setPreCheckResult(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      showToast(`File inspection failed: ${err.message || 'Invalid or corrupted file'}`, 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  // 3. Smart Restore Execution with 400 Write Safe Chunking
  const handleExecuteRestore = async () => {
    if (!preCheckResult || preCheckResult.itemsToInsert.length === 0) {
      showToast('No new unique records to restore.', 'error');
      return;
    }

    setIsRestoring(true);
    setRestoreProgress({
      current: 0,
      total: preCheckResult.itemsToInsert.length,
      percentage: 0,
      message: 'Initializing restore engine...',
    });

    try {
      const summary = await commitSmartRestore(
        preCheckResult.itemsToInsert,
        preCheckResult.totalInFile,
        preCheckResult.details,
        (current, total, percentage, message) => {
          setRestoreProgress({ current, total, percentage, message });
        }
      );

      // Refresh database counts and user state
      await onRefreshUsers();
      await fetchDbCounts();

      // Show completion modal
      setCompletionSummary(summary);
      showToast(
        `Restore completed! ${summary.successfullyRestored} restored, ${summary.skippedDuplicates} skipped, ${summary.failed} failed.`,
        'success'
      );

      // Reset file input
      setSelectedFile(null);
      setPreCheckResult(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      console.error('Restore execution failed:', err);
      showToast(`Restore execution failed: ${err.message || 'Unknown database error'}`, 'error');
    } finally {
      setIsRestoring(false);
    }
  };

  const resetSelectedFile = () => {
    setSelectedFile(null);
    setPreCheckResult(null);
    setShowDetailPreview(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Filter completion modal details
  const filteredCompletionDetails = completionSummary?.details.filter((d) => {
    if (completionDetailFilter === 'all') return true;
    return d.status === completionDetailFilter;
  });

  return (
    <div className="space-y-6">
      {/* Module Header Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Database Backup & Smart Restore
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Production Grade
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                Execute lossless full database JSON exports and smart-restore student records from
                JSON or CSV files. Automatically deduplicates records, normalizes timestamps, and
                safely chunks batches to 400 operations.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchDbCounts}
            disabled={dbStats.loading}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 transition-colors cursor-pointer"
            title="Refresh database collection counts"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${dbStats.loading ? 'animate-spin text-blue-600' : ''}`} />
            <span>Refresh Stats</span>
          </button>
        </div>

        {/* Database Live Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-500">Users (Profiles)</span>
              <Users className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <p className="text-lg font-bold text-slate-900 mt-1">
              {dbStats.loading ? '—' : dbStats.usersCount}
            </p>
            <span className="text-[10px] text-slate-400">collection: users</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-500">Broadcasts</span>
              <Bell className="w-3.5 h-3.5 text-purple-600" />
            </div>
            <p className="text-lg font-bold text-slate-900 mt-1">
              {dbStats.loading ? '—' : dbStats.noticesCount}
            </p>
            <span className="text-[10px] text-slate-400">collection: notices</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-500">Catalog Courses</span>
              <Layers className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <p className="text-lg font-bold text-slate-900 mt-1">
              {dbStats.loading ? '—' : dbStats.coursesCount}
            </p>
            <span className="text-[10px] text-slate-400">collection: courses</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-500">Resources / Links</span>
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <p className="text-lg font-bold text-slate-900 mt-1">
              {dbStats.loading ? '—' : dbStats.resourcesCount}
            </p>
            <span className="text-[10px] text-slate-400">collection: resources</span>
          </div>
        </div>

        {/* Last Backup Notice Strip */}
        <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50/80 px-3 py-1.5 rounded-lg border border-slate-200/60">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>
            Last local export recorded:{' '}
            <strong className="text-slate-700 font-semibold">
              {lastBackupTime ? formatDateTimeToDDMMYYYY(lastBackupTime) : 'No recent backup tracked'}
            </strong>
          </span>
        </div>
      </div>

      {/* Main Two-Column Layout: Export on Left, Smart Restore on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Lossless Export (Backup) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                  <Download className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  1. Lossless Database Backup (.json)
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Queries Firestore collections <code className="text-blue-700 bg-blue-50 px-1 py-0.5 rounded font-mono text-[11px]">users</code>,{' '}
                <code className="text-blue-700 bg-blue-50 px-1 py-0.5 rounded font-mono text-[11px]">notices</code>,{' '}
                <code className="text-blue-700 bg-blue-50 px-1 py-0.5 rounded font-mono text-[11px]">courses</code>, and{' '}
                <code className="text-blue-700 bg-blue-50 px-1 py-0.5 rounded font-mono text-[11px]">resources</code>.
                Converts Firestore Timestamps to ISO strings to preserve exact data types.
              </p>

              <div className="space-y-2.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 mb-5">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-600">Export Format:</span>
                  <span className="font-bold text-slate-900">Standard Unified JSON</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-600">Target Filename:</span>
                  <span className="font-mono text-[11px] text-blue-700 font-semibold">
                    ntechbay_full_backup_DD-MM-YYYY.json
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-600">Type Integrity:</span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> 100% Lossless Timestamps
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="button"
                id="export-full-backup-button"
                onClick={handleExportBackup}
                disabled={isExporting}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-60 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isExporting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Packaging Collections into JSON...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download Full Backup (.json)</span>
                  </>
                )}
              </button>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 text-[11px]">Need to prepare a student list?</span>
                <button
                  type="button"
                  onClick={downloadSampleCSVTemplate}
                  className="text-blue-600 hover:text-blue-800 font-semibold text-[11px] inline-flex items-center gap-1 cursor-pointer underline"
                >
                  <FileSpreadsheet className="w-3 h-3" />
                  <span>Download Sample CSV Template</span>
                </button>
              </div>
            </div>
          </div>

          {/* Guidelines & Safety Specifications Card */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-900 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-amber-950">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Safety & Authentication Protocol</span>
            </div>
            <p className="text-[11px] text-amber-900/90 leading-relaxed">
              <strong>Batch Safety:</strong> Writes are strictly chunked to <strong>400 writes</strong> per commit to never hit Firestore's 500-operation ceiling.
            </p>
            <p className="text-[11px] text-amber-900/90 leading-relaxed">
              <strong>Auth Credentials Notice:</strong> Imported student records without an active Firebase Auth account are flagged with <code className="bg-amber-100 text-amber-950 px-1 py-0.5 rounded font-mono text-[10px]">authProvisioned: false</code>. When these students first log in, the system gracefully directs them to Reset Password to activate their account securely.
            </p>
          </div>
        </div>

        {/* Right Column: Smart Restore & Deduplication Engine */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    2. Smart Restore & Deduplication Engine
                  </h3>
                  <p className="text-[11px] text-slate-500">Supports .json backups and .csv spreadsheets</p>
                </div>
              </div>
            </div>

            {/* Drag and Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
                selectedFile
                  ? 'border-blue-500 bg-blue-50/40'
                  : 'border-slate-300 hover:border-blue-400 bg-slate-50/60 hover:bg-slate-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.csv"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
              />

              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-2.5">
                <Upload className="w-5 h-5" />
              </div>

              {selectedFile ? (
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-900">{selectedFile.name}</p>
                  <p className="text-[11px] text-slate-500">
                    {(selectedFile.size / 1024).toFixed(1)} KB • Click to select a different file
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-800">
                    Drag and drop your .json backup or .csv student file here
                  </p>
                  <p className="text-[11px] text-slate-500">
                    or click to browse from your device
                  </p>
                </div>
              )}
            </div>

            {/* Analyzing Indicator */}
            {isAnalyzing && (
              <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-200 flex items-center justify-center gap-2 text-xs text-blue-800">
                <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                <span>Inspecting file and pre-checking database for duplicate emails & phones...</span>
              </div>
            )}

            {/* Pre-Check Analysis Dashboard */}
            {preCheckResult && !isAnalyzing && (
              <div className="mt-4 space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Pre-check Deduplication Analysis
                    </span>
                    <button
                      type="button"
                      onClick={resetSelectedFile}
                      className="text-[11px] text-slate-500 hover:text-rose-600 font-medium cursor-pointer"
                    >
                      Clear file
                    </button>
                  </div>

                  {/* Pre-check Metrics Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                    <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-2xs">
                      <p className="text-[10px] text-slate-500 font-medium">Total In File</p>
                      <p className="text-base font-bold text-slate-900 mt-0.5">
                        {preCheckResult.totalInFile}
                      </p>
                    </div>

                    <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200 shadow-2xs">
                      <p className="text-[10px] text-emerald-700 font-medium">New Unique</p>
                      <p className="text-base font-bold text-emerald-800 mt-0.5">
                        {preCheckResult.toInsertCount}
                      </p>
                    </div>

                    <div className="p-2 bg-amber-50 rounded-lg border border-amber-200 shadow-2xs">
                      <p className="text-[10px] text-amber-700 font-medium">Duplicates (Skip)</p>
                      <p className="text-base font-bold text-amber-800 mt-0.5">
                        {preCheckResult.skippedDuplicatesCount}
                      </p>
                    </div>

                    <div className="p-2 bg-rose-50 rounded-lg border border-rose-200 shadow-2xs">
                      <p className="text-[10px] text-rose-700 font-medium">Failed / Invalid</p>
                      <p className="text-base font-bold text-rose-800 mt-0.5">
                        {preCheckResult.failedCount}
                      </p>
                    </div>
                  </div>

                  {/* Deduplication Summary description */}
                  <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200/80 leading-relaxed">
                    {preCheckResult.toInsertCount > 0 ? (
                      <span className="text-emerald-800 font-medium">
                        ✓ <strong>{preCheckResult.toInsertCount} unique records</strong> are ready to be safely imported into Firestore.
                      </span>
                    ) : (
                      <span className="text-amber-800 font-medium">
                        ⚠ All records in this file already exist in the database or are duplicates. No new records will be created.
                      </span>
                    )}
                    {preCheckResult.skippedDuplicatesCount > 0 && (
                      <span className="block text-slate-500 mt-0.5">
                        • {preCheckResult.skippedDuplicatesCount} records will be skipped to protect against duplicate emails or mobile numbers.
                      </span>
                    )}
                  </div>

                  {/* Toggle Preview Button */}
                  <button
                    type="button"
                    onClick={() => setShowDetailPreview(!showDetailPreview)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{showDetailPreview ? 'Hide Record Breakdown' : 'Preview Record Breakdown'}</span>
                  </button>

                  {/* Expandable Breakdown Preview */}
                  {showDetailPreview && (
                    <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-lg bg-white divide-y divide-slate-100 text-xs">
                      {preCheckResult.details.slice(0, 30).map((item, idx) => (
                        <div key={idx} className="p-2.5 flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 truncate">
                              {item.identifier}
                            </p>
                            {item.reason && (
                              <p className="text-[10px] text-slate-500 truncate">{item.reason}</p>
                            )}
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                              item.status === 'inserted'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : item.status === 'skipped'
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-rose-100 text-rose-800 border border-rose-300'
                            }`}
                          >
                            {item.status === 'inserted'
                              ? 'To Insert'
                              : item.status === 'skipped'
                              ? 'Duplicate (Skip)'
                              : 'Failed'}
                          </span>
                        </div>
                      ))}
                      {preCheckResult.details.length > 30 && (
                        <div className="p-2 text-center text-[10px] text-slate-400 bg-slate-50">
                          And {preCheckResult.details.length - 30} more records...
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Real-Time Progress Bar when Restoring */}
                {isRestoring && (
                  <div className="p-4 bg-blue-50/90 border border-blue-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-blue-900">
                      <span>Restoring Database...</span>
                      <span>{restoreProgress.percentage}%</span>
                    </div>

                    {/* Progress Bar Track */}
                    <div className="w-full bg-blue-200 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${restoreProgress.percentage}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-blue-700">
                      <span>{restoreProgress.message}</span>
                      <span>
                        {restoreProgress.current} / {restoreProgress.total} records
                      </span>
                    </div>
                  </div>
                )}

                {/* Commit Action Buttons */}
                {!isRestoring && (
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      id="start-smart-restore-button"
                      onClick={handleExecuteRestore}
                      disabled={preCheckResult.toInsertCount === 0}
                      className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>
                        Proceed with Restore ({preCheckResult.toInsertCount} Unique Records)
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={resetSelectedFile}
                      className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Completion Modal with Full Metrics */}
      {completionSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 animate-fadeIn">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Database Restore Complete
                  </h3>
                  <p className="text-xs text-slate-500">Operation finished with full audit metrics</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCompletionSummary(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Metrics Dashboard Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-[10px] uppercase font-bold text-slate-500">Total in File</p>
                <p className="text-xl font-black text-slate-900 mt-0.5">
                  {completionSummary.totalInFile}
                </p>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <p className="text-[10px] uppercase font-bold text-emerald-700">Restored (New)</p>
                <p className="text-xl font-black text-emerald-800 mt-0.5">
                  {completionSummary.successfullyRestored}
                </p>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                <p className="text-[10px] uppercase font-bold text-amber-700">Skipped (Dup)</p>
                <p className="text-xl font-black text-amber-800 mt-0.5">
                  {completionSummary.skippedDuplicates}
                </p>
              </div>

              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
                <p className="text-[10px] uppercase font-bold text-rose-700">Failed</p>
                <p className="text-xl font-black text-rose-800 mt-0.5">
                  {completionSummary.failed}
                </p>
              </div>
            </div>

            {/* Filter Tabs for Results */}
            <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 text-xs">
              <button
                type="button"
                onClick={() => setCompletionDetailFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-semibold cursor-pointer ${
                  completionDetailFilter === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                All ({completionSummary.details.length})
              </button>
              <button
                type="button"
                onClick={() => setCompletionDetailFilter('inserted')}
                className={`px-2.5 py-1 rounded-lg font-semibold cursor-pointer ${
                  completionDetailFilter === 'inserted'
                    ? 'bg-emerald-600 text-white'
                    : 'text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                Restored ({completionSummary.successfullyRestored})
              </button>
              <button
                type="button"
                onClick={() => setCompletionDetailFilter('skipped')}
                className={`px-2.5 py-1 rounded-lg font-semibold cursor-pointer ${
                  completionDetailFilter === 'skipped'
                    ? 'bg-amber-600 text-white'
                    : 'text-amber-700 hover:bg-amber-50'
                }`}
              >
                Skipped ({completionSummary.skippedDuplicates})
              </button>
              {completionSummary.failed > 0 && (
                <button
                  type="button"
                  onClick={() => setCompletionDetailFilter('failed')}
                  className={`px-2.5 py-1 rounded-lg font-semibold cursor-pointer ${
                    completionDetailFilter === 'failed'
                      ? 'bg-rose-600 text-white'
                      : 'text-rose-700 hover:bg-rose-50'
                  }`}
                >
                  Failed ({completionSummary.failed})
                </button>
              )}
            </div>

            {/* Filtered Records Scrollable List */}
            <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl bg-slate-50/50 text-xs">
              {filteredCompletionDetails && filteredCompletionDetails.length > 0 ? (
                filteredCompletionDetails.map((item, i) => (
                  <div key={i} className="p-2.5 flex items-center justify-between gap-2 bg-white">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 truncate">
                        {item.identifier}
                      </p>
                      {item.reason && (
                        <p className="text-[10px] text-slate-500 truncate">{item.reason}</p>
                      )}
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                        item.status === 'inserted'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.status === 'skipped'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {item.status === 'inserted'
                        ? 'Restored'
                        : item.status === 'skipped'
                        ? 'Skipped (Duplicate)'
                        : 'Failed'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-slate-500 text-xs">
                  No records in this category.
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setCompletionSummary(null)}
                className="py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Close Summary
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
