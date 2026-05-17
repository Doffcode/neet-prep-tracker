import { useState, useMemo } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import {
  CHAPTERS, DAILY_ROUTINE, PHASES, NON_NEGOTIABLES, ALL_DATES,
  getTodayStr, getDaysRemaining, formatDate, getDayName
} from './data';
import type { AppState, DayLog, MockLog, Tier, Subject } from './types';

const INITIAL_STATE: AppState = {
  dayLogs: [],
  mockLogs: []
};

function getOrCreateLog(dayLogs: DayLog[], date: string): DayLog {
  const existing = dayLogs.find(d => d.date === date);
  if (existing) return existing;
  return { date, completedTasks: [], completedChapters: [], notes: '' };
}

type Tab = 'dashboard' | 'syllabus' | 'tracker' | 'mocks';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [state, setState] = useLocalStorage<AppState>('neet-prep-state-v2', INITIAL_STATE);
  const [selectedDate, setSelectedDate] = useState<string>(getTodayStr());

  const today = getTodayStr();
  const daysRemaining = getDaysRemaining();

  const allCompletedChapters = useMemo(() => {
    const ids = new Set<string>();
    state.dayLogs.forEach(log => log.completedChapters.forEach(id => ids.add(id)));
    return [...ids];
  }, [state.dayLogs]);

  const stats = useMemo(() => {
    const total = CHAPTERS.length;
    const completed = allCompletedChapters.length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    const sTier = CHAPTERS.filter(c => c.tier === 'S');
    const sTierCompleted = sTier.filter(c => allCompletedChapters.includes(c.id)).length;
    const sTierPercent = sTier.length > 0 ? Math.round((sTierCompleted / sTier.length) * 100) : 0;

    return { total, completed, percent, sTierTotal: sTier.length, sTierCompleted, sTierPercent };
  }, [allCompletedChapters]);

  const subjectStats = useMemo(() => {
    const subjects: Record<Subject, { total: number; completed: number; tierBreakdown: Record<Tier, { total: number; completed: number }> }> = {
      Biology:   { total: 0, completed: 0, tierBreakdown: { S: { total: 0, completed: 0 }, A: { total: 0, completed: 0 }, B: { total: 0, completed: 0 } } },
      Chemistry: { total: 0, completed: 0, tierBreakdown: { S: { total: 0, completed: 0 }, A: { total: 0, completed: 0 }, B: { total: 0, completed: 0 } } },
      Physics:   { total: 0, completed: 0, tierBreakdown: { S: { total: 0, completed: 0 }, A: { total: 0, completed: 0 }, B: { total: 0, completed: 0 } } },
    };
    CHAPTERS.forEach(c => {
      subjects[c.subject].total++;
      subjects[c.subject].tierBreakdown[c.tier].total++;
      if (allCompletedChapters.includes(c.id)) {
        subjects[c.subject].completed++;
        subjects[c.subject].tierBreakdown[c.tier].completed++;
      }
    });
    return subjects;
  }, [allCompletedChapters]);

  const getTierWidth = (tier: Tier, subject: Subject) => {
    const breakdown = subjectStats[subject].tierBreakdown[tier];
    if (breakdown.total === 0) return 0;
    return (breakdown.completed / breakdown.total) * 100;
  };

  const getTierTotalWidth = (tier: Tier, subject: Subject) => {
    const breakdown = subjectStats[subject].tierBreakdown[tier];
    const totalAll = subjectStats[subject].total;
    if (totalAll === 0) return 0;
    return (breakdown.total / totalAll) * 100;
  };

  const updateDayLog = (date: string, updater: (log: DayLog) => DayLog) => {
    setState(prev => {
      const exists = prev.dayLogs.some(d => d.date === date);
      const updatedLog = updater(getOrCreateLog(prev.dayLogs, date));
      const newLogs = exists
        ? prev.dayLogs.map(d => d.date === date ? updatedLog : d).filter(d => d.completedTasks.length > 0 || d.completedChapters.length > 0 || d.notes || d.mockScore)
        : [...prev.dayLogs, updatedLog].filter(d => d.completedTasks.length > 0 || d.completedChapters.length > 0 || d.notes || d.mockScore);
      return { ...prev, dayLogs: newLogs };
    });
  };

  const toggleDayTask = (date: string, taskId: string) => {
    updateDayLog(date, log => ({
      ...log,
      completedTasks: log.completedTasks.includes(taskId)
        ? log.completedTasks.filter(t => t !== taskId)
        : [...log.completedTasks, taskId]
    }));
  };

  const toggleDayChapter = (date: string, chapterId: string) => {
    updateDayLog(date, log => ({
      ...log,
      completedChapters: log.completedChapters.includes(chapterId)
        ? log.completedChapters.filter(c => c !== chapterId)
        : [...log.completedChapters, chapterId]
    }));
  };

  const updateDayNotes = (date: string, notes: string) => {
    updateDayLog(date, log => ({ ...log, notes }));
  };

  const toggleChapterGlobal = (id: string) => {
    const date = selectedDate;
    updateDayLog(date, log => ({
      ...log,
      completedChapters: log.completedChapters.includes(id)
        ? log.completedChapters.filter(c => c !== id)
        : [...log.completedChapters, id]
    }));
  };

  const addMockLog = (log: Omit<MockLog, 'id'>) => {
    setState(prev => ({
      ...prev,
      mockLogs: [{ ...log, id: crypto.randomUUID() }, ...prev.mockLogs]
    }));
  };

  const selectedDayLog = getOrCreateLog(state.dayLogs, selectedDate);
  const dayTasksDone = selectedDayLog.completedTasks.length;
  const dayTasksTotal = DAILY_ROUTINE.length;
  const dayChaptersDone = selectedDayLog.completedChapters.length;

  const getDayCompletionStatus = (date: string) => {
    const log = state.dayLogs.find(d => d.date === date);
    if (!log) return 'none';
    const done = (log.completedTasks?.length || 0) + (log.completedChapters?.length || 0);
    if (done === 0) return 'none';
    if (done >= DAILY_ROUTINE.length) return 'full';
    return 'partial';
  };

  const todayIndex = ALL_DATES.findIndex(d => d === today);

  const currentPhase = todayIndex < 14 ? 0 : todayIndex < 24 ? 1 : 2;

  return (
    <div className="container">
      <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', color: 'var(--accent)' }}>NEET Prep Tracker</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Maximize marks per hour. Prioritize high-ROI chapters.</p>
      </header>

      <div className="countdown-banner">
        <div className="countdown-item">
          <span className="countdown-value">{daysRemaining}</span>
          <span className="countdown-label">Days to Jun 20</span>
        </div>
        <span className="countdown-divider">|</span>
        <div className="countdown-item">
          <span className="countdown-value">{stats.percent}%</span>
          <span className="countdown-label">Syllabus Done</span>
        </div>
        <span className="countdown-divider">|</span>
        <div className="countdown-item">
          <span className="countdown-value">{stats.sTierPercent}%</span>
          <span className="countdown-label">S-Tier Done</span>
        </div>
      </div>

      <nav className="nav">
        {(['dashboard', 'syllabus', 'tracker', 'mocks'] as Tab[]).map(tab => (
          <div
            key={tab}
            className={`nav-link ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </div>
        ))}
      </nav>

      {activeTab === 'dashboard' && (
        <section>
          <div className="grid">
            <div className="card">
              <h3>Overall Progress</h3>
              <div className="stats-grid">
                <div className="stat-card">
                  <span className="stat-value">{stats.percent}%</span>
                  <span className="stat-label">Total Completion</span>
                </div>
                <div className="stat-card">
                  <span className="stat-value">{stats.completed}/{stats.total}</span>
                  <span className="stat-label">Chapters Done</span>
                </div>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${stats.percent}%` }} />
              </div>
            </div>

            <div className="card">
              <h3 style={{ color: 'var(--tier-s)' }}>S-Tier Focus</h3>
              <div className="stats-grid">
                <div className="stat-card">
                  <span className="stat-value" style={{ color: 'var(--tier-s)' }}>{stats.sTierPercent}%</span>
                  <span className="stat-label">S-Tier Completion</span>
                </div>
                <div className="stat-card">
                  <span className="stat-value" style={{ color: 'var(--tier-s)' }}>{stats.sTierCompleted}/{stats.sTierTotal}</span>
                  <span className="stat-label">High-ROI Done</span>
                </div>
              </div>
              <div className="progress-bar" style={{ background: 'rgba(168, 85, 247, 0.1)' }}>
                <div className="progress-fill" style={{ width: `${stats.sTierPercent}%`, background: 'var(--tier-s)' }} />
              </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: '2rem' }}>
            <h3>Subject-wise Completion</h3>
            <div className="subject-graph">
              {(['Biology', 'Chemistry', 'Physics'] as Subject[]).map(subject => (
                <div key={subject} className="graph-row">
                  <span className="graph-label">{subject}</span>
                  <div className="graph-bar-container">
                    {(['S', 'A', 'B'] as Tier[]).map(tier => {
                      const tierTotal = subjectStats[subject].tierBreakdown[tier].total;
                      if (tierTotal === 0) return null;
                      const width = getTierTotalWidth(tier, subject);
                      const fill = getTierWidth(tier, subject);
                      return (
                        <div
                          key={tier}
                          className={`graph-bar graph-bar-${tier.toLowerCase()}`}
                          style={{
                            width: `${width}%`,
                            opacity: fill === 0 ? 0.2 : 1,
                          }}
                        />
                      );
                    })}
                  </div>
                  <span className="graph-percent">
                    {subjectStats[subject].total > 0
                      ? Math.round((subjectStats[subject].completed / subjectStats[subject].total) * 100)
                      : 0}%
                  </span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <span><span style={{ color: 'var(--tier-s)', fontWeight: 700 }}>S</span> High-ROI</span>
              <span><span style={{ color: 'var(--tier-a)', fontWeight: 700 }}>A</span> Important</span>
              <span><span style={{ color: 'var(--tier-b)', fontWeight: 700 }}>B</span> Low-Yield</span>
            </div>
          </div>

          <div className="grid">
            <div className="card non-negotiables">
              <h3>Non-Negotiables</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {NON_NEGOTIABLES.map((item, i) => (
                  <li key={i} style={{ marginBottom: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                    <span>&rarr;</span> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="card">
              <h3>Preparation Phases</h3>
              {PHASES.map((phase, i) => (
                <div key={i} style={{ marginBottom: '1.25rem' }}>
                  <h4 style={{ color: currentPhase === i ? 'var(--success)' : 'var(--accent)' }}>
                    {phase.name} {currentPhase === i ? '(Active)' : ''}
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{phase.days}</p>
                  <p style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>{phase.strategy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {activeTab === 'syllabus' && (
        <section>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))' }}>
            {(['Biology', 'Chemistry', 'Physics'] as Subject[]).map(subject => (
              <div key={subject} className="card">
                <h2>{subject}</h2>
                {(['S', 'A', 'B'] as Tier[]).map(tier => {
                  const filtered = CHAPTERS.filter(c => c.subject === subject && c.tier === tier);
                  if (filtered.length === 0) return null;
                  return (
                    <div key={tier} style={{ marginBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span className={`tier-badge tier-${tier.toLowerCase()}`}>{tier}-Tier</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {filtered.filter(c => allCompletedChapters.includes(c.id)).length}/{filtered.length}
                        </span>
                      </div>
                      {filtered.map(chapter => (
                        <label key={chapter.id} className="checkbox-item">
                          <input
                            type="checkbox"
                            checked={allCompletedChapters.includes(chapter.id)}
                            onChange={() => toggleChapterGlobal(chapter.id)}
                          />
                          <span className={allCompletedChapters.includes(chapter.id) ? 'strikethrough' : ''}>
                            {chapter.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'tracker' && (
        <section>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="day-toolbar">
              <span style={{ fontWeight: 700 }}>Date:</span>
              <select
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
              >
                {ALL_DATES.map(date => (
                  <option key={date} value={date}>
                    {formatDate(date)} ({getDayName(date)}){date === today ? ' - Today' : ''}
                  </option>
                ))}
              </select>
              <button
                className="btn btn-sm"
                style={{ background: 'rgba(255,255,255,0.05)', fontSize: '0.8rem' }}
                onClick={() => {
                  updateDayLog(selectedDate, () => ({
                    date: selectedDate,
                    completedTasks: [],
                    completedChapters: [],
                    notes: ''
                  }));
                }}
              >
                Clear Day
              </button>
            </div>
          </div>

          <div className="day-grid">
            {ALL_DATES.map(date => {
              const isToday = date === today;
              const isSelected = date === selectedDate;
              const status = getDayCompletionStatus(date);
              const classes = [
                'day-cell',
                isToday ? 'today' : '',
                isSelected ? 'selected' : '',
                date > today ? 'future' : '',
                status === 'full' ? 'complete' : '',
                status === 'partial' ? 'partial' : ''
              ].filter(Boolean).join(' ');

              return (
                <div
                  key={date}
                  className={classes}
                  onClick={() => { if (date <= today) setSelectedDate(date); }}
                >
                  <span className="day-cell-date">{new Date(date).getDate()}</span>
                  <span className="day-cell-name">{getDayName(date)}</span>
                  {status === 'full' && <span className="day-cell-dot green" />}
                  {status === 'partial' && <span className="day-cell-dot yellow" />}
                </div>
              );
            })}
          </div>

          <div className="day-detail">
            <div className="day-detail-header">
              <h3 style={{ margin: 0 }}>
                {formatDate(selectedDate)} ({getDayName(selectedDate)})
                {selectedDate === today ? ' — Today' : ''}
                {selectedDate > today ? ' (Upcoming)' : ''}
              </h3>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Tasks: {dayTasksDone}/{dayTasksTotal} &middot; Chapters: {dayChaptersDone}
              </span>
            </div>

            <h4 style={{ color: 'var(--accent)', marginBottom: '0.75rem' }}>Daily Routine</h4>
            {DAILY_ROUTINE.map(task => (
              <label key={task.id} className="checkbox-item">
                <input
                  type="checkbox"
                  checked={selectedDayLog.completedTasks.includes(task.id)}
                  onChange={() => toggleDayTask(selectedDate, task.id)}
                />
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--accent)' }}>{task.time} — {task.subject}</div>
                  <div className={selectedDayLog.completedTasks.includes(task.id) ? 'strikethrough' : ''} style={{ fontSize: '0.9rem' }}>
                    {task.action}
                  </div>
                </div>
              </label>
            ))}

            <h4 style={{ color: 'var(--accent)', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Chapters Studied</h4>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {(['Biology', 'Chemistry', 'Physics'] as Subject[]).map(subject => (
                <div key={subject} style={{ marginBottom: '1rem' }}>
                  <h5 style={{ marginBottom: '0.25rem' }}>{subject}</h5>
                  {(['S', 'A', 'B'] as Tier[]).map(tier => {
                    const filtered = CHAPTERS.filter(c => c.subject === subject && c.tier === tier);
                    if (filtered.length === 0) return null;
                    return (
                      <div key={tier} style={{ marginLeft: '0.5rem', marginBottom: '0.5rem' }}>
                        <span className={`tier-badge tier-${tier.toLowerCase()}`} style={{ fontSize: '0.65rem', marginBottom: '0.25rem', display: 'inline-block' }}>
                          {tier}
                        </span>
                        {filtered.map(chapter => (
                          <label key={chapter.id} className="checkbox-item" style={{ padding: '0.35rem 0.5rem', fontSize: '0.85rem' }}>
                            <input
                              type="checkbox"
                              checked={selectedDayLog.completedChapters.includes(chapter.id)}
                              onChange={() => toggleDayChapter(selectedDate, chapter.id)}
                            />
                            <span className={selectedDayLog.completedChapters.includes(chapter.id) ? 'strikethrough' : ''}>
                              {chapter.name}
                            </span>
                          </label>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="input-group note-input">
              <label style={{ fontWeight: 700, marginBottom: '0.25rem' }}>Daily Notes</label>
              <textarea
                rows={3}
                placeholder="What went well? What needs improvement? Key takeaways..."
                value={selectedDayLog.notes || ''}
                onChange={e => updateDayNotes(selectedDate, e.target.value)}
              />
            </div>
          </div>
        </section>
      )}

      {activeTab === 'mocks' && (
        <section className="grid">
          <div className="card">
            <h3>Log Mock Test</h3>
            <form className="mock-form" onSubmit={(e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const formData = new FormData(form);
              addMockLog({
                date: new Date().toLocaleDateString(),
                score: Number(formData.get('score')),
                mistakes: formData.get('mistakes') as string,
              });
              form.reset();
            }}>
              <div className="input-group">
                <label>Score (out of 720)</label>
                <input name="score" type="number" required placeholder="e.g. 550" />
              </div>
              <div className="input-group">
                <label>Key Mistakes / Analysis</label>
                <textarea name="mistakes" rows={4} required placeholder="What went wrong? Conceptual gaps, silly mistakes..." />
              </div>
              <button className="btn btn-primary" type="submit">Save Log</button>
            </form>
          </div>

          <div className="card">
            <h3>Previous Logs</h3>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {state.mockLogs.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No logs yet. Take a mock test today!</p>}
              {state.mockLogs.map(log => (
                <div key={log.id} className="mock-log-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 700 }}>{log.date}</span>
                    <span style={{ color: 'var(--accent)', fontWeight: 800 }}>{log.score}/720</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{log.mistakes}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <footer style={{ marginTop: '4rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
        NEET Prep Tracker &mdash; {daysRemaining} days to Jun 20.
      </footer>
    </div>
  );
}

export default App;
