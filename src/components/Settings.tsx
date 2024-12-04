import React, { useEffect, useRef, useState } from 'react';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa';
import { Download, Settings, Upload, X } from 'react-feather';
import { Button } from './button/Button';
import './Settings.scss';
import { RealtimeClient } from '@theodoreniu/realtime-api-beta';
import Dropdown from './Dropdown';
import { GRAPHRAG_ABOUT } from '../tools/azure_docs';
import { ASSISTENT_TYPE_ASSISTANT, ASSISTENT_TYPE_DEFAULT, ASSISTENT_TYPE_REALTIME } from '../lib/const';
import { useContexts } from '../AppProvider';

interface ChildComponentProps {
  client: RealtimeClient;
}

const SettingsComponent: React.FC<ChildComponentProps> = ({ client }) => {
  const { debug } = useContexts();
  const [isVisible, setIsVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const supportedLanguages = [
    { value: 'chinese', label: 'Chinese' },
    { value: 'english', label: 'English' }
  ];

  const supportedAssistanTypes = debug ? [
    { value: ASSISTENT_TYPE_REALTIME, label: 'Realtime' },
    { value: ASSISTENT_TYPE_ASSISTANT, label: 'STT -> Assistant -> TTS' }
  ] : [
    { value: ASSISTENT_TYPE_REALTIME, label: 'Realtime' }
  ];

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
    const [language, setSelected] = useState<string>(localStorage.getItem('language') || 'chinese');
    const [assistanType, setAssistanType] = useState<string>(localStorage.getItem('assistanType') || ASSISTENT_TYPE_DEFAULT);

    const handleDropdownChange = (value: string) => {
      setSelected(value);
    };

    const handleAssistanTypeChange = (value: string) => {
      setAssistanType(value);
    };

    useEffect(() => {
      localStorage.setItem('language', language);
      localStorage.setItem('assistanType', assistanType);
    }, [language, assistanType]);

    return <div>

      <div className="settings-label">Assistant Type</div>
      <Dropdown options={supportedAssistanTypes} selectedValue={assistanType} onChange={handleAssistanTypeChange} />

      <div className="settings-label">Default Language</div>
      <Dropdown options={supportedLanguages} selectedValue={language} onChange={handleDropdownChange} />

    </div>;
  };

  const SettingsRealtime = () => {
    const [endpoint, setEndpoint] = useState(localStorage.getItem('endpoint') || '');
    const [key, setKey] = useState(localStorage.getItem('key') || '');

    useEffect(() => {
      localStorage.setItem('endpoint', endpoint);
      localStorage.setItem('key', key);
    }, [endpoint, key]);

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

  const DALLE = () => {
    const [dallTargetUri, setDallTargetUri] = useState(localStorage.getItem('dallTargetUri') || '');
    const [dallApiKey, setDallApiKey] = useState(localStorage.getItem('dallApiKey') || '');

    useEffect(() => {
      localStorage.setItem('dallTargetUri', dallTargetUri);
      localStorage.setItem('dallApiKey', dallApiKey);
    }, [dallTargetUri, dallApiKey]);

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
    const [graphragApiKey, setGraphragApiKey] = useState(localStorage.getItem('graphragApiKey') || '');
    const [graphragProjectName, setGraphragProjectName] = useState(localStorage.getItem('graphragProjectName') || '');
    const [graphragAbout, setGraphragAbout] = useState(localStorage.getItem('graphragAbout') || GRAPHRAG_ABOUT);

    useEffect(() => {
      localStorage.setItem('graphragUrl', graphragUrl);
      localStorage.setItem('graphragApiKey', graphragApiKey);
      localStorage.setItem('graphragProjectName', graphragProjectName);
      localStorage.setItem('graphragAbout', graphragAbout);
    }, [graphragUrl, graphragApiKey, graphragProjectName, graphragAbout]);

    const [graphragCache, setGraphragCache] = useState<string>(localStorage.getItem('graphragCache') || 'Disable');

    const graphragCacheOptions = [
      { value: 'Enable', label: 'Enable' },
      { value: 'Disable', label: 'Disable' }
    ];

    const handleGraphragCacheChange = (value: string) => {
      setGraphragCache(value);
    };

    useEffect(() => {
      localStorage.setItem('graphragCache', graphragCache);
    }, [graphragCache]);

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

      <div className="settings-label">API Cache</div>
      <Dropdown options={graphragCacheOptions} selectedValue={graphragCache} onChange={handleGraphragCacheChange} />
    </div>;
  };

  const Speech = () => {
    const [cogSvcRegion, setCogSvcRegion] = useState(localStorage.getItem('cogSvcRegion') || 'westus2');
    const [cogSvcSubKey, setCogSvcSubKey] = useState(localStorage.getItem('cogSvcSubKey') || '');
    const [privateEndpoint, setPrivateEndpoint] = useState(localStorage.getItem('privateEndpoint') || '');

    useEffect(() => {
      localStorage.setItem('cogSvcSubKey', cogSvcSubKey);
      localStorage.setItem('cogSvcRegion', cogSvcRegion);
      localStorage.setItem('privateEndpoint', privateEndpoint);
    }, [cogSvcSubKey, cogSvcRegion, privateEndpoint]);

    const handleCogSvcSubKeyChange = (e: any) => {
      setCogSvcSubKey(e.target.value);
    };

    const handleCogSvcRegionChange = (e: any) => {
      setCogSvcRegion(e.target.value);
    };

    const handlePrivateEndpointChange = (e: any) => {
      setPrivateEndpoint(e.target.value);
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

  const SettingsCompletion = () => {
    const [completionTargetUri, setCompletionTargetUri] = useState(localStorage.getItem('completionTargetUri') || '');
    const [completionApiKey, setCompletionApiKey] = useState(localStorage.getItem('completionApiKey') || '');

    useEffect(() => {
      localStorage.setItem('completionTargetUri', completionTargetUri);
      localStorage.setItem('completionApiKey', completionApiKey);
    }, [completionTargetUri, completionApiKey]);

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

    const ALLOW_CHARACTERS = 1500;

    return <div>
      <textarea
        className="settings-input"
        value={prompt}
        style={{ fontSize: '12px' }}
        placeholder={''}
        rows={20}
        maxLength={ALLOW_CHARACTERS}
        onChange={handlePromptChange}
      />
      <div className="settings-label">Remaining Characters: {ALLOW_CHARACTERS - prompt.length}</div>
    </div>;
  };

  const handleExport = () => {
    // get all settings to json obejct and base64 encode
    const settings = {
      endpoint: localStorage.getItem('endpoint') || '',
      key: localStorage.getItem('key') || '',
      completionTargetUri: localStorage.getItem('completionTargetUri') || '',
      completionApiKey: localStorage.getItem('completionApiKey') || '',
      cogSvcRegion: localStorage.getItem('cogSvcRegion') || '',
      cogSvcSubKey: localStorage.getItem('cogSvcSubKey') || '',
      dallTargetUri: localStorage.getItem('dallTargetUri') || '',
      dallApiKey: localStorage.getItem('dallApiKey') || '',

      graphragUrl: localStorage.getItem('graphragUrl') || '',
      graphragApiKey: localStorage.getItem('graphragApiKey') || '',
      graphragProjectName: localStorage.getItem('graphragProjectName') || '',
      graphragCache: localStorage.getItem('graphragCache') || 'false',
      graphragAbout: localStorage.getItem('graphragAbout') || GRAPHRAG_ABOUT,

      prompt: localStorage.getItem('prompt') || '',

      feishuHook: localStorage.getItem('feishuHook') || '',
      quoteToken: localStorage.getItem('quoteToken') || '',
      newsKey: localStorage.getItem('newsKey') || '',
      mxnzpAppId: localStorage.getItem('mxnzpAppId') || '',
      mxnzpAppSecret: localStorage.getItem('mxnzpAppSecret') || '',
      language: localStorage.getItem('language') || '',
      assistentType: localStorage.getItem('assistanType') || ASSISTENT_TYPE_DEFAULT
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
        localStorage.setItem('endpoint', settings.endpoint);
        localStorage.setItem('key', settings.key);

        localStorage.setItem('completionTargetUri', settings.completionTargetUri);
        localStorage.setItem('completionApiKey', settings.completionApiKey);

        localStorage.setItem('cogSvcRegion', settings.cogSvcRegion);
        localStorage.setItem('cogSvcSubKey', settings.cogSvcSubKey);

        localStorage.setItem('dallTargetUri', settings.dallTargetUri);
        localStorage.setItem('dallApiKey', settings.dallApiKey);

        localStorage.setItem('graphragUrl', settings.graphragUrl);
        localStorage.setItem('graphragApiKey', settings.graphragApiKey);
        localStorage.setItem('graphragProjectName', settings.graphragProjectName);
        localStorage.setItem('graphragCache', settings.graphragCache);
        localStorage.setItem('graphragAbout', settings.graphragAbout);

        localStorage.setItem('feishuHook', settings.feishuHook);
        localStorage.setItem('quoteToken', settings.quoteToken);
        localStorage.setItem('newsKey', settings.newsKey);
        localStorage.setItem('mxnzpAppId', settings.mxnzpAppId);
        localStorage.setItem('mxnzpAppSecret', settings.mxnzpAppSecret);
        localStorage.setItem('language', settings.language);
        localStorage.setItem('assistanType', settings.assistanType);

        localStorage.setItem('prompt', settings.prompt);

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

  const SettingsTokens = () => {
    const [feishuHook, setFeishuHook] = useState(localStorage.getItem('feishuHook') || '');
    const [quoteToken, setQuoteToken] = useState(localStorage.getItem('quoteToken') || '');
    const [newsKey, setNewsKey] = useState(localStorage.getItem('newsKey') || '');

    useEffect(() => {
      localStorage.setItem('feishuHook', feishuHook);
      localStorage.setItem('quoteToken', quoteToken);
      localStorage.setItem('newsKey', newsKey);
    }, [feishuHook, quoteToken, newsKey]);

    const handleFeishuHookChange = (e: any) => {
      setFeishuHook(e.target.value);
    };

    const handleQuoteTokenChange = (e: any) => {
      setQuoteToken(e.target.value);
    };

    const handleNewsKeyChange = (e: any) => {
      setNewsKey(e.target.value);
    };


    const [mxnzpAppId, setMxnzpAppId] = useState(localStorage.getItem('mxnzpAppId') || '');
    const [mxnzpAppSecret, setMxnzpAppSecret] = useState(localStorage.getItem('mxnzpAppSecret') || '');

    useEffect(() => {
      localStorage.setItem('mxnzpAppId', mxnzpAppId);
      localStorage.setItem('mxnzpAppSecret', mxnzpAppSecret);
    }, [mxnzpAppId, mxnzpAppSecret]);

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

  const DEFAULT = 'Default';
  const REAL_TIME_API = 'Realtime';
  const DALL_E = 'Dall-E-3';
  const GRAPHRAG = 'GraphRAG';
  const SPEECH = 'Speech';
  const COMPLETION = 'Completion';
  const TOKENS = 'Third-party API';
  const PROMPT = 'Prompt';
  const IMPORT_EXPORT = 'Import/Export';

  const [activeTab, setActiveTab] = useState(DEFAULT);

  const renderContent = () => {
    switch (activeTab) {
      case DEFAULT:
        return <DefaultSettings />;
      case REAL_TIME_API:
        return <SettingsRealtime />;
      case SPEECH:
        return <Speech />;
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
    <div className="content-actions" style={{ display: client.isConnected() ? 'none' : '' }}>


      <Button className="container_bg"
        label={client.isConnected() ? 'Disconnect to Settings' : 'Settings'}
        icon={Settings}
        disabled={client.isConnected() ? true : false}
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
                <button onClick={() => setActiveTab(COMPLETION)}
                  className={activeTab === COMPLETION ? 'active' : ''}>{COMPLETION}</button>
                <button onClick={() => setActiveTab(DALL_E)}
                  className={activeTab === DALL_E ? 'active' : ''}>{DALL_E}</button>
                <button onClick={() => setActiveTab(GRAPHRAG)}
                  className={activeTab === GRAPHRAG ? 'active' : ''}>{GRAPHRAG}</button>
                <button onClick={() => setActiveTab(TOKENS)}
                  className={activeTab === TOKENS ? 'active' : ''}>{TOKENS}</button>
                <button onClick={() => setActiveTab(PROMPT)}
                  className={activeTab === PROMPT ? 'active' : ''}>{PROMPT}</button>
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
