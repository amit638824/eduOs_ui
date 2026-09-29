import { useEffect, useState } from 'react';
import { examinationService } from '@/services';
import { parseApiError } from '@/lib/errors';
import { EdtpBtn } from '@/components/ui/CrudUI';
import { getOptionText, getQuestionText } from '@/utils/questionContent';

type PreviewOption = {
  id?: string;
  content?: unknown;
  is_correct?: boolean;
  isCorrect?: boolean;
};

type PreviewQuestion = {
  id: string;
  type: string;
  status?: string;
  marks?: number;
  content?: unknown;
  options?: PreviewOption[];
  topic_name?: string | null;
  subject_name?: string | null;
  department_name?: string | null;
};

export function QuestionPreviewModal({
  questionId,
  onClose,
}: {
  questionId: string | null;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [question, setQuestion] = useState<PreviewQuestion | null>(null);

  useEffect(() => {
    if (!questionId) {
      setQuestion(null);
      setError('');
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError('');
    examinationService
      .getQuestion(questionId)
      .then((q) => {
        if (!cancelled) setQuestion(q as PreviewQuestion);
      })
      .catch((err) => {
        if (!cancelled) setError(parseApiError(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [questionId]);

  useEffect(() => {
    if (!questionId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [questionId, onClose]);

  if (!questionId) return null;

  const text = getQuestionText(question?.content);
  const options = question?.options ?? [];

  return (
    <div className="edtp-preview-overlay" role="dialog" aria-modal="true" aria-label="Question preview">
      <button type="button" className="edtp-preview-overlay__backdrop" aria-label="Close preview" onClick={onClose} />
      <div className="edtp-preview-modal">
        <div className="edtp-preview-modal__head">
          <div>
            <p className="edtp-preview-modal__eyebrow">Question preview</p>
            <h5 className="mb-0">
              {question ? (
                <>
                  <span className="edtp-badge edtp-badge--role">{question.type}</span>
                  {question.marks != null ? (
                    <span className="text-muted ms-2" style={{ fontSize: '0.85rem' }}>
                      {question.marks} mark{Number(question.marks) === 1 ? '' : 's'}
                    </span>
                  ) : null}
                </>
              ) : (
                'Loading…'
              )}
            </h5>
          </div>
          <EdtpBtn variant="ghost" onClick={onClose}>
            Close
          </EdtpBtn>
        </div>

        <div className="edtp-preview-modal__body">
          {loading && <p className="text-muted mb-0">Loading question…</p>}
          {error && <p className="login__error mb-0">{error}</p>}
          {!loading && !error && question && (
            <>
              <p className="edtp-preview-modal__stem">{text}</p>
              {(question.department_name || question.subject_name || question.topic_name) && (
                <p className="text-muted" style={{ fontSize: '0.8rem' }}>
                  {[question.department_name, question.subject_name, question.topic_name]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              )}
              {options.length > 0 ? (
                <ul className="edtp-preview-options">
                  {options.map((opt, i) => {
                    const correct = Boolean(opt.is_correct ?? opt.isCorrect);
                    return (
                      <li key={opt.id ?? i} className={correct ? 'is-correct' : undefined}>
                        <span className="edtp-preview-options__letter">
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span>{getOptionText(opt.content)}</span>
                        {correct ? <span className="edtp-preview-options__tag">Correct</span> : null}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-muted mb-0" style={{ fontSize: '0.875rem' }}>
                  No options (open / numerical style answer).
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
