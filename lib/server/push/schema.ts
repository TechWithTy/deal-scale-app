import { z } from "zod";

const metadataValueSchema = z.union([
	z.string(),
	z.number(),
	z.boolean(),
	z.null(),
]);

export const pushKeysSchema = z.object({
	auth: z.string().min(6, "Missing auth key"),
	p256dh: z.string().min(6, "Missing p256dh key"),
});

export const pushSubscriptionSchema = z.object({
	endpoint: z.string().url("Invalid push endpoint"),
	expirationTime: z.number().nullable().optional(),
	keys: pushKeysSchema,
});

export const pushSubscriptionPayloadSchema = z.object({
	subscription: pushSubscriptionSchema,
	metadata: z.record(metadataValueSchema).optional().default(undefined),
});

export const pushUnsubscribeSchema = z.object({
	endpoint: z.string().url("Invalid push endpoint"),
});

export const pushNotificationActionSchema = z.object({
	action: z.string().min(1),
	title: z.string().min(1),
	icon: z.string().optional(),
});

export const pushNotificationPayloadSchema = z.object({
	title: z.string().min(1),
	body: z.string().min(1),
	icon: z.string().optional(),
	badge: z.string().optional(),
	url: z.string().url().optional(),
	tag: z.string().optional(),
	data: z.record(z.unknown()).optional(),
	actions: z.array(pushNotificationActionSchema).optional(),
	requireInteraction: z.boolean().optional(),
});

export const pushSendPayloadSchema = z.object({
	target: z.union([
		z.object({ userId: z.string().min(1) }),
		z.object({ endpoint: z.string().url("Invalid push endpoint") }),
	]),
	notification: pushNotificationPayloadSchema,
});

export type PushSubscriptionPayload = z.infer<
	typeof pushSubscriptionPayloadSchema
>;
export type PushSendPayload = z.infer<typeof pushSendPayloadSchema>;
export type PushNotificationPayload = z.infer<
	typeof pushNotificationPayloadSchema
>;
