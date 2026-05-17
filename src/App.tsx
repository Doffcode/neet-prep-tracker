import { useState, useMemo } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { CHAPTERS, DAILY_ROUTINE, PHASES, NON_NEGOTIABLES } from './data';
import type { AppState, MockLog, Tier, Subject } from './types';

const INITIAL_STATE: AppState = {
  completedChapters: [],
  completedDailyTasks: [],
  mockLogs: []
};

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'syllabus' | 'routine' | 'mocks'>('dashboard');
  const [state, setState] = useLocalStorage<AppState>('neet-prep-state', INITIAL_STATE);

  // Statistics
  const stats = useMemo(() => {
    const total = CHAPTERS.length;
    const completed = state.completedChapters.length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    const sTier = CHAPTERS.filter(c => c.tier === 'S');
    const sTierCompleted = sTier.filter(c => state.completedChapters.includes(c.id)).length;
    const sTierPercent = sTier.length > 0 ? Math.round((sTierCompleted / sTier.length) * 100) : 0;

    return { total, completed, percent, sTierTotal: sTier.length, sTierCompleted, sTierPercent };
  }, [state.completedChapters]);

  const toggleChapter = (id: string) => {
    setState(prev => ({
      ...prev,
      completedChapters: prev.completedChapters.includes(id)
        ? prev.completedChapters.filter(c => c !== id)
        : [...prev.completedChapters, id]
    }));
  };

  const toggleDailyTask = (id: string) => {
    setState(prev => ({
      ...prev,
      completedDailyTasks: prev.completedDailyTasks.includes(id)
        ? prev.completedDailyTasks.filter(t => t !== id)
        : [...prev.completedDailyTasks, id]
    }));
  };

  const addMockLog = (log: Omit<MockLog, 'id'>) => {
    setState(prev => ({
      ...prev,
      mockLogs: [
        { ...log, id: crypto.randomUUID() },
        ...prev.mockLogs
      ]
    }));
  };

  return (
    <div className="container">
      <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', color: 'var(--accent)' }}>NEET 34-Day Prep</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Maximize marks per hour. Prioritize high-ROI chapters.</p>
      </header>

      <nav className="nav">
        {(['dashboard', 'syllabus', 'routine', 'mocks'] as const).map(tab => (
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
                <div className="progress-fill" style={{ width: `${stats.percent}%` }}></div>
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
                <div className="progress-fill" style={{ width: `${stats.sTierPercent}%`, background: 'var(--tier-s)' }}></div>
              </div>
            </div>
          </div>

          <div className="grid">
            <div className="card non-negotiables">
              <h3>🛑 Non-Negotiables</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {NON_NEGOTIABLES.map((item, i) => (
                  <li key={i} style={{ marginBottom: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                    <span>→</span> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="card">
              <h3>Preparation Phases</h3>
              {PHASES.map((phase, i) => (
                <div key={i} style={{ marginBottom: '1rem' }}>
                  <h4 style={{ color: 'var(--accent)' }}>{phase.name} ({phase.days})</h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{phase.strategy}</p>
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
                          {filtered.filter(c => state.completedChapters.includes(c.id)).length}/{filtered.length}
                        </span>
                      </div>
                      {filtered.map(chapter => (
                        <label key={chapter.id} className="checkbox-item">
                          <input
                            type="checkbox"
                            checked={state.completedChapters.includes(chapter.id)}
                            onChange={() => toggleChapter(chapter.id)}
                          />
                          <span className={state.completedChapters.includes(chapter.id) ? 'strikethrough' : ''}>
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

      {activeTab === 'routine' && (
        <section className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2>Daily Routine</h2>
            <button 
              className="btn" 
              style={{ background: 'rgba(255, 255, 255, 0.05)', fontSize: '0.8rem' }}
              onClick={() => setState(prev => ({ ...prev, completedDailyTasks: [] }))}
            >
              Reset Daily
            </button>
          </div>
          {DAILY_ROUTINE.map(task => (
            <label key={task.id} className="checkbox-item" style={{ marginBottom: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
              <input
                type="checkbox"
                checked={state.completedDailyTasks.includes(task.id)}
                onChange={() => toggleDailyTask(task.id)}
              />
              <div>
                <div style={{ fontWeight: 700, color: 'var(--accent)' }}>{task.time} — {task.subject}</div>
                <div className={state.completedDailyTasks.includes(task.id) ? 'strikethrough' : ''} style={{ fontSize: '0.9rem' }}>
                  {task.action}
                </div>
              </div>
            </label>
          ))}
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
                <div key={log.id} style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>
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
        NEET 34-Day Prep Tracker — Built for success.
      </footer>
    </div>
  );
}

export default App;
