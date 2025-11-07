export interface StoredPushSubscription {
	endpoint: string;
	keys: {
		auth: string;
		p256dh: string;
	};
	userId: string;
	createdAt: string;
	updatedAt?: string;
	expirationTime?: number | null;
	metadata?: Record<string, unknown> | null;
}

const subscriptionMap = new Map<string, StoredPushSubscription>();

export function upsertPushSubscription(
	subscription: StoredPushSubscription,
): StoredPushSubscription {
	const previous = subscriptionMap.get(subscription.endpoint);
	const record: StoredPushSubscription = {
		...subscription,
		createdAt: previous?.createdAt ?? subscription.createdAt,
		updatedAt: new Date().toISOString(),
	};
	subscriptionMap.set(subscription.endpoint, record);
	return record;
}

export function getPushSubscriptionByEndpoint(
	endpoint: string,
): StoredPushSubscription | undefined {
	return subscriptionMap.get(endpoint);
}

export function getPushSubscriptionsForUser(
	userId: string,
): StoredPushSubscription[] {
	return Array.from(subscriptionMap.values()).filter(
		(subscription) => subscription.userId === userId,
	);
}

export function removePushSubscription(endpoint: string): boolean {
	return subscriptionMap.delete(endpoint);
}

export function clearPushSubscriptions(): void {
	subscriptionMap.clear();
}

export function pushSubscriptionCount(): number {
	return subscriptionMap.size;
}
