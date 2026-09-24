import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const repositoryRoot = resolve(import.meta.dirname, "../..");
const workflowRoot = resolve(repositoryRoot, ".github", "workflows");

describe("Deal Scale workflow discovery", () => {
  it("keeps application workflows in the repository-level workflow directory", () => {
    for (const workflowName of [
      "deal-scale-v3-ci.yml",
      "deal-scale-v3-cd.yml",
      "deal-scale-v3-publish.yml",
    ]) {
      const workflowPath = resolve(workflowRoot, workflowName);
      expect(existsSync(workflowPath), workflowPath).toBe(true);
      expect(readFileSync(workflowPath, "utf8")).toContain(
        "working-directory: deal_scale_v3",
      );
    }

    const cdWorkflow = readFileSync(
      resolve(workflowRoot, "deal-scale-v3-cd.yml"),
      "utf8",
    );
    expect(cdWorkflow.match(/app-path: deal_scale_v3/g)).toHaveLength(2);
  });
});
