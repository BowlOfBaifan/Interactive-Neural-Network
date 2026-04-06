import { Outlet } from 'react-router-dom';
import TabNav from './TabNav';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <TabNav />
      <main className="flex-1 p-8 max-w-[1200px] w-full mx-auto">
        <Outlet />
      </main>
    </div>
  );
}