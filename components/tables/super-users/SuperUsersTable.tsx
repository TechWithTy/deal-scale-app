"use client";

import AdminUserDetailModal from "@/components/admin/AdminUserDetailModal";
import EditProfileModal from "@/components/admin/EditProfileModal";
import ResetPasswordModal from "@/components/admin/ResetPasswordModal";
import SuspendUserModal from "@/components/admin/SuspendUserModal";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listAdminUsers } from "@/lib/admin/user-directory";
import { useImpersonationStore } from "@/lib/stores/impersonationStore";
import { DataTable } from "external/shadcn-table/src/components/data-table/data-table";
import { DataTableViewOptions } from "external/shadcn-table/src/components/data-table/data-table-view-options";
import { useDataTable } from "external/shadcn-table/src/hooks/use-data-table";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { adminUserColumns } from "./columns";
import type { AdminUser } from "./types";

const DIRECTORY_USERS: AdminUser[] = listAdminUsers();

export default function SuperUsersTable() {
	const [query, setQuery] = useState("");
	const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const [openCreditsModal, setOpenCreditsModal] = useState(false);
	const [editProfileUser, setEditProfileUser] = useState<AdminUser | null>(
		null,
	);
	const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
	const [resetPasswordUser, setResetPasswordUser] = useState<AdminUser | null>(
		null,
	);
	const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
	const [suspendUser, setSuspendUser] = useState<AdminUser | null>(null); // State for suspend user
	const [isSuspendOpen, setIsSuspendOpen] = useState(false); // State for suspend modal
	const [banUser, setBanUser] = useState<AdminUser | null>(null);
	const [isBanConfirmOpen, setIsBanConfirmOpen] = useState(false);
	const [banEmail, setBanEmail] = useState("");
	const startImpersonation = useImpersonationStore(
		(state) => state.startImpersonation,
	);
	const router = useRouter();

	const tableData = useMemo(() => DIRECTORY_USERS, []);

	const table = useDataTable<AdminUser>({
		data: tableData,
		columns: adminUserColumns,
		pageCount: 0,
		initialState: {
			pagination: { pageIndex: 0, pageSize: 10 },
		},
		disableGlobalColumns: true,
		meta: {
			onView: (user: AdminUser) => {
				setSelectedUserId(user.id);
				setOpenCreditsModal(false);
				setIsModalOpen(true);
			},
			onAdjustCredits: (user: AdminUser) => {
				setSelectedUserId(user.id);
				setOpenCreditsModal(true);
				setIsModalOpen(true);
			},
			onEditProfile: (user: AdminUser) => {
				setEditProfileUser(user);
				setIsEditProfileOpen(true);
			},
			onResetPassword: (user: AdminUser) => {
				setResetPasswordUser(user);
				setIsResetPasswordOpen(true);
			},
			onSuspendUser: (user: AdminUser) => {
				setSuspendUser(user); // Set suspend user
				setIsSuspendOpen(true); // Open suspend modal
			},
			onUnsuspendUser: (user: AdminUser) => {
				// In a real implementation, you would call the unsuspend API
				console.log("User unsuspended:", user.id);
				// Update the user status in the table
			},
			onBanUser: (user: AdminUser) => {
				setBanUser(user);
				setIsBanConfirmOpen(true);
				setBanEmail("");
			},
			onImpersonate: async (user: AdminUser) => {
				try {
					const result = await startImpersonation({ userId: user.id });
					const displayName =
						result.impersonatedUser.name?.trim() ||
						result.impersonatedUser.email ||
						`${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ||
						user.email;
					toast.success(`Impersonation session started for ${displayName}`);
					router.push("/dashboard");
				} catch (error) {
					const message =
						error instanceof Error
							? error.message
							: "Unable to start impersonation";
					toast.error(message);
				}
			},
		},
	});

	const onSearch = () => {
		const normalized = query.trim().toLowerCase();
		if (!normalized) return;

		const match = DIRECTORY_USERS.find((user) => {
			const email = user.email.toLowerCase();
			if (email === normalized) return true;
			const name = `${user.firstName ?? ""} ${user.lastName ?? ""}`
				.trim()
				.toLowerCase();
			return name.includes(normalized);
		});

		if (match) {
			setSelectedUserId(match.id);
			setOpenCreditsModal(false);
			setIsModalOpen(true);
			return;
		}

		toast.info("No matching user found in mock directory");
	};

	return (
		<div className="flex w-full flex-col gap-3">
			<div className="flex items-end justify-between gap-2">
				<div className="flex items-center gap-2">
					<Input
						placeholder="Search by email..."
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						className="h-9 w-[280px]"
					/>
					<Button size="sm" onClick={onSearch}>
						Search
					</Button>
				</div>
				<DataTableViewOptions table={table.table} />
			</div>

			<DataTable
				table={table.table}
				onRowClick={(row) => {
					setSelectedUserId(row.original.id);
					setIsModalOpen(true);
				}}
			/>

			<AdminUserDetailModal
				open={isModalOpen}
				onOpenChange={setIsModalOpen}
				userId={selectedUserId}
				openCreditsModal={openCreditsModal}
			/>
			<EditProfileModal
				open={isEditProfileOpen}
				onOpenChange={setIsEditProfileOpen}
				user={editProfileUser}
				onSave={(updatedUser) => {
					// In a real implementation, you would update the user via API
					console.log("User updated:", updatedUser);
					// Update the mock data or refresh the table
					setIsEditProfileOpen(false);
				}}
			/>
			<ResetPasswordModal
				open={isResetPasswordOpen}
				onOpenChange={setIsResetPasswordOpen}
				user={resetPasswordUser}
				onReset={(userId) => {
					// In a real implementation, you would call the reset password API
					console.log("Password reset requested for user:", userId);
					// Show a success message or toast
				}}
			/>
			<SuspendUserModal
				open={isSuspendOpen}
				onOpenChange={setIsSuspendOpen}
				user={suspendUser}
				onConfirm={(userId, unsuspendDate) => {
					// In a real implementation, you would call the suspend API
					console.log("Suspend user:", userId, unsuspendDate);
					// Update the user status in the table if desired
				}}
			/>
			<AlertDialog open={isBanConfirmOpen} onOpenChange={setIsBanConfirmOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Ban User</AlertDialogTitle>
					</AlertDialogHeader>
					<div className="py-4">
						<p className="text-muted-foreground text-sm">
							Are you sure you want to ban{" "}
							<strong>
								{banUser?.firstName} {banUser?.lastName}
							</strong>{" "}
							({banUser?.email})?
						</p>
						<p className="mt-2 text-muted-foreground text-sm">
							This action is <strong>irreversible</strong> and will permanently
							block the user from accessing the platform.
						</p>
						<p className="mt-2 text-muted-foreground text-sm">
							To confirm, please type the user's email address:
						</p>
						<Input
							className="mt-2"
							placeholder="User email address"
							value={banEmail}
							onChange={(e) => setBanEmail(e.target.value)}
						/>
					</div>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							className="bg-red-600 hover:bg-red-700"
							disabled={banEmail !== banUser?.email}
							onClick={() => {
								if (banUser) {
									// In a real implementation, you would call the ban API
									console.log("User banned:", banUser.id);
									// Update the user status in the table
									setIsBanConfirmOpen(false);
								}
							}}
						>
							Ban User
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
