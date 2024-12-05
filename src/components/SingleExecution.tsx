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
    let audioStream: SpeechSDK.AudioOutputStream;

    const createSpeechSynthesizer = () => {
        if (!cogSvcSubKey || !cogSvcRegion) {
            return null;
        }

        const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(cogSvcSubKey, cogSvcRegion);

        const browserSound = new SpeechSDK.SpeakerAudioDestination();
        browserSound.volume = 0;
        browserSound.mute();

        const audioConfig = SpeechSDK.AudioConfig.fromSpeakerOutput(browserSound);

        return new SpeechSDK.SpeechSynthesizer(speechConfig, audioConfig);
    }

    const textToSpeechAndPlay = async (text: string) => {
        if (!speechClientRef.current || !text) {
            return;
        }

        // remove * from text
        text = text.replaceAll('*', '')

        speechClientRef.current.synthesizing = async (s, e) => {
            // console.log('synthesizing', e.result.audioData);
            // play the audio data
            // get e.result.audioData size
            // const audioDataSize = e.result.audioData.byteLength;
            // console.log('audioDataSize', audioDataSize);
            // console.log('audioDuration', e.result.audioDuration);
            // console.log('properties', e.result.properties);


            //   const audio = new Audio();
            //   audio.src = URL.createObjectURL(new Blob([e.result.audioData], { type: "audio/mp3" }));
            //   audio.play();

            //   audio.addEventListener("ended", () => {
            //       console.log("Playback completed!");
            //   });
        };

        speechClientRef.current.synthesisStarted = (s, e) => {
            // console.log('synthesized', e);
        };

        speechClientRef.current.speakTextAsync(
            text,
            (result) => {
                if (result.reason === SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
                    console.log("Synthesis completed.");

                } else {
                    console.error("Speech synthesis failed:", result.errorDetails);
                }
            },
            (error) => {
                console.error("Error during synthesis:", error);
            }
        );

        // await speechClientRef.current.speakTextAsync(
        //     text,
        //     (result) => {
        //         if (result.reason === SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
        //             console.log('Speech Synthesis finished:', text);
        //         } else {
        //             console.error('Speech synthesis failed:', result.errorDetails);
        //         }
        //     },
        //     (error) => {
        //         console.error('Error during synthesis:', error);
        //         speechClientRef.current = null;
        //     }
        // );
    }

    const textToSpeech = async (sentence: string) => {
        if (!speechClientRef.current) {
            speechClientRef.current = createSpeechSynthesizer();
        }
        try {
            await textToSpeechAndPlay(sentence);
        } catch (error) {
            console.error('Error during synthesis:', error);
        }
    }


    useEffect(() => {
        if (needSpeechQueue.length === 0) {
            return;
        }

        textToSpeech(needSpeechQueue[0]);

        const executeTask = async (value: string, signal: AbortSignal): Promise<void> => {
            if (isRunning.current) {
                console.log("A task is already running. Skipping new task.");
                await new Promise(resolve => setTimeout(resolve, 10000));
                return;
            }
            isRunning.current = true;

            try {
                console.log("Task started for:", value);
                setOutput(value);

                await textToSpeech(value);


                const delay = value.length * 260;


                console.log('will delay', delay);

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
                // console.log("Task completed:", result);
                isRunning.current = false;
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

        setNeedSpeechQueue(needSpeechQueue.slice(1));

        // Abort the previous task if a new value is provided
        // if (controllerRef.current) {
        //     controllerRef.current.abort();
        // }

        // Create a new AbortController for the new task
        // const controller = new AbortController();
        // controllerRef.current = controller;

        // Start the new task
        // executeTask(needSpeechQueue[0], controller.signal);

        // Cleanup: Abort the task when the component unmounts or the value changes
        // return () => {
        //     controller.abort();
        // };
    }, [needSpeechQueue]);

    return (
        <div style={{ color: 'white', display: 'none' }}>
            <h3>Queue: {JSON.stringify(needSpeechQueue)}</h3>
            <h4>{output || "Processing..."}</h4>
        </div>
    );
};

export default SingleExecutionComponent;
