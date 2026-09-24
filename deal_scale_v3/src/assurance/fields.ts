import { FieldType, RelationType } from "twenty-sdk/define";

import { fieldId, nameFieldId } from "src/assurance/identifiers";

const selectOptions = (values: string[]) =>
  values.map((value, position) => ({
    position,
    label: value,
    value,
    color: (position % 2 === 0 ? "blue" : "green") as "blue" | "green",
  }));

export const commonFields = (objectId: string) => [
  {
    universalIdentifier: nameFieldId(objectId),
    type: FieldType.TEXT as const,
    name: "name",
    label: "Name",
    description: "Stable human-readable label for the assurance record",
    isSearchable: true,
  },
  {
    universalIdentifier: fieldId(objectId, 2),
    type: FieldType.TEXT as const,
    name: "externalId",
    label: "External ID",
    description: "Stable identifier from the source system",
    isUnique: true,
    isSearchable: true,
  },
  {
    universalIdentifier: fieldId(objectId, 3),
    type: FieldType.TEXT as const,
    name: "workspaceId",
    label: "Workspace ID",
    description: "Tenant scope carried with every assurance record",
    isSearchable: true,
  },
  {
    universalIdentifier: fieldId(objectId, 4),
    type: FieldType.SELECT as const,
    name: "provenanceState",
    label: "Provenance State",
    options: selectOptions(["observed", "inferred"]),
  },
  {
    universalIdentifier: fieldId(objectId, 5),
    type: FieldType.TEXT as const,
    name: "provenanceRef",
    label: "Provenance Reference",
    description: "Source locator or derivation reference",
  },
  {
    universalIdentifier: fieldId(objectId, 6),
    type: FieldType.TEXT as const,
    name: "sourceVersion",
    label: "Source Version",
    description: "Version of the upstream payload or contract",
  },
  {
    universalIdentifier: fieldId(objectId, 7),
    type: FieldType.NUMBER as const,
    name: "recordVersion",
    label: "Record Version",
    description: "Monotonic version used for idempotent upserts",
    defaultValue: 1,
  },
  {
    universalIdentifier: fieldId(objectId, 8),
    type: FieldType.DATE_TIME as const,
    name: "observedAt",
    label: "Observed At",
  },
];

export const relationField = ({
  objectId,
  slot,
  name,
  label,
  targetObjectId,
}: {
  objectId: string;
  slot: number;
  name: string;
  label: string;
  targetObjectId: string;
}) => ({
  universalIdentifier: fieldId(objectId, slot),
  type: FieldType.RELATION as const,
  name,
  label,
  relationTargetObjectMetadataUniversalIdentifier: targetObjectId,
  relationTargetFieldMetadataUniversalIdentifier: nameFieldId(targetObjectId),
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE as const,
    joinColumnName: `${name}Id`,
  },
});
