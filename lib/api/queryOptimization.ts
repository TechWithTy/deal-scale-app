/**
 * Database Query Optimization Utilities
 *
 * Provides helpers for optimizing database queries:
 * - Query batching
 * - Request deduplication
 * - Caching strategies
 * - Parallel query execution
 *
 * Works with Supabase, Prisma, or any database client
 */

/**
 * Batch multiple queries into a single request
 * Reduces network overhead and improves performance
 *
 * @example
 * ```tsx
 * const [leads, campaigns, stats] = await batchQueries([
 *   () => fetchLeads(),
 *   () => fetchCampaigns(),
 *   () => fetchStats(),
 * ]);
 * ```
 */
export async function batchQueries<T extends unknown[]>(
	queries: Array<() => Promise<unknown>>,
): Promise<T> {
	const results = await Promise.all(queries.map((query) => query()));
	return results as T;
}

/**
 * Batch queries with error handling
 * Individual query failures don't break the entire batch
 *
 * @example
 * ```tsx
 * const results = await batchQueriesSafe([
 *   () => fetchLeads(),
 *   () => fetchCampaigns(),
 *   () => fetchStats(),
 * ]);
 *
 * results.forEach((result, index) => {
 *   if (result.success) {
 *     console.log('Query succeeded:', result.data);
 *   } else {
 *     console.error('Query failed:', result.error);
 *   }
 * });
 * ```
 */
export async function batchQueriesSafe<T = unknown>(
	queries: Array<() => Promise<T>>,
): Promise<Array<{ success: boolean; data?: T; error?: Error }>> {
	const results = await Promise.allSettled(queries.map((query) => query()));

	return results.map((result) => {
		if (result.status === "fulfilled") {
			return { success: true, data: result.value };
		}
		return { success: false, error: result.reason as Error };
	});
}

/**
 * Request Deduplication
 * Prevents duplicate requests for the same resource
 */
class RequestCache {
	private cache = new Map<string, Promise<unknown>>();
	private ttl = 5000; // 5 seconds default TTL

	/**
	 * Execute a request with deduplication
	 * Multiple calls with the same key will share the same promise
	 */
	async dedupe<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
		// Return existing promise if available
		const existing = this.cache.get(key);
		if (existing) {
			return existing as Promise<T>;
		}

		// Create new promise
		const promise = fetcher();
		this.cache.set(key, promise);

		// Clear cache after TTL
		setTimeout(() => {
			this.cache.delete(key);
		}, this.ttl);

		try {
			const result = await promise;
			return result;
		} catch (error) {
			// Clear failed requests immediately
			this.cache.delete(key);
			throw error;
		}
	}

	/**
	 * Clear all cached requests
	 */
	clear(): void {
		this.cache.clear();
	}

	/**
	 * Clear a specific cached request
	 */
	invalidate(key: string): void {
		this.cache.delete(key);
	}
}

export const requestCache = new RequestCache();

/**
 * Supabase Query Optimization Helpers
 */
export const supabaseOptimizations = {
	/**
	 * Select only needed columns to reduce payload size
	 *
	 * @example
	 * ```tsx
	 * // ❌ BAD: Fetches all columns
	 * const { data } = await supabase.from('leads').select('*');
	 *
	 * // ✅ GOOD: Select only needed columns
	 * const { data } = await supabase
	 *   .from('leads')
	 *   .select('id, name, status, created_at');
	 * ```
	 */
	selectColumns: (columns: string[]) => columns.join(", "),

	/**
	 * Paginate results efficiently
	 *
	 * @example
	 * ```tsx
	 * const page = 1;
	 * const pageSize = 50;
	 * const { from, to } = supabaseOptimizations.paginate(page, pageSize);
	 *
	 * const { data } = await supabase
	 *   .from('leads')
	 *   .select('*')
	 *   .range(from, to);
	 * ```
	 */
	paginate: (page: number, pageSize: number) => {
		const from = (page - 1) * pageSize;
		const to = from + pageSize - 1;
		return { from, to };
	},

	/**
	 * Batch insert records
	 * More efficient than individual inserts
	 *
	 * @example
	 * ```tsx
	 * const records = [
	 *   { name: 'Lead 1', status: 'active' },
	 *   { name: 'Lead 2', status: 'active' },
	 * ];
	 *
	 * const { data, error } = await supabase
	 *   .from('leads')
	 *   .insert(records);
	 * ```
	 */
	batchInsert: <T>(records: T[], batchSize = 1000) => {
		const batches: T[][] = [];
		for (let i = 0; i < records.length; i += batchSize) {
			batches.push(records.slice(i, i + batchSize));
		}
		return batches;
	},
};

/**
 * Query performance monitoring
 */
export class QueryMonitor {
	private static timings = new Map<string, number[]>();

	/**
	 * Measure query execution time
	 *
	 * @example
	 * ```tsx
	 * const data = await QueryMonitor.measure('fetchLeads', async () => {
	 *   return await fetchLeads();
	 * });
	 * ```
	 */
	static async measure<T>(
		queryName: string,
		query: () => Promise<T>,
	): Promise<T> {
		const start = performance.now();
		try {
			const result = await query();
			const duration = performance.now() - start;
			this.recordTiming(queryName, duration);

			if (duration > 1000) {
				console.warn(`⚠️ Slow query "${queryName}": ${duration.toFixed(2)}ms`);
			}

			return result;
		} catch (error) {
			const duration = performance.now() - start;
			this.recordTiming(queryName, duration);
			throw error;
		}
	}

	/**
	 * Record query timing
	 */
	private static recordTiming(queryName: string, duration: number): void {
		if (!this.timings.has(queryName)) {
			this.timings.set(queryName, []);
		}
		this.timings.get(queryName)!.push(duration);
	}

	/**
	 * Get query statistics
	 */
	static getStats(queryName: string) {
		const timings = this.timings.get(queryName) || [];
		if (timings.length === 0) {
			return null;
		}

		const sum = timings.reduce((a, b) => a + b, 0);
		const avg = sum / timings.length;
		const min = Math.min(...timings);
		const max = Math.max(...timings);

		return {
			count: timings.length,
			avg: avg.toFixed(2),
			min: min.toFixed(2),
			max: max.toFixed(2),
			total: sum.toFixed(2),
		};
	}

	/**
	 * Clear all timing data
	 */
	static clear(): void {
		this.timings.clear();
	}

	/**
	 * Log all query statistics
	 */
	static logStats(): void {
		console.group("📊 Query Performance Stats");
		this.timings.forEach((_, queryName) => {
			const stats = this.getStats(queryName);
			if (stats) {
				console.log(`${queryName}:`, stats);
			}
		});
		console.groupEnd();
	}
}

/**
 * Index hints for database optimization
 * Use these as reminders when creating database indexes
 */
export const indexHints = {
	leads: {
		// Index on frequently filtered columns
		status: "CREATE INDEX idx_leads_status ON leads(status)",
		created_at: "CREATE INDEX idx_leads_created_at ON leads(created_at DESC)",
		user_id: "CREATE INDEX idx_leads_user_id ON leads(user_id)",
		// Composite index for common queries
		user_status: "CREATE INDEX idx_leads_user_status ON leads(user_id, status)",
	},
	campaigns: {
		status: "CREATE INDEX idx_campaigns_status ON campaigns(status)",
		user_id: "CREATE INDEX idx_campaigns_user_id ON campaigns(user_id)",
		created_at:
			"CREATE INDEX idx_campaigns_created_at ON campaigns(created_at DESC)",
	},
	properties: {
		address:
			"CREATE INDEX idx_properties_address ON properties USING gin(address)",
		user_id: "CREATE INDEX idx_properties_user_id ON properties(user_id)",
		created_at:
			"CREATE INDEX idx_properties_created_at ON properties(created_at DESC)",
	},
};
