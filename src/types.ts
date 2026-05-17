export type Tier = 'S' | 'A' | 'B';
export type Subject = 'Biology' | 'Chemistry' | 'Physics';

export interface Chapter {
  id: string;
  name: string;
  subject: Subject;
  tier: Tier;
}

export interface DailyTask {
  id: string;
  time: string;
  subject: string;
  action: string;
}

export interface Phase {
  name: string;
  days: string;
  strategy: string;
}

export interface MockLog {
  id: string;
  date: string;
  score: number;
  mistakes: string;
}

export interface DayLog {
  date: string;
  completedTasks: string[];
  completedChapters: string[];
  mockScore?: number;
  notes: string;
}

export interface AppState {
  dayLogs: DayLog[];
  mockLogs: MockLog[];
}
