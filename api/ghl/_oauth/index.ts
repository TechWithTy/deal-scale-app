import {
  BASE_URL,
  InstalledLocationsParams,
  LocationTokenRequest,
  clientCredentials,
  getAccessToken,
  getHeaders,
  installedLocationsParams,
  token
} from '@/api/_utils/getHeaders';
import axios from 'axios';

/**
 * Get location access token using an agency token.
 * @param token - The agency access token.
 * @param data - The request body containing company and location IDs.
 * @returns A Promise containing the location access token response.
 */
export const getLocationAccessToken = async (
  token: string,
  data: LocationTokenRequest
): Promise<any> => {
  const url = `${BASE_URL}/oauth/locationToken`;
  const response = await axios.post(url, data, getHeaders(token));
  return response.data;
};

/**
 * Get locations where the app is installed.
 * @param token - The access token.
 * @param params - The query parameters for filtering installed locations.
 * @returns A Promise containing the installed locations response.
 */
export const getInstalledLocations = async (
  token: string,
  params: InstalledLocationsParams
): Promise<any> => {
  // Convert params to a string-only record, filtering out undefined values
  const urlParams = new URLSearchParams(
    Object.entries(params)
      .filter(([_, value]) => value !== undefined)
      .reduce<Record<string, string>>((acc, [key, value]) => {
        acc[key] = String(value);
        return acc;
      }, {})
  ).toString();

  const url = `${BASE_URL}/oauth/installedLocations?${urlParams}`;
  const response = await axios.get(url, getHeaders(token));
  return response.data;
};

// Get Access Token
getAccessToken(clientCredentials)
  .then((response) => console.log('Access Token:', response))
  .catch((error) => console.error('Error fetching access token:', error));

const locationTokenData = {
  companyId: 'your-company-id',
  locationId: 'your-location-id'
};

// Get Location Access Token
getLocationAccessToken(token, locationTokenData)
  .then((response) => console.log('Location Access Token:', response))
  .catch((error) =>
    console.error('Error fetching location access token:', error)
  );

// Define installedLocationsParams with limit as a number

// Fetch Installed Locations
async function fetchInstalledLocations() {
  try {
    const response = await getInstalledLocations(
      token,
      installedLocationsParams
    );
    console.log('Installed Locations:', response);
  } catch (error) {
    console.error('Error fetching installed locations:', error);
  }
}

fetchInstalledLocations();
