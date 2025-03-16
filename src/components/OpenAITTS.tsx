import React, { useState, useEffect, useRef } from 'react';
import { getOpenAIClientSSt } from '../lib/openai';
import { useContexts } from '../providers/AppProvider';
import { AVATAR_READY } from '../lib/const';
import { Profiles } from '../lib/Profiles';

interface Sentence {
  text: string;
  audioURL: string;
}

const OpenAITTS: React.FC = () => {
  const {
    needSpeechQueueRef,
    avatarStatusRef,
    setCaption,
    setNeedSpeechQueue,
  } = useContexts();

  const profiles = new Profiles();
  const profile = profiles.currentProfile;

  const ttsApiKey = profile?.ttsApiKey || '';
  const ttsTargetUri = profile?.ttsTargetUri || '';

  const [isCreating, setIsCreating] = useState(false);
  const isCreatingRef = useRef(false);
  useEffect(() => {
    isCreatingRef.current = isCreating;
  }, [isCreating]);

  const [isPlaying, setIsPlaying] = useState(false);
  const isPlayingRef = useRef(false);
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  const [sentences, setSentences] = useState<Sentence[]>([]);
  const sentencesRef = useRef<Sentence[]>([]);
  useEffect(() => {
    sentencesRef.current = sentences;
  }, [sentences]);

  const fetchAudioStream = async (text: string) => {
    setIsCreating(true);
    console.log('isCreating', text);
    try {
      if (!text.trim()) return;

      const client = getOpenAIClientSSt(ttsApiKey, ttsTargetUri);

      if (!client) {
        console.error('client is not ready');
        return;
      }

      const response = await client.audio.speech.create({
        model: 'tts-1',
        voice: 'echo',
        input: text,
        speed: 1.0,
      });

      const audioBlob = await response.blob();

      setNeedSpeechQueue(needSpeechQueueRef.current.slice(1));

      const audioURL = URL.createObjectURL(audioBlob);

      const sentence: Sentence = {
        text: text,
        audioURL: audioURL,
      };
      setSentences([...sentencesRef.current, sentence]);
      console.log('sentences', sentencesRef.current);
      console.log('created sentence', sentence);
    } catch (error) {
      console.error('Error fetching audio stream:', error);
    }
    setIsCreating(false);
  };

  useEffect(() => {
    const intervalId = setInterval(async () => {
      if (avatarStatusRef.current === AVATAR_READY) {
        return;
      }

      if (needSpeechQueueRef?.current?.length === 0) {
        return;
      }

      if (isCreatingRef.current) {
        console.log('isCreatingRef.current', isCreatingRef.current);
        return;
      }

      return await fetchAudioStream(needSpeechQueueRef.current[0]);
    }, 400);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (avatarStatusRef.current === AVATAR_READY) {
        return;
      }

      if (sentencesRef.current.length === 0) {
        return;
      }

      if (isPlayingRef.current) {
        // console.log('isPlayingRef.current', isPlayingRef.current)
        return;
      }

      // console.log('sentences', sentencesRef.current)
      const currentSentence = sentencesRef.current[0];
      const audio = new Audio(currentSentence.audioURL);
      audio.onended = () => {
        setSentences(sentencesRef.current.slice(1));
        setCaption('');
        setIsPlaying(false);
      };
      setCaption(currentSentence.text);
      // console.log('playing audio', currentSentence)
      setIsPlaying(true);
      audio.play();
    }, 200);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return null;
};

export default OpenAITTS;
