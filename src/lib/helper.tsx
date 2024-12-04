export const delayFunction = function delay(ms: number) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
};