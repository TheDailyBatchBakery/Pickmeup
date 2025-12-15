import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Pickmeup - Pickup Orders',
  description: 'Order food for pickup',
};

function CartIcon() {
  // This needs to be a client component, but we'll handle it differently
  return null;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="text-2xl font-bold text-primary-600">
                Pickmeup
              </Link>
              <div className="flex items-center gap-4">
                <Link
                  href="/menu"
                  className="text-gray-700 hover:text-primary-600 transition-colors"
                >
                  Menu
                </Link>
                <Link
                  href="/checkout"
                  className="text-gray-700 hover:text-primary-600 transition-colors"
                >
                  Cart
                </Link>
                <Link
                  href="/admin"
                  className="text-gray-700 hover:text-primary-600 transition-colors"
                >
                  Admin
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <main className="min-h-screen">{children}</main>
        <footer className="bg-gray-800 text-white py-8 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p>&copy; 2024 Pickmeup. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}

