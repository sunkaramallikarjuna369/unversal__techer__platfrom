import { useState } from 'react';
import { AuthProvider, useAuth } from '@/lib/auth';
import { Sidebar, Topbar } from '@/components/Shell';
import { NAV, type ViewId } from '@/lib/data';
import { AuthView } from '@/views/AuthView';
import { DashboardView } from '@/views/DashboardView';
import { HeatmapView } from '@/views/HeatmapView';
import { EmotionView } from '@/views/EmotionView';
import { NoiseView } from '@/views/NoiseView';
import { ParticipationView } from '@/views/ParticipationView';
import { AttentionView } from '@/views/AttentionView';
import { QuizView } from '@/views/QuizView';
import { WhiteboardView } from '@/views/WhiteboardView';
import { SeatingView } from '@/views/SeatingView';
import { HomeworkView } from '@/views/HomeworkView';
import { ParentsView } from '@/views/ParentsView';
import { SchoolView } from '@/views/SchoolView';
import { TeachersView } from '@/views/TeachersView';
import { RolloverView } from '@/views/RolloverView';
import { Loader2 } from 'lucide-react';

const VIEWS: Record<ViewId, () => React.ReactElement> = {
  dashboard: DashboardView,
  heatmap: HeatmapView,
  emotion: EmotionView,
  noise: NoiseView,
  participation: ParticipationView,
  attention: AttentionView,
  quiz: QuizView,
  whiteboard: WhiteboardView,
  seating: SeatingView,
  homework: HomeworkView,
  parents: ParentsView,
  school: SchoolView,
  teachers: TeachersView,
  rollover: RolloverView,
};

function AppInner() {
  const { session, profile, loading } = useAuth();
  const [active, setActive] = useState<ViewId>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-sky-soft">
        <Loader2 className="h-8 w-8 animate-spin text-ink-400" />
      </div>
    );
  }

  if (!session) return <AuthView />;

  const role = profile?.role ?? 'teacher';
  const visibleNav = NAV.filter((n) => n.roles.includes(role));
  const validActive = visibleNav.some((n) => n.id === active) ? active : 'dashboard';
  const View = VIEWS[validActive];
  const title = NAV.find((n) => n.id === validActive)?.label ?? 'Dashboard';

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-soft via-white to-sky-soft">
      <div className="flex">
        <Sidebar active={validActive} onSelect={setActive} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex min-h-screen flex-1 flex-col lg:pl-[260px]">
          <Topbar title={title} onMenu={() => setSidebarOpen(true)} />
          <main className="flex-1 px-5 py-6 lg:px-8">
            <div key={validActive} className="animate-fade-in">
              <View />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}

export default App;
