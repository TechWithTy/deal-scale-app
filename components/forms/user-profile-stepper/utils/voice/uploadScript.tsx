import React, { useState } from 'react';
import { toast } from 'sonner';

interface UploadSalesScriptProps {
  onFileUpload: (fileContent: string) => void; // Callback to pass the file content to the parent
  selectedFileName?: string; // Optionally pass the file name from the parent
}

const UploadSalesScript: React.FC<UploadSalesScriptProps> = ({
  onFileUpload,
  selectedFileName
}) => {
  const [fileName, setFileName] = useState<string | null>(
    selectedFileName || null
  ); // Store file name
  const [fileContent, setFileContent] = useState<string | null>(null); // Store parsed content

  // Function to handle file uploads
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileType = file.name.split('.').pop()?.toLowerCase();
      if (!['txt', 'doc', 'docx'].includes(fileType || '')) {
        toast('Only .txt, .doc, or .docx files are allowed.');
        return;
      }

      setFileName(file.name); // Set the uploaded file's name

      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;

        // Handle the file content
        setFileContent(text); // Store the file content directly
        onFileUpload(text); // Pass the content to the parent component
      };
      reader.readAsText(file); // Read the file content
    }
  };

  return (
    <div className="mx-auto mt-4 max-w-3xl overflow-auto rounded-lg border border-gray-300 bg-white p-4 text-gray-900 shadow-lg dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Upload Script (.txt, .doc, .docx)
      </label>
      <input
        type="file"
        accept=".txt,.doc,.docx"
        onChange={handleFileUpload}
        className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-700 dark:text-gray-300 file:dark:bg-blue-500 dark:hover:file:bg-blue-600"
      />

      {/* Display selected file name and script content */}
      {fileName && (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Uploaded file: {fileName}
        </p>
      )}
      {fileContent && (
        <pre className="mt-4 max-h-40 overflow-auto rounded-lg border border-gray-300 bg-gray-100 p-4 text-sm dark:border-gray-600 dark:bg-gray-800">
          {fileContent}
        </pre>
      )}
    </div>
  );
};

export default UploadSalesScript;
