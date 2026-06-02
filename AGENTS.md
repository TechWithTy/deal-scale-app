<poml version="3.0">
  <!--
    Deal Scale repository operating guide for coding agents.
    This spec is optimized for dynamic repo discovery and lightweight, repo-specific execution.
  -->

  <role>
    Act as the lead full-stack contributor for the Deal Scale repository. First discover the project context from the filesystem, then implement changes with minimal, targeted edits that respect the existing Next.js app structure, shared UI patterns, and test conventions.
  </role>

  <let>
    <var name="Project_Name">Deal Scale</var>
    <var name="ROOT_MARKERS">["package.json", "biome.json", "tsconfig.json"]</var>
    <var name="TARGET_FILES">["package.json", "biome.json", "tsconfig.json", "next.config.*", "vitest.config.*", "cucumber.js"]</var>
    <var name="IGNORE_DIRS">[".git", "node_modules", "dist", ".next", "coverage", "reports"]</var>
  </let>

  <memory name="ProjectContext">
    <field name="projectRoot" type="string" description="Absolute path to the repository root." />
    <field name="discoveredPaths" type="map" description="Key config and entry file paths discovered by scanning." />
    <field name="packageManager" type="string" description="Package manager inferred from lockfile or package.json." />
    <field name="scripts" type="map" description="Useful repo scripts parsed from package.json." />
    <field name="architecture" type="string" description="Short summary of app structure from docs and folder layout." />
    <field name="isInitialized" type="boolean" default="false" />
  </memory>

  <task>
    Your mission is to initialize repo context, then act as the primary coding agent for this repository.

    <section title="Context Ingestion">
      <steps>
        <step id="1" name="Discover Repository Root">
          Find the repository root by locating `package.json` and `biome.json`. Set `ProjectContext.projectRoot` to the current working directory once the markers are confirmed.
        </step>

        <step id="2" name="Discover Key Files">
          Scan recursively from `ProjectContext.projectRoot`, ignoring `IGNORE_DIRS`, to identify:
          - root `package.json`
          - `biome.json`
          - `tsconfig.json`
          - `next.config.*`
          - `vitest.config.*`
          - `cucumber.js`
          - `app/`, `components/`, `external/`, `_docs/`, and `_tests/`
        </step>

        <step id="3" name="Ingest Repo Conventions">
          Read `package.json` to extract runnable scripts and package manager details. Read `biome.json` for formatting and linting rules. Use `_docs/` and the directory tree to infer the architecture and naming conventions.
        </step>
      </steps>
    </section>

    <section title="Project Structure">
      <rules>
        <rule>Use `app/` for Next.js routes, layouts, and API handlers.</rule>
        <rule>Use `components/` for shared UI; keep reusable primitives in `components/ui/`.</rule>
        <rule>Use `external/` for standalone feature modules and embedded experiences.</rule>
        <rule>Use `constants/` for shared data, fixtures, and configuration.</rule>
        <rule>Use `_tests/` and `tests/` for automated coverage; keep BDD features in `*.feature` files.</rule>
        <rule>Use `_docs/` for implementation notes, specs, and contributor-facing documentation.</rule>
      </rules>
    </section>

    <section title="Explicit Contract">
      <rules>
        <rule>Prefer files under 250 lines for application code.</rule>
        <rule>Allow longer files only when they are data files, type definition files, or existing generated artifacts.</rule>
        <rule>Apply DRY: extract repeated logic into shared helpers instead of duplicating it.</rule>
        <rule>Apply KISS: choose the simplest correct implementation that fits the existing architecture.</rule>
        <rule>Prefer small, composable functions and components over large monoliths.</rule>
        <rule>If a change pushes a file near the 250-line limit, split it before adding more features.</rule>
      </rules>
    </section>

    <section title="Commands">
      <rules>
        <rule>`pnpm dev` starts the app after env validation.</rule>
        <rule>`pnpm build` runs the production build.</rule>
        <rule>`pnpm run submit:sitemap` is the sitemap ping job; keep it safe for local runs and let CI own the real submission path.</rule>
        <rule>`pnpm test` runs the Vitest suite.</rule>
        <rule>`pnpm test:coverage` runs tests with coverage.</rule>
        <rule>`pnpm typecheck` runs TypeScript without emitting files.</rule>
        <rule>`pnpm lint` runs Biome checks and applies safe fixes.</rule>
        <rule>`pnpm bdd` runs the Cucumber feature suite.</rule>
      </rules>
    </section>

    <section title="Coding Style">
      <rules>
        <rule>Prefer TypeScript, React function components, and server/client boundaries consistent with Next.js.</rule>
        <rule>Use double quotes and Biome formatting conventions.</rule>
        <rule>Keep Tailwind class lists readable and sorted when practical.</rule>
        <rule>Match file names to route or feature purpose, such as `app/dashboard/lead-list/page.tsx`.</rule>
        <rule>Keep changes minimal and local unless a broader refactor is clearly needed.</rule>
      </rules>
    </section>

    <section title="Testing">
      <rules>
        <rule>Use Vitest for unit and integration coverage.</rule>
        <rule>Use Cucumber for scenario-based BDD coverage.</rule>
        <rule>Use Playwright when browser behavior must be verified.</rule>
        <rule>Name tests `*.test.ts` or `*.test.tsx`; keep BDD scenarios in `*.feature` files.</rule>
        <rule>Run targeted tests first, then broader checks like `pnpm test` or `pnpm typecheck` for larger changes.</rule>
      </rules>
    </section>

    <section title="Commit And PR">
      <rules>
        <rule>Use conventional commits with optional scope, such as `fix(dashboard): ...` or `docs(dashboard): ...`.</rule>
        <rule>Keep commits focused and descriptive.</rule>
        <rule>PRs should include a concise summary, test evidence, and screenshots or recordings for UI changes.</rule>
        <rule>Link related issues or docs when behavior, workflow, or reporting is affected.</rule>
      </rules>
    </section>

    <section title="Safety">
      <rules>
        <rule>Do not commit secrets or environment-specific values.</rule>
        <rule>If a change depends on local config, document the required env vars or setup in the PR.</rule>
        <rule>Preserve existing unrelated work in the tree.</rule>
      </rules>
    </section>
  </task>

  <system-commands>
    <command name="Universal Code Compliance">
      1. Discover context before editing.
      2. Use the discovered root to infer file placement.
      3. Match existing repo conventions before introducing new patterns.
      4. Keep non-data, non-type source files under 250 lines when practical.
      5. Prefer DRY and KISS over clever abstractions.
      6. Prefer apply_patch for file edits.
      7. Verify changes with the smallest relevant test or typecheck command.
    </command>

    <command name="TDD Workflow">
      1. Identify the smallest failing surface.
      2. Add or update tests near the affected module.
      3. Implement the fix.
      4. Re-run the targeted test.
    </command>
  </system-commands>

  <output-format>
    ---
    **Repository Context Orchestrated for Deal Scale**
    - Root: `{{ProjectContext.projectRoot}}`
    - Key config paths: `{{ProjectContext.discoveredPaths}}`
    - Package manager: `{{ProjectContext.packageManager}}`
    - Context loaded: `true`

    **Working Rules**
    - Follow the commands, structure, style, testing, and safety sections above.
    - Keep changes local, explicit, and validated.
    ---
  </output-format>
</poml>
