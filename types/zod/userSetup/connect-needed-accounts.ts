import { OAuthService } from '@/types/userProfile/connectedAccounts';
import { z } from 'zod';

// Define a validation schema for OAuthData using zod
export const oAuthDataSchema = z.object({
  accessToken: z.string().min(1, { message: 'Access token is required' }),
  refreshToken: z.string().optional(),
  expiresIn: z
    .number()
    .positive({ message: 'Expires in must be a positive number' }),
  tokenType: z.string().min(1, { message: 'Token type is required' }),
  scope: z.string().min(1, { message: 'Scope is required' })
});

// Define a validation schema for ConnectToolsFormState
const connectToolsFormStateSchema = z.object({
  oauthData: z.record(oAuthDataSchema)
});

// Function to validate ConnectToolsFormState
export const validateConnectAccountsFormState = (
  state: any,
  requiredServices: OAuthService[]
): { field: string; error: string }[] => {
  const errors: { field: string; error: string }[] = [];

  try {
    // Validate the structure of the state
    connectToolsFormStateSchema.parse(state);

    // Ensure all required services are present
    requiredServices.forEach((service) => {
      if (service.required && !state.oauthData[service.name]) {
        errors.push({
          field: `oauthData.${service.name}`,
          error: `${service.name} OAuth data is required. Please login to ${service.name}.`
        });
      }
    });

    // If there were structural errors, they would have been caught by the parse call above
    // If we have no errors at this point, return an empty array
    return errors.length > 0 ? errors : [];
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors.map((err) => ({
        field: err.path.join('.'),
        error: err.message
      }));
    }
    return [{ field: 'Unknown', error: 'An unknown error occurred' }];
  }
};
