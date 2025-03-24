import { AzureOpenAI } from 'openai';
import { Profiles } from './Profiles';

export const getOpenAIClientSSt = (ttsApiKey: string, ttsTargetUri: string) => {
  if (!ttsApiKey || !ttsTargetUri) {
    return null;
  }

  const urlInfo = extractUrlInfo(ttsTargetUri);
  const deployment = urlInfo?.deployment;
  const endpoint = urlInfo?.endpoint;
  const apiVersion = urlInfo?.apiVersion;

  return new AzureOpenAI({
    endpoint: endpoint,
    apiVersion: apiVersion,
    apiKey: ttsApiKey,
    deployment: deployment,
    dangerouslyAllowBrowser: true,
  });
};

export function parseOpenaiSetting(targetUri: string) {
  const urlInfo = extractUrlInfo(targetUri);
  const deployment = urlInfo?.deployment || '';
  const modelName = urlInfo?.deployment || '';
  const endpoint = urlInfo?.endpoint || '';
  const apiVersion = urlInfo?.apiVersion || '';
  return { deployment, modelName, endpoint, apiVersion };
}

export const getOpenAIClient = () => {
  const profiles = new Profiles();
  const profile = profiles.currentProfile;

  const completionApiKey = profile?.completionApiKey || '';
  const completionTargetUri = profile?.completionTargetUri || '';

  if (!completionApiKey || !completionTargetUri) {
    throw new Error(
      'Missing API key or target URI, Please check your settings',
    );
  }

  const { deployment, endpoint, apiVersion } =
    parseOpenaiSetting(completionTargetUri);

  return new AzureOpenAI({
    endpoint: endpoint,
    apiVersion: apiVersion,
    apiKey: completionApiKey,
    deployment: deployment,
    dangerouslyAllowBrowser: true,
  });
};

export function extractUrlInfo(
  url: string,
): { deployment: string; apiVersion: string; endpoint: string } | null {
  const urlObj = new URL(url);

  // Extract deployment from the path
  const pathSegments = urlObj.pathname.split('/');
  const deploymentIndex = pathSegments.indexOf('deployments');
  const deployment =
    deploymentIndex !== -1 ? pathSegments[deploymentIndex + 1] : null;

  // Extract api-version from query parameters
  const apiVersion = urlObj.searchParams.get('api-version');

  // Extract endpoint
  const endpoint = `${urlObj.protocol}//${urlObj.host}`;

  if (!deployment || !apiVersion) {
    throw new Error('Required values missing in the URL.');
  }

  return { deployment, apiVersion, endpoint };
}

export async function getCompletion(messages: any): Promise<string> {
  const profiles = new Profiles();
  const profile = profiles.currentProfile;

  const completionApiKey = profile?.completionApiKey || '';
  const completionTargetUri = profile?.completionTargetUri || '';

  if (!completionApiKey || !completionTargetUri) {
    return 'Missing API key or target URI, Please check your settings';
  }

  const headers = {
    'Content-Type': 'application/json',
    'api-key': completionApiKey,
  };

  const raw = JSON.stringify({
    messages: messages,
  });

  try {
    const response = await fetch(completionTargetUri, {
      method: 'POST',
      headers: headers,
      body: raw,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    if (data?.error) {
      console.log(data?.error);
      return data?.error?.message || 'error';
    }

    return data?.choices[0]?.message?.content || 'error';
  } catch (error) {
    console.error('Error fetching completion:', error);
    return 'Error fetching completion';
  }
}

export async function getJsonData(messages: any): Promise<string> {
  const profiles = new Profiles();
  const profile = profiles.currentProfile;

  const completionApiKey = profile?.completionApiKey || '';
  const completionTargetUri = profile?.completionTargetUri || '';

  if (!completionApiKey || !completionTargetUri) {
    return 'Missing API key or target URI, Please check your settings';
  }

  const headers = {
    'Content-Type': 'application/json',
    'api-key': completionApiKey,
  };

  const raw = JSON.stringify({
    messages: messages,
  });

  try {
    const response = await fetch(completionTargetUri, {
      method: 'POST',
      headers: headers,
      body: raw,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data?.choices[0]?.message?.content || 'error';
  } catch (error) {
    console.error('Error fetching completion:', error);
    return 'Error fetching completion';
  }
}

export async function getImages(prompt: string, n: number = 1): Promise<any> {
  const profiles = new Profiles();
  const profile = profiles.currentProfile;

  const dallApiKey = profile?.dallApiKey || '';
  const dallTargetUri = profile?.dallTargetUri || '';

  if (!dallApiKey || !dallTargetUri) {
    return 'Missing API key or target URI, Please check your settings';
  }

  const headers = {
    'Content-Type': 'application/json',
    'api-key': dallApiKey,
  };

  try {
    const response = await fetch(dallTargetUri, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        prompt: prompt,
        n: n,
        size: '1024x1024',
        response_format: 'b64_json',
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    data.prompt = prompt;

    return {
      ...data,
      prompt: prompt,
    };
  } catch (error) {
    console.error('Error fetching completion:', error);
    return {
      error: 'Error fetching completion',
      prompt: prompt,
      data: [],
    };
  }
}

export async function editImages(
  prompt: string,
  image_base_64: string,
): Promise<any> {
  const profiles = new Profiles();
  const profile = profiles.currentProfile;

  const completionApiKey = profile?.completionApiKey || '';
  const completionTargetUri = profile?.completionTargetUri || '';

  if (!completionApiKey || !completionTargetUri) {
    return 'Missing API key or target URI, Please check your settings';
  }

  const headers = {
    'Content-Type': 'application/json',
    'api-key': completionApiKey,
  };

  // image_base_64 to io read
  const base64 = image_base_64.split(',')[1];
  const imageData = atob(base64);
  const uint8Array = new Uint8Array(imageData.length);

  for (let i = 0; i < imageData.length; i++) {
    uint8Array[i] = imageData.charCodeAt(i);
  }

  const imageBlob = new Blob([uint8Array], { type: 'image/png' });

  try {
    const response = await fetch(completionTargetUri, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        image: imageBlob,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    data.prompt = prompt;

    return {
      ...data,
      prompt: prompt,
    };
  } catch (error) {
    console.error('Error fetching completion:', error);
    return {
      error: 'Error fetching completion',
      prompt: prompt,
      data: [],
    };
  }
}

export async function image_vision(image_base_64: string) {
  try {
    const messages = [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Can you describe what you saw? `,
          },
          {
            type: 'image_url',
            image_url: {
              url: image_base_64,
            },
          },
        ],
      },
    ];

    const resp = await getCompletion(messages);

    return { message: resp };
  } catch (error) {
    console.error('vision error', error);
    return { error: error };
  }
}
