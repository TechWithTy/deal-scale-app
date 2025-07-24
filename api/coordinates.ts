import axios from 'axios';

interface LatLng {
  lat: number;
  lng: number;
}

// Function to get latitude and longitude from an address using Google Geocoding API
const getLatLngFromAddress = async (
  address: string,
  apiKey: string
): Promise<LatLng | null> => {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        address
      )}&key=${apiKey}`
    );
    const data = response.data;
    if (data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return { lat: location.lat, lng: location.lng };
    } else {
      console.error('No results found for the address:', address);
      return null;
    }
  } catch (error) {
    console.error('Error fetching geocode data:', error);
    return null;
  }
};

// Function to convert multiple addresses to markers
export const convertAddressesToMarkers = async (
  addresses: string[],
  apiKey: string
): Promise<LatLng[]> => {
  const markerPromises = addresses.map((address) =>
    getLatLngFromAddress(address, apiKey)
  );
  const markers = await Promise.all(markerPromises);
  return markers.filter((marker): marker is LatLng => marker !== null); // Filter out null values
};
