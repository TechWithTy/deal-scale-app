import type React from "react";
import { UploadEmailBody } from "../../../utils/voice/uploadEmailBody";

interface KnowledgeEmailUploadProps {
	loading: boolean;
	handleEmailUpload: (emailContent: string) => void;
	selectedEmailFileName: string;
}

export const KnowledgeEmailUpload: React.FC<KnowledgeEmailUploadProps> = ({
	loading,
	handleEmailUpload,
	selectedEmailFileName,
}) => (
	<UploadEmailBody
		onFileUpload={handleEmailUpload}
		selectedFileName={selectedEmailFileName}
	/>
);
