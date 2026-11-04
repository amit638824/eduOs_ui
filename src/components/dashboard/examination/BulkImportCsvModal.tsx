import { useState, useEffect, useRef } from 'react';
import { examinationService } from '@/services';
import type { QuestionImportSummary } from '@/services/examination.service';
import { parseApiError } from '@/lib/errors';
import {
  FiUpload,
  FiDownload,
  FiX,
  FiCheckCircle,
  FiAlertCircle,
  FiFileText,
  FiLayers,
} from 'react-icons/fi';

interface DepartmentOption {
  id: string;
  name: string;
}

interface SubjectOption {
  id: string;
  name: string;
}

interface TopicOption {
  id: string;
  name: string;
}

interface BulkImportCsvModalProps {
  isOpen: boolean;
  onClose: () => void;
  departments: DepartmentOption[];
  onImportSuccess: (summary: QuestionImportSummary) => void;
}

/**
 * Standard CSV parser supporting quotes, commas, and multiline cells.
 */
function parseCsv(text: string): string[][] {
  const cleanText = text.replace(/^\uFEFF/, ''); // strip BOM
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let insideQuotes = false;

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentField += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentField.trim());
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentField.trim());
      if (currentRow.some((f) => f.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((f) => f.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

function formatCsvField(val: string | number | undefined | null): string {
  if (val == null) return '';
  const s = String(val).trim();
  if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function formatCsvRow(fields: (string | number | undefined | null)[]): string {
  return fields.map(formatCsvField).join(',');
}

export function BulkImportCsvModal({
  isOpen,
  onClose,
  departments,
  onImportSuccess,
}: BulkImportCsvModalProps) {
  // Always start with clean/unselected state
  const [departmentId, setDepartmentId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [topicId, setTopicId] = useState('');

  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [topics, setTopics] = useState<TopicOption[]>([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [topicsLoading, setTopicsLoading] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileRawText, setFileRawText] = useState<string>('');
  const [detectedRowCount, setDetectedRowCount] = useState<number>(0);
  const [parsingError, setParsingError] = useState<string>('');
  const [isImporting, setIsImporting] = useState(false);
  const [apiError, setApiError] = useState<string>('');
  const [importSummary, setImportSummary] = useState<QuestionImportSummary | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setDepartmentId('');
    setSubjectId('');
    setTopicId('');
    setSubjects([]);
    setTopics([]);
    setSelectedFile(null);
    setFileRawText('');
    setDetectedRowCount(0);
    setParsingError('');
    setApiError('');
    setImportSummary(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Reset form to blank slate whenever modal is opened or closed
  useEffect(() => {
    resetForm();
  }, [isOpen]);

  const handleClose = () => {
    if (isImporting) return;
    resetForm();
    onClose();
  };

  // Load subjects when department changes
  useEffect(() => {
    if (!departmentId) {
      setSubjects([]);
      setSubjectId('');
      setTopics([]);
      setTopicId('');
      return;
    }
    let cancelled = false;
    setSubjectsLoading(true);
    examinationService
      .listSubjects(1, 100, departmentId)
      .then((res) => {
        if (cancelled) return;
        const list = res.data.map((s) => ({ id: s.id, name: s.name }));
        setSubjects(list);
        setSubjectId('');
        setTopics([]);
        setTopicId('');
      })
      .catch(() => {
        if (!cancelled) setSubjects([]);
      })
      .finally(() => {
        if (!cancelled) setSubjectsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [departmentId]);

  // Load topics when subject changes
  useEffect(() => {
    if (!subjectId) {
      setTopics([]);
      setTopicId('');
      return;
    }
    let cancelled = false;
    setTopicsLoading(true);
    examinationService
      .listTopicsForSubject(subjectId)
      .then((list) => {
        if (cancelled) return;
        const mapped = list.map((t) => ({ id: t.id, name: t.name }));
        setTopics(mapped);
        setTopicId('');
      })
      .catch(() => {
        if (!cancelled) setTopics([]);
      })
      .finally(() => {
        if (!cancelled) setTopicsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [subjectId]);

  // Handle ESC key to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isImporting) handleClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, isImporting]);

  // Process chosen file
  const handleFileSelect = async (file: File | undefined) => {
    if (!file) return;
    setParsingError('');
    setApiError('');
    setImportSummary(null);

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setParsingError('Please select a valid CSV (.csv) file.');
      return;
    }

    if (file.size > 2_000_000) {
      setParsingError('File is too large. Maximum size is 2 MB (~500 questions).');
      return;
    }

    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      if (bytes[0] === 0x50 && bytes[1] === 0x4b) {
        setParsingError('This is an Excel workbook (.xlsx). Please Save As CSV in Excel first.');
        return;
      }
      const encoding =
        bytes[0] === 0xff && bytes[1] === 0xfe
          ? 'utf-16le'
          : bytes[0] === 0xfe && bytes[1] === 0xff
            ? 'utf-16be'
            : 'utf-8';
      const text = new TextDecoder(encoding).decode(bytes);

      const parsed = parseCsv(text);
      if (parsed.length < 2) {
        setParsingError('The CSV file appears to be empty or contains only headers.');
        return;
      }

      setSelectedFile(file);
      setFileRawText(text);
      setDetectedRowCount(parsed.length - 1);
    } catch {
      setParsingError('Could not read file. Ensure it is a valid CSV format.');
    }
  };

  const selectedDeptName = departments.find((d) => d.id === departmentId)?.name || '';
  const selectedSubjName = subjects.find((s) => s.id === subjectId)?.name || '';
  const selectedTopicName = topics.find((t) => t.id === topicId)?.name || '';

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!departmentId || !subjectId || !topicId) {
      setApiError('Please select Department, Subject, and Topic.');
      return;
    }
    if (!selectedFile || !fileRawText) {
      setApiError('Please select a CSV file to upload.');
      return;
    }

    const rows = parseCsv(fileRawText);
    if (rows.length < 2) {
      setApiError('CSV file has no question data rows.');
      return;
    }

    const rawHeaders = rows[0].map((h) => h.toLowerCase().trim().replace(/[\s_-]+/g, ''));

    // Helper to find column index matching variations
    const findCol = (...keys: string[]) => {
      return rawHeaders.findIndex((h) => keys.includes(h));
    };

    const qIdx = findCol('question', 'stem', 'questiontext', 'prompt', 'title');
    const typeIdx = findCol('type', 'questiontype');
    const optAIdx = findCol('optiona', 'option1', 'opta', 'opt1', 'choicea', 'choice1', 'a');
    const optBIdx = findCol('optionb', 'option2', 'optb', 'opt2', 'choiceb', 'choice2', 'b');
    const optCIdx = findCol('optionc', 'option3', 'optc', 'opt3', 'choicec', 'choice3', 'c');
    const optDIdx = findCol('optiond', 'option4', 'optd', 'opt4', 'choiced', 'choice4', 'd');
    const optEIdx = findCol('optione', 'option5', 'opte', 'opt5', 'choicee', 'choice5', 'e');
    const ansIdx = findCol('correctanswer', 'answer', 'correct', 'correctoption', 'ans');
    const marksIdx = findCol('marks', 'mark', 'score');
    const negMarksIdx = findCol('negativemarks', 'negmarks', 'negativemarking');
    const diffIdx = findCol('difficulty', 'diff');
    const expIdx = findCol('explanation', 'explain', 'solution', 'hint');

    if (qIdx === -1) {
      setApiError('CSV must contain a "QUESTION" column header.');
      return;
    }

    // Build standard template CSV with enriched Hierarchy
    const headerRow = [
      'DEPARTMENT',
      'SUBJECT',
      'CHAPTER',
      'TOPIC',
      'TYPE',
      'QUESTION',
      'OPTION_A',
      'OPTION_B',
      'OPTION_C',
      'OPTION_D',
      'OPTION_E',
      'CORRECT_ANSWER',
      'MARKS',
      'NEGATIVE_MARKS',
      'DIFFICULTY',
      'EXPLANATION',
      'LANGUAGE',
      'TAGS',
    ];

    const enrichedRows: string[] = [formatCsvRow(headerRow)];

    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      if (!r || r.length === 0 || r.every((f) => !f.trim())) continue;

      const questionText = r[qIdx] || '';
      if (!questionText.trim()) continue;

      let type = typeIdx !== -1 && r[typeIdx] ? r[typeIdx].toLowerCase().trim() : 'mcq';
      if (!['mcq', 'msq', 'true_false', 'fill_blank', 'numerical', 'integer'].includes(type)) {
        type = 'mcq';
      }

      const optA = optAIdx !== -1 ? r[optAIdx] || '' : '';
      const optB = optBIdx !== -1 ? r[optBIdx] || '' : '';
      const optC = optCIdx !== -1 ? r[optCIdx] || '' : '';
      const optD = optDIdx !== -1 ? r[optDIdx] || '' : '';
      const optE = optEIdx !== -1 ? r[optEIdx] || '' : '';

      let rawAns = ansIdx !== -1 ? (r[ansIdx] || '').trim() : 'A';
      // Normalize answer: 1 -> A, 2 -> B, 3 -> C, 4 -> D, 5 -> E
      const numMatch = rawAns.match(/^[1-5]$/);
      if (numMatch) {
        const charMap = ['A', 'B', 'C', 'D', 'E'];
        rawAns = charMap[parseInt(numMatch[0], 10) - 1];
      }

      const marks = marksIdx !== -1 && r[marksIdx] ? r[marksIdx].trim() : '1';
      const negMarks = negMarksIdx !== -1 && r[negMarksIdx] ? r[negMarksIdx].trim() : '0';
      const difficulty = diffIdx !== -1 && r[diffIdx] ? r[diffIdx].trim() : '2';
      const explanation = expIdx !== -1 ? r[expIdx] || '' : '';

      const fullRow = [
        selectedDeptName,
        selectedSubjName,
        selectedTopicName, // CHAPTER
        selectedTopicName, // TOPIC
        type,
        questionText,
        optA,
        optB,
        optC,
        optD,
        optE,
        rawAns,
        marks,
        negMarks,
        difficulty,
        explanation,
        'en',
        '',
      ];

      enrichedRows.push(formatCsvRow(fullRow));
    }

    const finalCsv = enrichedRows.join('\r\n');

    setIsImporting(true);
    setApiError('');
    try {
      const summary = await examinationService.importQuestionsFromCsv(finalCsv);
      setImportSummary(summary);
      onImportSuccess(summary);
      if (summary.errors === 0) {
        // Auto close and reset after 1.2s on complete success
        setTimeout(() => {
          handleClose();
        }, 1200);
      }
    } catch (err) {
      setApiError(parseApiError(err));
    } finally {
      setIsImporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="edtp-preview-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bulkImportTitle"
      style={{ zIndex: 1200, padding: 16 }}
    >
      <button
        type="button"
        className="edtp-preview-overlay__backdrop"
        onClick={handleClose}
        aria-label="Close dialog"
      />

      <div
        className="edtp-preview-modal"
        style={{
          width: 'min(620px, 96vw)',
          maxHeight: '90vh',
          padding: 0,
          borderRadius: 16,
          boxShadow: '0 24px 60px rgba(15, 23, 42, 0.28)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          background: '#ffffff',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#f8fafc',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #1e293b 0%, #2563eb 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
              }}
            >
              <FiUpload />
            </div>
            <div>
              <h3
                id="bulkImportTitle"
                style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: '#0f172a' }}
              >
                Bulk Import Questions
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.8125rem', color: '#64748b' }}>
                Select target hierarchy, then upload CSV questions into that topic
              </p>
            </div>
          </div>
          <button
            type="button"
            className="org-drawer-close"
            style={{ position: 'static' }}
            onClick={handleClose}
            disabled={isImporting}
            aria-label="Close dialog"
          >
            <FiX />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleImportSubmit}
          style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}
        >
          <div
            style={{
              padding: '20px 24px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
            }}
          >
            {/* Success summary if completed */}
            {importSummary && (
              <div
                style={{
                  padding: '14px 16px',
                  borderRadius: 10,
                  background: importSummary.errors > 0 ? '#fffbeb' : '#ecfdf5',
                  border: `1px solid ${importSummary.errors > 0 ? '#fde68a' : '#a7f3d0'}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: '0.9rem' }}>
                  {importSummary.errors > 0 ? (
                    <FiAlertCircle style={{ color: '#d97706', fontSize: 18 }} />
                  ) : (
                    <FiCheckCircle style={{ color: '#059669', fontSize: 18 }} />
                  )}
                  <span style={{ color: importSummary.errors > 0 ? '#92400e' : '#065f46' }}>
                    {importSummary.created} questions created successfully!
                    {importSummary.skipped > 0 && ` (${importSummary.skipped} duplicates skipped)`}
                    {importSummary.errors > 0 && ` (${importSummary.errors} errors)`}
                  </span>
                </div>
                {importSummary.errors > 0 && importSummary.rows.some((r) => r.status === 'error') && (
                  <ul style={{ margin: '8px 0 0 20px', padding: 0, fontSize: '0.8rem', color: '#b45309' }}>
                    {importSummary.rows
                      .filter((r) => r.status === 'error')
                      .slice(0, 4)
                      .map((r, i) => (
                        <li key={i}>
                          Row {r.row}: {r.reason || 'Invalid format'}
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            )}

            {/* Error Banner */}
            {(apiError || parsingError) && (
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: 8,
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#b91c1c',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <FiAlertCircle style={{ flexShrink: 0 }} />
                <span>{apiError || parsingError}</span>
              </div>
            )}

            {/* 1. Target Scope Hierarchy */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                padding: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <FiLayers style={{ color: '#2563eb', fontSize: 16 }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>
                  1. Target Hierarchy Scope
                </span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  (Every question in CSV will be imported here)
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                {/* Department */}
                <div>
                  <label className="org-form-hint" style={{ fontWeight: 600, color: '#334155' }}>
                    Department *
                  </label>
                  <select
                    className="org-form-input"
                    value={departmentId}
                    onChange={(e) => {
                      setDepartmentId(e.target.value);
                      setSubjectId('');
                      setTopicId('');
                    }}
                    required
                    style={{ height: 38, fontSize: '0.85rem' }}
                  >
                    <option value="">Select department</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subject */}
                <div>
                  <label className="org-form-hint" style={{ fontWeight: 600, color: '#334155' }}>
                    Subject *
                  </label>
                  <select
                    className="org-form-input"
                    value={subjectId}
                    onChange={(e) => {
                      setSubjectId(e.target.value);
                      setTopicId('');
                    }}
                    disabled={!departmentId || subjectsLoading}
                    required
                    style={{ height: 38, fontSize: '0.85rem' }}
                  >
                    <option value="">
                      {subjectsLoading ? 'Loading subjects…' : 'Select subject'}
                    </option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Topic */}
                <div>
                  <label className="org-form-hint" style={{ fontWeight: 600, color: '#334155' }}>
                    Topic *
                  </label>
                  <select
                    className="org-form-input"
                    value={topicId}
                    onChange={(e) => setTopicId(e.target.value)}
                    disabled={!subjectId || topicsLoading}
                    required
                    style={{ height: 38, fontSize: '0.85rem' }}
                  >
                    <option value="">
                      {topicsLoading ? 'Loading topics…' : 'Select topic'}
                    </option>
                    {topics.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 2. Choose CSV File */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                padding: '16px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 10,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FiFileText style={{ color: '#2563eb', fontSize: 16 }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>
                    2. Upload CSV File
                  </span>
                </div>
                <a
                  href="/templates/simple-question-import.csv"
                  download="simple-question-bank-template.csv"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: '0.8125rem',
                    color: '#2563eb',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                  title="Download clean CSV template with Question, Options, and Answers"
                >
                  <FiDownload /> Download Simple Template (.csv)
                </a>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                style={{ display: 'none' }}
                onChange={(e) => void handleFileSelect(e.target.files?.[0])}
              />

              {/* Upload Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '2px dashed #cbd5e1',
                  borderRadius: 10,
                  padding: '24px 16px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: selectedFile ? '#f0fdf4' : '#f8fafc',
                  borderColor: selectedFile ? '#86efac' : '#cbd5e1',
                  transition: 'all 0.2s ease',
                }}
              >
                {selectedFile ? (
                  <div>
                    <FiCheckCircle style={{ color: '#16a34a', fontSize: 28, marginBottom: 6 }} />
                    <div style={{ fontWeight: 700, color: '#15803d', fontSize: '0.92rem' }}>
                      {selectedFile.name}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#166534', marginTop: 4 }}>
                      {(selectedFile.size / 1024).toFixed(1)} KB ·{' '}
                      <strong>{detectedRowCount} questions detected</strong>
                    </div>
                    <button
                      type="button"
                      className="org-pill"
                      style={{ marginTop: 8, cursor: 'pointer', fontSize: '0.75rem' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                    >
                      Change File
                    </button>
                  </div>
                ) : (
                  <div>
                    <FiUpload style={{ color: '#64748b', fontSize: 28, marginBottom: 6 }} />
                    <div style={{ fontWeight: 600, color: '#334155', fontSize: '0.875rem' }}>
                      Click to choose CSV file from your computer
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 4 }}>
                      Columns supported: Question, Option A, Option B, Option C, Option D, Correct Answer, Marks
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            className="org-drawer-footer"
            style={{
              padding: '14px 24px',
              borderTop: '1px solid #e2e8f0',
              background: '#f8fafc',
            }}
          >
            <button
              type="button"
              className="org-drawer-cancel"
              onClick={handleClose}
              disabled={isImporting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="org-drawer-submit"
              disabled={!departmentId || !subjectId || !topicId || !selectedFile || isImporting}
            >
              {isImporting
                ? 'Importing Questions…'
                : detectedRowCount > 0
                  ? `Upload & Import (${detectedRowCount} Questions)`
                  : 'Upload & Import Questions'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
