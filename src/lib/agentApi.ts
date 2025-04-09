import axios from 'axios';

import { Profiles } from './Profiles';

export async function getAgentSessions() {
  const profiles = new Profiles();
  const agentApiUrl = profiles.currentProfile?.agentApiUrl;
  if (!agentApiUrl) {
    throw new Error('agentApiUrl not found');
  }

  const agentApiKey = profiles.currentProfile?.agentApiKey;
  if (!agentApiKey) {
    throw new Error('agentApiKey not found');
  }

  const response = await axios.get(`${agentApiUrl}/api/sessions`, {
    headers: {
      accept: 'application/json',
      'api-key': agentApiKey,
    },
    timeout: 10000,
  });

  return response.data?.data || [];
}

export async function createAgentSession() {
  const profiles = new Profiles();
  const agentApiKey = profiles.currentProfile?.agentApiKey;
  const agentApiUrl = profiles.currentProfile?.agentApiUrl;

  try {
    const response = await axios.post(
      `${agentApiUrl}/api/sessions`,
      {},
      {
        headers: {
          accept: 'application/json',
          'api-key': agentApiKey,
        },
        timeout: 10000,
      },
    );

    return response.data?.data?.id || '';
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error:', error.response?.data || error.message);
    } else {
      console.error('Unexpected error:', error);
    }
    return '';
  }
}

export async function getAgentMessages(sessionId: string) {
  const profiles = new Profiles();
  const agentApiKey = profiles.currentProfile?.agentApiKey;
  const agentApiUrl = profiles.currentProfile?.agentApiUrl;

  try {
    const response = await axios.get(
      `${agentApiUrl}/api/sessions/${sessionId}/messages`,
      {
        headers: {
          accept: 'application/json',
          'api-key': agentApiKey,
        },
        timeout: 10000,
      },
    );

    return response.data?.data || [];
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error:', error.response?.data || error.message);
    } else {
      console.error('Unexpected error:', error);
    }
    return [];
  }
}

export async function clearAgentMessages(sessionId: string) {
  const profiles = new Profiles();
  const agentApiKey = profiles.currentProfile?.agentApiKey;
  const agentApiUrl = profiles.currentProfile?.agentApiUrl;

  try {
    const response = await axios.delete(
      `${agentApiUrl}/api/sessions/${sessionId}/messages`,
      {
        headers: {
          accept: 'application/json',
          'api-key': agentApiKey,
        },
        timeout: 10000,
      },
    );

    return response.data || [];
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error:', error.response?.data || error.message);
    } else {
      console.error('Unexpected error:', error);
    }
    return [];
  }
}

export type InputMessage = {
  role: string;
  content: string;
};

export async function sendAgentMessage(
  sessionId: string,
  message: InputMessage,
) {
  const profiles = new Profiles();
  const agentApiKey = profiles.currentProfile?.agentApiKey;
  const agentApiUrl = profiles.currentProfile?.agentApiUrl;

  try {
    const response = await axios.post(
      `${agentApiUrl}/api/sessions/${sessionId}/messages`,
      {
        session_id: sessionId,
        message: message,
      },
      {
        headers: {
          accept: 'application/json',
          'api-key': agentApiKey,
        },
        timeout: 100000,
      },
    );

    return response.data?.message || [];
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error:', error.response?.data || error.message);
    } else {
      console.error('Unexpected error:', error);
    }
    return [];
  }
}

export async function sendAgentClientToolResponseMessage(
  sessionId: string,
  call_id: string,
  output: any,
) {
  const profiles = new Profiles();
  const agentApiKey = profiles.currentProfile?.agentApiKey;
  const agentApiUrl = profiles.currentProfile?.agentApiUrl;

  try {
    const response = await axios.post(
      `${agentApiUrl}/api/sessions/${sessionId}/tools`,
      {
        session_id: sessionId,
        message: {
          call_id: call_id,
          output: JSON.stringify(output),
          type: 'function_call_output',
        },
      },
      {
        headers: {
          accept: 'application/json',
          'api-key': agentApiKey,
        },
        timeout: 100000,
      },
    );

    return response.data?.message || [];
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error:', error.response?.data || error.message);
    } else {
      console.error('Unexpected error:', error);
    }
    return [];
  }
}

export async function getSessionStates(sessionId: string) {
  const profiles = new Profiles();
  const agentApiKey = profiles.currentProfile?.agentApiKey;
  const agentApiUrl = profiles.currentProfile?.agentApiUrl;

  try {
    const response = await axios.get(
      `${agentApiUrl}/api/sessions/${sessionId}/states`,
      {
        headers: {
          accept: 'application/json',
          'api-key': agentApiKey,
        },
        timeout: 100000,
      },
    );

    return response.data?.states || {};
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error:', error.response?.data || error.message);
    } else {
      console.error('Unexpected error:', error);
    }
    return {};
  }
}

export async function updateSessionStates(
  sessionId: string,
  key: string,
  value: any,
) {
  const profiles = new Profiles();
  const agentApiKey = profiles.currentProfile?.agentApiKey;
  const agentApiUrl = profiles.currentProfile?.agentApiUrl;

  try {
    const response = await axios.post(
      `${agentApiUrl}/api/sessions/${sessionId}/states`,
      {
        session_id: sessionId,
        key: key,
        value: value,
      },
      {
        headers: {
          accept: 'application/json',
          'api-key': agentApiKey,
        },
        timeout: 100000,
      },
    );

    return response.data?.message || '';
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error:', error.response?.data || error.message);
    } else {
      console.error('Unexpected error:', error);
    }
    return '';
  }
}

export async function approveMessage(sessionId: string, messageId: string) {
  const profiles = new Profiles();
  const agentApiKey = profiles.currentProfile?.agentApiKey;
  const agentApiUrl = profiles.currentProfile?.agentApiUrl;

  try {
    const response = await axios.put(
      `${agentApiUrl}/api/sessions/${sessionId}/messages/${messageId}/approve`,
      {},
      {
        headers: {
          accept: 'application/json',
          'api-key': agentApiKey,
        },
        timeout: 100000,
      },
    );

    return response.data || {};
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error:', error.response?.data || error.message);
    } else {
      console.error('Unexpected error:', error);
    }
    return {};
  }
}

export async function rejectMessage(sessionId: string, messageId: string) {
  const profiles = new Profiles();
  const agentApiKey = profiles.currentProfile?.agentApiKey;
  const agentApiUrl = profiles.currentProfile?.agentApiUrl;

  try {
    const response = await axios.put(
      `${agentApiUrl}/api/sessions/${sessionId}/messages/${messageId}/reject`,
      {},
      {
        headers: {
          accept: 'application/json',
          'api-key': agentApiKey,
        },
        timeout: 100000,
      },
    );

    return response.data || {};
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error:', error.response?.data || error.message);
    } else {
      console.error('Unexpected error:', error);
    }
    return {};
  }
}
