'use client';

import { AlertModal } from '@/components/modal/alert-modal';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch'; // Assuming you have a Switch component
import { Edit, MoreHorizontal, Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { TeamMember } from '@/types/userProfile';

interface CellActionProps {
  data: TeamMember;
  currentUserRole: 'admin' | 'member'; // Role of the current user
}

export const CellAction: React.FC<CellActionProps> = ({
  data,
  currentUserRole
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [permissions, setPermissions] = useState(data.permissions); // Manage permissions locally

  const router = useRouter();

  const onConfirm = async () => {
    // Handle deletion confirmation here
  };

  const togglePermission = (permissionKey: keyof typeof permissions) => {
    // Only admins can toggle permissions
    if (currentUserRole === 'admin') {
      setPermissions((prevPermissions) => ({
        ...prevPermissions,
        [permissionKey]: !prevPermissions[permissionKey]
      }));

      // You would also make an API call here to persist the changes
      // Example: await api.updatePermissions(data.id, updatedPermissions);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        loading={loading}
      />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>

          <DropdownMenuItem
            onClick={() => router.push(`/dashboard/employee/${data.id}`)}
          >
            <Edit className="mr-2 h-4 w-4" /> Update
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <Trash className="mr-2 h-4 w-4" /> Delete
          </DropdownMenuItem>

          {/* Render permission toggles if current user is an admin */}
          {currentUserRole === 'admin' && (
            <>
              <DropdownMenuLabel className="mt-2">
                UserPermissions
              </DropdownMenuLabel>
              {Object.keys(permissions).map((key) => (
                <DropdownMenuItem key={key} asChild>
                  <div className="flex items-center justify-between">
                    <span className="capitalize">
                      {key.replace(/can/g, '')}
                    </span>
                    <Switch
                      checked={permissions[key as keyof typeof permissions]}
                      onCheckedChange={() =>
                        togglePermission(key as keyof typeof permissions)
                      }
                    />
                  </div>
                </DropdownMenuItem>
              ))}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
