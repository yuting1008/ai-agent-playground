import React, { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { useContexts } from './AppProvider';
import { htmlEncodeAvatar } from '../lib/helper';
import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';

type SentenceStatus = { sentence: string; exists: boolean };

interface AvatarContextType {
  speakAvatar: (spokenText: string) => Promise<void>;
  stopAvatarSpeaking: () => Promise<void>;
  needSpeechQueue: string[];
  setNeedSpeechQueue: (queue: string[]) => void;
  needSpeechQueueRef: React.MutableRefObject<string[]>;
}

const AvatarContext = createContext<AvatarContextType | undefined>(undefined);

export const AvatarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { avatarSynthesizerRef, isAvatarStarted,
    setIsAvatarSpeaking, avatarSpeechSentencesArrayRef,
    assistantResponseBuffer } = useContexts();

  const [needSpeechQueue, setNeedSpeechQueue] = useState<string[]>([]);
  const needSpeechQueueRef = useRef<string[]>([]);
  useEffect(() => {
    needSpeechQueueRef.current = needSpeechQueue;
  }, [needSpeechQueue]);

  useEffect(() => {

  

    const sentences = processAndStoreSentence(assistantResponseBuffer);

    for (const sentence of sentences) {
      if (sentence.exists === false) {

        if (isAvatarStarted) {
          console.log(`avatar need speak: ${sentence.sentence}`);
          speakAvatar(sentence.sentence);
        } else {
          console.log(`tts need speak: ${sentence.sentence}`);
          setNeedSpeechQueue([...needSpeechQueue, sentence.sentence]);
        }
      }
    }

  }, [assistantResponseBuffer]);

  const speakAvatar = async (spokenText: string) => {
    if (!avatarSynthesizerRef.current) return;

    try {
      setIsAvatarSpeaking(true);
      const ttsVoice = 'en-US-AndrewMultilingualNeural';
      const spokenSsml = `
          <speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xmlns:mstts='http://www.w3.org/2001/mstts' xml:lang='en-US'>
            <voice name='${ttsVoice}'>
              <mstts:leadingsilence-exact value='0'/>
              ${htmlEncodeAvatar(spokenText)}
            </voice>
          </speak>`;

      const result = await avatarSynthesizerRef.current.speakSsmlAsync(spokenSsml);
      if (result.reason === SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
        console.log(`Speech completed: ${spokenText}`);
        setIsAvatarSpeaking(false);
      } else {
        throw new Error('Speech synthesis failed: ' + JSON.stringify(result));
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsAvatarSpeaking(false);
    }
  };


  const stopAvatarSpeaking = async () => {
    if (!avatarSynthesizerRef.current) return;

    try {
      await avatarSynthesizerRef.current.stopSpeakingAsync();
      setIsAvatarSpeaking(false);
    } catch (error) {
      console.log(error);
    }
  };

  function splitTextByFirstPunctuation(text: string): [string, string] {
    const punctuationRegex = /[,!?:;'"，。！？：；‘’“”（）【】《》]/;

    const match = text.match(punctuationRegex);

    if (match) {
      const index = match.index!;
      return [text.slice(0, index + 1), text.slice(index + 1)];
    }

    return ['', text];
  }


  function processAndStoreSentence(input: string): SentenceStatus[] {

    if (!input) {
      return [];
    }

    // remove all url like http, https in input
    const urlRegex = /https?:\/\/[^\s]+/g;
    input = input.replace(urlRegex, '');

    const [firstPart, remainingPart] = splitTextByFirstPunctuation(input);

    const sentenceRegex = /.*?[,!?。！？\n]/g;
    const sentences = remainingPart.match(sentenceRegex)?.map(s => s.trim()).filter(Boolean) || [];
    // add first part to sentences
    if (firstPart) {
      sentences.unshift(firstPart);
    }

    const existingSentences: string[] = avatarSpeechSentencesArrayRef.current;

    const result: SentenceStatus[] = sentences.map(sentence => {
      const exists = existingSentences.includes(sentence);
      if (!exists) {
        existingSentences.push(sentence);
      }
      return { sentence, exists };
    });

    return result;
  }

  return (
    <AvatarContext.Provider value={{
      speakAvatar,
      stopAvatarSpeaking,
      needSpeechQueue,
      setNeedSpeechQueue,
      needSpeechQueueRef
    }}>
      {children}
    </AvatarContext.Provider>
  );
};

export const useAvatar = () => {
  const context = useContext(AvatarContext);
  if (!context) {
    throw new Error('useAvatar must be used within a AvatarProvider');
  }
  return context;
};
