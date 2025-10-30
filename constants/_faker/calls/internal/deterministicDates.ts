import type { Faker } from "@faker-js/faker";

type DateDirection = "past" | "future";

export type DateOffsetOptions = {
        /** Inclusive minimum number of days from the anchor. */
        minDays?: number;
        /** Inclusive maximum number of days from the anchor. */
        maxDays?: number;
};

export const DETERMINISTIC_DATE_ANCHOR = new Date("2024-01-01T00:00:00.000Z");
export const MILLISECONDS_IN_DAY = 86_400_000;

export const addMilliseconds = (value: Date, amount: number): Date =>
        new Date(value.getTime() + amount);

const computeDeterministicOffset = (
        source: Faker,
        minDays: number,
        maxDays: number,
): number => {
        const days = source.number.int({ min: minDays, max: maxDays });
        const hours = source.number.int({ min: 0, max: 23 });
        const minutes = source.number.int({ min: 0, max: 59 });
        const seconds = source.number.int({ min: 0, max: 59 });
        const milliseconds = source.number.int({ min: 0, max: 999 });

        const totalSeconds =
                ((days * 24 + hours) * 60 + minutes) * 60 + seconds;
        return totalSeconds * 1000 + milliseconds;
};

export const createDeterministicDateHelpers = (source: Faker) => {
        const anchor = DETERMINISTIC_DATE_ANCHOR.getTime();

        const resolve = (
                direction: DateDirection,
                { minDays = 0, maxDays = 365 }: DateOffsetOptions = {},
        ): Date => {
                const offset = computeDeterministicOffset(source, minDays, maxDays);
                const sign = direction === "future" ? 1 : -1;
                return new Date(anchor + sign * offset);
        };

        const recent = ({ maxDays = 30 }: { maxDays?: number } = {}): Date =>
                resolve("past", { minDays: 0, maxDays });

        const upcoming = ({ maxDays = 30 }: { maxDays?: number } = {}): Date =>
                resolve("future", { minDays: 0, maxDays });

        return {
                past: (options?: DateOffsetOptions): Date =>
                        resolve("past", { minDays: 1, maxDays: 365, ...options }),
                future: (options?: DateOffsetOptions): Date =>
                        resolve("future", { minDays: 1, maxDays: 365, ...options }),
                recent,
                upcoming,
                anchor: (): Date => new Date(anchor),
                iso: (value: Date): string => value.toISOString(),
        };
};
