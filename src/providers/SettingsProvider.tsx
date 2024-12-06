import React, { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { ASSISTENT_TYPE_ASSISTANT, ASSISTENT_TYPE_DEFAULT, ASSISTENT_TYPE_REALTIME } from '../lib/const';
import { GRAPHRAG_ABOUT } from '../tools/azure_docs';

interface SettingsContextType {
  language: string;
  languageRef: React.MutableRefObject<string>;
  setLanguage: React.Dispatch<React.SetStateAction<string>>;

  assistantType: string;
  assistantTypeRef: React.MutableRefObject<string>;
  setAssistantType: React.Dispatch<React.SetStateAction<string>>;

  dallTargetUri: string;
  dallTargetUriRef: React.MutableRefObject<string>;
  setDallTargetUri: React.Dispatch<React.SetStateAction<string>>;

  dallApiKey: string;
  dallApiKeyRef: React.MutableRefObject<string>;
  setDallApiKey: React.Dispatch<React.SetStateAction<string>>;

  graphragUrl: string;
  graphragUrlRef: React.MutableRefObject<string>;
  setGraphragUrl: React.Dispatch<React.SetStateAction<string>>;

  graphragApiKey: string;
  graphragApiKeyRef: React.MutableRefObject<string>;
  setGraphragApiKey: React.Dispatch<React.SetStateAction<string>>;

  graphragProjectName: string;
  graphragProjectNameRef: React.MutableRefObject<string>;
  setGraphragProjectName: React.Dispatch<React.SetStateAction<string>>;

  graphragAbout: string;
  graphragAboutRef: React.MutableRefObject<string>;
  setGraphragAbout: React.Dispatch<React.SetStateAction<string>>;

  cogSvcRegion: string;
  cogSvcRegionRef: React.MutableRefObject<string>;
  setCogSvcRegion: React.Dispatch<React.SetStateAction<string>>;

  cogSvcSubKey: string;
  cogSvcSubKeyRef: React.MutableRefObject<string>;
  setCogSvcSubKey: React.Dispatch<React.SetStateAction<string>>;

  completionTargetUri: string;
  completionTargetUriRef: React.MutableRefObject<string>;
  setCompletionTargetUri: React.Dispatch<React.SetStateAction<string>>;

  completionApiKey: string;
  completionApiKeyRef: React.MutableRefObject<string>;
  setCompletionApiKey: React.Dispatch<React.SetStateAction<string>>;

  prompt: string;
  promptRef: React.MutableRefObject<string>;
  setPrompt: React.Dispatch<React.SetStateAction<string>>;

  endpoint: string;
  endpointRef: React.MutableRefObject<string>;
  setEndpoint: React.Dispatch<React.SetStateAction<string>>;

  key: string;
  keyRef: React.MutableRefObject<string>;
  setKey: React.Dispatch<React.SetStateAction<string>>;

  feishuHook: string;
  feishuHookRef: React.MutableRefObject<string>;
  setFeishuHook: React.Dispatch<React.SetStateAction<string>>;

  quoteToken: string;
  quoteTokenRef: React.MutableRefObject<string>;
  setQuoteToken: React.Dispatch<React.SetStateAction<string>>;

  newsKey: string;
  newsKeyRef: React.MutableRefObject<string>;
  setNewsKey: React.Dispatch<React.SetStateAction<string>>;

  mxnzpAppId: string;
  mxnzpAppIdRef: React.MutableRefObject<string>;
  setMxnzpAppId: React.Dispatch<React.SetStateAction<string>>;

  mxnzpAppSecret: string;
  mxnzpAppSecretRef: React.MutableRefObject<string>;
  setMxnzpAppSecret: React.Dispatch<React.SetStateAction<string>>;

  isAssistant: boolean;
  isAssistantRef: React.MutableRefObject<boolean>;
  setIsAssistant: React.Dispatch<React.SetStateAction<boolean>>;

  isRealtime: boolean;
  isRealtimeRef: React.MutableRefObject<boolean>;
  setIsRealtime: React.Dispatch<React.SetStateAction<boolean>>;

  ttsTargetUri: string;
  ttsTargetUriRef: React.MutableRefObject<string>;
  setTtsTargetUri: React.Dispatch<React.SetStateAction<string>>;

  ttsApiKey: string;
  ttsApiKeyRef: React.MutableRefObject<string>;
  setTtsApiKey: React.Dispatch<React.SetStateAction<string>>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

  // language string
  const [language, setLanguage] = useState<string>(localStorage.getItem('language') || 'chinese');
  const languageRef = useRef(language);
  useEffect(() => {
    languageRef.current = language;
    localStorage.setItem('language', language);
  }, [language]);


  // assistantType string
  const [assistantType, setAssistantType] = useState<string>(localStorage.getItem('assistantType') || ASSISTENT_TYPE_DEFAULT);
  const assistantTypeRef = useRef(assistantType);

  // isAssistant boolean
  const [isAssistant, setIsAssistant] = useState<boolean>(assistantTypeRef.current === ASSISTENT_TYPE_ASSISTANT);
  const isAssistantRef = useRef(isAssistant);
  useEffect(() => {
    isAssistantRef.current = isAssistant;
  }, [isAssistant]);

  // isRealtime boolean
  const [isRealtime, setIsRealtime] = useState<boolean>(assistantTypeRef.current === ASSISTENT_TYPE_REALTIME);
  const isRealtimeRef = useRef(isRealtime);
  useEffect(() => {
    isRealtimeRef.current = isRealtime;
  }, [isRealtime]);

  useEffect(() => {
    assistantTypeRef.current = assistantType;
    localStorage.setItem('assistantType', assistantType);
    setIsAssistant(assistantTypeRef.current === ASSISTENT_TYPE_ASSISTANT);
    setIsRealtime(assistantTypeRef.current === ASSISTENT_TYPE_REALTIME);
  }, [assistantType]);

  // ttsTargetUri string
  const [ttsTargetUri, setTtsTargetUri] = useState<string>(localStorage.getItem('ttsTargetUri') || '');
  const ttsTargetUriRef = useRef(ttsTargetUri);
  useEffect(() => {
    ttsTargetUriRef.current = ttsTargetUri;
    localStorage.setItem('ttsTargetUri', ttsTargetUri);
  }, [ttsTargetUri]);

  // ttsApiKey string
  const [ttsApiKey, setTtsApiKey] = useState<string>(localStorage.getItem('ttsApiKey') || '');
  const ttsApiKeyRef = useRef(ttsApiKey);
  useEffect(() => {
    ttsApiKeyRef.current = ttsApiKey;
    localStorage.setItem('ttsApiKey', ttsApiKey);
  }, [ttsApiKey]);

  // dallTargetUri string
  const [dallTargetUri, setDallTargetUri] = useState<string>(localStorage.getItem('dallTargetUri') || '');
  const dallTargetUriRef = useRef(dallTargetUri);
  useEffect(() => {
    dallTargetUriRef.current = dallTargetUri;
    localStorage.setItem('dallTargetUri', dallTargetUri);
  }, [dallTargetUri]);

  // dallApiKey string
  const [dallApiKey, setDallApiKey] = useState<string>(localStorage.getItem('dallApiKey') || '');
  const dallApiKeyRef = useRef(dallApiKey);
  useEffect(() => {
    dallApiKeyRef.current = dallApiKey;
    localStorage.setItem('dallApiKey', dallApiKey);
  }, [dallApiKey]);

  // graphragUrl string
  const [graphragUrl, setGraphragUrl] = useState<string>(localStorage.getItem('graphragUrl') || '');
  const graphragUrlRef = useRef(graphragUrl);
  useEffect(() => {
    graphragUrlRef.current = graphragUrl;
    localStorage.setItem('graphragUrl', graphragUrl);
  }, [graphragUrl]);

  // graphragApiKey string
  const [graphragApiKey, setGraphragApiKey] = useState<string>(localStorage.getItem('graphragApiKey') || '');
  const graphragApiKeyRef = useRef(graphragApiKey);
  useEffect(() => {
    graphragApiKeyRef.current = graphragApiKey;
    localStorage.setItem('graphragApiKey', graphragApiKey);
  }, [graphragApiKey]);

  // graphragProjectName string
  const [graphragProjectName, setGraphragProjectName] = useState<string>(localStorage.getItem('graphragProjectName') || '');
  const graphragProjectNameRef = useRef(graphragProjectName);
  useEffect(() => {
    graphragProjectNameRef.current = graphragProjectName;
    localStorage.setItem('graphragProjectName', graphragProjectName);
  }, [graphragProjectName]);

  // graphragAbout string
  const [graphragAbout, setGraphragAbout] = useState<string>(localStorage.getItem('graphragAbout') || GRAPHRAG_ABOUT);
  const graphragAboutRef = useRef(graphragAbout);
  useEffect(() => {
    graphragAboutRef.current = graphragAbout;
    localStorage.setItem('graphragAbout', graphragAbout);
  }, [graphragAbout]);

  // cogSvcRegion string
  const [cogSvcRegion, setCogSvcRegion] = useState<string>(localStorage.getItem('cogSvcRegion') || 'westus2');
  const cogSvcRegionRef = useRef(cogSvcRegion);
  useEffect(() => {
    cogSvcRegionRef.current = cogSvcRegion;
    localStorage.setItem('cogSvcRegion', cogSvcRegion);
  }, [cogSvcRegion]);

  // cogSvcSubKey string
  const [cogSvcSubKey, setCogSvcSubKey] = useState<string>(localStorage.getItem('cogSvcSubKey') || '');
  const cogSvcSubKeyRef = useRef(cogSvcSubKey);
  useEffect(() => {
    cogSvcSubKeyRef.current = cogSvcSubKey;
    localStorage.setItem('cogSvcSubKey', cogSvcSubKey);
  }, [cogSvcSubKey]);

  // completionTargetUri string
  const [completionTargetUri, setCompletionTargetUri] = useState<string>(localStorage.getItem('completionTargetUri') || '');
  const completionTargetUriRef = useRef(completionTargetUri);
  useEffect(() => {
    completionTargetUriRef.current = completionTargetUri;
    localStorage.setItem('completionTargetUri', completionTargetUri);
  }, [completionTargetUri]);

  // completionApiKey string
  const [completionApiKey, setCompletionApiKey] = useState<string>(localStorage.getItem('completionApiKey') || '');
  const completionApiKeyRef = useRef(completionApiKey);
  useEffect(() => {
    completionApiKeyRef.current = completionApiKey;
    localStorage.setItem('completionApiKey', completionApiKey);
  }, [completionApiKey]);

  // prompt string
  const [prompt, setPrompt] = useState<string>(localStorage.getItem('prompt') || '');
  const promptRef = useRef(prompt);
  useEffect(() => {
    promptRef.current = prompt;
    localStorage.setItem('prompt', prompt);
  }, [prompt]);

  // endpoint string
  const [endpoint, setEndpoint] = useState<string>(localStorage.getItem('endpoint') || '');
  const endpointRef = useRef(endpoint);
  useEffect(() => {
    endpointRef.current = endpoint;
    localStorage.setItem('endpoint', endpoint);
  }, [endpoint]);

  // key string
  const [key, setKey] = useState<string>(localStorage.getItem('key') || '');
  const keyRef = useRef(key);
  useEffect(() => {
    keyRef.current = key;
    localStorage.setItem('key', key);
  }, [key]);

  // feishuHook string
  const [feishuHook, setFeishuHook] = useState<string>(localStorage.getItem('feishuHook') || '');
  const feishuHookRef = useRef(feishuHook);
  useEffect(() => {
    feishuHookRef.current = feishuHook;
    localStorage.setItem('feishuHook', feishuHook);
  }, [feishuHook]);

  // quoteToken string
  const [quoteToken, setQuoteToken] = useState<string>(localStorage.getItem('quoteToken') || '');
  const quoteTokenRef = useRef(quoteToken);
  useEffect(() => {
    quoteTokenRef.current = quoteToken;
    localStorage.setItem('quoteToken', quoteToken);
  }, [quoteToken]);

  // newsKey string
  const [newsKey, setNewsKey] = useState<string>(localStorage.getItem('newsKey') || '');
  const newsKeyRef = useRef(newsKey);
  useEffect(() => {
    newsKeyRef.current = newsKey;
    localStorage.setItem('newsKey', newsKey);
  }, [newsKey]);

  // mxnzpAppId string
  const [mxnzpAppId, setMxnzpAppId] = useState<string>(localStorage.getItem('mxnzpAppId') || '');
  const mxnzpAppIdRef = useRef(mxnzpAppId);
  useEffect(() => {
    mxnzpAppIdRef.current = mxnzpAppId;
    localStorage.setItem('mxnzpAppId', mxnzpAppId);
  }, [mxnzpAppId]);

  // mxnzpAppSecret string
  const [mxnzpAppSecret, setMxnzpAppSecret] = useState<string>(localStorage.getItem('mxnzpAppSecret') || '');
  const mxnzpAppSecretRef = useRef(mxnzpAppSecret);
  useEffect(() => {
    mxnzpAppSecretRef.current = mxnzpAppSecret;
    localStorage.setItem('mxnzpAppSecret', mxnzpAppSecret);
  }, [mxnzpAppSecret]);

  return (
    <SettingsContext.Provider value={{
      language, languageRef, setLanguage,
      assistantType, assistantTypeRef, setAssistantType,
      isAssistant, setIsAssistant,
      isRealtime, setIsRealtime,
      dallTargetUri, dallTargetUriRef, setDallTargetUri,
      dallApiKey, dallApiKeyRef, setDallApiKey,
      graphragUrl, graphragUrlRef, setGraphragUrl,
      graphragApiKey, graphragApiKeyRef, setGraphragApiKey,
      graphragProjectName, graphragProjectNameRef, setGraphragProjectName,
      graphragAbout, graphragAboutRef, setGraphragAbout,
      cogSvcRegion, cogSvcRegionRef, setCogSvcRegion,
      cogSvcSubKey, cogSvcSubKeyRef, setCogSvcSubKey,
      completionTargetUri, completionTargetUriRef, setCompletionTargetUri,
      completionApiKey, completionApiKeyRef, setCompletionApiKey,
      prompt, promptRef, setPrompt,
      endpoint, endpointRef, setEndpoint,
      key, keyRef, setKey,
      feishuHook, feishuHookRef, setFeishuHook,
      quoteToken, quoteTokenRef, setQuoteToken,
      newsKey, newsKeyRef, setNewsKey,
      mxnzpAppId, mxnzpAppIdRef, setMxnzpAppId,
      mxnzpAppSecret, mxnzpAppSecretRef, setMxnzpAppSecret,
      isAssistantRef, isRealtimeRef,
      ttsTargetUri, ttsTargetUriRef, setTtsTargetUri,
      ttsApiKey, ttsApiKeyRef, setTtsApiKey,
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useContexts must be used within a AppProvider');
  }
  return context;
};
