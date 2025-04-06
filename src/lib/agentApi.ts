import { Profiles } from './Profiles';

import axios from 'axios';

export async function getAgentMessages(profiles: Profiles) {
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

  const sessionId = '26ba0c52725340d5b2aa15594d0ebfcf';

  try {
    const response = await axios.get(
      `${agentApiUrl}/api/sessions/${sessionId}/messages`,
      {
        headers: {
          accept: 'application/json',
          'api-key': agentApiKey,
        },
      },
    );
    console.log(response.data);
    return response.data?.messages || [];
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error:', error.response?.data || error.message);
    } else {
      console.error('Unexpected error:', error);
    }
    return [];
  }
}
