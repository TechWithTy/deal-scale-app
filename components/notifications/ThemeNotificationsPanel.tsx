"use client";

import { AnimatedList } from "@/components/magicui/animated-list";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNotificationsStore } from "@/lib/stores/notificationsStore";
import type { NotificationFormField } from "@/lib/stores/notificationsStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface ThemeNotificationsPanelProps {
	maxHeightClass?: string;
}

interface NotificationFormProps {
	notificationId: string;
	fields: NotificationFormField[];
	submitLabel: string;
	onSubmit: (data: Record<string, string | number | File>) => void;
}

function NotificationForm({
	fields,
	submitLabel,
	onSubmit,
}: NotificationFormProps) {
	// Build Zod schema dynamically from fields with full validation
	const schemaFields: Record<string, z.ZodTypeAny> = {};
	for (const field of fields) {
		if (field.type === "text" || field.type === "password") {
			let stringSchema = z.string();
			if (field.required) stringSchema = stringSchema.min(1, "Required");
			if (field.minLength)
				stringSchema = stringSchema.min(
					field.minLength,
					`Min ${field.minLength} chars`,
				);
			if (field.maxLength)
				stringSchema = stringSchema.max(
					field.maxLength,
					`Max ${field.maxLength} chars`,
				);
			if (field.regex)
				stringSchema = stringSchema.regex(
					new RegExp(field.regex),
					field.regexMessage ?? "Invalid format",
				);
			schemaFields[field.id] = field.required
				? stringSchema
				: stringSchema.optional();
		} else if (field.type === "email") {
			let emailSchema = z.string().email("Invalid email");
			if (field.minLength)
				emailSchema = emailSchema.min(
					field.minLength,
					`Min ${field.minLength} chars`,
				);
			if (field.maxLength)
				emailSchema = emailSchema.max(
					field.maxLength,
					`Max ${field.maxLength} chars`,
				);
			schemaFields[field.id] = field.required
				? emailSchema
				: emailSchema.optional();
		} else if (field.type === "number") {
			let numSchema = z.number();
			if (field.min !== undefined)
				numSchema = numSchema.min(field.min, `Min ${field.min}`);
			if (field.max !== undefined)
				numSchema = numSchema.max(field.max, `Max ${field.max}`);
			schemaFields[field.id] = field.required
				? numSchema
				: numSchema.optional();
		} else if (field.type === "file") {
			let fileSchema = z.instanceof(File, { message: "File required" });
			// Server-side or client-side refinements for file size/type/dimensions
			if (field.maxFileSizeMB) {
				fileSchema = fileSchema.refine(
					(f) => f.size <= (field.maxFileSizeMB ?? 0) * 1024 * 1024,
					`Max file size: ${field.maxFileSizeMB}MB`,
				);
			}
			if (field.acceptedFileTypes && field.acceptedFileTypes.length > 0) {
				fileSchema = fileSchema.refine(
					(f) => field.acceptedFileTypes?.includes(f.type) ?? true,
					`Accepted types: ${field.acceptedFileTypes?.join(", ")}`,
				);
			}
			// Image dimension validation (async validation for width/height)
			if (
				field.minWidth ||
				field.maxWidth ||
				field.minHeight ||
				field.maxHeight
			) {
				fileSchema = fileSchema.refine(
					async (file) => {
						if (!file.type.startsWith("image/")) return true;
						return new Promise<boolean>((resolve) => {
							const img = new Image();
							const url = URL.createObjectURL(file);
							img.onload = () => {
								URL.revokeObjectURL(url);
								const w = img.width;
								const h = img.height;
								if (field.minWidth && w < field.minWidth) return resolve(false);
								if (field.maxWidth && w > field.maxWidth) return resolve(false);
								if (field.minHeight && h < field.minHeight)
									return resolve(false);
								if (field.maxHeight && h > field.maxHeight)
									return resolve(false);
								resolve(true);
							};
							img.onerror = () => {
								URL.revokeObjectURL(url);
								resolve(false);
							};
							img.src = url;
						});
					},
					`Image dimensions: ${field.minWidth ?? 0}x${field.minHeight ?? 0} to ${field.maxWidth ?? "∞"}x${field.maxHeight ?? "∞"}`,
				);
			}
			schemaFields[field.id] = field.required
				? fileSchema
				: fileSchema.optional();
		}
	}
	const schema = z.object(schemaFields);
	type FormValues = z.infer<typeof schema>;

	const form = useForm<FormValues>({
		resolver: zodResolver(schema),
	});

	const handleFormSubmit = (data: FormValues) => {
		onSubmit(data as Record<string, string | number | File>);
	};

	return (
		<Form form={form}>
			<form
				onSubmit={form.handleSubmit(handleFormSubmit)}
				className="mt-3 space-y-2"
			>
				{fields.map((field) => (
					<FormField
						key={field.id}
						name={field.id}
						control={form.control}
						render={({ field: fieldProps }) => (
							<FormItem>
								<FormLabel className="text-xs">
									{field.label}
									{field.sensitive ? (
										<span className="ml-1 text-[9px] text-muted-foreground">
											(sensitive)
										</span>
									) : null}
								</FormLabel>
								<FormControl>
									{field.type === "text" ? (
										<Input
											type="text"
											placeholder={field.placeholder}
											{...fieldProps}
											className="h-8 text-xs"
										/>
									) : field.type === "password" ? (
										<Input
											type="password"
											placeholder={field.placeholder}
											{...fieldProps}
											className="h-8 text-xs"
										/>
									) : field.type === "email" ? (
										<Input
											type="email"
											placeholder={field.placeholder}
											{...fieldProps}
											className="h-8 text-xs"
										/>
									) : field.type === "number" ? (
										<Input
											type="number"
											placeholder={field.placeholder}
											{...fieldProps}
											onChange={(e) =>
												fieldProps.onChange(Number.parseFloat(e.target.value))
											}
											className="h-8 text-xs"
										/>
									) : field.type === "file" ? (
										<Input
											type="file"
											accept={field.acceptedFileTypes?.join(",")}
											onChange={(e) => {
												const file = e.target.files?.[0];
												if (file) fieldProps.onChange(file);
											}}
											className="h-8 text-xs"
										/>
									) : null}
								</FormControl>
								<FormMessage className="text-[10px]" />
							</FormItem>
						)}
					/>
				))}
				<div className="flex justify-end pt-1">
					<Button type="submit" size="sm">
						{submitLabel}
					</Button>
				</div>
			</form>
		</Form>
	);
}

export default function ThemeNotificationsPanel({
	maxHeightClass = "h-[380px]",
}: ThemeNotificationsPanelProps) {
	const notifications = useNotificationsStore((s) => s.notifications);
	const dismiss = useNotificationsStore((s) => s.dismiss);
	const clearAll = useNotificationsStore((s) => s.clearAll);
	const addMany = useNotificationsStore((s) => s.addMany);
	const approve = useNotificationsStore((s) => s.approve);
	const deny = useNotificationsStore((s) => s.deny);
	const submitForm = useNotificationsStore((s) => s.submitForm);

	const [activeTab, setActiveTab] = useState("all");

	const approvalNotifs = notifications.filter(
		(n) => n.approveLabel || n.denyLabel,
	);
	const formNotifs = notifications.filter(
		(n) => n.formFields && n.formFields.length > 0,
	);
	const allNotifs = notifications;

	const filteredNotifs =
		activeTab === "approvals"
			? approvalNotifs
			: activeTab === "forms"
				? formNotifs
				: allNotifs;
	const hasAny = filteredNotifs.length > 0;

	return (
		<div
			className={`relative w-[360px] overflow-hidden rounded-lg border bg-card text-card-foreground ${maxHeightClass}`}
		>
			<div className="border-b px-3 py-2">
				<div className="flex items-center justify-between">
					<div className="font-medium text-sm">Notifications</div>
					<Button
						variant="ghost"
						size="sm"
						onClick={clearAll}
						className="text-muted-foreground hover:text-foreground"
					>
						Clear all
					</Button>
				</div>
				<Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
					<TabsList className="grid w-full grid-cols-3">
						<TabsTrigger value="all">All ({allNotifs.length})</TabsTrigger>
						<TabsTrigger value="approvals">
							Approvals ({approvalNotifs.length})
						</TabsTrigger>
						<TabsTrigger value="forms">Forms ({formNotifs.length})</TabsTrigger>
					</TabsList>
				</Tabs>
				<div className="mt-2 flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => addMany(5)}
						className="text-xs"
					>
						+ 5 mock
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => {
							const addUnsafe = useNotificationsStore.getState()
								.add as unknown as (payload: Record<string, unknown>) => void;
							addUnsafe({
								title: "Approve campaign launch?",
								description: "Starter plan, 42 leads, SMS + Email",
								icon: "🚀",
								colorHsl: "142 76% 36%",
								action: {
									approveLabel: "Approve",
									denyLabel: "Deny",
									onApprove: () => console.log("Campaign approved"),
									onDeny: () => console.log("Campaign denied"),
								},
							});
						}}
						className="text-xs"
					>
						+ approval
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => {
							const addUnsafe = useNotificationsStore.getState()
								.add as unknown as (payload: Record<string, unknown>) => void;
							addUnsafe({
								title: "Complete your profile",
								description: "Please provide the following details",
								icon: "📝",
								colorHsl: "258 84% 54%",
								formFields: [
									{
										id: "name",
										label: "Full Name",
										type: "text",
										required: true,
									},
									{
										id: "age",
										label: "Age",
										type: "number",
										placeholder: "18",
									},
									{ id: "avatar", label: "Profile Photo", type: "file" },
								],
								submitLabel: "Submit",
								action: {
									onSubmit: (data: Record<string, unknown>) =>
										console.log("Form submitted:", data),
								},
							});
						}}
						className="text-xs"
					>
						+ form
					</Button>
				</div>
			</div>
			<div className="relative h-full overflow-y-auto p-2 pb-20">
				{hasAny ? (
					<>
						<AnimatedList className="items-stretch">
							{filteredNotifs.map((n) => (
								<div
									key={n.id}
									className="group relative rounded-md border bg-background/60 p-3 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/40"
								>
									{/* Top right controls */}
									<div className="absolute top-2 right-2 flex items-center gap-1.5">
										{n.unread ? (
											<span className="inline-block h-2 w-2 rounded-full bg-primary" />
										) : null}
										<button
											type="button"
											aria-label="Dismiss notification"
											onClick={() => dismiss(n.id)}
											className="opacity-70 transition-opacity hover:opacity-100"
										>
											<X className="h-4 w-4" />
										</button>
									</div>
									{/* Main content: icon + message (full width) */}
									<div className="flex items-start gap-3 pr-8">
										<div
											className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border"
											style={{
												borderColor: n.colorHsl
													? `hsl(${n.colorHsl})`
													: undefined,
											}}
										>
											<span
												className="text-base"
												style={{
													color: n.colorHsl ? `hsl(${n.colorHsl})` : undefined,
												}}
											>
												{n.icon ?? "🔔"}
											</span>
										</div>
										<div className="flex-1">
											<div className="font-medium text-sm leading-snug">
												{n.title}
											</div>
											{n.description ? (
												<div className="mt-0.5 text-muted-foreground text-xs leading-relaxed">
													{n.description}
												</div>
											) : null}
											<div className="mt-1.5 text-[10px] text-muted-foreground">
												{new Date(n.createdAt).toLocaleTimeString()}
											</div>
										</div>
									</div>
									{/* Action buttons row (below content, right-aligned) */}
									{n.approveLabel || n.denyLabel ? (
										<div className="mt-3 flex items-center justify-end gap-2">
											{n.denyLabel ? (
												<Button
													type="button"
													variant="outline"
													size="sm"
													onClick={() => deny(n.id)}
												>
													{n.denyLabel}
												</Button>
											) : null}
											{n.approveLabel ? (
												<Button
													type="button"
													variant="default"
													size="sm"
													onClick={() => approve(n.id)}
												>
													{n.approveLabel}
												</Button>
											) : null}
										</div>
									) : null}
									{/* Form fields (if present) */}
									{n.formFields && n.formFields.length > 0 ? (
										<NotificationForm
											notificationId={n.id}
											fields={n.formFields}
											submitLabel={n.submitLabel ?? "Submit"}
											onSubmit={(data) => submitForm(n.id, data)}
										/>
									) : null}
								</div>
							))}
						</AnimatedList>
						<div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-background" />
					</>
				) : (
					<div className="flex h-[260px] w-full flex-col items-center justify-center gap-2 text-center text-muted-foreground text-sm">
						<div className="rounded-full border p-3">🔕</div>
						<div>No notifications yet</div>
						<div className="text-xs">
							You’ll see activity, system updates, and tips here.
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
