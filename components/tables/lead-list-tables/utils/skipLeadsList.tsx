import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { skipTraceNestedSchema } from '@/types/zod/createLeadListSkip';
import { LeadTypeGlobal } from '@/types/_dashboard/leads';

type SkipTraceFormProps = {
  leads: LeadTypeGlobal[]; // Simplified lead type
  costPerRecord: number;
  onClose: () => void;
};

const SkipTraceForm: React.FC<SkipTraceFormProps> = ({
  leads,
  costPerRecord,
  onClose
}) => {
  const [recordsToSkip, setRecordsToSkip] = useState<number>(leads.length);
  const [redoSkipTrace, setRedoSkipTrace] = useState<boolean>(true);

  const calculateCost = () => {
    const totalCost = (recordsToSkip * costPerRecord).toFixed(2);
    return Number(totalCost).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const handleSubmit = () => {
    const validationResult = skipTraceNestedSchema.safeParse({
      recordsToSkip,
      redoSkipTrace,
      totalLeads: leads.length
    });

    if (!validationResult.success) {
      validationResult.error.errors.forEach((error) =>
        toast.error(error.message)
      );
      return;
    }

    // Proceed with submission logic

    onClose(); // Close the dialog after submission
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
      <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
        Select the number of leads to skip trace:
      </p>

      {/* Records to skip */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Number of Leads to Skip
        </label>
        <div className="flex items-center space-x-2">
          <Input
            type="number"
            value={recordsToSkip}
            onChange={(e) => setRecordsToSkip(Number(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            min={1}
            max={leads.length}
          />
          <span className="text-sm text-gray-500 dark:text-gray-400">
            / {leads.length}
          </span>
        </div>
      </div>

      {/* Switch for redo skip trace */}
      <div className="mb-4 flex items-center">
        <label className="relative inline-flex cursor-pointer items-center">
          <input
            type="checkbox"
            id="redo-skip-trace"
            checked={redoSkipTrace}
            onChange={() => setRedoSkipTrace(!redoSkipTrace)}
            className="peer sr-only"
          />
          <div className="h-6 w-11 rounded-full bg-gray-300 transition-colors duration-200 peer-checked:bg-blue-500 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 dark:bg-gray-700"></div>
          <span
            className={`absolute left-0.5 top-0.5 h-5 w-5 transform rounded-full bg-white transition-transform duration-200 ${
              redoSkipTrace ? 'translate-x-5' : ''
            }`}
          />
        </label>
        <label className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
          Don’t redo skip traces on data you’ve already purchased in the past 2
          months
        </label>
      </div>

      {/* Total price */}
      <div className="mb-6">
        <p className="text-lg font-medium dark:text-white">
          Total Price: <span className="text-blue-500">${calculateCost()}</span>
        </p>
      </div>

      {/* Submit button */}
      <Button
        onClick={handleSubmit}
        className="w-full rounded-md bg-blue-500 py-2 text-white"
      >
        Skip Trace
      </Button>
    </div>
  );
};

type SkipTraceDialogProps = {
  leads: LeadTypeGlobal[]; // Leads passed into the modal
  costPerRecord: number; // Cost per lead to calculate total price
};

const SkipTraceDialog: React.FC<SkipTraceDialogProps> = ({
  leads,
  costPerRecord
}) => {
  const [isOpen, setIsOpen] = useState(false); // Control dialog state

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={() => setIsOpen(true)}>
          Skip Trace
        </Button>
      </DialogTrigger>

      <DialogContent className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 transform rounded-lg bg-white shadow-lg sm:max-w-[425px] dark:bg-gray-900 ">
        <DialogHeader>
          <DialogTitle className="dark:text-white">
            Skip Trace Leads
          </DialogTitle>
        </DialogHeader>

        <SkipTraceForm
          leads={leads}
          costPerRecord={costPerRecord}
          onClose={() => setIsOpen(false)} // Pass close function to form
        />

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SkipTraceDialog;
