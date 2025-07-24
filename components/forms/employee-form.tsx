'use client';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Heading } from '@/components/ui/heading';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { zodResolver } from '@hookform/resolvers/zod';
import { Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { TeamMember } from '@/types/userProfile';
import { toast } from 'sonner';

// Zod schema for the form
const formSchema = z.object({
  firstName: z
    .string()
    .min(2, { message: 'First name must be at least 2 characters' }),
  lastName: z
    .string()
    .min(2, { message: 'Last name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  role: z.enum(['admin', 'member'], {
    errorMap: () => ({ message: 'Role is required' })
  }),
  permissions: z
    .object({
      canGenerateLeads: z.boolean(),
      canStartCampaigns: z.boolean(),
      canViewReports: z.boolean(),
      canManageTeam: z.boolean(),
      canManageSubscription: z.boolean(),
      canAccessAI: z.boolean(),
      canMoveCompanyTasks: z.boolean(),
      canEditCompanyProfile: z.boolean()
    })
    .refine((permissions) => Object.values(permissions).some(Boolean), {
      message: 'At least one permission must be enabled'
    }),
  twoFactorAuth: z.object({
    isEnabled: z.boolean(),
    methods: z
      .object({
        sms: z.boolean(),
        email: z.boolean(),
        authenticatorApp: z.boolean()
      })
      .refine((methods) => Object.values(methods).some(Boolean), {
        message: 'At least one 2FA method must be enabled'
      })
  })
});

type TeamMemberFormValues = z.infer<typeof formSchema>;

interface TeamMemberFormProps {
  initialData?: TeamMember | null;
}

export const TeamMemberForm: React.FC<TeamMemberFormProps> = ({
  initialData
}) => {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const title = initialData ? 'Edit Team Member' : 'Invite Team Member';
  const description = initialData
    ? 'Edit team member details.'
    : 'Invite a new team member via email.';
  const action = initialData ? 'Save changes' : 'Invite';
  const defaultValues = initialData
    ? {
        firstName: initialData.firstName,
        lastName: initialData.lastName,
        email: initialData.email,
        role: initialData.role as 'admin' | 'member',
        permissions: initialData.permissions,
        twoFactorAuth: initialData.twoFactorAuth || {
          isEnabled: false,
          methods: { sms: false, email: false, authenticatorApp: false }
        }
      }
    : {
        firstName: '',
        lastName: '',
        email: '',
        role: 'member' as 'admin' | 'member',
        permissions: {
          canGenerateLeads: false,
          canStartCampaigns: false,
          canViewReports: false,
          canManageTeam: false,
          canManageSubscription: false,
          canAccessAI: false,
          canMoveCompanyTasks: false,
          canEditCompanyProfile: false
        },
        twoFactorAuth: {
          isEnabled: false,
          methods: { sms: false, email: false, authenticatorApp: false }
        }
      };

  const form = useForm<TeamMemberFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  const onSubmit = async (data: TeamMemberFormValues) => {
    try {
      setLoading(true);
      if (initialData) {
        toast('Team member updated successfully');
      } else {
        toast('Team member invited successfully');
      }
      router.push('/dashboard/team');
    } catch (error: any) {
      toast('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // const onDelete = async () => {
  //   try {
  //     setLoading(true);
  //     // Simulate API call to delete a team member
  //     router.refresh();
  //     router.push(`/dashboard/team`);
  //   } catch (error: any) {
  //   } finally {
  //     setLoading(false);
  //     setOpen(false);
  //   }
  // };

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
        {initialData && (
          <Button
            disabled={loading}
            variant="destructive"
            size="sm"
            onClick={() => setOpen(true)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Separator />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-8"
        >
          <div className="gap-8 md:grid md:grid-cols-2">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="First name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Last name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Invite by Email</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Team member's email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select
                  disabled={loading}
                  onValueChange={field.onChange}
                  value={field.value}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <Separator />
          <Heading
            title="Permissions"
            description="Assign specific permissions"
          />

          <div className="grid grid-cols-1 justify-items-center gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(
              Object.keys(defaultValues.permissions) as Array<
                keyof typeof defaultValues.permissions
              >
            ).map((permKey) => (
              <FormField
                key={permKey}
                control={form.control}
                name={`permissions.${permKey}`}
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-4">
                    <FormLabel className="text-left font-medium">
                      {permKey
                        .replace(/can/, 'Can ')
                        .replace(/([A-Z])/g, ' $1')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="checkbox"
                        disabled={loading}
                        checked={Boolean(field.value)}
                        onChange={field.onChange}
                        className="h-5 w-5"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>

          <Separator />
          <Heading
            title="Two-Factor Authentication"
            description="Enable 2FA for this user"
          />

          <div className="grid grid-cols-1 justify-items-center gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Enable 2FA */}
            <FormField
              control={form.control}
              name="twoFactorAuth.isEnabled"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-4">
                  <FormLabel className="font-medium">Enable 2FA</FormLabel>
                  <FormControl>
                    <Input
                      type="checkbox"
                      disabled={loading}
                      checked={Boolean(field.value)}
                      onChange={field.onChange}
                      className="h-5 w-5"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 2FA Methods */}
            <FormField
              control={form.control}
              name="twoFactorAuth.methods.sms"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-4">
                  <FormLabel className="font-medium">SMS</FormLabel>
                  <FormControl>
                    <Input
                      type="checkbox"
                      disabled={loading}
                      checked={Boolean(field.value)}
                      onChange={field.onChange}
                      className="h-5 w-5"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="twoFactorAuth.methods.email"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-4">
                  <FormLabel className="font-medium">Email</FormLabel>
                  <FormControl>
                    <Input
                      type="checkbox"
                      disabled={loading}
                      checked={Boolean(field.value)}
                      onChange={field.onChange}
                      className="h-5 w-5"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="twoFactorAuth.methods.authenticatorApp"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-4">
                  <FormLabel className="font-medium">
                    Authenticator App
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="checkbox"
                      disabled={loading}
                      checked={Boolean(field.value)}
                      onChange={field.onChange}
                      className="h-5 w-5"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="mt-6 flex justify-end">
            <Button disabled={loading} className="ml-auto" type="submit">
              {action}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
};
