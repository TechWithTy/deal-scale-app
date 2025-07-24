'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ClipboardCopy, FileSearch } from 'lucide-react';
import { useModalStore } from '@/lib/stores/dashboard';
import { toast } from 'sonner';
import { mockUserProfile } from '@/constants/_faker/profile/userProfile';

// Webhook entry interface
interface WebhookEntry {
  date: string;
  payload: Record<string, any>;
}

// Example webhook history data
const webhookHistory: WebhookEntry[] = [
  {
    date: '2023-09-12',
    payload: {
      phone: '0000000000',
      email: 'test@example.com',
      social_media: {
        // Optional social media fields
        facebook: 'https://facebook.com/example', // Optional
        linkedin: 'https://linkedin.com/in/example', // Optional
        instagram: 'https://instagram.com/example', // Optional
        twitter: 'https://twitter.com/example' // Optional
      }, // Required email field
      address: {
        zip: '00000',
        city: 'Test City',
        state: 'Test State',
        street: 'Test Street'
      },
      summary: 'Summary from AI Bot',
      list_name: 'List Name',
      name_full: 'Full Name',
      name_last: 'Last Name',
      name_first: 'First Name',
      webhook_type: 'lead_created'
    }
  }

  // Add more entries as needed
];

// Custom Modal Component
const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}> = ({ isOpen, onClose, children }) => {
  // Prevent background scroll when the modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-3xl rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            className="h-6 w-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        {children}
      </div>
    </div>
  );
};

export const WebhookModal: React.FC = () => {
  const { isWebhookModalOpen, closeWebhookModal } = useModalStore();
  const [webhookUrl, setWebhookUrl] = useState(
    mockUserProfile.companyInfo.webhook
  );
  const [webhookPayload] = useState(`{
  "phone": "0000000000",
  "email": "test@example.com",  
   "social_media": { 
    "facebook": "https://facebook.com/example",  
    "linkedin": "https://linkedin.com/in/example",  
    "instagram": "https://instagram.com/example",  
    "twitter": "https://twitter.com/example"  
  },
  "address": {
    "zip": "00000",
    "city": "Test City",
    "state": "Test State",
    "street": "Test Street"
  },
  "summary": "Summary from AI Bot",
  "list_name": "List Name",
  "name_full": "Full Name",
  "name_last": "Last Name",
  "name_first": "First Name",
  "webhook_type": "lead_created",
 
}
`);

  // Function to copy payload to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(webhookPayload);
    toast('Payload copied to clipboard!');
  };

  // Function to handle webhook testing
  const handleTestWebhook = () => {
    console.warn('Testing Webhook URL:', webhookUrl);
    console.warn('Testing Webhook Payload:', webhookPayload);
  };

  // Function to save webhook configuration
  const handleSaveWebhook = () => {
    console.warn('Webhook saved:', { webhookUrl });
    closeWebhookModal();
  };

  return (
    <Modal isOpen={isWebhookModalOpen} onClose={closeWebhookModal}>
      <div className="mt-4">
        <h3 className="text-lg font-medium dark:text-gray-200">Webhook</h3>
        <p className="text-sm text-muted-foreground dark:text-gray-400">
          Call a webhook when you get a new lead.
        </p>

        {/* Webhook URL Input */}
        <div className="mt-4">
          <label className="block text-sm font-medium">Webhook URL</label>
          <Input
            type="url"
            placeholder={mockUserProfile.companyInfo.webhook}
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            className="dark:bg-gray-800 dark:text-gray-200" // Dark mode styling
          />
        </div>

        {/* Webhook Payload Section */}
        <div className="relative mt-4">
          <label className="block text-sm font-medium">Webhook Payload</label>
          <div className="relative">
            <Textarea
              rows={8}
              value={webhookPayload}
              readOnly
              className="max-w-full overflow-x-auto dark:bg-gray-800 dark:text-gray-200" // Dark mode styling and horizontal scroll
            />
            <Button
              onClick={copyToClipboard}
              variant="ghost"
              className="absolute right-2 top-2"
              size="icon"
            >
              <ClipboardCopy className="h-5 w-5 text-gray-500 dark:text-gray-300" />
            </Button>
          </div>
        </div>
      </div>

      {/* Webhook History Section */}
      <div className="mt-6">
        <h3 className="text-lg font-medium dark:text-gray-200">
          Webhook History
        </h3>
        <Separator className="my-2 dark:border-gray-600" />

        {webhookHistory.length === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center">
            <FileSearch className="h-10 w-10 text-gray-400 dark:text-gray-500" />
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              No webhook history available
            </p>
          </div>
        ) : (
          <div className="max-h-64 space-y-4 overflow-y-auto">
            {webhookHistory.map((entry, index) => (
              <div
                key={index}
                className="rounded-lg border p-4 dark:border-gray-600"
              >
                <p className="text-sm dark:text-gray-200">
                  Webhook sent on {entry.date} with payload:
                </p>
                <pre className="overflow-x-auto rounded bg-gray-100 p-2 text-xs dark:bg-gray-700">
                  {JSON.stringify(entry.payload, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex justify-end gap-4">
        <Button variant="outline" onClick={closeWebhookModal}>
          Cancel
        </Button>
        <Button variant="secondary" onClick={handleTestWebhook}>
          Test
        </Button>
        <Button className="bg-blue-600 text-white" onClick={handleSaveWebhook}>
          Save
        </Button>
      </div>
    </Modal>
  );
};
