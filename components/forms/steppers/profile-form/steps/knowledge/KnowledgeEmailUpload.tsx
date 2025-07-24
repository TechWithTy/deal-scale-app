import type React from "react";
import { UploadEmailBody } from "../../../utils/voice/uploadEmailBody";

interface KnowledgeEmailUploadProps {
	loading: boolean;
	handleEmailUpload: (emailContent: string) => void;
	selectedEmailFileName: string;
	disabled?: boolean; // * disables upload, shows overlay
}

export const KnowledgeEmailUpload: React.FC<KnowledgeEmailUploadProps> = ({
	loading,
	handleEmailUpload,
	selectedEmailFileName,
	disabled = false,
}) => (
	<UploadEmailBody
		onFileUpload={handleEmailUpload}
		selectedFileName={selectedEmailFileName}
		disabled={disabled}
	/>
);
