<component_spec>
  <metadata>
    <component_name>DealScaleRoiCalculator</component_name>
    <package_entry>@/external/calculators</package_entry>
    <description>
      A reusable ROI dashboard that compares profile-based automations against manual campaign scenarios.
    </description>
    <status>draft</status>
    <owner>DealScale Platform</owner>
    <last_updated>2025-11-11</last_updated>
  </metadata>

  <props>
    <prop>
      <name>session</name>
      <type>{ tier?: string; quickStartDefaults?: { personaId?: string; goalId?: string } | null } | null</type>
      <required>false</required>
      <default>null</default>
      <description>Optional session context used to prefill persona, goal, and subscription tier defaults.</description>
    </prop>
    <prop>
      <name>className</name>
      <type>string</type>
      <required>false</required>
      <default>undefined</default>
      <description>Optional wrapper class that merges with the default Card styling.</description>
    </prop>
  </props>

  <design_tokens>
    <token>bg-muted</token>
    <token>border-border</token>
    <token>text-primary</token>
    <token>text-muted-foreground</token>
    <token>bg-primary/10</token>
  </design_tokens>

  <dependencies>
    <dependency>@/components/ui/card</dependency>
    <dependency>@/components/ui/collapsible</dependency>
    <dependency>@/components/ui/input</dependency>
    <dependency>@/components/ui/label</dependency>
    <dependency>@/components/ui/select</dependency>
    <dependency>@/components/ui/tabs</dependency>
    <dependency>@/lib/_utils</dependency>
    <dependency>lucide-react</dependency>
  </dependencies>

  <usage>
    <import_snippet>
      <![CDATA[
import { DealScaleRoiCalculator } from "@/external/calculators";
      ]]>
    </import_snippet>
    <example_snippet>
      <![CDATA[
<DealScaleRoiCalculator
  session={{
    tier: "Enterprise",
    quickStartDefaults: { personaId: "agent", goalId: "agent-sphere" },
  }}
/>
      ]]>
    </example_snippet>
    <notes>
      Provide session context for personalized defaults; omit to fall back to baseline persona and plan values.
    </notes>
  </usage>

  <testing>
    <strategy>unit</strategy>
    <grep>pnpm vitest run _tests/external/calculators/dealScaleRoi.test.ts --config vitest.config.ts --reporter=dot</grep>
  </testing>

  <changelog>
    <entry>
      <date>2025-11-11</date>
      <summary>Initial extraction of DealScale ROI calculator into external package.</summary>
      <author>GPT-5 Codex</author>
    </entry>
  </changelog>
</component_spec>








