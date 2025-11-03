/**
 * Example: Capture ICP Type During Onboarding
 *
 * This example shows how to add an ICP type selection step to your onboarding flow.
 * Once the user selects their business type, it automatically configures the
 * QuickStart Wizard to pre-select their persona.
 */

import { useState } from "react";
import { useUserProfileStore } from "@/lib/stores/user/userProfile";
import { updateProfileWithQuickStartDefaults } from "@/lib/utils/quickstart/setPersonaDefaults";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ClientType } from "@/types/user";

// ICP type options matching your QuickStart personas
const ICP_OPTIONS: Array<{
  type: ClientType;
  title: string;
  headline: string;
  description: string;
  icon: string;
}> = [
  {
    type: "investor",
    title: "Investor",
    headline: "Acquire profitable assets faster",
    description:
      "Build repeatable sourcing and outreach loops that keep your pipeline full of motivated sellers.",
    icon: "🏘️",
  },
  {
    type: "wholesaler",
    title: "Wholesaler",
    headline: "Match deals with ready buyers",
    description:
      "Prioritize high-intent leads, prep them for disposition, and automate buyer follow-up sequences.",
    icon: "🤝",
  },
  {
    type: "loan_officer",
    title: "Private Lender",
    headline: "Keep capital deployed and approvals moving",
    description:
      "Route borrowers to the right team instantly and automate the follow-up that closes loans faster.",
    icon: "💰",
  },
  {
    type: "agent",
    title: "Agent / Team",
    headline: "Multiply your listing opportunities",
    description:
      "Blend market intelligence with targeted campaigns so your team captures and nurtures every warm lead.",
    icon: "🏠",
  },
];

interface OnboardingICPStepProps {
  onComplete: () => void;
  onSkip?: () => void;
}

export function OnboardingICPStep({ onComplete, onSkip }: OnboardingICPStepProps) {
  const [selectedType, setSelectedType] = useState<ClientType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userProfile = useUserProfileStore((state) => state.userProfile);
  const updateProfile = useUserProfileStore((state) => state.updateUserProfile);

  const handleSelectType = (type: ClientType) => {
    setSelectedType(type);
  };

  const handleContinue = async () => {
    if (!selectedType || !userProfile) return;

    setIsSubmitting(true);

    try {
      // Update the user's profile with their business type
      updateProfile({
        companyInfo: {
          ...userProfile.companyInfo,
          clientType: selectedType,
        },
      });

      // This utility automatically creates quickStartDefaults
      // so the QuickStart Wizard will pre-select this persona
      updateProfileWithQuickStartDefaults(updateProfile, selectedType);

      // Optional: Send to backend/database
      // await saveUserProfile({ clientType: selectedType });

      // Move to next onboarding step
      onComplete();
    } catch (error) {
      console.error("Failed to save business type:", error);
      // Handle error (show toast, etc.)
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    // User can set this later in their profile settings
    onSkip?.();
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8">
      {/* Header */}
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Tell us who you are</h1>
        <p className="text-lg text-muted-foreground">
          So we can tailor your experience and QuickStart workflow
        </p>
      </div>

      {/* ICP Type Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {ICP_OPTIONS.map((option) => {
          const isSelected = selectedType === option.type;

          return (
            <Card
              key={option.type}
              className={`cursor-pointer transition-all ${
                isSelected
                  ? "border-primary shadow-lg ring-2 ring-primary ring-offset-2"
                  : "border-border hover:border-primary/40 hover:shadow-md"
              }`}
              onClick={() => handleSelectType(option.type)}
            >
              <CardHeader>
                <div className="flex items-start gap-3">
                  <span className="text-4xl" role="img" aria-label={option.title}>
                    {option.icon}
                  </span>
                  <div className="flex-1">
                    <CardTitle className="text-xl">{option.title}</CardTitle>
                    <CardDescription className="text-primary font-medium">
                      {option.headline}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {option.description}
                </p>
                {isSelected && (
                  <div className="mt-4">
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      ✓ Selected
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        {onSkip && (
          <Button type="button" variant="ghost" onClick={handleSkip}>
            Skip for now
          </Button>
        )}

        <div className={onSkip ? "ml-auto" : "ml-0"}>
          <Button
            type="button"
            onClick={handleContinue}
            disabled={!selectedType || isSubmitting}
            size="lg"
          >
            {isSubmitting ? "Saving..." : "Continue"}
          </Button>
        </div>
      </div>

      {/* Optional: Show how this helps */}
      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <p className="text-sm text-muted-foreground text-center">
          💡 <strong>Good to know:</strong> Your selection will personalize your QuickStart
          Wizard and recommended workflows. You can change this anytime in your profile
          settings.
        </p>
      </div>
    </div>
  );
}

/**
 * Usage in your onboarding flow:
 *
 * ```tsx
 * import { OnboardingICPStep } from './OnboardingICPStep';
 *
 * export function OnboardingWizard() {
 *   const [step, setStep] = useState(1);
 *
 *   return (
 *     <div>
 *       {step === 1 && (
 *         <OnboardingICPStep
 *           onComplete={() => setStep(2)}
 *           onSkip={() => setStep(2)}
 *         />
 *       )}
 *       {step === 2 && <NextOnboardingStep />}
 *     </div>
 *   );
 * }
 * ```
 */

