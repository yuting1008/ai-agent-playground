import React, { useState, useEffect, useRef } from "react";
import { useAvatar } from "../providers/AvatarProvider";
import { getOpenAIClientSSt } from "../lib/openai";
import './OpenAITTS.scss'
import { useSettings } from "../providers/SettingsProvider";

const OpenAITTS: React.FC = () => {
    const [output, setOutput] = useState<string | null>(null);

    const { needSpeechQueueRef, setNeedSpeechQueue } = useAvatar();

    const [isPlaying, setIsPlaying] = useState(false);
    const isPlayingRef = useRef(false);
    useEffect(() => {
        isPlayingRef.current = isPlaying;
    }, [isPlaying]);

    const { ttsApiKey, ttsTargetUri } = useSettings();

    const fetchAudioStream = async (text: string) => {
        console.log('fetchAudioStream', text)
        setIsPlaying(true);
        try {
            if (!text.trim()) return;

            const client = getOpenAIClientSSt(ttsApiKey, ttsTargetUri)

            if (!client) {
                console.error('client is not ready');
                return;
            }

            const response = await client.audio.speech.create(
                {
                    model: "tts-1",
                    voice: "echo",
                    input: text,
                }
            )

            console.log('response', response)

            const audioBlob = await response.blob();
            console.log('audioBlob', audioBlob)
            const audioURL = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioURL);
            audio.onended = () => {
                setIsPlaying(false);
                setOutput('');
            }
            audio.onerror = () => {
                setIsPlaying(false);
                setOutput('');
            }
            setOutput(text);
            audio.play();

        } catch (error) {
            console.error("Error fetching audio stream:", error);
            setIsPlaying(false);
            setOutput('');
        }
    };

    useEffect(() => {
        const intervalId = setInterval(() => {

            if (needSpeechQueueRef?.current?.length === 0) {
                return;
            }

            if (isPlayingRef.current) {
                console.log('isPlayingRef.current', isPlayingRef.current)
                return;
            }

            (async () => {
                const asyncResult = await fetchAudioStream(needSpeechQueueRef.current[0]);
                return asyncResult;
            })();

            setNeedSpeechQueue(needSpeechQueueRef.current.slice(1));

        }, 100);

        return () => {
            clearInterval(intervalId);
        };
    }, []);


    return (
        output ?
            <div className="captions">
                <h4>{output}</h4>
            </div> : null
    );
};

export default OpenAITTS;
