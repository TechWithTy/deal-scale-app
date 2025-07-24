import { BASE_URL, getHeaders } from '@/api/_utils/getHeaders';
import {
  AddInboundMessageRequest,
  AddInboundMessageResponse,
  AddOutboundCallRequest,
  AddOutboundCallResponse,
  CancelScheduledMessageResponse,
  GetMessagesByConversationIdResponse,
  SendMessageRequest,
  SendMessageResponse,
  UpdateMessageStatusRequest,
  UpdateMessageStatusResponse
} from '@/types/goHighLevel/text';
import axios from 'axios';

/**
 * Get messages by conversation ID.
 * @param conversationId - The ID of the conversation.
 * @param token - The access token for authorization.
 * @param lastMessageId - (Optional) The ID of the last message for pagination.
 * @param limit - (Optional) Number of messages to fetch, default is 20.
 * @param type - (Optional) Types of messages to fetch, comma-separated.
 * @returns A Promise containing the list of messages.
 */
export const getMessagesByConversationId = async (
  conversationId: string,
  token: string,
  lastMessageId?: string,
  limit: number = 20,
  type?: string
): Promise<GetMessagesByConversationIdResponse> => {
  const url = `${BASE_URL}/conversations/${conversationId}/messages`;
  const params = new URLSearchParams();
  if (lastMessageId) params.append('lastMessageId', lastMessageId);
  params.append('limit', limit.toString());
  if (type) params.append('type', type);

  const response = await axios.get(
    `${url}?${params.toString()}`,
    getHeaders(token)
  );
  return response.data;
};

/**
 * Send a new message.
 * @param data - The message data to send.
 * @param token - The access token for authorization.
 * @returns A Promise containing the response of the sent message.
 */
export const sendMessage = async (
  data: SendMessageRequest,
  token: string
): Promise<SendMessageResponse> => {
  const url = `${BASE_URL}/conversations/messages`;
  const response = await axios.post(url, data, getHeaders(token));
  return response.data;
};

/**
 * Add an inbound message.
 * @param data - The inbound message data to add.
 * @param token - The access token for authorization.
 * @returns A Promise containing the response of the added message.
 */
export const addInboundMessage = async (
  data: AddInboundMessageRequest,
  token: string
): Promise<AddInboundMessageResponse> => {
  const url = `${BASE_URL}/conversations/messages/inbound`;
  const response = await axios.post(url, data, getHeaders(token));
  return response.data;
};

export const addOutboundCall = async (
  data: AddOutboundCallRequest,
  token: string
): Promise<AddOutboundCallResponse> => {
  const url = `${BASE_URL}/conversations/messages/outbound`;
  const response = await axios.post(url, data, getHeaders(token));
  return response.data;
};

/**
 * Cancel a scheduled message.
 * @param messageId - The ID of the message to cancel.
 * @param token - The access token for authorization.
 * @returns A Promise containing the response of the cancel operation.
 */
export const cancelScheduledMessage = async (
  messageId: string,
  token: string
): Promise<CancelScheduledMessageResponse> => {
  const url = `${BASE_URL}/conversations/messages/${messageId}/schedule`;
  const response = await axios.delete(url, getHeaders(token));
  return response.data;
};

/**
 * Upload file attachments to a conversation.
 * @param conversationId - The ID of the conversation.
 * @param locationId - The location ID.
 * @param files - The files to be uploaded.
 * @param token - The access token for authorization.
 * @returns A Promise containing the uploaded file URLs.
 */
export const uploadFileAttachments = async (
  conversationId: string,
  locationId: string,
  files: File[],
  token: string
): Promise<{ uploadedFiles: Record<string, string> }> => {
  const url = `${BASE_URL}/conversations/messages/upload`;
  const formData = new FormData();

  formData.append('conversationId', conversationId);
  formData.append('locationId', locationId);
  files.forEach((file) => {
    formData.append('fileAttachment', file);
  });

  const headers = {
    ...getHeaders(token).headers,
    'Content-Type': 'multipart/form-data'
  };

  const response = await axios.post(url, formData, { headers });
  return response.data;
};

/**
 * Update the status of a message.
 * @param messageId - The ID of the message to update.
 * @param data - The status update data.
 * @param token - The access token for authorization.
 * @returns A Promise containing the updated message response.
 */
export const updateMessageStatus = async (
  messageId: string,
  data: UpdateMessageStatusRequest,
  token: string
): Promise<UpdateMessageStatusResponse> => {
  const url = `${BASE_URL}/conversations/messages/${messageId}/status`;
  const response = await axios.put(url, data, getHeaders(token));
  return response.data;
};

export const getRecordingByMessageId = async (
  messageId: string,
  locationId: string,
  token: string
): Promise<any> => {
  const url = `${BASE_URL}/conversations/messages/${messageId}/locations/${locationId}/recording`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Version: '2021-04-15'
      },
      responseType: 'blob' // This will handle the audio file
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getTranscriptionByMessageId = async (
  locationId: string,
  messageId: string,
  token: string
): Promise<any> => {
  const url = `${BASE_URL}/conversations/locations/${locationId}/messages/${messageId}/transcription`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Version: '2021-04-15'
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const downloadTranscriptionByMessageId = async (
  locationId: string,
  messageId: string,
  token: string
): Promise<Blob> => {
  const url = `${BASE_URL}/conversations/locations/${locationId}/messages/${messageId}/transcription/download`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Version: '2021-04-15'
      },
      responseType: 'blob' // This will handle the file download as a blob
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
