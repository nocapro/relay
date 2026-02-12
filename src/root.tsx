import { Links, Meta, Scripts, ScrollRestoration, Outlet } from 'react-router';
import type { LinksFunction } from 'react-router';
import { useEffect } from 'react';
import { cn } from '@/utils/cn.util';
import { useStore } from '@/store/root.store';
import { CommandPalette } from '@/components/layout/command-palette.layout';
import { Navigation } from '@/components/layout/navigation.layout';
import { Header } from '@/components/layout/header.layout';
import { useIsMobile } from '@/hooks/mobile.hook';

import '@/styles/main.style.css';

export const links: LinksFunction = () => [];

export function Layout({ children }: { children: React.ReactNode }) {
  const setCmdOpen = useStore((state) => state.setCmdOpen);
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen(true);
      }
      if (e.key === 'Escape') setCmdOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setCmdOpen]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="antialiased min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
        <div className="min-h-screen">
          <CommandPalette />
          <Navigation />
          <div className={cn("flex flex-col min-h-screen transition-all duration-300", isMobile ? "pb-20" : "pl-64")}>
            <Header />
            <main className="flex-1">
              {children}
            </main>
          </div>
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
