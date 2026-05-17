import type { Chapter, DailyTask, Phase, Tier, Subject } from './types';

export const PHASES: Phase[] = [
  {
    name: 'Phase 1: S-Tier Sweep',
    days: 'Days 1–14',
    strategy: 'Complete all S-tier chapters across all three subjects. Biology: genetics, biotech, physiology, ecology first.',
  },
  {
    name: 'Phase 2: Expansion + PYQs',
    days: 'Days 15–24',
    strategy: 'Finish A-tier. 2 Biology chapters + 1 Physics PYQ + 1 Chemistry PYQ + 1 full mock daily.',
  },
  {
    name: 'Phase 3: Final Revision',
    days: 'Days 25–34',
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
  // Biology S-Tier
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

  // Chemistry S-Tier
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

  // Physics S-Tier
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

  // A-Tier
  ...createChapters(['Waves', 'AC', 'EMI', 'Wave optics', 'Kinematics', 'Gravitation', 'Fluids'], 'Physics', 'A'),
  ...createChapters(['Atomic structure', 'Redox', 'Solutions', 'IUPAC', 'Thermochemistry'], 'Chemistry', 'A'),
  ...createChapters(['Morphology', 'Anatomy', 'Plant Diversity', 'Animal Diversity'], 'Biology', 'A'),

  // B-Tier
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
