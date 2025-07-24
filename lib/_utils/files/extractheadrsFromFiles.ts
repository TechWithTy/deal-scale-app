import * as Papa from 'papaparse'; // For parsing CSV files
import ExcelJS from 'exceljs';

// Helper function to extract headers from a CSV file
export const extractHeadersFromCSV = async (file: File): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    // Use Papaparse to parse the CSV file
    Papa.parse(file, {
      complete: (result) => {
        const headers = result.data[0]; // The first row in the CSV is usually the headers
        if (Array.isArray(headers)) {
          resolve(headers.map(String)); // Ensure the headers are string array
        } else {
          reject('Invalid CSV format');
        }
      },
      error: (error) => {
        reject(error.message);
      },
      header: false, // Set to false to ensure raw rows are returned
      skipEmptyLines: true // Skip empty lines
    });
  });
};

// Helper function to extract headers from an Excel file using exceljs
export const extractHeadersFromExcel = async (
  file: File
): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      const workbook = new ExcelJS.Workbook();
      try {
        const data = event.target?.result as ArrayBuffer; // Cast result to ArrayBuffer
        if (!data) return reject('File data is empty');

        // Load the workbook from the binary string
        await workbook.xlsx.load(data);

        const worksheet = workbook.worksheets[0]; // Get the first sheet
        const headers: string[] = [];

        worksheet.getRow(1).eachCell((cell) => {
          headers.push(cell.text); // Extract header text from the first row
        });

        resolve(headers);
      } catch (err) {
        reject((err as Error).message || 'Error reading Excel file');
      }
    };

    reader.onerror = () => {
      reject('Error reading the file'); // FileReader error handling
    };

    reader.readAsArrayBuffer(file); // Read the Excel file as ArrayBuffer for exceljs
  });
};

// Main function to extract headers from CSV or Excel file
export const extractHeaders = async (file: File): Promise<string[]> => {
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  if (fileExtension === 'csv') {
    return await extractHeadersFromCSV(file);
  } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
    return await extractHeadersFromExcel(file);
  } else {
    throw new Error(
      'Unsupported file format. Please upload a CSV or Excel file.'
    );
  }
};

// Usage example: Pass the File object and get the headers
// handleListUpload now directly takes a File instead of an event
export const handleListUpload = async (file: File): Promise<string[]> => {
  try {
    const headers = await extractHeaders(file); // extractHeaders works with File directly
    return headers; // Return the headers array
  } catch (error) {
    console.error('Error extracting headers:', error);
    throw new Error('Failed to extract headers from the file');
  }
};
