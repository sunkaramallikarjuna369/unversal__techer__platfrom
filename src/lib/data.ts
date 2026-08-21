import {
  Activity, BarChart3, Brain, Volume2, Users, Sparkles, FileQuestion,
  PenLine, LayoutGrid, BookOpenCheck, MessageSquare, Building2,
  UserCog, CalendarClock, type LucideIcon,
} from 'lucide-react';

export type ViewId =
  | 'dashboard' | 'heatmap' | 'emotion' | 'noise' | 'participation'
  | 'attention' | 'quiz' | 'whiteboard' | 'seating' | 'homework'
  | 'parents' | 'school' | 'teachers' | 'rollover';

export interface NavItem {
  id: ViewId;
  label: string;
  icon: LucideIcon;
  group: 'Live' | 'Analytics' | 'Tools' | 'Community' | 'Administration';
  roles: ('principal' | 'teacher')[];
}

export const NAV: NavItem[] = [
  { id: 'dashboard', label: 'Live Dashboard', icon: LayoutGrid, group: 'Live', roles: ['principal', 'teacher'] },
  { id: 'heatmap', label: 'Engagement Heatmap', icon: Activity, group: 'Live', roles: ['principal', 'teacher'] },
  { id: 'emotion', label: 'Emotion Detection', icon: Brain, group: 'Live', roles: ['principal', 'teacher'] },
  { id: 'noise', label: 'Noise Monitor', icon: Volume2, group: 'Live', roles: ['principal', 'teacher'] },
  { id: 'participation', label: 'Participation', icon: BarChart3, group: 'Analytics', roles: ['principal', 'teacher'] },
  { id: 'attention', label: 'AI Attention', icon: Sparkles, group: 'Analytics', roles: ['principal', 'teacher'] },
  { id: 'homework', label: 'Homework Analytics', icon: BookOpenCheck, group: 'Analytics', roles: ['principal', 'teacher'] },
  { id: 'school', label: 'School Insights', icon: Building2, group: 'Analytics', roles: ['principal', 'teacher'] },
  { id: 'quiz', label: 'Quiz Generator', icon: FileQuestion, group: 'Tools', roles: ['principal', 'teacher'] },
  { id: 'whiteboard', label: 'Whiteboard', icon: PenLine, group: 'Tools', roles: ['principal', 'teacher'] },
  { id: 'seating', label: 'Seating Map', icon: Users, group: 'Tools', roles: ['principal', 'teacher'] },
  { id: 'parents', label: 'Parent Center', icon: MessageSquare, group: 'Community', roles: ['principal', 'teacher'] },
  { id: 'teachers', label: 'Teacher Management', icon: UserCog, group: 'Administration', roles: ['principal'] },
  { id: 'rollover', label: 'Yearly Rollover', icon: CalendarClock, group: 'Administration', roles: ['principal'] },
];
