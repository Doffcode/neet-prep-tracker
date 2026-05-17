import type { Chapter, DailyTask, Phase, Tier, Subject } from './types';

export const START_DATE = '2026-05-18';
export const END_DATE = '2026-06-20';
export const EXAM_DATE = '2026-07-20';

export function generateDates(start: string, end: string): string[] {
  const dates: string[] = [];
  const current = new Date(start);
  const endDate = new Date(end);
  while (current <= endDate) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

export function getTodayStr(): string {
  return new Date().toISOString().split('T')[0];
}

export function getDaysRemaining(): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(END_DATE);
  end.setHours(0, 0, 0, 0);
  const diff = end.getTime() - today.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function formatDate(dateStr: string, withDay?: boolean): string {
  const d = new Date(dateStr);
  const day = d.getDate();
  const month = d.toLocaleString('en-US', { month: 'short' });
  return withDay ? `${day} ${month}` : `${day} ${month}`;
}

export function getDayName(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', { weekday: 'short' });
}

export const PHASES: Phase[] = [
  {
    name: 'Phase 1: S-Tier Sweep',
    days: 'May 18 – May 31',
    strategy: 'Complete all S-tier chapters across all three subjects. Biology: genetics, biotech, physiology, ecology first.',
  },
  {
    name: 'Phase 2: Expansion + PYQs',
    days: 'Jun 1 – Jun 10',
    strategy: 'Finish A-tier. 2 Biology chapters + 1 Physics PYQ + 1 Chemistry PYQ + 1 full mock daily.',
  },
  {
    name: 'Phase 3: Final Revision',
    days: 'Jun 11 – Jun 20',
    strategy: 'No new theory. Daily full paper + NCERT Biology + formula sheets + mistake notebook only.',
  },
];

export const DAILY_ROUTINE: DailyTask[] = [
  { id: 'task-1', time: '6:00 – 9:00', subject: 'Biology (Active Recall)', action: 'Read 3 pages → close book → recall aloud → write keywords. Never passive reading.' },
  { id: 'task-2', time: '9:30 – 12:00', subject: 'Physics (Numericals Only)', action: 'PYQs and problem sets. Theory-only Physics does not score.' },
  { id: 'task-3', time: '1:00 – 3:00', subject: 'Chemistry (Rotate Topics)', action: 'Alternate: Organic → Physical → Inorganic across days.' },
  { id: 'task-4', time: '3:30 – 6:30', subject: 'Full Mock / PYQ Paper', action: 'Strict timer. No pauses. Simulates exam stamina.' },
  { id: 'task-5', time: '7:30 – 10:30', subject: 'Paper Analysis + Revision', action: 'Track: silly mistakes, conceptual gaps, memory errors, time traps.' },
];

const createChapters = (names: string[], subject: Subject, tier: Tier): Chapter[] => 
  names.map(name => ({
    id: `${subject}-${tier}-${name.toLowerCase().replace(/\s+/g, '-')}`,
    name,
    subject,
    tier
  }));

export const CHAPTERS: Chapter[] = [
  ...createChapters([
    'Molecular basis of inheritance',
    'Photosynthesis',
    'Respiration',
    'Cell & cell division',
    'Biotechnology',
    'Ecosystem',
    'Biodiversity',
    'Human Physiology',
    'Principles of inheritance',
    'Evolution'
  ], 'Biology', 'S'),

  ...createChapters([
    'GOC',
    'Isomerism',
    'Hydrocarbons',
    'Halogen derivatives',
    'O & N compounds',
    'Mole concept',
    'Chemical Equilibrium',
    'Ionic Equilibrium',
    'Electrochemistry',
    'Chemical Kinetics',
    'Chemical bonding',
    'Coordination compounds',
    'p-block elements',
    'd & f-block elements'
  ], 'Chemistry', 'S'),

  ...createChapters([
    'Current electricity',
    'Capacitors',
    'Electrostatics',
    'Magnetism',
    'Ray optics',
    'Modern physics',
    'Semiconductors',
    'NLM',
    'WEP',
    'Rotation',
    'SHM'
  ], 'Physics', 'S'),

  ...createChapters(['Waves', 'AC', 'EMI', 'Wave optics', 'Kinematics', 'Gravitation', 'Fluids'], 'Physics', 'A'),
  ...createChapters(['Atomic structure', 'Redox', 'Solutions', 'IUPAC', 'Thermochemistry'], 'Chemistry', 'A'),
  ...createChapters(['Morphology', 'Anatomy', 'Plant Diversity', 'Animal Diversity'], 'Biology', 'A'),

  ...createChapters(['EM waves', 'Units & dimensions', 'COM + collision'], 'Physics', 'B'),
  ...createChapters(['Cockroach & frog details', 'Heavy-memory morphology'], 'Biology', 'B'),
];

export const NON_NEGOTIABLES = [
  'Solve (not watch) Physics problems every single day.',
  'Biology NCERT — minimum 3 full revisions in 34 days.',
  'One full 180-question timed paper daily without exception.',
  'Analyze every mock deeply — most score gains come from here.',
  'Do not attempt JEE-level derivations or ultra-hard Physics.'
];

export const ALL_DATES = generateDates(START_DATE, END_DATE);
