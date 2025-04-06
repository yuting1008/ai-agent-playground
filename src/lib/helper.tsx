import {
  ItemType,
  ToolDefinitionType,
} from '@theodoreniu/realtime-api-beta/dist/lib/client';
import { DEEPSEEK_FUNCTION_CALL_ENABLE } from './const';
import * as load_functions from '../tools/load_functions';
import { Profiles } from './Profiles';

export const delayFunction = function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

export const htmlEncodeAvatar = (text: string): string => {
  // remove all can't speak characters
  text = text.replace(/\*/g, '');

  const entityMap: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
  };
  return String(text).replace(/[&<>"'\/]/g, (match) => entityMap[match]);
};

export function avgLatency(array: number[]) {
  return (
    Math.round(
      (array.reduce((sum, latency) => sum + latency, 0) / array.length) * 100,
    ) / 100
  );
}

export function lastMessageIsUserMessage(items: ItemType[]) {
  if (items.length > 0) {
    const lastItem: ItemType = items[items.length - 1];
    if (lastItem?.role === 'user' && lastItem?.type === 'message') {
      return true;
    }
  }
  return false;
}

export function lastAgentMessageIsUserMessage(items: any[]) {
  if (items.length > 0) {
    const lastItem: any = items[items.length - 1];
    if (lastItem?.content?.role === 'user') {
      return true;
    }
  }
  return false;
}

export function enableFunctionCalling() {
  const profiles = new Profiles();
  const profile = profiles.currentProfile;

  if (!profile?.isDeepSeek) {
    return true;
  }

  const deepSeekFunctionCallingEnable =
    profile?.deepSeekFunctionCalling === DEEPSEEK_FUNCTION_CALL_ENABLE;

  return deepSeekFunctionCallingEnable;
}

export function calculatePercentiles(
  latencyArray: number[],
  percentiles: number[] = [0.5, 0.9, 0.95, 0.99],
) {
  // console.log('calculatePercentiles', latencyArray);
  if (latencyArray.length === 0) {
    const result: { [key: string]: number } = {};
    percentiles.forEach((p) => {
      // round 5
      result[`P${p * 100}`] = Math.round(0 * 100) / 100;
    });
    return result;
  }

  const sortedArray = latencyArray.slice().sort((a, b) => a - b);

  const result: { [key: string]: number } = {};
  percentiles.forEach((percentile) => {
    const index = percentile * (sortedArray.length - 1);
    const floorIndex = Math.floor(index);
    const ceilIndex = Math.ceil(index);

    if (floorIndex === ceilIndex) {
      // round 5
      result[`P${percentile * 100}`] =
        Math.round(sortedArray[floorIndex] * 100) / 100;
    } else {
      const fraction = index - floorIndex;
      result[`P${percentile * 100}`] =
        Math.round(
          (sortedArray[floorIndex] +
            fraction * (sortedArray[ceilIndex] - sortedArray[floorIndex])) *
            100,
        ) / 100;
    }
  });

  return result;
}

export async function getPromptFromUrl() {
  const profiles = new Profiles();
  const profile = profiles.currentProfile;

  const oldPrompt = profile?.prompt || '';
  const promptUrl = profile?.promptUrl || '';
  try {
    if (promptUrl) {
      const result = await fetch(promptUrl).then((res) => res.text());

      if (result !== oldPrompt) {
        alert('Prompt updated, will refresh the page.');

        if (profile) {
          profile.prompt = result;
          profiles.save();
        }

        window.location.reload();
      }
      return result;
    }
  } catch (error) {
    console.error(`Failed to get prompt from url: ${promptUrl}`);
    console.error(error);
    alert(`Failed to get prompt from url: ${promptUrl}`);
  }

  return profile?.prompt || '';
}

export async function getFunctionsFromUrl() {
  const profiles = new Profiles();
  const profile = profiles.currentProfile;

  const oldFunctions = profile?.functions || '';
  const functionsUrl = profile?.functionsUrl || '';
  try {
    if (functionsUrl) {
      const result = await fetch(functionsUrl).then((res) => res.text());

      if (result !== oldFunctions) {
        alert('Functions updated, will refresh the page.');

        if (profile) {
          profile.functions = result;
          profiles.save();
        }

        window.location.reload();
      }
      return result;
    }
  } catch (error) {
    console.error(`Failed to get functions from url: ${functionsUrl}`);
    console.error(error);
    alert(`Failed to get functions from url: ${functionsUrl}`);
  }

  return profile?.functions || '';
}

export function loadFunctions() {
  const profiles = new Profiles();
  const profile = profiles.currentProfile;

  const functions = profile?.functions;
  if (!functions) {
    return [];
  }

  try {
    const tempFunctions: [ToolDefinitionType, Function][] = [];
    const functionsArray = JSON.parse(functions);
    for (const functionItem of functionsArray) {
      const alreadyExists = tempFunctions.find(
        (tool) => tool[0].name === functionItem.function.name,
      );
      if (alreadyExists) {
        continue;
      }
      console.log(functionItem.function.name);
      tempFunctions.push([functionItem.function, load_functions.handler]);
    }
    tempFunctions.sort((a, b) => a[0].name.localeCompare(b[0].name));
    return tempFunctions;
  } catch (error: any) {
    console.log('load functions failed');
    console.error(error);
  }

  return [];
}

export function svgToBase64(xml: string) {
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(xml)))}`;
}
