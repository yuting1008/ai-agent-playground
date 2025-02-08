export type RealtimeEvent = {
  time: string;
  source: 'client' | 'server';
  count?: number;
  event: { [key: string]: any };
};

type TokenDetails = {
  text_tokens: number;
  audio_tokens: number;
};

type CachedTokenDetails = TokenDetails;

type InputTokenDetails = TokenDetails & {
  cached_tokens: number;
  cached_tokens_details: CachedTokenDetails;
};

type OutputTokenDetails = TokenDetails;

export type RealtimeTokenUsage = {
  total_tokens: number;
  input_tokens: number;
  output_tokens: number;
  input_token_details: InputTokenDetails;
  output_token_details: OutputTokenDetails;
};
