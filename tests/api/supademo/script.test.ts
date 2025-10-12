import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "@/app/api/supademo/script/route";

const SUPADEMO_URL = "https://script.supademo.com/script.js";

describe("Supademo script proxy", () => {
        beforeEach(() => {
                vi.restoreAllMocks();
        });

        afterEach(() => {
                vi.restoreAllMocks();
        });

        it("returns the script with a corrected MIME type", async () => {
                const scriptBody = "console.log('supademo');";
                const fetchSpy = vi
                        .spyOn(globalThis, "fetch")
                        .mockResolvedValue(
                                new Response(scriptBody, {
                                        status: 200,
                                        headers: { "content-type": "text/plain" },
                                }),
                        );

                const response = await GET(new Request("http://localhost/api/supademo/script"));

                expect(fetchSpy).toHaveBeenCalledWith(SUPADEMO_URL, {
                        cache: "no-store",
                        headers: { Accept: "application/javascript" },
                });
                expect(response.status).toBe(200);
                expect(response.headers.get("content-type")).toBe(
                        "application/javascript; charset=utf-8",
                );
                expect(await response.text()).toBe(scriptBody);
        });

        it("returns an error when the upstream request fails", async () => {
                vi.spyOn(globalThis, "fetch").mockResolvedValue(
                        new Response("Not found", { status: 404 }),
                );

                const response = await GET(new Request("http://localhost/api/supademo/script"));

                expect(response.status).toBe(502);
                expect(await response.text()).toContain("Supademo script");
        });
});
