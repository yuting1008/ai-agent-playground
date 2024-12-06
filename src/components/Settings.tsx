import React, { useEffect, useRef, useState } from 'react';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa';
import { Download, Settings, Upload, X } from 'react-feather';
import { Button } from './button/Button';
import './Settings.scss';
import Dropdown from './Dropdown';
import { GRAPHRAG_ABOUT } from '../tools/azure_docs';
import { ALLOW_PROMPT_CHARACTERS, ASSISTENT_TYPE_ASSISTANT, ASSISTENT_TYPE_REALTIME } from '../lib/const';
import { useContexts } from '../providers/AppProvider';
import { useSettings } from '../providers/SettingsProvider';

const SettingsComponent: React.FC = () => {
  const { realtimeClientRef } = useContexts();

  const {
    setLanguage, language,
    setAssistantType, assistantType,
    setDallTargetUri, dallTargetUri,
    setDallApiKey, dallApiKey,
    setGraphragUrl, graphragUrl,
    setGraphragApiKey, graphragApiKey,
    setGraphragProjectName, graphragProjectName,
    setGraphragAbout, graphragAbout,
    setCogSvcRegion, cogSvcRegion,
    setCogSvcSubKey, cogSvcSubKey,
    setCompletionTargetUri, completionTargetUri,
    setCompletionApiKey, completionApiKey,
    setPrompt, prompt,
    setEndpoint, endpoint,
    setKey, key,
    setFeishuHook, feishuHook,
    setQuoteToken, quoteToken,
    setNewsKey, newsKey,
    setMxnzpAppId, mxnzpAppId,
    setMxnzpAppSecret, mxnzpAppSecret,
    setTtsTargetUri, ttsTargetUri,
    setTtsApiKey, ttsApiKey,
  } = useSettings();

  const DEFAULT = 'Default';
  const REAL_TIME_API = 'Realtime';
  const DALL_E = 'Dall-E-3';
  const GRAPHRAG = 'GraphRAG';
  const SPEECH = 'Speech';
  const TTS = 'TTS';
  const COMPLETION = 'Completion';
  const TOKENS = 'Third-party API';
  const PROMPT = 'Prompt';
  const BING = 'Bing';
  const IMPORT_EXPORT = 'Import/Export';

  const [isVisible, setIsVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const supportedLanguages = [
    { value: 'chinese', label: 'Chinese' },
    { value: 'english', label: 'English' }
  ];

  const supportedAssistantTypes = [
    { value: ASSISTENT_TYPE_REALTIME, label: 'Realtime' },
    { value: ASSISTENT_TYPE_ASSISTANT, label: 'STT -> Assistant -> TTS' }
  ];

  const [activeTab, setActiveTab] = useState(DEFAULT);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsModalOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const DefaultSettings = () => {

    const [language, setLanguage] = useState(localStorage.getItem('language') || 'chinese');
    useEffect(() => {
      localStorage.setItem('language', language);
    }, [language]);

    const [assistantType, setAssistantType] = useState(localStorage.getItem('assistantType') || ASSISTENT_TYPE_REALTIME);
    useEffect(() => {
      localStorage.setItem('assistantType', assistantType);
    }, [assistantType]);

    const handleDropdownChange = (value: string) => {
      setLanguage(value);
    };

    const handleAssistantTypeChange = (value: string) => {
      setAssistantType(value);
    };

    return <div>

      <div className="settings-label">Assistant Type</div>
      <Dropdown options={supportedAssistantTypes} selectedValue={assistantType} onChange={handleAssistantTypeChange} />

      <div className="settings-label">Default Language</div>
      <Dropdown options={supportedLanguages} selectedValue={language} onChange={handleDropdownChange} />

    </div>;
  };

  const SettingsRealtime = () => {

    const [endpoint, setEndpoint] = useState(localStorage.getItem('endpoint') || '');
    useEffect(() => {
      localStorage.setItem('endpoint', endpoint);
    }, [endpoint]);

    const [key, setKey] = useState(localStorage.getItem('key') || '');
    useEffect(() => {
      localStorage.setItem('key', key);
    }, [key]);

    const handleEndpointChange = (e: any) => {
      setEndpoint(e.target.value);
    };

    const handleKeyChange = (e: any) => {
      setKey(e.target.value);
    };

    return <div>
      <div className="settings-label">Target URI</div>
      <input type={'text'}
        className="settings-input"
        value={endpoint}
        placeholder={'https://xxx.openai.azure.com/openai/realtime?api-version=2024-10-01-preview&deployment=xxx'}
        onChange={handleEndpointChange} />

      <div className="settings-label">Key
        <span
          className="settings-label-show"
          onClick={toggleVisibility}
        >{isVisible ? <FaRegEye /> : <FaRegEyeSlash />}</span>
      </div>
      <input type={isVisible ? 'text' : 'password'}
        className="settings-input"
        value={key}
        placeholder={''}
        onChange={handleKeyChange} />

    </div>;
  };

  const SettingsTTS = () => {

    const [ttsTargetUri, setTtsTargetUri] = useState(localStorage.getItem('ttsTargetUri') || '');
    useEffect(() => {
      localStorage.setItem('ttsTargetUri', ttsTargetUri);
    }, [ttsTargetUri]);

    const [ttsApiKey, setTtsApiKey] = useState(localStorage.getItem('ttsApiKey') || '');
    useEffect(() => {
      localStorage.setItem('ttsApiKey', ttsApiKey);
    }, [ttsApiKey]);

    const handleTtsTargetUriChange = (e: any) => {
      setTtsTargetUri(e.target.value);
    };

    const handleTtsApiKeyChange = (e: any) => {
      setTtsApiKey(e.target.value);
    };

    return <div>
      <div className="settings-label">Target URI</div>
      <input type={'text'}
        className="settings-input"
        value={ttsTargetUri}
        placeholder={'https://xxxx.openai.azure.com/openai/deployments/tts/audio/speech?api-version=2024-05-01-preview'}
        onChange={handleTtsTargetUriChange} />

      <div className="settings-label">Key
        <span
          className="settings-label-show"
          onClick={toggleVisibility}
        >{isVisible ? <FaRegEye /> : <FaRegEyeSlash />}</span>
      </div>
      <input type={isVisible ? 'text' : 'password'}
        className="settings-input"
        value={ttsApiKey}
        placeholder={''}
        onChange={handleTtsApiKeyChange} />

    </div>;
  };

  const DALLE = () => {

    const [dallTargetUri, setDallTargetUri] = useState(localStorage.getItem('dallTargetUri') || '');
    useEffect(() => {
      localStorage.setItem('dallTargetUri', dallTargetUri);
    }, [dallTargetUri]);

    const [dallApiKey, setDallApiKey] = useState(localStorage.getItem('dallApiKey') || '');
    useEffect(() => {
      localStorage.setItem('dallApiKey', dallApiKey);
    }, [dallApiKey]);

    const handleDallTargetUriChange = (e: any) => {
      setDallTargetUri(e.target.value);
    };

    const handleDallApiKeyChange = (e: any) => {
      setDallApiKey(e.target.value);
    };

    return <div>
      <div className="settings-label">Target URI</div>
      <input type={'text'}
        className="settings-input"
        value={dallTargetUri}
        placeholder={'https://xxx.openai.azure.com/openai/deployments/dall-e-3/images/generations?api-version=2024-02-01'}
        onChange={handleDallTargetUriChange} />

      <div className="settings-label">Key
        <span
          className="settings-label-show"
          onClick={toggleVisibility}
        >{isVisible ? <FaRegEye /> : <FaRegEyeSlash />}</span>
      </div>
      <input type={isVisible ? 'text' : 'password'}
        className="settings-input"
        value={dallApiKey}
        placeholder={''}
        onChange={handleDallApiKeyChange} />

    </div>;
  };

  const GraphRAG = () => {

    const [graphragUrl, setGraphragUrl] = useState(localStorage.getItem('graphragUrl') || '');
    useEffect(() => {
      localStorage.setItem('graphragUrl', graphragUrl);
    }, [graphragUrl]);

    const [graphragApiKey, setGraphragApiKey] = useState(localStorage.getItem('graphragApiKey') || '');
    useEffect(() => {
      localStorage.setItem('graphragApiKey', graphragApiKey);
    }, [graphragApiKey]);

    const [graphragProjectName, setGraphragProjectName] = useState(localStorage.getItem('graphragProjectName') || '');
    useEffect(() => {
      localStorage.setItem('graphragProjectName', graphragProjectName);
    }, [graphragProjectName]);

    const [graphragAbout, setGraphragAbout] = useState(localStorage.getItem('graphragAbout') || '');
    useEffect(() => {
      localStorage.setItem('graphragAbout', graphragAbout);
    }, [graphragAbout]);

    const handleGraphragUrlChange = (e: any) => {
      setGraphragUrl(e.target.value);
    };

    const handleGraphragApiKeyChange = (e: any) => {
      setGraphragApiKey(e.target.value);
    };

    const handleGraphragProjectNameChange = (e: any) => {
      setGraphragProjectName(e.target.value);
    };

    const handleGraphragAboutChange = (e: any) => {
      setGraphragAbout(e.target.value);
    };

    return <div>
      <div className="settings-tip">
        Currently only local search is supported. <a href="https://github.com/TheodoreNiu/graphrag_kit" target="_blank">How
          to deploy a GraphRAG API?</a>
      </div>
      <div className="settings-label">API URL</div>
      <input type={'text'}
        className="settings-input"
        value={graphragUrl}
        placeholder={'https://xxx.xxx.xxx.azurecontainerapps.io'}
        onChange={handleGraphragUrlChange} />

      <div className="settings-label">API Key
        <span
          className="settings-label-show"
          onClick={toggleVisibility}
        >{isVisible ? <FaRegEye /> : <FaRegEyeSlash />}</span>
      </div>
      <input type={isVisible ? 'text' : 'password'}
        className="settings-input"
        value={graphragApiKey}
        placeholder={''}
        onChange={handleGraphragApiKeyChange} />

      <div className="settings-label">Project Name</div>
      <input type={'text'}
        className="settings-input"
        value={graphragProjectName}
        placeholder={''}
        onChange={handleGraphragProjectNameChange} />

      <div className="settings-label">About</div>
      <input type={'text'}
        className="settings-input"
        value={graphragAbout}
        placeholder={GRAPHRAG_ABOUT}
        onChange={handleGraphragAboutChange} />
    </div>;
  };

  const Speech = () => {

    const [cogSvcRegion, setCogSvcRegion] = useState(localStorage.getItem('cogSvcRegion') || '');
    useEffect(() => {
      localStorage.setItem('cogSvcRegion', cogSvcRegion);
    }, [cogSvcRegion]);

    const [cogSvcSubKey, setCogSvcSubKey] = useState(localStorage.getItem('cogSvcSubKey') || '');
    useEffect(() => {
      localStorage.setItem('cogSvcSubKey', cogSvcSubKey);
    }, [cogSvcSubKey]);

    const handleCogSvcSubKeyChange = (e: any) => {
      setCogSvcSubKey(e.target.value);
    };

    const handleCogSvcRegionChange = (e: any) => {
      setCogSvcRegion(e.target.value);
    };

    return <div>
      <div className="settings-label">Region</div>
      <input type={'text'}
        className="settings-input"
        value={cogSvcRegion}
        placeholder={'westus2'}
        onChange={handleCogSvcRegionChange} />

      <div className="settings-label">Subscription Key
        <span
          className="settings-label-show"
          onClick={toggleVisibility}
        >{isVisible ? <FaRegEye /> : <FaRegEyeSlash />}</span>
      </div>
      <input type={isVisible ? 'text' : 'password'}
        className="settings-input"
        value={cogSvcSubKey}
        placeholder={''}
        onChange={handleCogSvcSubKeyChange} />


      {/* <div className="settings-label">Private Endpoint</div>
      <input type={'text'}
        className="settings-input"
        value={privateEndpoint}
        placeholder={'https://xxx.privateendpoint.openai.azure.com'}
        onChange={handlePrivateEndpointChange} /> */}

    </div>;
  };

  const Bing = () => {

    const [bingApiKey, setBingApiKey] = useState(localStorage.getItem('bingApiKey') || '');
    useEffect(() => {
      localStorage.setItem('bingApiKey', bingApiKey);
    }, [bingApiKey]);

    const handleBingApiKeyChange = (e: any) => {
      setBingApiKey(e.target.value);
    };

    return <div>

      <div className="settings-label">Key
        <span
          className="settings-label-show"
          onClick={toggleVisibility}
        >{isVisible ? <FaRegEye /> : <FaRegEyeSlash />}</span>
      </div>
      <input type={isVisible ? 'text' : 'password'}
        className="settings-input"
        value={bingApiKey}
        placeholder={''}
        onChange={handleBingApiKeyChange} />

      <div className="settings-label">Endpoint</div>
      <input type={'text'}
        className="settings-input"
        value={'https://api.bing.microsoft.com/'} />

      <div className="settings-label">Location</div>
      <input type={'text'}
        className="settings-input"
        value={'global'} />

    </div>;
  };

  const SettingsCompletion = () => {

    const [completionTargetUri, setCompletionTargetUri] = useState(localStorage.getItem('completionTargetUri') || '');
    useEffect(() => {
      localStorage.setItem('completionTargetUri', completionTargetUri);
    }, [completionTargetUri]);

    const [completionApiKey, setCompletionApiKey] = useState(localStorage.getItem('completionApiKey') || '');
    useEffect(() => {
      localStorage.setItem('completionApiKey', completionApiKey);
    }, [completionApiKey]);

    const handleCompletionTargetUriChange = (e: any) => {
      setCompletionTargetUri(e.target.value);
    };

    const handleCompletionApiKeyChange = (e: any) => {
      setCompletionApiKey(e.target.value);
    };

    return <div>
      <div className="settings-label">Target URI</div>
      <input type={'text'}
        className="settings-input"
        value={completionTargetUri}
        placeholder={'https://xxxx.openai.azure.com/openai/deployments/gpt-4o-mini/chat/completions?api-version=2024-08-01-preview'}
        onChange={handleCompletionTargetUriChange} />

      <div className="settings-label">Key
        <span
          className="settings-label-show"
          onClick={toggleVisibility}
        >{isVisible ? <FaRegEye /> : <FaRegEyeSlash />}</span>
      </div>
      <input type={isVisible ? 'text' : 'password'}
        className="settings-input"
        value={completionApiKey}
        placeholder={''}
        onChange={handleCompletionApiKeyChange} />

    </div>;
  };

  const Prompt = () => {

    const [prompt, setPrompt] = useState(localStorage.getItem('prompt') || '');
    useEffect(() => {
      localStorage.setItem('prompt', prompt);
    }, [prompt]);

    const handlePromptChange = (e: any) => {
      setPrompt(e.target.value);
    };

    return (<div>
      <textarea
        className="settings-input"
        value={prompt}
        style={{ fontSize: '12px' }}
        placeholder={''}
        rows={20}
        maxLength={ALLOW_PROMPT_CHARACTERS}
        onChange={handlePromptChange}
      />
      <div className="settings-label">Remaining Characters: {ALLOW_PROMPT_CHARACTERS - prompt.length}</div>
    </div>);
  };

  const SettingsTokens = () => {

    const [feishuHook, setFeishuHook] = useState(localStorage.getItem('feishuHook') || '');
    useEffect(() => {
      localStorage.setItem('feishuHook', feishuHook);
    }, [feishuHook]);

    const [quoteToken, setQuoteToken] = useState(localStorage.getItem('quoteToken') || '');
    useEffect(() => {
      localStorage.setItem('quoteToken', quoteToken);
    }, [quoteToken]);

    const [newsKey, setNewsKey] = useState(localStorage.getItem('newsKey') || '');
    useEffect(() => {
      localStorage.setItem('newsKey', newsKey);
    }, [newsKey]);

    const [mxnzpAppId, setMxnzpAppId] = useState(localStorage.getItem('mxnzpAppId') || '');
    useEffect(() => {
      localStorage.setItem('mxnzpAppId', mxnzpAppId);
    }, [mxnzpAppId]);

    const [mxnzpAppSecret, setMxnzpAppSecret] = useState(localStorage.getItem('mxnzpAppSecret') || '');
    useEffect(() => {
      localStorage.setItem('mxnzpAppSecret', mxnzpAppSecret);
    }, [mxnzpAppSecret]);

    const handleFeishuHookChange = (e: any) => {
      setFeishuHook(e.target.value);
    };

    const handleQuoteTokenChange = (e: any) => {
      setQuoteToken(e.target.value);
    };

    const handleNewsKeyChange = (e: any) => {
      setNewsKey(e.target.value);
    };



    const handleMxnzpAppIdChange = (e: any) => {
      setMxnzpAppId(e.target.value);
    };

    const handleMxnzpAppSecretChange = (e: any) => {
      setMxnzpAppSecret(e.target.value);
    };


    return <div>

      <div className="settings-label">
        <a href="https://open.feishu.cn/open-apis/bot/v2/hook/xxx" target="_blank">Feishu Bot</a>
        <span
          className="settings-label-show"
          onClick={toggleVisibility}
        >{isVisible ? <FaRegEye /> : <FaRegEyeSlash />}</span>
      </div>
      <input type={isVisible ? 'text' : 'password'}
        className="settings-input"
        value={feishuHook}
        placeholder={''}
        onChange={handleFeishuHookChange} />

      <div className="settings-label">
        <a href="https://finnhub.io/" target="_blank">Finnhub</a>
        <span
          className="settings-label-show"
          onClick={toggleVisibility}
        >{isVisible ? <FaRegEye /> : <FaRegEyeSlash />}</span>
      </div>
      <input type={isVisible ? 'text' : 'password'}
        className="settings-input"
        value={quoteToken}
        placeholder={''}
        onChange={handleQuoteTokenChange} />

      <div className="settings-label">
        <a href="https://www.showapi.com/" target="_blank">News</a>
        <span
          className="settings-label-show"
          onClick={toggleVisibility}
        >{isVisible ? <FaRegEye /> : <FaRegEyeSlash />}</span>
      </div>
      <input type={isVisible ? 'text' : 'password'}
        className="settings-input"
        value={newsKey}
        placeholder={''}
        onChange={handleNewsKeyChange} />

      <div className="settings_inline">

        <div className="block">
          <div className="settings-label">
            <a href="https://www.mxnzp.com/" target="_blank">Mxnzp AppId</a>
          </div>
          <input type={'text'}
            className="settings-input"
            value={mxnzpAppId}
            placeholder={''}
            onChange={handleMxnzpAppIdChange} />
        </div>

        <div className="block">
          <div className="settings-label">
            <a href="https://www.mxnzp.com/" target="_blank">Mxnzp AppSecret</a>
            <span
              className="settings-label-show"
              onClick={toggleVisibility}
            >{isVisible ? <FaRegEye /> : <FaRegEyeSlash />}</span>
          </div>
          <input type={isVisible ? 'text' : 'password'}
            className="settings-input"
            value={mxnzpAppSecret}
            placeholder={''}
            onChange={handleMxnzpAppSecretChange} />
        </div>

      </div>
    </div>;

  };

  const handleExport = () => {
    // get all settings to json obejct and base64 encode
    const settings = {
      endpoint: endpoint,
      key: key,
      completionTargetUri: completionTargetUri,
      completionApiKey: completionApiKey,
      cogSvcRegion: cogSvcRegion,
      cogSvcSubKey: cogSvcSubKey,
      dallTargetUri: dallTargetUri,
      dallApiKey: dallApiKey,
      graphragUrl: graphragUrl,
      graphragApiKey: graphragApiKey,
      graphragProjectName: graphragProjectName,
      graphragAbout: graphragAbout,

      assistantType: assistantType,
      language: language,
      prompt: prompt,

      feishuHook: feishuHook,
      quoteToken: quoteToken,
      newsKey: newsKey,
      mxnzpAppId: mxnzpAppId,
      mxnzpAppSecret: mxnzpAppSecret,

      ttsTargetUri: ttsTargetUri,
      ttsApiKey: ttsApiKey,
    };
    const content = JSON.stringify(settings, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ai-agent-playground-settings.json';
    a.click();
    console.log('export: ' + content);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const e = event.target.files?.[0];
    if (!e) {
      alert('No file selected');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const settings = JSON.parse(e.target?.result as string);
        console.log(settings);
        // check settings
        if (!settings.endpoint || !settings.key || !settings.completionTargetUri || !settings.completionApiKey || !settings.cogSvcRegion || !settings.cogSvcSubKey || !settings.dallTargetUri || !settings.dallApiKey || !settings.feishuHook || !settings.quoteToken || !settings.newsKey || !settings.mxnzpAppId || !settings.mxnzpAppSecret || !settings.language) {
          alert('Import failed, Please check your settings.');
          return;
        }

        // update settings
        setEndpoint(settings.endpoint);
        setKey(settings.key);

        setCompletionTargetUri(settings.completionTargetUri);
        setCompletionApiKey(settings.completionApiKey);

        setCogSvcRegion(settings.cogSvcRegion);
        setCogSvcSubKey(settings.cogSvcSubKey);

        setDallTargetUri(settings.dallTargetUri);
        setDallApiKey(settings.dallApiKey);

        setGraphragUrl(settings.graphragUrl);
        setGraphragApiKey(settings.graphragApiKey);
        setGraphragProjectName(settings.graphragProjectName);
        setGraphragAbout(settings.graphragAbout);

        setFeishuHook(settings.feishuHook);
        setQuoteToken(settings.quoteToken);
        setNewsKey(settings.newsKey);
        setMxnzpAppId(settings.mxnzpAppId);
        setMxnzpAppSecret(settings.mxnzpAppSecret);
        setLanguage(settings.language);
        setAssistantType(settings.assistantType);

        setPrompt(settings.prompt);

        setTtsApiKey(settings.ttsApiKey);
        setTtsTargetUri(settings.ttsTargetUri);

        alert('Import success, Page will reload.');

        window.location.reload();

      } catch (error) {
        console.error(`import error: ${error}`);
      }

    };
    reader.readAsText(e);
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const SettingsImportExport = () => {
    return <div style={{ display: 'flex', gap: '15px' }}>

      <Button
        label={'Import'}
        icon={Upload}
        className={'export_settings'}
        buttonStyle={'regular'}
        onClick={handleButtonClick}
      />

      <Button
        label={'Export'}
        icon={Download}
        className={'export_settings'}
        buttonStyle={'regular'}
        onClick={handleExport}
      />

      <input
        type="file"
        accept=".json"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </div>;
  };

  const renderContent = () => {
    switch (activeTab) {
      case DEFAULT:
        return <DefaultSettings />;
      case REAL_TIME_API:
        return <SettingsRealtime />;
      case SPEECH:
        return <Speech />;
      case TTS:
        return <SettingsTTS />;
      case GRAPHRAG:
        return <GraphRAG />;
      case DALL_E:
        return <DALLE />;
      case COMPLETION:
        return <SettingsCompletion />;
      case TOKENS:
        return <SettingsTokens />;
      case PROMPT:
        return <Prompt />;
      case BING:
        return <Bing />;
      case IMPORT_EXPORT:
        return <SettingsImportExport />;
      default:
        return <DefaultSettings />;
    }
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const handleClick = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    window.location.reload();
  };

  return (
    <div className="content-actions" style={{ display: realtimeClientRef?.current?.isConnected() ? 'none' : '' }}>

      <Button className="container_bg"
        label={realtimeClientRef?.current?.isConnected() ? 'Disconnect to Settings' : 'Settings'}
        icon={Settings}
        disabled={realtimeClientRef?.current?.isConnected() ? true : false}
        onClick={handleClick}
      />

      {isModalOpen && (
        <div className="settings-modal">
          <div className="settings-modal-content">

            <button className="settings-modal-close" onClick={closeModal}><X /></button>

            <div className="settings-modal-header">Settings
              <div className="settings-label-tip">(Local Only)</div>
            </div>

            <div>
              <div className="settings-tab-buttons">
                <button onClick={() => setActiveTab(DEFAULT)}
                  className={activeTab === DEFAULT ? 'active' : ''}>{DEFAULT}</button>
                <button onClick={() => setActiveTab(REAL_TIME_API)}
                  className={activeTab === REAL_TIME_API ? 'active' : ''}>{REAL_TIME_API}</button>
                <button onClick={() => setActiveTab(SPEECH)}
                  className={activeTab === SPEECH ? 'active' : ''}>{SPEECH}</button>
                <button onClick={() => setActiveTab(TTS)}
                  className={activeTab === TTS ? 'active' : ''}>{TTS}</button>
                <button onClick={() => setActiveTab(COMPLETION)}
                  className={activeTab === COMPLETION ? 'active' : ''}>{COMPLETION}</button>
                <button onClick={() => setActiveTab(DALL_E)}
                  className={activeTab === DALL_E ? 'active' : ''}>{DALL_E}</button>
                <button onClick={() => setActiveTab(PROMPT)}
                  className={activeTab === PROMPT ? 'active' : ''}>{PROMPT}</button>
                <button onClick={() => setActiveTab(BING)}
                  className={activeTab === BING ? 'active' : ''}>{BING}</button>
                <button onClick={() => setActiveTab(GRAPHRAG)}
                  className={activeTab === GRAPHRAG ? 'active' : ''}>{GRAPHRAG}</button>
                <button onClick={() => setActiveTab(TOKENS)}
                  className={activeTab === TOKENS ? 'active' : ''}>{TOKENS}</button>
                <button onClick={() => setActiveTab(IMPORT_EXPORT)}
                  className={activeTab === IMPORT_EXPORT ? 'active' : ''}>{IMPORT_EXPORT}</button>
              </div>

              <div className="tab-content">
                {renderContent()}
              </div>

            </div>


          </div>
        </div>
      )}

    </div>
  );
};

export default SettingsComponent;
