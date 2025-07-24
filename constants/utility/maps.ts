import { AddressCoordinate, Coordinate } from '@/types/_dashboard/maps';

export const mockFetchAddressesFromApi = async (
  addresses: string[]
): Promise<AddressCoordinate[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const coordinates: AddressCoordinate[] = addresses.map(
        (address, index) => ({
          address,
          lat: 39.7392 + index * 0.01, // Mocked latitude, incremented slightly for each address
          lng: -104.9903 + index * 0.01 // Mocked longitude, incremented slightly for each address
        })
      );
      resolve(coordinates);
    }, 1000); // Simulate network delay
  });
};

export const calculateCenter = (coordinates: Coordinate[]): Coordinate => {
  const total = coordinates.reduce(
    (acc, coord) => {
      acc.lat += coord.lat;
      acc.lng += coord.lng;
      return acc;
    },
    { lat: 0, lng: 0 }
  );

  const count = coordinates.length;

  return {
    lat: total.lat / count,
    lng: total.lng / count
  };
};
