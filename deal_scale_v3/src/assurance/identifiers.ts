export const ASSURANCE_OBJECTS = {
  sourceConnection: "5a155913-b343-4d95-8acc-01494885db9c",
  sellerIdentity: "126c6ae7-6286-469e-b088-3a3577e347d1",
  opportunityReference: "7f1b4629-ef0b-45ea-b353-6dce36bfbd05",
  event: "0d5eb183-a406-4d44-aced-c50ca5eac5a5",
  promise: "905ba7f3-70e3-42b5-a81d-b5264b0750e5",
  conformancePolicy: "c7cf5ca5-8e2e-4c44-9b21-172ee9c2d6b4",
  detectorCandidate: "fb4a4825-210e-47be-921f-33e8d84c145f",
  assuranceCase: "779c3685-ced4-4eeb-8ba9-f5dbc4e0a037",
  evidenceReference: "474d2eda-ee5a-4722-895f-c3ec1b28f625",
  managerDisposition: "38bd8266-68f0-4e82-84e4-73f51146bda3",
  outcome: "4008dbab-a5c9-4aeb-8626-f7b6a5966c0c",
} as const;

export type AssuranceObjectName = keyof typeof ASSURANCE_OBJECTS;

export const fieldId = (objectId: string, slot: number) =>
  `${objectId.slice(0, -12)}${slot.toString(16).padStart(12, "0")}`;

export const nameFieldId = (objectId: string) => fieldId(objectId, 1);
