import type React from "react";
import UploadSalesScript from "../../../utils/voice/uploadScript";

interface KnowledgeSalesScriptUploadProps {
	loading: boolean;
	handleScriptUpload: (scriptContent: string) => void;
	selectedScriptFileName: string;
}

export const KnowledgeSalesScriptUpload: React.FC<
	KnowledgeSalesScriptUploadProps
> = ({ loading, handleScriptUpload, selectedScriptFileName }) => (
	<UploadSalesScript
		onFileUpload={handleScriptUpload}
		selectedFileName={selectedScriptFileName}
	/>
);
