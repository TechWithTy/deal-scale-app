import { ASSURANCE_OBJECTS, type AssuranceObjectName } from "src/assurance/identifiers";
import { commonFields } from "src/assurance/common-fields";
import { domainFields } from "src/assurance/domain-fields";
import { relationFieldsFor, relationField } from "src/assurance/relations";

export type AssuranceField = any;

export { commonFields, relationField };

export const assuranceFieldsFor = (objectName: AssuranceObjectName): AssuranceField[] => [
  ...commonFields(ASSURANCE_OBJECTS[objectName]),
  ...domainFields[objectName](ASSURANCE_OBJECTS[objectName]),
  ...relationFieldsFor(objectName),
];
