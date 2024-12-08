export type GptImage = {
    prompt: string;
    b64_json: string;
}

export type GptImageAction = {
    type: 'add' | 'change' | 'delete';
    gptImage: GptImage;
}
