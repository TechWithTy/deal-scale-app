import { BASE_URL, getHeaders } from '@/api/_utils/getHeaders';
import axios from 'axios';

/**
 * Get a list of all owned and imported snapshots.
 * @param token - Access token.
 * @param companyId - The company ID.
 * @returns A Promise containing the list of snapshots.
 */
export const getSnapshots = async (
  token: string,
  companyId: string
): Promise<any> => {
  const url = `${BASE_URL}/snapshots/?companyId=${companyId}`;
  const response = await axios.get(url, getHeaders(token));
  return response.data;
};

interface CreateSnapshotShareLinkRequest {
  snapshot_id: string;
  share_type: 'link' | 'permanent_link' | 'agency_link' | 'location_link';
  relationship_number?: string;
  share_location_id?: string;
}

/**
 * Create a share link for a snapshot.
 * @param token - Access token.
 * @param companyId - The company ID.
 * @param data - Request body for creating the share link.
 * @returns A Promise containing the shared link information.
 */
export const createSnapshotShareLink = async (
  token: string,
  companyId: string,
  data: CreateSnapshotShareLinkRequest
): Promise<any> => {
  const url = `${BASE_URL}/snapshots/share/link?companyId=${companyId}`;
  const response = await axios.post(url, data, getHeaders(token));
  return response.data;
};
