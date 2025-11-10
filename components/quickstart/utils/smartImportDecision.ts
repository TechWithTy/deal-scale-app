export type SmartImportDecision =
	| {
			readonly type: "crm";
			readonly toastTitle: string;
			readonly toastDescription: string;
	  }
	| {
			readonly type: "select";
			readonly toastTitle: string;
			readonly toastDescription: string;
	  }
	| {
			readonly type: "upload";
			readonly toastTitle: string;
			readonly toastDescription: string;
	  };

interface SmartImportDecisionInput {
	readonly hasConnectedCrm: boolean;
	readonly hasLeadLists: boolean;
	readonly crmDisplayLabel: string;
}

const CRM_TOAST_TITLE = "Connected CRM detected";
const SELECT_TOAST_TITLE = "Opening lead list selector...";
const SELECT_TOAST_DESCRIPTION =
	"Select from your existing lists or upload a new one";
const UPLOAD_TOAST_TITLE = "Upload your first lead list";
const UPLOAD_TOAST_DESCRIPTION = "Import leads from CSV to get started";

export const computeSmartImportDecision = ({
	hasConnectedCrm,
	hasLeadLists,
	crmDisplayLabel,
}: SmartImportDecisionInput): SmartImportDecision => {
	if (hasConnectedCrm) {
		return {
			type: "crm",
			toastTitle: CRM_TOAST_TITLE,
			toastDescription: `Review your ${crmDisplayLabel} mapping before importing.`,
		};
	}

	if (hasLeadLists) {
		return {
			type: "select",
			toastTitle: SELECT_TOAST_TITLE,
			toastDescription: SELECT_TOAST_DESCRIPTION,
		};
	}

	return {
		type: "upload",
		toastTitle: UPLOAD_TOAST_TITLE,
		toastDescription: UPLOAD_TOAST_DESCRIPTION,
	};
};
