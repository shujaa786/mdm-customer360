import './globals.css';
import AppShell from '../components/AppShell';
import { AuthProvider } from '@/context/AuthContext';

export const metadata = {
  title: 'MDM Customer 360 - Reltio Inspired',
  description: 'Master Data Management Demo',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 font-sans">
        <AuthProvider>
          <AppShell>
            {children}
          </AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}