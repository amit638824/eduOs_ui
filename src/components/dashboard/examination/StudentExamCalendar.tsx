import { useCallback, useEffect, useMemo, useState } from 'react';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

import type { EventClickArg, EventInput } from '@fullcalendar/core';

import { examinationService } from '@/services';
import type { ExamTest } from '@/types/examination';
import { parseApiError } from '@/lib/errors';

function getScheduledStart(test: ExamTest): string | null {
  return (
    test.effective_scheduled_start ??
    test.scheduled_start ??
    test.scheduled_at ??
    null
  );
}

function getScheduledEnd(test: ExamTest, start: string): string {
  if (test.scheduled_end) {
    return test.scheduled_end;
  }

  const startTime = new Date(start).getTime();

  const durationMinutes = Math.max(
    1,
    Number(test.duration_minutes || 1),
  );

  const endTime =
    startTime + durationMinutes * 60 * 1000;

  return new Date(endTime).toISOString();
}

function formatDateTime(value: string | null): string {
  if (!value) {
    return 'Not scheduled';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Invalid date';
  }

  return date.toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default function StudentExamCalendar() {
  const [tests, setTests] = useState<ExamTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTest, setSelectedTest] =
    useState<ExamTest | null>(null);

  const loadCalendar = useCallback(async () => {
    try {
      setError('');

      const assignedTests =
        await examinationService.listMyAssignedTests();

      setTests(Array.isArray(assignedTests) ? assignedTests : []);
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCalendar();

    /*
     * Refresh every 15 seconds.
     *
     * This means if a teacher schedules/assigns an exam
     * to this student, the calendar can update without
     * manually refreshing the browser.
     */
    const intervalId = window.setInterval(() => {
      void loadCalendar();
    }, 15000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [loadCalendar]);

  const events = useMemo<EventInput[]>(() => {
    const calendarEvents: EventInput[] = [];

    for (const test of tests) {
      const start = getScheduledStart(test);

      if (!start) {
        continue;
      }

      const end = getScheduledEnd(test, start);

      calendarEvents.push({
        id: String(test.id),
        title: test.title || 'Scheduled Exam',
        start,
        end,
        allDay: false,

        extendedProps: {
          test,
        },
      });
    }

    return calendarEvents;
  }, [tests]);

  const handleEventClick = (
    info: EventClickArg,
  ): void => {
    const test = info.event.extendedProps?.test as
      | ExamTest
      | undefined;

    if (!test) {
      return;
    }

    setSelectedTest(test);
  };

  const closeDetails = (): void => {
    setSelectedTest(null);
  };

  const selectedStart = selectedTest
    ? getScheduledStart(selectedTest)
    : null;

  return (
    <div className="dashboard__content__wraper">
      {/* Page heading */}
      <div className="dashboard__section__title">
        <h4>My Exam Calendar</h4>

        <p>
          Scheduled exams assigned to your student account
          appear here automatically.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div
          className="login__error"
          style={{ marginBottom: 16 }}
        >
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="dashboard__content__wraper">
          <p>Loading calendar...</p>
        </div>
      ) : (
        <div className="student-exam-calendar">
          <FullCalendar
            plugins={[
              dayGridPlugin,
              timeGridPlugin,
              interactionPlugin,
            ]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right:
                'dayGridMonth,timeGridWeek,timeGridDay',
            }}
            height="auto"
            events={events}
            eventClick={handleEventClick}
            nowIndicator
            editable={false}
            selectable={false}
            dayMaxEvents
            eventTimeFormat={{
              hour: 'numeric',
              minute: '2-digit',
              meridiem: 'short',
            }}
          />
        </div>
      )}

      {/* Exam details modal */}
      {selectedTest && (
        <div
          className="student-calendar-modal-backdrop"
          role="presentation"
          onClick={closeDetails}
        >
          <div
            className="student-calendar-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="student-calendar-modal-title"
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            {/* Modal header */}
            <div className="student-calendar-modal__header">
              <div>
                <span className="student-calendar-modal__label">
                  Scheduled Exam
                </span>

                <h4 id="student-calendar-modal-title">
                  {selectedTest.title}
                </h4>
              </div>

              <button
                type="button"
                className="student-calendar-modal__close"
                onClick={closeDetails}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* Modal body */}
            <div className="student-calendar-modal__body">
              {/* Date */}
              {selectedStart && (
                <div className="student-calendar-detail">
                  <span>Date</span>

                  <strong>
                    {new Date(
                      selectedStart,
                    ).toLocaleDateString([], {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </strong>
                </div>
              )}

              {/* Start time */}
              {selectedStart && (
                <div className="student-calendar-detail">
                  <span>Start Time</span>

                  <strong>
                    {new Date(
                      selectedStart,
                    ).toLocaleTimeString([], {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </strong>
                </div>
              )}

              {/* End time */}
              {selectedStart && (
                <div className="student-calendar-detail">
                  <span>End Time</span>

                  <strong>
                    {formatDateTime(
                      getScheduledEnd(
                        selectedTest,
                        selectedStart,
                      ),
                    )}
                  </strong>
                </div>
              )}

              {/* Duration */}
              <div className="student-calendar-detail">
                <span>Duration</span>

                <strong>
                  {selectedTest.duration_minutes} minutes
                </strong>
              </div>

              {/* Passing marks */}
              {selectedTest.passing_marks !== null &&
                selectedTest.passing_marks !== undefined && (
                  <div className="student-calendar-detail">
                    <span>Passing Marks</span>

                    <strong>
                      {selectedTest.passing_marks}
                    </strong>
                  </div>
                )}

              {/* Total marks */}
              {selectedTest.total_marks !== null &&
                selectedTest.total_marks !== undefined && (
                  <div className="student-calendar-detail">
                    <span>Total Marks</span>

                    <strong>
                      {selectedTest.total_marks}
                    </strong>
                  </div>
                )}

              {/* Status */}
              <div className="student-calendar-detail">
                <span>Status</span>

                <strong>
                  {selectedTest.status}
                </strong>
              </div>

              {/* Description */}
              {selectedTest.description && (
                <div className="student-calendar-description">
                  <span>Description</span>

                  <p>{selectedTest.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}