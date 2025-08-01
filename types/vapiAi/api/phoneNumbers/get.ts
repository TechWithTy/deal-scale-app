// Reusing existing type from your system

import type { CreatePhoneNumberResponse } from "./create";

// We don't need to declare a new type as the response is the same
export type GetPhoneNumberResponse = CreatePhoneNumberResponse;
