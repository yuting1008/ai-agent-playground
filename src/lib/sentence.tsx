type SentenceStatus = { sentence: string; exists: boolean };

const excludePunctuation = [
  '!',
  '。',
  '？',
  '！',
  '？',
  '，',
  '，',
  ',',
  '*',
  '(',
  ')',
  '[',
  ']',
  '{',
  '}',
  '“',
  '”',
  '‘',
  '’',
  '《',
  '》',
  '【',
  '】',
  '（',
  '）',
  '【',
  '】',
  '《',
  '》',
];

const needRemoveMarks = ['，', ',', ':', '：', '(', '[', '{'];

function splitTextByFirstPunctuation(text: string): [string, string] {
  const punctuationRegex = /[,!?:;'"，。！？：；‘’“”（）【】《》]/;

  const match = text.match(punctuationRegex);

  if (match) {
    const index = match.index!;
    return [text.slice(0, index + 1), text.slice(index + 1)];
  }

  return ['', text];
}

function processSentences(inputs: string[]) {
  const result: string[] = [];

  for (const sentence of inputs) {
    let newSentence = sentence.trim();

    if (newSentence === '') {
      continue;
    }

    if (excludePunctuation.includes(newSentence)) {
      continue;
    }

    // remove all * / # in the sentence
    newSentence = newSentence.replaceAll('*', '').replaceAll('#', '');

    // If the last character is a punctuation mark, remove it
    if (needRemoveMarks.includes(newSentence[newSentence.length - 1])) {
      result.push(newSentence.slice(0, -1));
    } else {
      result.push(newSentence);
    }
  }

  return result;
}

export function processAndStoreSentence(
  input: string,
  isAvatarStarted: boolean,
  speechSentencesCacheArrayRef: React.MutableRefObject<string[]>,
): SentenceStatus[] {
  if (!input) {
    return [];
  }

  // remove all url like http, https in input
  const urlRegex = /https?:\/\/[^\s]+/g;
  input = input.replace(urlRegex, '');

  let sentences: string[] = [];

  const sentenceRegex = /.*?[.!?。！？]/g;

  if (isAvatarStarted) {
    const [firstPart, remainingPart] = splitTextByFirstPunctuation(input);
    sentences =
      remainingPart
        .match(sentenceRegex)
        ?.map((s) => s.trim())
        .filter(Boolean) || [];
    // add first part to sentences
    if (firstPart) {
      sentences.unshift(firstPart);
    }
  } else {
    sentences =
      input
        .match(sentenceRegex)
        ?.map((s) => s.trim())
        .filter(Boolean) || [];
  }

  sentences = processSentences(sentences);

  const existingSentences: string[] = speechSentencesCacheArrayRef.current;

  const result: SentenceStatus[] = sentences.map((sentence) => {
    const exists = existingSentences.includes(sentence);
    if (!exists) {
      existingSentences.push(sentence);
    }
    return { sentence, exists };
  });

  return result;
}
