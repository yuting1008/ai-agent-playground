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

  
  