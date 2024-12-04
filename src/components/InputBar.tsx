// import { useState } from 'react';


// import { Mic, MicOff, Send, StopCircle, Clock } from 'react-feather';
// import './ConsolePage.scss';

// import { AssistantStream } from 'openai/lib/AssistantStream';
// // @ts-expect-error - no types for this yet
// import { AssistantStreamEvent } from 'openai/resources/beta/assistants/assistants';
// import { getOpenAIClient } from '../lib/openai';

// import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';
// import { useContexts } from '../AppProvider';
// import { useSettings } from '../SettingsProvider';


export function InputBar() {}



// export function InputBar() {

//   const {
//     threadRef, 
//     setThreadJob,
//     assistantResponseBufferRef, setAssistantResponseBuffer,
//     isAvatarStartedRef,
//     avatarSpeechSentencesArrayRef, setAvatarSpeechSentencesArray,
//     assistantRef, 
//     realtimeClientRef } = useContexts();

//   const {
//     isAssistant,
//     isRealtime,
//     cogSvcSubKeyRef,
//     cogSvcRegionRef,
//   } = useSettings();



//   const [isConnected, setIsConnected] = useState(false);





//   // process and store sentence for speech
//   type SentenceStatus = { sentence: string; exists: boolean };

//   function splitTextByFirstPunctuation(text: string): [string, string] {
//     const punctuationRegex = /[,!?:;'"，。！？：；‘’“”（）【】《》]/;

//     const match = text.match(punctuationRegex);

//     if (match) {
//       const index = match.index!;
//       return [text.slice(0, index + 1), text.slice(index + 1)];
//     }

//     return ['', text];
//   }

//   function processAndStoreSentence(id: string, input: string): SentenceStatus[] {
//     if (!input) {
//       return [];
//     }

//     // remove all url like http, https in input
//     const urlRegex = /https?:\/\/[^\s]+/g;
//     input = input.replace(urlRegex, '');

//     const [firstPart, remainingPart] = splitTextByFirstPunctuation(input);

//     const sentenceRegex = /.*?[,!?。！？\n]/g;
//     const sentences = remainingPart.match(sentenceRegex)?.map(s => s.trim()).filter(Boolean) || [];
//     // add first part to sentences
//     if (firstPart) {
//       sentences.unshift(firstPart);
//     }

//     const existingSentences: string[] = avatarSpeechSentencesArrayRef.current;

//     const result: SentenceStatus[] = sentences.map(sentence => {
//       const sentenceId = `${id}-${sentence}`;
//       const exists = existingSentences.includes(sentenceId);
//       if (!exists) {
//         existingSentences.push(sentenceId);
//       }
//       return { sentence, exists };
//     });

//     setAvatarSpeechSentencesArray(existingSentences);

//     return result;
//   }



//   const [sttRecognizer, setSttRecognizer] = useState<SpeechSDK.SpeechRecognizer | null>(null);
//   const [sttRecognizerConnecting, setSttRecognizerConnecting] = useState(false);

//   const [inputValue, setInputValue] = useState('');

//   const [messagesAssistant, setMessagesAssistant] = useState<any[]>([]);
//   const [assistantRunning, setAssistantRunning] = useState(false);



//   const sendText = async (inputValue: string) => {
//     if (!inputValue.trim()) return;

//     if (isAssistant) {
//       await stopCurrentStreamJob();
//       setAssistantResponseBuffer('')
//       stopAvatarSpeaking();
//       sendAssistantMessage(inputValue);
//       setMessagesAssistant((prevMessages: any) => [
//         ...prevMessages,
//         { role: 'user', text: inputValue }
//       ]);
//       setAssistantRunning(true);
//       assistantScrollToBottom();
//       setInputValue('');
//       return;
//     }

//     stopAvatarSpeaking();
//     cancleRealtimeResponse();
//     realtimeClientRef.current.sendUserMessageContent([
//       {
//         type: `input_text`,
//         text: inputValue
//       }
//     ]);
//     setInputValue('');
//     console.log('send text', inputValue);
//   };

//   const sttStartRecognition = () => {

//     setSttRecognizerConnecting(true);

//     const autoDetectSourceLanguageConfig = SpeechSDK.AutoDetectSourceLanguageConfig.fromLanguages(['zh-CN', 'en-US']);

//     const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(cogSvcSubKeyRef.current, cogSvcRegionRef.current);
//     speechConfig.outputFormat = SpeechSDK.OutputFormat.Simple;

//     const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();

//     const newRecognizer = SpeechSDK.SpeechRecognizer.FromConfig(speechConfig, autoDetectSourceLanguageConfig, audioConfig);

//     newRecognizer.recognizing = (s, e) => {
//       console.log(`Recognizing: ${e.result.text}`);
//       setInputValue(e.result.text);

//       (async () => {
//         await stopCurrentStreamJob();
//       })();

//       stopAvatarSpeaking();
//       cancleRealtimeResponse();
//     };

//     newRecognizer.recognized = (s, e) => {
//       if (e.result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
//         console.log(`Final result: ${e.result.text}`);
//         setInputValue(e.result.text);
//         sendText(e.result.text);
//       } else if (e.result.reason === SpeechSDK.ResultReason.NoMatch) {
//         console.log('No speech recognized.');
//       }
//     };

//     // Speech Ended / Silence
//     newRecognizer.speechEndDetected = () => {
//       console.log('Silence detected. Stopping recognition.');
//       sttStopRecognition();
//     };

//     newRecognizer.canceled = (s, e) => {
//       console.error(`Canceled: ${e.reason}`);
//       newRecognizer.stopContinuousRecognitionAsync();
//     };

//     newRecognizer.sessionStopped = () => {
//       console.log('Session stopped.');
//       newRecognizer.stopContinuousRecognitionAsync();
//     };

//     newRecognizer.startContinuousRecognitionAsync(
//       () => {
//         console.log('Recognition started.');
//         setSttRecognizer(newRecognizer);
//         setSttRecognizerConnecting(false);
//       },
//       (err) => {
//         console.error('Error starting recognition:', err);
//         setSttRecognizerConnecting(false);
//       }
//     );
//   };

//   const sttStopRecognition = () => {
//     if (sttRecognizer) {
//       sttRecognizer.stopContinuousRecognitionAsync(() => {
//         console.log('Recognition stopped.');
//         // setTranscript((prev) => `${prev}\n--- Recognition Stopped ---\n`);
//         setSttRecognizer(null);
//         setSttRecognizerConnecting(false);
//       });
//     }

//     setInputValue('');
//   };



//   const sendAssistantMessage = async (text: string) => {
//     await getOpenAIClient().beta.threads.messages.create(threadRef.current?.id, {
//       role: 'user',
//       content: text
//     });

//     const stream = getOpenAIClient().beta.threads.runs.stream(threadRef.current?.id, {
//       assistant_id: assistantRef.current.id
//     });

//     const new_stream = AssistantStream.fromReadableStream(stream.toReadableStream());

//     handleAssistantReadableStream(new_stream);
//   };

//   const submitAssistantActionResult = async (runId: string, toolCallOutputs: {
//     output: string,
//     tool_call_id: string
//   }[]) => {
//     const stream = getOpenAIClient().beta.threads.runs.submitToolOutputsStream(
//       threadRef.current?.id,
//       runId,
//       // { tool_outputs: [{ output: result, tool_call_id: toolCallId }] },
//       { tool_outputs: toolCallOutputs }
//     );

//     const new_stream = AssistantStream.fromReadableStream(stream.toReadableStream());
//     handleAssistantReadableStream(new_stream);
//   };

//   /* Stream Event Handlers */

//   // textCreated - create new assistant message
//   const handleAssistantTextCreated = () => {
//     appendAssistantMessage('assistant', '');
//   };

//   // textDelta - append text to last assistant message
//   const handleAssistantTextDelta = (delta: any) => {
//     if (delta.value != null) {

//       const latestText = assistantResponseBufferRef.current + delta.value;
//       setAssistantResponseBuffer(latestText);

//       const sentences = processAndStoreSentence(threadRef.current?.id, latestText);

//       for (const sentence of sentences) {
//         if (sentence.exists === false) {
//           console.log(`Speech Need: ${sentence.sentence}`);
//           if (isAvatarStartedRef.current) {
//             speakAvatar(sentence.sentence);
//           } else {
//             // textToSpeechAndPlay(sentence.sentence);
//           }
//         }
//       }

//       appendAssistantToLastMessage(delta.value);
//     }

//     if (delta.annotations != null) {
//       annotateAssistantLastMessage(delta.annotations);
//     }
//   };

//   // imageFileDone - show image in chat
//   const handleAssistantImageFileDone = (image: any) => {
//     appendAssistantToLastMessage(`\n![${image.file_id}](/api/files/${image.file_id})\n`);
//   };

//   // toolCallCreated - log new tool call
//   const toolAssistantCallCreated = (toolCall: any) => {
//     if (toolCall.type != 'code_interpreter') return;
//     appendAssistantMessage('code', '');
//   };

//   // toolCallDelta - log delta and snapshot for the tool call
//   const toolAssistantCallDelta = (delta: any) => {
//     if (delta.type != 'code_interpreter') return;
//     if (!delta.code_interpreter.input) return;
//     appendAssistantToLastMessage(delta.code_interpreter.input);
//   };

//   // handleRequiresAction - handle function call
//   const handleAssistantRequiresAction = async (
//     event: AssistantStreamEvent.ThreadRunRequiresAction
//   ) => {
//     const runId = event.data.id;
//     const toolCalls = event.data.required_action.submit_tool_outputs.tool_calls;
//     // loop over tool calls and call function handler
//     const toolCallOutputs = await Promise.all(
//       toolCalls.map(async (toolCall: any) => {
//         const result = await functionCallHandler(toolCall);
//         return { output: result, tool_call_id: toolCall.id };
//       })
//     );
//     setAssistantRunning(true);
//     submitAssistantActionResult(runId, toolCallOutputs);
//   };

//   // handleRunCompleted - re-enable the input form
//   const handleAssistantRunCompleted = () => {
//     setAssistantRunning(false);
//     setThreadJob(null);
//   };

//   const handleAssistantReadableStream = (stream: AssistantStream) => {
//     // messages
//     stream.on('textCreated', handleAssistantTextCreated);
//     stream.on('textDelta', handleAssistantTextDelta);

//     // image
//     stream.on('imageFileDone', handleAssistantImageFileDone);

//     // code interpreter
//     stream.on('toolCallCreated', toolAssistantCallCreated);
//     stream.on('toolCallDelta', toolAssistantCallDelta);

//     // events without helpers yet (e.g. requires_action and run.done)
//     stream.on('event', (event) => {

//       if (event.event === 'thread.run.created') {
//         console.log('thread.run.created', event.data);
//         setThreadJob(event.data);
//       }

//       if (event.event === 'thread.run.completed') {
//         setThreadJob(null);
//       }

//       if (event.event === 'thread.run.requires_action')
//         handleAssistantRequiresAction(event);
//       if (event.event === 'thread.run.completed') handleAssistantRunCompleted();
//     });
//   };

//   const appendAssistantToLastMessage = (text: string) => {
//     setMessagesAssistant((prevMessages: any) => {
//       const lastMessage = prevMessages[prevMessages.length - 1];
//       const latestText = lastMessage.text + text
//       const updatedLastMessage = {
//         ...lastMessage,
//         text: latestText
//       };

//       return [...prevMessages.slice(0, -1), updatedLastMessage];
//     });
//   };

//   const appendAssistantMessage = (role: string, text: string) => {
//     setMessagesAssistant((prevMessages: any) => [...prevMessages, { role, text }]);
//   };

//   const annotateAssistantLastMessage = (annotations: any) => {
//     setMessagesAssistant((prevMessages: any) => {
//       const lastMessage = prevMessages[prevMessages.length - 1];
//       const updatedLastMessage = {
//         ...lastMessage
//       };
//       annotations.forEach((annotation: any) => {
//         if (annotation.type === 'file_path') {
//           updatedLastMessage.text = updatedLastMessage.text.replaceAll(
//             annotation.text,
//             `/api/files/${annotation.file_path.file_id}`
//           );
//         }
//       });
//       return [...prevMessages.slice(0, -1), updatedLastMessage];
//     });

//   };


//   return (
//     <>

//       {
//         isConnected && (

//           <div className="text-input">

//             <input type="text"
//               placeholder="Type your message here..."
//               value={inputValue}
//               onKeyDown={(e) => {
//                 if (e.key === 'Enter') {
//                   sendText(inputValue);
//                 }
//                 if (e.key === 'Escape') {
//                   setInputValue('');
//                 }
//               }} onChange={(e) => setInputValue(e.target.value)} />

//             <button onClick={() => sendText(inputValue)}
//               style={{ display: inputValue ? '' : 'none' }}
//               disabled={!inputValue}><Send /></button>

//             <button
//               onClick={
//                 () => {
//                   setAssistantRunning(false);
//                   (async () => {
//                     await stopCurrentStreamJob();
//                   })();
//                 }
//               }
//               style={{
//                 padding: '5px 5px',
//                 fontSize: '12px',
//                 border: 'none',
//                 cursor: 'pointer',
//                 borderRadius: '5px',
//                 display: assistantRunning ? '' : 'none'
//               }}
//             >
//               <StopCircle />
//             </button>

//             <button
//               onClick={sttRecognizer ? sttStopRecognition : sttStartRecognition}
//               style={{
//                 padding: '5px 8px',
//                 fontSize: '12px',
//                 color: sttRecognizer ? '#ffffff' : '',
//                 backgroundColor: sttRecognizer ? '#ff4d4f' : '',
//                 border: 'none',
//                 cursor: 'pointer',
//                 borderRadius: '5px',
//                 display: isRealtime ? 'none' : ''
//               }}
//             >
//               {sttRecognizer ? <Mic /> : (
//                 sttRecognizerConnecting ? <Clock /> : <MicOff />
//               )}
//             </button>

//           </div>
//         )
//       }

//     </>
//   );
// }
