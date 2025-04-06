import axios from 'axios';

import { Profiles } from './Profiles';

export async function createAgentSession(profiles: Profiles) {
  const agentApiKey = profiles.currentProfile?.agentApiKey;
  if (!agentApiKey) {
    alert('Agent API key not found');
    return [];
  }

  const agentApiUrl = profiles.currentProfile?.agentApiUrl;
  if (!agentApiUrl) {
    alert('agentApiUrl not found');
    return [];
  }

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
    console.log(response.data);
    return response.data?.id || '';
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error:', error.response?.data || error.message);
    } else {
      console.error('Unexpected error:', error);
    }
    return '';
  }
}

export async function getAgentSessions(profiles: Profiles) {
  const agentApiKey = profiles.currentProfile?.agentApiKey;
  if (!agentApiKey) {
    alert('Agent API key not found');
    return [];
  }

  const agentApiUrl = profiles.currentProfile?.agentApiUrl;
  if (!agentApiUrl) {
    alert('agentApiUrl not found');
    return [];
  }

  try {
    const response = await axios.get(`${agentApiUrl}/api/sessions`, {
      headers: {
        accept: 'application/json',
        'api-key': agentApiKey,
      },
      timeout: 10000,
    });
    console.log(response.data);
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

export async function getAgentMessages(profiles: Profiles, sessionId: string) {
  const agentApiKey = profiles.currentProfile?.agentApiKey;
  if (!agentApiKey) {
    alert('Agent API key not found');
    return [];
  }

  const agentApiUrl = profiles.currentProfile?.agentApiUrl;
  if (!agentApiUrl) {
    alert('agentApiUrl not found');
    return [];
  }

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

export async function clearAgentMessages(
  profiles: Profiles,
  sessionId: string,
) {
  const agentApiKey = profiles.currentProfile?.agentApiKey;
  if (!agentApiKey) {
    alert('Agent API key not found');
    return [];
  }

  const agentApiUrl = profiles.currentProfile?.agentApiUrl;
  if (!agentApiUrl) {
    alert('agentApiUrl not found');
    return [];
  }

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
    console.log(response.data);
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

export async function sendAgentMessage(
  profiles: Profiles,
  sessionId: string,
  message: string,
) {
  const agentApiKey = profiles.currentProfile?.agentApiKey;
  if (!agentApiKey) {
    alert('Agent API key not found');
    return [];
  }

  const agentApiUrl = profiles.currentProfile?.agentApiUrl;
  if (!agentApiUrl) {
    alert('agentApiUrl not found');
    return [];
  }

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
