'use client';
import React, { useState } from 'react';
import { DashboardNav } from '@/components/dashboard-nav';
import { navItems } from '@/constants/data';
import { cn } from '@/lib/_utils/kanban/utils';
import { ChevronLeft, FlameIcon } from 'lucide-react';
import Link from 'next/link';

type SidebarProps = {
  className?: string;
};

export default function Sidebar({ className }: SidebarProps) {
  // Initialize `isMinimized` to true so the sidebar is minimized by default
  const [isMinimized, setIsMinimized] = useState(true);

  const handleToggle = () => {
    setIsMinimized((prev) => !prev);
  };

  return (
    <aside
      className={cn(
        `relative hidden h-screen flex-none border-r bg-card transition-[width] duration-500 md:block`,
        !isMinimized ? 'w-72' : 'w-[72px]',
        className
      )}
    >
      <div className="hidden p-5 pt-10 lg:block">
        <Link href="https:www.cybershoptech.com" target="_blank">
          <FlameIcon className="mr-2 h-8 w-8" />
        </Link>
      </div>
      <ChevronLeft
        className={cn(
          'absolute -right-3 top-10 z-50 cursor-pointer rounded-full border bg-background text-3xl text-foreground',
          isMinimized && 'rotate-180'
        )}
        onClick={handleToggle}
      />
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="mt-3 space-y-1">
            <DashboardNav items={navItems} />
          </div>
        </div>
      </div>
    </aside>
  );
}
