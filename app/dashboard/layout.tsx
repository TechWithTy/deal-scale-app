import Header from '@/components/layout/header';
import Sidebar from '@/components/layout/sidebar';
import { BillingModal } from '@/components/reusables/modals/user/billing';
import { SecurityModal } from '@/components/reusables/modals/user/security';
import { UpgradeModal } from '@/components/reusables/modals/user/upgrade';
import AiUsageModal from '@/components/reusables/modals/user/usage';
import { WebhookModal } from '@/components/reusables/modals/user/webhook';

import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/sonner';
import { InviteEmployeeModal } from '@/components/tables/employee-tables/utils/addEmployee';
import { mockUserProfile } from '@/constants/_faker/profile/userProfile';
export const metadata: Metadata = {
  title:
    'Lead Ignite Dashboard | Real Estate Property Search & Market Analysis',
  description:
    'Explore properties by location with the Lead Ignite Dashboard. Access in-depth market analysis and detailed property information to make informed decisions for your real estate business.'
};

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <Sidebar />
      <main className="w-full flex-1 overflow-hidden">
        <Header />
        {children}
      </main>
      <AiUsageModal />
      <BillingModal
        billingHistory={mockUserProfile.billingHistory}
        paymentDetails={mockUserProfile.paymentDetails}
        subscription={mockUserProfile.subscription}
      />
      <InviteEmployeeModal />
      <SecurityModal />
      <UpgradeModal trial={true} />
      <WebhookModal />
      <Toaster />
    </div>
  );
}
