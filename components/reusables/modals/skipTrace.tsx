'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { Button } from '@/components/ui/button';

interface SkipTraceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SkipTraceModal: React.FC<SkipTraceModalProps> = ({
  isOpen,
  onClose
}) => {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm dark:bg-black/70" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-96 -translate-x-1/2 -translate-y-1/2 transform rounded-lg bg-white p-6 shadow-lg focus:outline-none dark:bg-gray-800">
          <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Single Skip-Trace
          </Dialog.Title>

          <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
            Skip the trial and unlock your single-skips right now! This feature
            is available exclusively for subscribers.
          </div>

          <Button className="mt-4 w-full" variant="default">
            Upgrade Now
          </Button>

          <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
            Single Skip Balance: <strong>0</strong>{' '}
            {/* Dynamically manage this */}
          </div>

          <Button
            className="mt-4 w-full"
            onClick={() => {
              /* Handle Skip Trace Action */
            }}
          >
            Skip Trace
          </Button>

          <Button className="mt-2 w-full" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
