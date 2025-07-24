import React from 'react';

interface MLSData {
  mls: string;
  mls_id: string;
  list_date: string;
  list_price: number;
  sold_price: number;
  status: string;
  property_url: string;
}

interface MLSTableProps {
  mlsData: MLSData;
}

const MLSTableComponent: React.FC<MLSTableProps> = ({ mlsData }) => {
  return (
    <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800 dark:shadow-lg">
      <h2 className="mb-4 text-xl font-bold dark:text-white">
        MLS Information
      </h2>
      <table className="w-full table-auto text-left">
        <tbody>
          <tr className="border-b dark:border-gray-700">
            <td className="font-semibold text-gray-500 dark:text-gray-400">
              MLS:
            </td>
            <td className="dark:text-gray-300">{mlsData.mls || 'N/A'}</td>
          </tr>
          <tr className="border-b dark:border-gray-700">
            <td className="font-semibold text-gray-500 dark:text-gray-400">
              MLS ID:
            </td>
            <td className="dark:text-gray-300">{mlsData.mls_id || 'N/A'}</td>
          </tr>
          <tr className="border-b dark:border-gray-700">
            <td className="font-semibold text-gray-500 dark:text-gray-400">
              List Date:
            </td>
            <td className="dark:text-gray-300">{mlsData.list_date || 'N/A'}</td>
          </tr>
          <tr className="border-b dark:border-gray-700">
            <td className="font-semibold text-gray-500 dark:text-gray-400">
              List Price:
            </td>
            <td className="dark:text-gray-300">
              {mlsData.list_price
                ? `$${mlsData.list_price.toLocaleString()}`
                : 'N/A'}
            </td>
          </tr>
          <tr className="border-b dark:border-gray-700">
            <td className="font-semibold text-gray-500 dark:text-gray-400">
              Sold Price:
            </td>
            <td className="dark:text-gray-300">
              {mlsData.sold_price
                ? `$${mlsData.sold_price.toLocaleString()}`
                : 'N/A'}
            </td>
          </tr>
          <tr className="border-b dark:border-gray-700">
            <td className="font-semibold text-gray-500 dark:text-gray-400">
              Status:
            </td>
            <td className="dark:text-gray-300">{mlsData.status || 'N/A'}</td>
          </tr>
          <tr className="border-b dark:border-gray-700">
            <td className="font-semibold text-gray-500 dark:text-gray-400">
              Property URL:
            </td>
            <td className="dark:text-gray-300">
              <a
                href={mlsData.property_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400"
              >
                {mlsData.property_url ? 'View Property' : 'N/A'}
              </a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default MLSTableComponent;
