"use client";

import {
	getCreditsHistory,
	getCreditsStats,
	getExpiringCredits,
} from "@/lib/api/public-api-dashboard";
import {
	type CreditStats,
	type CreditTransaction,
	extractCreditStats,
	extractCreditTransactions,
} from "@/lib/credits/public-api-credit-activity";
import { useEffect, useState } from "react";

const emptyStats: CreditStats = {
	available: 0,
	purchased: 0,
	usagePercentage: 0,
	used: 0,
};

export function CreditActivityPanel({ token }: { token?: string }) {
	const [stats, setStats] = useState(emptyStats);
	const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
	const [expiringCount, setExpiringCount] = useState(0);
	const [isLive, setIsLive] = useState(false);

	useEffect(() => {
		let isMounted = true;
		if (!token) {
			setIsLive(false);
			return;
		}

		Promise.all([
			getCreditsStats(token),
			getCreditsHistory({ limit: 10, offset: 0 }, token),
			getExpiringCredits(token),
		])
			.then(([statsPayload, historyPayload, expiringPayload]) => {
				if (!isMounted) return;
				setStats(extractCreditStats(statsPayload));
				setTransactions(extractCreditTransactions(historyPayload));
				setExpiringCount(
					Array.isArray(expiringPayload) ? expiringPayload.length : 0,
				);
				setIsLive(true);
			})
			.catch(() => {
				if (isMounted) setIsLive(false);
			});

		return () => {
			isMounted = false;
		};
	}, [token]);

	return (
		<section className="rounded-lg border">
			<div className="grid grid-cols-2 gap-3 border-b p-4 sm:grid-cols-4">
				<Stat label="Purchased" value={stats.purchased} />
				<Stat label="Used" value={stats.used} />
				<Stat label="Available" value={stats.available} />
				<Stat label="Expiring entries" value={expiringCount} />
			</div>
			<div className="p-4">
				<div className="mb-3 flex items-center justify-between">
					<h3 className="font-semibold">Recent credit activity</h3>
					<span className="text-muted-foreground text-xs">
						{isLive ? `${stats.usagePercentage}% used · live` : "Unavailable"}
					</span>
				</div>
				{transactions.length ? (
					<ul className="divide-y">
						{transactions.map((transaction) => (
							<li
								key={transaction.id}
								className="flex items-center justify-between py-2 text-sm"
							>
								<div>
									<div>{transaction.reason}</div>
									<div className="text-muted-foreground text-xs">
										{transaction.creditType} ·{" "}
										{new Date(transaction.createdAt).toLocaleString()}
									</div>
								</div>
								<div className="text-right">
									<div>
										{transaction.amount > 0 ? "+" : ""}
										{transaction.amount}
									</div>
									<div className="text-muted-foreground text-xs">
										Balance {transaction.balanceAfter}
									</div>
								</div>
							</li>
						))}
					</ul>
				) : (
					<p className="text-muted-foreground text-sm">
						No credit transactions returned.
					</p>
				)}
			</div>
		</section>
	);
}

function Stat({ label, value }: { label: string; value: number }) {
	return (
		<div>
			<div className="text-muted-foreground text-xs">{label}</div>
			<div className="font-semibold text-lg">{value.toLocaleString()}</div>
		</div>
	);
}
