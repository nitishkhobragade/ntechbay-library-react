import React, { useState, useMemo } from 'react';
import {
  X,
  Download,
  FileSpreadsheet,
  FileText,
  Eye,
  Search,
  Users,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { UserProfile } from '../types';

interface StudentExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: UserProfile[];
}

export const StudentExportModal: React.FC<StudentExportModalProps> = ({
  isOpen,
  onClose,
  students,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'preview' | 'excel' | 'pdf'>('preview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  // Filter only students (strictly excluding admins)
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.phone.includes(searchTerm) ||
        (s.college || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.branch || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [students, searchTerm, statusFilter]);

  const activeCount = students.filter((s) => s.status === 'active').length;
  const suspendedCount = students.filter((s) => s.status === 'suspended').length;

  if (!isOpen) return null;

  // 1. Export as Excel (.xlsx)
  const handleExportExcel = () => {
    setIsExporting(true);
    setExportMessage(null);
    try {
      const recordsToExport = filteredStudents.map((s, index) => ({
        'S.No': index + 1,
        'Student Name': `${s.firstName} ${s.lastName}`.trim(),
        'Email Address': s.email,
        'Mobile Phone': s.phone,
        'Alternative Phone': s.altPhone || '—',
        'Date of Birth (DOB)': s.dob || '—',
        'College / Institute': s.college || '—',
        'Degree / Course': s.course || 'B.Tech',
        'Branch / Stream': s.branch || '—',
        'Account Status': (s.status || 'active').toUpperCase(),
        'Registration Date': s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '—',
      }));

      const worksheet = XLSX.utils.json_to_sheet(recordsToExport);

      // Auto-size columns
      const colWidths = [
        { wch: 6 },  // S.No
        { wch: 22 }, // Student Name
        { wch: 28 }, // Email
        { wch: 14 }, // Phone
        { wch: 14 }, // Alt Phone
        { wch: 14 }, // DOB
        { wch: 30 }, // College
        { wch: 14 }, // Course
        { wch: 14 }, // Branch
        { wch: 12 }, // Status
        { wch: 16 }, // Registration Date
      ];
      worksheet['!cols'] = colWidths;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Students Directory');

      const dateStr = new Date().toISOString().slice(0, 10);
      XLSX.writeFile(workbook, `NTechBay_Students_Export_${dateStr}.xlsx`);
      setExportMessage(`Successfully generated Excel spreadsheet with ${recordsToExport.length} student records.`);
    } catch (err: any) {
      console.error('Excel export error:', err);
      setExportMessage(`Failed to generate Excel file: ${err.message || 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  };

  // 2. Export as PDF (.pdf)
  const handleExportPDF = () => {
    setIsExporting(true);
    setExportMessage(null);
    try {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'pt',
        format: 'a4',
      });

      // Header Banner
      doc.setFillColor(27, 67, 147); // #1b4393
      doc.rect(0, 0, 842, 60, 'F');

      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text('NTechBay-Library — Registered Students Directory', 40, 36);

      doc.setFontSize(9);
      doc.setTextColor(200, 220, 255);
      doc.setFont('helvetica', 'normal');
      doc.text('Master Administrator: Er. Nitish Khobragade (NK) | RGPV Engineering Portal', 40, 50);

      // Meta statistics
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      const generatedDate = new Date().toLocaleString();
      doc.text(`Generated on: ${generatedDate}`, 40, 80);
      doc.text(
        `Total Students Listed: ${filteredStudents.length} (Active: ${activeCount}, Suspended: ${suspendedCount})`,
        450,
        80
      );

      const tableRows = filteredStudents.map((s, index) => [
        String(index + 1),
        `${s.firstName} ${s.lastName}`.trim(),
        s.email,
        s.phone,
        s.college || '—',
        `${s.course || 'B.Tech'} - ${s.branch || 'General'}`,
        s.dob || '—',
        (s.status || 'active').toUpperCase(),
        s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '—',
      ]);

      autoTable(doc, {
        startY: 95,
        head: [
          [
            '#',
            'Student Name',
            'Email',
            'Phone',
            'College / Institute',
            'Course & Branch',
            'DOB',
            'Status',
            'Registered',
          ],
        ],
        body: tableRows,
        theme: 'striped',
        headStyles: {
          fillColor: [27, 67, 147],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 8,
          halign: 'left',
        },
        styles: {
          fontSize: 7.5,
          cellPadding: 4,
          textColor: [40, 40, 40],
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
        columnStyles: {
          0: { cellWidth: 20 },
          1: { cellWidth: 100 },
          2: { cellWidth: 120 },
          3: { cellWidth: 70 },
          4: { cellWidth: 130 },
          5: { cellWidth: 100 },
          6: { cellWidth: 55 },
          7: { cellWidth: 55 },
          8: { cellWidth: 65 },
        },
        didDrawPage: (data) => {
          // Footer page numbering
          const pageStr = `Page ${doc.internal.pages.length - 1}`;
          doc.setFontSize(8);
          doc.setTextColor(140);
          doc.text(
            pageStr,
            data.settings.margin.left,
            doc.internal.pageSize.height - 15
          );
          doc.text(
            'NTechBay Engineering Portal • Confidential Student Records',
            doc.internal.pageSize.width - 260,
            doc.internal.pageSize.height - 15
          );
        },
      });

      const dateStr = new Date().toISOString().slice(0, 10);
      doc.save(`NTechBay_Students_Directory_${dateStr}.pdf`);
      setExportMessage(`Successfully generated PDF directory with ${filteredStudents.length} student records.`);
    } catch (err: any) {
      console.error('PDF export error:', err);
      setExportMessage(`Failed to generate PDF document: ${err.message || 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#1b4393] to-indigo-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-white shrink-0">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">Export Student Data & Directory</h3>
              <p className="text-xs text-blue-100">
                Preview, download as Excel (.xlsx), or generate a formal PDF report (Students only)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3 Main Action Option Tabs */}
        <div className="bg-slate-100 px-4 pt-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveSubTab('preview')}
              className={`px-3.5 py-2 rounded-t-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeSubTab === 'preview'
                  ? 'bg-white text-blue-700 shadow-xs border-t-2 border-blue-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>1. Table Preview ({filteredStudents.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('excel')}
              className={`px-3.5 py-2 rounded-t-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeSubTab === 'excel'
                  ? 'bg-white text-emerald-700 shadow-xs border-t-2 border-emerald-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>2. Excel Download (.xlsx)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('pdf')}
              className={`px-3.5 py-2 rounded-t-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeSubTab === 'pdf'
                  ? 'bg-white text-rose-700 shadow-xs border-t-2 border-rose-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-rose-600" />
              <span>3. PDF Download (.pdf)</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-500 pb-2">
            <span className="font-bold text-slate-800">{students.length}</span> Total Students
          </div>
        </div>

        {/* Filter bar for Preview & Export */}
        <div className="p-3 sm:px-5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, phone, college, branch..."
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-700 font-medium"
            >
              <option value="all">All Statuses ({students.length})</option>
              <option value="active">Active Only ({activeCount})</option>
              <option value="suspended">Suspended Only ({suspendedCount})</option>
            </select>
          </div>
        </div>

        {/* Export Notification Message */}
        {exportMessage && (
          <div className="mx-4 mt-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{exportMessage}</span>
          </div>
        )}

        {/* Content Body Based on Sub Tab */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {/* TAB 1: TABLE PREVIEW */}
          {activeSubTab === 'preview' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  Showing {filteredStudents.length} student records ready for export. Admins are strictly excluded.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleExportExcel}
                    disabled={isExporting || filteredStudents.length === 0}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Quick Excel</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleExportPDF}
                    disabled={isExporting || filteredStudents.length === 0}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Quick PDF</span>
                  </button>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-2xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-100 text-slate-600 text-[11px] font-bold uppercase border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Student</th>
                      <th className="py-2.5 px-3">Contact</th>
                      <th className="py-2.5 px-3">College / Institute</th>
                      <th className="py-2.5 px-3">Course & Branch</th>
                      <th className="py-2.5 px-3">DOB</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-slate-400">
                          No student records found matching the filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((s, idx) => (
                        <tr key={s.uid || idx} className="hover:bg-slate-50 transition-colors">
                          <td className="py-2 px-3 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                          <td className="py-2 px-3 font-semibold text-slate-900">
                            <div>{s.firstName} {s.lastName}</div>
                            <div className="text-[10px] text-slate-500 font-normal">{s.email}</div>
                          </td>
                          <td className="py-2 px-3">
                            <div className="font-mono">{s.phone}</div>
                            {s.altPhone && <div className="text-[10px] text-slate-400">Alt: {s.altPhone}</div>}
                          </td>
                          <td className="py-2 px-3 text-slate-600 truncate max-w-[140px]">{s.college || '—'}</td>
                          <td className="py-2 px-3">
                            <span className="font-medium text-slate-900">{s.course || 'B.Tech'}</span>
                            {s.branch && <span className="text-[11px] text-slate-500"> • {s.branch}</span>}
                          </td>
                          <td className="py-2 px-3 text-slate-600 font-mono text-[11px]">{s.dob || '—'}</td>
                          <td className="py-2 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                                s.status === 'active'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {s.status || 'active'}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-slate-500 text-[11px]">
                            {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '—'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: EXCEL DOWNLOAD */}
          {activeSubTab === 'excel' && (
            <div className="max-w-lg mx-auto py-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
                <FileSpreadsheet className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">Microsoft Excel Export (.xlsx)</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Export complete student database with full columns: Name, Email, Primary Phone, Alt Phone, DOB, College, Degree, Branch, and Status.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 flex items-center justify-between">
                <span>Total records to export:</span>
                <span className="font-bold text-emerald-700">{filteredStudents.length} Students</span>
              </div>

              <button
                type="button"
                onClick={handleExportExcel}
                disabled={isExporting || filteredStudents.length === 0}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md transition-transform active:scale-98"
              >
                <Download className="w-4 h-4" />
                <span>{isExporting ? 'Generating Spreadsheet...' : 'Download Excel File (.xlsx)'}</span>
              </button>
            </div>
          )}

          {/* TAB 3: PDF DOWNLOAD */}
          {activeSubTab === 'pdf' && (
            <div className="max-w-lg mx-auto py-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto shadow-xs">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">Official PDF Directory Report (.pdf)</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Generates an executive, landscape-formatted PDF document with official NTechBay header, generation timestamp, student counts, and striped table.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 flex items-center justify-between">
                <span>Total records to export:</span>
                <span className="font-bold text-rose-700">{filteredStudents.length} Students</span>
              </div>

              <button
                type="button"
                onClick={handleExportPDF}
                disabled={isExporting || filteredStudents.length === 0}
                className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md transition-transform active:scale-98"
              >
                <Download className="w-4 h-4" />
                <span>{isExporting ? 'Generating PDF Document...' : 'Download PDF Report (.pdf)'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:px-5 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>NTechBay • Er. Nitish Khobragade</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
