export const delayFunction = function delay(ms: number) {
  return new Promise(resolve => {
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
    '\'': '&#39;',
    '/': '&#x2F;'
  };
  return String(text).replace(/[&<>"'\/]/g, (match) => entityMap[match]);
};

export function avgLatency(array: number[]) {
  return Math.round(array.reduce((sum, latency) => sum + latency, 0) / array.length * 100) / 100;
}

export function calculatePercentiles(latencyArray: number[], percentiles: number[] = [0.5, 0.9, 0.95, 0.99]) {
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
    const index = (percentile * (sortedArray.length - 1));
    const floorIndex = Math.floor(index);
    const ceilIndex = Math.ceil(index);

    if (floorIndex === ceilIndex) {
      // round 5
      result[`P${percentile * 100}`] = Math.round(sortedArray[floorIndex] * 100) / 100;
    } else {
      const fraction = index - floorIndex;
      result[`P${percentile * 100}`] = Math.round((sortedArray[floorIndex] + fraction * (sortedArray[ceilIndex] - sortedArray[floorIndex])) * 100) / 100;
    }
  });

  return result;
}
