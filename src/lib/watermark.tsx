interface WatermarkOptions {
  watermarkText: string;
  fontSize?: number;
  fontColor?: string;
  xOffset?: number;
  yOffset?: number;
  fontFamily?: string;
}

export function addTextWatermarkToBase64(
  base64Image: string,
  options: WatermarkOptions,
): Promise<string> {
  const {
    watermarkText,
    fontSize = 20,
    fontColor = 'rgba(255,255,255,0.8)',
    xOffset = 10,
    yOffset = 30,
    fontFamily = 'Arial',
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = base64Image;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Unable to get 2D context'));

      ctx.drawImage(img, 0, 0);
      ctx.font = `${fontSize}px ${fontFamily}`;
      ctx.fillStyle = fontColor;
      ctx.textBaseline = 'top';

      ctx.fillText(watermarkText, xOffset, yOffset);

      const newBase64 = canvas.toDataURL('image/png');
      resolve(newBase64);
    };

    img.onerror = (err) => {
      reject(err);
    };
  });
}
