'use client';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
export default function AppShell({ children }) {
  const pathname = usePathname();
  const hideNavbarRoutes = [
    '/login'
  ];
  const shouldHideNavbar =
    hideNavbarRoutes.includes(pathname);
  return (
    <>
      {!shouldHideNavbar && <Navbar />}
      {children}
    </>
  );
}