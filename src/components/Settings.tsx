import React, { useEffect, useRef, useState } from 'react';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa';
import { Download, Settings, Upload, X } from 'react-feather';
import { Button } from './button/Button';
import './Settings.scss';
import Dropdown from './Dropdown';
import { GRAPHRAG_ABOUT } from '../tools/azure_docs';
import {
  ALLOW_PROMPT_CHARACTERS,
  ASSISTENT_TYPE_ASSISTANT,
  ASSISTENT_TYPE_REALTIME,
  CONNECT_CONNECTED,
} from '../lib/const';

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

const supportedLanguages = [
  { value: 'chinese', label: 'Chinese' },
  { value: 'english', label: 'English' },
];

const supportedAssistantTypes = [
  { value: ASSISTENT_TYPE_REALTIME, label: 'Realtime' },
  { value: ASSISTENT_TYPE_ASSISTANT, label: 'STT -> Assistant -> TTS' },
];

const SettingsComponent: React.FC<{
  connectStatus: string;
}> = ({ connectStatus }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const handleChange = (name: string, value: string) => {
    console.log(name, value);
    localStorage.setItem(name, value);
  };

  const DefaultSettings = () => {
    const [language, setLanguage] = useState(
      localStorage.getItem('language') || 'chinese',
    );
    const [assistantType, setAssistantType] = useState(
      localStorage.getItem('assistantType') || ASSISTENT_TYPE_REALTIME,
    );

    return (
      <div>
        <div className="settings-label">Assistant Type</div>
        <Dropdown
          options={supportedAssistantTypes}
          selectedValue={assistantType}
          onChange={(e) => {
            setAssistantType(e);
            handleChange('assistantType', e);
          }}
        />

        <div className="settings-label">Default Language</div>
        <Dropdown
          options={supportedLanguages}
          selectedValue={language}
          onChange={(e) => {
            setLanguage(e);
            handleChange('language', e);
          }}
        />

        <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
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
        </div>
      </div>
    );
  };

  const Realtime = () => {
    const [endpoint, setEndpoint] = useState(
      localStorage.getItem('endpoint') || '',
    );
    const [key, setKey] = useState(localStorage.getItem('key') || '');

    return (
      <div>
        <div className="settings-label">Target URI</div>
        <input
          type={'text'}
          className="settings-input"
          value={endpoint}
          placeholder={
            'https://xxx.openai.azure.com/openai/realtime?api-version=2024-10-01-preview&deployment=xxx'
          }
          onChange={(e) => {
            setEndpoint(e.target.value);
            handleChange('endpoint', e.target.value);
          }}
        />

        <div className="settings-label">
          Key
          <span className="settings-label-show" onClick={toggleVisibility}>
            {isVisible ? <FaRegEye /> : <FaRegEyeSlash />}
          </span>
        </div>
        <input
          type={isVisible ? 'text' : 'password'}
          className="settings-input"
          value={key}
          placeholder={''}
          onChange={(e) => {
            setKey(e.target.value);
            handleChange('key', e.target.value);
          }}
        />
      </div>
    );
  };

  const SettingsTTS = () => {
    const [ttsTargetUri, setTtsTargetUri] = useState(
      localStorage.getItem('ttsTargetUri') || '',
    );
    const [ttsApiKey, setTtsApiKey] = useState(
      localStorage.getItem('ttsApiKey') || '',
    );

    return (
      <div>
        <div className="settings-label">Target URI</div>
        <input
          type={'text'}
          className="settings-input"
          value={ttsTargetUri}
          placeholder={
            'https://xxxx.openai.azure.com/openai/deployments/tts/audio/speech?api-version=2024-05-01-preview'
          }
          onChange={(e) => {
            setTtsTargetUri(e.target.value);
            handleChange('ttsTargetUri', e.target.value);
          }}
        />

        <div className="settings-label">
          Key
          <span className="settings-label-show" onClick={toggleVisibility}>
            {isVisible ? <FaRegEye /> : <FaRegEyeSlash />}
          </span>
        </div>
        <input
          type={isVisible ? 'text' : 'password'}
          className="settings-input"
          value={ttsApiKey}
          placeholder={''}
          onChange={(e) => {
            setTtsApiKey(e.target.value);
            handleChange('ttsApiKey', e.target.value);
          }}
        />
      </div>
    );
  };

  const DALLE = () => {
    const [dallTargetUri, setDallTargetUri] = useState(
      localStorage.getItem('dallTargetUri') || '',
    );
    const [dallApiKey, setDallApiKey] = useState(
      localStorage.getItem('dallApiKey') || '',
    );

    return (
      <div>
        <div className="settings-label">Target URI</div>
        <input
          type={'text'}
          className="settings-input"
          value={dallTargetUri}
          placeholder={
            'https://xxx.openai.azure.com/openai/deployments/dall-e-3/images/generations?api-version=2024-02-01'
          }
          onChange={(e) => {
            setDallTargetUri(e.target.value);
            handleChange('dallTargetUri', e.target.value);
          }}
        />

        <div className="settings-label">
          Key
          <span className="settings-label-show" onClick={toggleVisibility}>
            {isVisible ? <FaRegEye /> : <FaRegEyeSlash />}
          </span>
        </div>
        <input
          type={isVisible ? 'text' : 'password'}
          className="settings-input"
          value={dallApiKey}
          placeholder={''}
          onChange={(e) => {
            setDallApiKey(e.target.value);
            handleChange('dallApiKey', e.target.value);
          }}
        />
      </div>
    );
  };

  const GraphRAG = () => {
    const [graphragUrl, setGraphragUrl] = useState(
      localStorage.getItem('graphragUrl') || '',
    );
    const [graphragApiKey, setGraphragApiKey] = useState(
      localStorage.getItem('graphragApiKey') || '',
    );
    const [graphragProjectName, setGraphragProjectName] = useState(
      localStorage.getItem('graphragProjectName') || '',
    );
    const [graphragAbout, setGraphragAbout] = useState(
      localStorage.getItem('graphragAbout') || '',
    );

    return (
      <div>
        <div className="settings-tip">
          Currently only local search is supported.{' '}
          <a href="https://github.com/TheodoreNiu/graphrag_kit" target="_blank">
            How to deploy a GraphRAG API?
          </a>
        </div>
        <div className="settings-label">API URL</div>
        <input
          type={'text'}
          className="settings-input"
          value={graphragUrl}
          placeholder={'https://xxx.xxx.xxx.azurecontainerapps.io'}
          onChange={(e) => {
            setGraphragUrl(e.target.value);
            handleChange('graphragUrl', e.target.value);
          }}
        />

        <div className="settings-label">
          API Key
          <span className="settings-label-show" onClick={toggleVisibility}>
            {isVisible ? <FaRegEye /> : <FaRegEyeSlash />}
          </span>
        </div>
        <input
          type={isVisible ? 'text' : 'password'}
          className="settings-input"
          value={graphragApiKey}
          placeholder={''}
          onChange={(e) => {
            setGraphragApiKey(e.target.value);
            handleChange('graphragApiKey', e.target.value);
          }}
        />

        <div className="settings-label">Project Name</div>
        <input
          type={'text'}
          className="settings-input"
          value={graphragProjectName}
          placeholder={''}
          onChange={(e) => {
            setGraphragProjectName(e.target.value);
            handleChange('graphragProjectName', e.target.value);
          }}
        />

        <div className="settings-label">About</div>
        <input
          type={'text'}
          className="settings-input"
          value={graphragAbout}
          placeholder={GRAPHRAG_ABOUT}
          onChange={(e) => {
            setGraphragAbout(e.target.value);
            handleChange('graphragAbout', e.target.value);
          }}
        />
      </div>
    );
  };

  const Speech = () => {
    const [cogSvcRegion, setCogSvcRegion] = useState(
      localStorage.getItem('cogSvcRegion') || '',
    );
    const [cogSvcSubKey, setCogSvcSubKey] = useState(
      localStorage.getItem('cogSvcSubKey') || '',
    );

    return (
      <div>
        <div className="settings-label">Region</div>
        <input
          type={'text'}
          className="settings-input"
          value={cogSvcRegion}
          placeholder={'westus2'}
          onChange={(e) => {
            setCogSvcRegion(e.target.value);
            handleChange('cogSvcRegion', e.target.value);
          }}
        />

        <div className="settings-label">
          Subscription Key
          <span className="settings-label-show" onClick={toggleVisibility}>
            {isVisible ? <FaRegEye /> : <FaRegEyeSlash />}
          </span>
        </div>
        <input
          type={isVisible ? 'text' : 'password'}
          className="settings-input"
          value={cogSvcSubKey}
          placeholder={''}
          onChange={(e) => {
            setCogSvcSubKey(e.target.value);
            handleChange('cogSvcSubKey', e.target.value);
          }}
        />
      </div>
    );
  };

  const Bing = () => {
    const [bingApiKey, setBingApiKey] = useState(
      localStorage.getItem('bingApiKey') || '',
    );

    return (
      <div>
        <div className="settings-label">
          Key
          <span className="settings-label-show" onClick={toggleVisibility}>
            {isVisible ? <FaRegEye /> : <FaRegEyeSlash />}
          </span>
        </div>
        <input
          type={isVisible ? 'text' : 'password'}
          className="settings-input"
          value={bingApiKey}
          placeholder={''}
          onChange={(e) => {
            setBingApiKey(e.target.value);
            handleChange('bingApiKey', e.target.value);
          }}
        />

        <div className="settings-label">Endpoint</div>
        <input
          type={'text'}
          className="settings-input"
          disabled
          onChange={(e) => {
            handleChange('bingEndpoint', e.target.value);
          }}
          value={'https://api.bing.microsoft.com/'}
        />

        <div className="settings-label">Location</div>
        <input
          type={'text'}
          className="settings-input"
          disabled
          onChange={(e) => {
            handleChange('bingLocation', e.target.value);
          }}
          value={'global'}
        />
      </div>
    );
  };

  const Completion = () => {
    const [completionTargetUri, setCompletionTargetUri] = useState(
      localStorage.getItem('completionTargetUri') || '',
    );
    const [completionApiKey, setCompletionApiKey] = useState(
      localStorage.getItem('completionApiKey') || '',
    );

    return (
      <div>
        <div className="settings-label">Target URI</div>
        <input
          type={'text'}
          className="settings-input"
          value={completionTargetUri}
          placeholder={
            'https://xxxx.openai.azure.com/openai/deployments/gpt-4o-mini/chat/completions?api-version=2024-08-01-preview'
          }
          onChange={(e) => {
            setCompletionTargetUri(e.target.value);
            handleChange('completionTargetUri', e.target.value);
          }}
        />

        <div className="settings-label">
          Key
          <span className="settings-label-show" onClick={toggleVisibility}>
            {isVisible ? <FaRegEye /> : <FaRegEyeSlash />}
          </span>
        </div>
        <input
          type={isVisible ? 'text' : 'password'}
          className="settings-input"
          value={completionApiKey}
          placeholder={''}
          onChange={(e) => {
            setCompletionApiKey(e.target.value);
            handleChange('completionApiKey', e.target.value);
          }}
        />
      </div>
    );
  };

  const Prompt = () => {
    const [prompt, setPrompt] = useState(localStorage.getItem('prompt') || '');

    return (
      <div>
        <textarea
          className="settings-input"
          value={prompt}
          style={{ fontSize: '12px' }}
          placeholder={''}
          rows={20}
          maxLength={ALLOW_PROMPT_CHARACTERS}
          onChange={(e) => {
            setPrompt(e.target.value);
            handleChange('prompt', e.target.value);
          }}
        />
        <div className="settings-label">
          Remaining Characters: {ALLOW_PROMPT_CHARACTERS - prompt.length}
        </div>
      </div>
    );
  };

  const Tokens = () => {
    const [feishuHook, setFeishuHook] = useState(
      localStorage.getItem('feishuHook') || '',
    );

    const [quoteToken, setQuoteToken] = useState(
      localStorage.getItem('quoteToken') || '',
    );

    const [newsKey, setNewsKey] = useState(
      localStorage.getItem('newsKey') || '',
    );

    const [mxnzpAppId, setMxnzpAppId] = useState(
      localStorage.getItem('mxnzpAppId') || '',
    );

    const [mxnzpAppSecret, setMxnzpAppSecret] = useState(
      localStorage.getItem('mxnzpAppSecret') || '',
    );

    return (
      <div>
        <div className="settings-label">
          <a
            href="https://open.feishu.cn/open-apis/bot/v2/hook/xxx"
            target="_blank"
          >
            Feishu Bot
          </a>
          <span className="settings-label-show" onClick={toggleVisibility}>
            {isVisible ? <FaRegEye /> : <FaRegEyeSlash />}
          </span>
        </div>
        <input
          type={isVisible ? 'text' : 'password'}
          className="settings-input"
          value={feishuHook}
          placeholder={''}
          onChange={(e) => {
            setFeishuHook(e.target.value);
            handleChange('feishuHook', e.target.value);
          }}
        />

        <div className="settings-label">
          <a href="https://finnhub.io/" target="_blank">
            Finnhub
          </a>
          <span className="settings-label-show" onClick={toggleVisibility}>
            {isVisible ? <FaRegEye /> : <FaRegEyeSlash />}
          </span>
        </div>
        <input
          type={isVisible ? 'text' : 'password'}
          className="settings-input"
          value={quoteToken}
          placeholder={''}
          onChange={(e) => {
            setQuoteToken(e.target.value);
            handleChange('quoteToken', e.target.value);
          }}
        />

        <div className="settings-label">
          <a href="https://www.showapi.com/" target="_blank">
            News
          </a>
          <span className="settings-label-show" onClick={toggleVisibility}>
            {isVisible ? <FaRegEye /> : <FaRegEyeSlash />}
          </span>
        </div>
        <input
          type={isVisible ? 'text' : 'password'}
          className="settings-input"
          value={newsKey}
          placeholder={''}
          onChange={(e) => {
            setNewsKey(e.target.value);
            handleChange('newsKey', e.target.value);
          }}
        />

        <div className="settings_inline">
          <div className="block">
            <div className="settings-label">
              <a href="https://www.mxnzp.com/" target="_blank">
                Mxnzp AppId
              </a>
            </div>
            <input
              type={'text'}
              className="settings-input"
              value={mxnzpAppId}
              placeholder={''}
              onChange={(e) => {
                setMxnzpAppId(e.target.value);
                handleChange('mxnzpAppId', e.target.value);
              }}
            />
          </div>

          <div className="block">
            <div className="settings-label">
              <a href="https://www.mxnzp.com/" target="_blank">
                Mxnzp AppSecret
              </a>
              <span className="settings-label-show" onClick={toggleVisibility}>
                {isVisible ? <FaRegEye /> : <FaRegEyeSlash />}
              </span>
            </div>
            <input
              type={isVisible ? 'text' : 'password'}
              className="settings-input"
              value={mxnzpAppSecret}
              placeholder={''}
              onChange={(e) => {
                setMxnzpAppSecret(e.target.value);
                handleChange('mxnzpAppSecret', e.target.value);
              }}
            />
          </div>
        </div>
      </div>
    );
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
      graphragAbout: localStorage.getItem('graphragAbout') || '',

      assistantType: localStorage.getItem('assistantType') || '',
      language: localStorage.getItem('language') || '',
      prompt: localStorage.getItem('prompt') || '',

      feishuHook: localStorage.getItem('feishuHook') || '',
      quoteToken: localStorage.getItem('quoteToken') || '',
      newsKey: localStorage.getItem('newsKey') || '',
      mxnzpAppId: localStorage.getItem('mxnzpAppId') || '',
      mxnzpAppSecret: localStorage.getItem('mxnzpAppSecret') || '',

      ttsTargetUri: localStorage.getItem('ttsTargetUri') || '',
      ttsApiKey: localStorage.getItem('ttsApiKey') || '',
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

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
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
        if (
          !settings.endpoint ||
          !settings.key ||
          !settings.completionTargetUri ||
          !settings.completionApiKey ||
          !settings.cogSvcRegion ||
          !settings.cogSvcSubKey ||
          !settings.dallTargetUri ||
          !settings.dallApiKey ||
          !settings.feishuHook ||
          !settings.quoteToken ||
          !settings.newsKey ||
          !settings.mxnzpAppId ||
          !settings.mxnzpAppSecret ||
          !settings.language
        ) {
          alert('Import failed, Please check your settings.');
          return;
        }

        // update settings
        handleChange('endpoint', settings.endpoint);
        handleChange('key', settings.key);

        handleChange('completionTargetUri', settings.completionTargetUri);
        handleChange('completionApiKey', settings.completionApiKey);

        handleChange('cogSvcRegion', settings.cogSvcRegion);
        handleChange('cogSvcSubKey', settings.cogSvcSubKey);

        handleChange('dallTargetUri', settings.dallTargetUri);
        handleChange('dallApiKey', settings.dallApiKey);

        handleChange('graphragUrl', settings.graphragUrl);
        handleChange('graphragApiKey', settings.graphragApiKey);
        handleChange('graphragProjectName', settings.graphragProjectName);
        handleChange('graphragAbout', settings.graphragAbout);

        handleChange('feishuHook', settings.feishuHook);
        handleChange('quoteToken', settings.quoteToken);
        handleChange('newsKey', settings.newsKey);
        handleChange('mxnzpAppId', settings.mxnzpAppId);
        handleChange('mxnzpAppSecret', settings.mxnzpAppSecret);
        handleChange('language', settings.language);
        handleChange('assistantType', settings.assistantType);

        handleChange('prompt', settings.prompt);

        handleChange('ttsApiKey', settings.ttsApiKey);
        handleChange('ttsTargetUri', settings.ttsTargetUri);

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

  const renderContent = () => {
    switch (activeTab) {
      case DEFAULT:
        return <DefaultSettings />;
      case REAL_TIME_API:
        return <Realtime />;
      case SPEECH:
        return <Speech />;
      case TTS:
        return <SettingsTTS />;
      case GRAPHRAG:
        return <GraphRAG />;
      case DALL_E:
        return <DALLE />;
      case COMPLETION:
        return <Completion />;
      case TOKENS:
        return <Tokens />;
      case PROMPT:
        return <Prompt />;
      case BING:
        return <Bing />;
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

  return connectStatus === CONNECT_CONNECTED ? null : (
    <div
      className="content-actions"
      style={{
        display: connectStatus === CONNECT_CONNECTED ? 'none' : '',
      }}
    >
      <Button
        className="container_bg"
        label={
          connectStatus === CONNECT_CONNECTED
            ? 'Disconnect to Settings'
            : 'Settings'
        }
        icon={Settings}
        disabled={connectStatus === CONNECT_CONNECTED ? true : false}
        onClick={handleClick}
      />

      {isModalOpen && (
        <div className="settings-modal">
          <div className="settings-modal-content">
            <button className="settings-modal-close" onClick={closeModal}>
              <X />
            </button>

            <div className="settings-modal-header">
              Settings
              <div className="settings-label-tip">(Local Only)</div>
            </div>

            <div>
              <div className="settings-tab-buttons">
                <button
                  onClick={() => setActiveTab(DEFAULT)}
                  className={activeTab === DEFAULT ? 'active' : ''}
                >
                  {DEFAULT}
                </button>
                <button
                  onClick={() => setActiveTab(REAL_TIME_API)}
                  className={activeTab === REAL_TIME_API ? 'active' : ''}
                >
                  {REAL_TIME_API}
                </button>
                <button
                  onClick={() => setActiveTab(PROMPT)}
                  className={activeTab === PROMPT ? 'active' : ''}
                >
                  {PROMPT}
                </button>
                <button
                  onClick={() => setActiveTab(SPEECH)}
                  className={activeTab === SPEECH ? 'active' : ''}
                >
                  {SPEECH}
                </button>
                <button
                  onClick={() => setActiveTab(TTS)}
                  className={activeTab === TTS ? 'active' : ''}
                >
                  {TTS}
                </button>
                <button
                  onClick={() => setActiveTab(COMPLETION)}
                  className={activeTab === COMPLETION ? 'active' : ''}
                >
                  {COMPLETION}
                </button>
                <button
                  onClick={() => setActiveTab(DALL_E)}
                  className={activeTab === DALL_E ? 'active' : ''}
                >
                  {DALL_E}
                </button>
                <button
                  onClick={() => setActiveTab(BING)}
                  className={activeTab === BING ? 'active' : ''}
                >
                  {BING}
                </button>
                <button
                  onClick={() => setActiveTab(GRAPHRAG)}
                  className={activeTab === GRAPHRAG ? 'active' : ''}
                >
                  {GRAPHRAG}
                </button>
                <button
                  onClick={() => setActiveTab(TOKENS)}
                  className={activeTab === TOKENS ? 'active' : ''}
                >
                  {TOKENS}
                </button>
              </div>

              <div className="tab-content">{renderContent()}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsComponent;
