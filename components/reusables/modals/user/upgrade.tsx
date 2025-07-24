'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { SubscriptionFeatures } from '@/constants/dashboard/featureList';
import { useModalStore } from '@/lib/stores/dashboard';
import { UserProfileSubscription } from '@/constants/_faker/profile/userSubscription';
import { ArrowUpCircle } from 'lucide-react';
import Link from 'next/link';

const FeatureList = () => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {SubscriptionFeatures.map((feature, index) => (
        <div key={index}>
          <div className="mb-2 flex items-center">
            <span className="mr-2 text-blue-500">
              <feature.icon className="h-5 w-5" />
            </span>
            <h4 className="font-medium">{feature.title}</h4>
          </div>
          <p className="text-sm text-muted-foreground">{feature.subtitle}</p>
        </div>
      ))}
    </div>
  );
};

interface UpgradeButtonProps {
  currentMembership: UserProfileSubscription;
}

export const UpgradeButton: React.FC<UpgradeButtonProps> = ({
  currentMembership
}) => {
  const { openUpgradeModal } = useModalStore();

  if (currentMembership.name === 'Basic') {
    return (
      <Button
        onClick={openUpgradeModal}
        className="inline-flex items-center rounded-full border bg-white text-gray-700 transition-colors duration-300 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
      >
        <span className="animate-jump pr-2">
          <ArrowUpCircle className="h-5 w-5 text-yellow-500 dark:text-yellow-300" />
        </span>
        Upgrade now
      </Button>
    );
  }
  return null;
};

interface UpgradeModalProps {
  trial: boolean;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ trial }) => {
  const { isUpgradeModalOpen, closeUpgradeModal } = useModalStore();

  // Array of features for dynamic listing
  const features = [
    '✔ 3 call attempts per number',
    '✔ 2,400 calls per minute',
    '✔ Intelligent conversations',
    '✔ Smart lead summary',
    '✔ Detailed KPIs & stats',
    '✔ Rapid campaign delivery'
  ];

  // Stripe Payment link
  const stripePaymentLink = 'https://buy.stripe.com/test_123456789';

  return (
    <Dialog open={isUpgradeModalOpen} onOpenChange={closeUpgradeModal}>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto p-4 sm:max-w-3xl" // Make modal vertically scrollable with padding
        autoFocus={false}
        style={{ zIndex: 9999 }}
      >
        <DialogHeader>
          <DialogTitle>AI Calling - Upgrade your plan</DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <h3 className="text-center text-xl font-semibold sm:text-left">
            AI-powered leads made easy.
          </h3>
          <p className="text-center text-sm text-muted-foreground sm:text-left">
            Welcome to the future. Let’s upgrade your business.
          </p>
          <Separator className="my-4" />

          {/* Feature List */}
          <FeatureList />

          <Separator className="my-4" />

          {/* Pricing Details Section */}
          <div className="flex flex-col items-center justify-center space-y-4 text-center sm:flex-row sm:justify-between sm:space-y-0 sm:text-left">
            <div>
              <p className="text-sm">CREDITS / month</p>
              <p className="text-sm text-muted-foreground">
                1 credit = 1 property record
              </p>
              {/* Dynamic list rendering */}
              <ul className="mt-2 space-y-1 text-sm">
                {features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>

            {/* Pricing and Button */}
            <div className="flex flex-col items-center sm:items-end">
              <h4 className="text-xl font-semibold">$1795 / month</h4>
              <p className="text-sm text-muted-foreground">
                $1,795.00 / month after
              </p>
              <Button
                className="mt-4 w-full bg-blue-600 text-white sm:w-auto"
                onClick={() => window.open(stripePaymentLink, '_blank')}
              >
                Confirm subscription and pay now
              </Button>
            </div>
          </div>

          {/* Optional Continue to Dashboard if trial is true */}
          {trial && (
            <div className="mt-6 flex justify-center">
              <Link
                href="/dashboard"
                passHref
                className="text-blue-600 transition-colors duration-300 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Continue to Dashboard
              </Link>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
