import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';


export function textToSpeechAndPlay(text: string) {
  console.log('textToSpeechAndPlay: ', text)

  const cogSvcSubKey = localStorage.getItem('cogSvcSubKey') || '';
  const cogSvcRegion = localStorage.getItem('cogSvcRegion') || '';

  if (!cogSvcSubKey || !cogSvcRegion) {
    return;
  }

  const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(cogSvcSubKey, cogSvcRegion);

  const audioConfig = SpeechSDK.AudioConfig.fromDefaultSpeakerOutput();

  const synthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig, audioConfig);

  synthesizer.speakTextAsync(
    text,
    (result) => {
      if (result.reason === SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
        console.log('Synthesis finished successfully.');
      } else {
        console.error('Speech synthesis failed:', result.errorDetails);
      }
      synthesizer.close();

    },
    (error) => {
      console.error('Error during synthesis:', error);
      synthesizer.close();

    }
  );
}
