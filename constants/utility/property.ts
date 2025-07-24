export const calculateOwnershipLength = (lastSoldDate: string | null) => {
  if (!lastSoldDate) return 'Unknown';
  const soldDate = new Date(lastSoldDate);
  const currentDate = new Date();
  const ownershipYears = currentDate.getFullYear() - soldDate.getFullYear();
  return ownershipYears > 0 ? `${ownershipYears} Years` : 'Less than a year';
};

export const convertSqftToAcres = (sqft: number | null) => {
  if (sqft === null || sqft === undefined) {
    return 'N/A'; // Return 'N/A' if the sqft is null or undefined
  }
  return (sqft / 43560).toFixed(2); // Convert sqft to acres if valid
};
