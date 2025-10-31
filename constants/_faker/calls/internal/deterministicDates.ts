import type { Faker } from "@faker-js/faker";

const DAY_IN_MS = 86_400_000;
const HOUR_IN_MS = 3_600_000;
const MINUTE_IN_MS = 60_000;
const BASE_ANCHOR_MS = Date.UTC(2024, 0, 15, 12, 0, 0, 0);

export type DeterministicDateFactory = ReturnType<typeof createDeterministicDateFactory>;

type Range = {
        minDays?: number;
        maxDays?: number;
};

type OffsetOptions = {
        direction?: "forward" | "backward";
        minMinutes?: number;
        maxMinutes?: number;
};

const normalizeDays = (range?: Range): Required<Range> => {
        const minDays = Math.max(0, Math.trunc(range?.minDays ?? 0));
        const maxCandidate = range?.maxDays ?? minDays + 30;
        const maxDays = Math.max(minDays, Math.trunc(maxCandidate));
        return { minDays, maxDays };
};

const computeJitter = (randomizer: Faker): number => {
        const hourJitter = randomizer.number.int({ min: -6, max: 6 }) * HOUR_IN_MS;
        const minuteJitter = randomizer.number.int({ min: -45, max: 45 }) * MINUTE_IN_MS;
        return hourJitter + minuteJitter;
};

const clampMinutes = ({ minMinutes, maxMinutes }: OffsetOptions): [number, number] => {
        const min = Math.max(0, Math.trunc(minMinutes ?? 1));
        const max = Math.max(min, Math.trunc(maxMinutes ?? min + 30));
        return [min, max];
};

export const createDeterministicDateFactory = (randomizer: Faker) => {
        const anchorOffset = randomizer.number.int({ min: -60, max: 60 }) * DAY_IN_MS;
        const anchorMs = BASE_ANCHOR_MS + anchorOffset;

        const build = (direction: "past" | "future", range?: Range): Date => {
                const { minDays, maxDays } = normalizeDays(range);
                const distanceDays = randomizer.number.int({ min: minDays, max: maxDays });
                const deltaMs = distanceDays * DAY_IN_MS;
                const directionFactor = direction === "past" ? -1 : 1;
                return new Date(anchorMs + directionFactor * deltaMs + computeJitter(randomizer));
        };

        const recent = (): Date => {
                const recentDays = randomizer.number.int({ min: 0, max: 5 });
                return new Date(anchorMs - recentDays * DAY_IN_MS + computeJitter(randomizer));
        };

        const offsetFrom = (base: Date, options?: OffsetOptions): Date => {
                const [minMinutes, maxMinutes] = clampMinutes(options ?? {});
                const incrementMinutes = randomizer.number.int({ min: minMinutes, max: maxMinutes });
                const direction = options?.direction === "backward" ? -1 : 1;
                const jitter = randomizer.number.int({ min: -30, max: 30 }) * MINUTE_IN_MS;
                return new Date(base.getTime() + direction * incrementMinutes * MINUTE_IN_MS + jitter);
        };

        return {
                anchor: new Date(anchorMs),
                pastDate: (range?: Range) => build("past", range ?? { minDays: 7, maxDays: 365 }),
                pastISOString: (range?: Range) =>
                        build("past", range ?? { minDays: 7, maxDays: 365 }).toISOString(),
                recentDate: () => recent(),
                recentISOString: () => recent().toISOString(),
                futureDate: (range?: Range) => build("future", range ?? { minDays: 3, maxDays: 365 }),
                futureISOString: (range?: Range) =>
                        build("future", range ?? { minDays: 3, maxDays: 365 }).toISOString(),
                offsetFrom,
        };
};
