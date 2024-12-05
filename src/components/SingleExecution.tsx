import React, { useState, useEffect, useRef } from "react";
import { useAvatar } from "../providers/AvatarProvider";
import { useSettings } from "../providers/SettingsProvider";
import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';

const SingleExecutionComponent: React.FC = () => {
    const [output, setOutput] = useState<string | null>(null); // Task result
    const isRunning = useRef(false); // Flag to ensure single task execution
    const controllerRef = useRef<AbortController | null>(null); // AbortController for task interruption

    const { needSpeechQueue, setNeedSpeechQueue } = useAvatar();

    const { cogSvcSubKey, cogSvcRegion } = useSettings();
    const speechClientRef = useRef<SpeechSDK.SpeechSynthesizer | null>(null);
    const audioOutputStreamRef = useRef<SpeechSDK.AudioConfig | null>(null);

    const createSpeechSynthesizer = () => {
        if (!cogSvcSubKey || !cogSvcRegion) {
            return null;
        }
        const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(cogSvcSubKey, cogSvcRegion);

        audioOutputStreamRef.current = SpeechSDK.AudioConfig.fromDefaultSpeakerOutput();

        return new SpeechSDK.SpeechSynthesizer(speechConfig, audioOutputStreamRef.current);
    }

    const textToSpeechAndPlay = (text: string) => {
        if (!speechClientRef.current || !text) {
            return;
        }

        speechClientRef.current.speakTextAsync(
            text,
            (result) => {
                if (result.reason === SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
                    console.log('Speech Synthesis finished:', text);
                } else {
                    console.error('Speech synthesis failed:', result.errorDetails);
                }
            },
            (error) => {
                console.error('Error during synthesis:', error);
                speechClientRef.current = null;
            }
        );
    }

    const textToSpeech = (sentence: string) => {
        if (!speechClientRef.current) {
            speechClientRef.current = createSpeechSynthesizer();
        }
        try {
            textToSpeechAndPlay(sentence);
        } catch (error) {
            console.error('Error during synthesis:', error);
        }
    }


    useEffect(() => {
        const executeTask = async (value: string, signal: AbortSignal): Promise<void> => {
            if (isRunning.current) {
                console.log("A task is already running. Skipping new task.");
                return;
            }
            isRunning.current = true;

            try {
                console.log("Task started for:", value);
                setOutput(value);

                textToSpeech(value);

                // Simulate async task with abort support
                const result = await new Promise<string>((resolve, reject) => {
                    const timeout = setTimeout(() => resolve(`Processed: ${value}`), 10000);
                    signal.addEventListener("abort", () => {
                        clearTimeout(timeout);
                        reject(new Error("Task aborted"));
                    });
                });

                setOutput(result);
                setNeedSpeechQueue(needSpeechQueue.slice(1));
                console.log("Task completed:", result);
            } catch (error) {
                if (error instanceof Error && error.message === "Task aborted") {
                    console.log("Task was aborted.");
                } else {
                    console.error("Error in task execution:", error);
                }
            } finally {
                isRunning.current = false;
            }
        };

        // Abort the previous task if a new value is provided
        if (controllerRef.current) {
            controllerRef.current.abort();
        }

        // Create a new AbortController for the new task
        const controller = new AbortController();
        controllerRef.current = controller;

        // Start the new task
        executeTask(needSpeechQueue[0], controller.signal);

        // Cleanup: Abort the task when the component unmounts or the value changes
        return () => {
            controller.abort();
        };
    }, [needSpeechQueue]);

    return (
        <div>
            <h3>Watched Value: {JSON.stringify(needSpeechQueue)}</h3>
            <h4>Output: {output || "Processing..."}</h4>
        </div>
    );
};

export default SingleExecutionComponent;
