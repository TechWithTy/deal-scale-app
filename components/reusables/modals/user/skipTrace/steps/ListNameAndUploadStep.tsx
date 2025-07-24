import { Input } from "@/components/ui/input";
import type { FC } from "react";
import type { DropzoneInputProps, DropzoneRootProps } from "react-dropzone";

interface ListNameAndUploadStepProps {
	listName: string;
	onListNameChange: (value: string) => void;
	uploadedFile: File | null;
	onFileDrop: (file: File) => void;
	error?: string | null;
	listNameError?: string;
	fileError?: string;
	getRootProps: () => DropzoneRootProps;
	getInputProps: () => DropzoneInputProps;
}

const ListNameAndUploadStep: FC<ListNameAndUploadStepProps> = ({
	listName,
	onListNameChange,
	uploadedFile,
	error,
	listNameError,
	fileError,
	getRootProps,
	getInputProps,
}) => (
	<>
		<div>
			<label
				htmlFor="listName"
				className="block font-medium text-gray-700 text-sm dark:text-gray-300"
			>
				List Name*
			</label>
			<Input
				id="listName"
				placeholder="Give your list a friendly name"
				value={listName}
				onChange={(e) => onListNameChange(e.target.value)}
			/>
			{listNameError && <p className="text-red-500 text-sm">{listNameError}</p>}
		</div>
		<div className="mt-4">
			<label
				htmlFor="skipTracedList"
				className="block font-medium text-gray-700 text-sm dark:text-gray-300"
			>
				Skip-traced list*
			</label>
			<div
				{...getRootProps()}
				className="mt-2 cursor-pointer rounded border-2 border-gray-300 border-dashed p-4 dark:border-gray-600"
			>
				<input id="skipTracedList" {...getInputProps()} />
				{uploadedFile ? (
					<p>{uploadedFile.name}</p>
				) : (
					<p>Provide a valid List Name to enable uploading</p>
				)}
			</div>
			{fileError && <p className="text-red-500 text-sm">{fileError}</p>}
			{error && <p className="text-red-500 text-sm">{error}</p>}
		</div>
	</>
);

export default ListNameAndUploadStep;
