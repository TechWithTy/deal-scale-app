import type { DeepPartial } from "react-hook-form";
import type { CreateAssistantRequest } from "./create";

// Apply DeepPartial to CreateAssistantRequest for updates
export type UpdateAssistantRequest = DeepPartial<CreateAssistantRequest>;
