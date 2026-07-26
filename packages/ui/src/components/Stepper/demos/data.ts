export type OnboardingStep = {
  label: string;
  description: string;
  /** Body copy rendered inside `Stepper.Step`. */
  details: string;
  /** Icon name for the demo that overrides the step indicators. */
  icon: string;
};

export const onboardingSteps: OnboardingStep[] = [
  {
    label: 'Account',
    description: 'Create your credentials',
    details: 'Set up your sign-in information and confirm your contact details.',
    icon: 'user',
  },
  {
    label: 'Verification',
    description: 'Confirm your email',
    details: 'Check your inbox for a verification link to secure the account.',
    icon: 'mail',
  },
  {
    label: 'Preferences',
    description: 'Adjust defaults',
    details: 'Choose notification and privacy defaults for your workspace.',
    icon: 'settings',
  },
];
