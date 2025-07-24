import ThemeToggle from '@/components/layout/ThemeToggle/theme-toggle';
import { cn } from '@/lib/_utils/kanban/utils';
import { MobileSidebar } from './mobile-sidebar';
import { UserNav } from './user-nav';
import { UpgradeButton } from '../reusables/modals/user/upgrade';
import { mockSubscriptions } from '@/constants/_faker/profile/userSubscription';

export default function Header() {
  return (
    <header className="sticky inset-x-0 top-0 w-full">
      <nav className="flex items-center justify-between px-4 py-2 md:justify-end">
        <div className="flex items-center gap-2">
          <UpgradeButton currentMembership={mockSubscriptions[1]} />
          <UserNav />
          <ThemeToggle />
        </div>
        <div className={cn('mx-5 block lg:!hidden')}>
          <MobileSidebar />
        </div>
      </nav>
    </header>
  );
}
