import { HTTPException } from 'hono/http-exception';
import {
  Business,
  BusinessPayload,
  BusinessPayloadSchema,
  BusinessSchema
} from './schema';
import { StatusCode } from 'hono/utils/http-status';

const baseUrl = 'https://services.leadconnectorhq.com/businesses';

const headers = (accessToken: string) => ({
  Authorization: `Bearer ${accessToken}`,
  Accept: 'application/json',
  'Content-Type': 'application/json',
  Version: '2021-07-28'
});

const getBusiness = async (accessToken: string, id: string) => {
  const req = `${baseUrl}/${id}/`;
  try {
    const response = await fetch(req, {
      method: 'GET',
      headers: headers(accessToken)
    });
    if (response.status !== 200) {
      throw new HTTPException(response.status as StatusCode, {
        message: `Failed to get business: ${response.statusText}`
      });
    }
    const data = await response.json();
    return BusinessSchema.parse(data.business) as Business;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const getBusinessesByLocation = async (
  accessToken: string,
  locationId: string
) => {
  const req = `${baseUrl}/?locationId=${locationId}`;
  try {
    const response = await fetch(req, {
      method: 'GET',
      headers: headers(accessToken)
    });
    if (response.status !== 200) {
      throw new HTTPException(response.status as StatusCode, {
        message: `Failed to get business: ${response.statusText}`
      });
    }
    const data = await response.json();
    return data.businesses;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
const createBusiness = async (
  accessToken: string,
  payload: BusinessPayload
) => {
  try {
    const validatedPayload = BusinessPayloadSchema.parse(payload);
    const response = await fetch(`${baseUrl}/`, {
      method: 'POST',
      headers: headers(accessToken),
      body: JSON.stringify(validatedPayload)
    });
    if (response.status !== 201) {
      throw new HTTPException(response.status as StatusCode, {
        message: `Failed to create business: ${response.statusText}`
      });
    }
    const data = await response.json();
    return BusinessSchema.parse(data.business) as Business;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const updateBusiness = async (
  accessToken: string,
  id: string,
  payload: BusinessPayload
) => {
  const req = `${baseUrl}/${id}/`;
  try {
    let validatedPayload = BusinessPayloadSchema.parse(payload);
    let updatePayload = {
      ...validatedPayload
    } as any;
    if (validatedPayload.locationId) delete updatePayload.locationId;
    const response = await fetch(req, {
      method: 'PUT',
      headers: headers(accessToken),
      body: JSON.stringify(updatePayload)
    });

    if (response.status !== 200) {
      throw new HTTPException(response.status as StatusCode, {
        message: `Failed to update business: ${response.statusText}`
      });
    }
    const data = await response.json();
    return BusinessSchema.parse(data.business) as Business;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const deleteBusiness = async (accessToken: string, id: string) => {
  const req = `${baseUrl}/${id}/`;
  try {
    const response = await fetch(req, {
      method: 'DELETE',
      headers: headers(accessToken)
    });
    if (response.status !== 200) {
      throw new HTTPException(response.status as StatusCode, {
        message: `Failed to delete business: ${response.statusText}`
      });
    }
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export {
  getBusiness,
  createBusiness,
  updateBusiness,
  getBusinessesByLocation,
  deleteBusiness
};
