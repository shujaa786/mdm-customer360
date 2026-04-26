import './globals.css';
import Navbar from '../components/Navbar';

export const metadata = {
  title: 'MDM Customer 360 - Reltio Inspired',
  description: 'Master Data Management Demo',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 font-sans">
        <Navbar />
        {children}
      </body>
    </html>
  );
}