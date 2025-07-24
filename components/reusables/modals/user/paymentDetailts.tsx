import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input'; // Assuming Input is imported
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Zod schema for Payment Modal
const paymentSchema = z.object({
  nameOnCard: z.string().min(1, 'Name on card is required'),
  cardNumber: z
    .string()
    .min(16, 'Card number must be 16 digits')
    .max(16, 'Card number must be 16 digits'),
  exp: z
    .string()
    .min(5, 'Expiration date must be in MM/YY format')
    .regex(/^\d{2}\/\d{2}$/, 'Invalid format'),
  cvv: z
    .string()
    .min(3, 'CVV must be at least 3 digits')
    .max(4, 'CVV cannot be longer than 4 digits'),
  fullName: z.string().min(1, 'Full name is required'),
  country: z.string().min(1, 'Country is required'),
  addressLine1: z.string().min(1, 'Address is required')
});

// Payment Modal Component
export const PaymentModal: React.FC<{ closePaymentModal: () => void }> = ({
  closePaymentModal
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(paymentSchema)
  });

  const onSubmit = (data: any) => {
    closePaymentModal(); // Close modal on successful submission
  };

  return (
    <Dialog open={true} onOpenChange={closePaymentModal}>
      <DialogContent className="sm:max-w-3xl" style={{ zIndex: 10000 }}>
        <DialogHeader>
          <DialogTitle>Add New Payment Method</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name on Card */}
          <Controller
            name="nameOnCard"
            control={control}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-medium">
                  Name on card*
                </label>
                <Input {...field} placeholder="Olivia Rhye" />
                {errors.nameOnCard?.message && (
                  <p className="text-red-500">
                    {String(errors.nameOnCard.message)}
                  </p>
                )}
              </div>
            )}
          />

          {/* Card Number and Expiration */}
          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="cardNumber"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium">
                    Card number*
                  </label>
                  <Input {...field} placeholder="1234 1234 1234 1234" />
                  {errors.cardNumber?.message && (
                    <p className="text-red-500">
                      {String(errors.cardNumber.message)}
                    </p>
                  )}
                </div>
              )}
            />

            <Controller
              name="exp"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium">Exp*</label>
                  <Input {...field} placeholder="MM / YY" />
                  {errors.exp?.message && (
                    <p className="text-red-500">{String(errors.exp.message)}</p>
                  )}
                </div>
              )}
            />
          </div>

          {/* CVV */}
          <Controller
            name="cvv"
            control={control}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-medium">CVV*</label>
                <Input {...field} placeholder="CVC" />
                {errors.cvv?.message && (
                  <p className="text-red-500">{String(errors.cvv.message)}</p>
                )}
              </div>
            )}
          />

          <Separator />

          {/* Full name */}
          <Controller
            name="fullName"
            control={control}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-medium">Full name</label>
                <Input {...field} placeholder="First and last name" />
                {errors.fullName?.message && (
                  <p className="text-red-500">
                    {String(errors.fullName.message)}
                  </p>
                )}
              </div>
            )}
          />

          {/* Country */}
          <Controller
            name="country"
            control={control}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-medium">
                  Country or region
                </label>
                <Input {...field} placeholder="United States" />
                {errors.country?.message && (
                  <p className="text-red-500">
                    {String(errors.country.message)}
                  </p>
                )}
              </div>
            )}
          />

          {/* Address Line 1 */}
          <Controller
            name="addressLine1"
            control={control}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-medium">
                  Address line 1
                </label>
                <Input {...field} placeholder="Street address" />
                {errors.addressLine1?.message && (
                  <p className="text-red-500">
                    {String(errors.addressLine1.message)}
                  </p>
                )}
              </div>
            )}
          />

          <Button type="submit" className="w-full bg-blue-600 text-white">
            Add New Payment Method
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
