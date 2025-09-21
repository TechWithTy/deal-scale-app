"use client";
import React, { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { DrawerFlow } from "../../../external/drawer-flow";
import type {
	DrawerItem,
	ListService,
	LoadMoreArgs,
	LoadMoreResult,
} from "../../../external/drawer-flow";

// Simple in-memory cache scoped to this page for demo/testing
const demoCache = {
	listNames: null as string[] | null,
	pages: new Map<string, LoadMoreResult>(),
};

function makeDemoItems(offset: number, limit: number): DrawerItem[] {
	return Array.from({ length: limit }).map((_, i) => {
		const idNum = offset + i + 1;
		return {
			id: `demo-${idNum}`,
			display: {
				title: `123${idNum} Main St`,
				subtitle: `Phoenix, AZ ${85000 + (idNum % 999)}`,
				mediaUrl: undefined,
				mediaUrls: [
					`https://picsum.photos/seed/${idNum}a/800/450`,
					`https://picsum.photos/seed/${idNum}b/800/450`,
					`https://picsum.photos/seed/${idNum}c/800/450`,
				],
			},
			details: {
				beds: (idNum % 5) + 1,
				baths: (idNum % 3) + 1,
				sqft: 900 + idNum * 7,
			},
		} satisfies DrawerItem;
	});
}

function createInMemoryListService(totalCount = 240): ListService {
	return {
		async getListNames() {
			if (demoCache.listNames) return demoCache.listNames;
			// Fetch from API here in real app
			const names = [
				"High Equity AZ",
				"Absentee Owners PHX",
				"Vacant Maricopa",
			];
			demoCache.listNames = names;
			return names;
		},
		async createList(name, items) {
			// Implement API call
			console.log("createList", { name, count: items.length });
			return {
				listId: `${name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
			};
		},
		async addToList(listId, items) {
			// Implement API call
			console.log("addToList", { listId, count: items.length });
		},
		async loadMore({ pageSize, cursor }: LoadMoreArgs) {
			const key = `${cursor ?? 0}-${pageSize}`;
			const cached = demoCache.pages.get(key);
			if (cached) return cached;

			const start = cursor ? parseInt(cursor, 10) : 0;
			const next = Math.min(start + pageSize, totalCount);
			const items = makeDemoItems(start, next - start);
			const hasMore = next < totalCount;
			const result: LoadMoreResult = {
				items,
				hasMore,
				cursor: hasMore ? String(next) : null,
			};
			demoCache.pages.set(key, result);
			return result;
		},
	} satisfies ListService;
}

export default function DrawerTestPage() {
	const [open, setOpen] = useState(false);
	const listService = useMemo(() => createInMemoryListService(240), []);

	const loadMore = useCallback<
		NonNullable<Parameters<typeof DrawerFlow>[0]["loadMore"]>
	>(async (args) => listService.loadMore(args), [listService]);

	return (
		<div className="p-8 space-y-4">
			<h1 className="font-semibold text-2xl">Drawer Flow Test</h1>
			<p className="text-muted-foreground">
				This page mounts the external drawer-flow package with an in-memory
				ListService and caching.
			</p>
			<div>
				<Button onClick={() => setOpen(true)}>Open Drawer</Button>
			</div>

			<DrawerFlow
				isOpen={open}
				onOpenChange={setOpen}
				listService={listService}
				loadMore={loadMore}
				defaultPageSize={12}
				pageSizeOptions={[12, 24, 48, 96]}
			/>
		</div>
	);
}
