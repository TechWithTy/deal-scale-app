import { describe, expect, it } from "vitest";
import { HERO_COLORS } from "@/constants/theme/marketing";
import { calculateContrastRatio } from "@/utils/color/contrast";

describe("marketing theme", () => {
        it("maintains WCAG AA contrast for hero text", () => {
                const ratio = calculateContrastRatio(HERO_COLORS.background, HERO_COLORS.text);
                expect(ratio).toBeGreaterThanOrEqual(4.5);
        });

        it("uses an accessible accent on the hero button", () => {
                const ratio = calculateContrastRatio(HERO_COLORS.accent, HERO_COLORS.accentText);
                expect(ratio).toBeGreaterThanOrEqual(4.5);
        });
});
