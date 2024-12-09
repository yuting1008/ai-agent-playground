export type BellMessage = {
  prompt: string;
  b64_json: string;
};

export type BellMessageAction = {
  type: 'add' | 'change' | 'delete';
  bellMessage: BellMessage;
};
