import { describe, expect, it, vi } from "vitest";

import { baseGlobalCommands } from "external/action-bar/utils/commands";

const pushMock = vi.fn();
const openLeaderboardModalMock = vi.fn();
const openWheelSpinnerModalMock = vi.fn();

vi.mock("@/lib/stores/dashboard", () => ({
	useModalStore: {
		getState: () => ({
			openLeaderboardModal: openLeaderboardModalMock,
			openWheelSpinnerModal: openWheelSpinnerModalMock,
		}),
	},
}));

describe("baseGlobalCommands", () => {
	it("includes navigation commands with correct actions", () => {
		const router = { push: pushMock } as never;
		const commands = baseGlobalCommands(router);

		const home = commands.find((cmd) => cmd.id === "go-home");
		const leaderboard = commands.find((cmd) => cmd.id === "go-leaderboard");
		const spin = commands.find((cmd) => cmd.id === "go-daily-spin");

		expect(home).toBeTruthy();
		expect(leaderboard).toBeTruthy();
		expect(spin).toBeTruthy();

		pushMock.mockClear();
		home?.action();
		expect(pushMock).toHaveBeenCalledWith("/");

		openLeaderboardModalMock.mockClear();
		leaderboard?.action();
		expect(openLeaderboardModalMock).toHaveBeenCalled();

		openWheelSpinnerModalMock.mockClear();
		spin?.action();
		expect(openWheelSpinnerModalMock).toHaveBeenCalled();
	});
});
















