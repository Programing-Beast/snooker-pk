import { Outlet } from 'react-router-dom';
import TopNav from '../components/ui/TopNav';
import MobileTabBar from '../components/ui/MobileTabBar';

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      <TopNav />
      <main className="flex-1">
        <Outlet />
      </main>
      <MobileTabBar />
    </div>
  );
}
