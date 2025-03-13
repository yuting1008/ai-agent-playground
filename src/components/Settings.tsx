import React, { useEffect, useRef, useState } from 'react';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa';
import { Download, Settings, Upload, X } from 'react-feather';
import { Button } from './button/Button';
import Dropdown from './Dropdown';
import { GRAPHRAG_ABOUT } from '../tools/azure_docs';
import {
  ALLOW_FUNCTIONS_CHARACTERS,
  ALLOW_PROMPT_CHARACTERS,
  ASSISTANT_TYPE_ASSISTANT,
  ASSISTANT_TYPE_DEEPSEEK,
  ASSISTANT_TYPE_REALTIME,
  BUILD_IN_FUNCTIONS_DISABLE,
  BUILD_IN_FUNCTIONS_ENABLE,
  BUILD_IN_PROMPT_DISABLE,
  BUILD_IN_PROMPT_ENABLE,
  CONNECT_CONNECTED,
  DEEPSEEK_FUNCTION_CALL_DISABLE,
  DEEPSEEK_FUNCTION_CALL_ENABLE,
} from '../lib/const';
import { useContexts } from '../providers/AppProvider';
import { getAppName } from '../lib/helper';

const DEFAULT = 'Default';
const REAL_TIME_API = 'Realtime';
const DALL_E = 'Dall-E-3';
const GRAPHRAG = 'GraphRAG';
const SPEECH = 'Speech';
const TTS = 'TTS';
const COMPLETION = 'Completion';
const DEEPSEEK = 'DeepSeek';
const TOKENS = 'Third API';
const FUNCTIONS = 'Functions';
const PROMPT = 'Prompt';
const BING = 'Bing';

const supportedLanguages = [
  { value: 'chinese', label: 'Chinese' },
  { value: 'english', label: 'English' },
];

const supportedAssistantTypes = [
  { value: ASSISTANT_TYPE_REALTIME, label: 'Realtime' },
  { value: ASSISTANT_TYPE_ASSISTANT, label: 'STT -> Assistant -> TTS' },
  { value: ASSISTANT_TYPE_DEEPSEEK, label: 'STT -> DeepSeek -> TTS' },
];

const deepSeekFunctionCallingTypes = [
  { value: DEEPSEEK_FUNCTION_CALL_DISABLE, label: 'Disable' },
  { value: DEEPSEEK_FUNCTION_CALL_ENABLE, label: 'Enable' },
];

const buildInFunctionsOptions = [
  { value: BUILD_IN_FUNCTIONS_ENABLE, label: 'Enable' },
  { value: BUILD_IN_FUNCTIONS_DISABLE, label: 'Disable' },
];

const buildInPromptOptions = [
  { value: BUILD_IN_PROMPT_ENABLE, label: 'Enable' },
  { value: BUILD_IN_PROMPT_DISABLE, label: 'Disable' },
];

const SettingsComponent: React.FC<{
  connectStatus: string;
}> = ({ connectStatus }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(DEFAULT);
  const { resetApp, isNightMode } = useContexts();

  const styles = {
    link: {
      color: isNightMode ? '#dddddd' : '#3e3e47',
    },
    settingsModal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 990000,
    } as React.CSSProperties,
    settingsModalContent: {
      backgroundColor: isNightMode ? '#262525' : '#ededed',
      padding: '20px',
      borderRadius: '8px',
      color: isNightMode ? '#dddddf' : '#3e3e47',
      width: '80%',
      maxWidth: '900px',
      maxHeight: '80%',
      overflowY: 'auto',
    } as React.CSSProperties,
    settingsModalHeader: {
      fontSize: '20px',
      marginBottom: '14px',
    } as React.CSSProperties,
    settingsModalClose: {
      marginBottom: '10px',
      cursor: 'pointer',
      border: 'none',
      float: 'right',
      fontSize: '14px',
      backgroundColor: 'transparent',

      '&:hover': {
        color: isNightMode ? '#a8a7a7' : '#515050',
      },
    } as React.CSSProperties,
    settingModalImageContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '10px',
    } as React.CSSProperties,
    settingModalImage: {
      width: '100px',
      height: '100px',
      objectFit: 'cover',
    } as React.CSSProperties,
    tabActive: {
      backgroundColor: isNightMode ? '#0a0909' : '#ccc',
    } as React.CSSProperties,
    settingsTabButtons: {
      display: 'flex',
      gap: '-1px',
      marginTop: '20px',
      marginBottom: '20px',
    } as React.CSSProperties,
    settingsTabButton: {
      backgroundColor: 'transparent',
      border: '1px solid #b2b1b1',
      padding: '8px 10px',
      cursor: 'pointer',
      margin: '0',
      borderRight: 'none',
    } as React.CSSProperties,
    settingsTabButtonLast: {
      borderRight: '1px solid #b2b1b1',
    } as React.CSSProperties,
    settingLabel: {
      fontSize: '12px',
      textAlign: 'left',
      marginTop: '15px',
      marginBottom: '5px',
    } as React.CSSProperties,
    settingLabelTip: {
      fontSize: '10px',
      textAlign: 'right',
      display: 'inline',
      marginLeft: '10px',
      bottom: '0',
    } as React.CSSProperties,
    settingLabelShow: {
      fontSize: '13px',
      textAlign: 'right',
      display: 'inline',
      float: 'right',
      position: 'relative',
      cursor: 'pointer',
    } as React.CSSProperties,
    settingInput: {
      padding: '10px',
      border: '0px solid #ccc',
      borderRadius: '4px',
      width: '100%',
      fontSize: '12px',
      margin: '0',
      backgroundColor: isNightMode
        ? 'rgba(0, 0, 0, 0.3)'
        : 'rgba(255, 255, 255, 0.7)',
      color: isNightMode ? '#ababab' : '#3e3e47',

      ':disabled': {
        backgroundColor: '#336643',
      },
    } as React.CSSProperties,
    settings_inline: {
      display: 'flex',
      gap: '40px',
    } as React.CSSProperties,
    settings_inline_block: {
      display: 'inline-block',
      width: '50%',
    } as React.CSSProperties,
    export_settings: {
      border: '1px solid #b2b1b1',
      background: 'transparent',
    } as React.CSSProperties,
    settings_tip: {
      backgroundColor: isNightMode
        ? 'rgba(0, 0, 0, 0.2)'
        : 'rgba(0, 0, 0, 0.1)',
      padding: '0.5rem',
      borderRadius: '0.3rem',
      marginBottom: '0.5rem',
      marginTop: '0.5rem',
      width: '100%',
      fontStyle: 'italic',
    } as React.CSSProperties,
  };

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
    if (value === '') {
      localStorage.removeItem(name);
      console.log(`${name} removed`);
    } else {
      localStorage.setItem(name, value);
      console.log(name, value);
    }
  };

  const DefaultSettings = () => {
    const [language, setLanguage] = useState(
      localStorage.getItem('language') || 'chinese',
    );

    const [appName, setAppName] = useState(getAppName());

    const [assistantType, setAssistantType] = useState(
      localStorage.getItem('assistantType') || ASSISTANT_TYPE_REALTIME,
    );

    const [buildInPrompt, setBuildInPrompt] = useState(
      localStorage.getItem('buildInPrompt') || BUILD_IN_PROMPT_ENABLE,
    );

    const [buildInFunctions, setBuildInFunctions] = useState(
      localStorage.getItem('buildInFunctions') || BUILD_IN_FUNCTIONS_ENABLE,
    );

    return (
      <div>
        <div style={styles.settingLabel}>App Name</div>
        <input
          type={'text'}
          style={{ ...styles.settingInput, width: '200px' }}
          value={appName}
          onChange={(e) => {
            setAppName(e.target.value);
            handleChange('appName', e.target.value);
          }}
        />

        <div style={styles.settingLabel}>Assistant Type</div>
        <Dropdown
          options={supportedAssistantTypes}
          selectedValue={assistantType}
          onChange={(e) => {
            setAssistantType(e);
            handleChange('assistantType', e);
          }}
        />

        <div style={styles.settingLabel}>Build-in Prompt</div>
        <Dropdown
          options={buildInPromptOptions}
          selectedValue={buildInPrompt}
          onChange={(e) => {
            setBuildInPrompt(e);
            handleChange('buildInPrompt', e);
          }}
        />

        <div
          style={{
            ...styles.settingLabel,
            display:
              buildInPrompt === BUILD_IN_PROMPT_DISABLE ? 'none' : 'block',
          }}
        >
          Default Language
          <Dropdown
            options={supportedLanguages}
            selectedValue={language}
            onChange={(e) => {
              setLanguage(e);
              handleChange('language', e);
            }}
          />
        </div>

        <div style={styles.settingLabel}>Build-in Functions</div>
        <Dropdown
          options={buildInFunctionsOptions}
          selectedValue={buildInFunctions}
          onChange={(e) => {
            setBuildInFunctions(e);
            handleChange('buildInFunctions', e);
          }}
        />

        <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
          <Button
            label={'Import Settings'}
            icon={Upload}
            style={styles.export_settings}
            buttonStyle={'regular'}
            onClick={handleButtonClick}
          />

          <Button
            label={'Export Settings'}
            icon={Download}
            style={styles.export_settings}
            buttonStyle={'regular'}
            onClick={handleExport}
          />

          <input
            type="file"
            accept=".json"
            ref={fileInputRef}
            onChange={handleImport}
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
        <div style={styles.settingLabel}>Target URI</div>
        <input
          type={'text'}
          style={styles.settingInput}
          value={endpoint}
          placeholder={
            'https://xxx.openai.azure.com/openai/realtime?api-version=2024-10-01-preview&deployment=xxx'
          }
          onChange={(e) => {
            setEndpoint(e.target.value);
            handleChange('endpoint', e.target.value);
          }}
        />

        <div style={styles.settingLabel}>
          Key
          <span style={styles.settingLabelShow} onClick={toggleVisibility}>
            {isVisible ? <FaRegEye /> : <FaRegEyeSlash />}
          </span>
        </div>
        <input
          type={isVisible ? 'text' : 'password'}
          style={styles.settingInput}
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
        <div style={styles.settingLabel}>Target URI</div>
        <input
          type={'text'}
          style={styles.settingInput}
          value={ttsTargetUri}
          placeholder={
            'https://xxxx.openai.azure.com/openai/deployments/tts/audio/speech?api-version=2024-05-01-preview'
          }
          onChange={(e) => {
            setTtsTargetUri(e.target.value);
            handleChange('ttsTargetUri', e.target.value);
          }}
        />

        <div style={styles.settingLabel}>
          Key
          <span style={styles.settingLabelShow} onClick={toggleVisibility}>
            {isVisible ? <FaRegEye /> : <FaRegEyeSlash />}
          </span>
        </div>
        <input
          type={isVisible ? 'text' : 'password'}
          style={styles.settingInput}
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
        <div style={styles.settingLabel}>Target URI</div>
        <input
          type={'text'}
          style={styles.settingInput}
          value={dallTargetUri}
          placeholder={
            'https://xxx.openai.azure.com/openai/deployments/dall-e-3/images/generations?api-version=2024-02-01'
          }
          onChange={(e) => {
            setDallTargetUri(e.target.value);
            handleChange('dallTargetUri', e.target.value);
          }}
        />

        <div style={styles.settingLabel}>
          Key
          <span style={styles.settingLabelShow} onClick={toggleVisibility}>
            {isVisible ? <FaRegEye /> : <FaRegEyeSlash />}
          </span>
        </div>
        <input
          type={isVisible ? 'text' : 'password'}
          style={styles.settingInput}
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
        <div style={styles.settings_tip}>
          Currently only local search is supported.{' '}
          <a
            href="https://github.com/theodoreniu/graphrag_webui"
            target="_blank"
            style={styles.link}
          >
            How to deploy a GraphRAG API?
          </a>
        </div>
        <div style={styles.settingLabel}>API URL</div>
        <input
          type={'text'}
          style={styles.settingInput}
          value={graphragUrl}
          placeholder={'https://xxx.xxx.xxx.azurecontainerapps.io'}
          onChange={(e) => {
            setGraphragUrl(e.target.value);
            handleChange('graphragUrl', e.target.value);
          }}
        />

        <div style={styles.settingLabel}>
          API Key
          <span style={styles.settingLabelShow} onClick={toggleVisibility}>
            {isVisible ? <FaRegEye /> : <FaRegEyeSlash />}
          </span>
        </div>
        <input
          type={isVisible ? 'text' : 'password'}
          style={styles.settingInput}
          value={graphragApiKey}
          placeholder={''}
          onChange={(e) => {
            setGraphragApiKey(e.target.value);
            handleChange('graphragApiKey', e.target.value);
          }}
        />

        <div style={styles.settingLabel}>Project Name</div>
        <input
          type={'text'}
          style={styles.settingInput}
          value={graphragProjectName}
          placeholder={''}
          onChange={(e) => {
            setGraphragProjectName(e.target.value);
            handleChange('graphragProjectName', e.target.value);
          }}
        />

        <div style={styles.settingLabel}>About</div>
        <input
          type={'text'}
          style={styles.settingInput}
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
    const [cogSvcEndpoint, setCogSvcEndpoint] = useState(
      localStorage.getItem('cogSvcEndpoint') || '',
    );
    return (
      <div>
        <div style={styles.settingLabel}>Region</div>
        <input
          type={'text'}
          style={styles.settingInput}
          value={cogSvcRegion}
          placeholder={'westus2'}
          onChange={(e) => {
            setCogSvcRegion(e.target.value);
            handleChange('cogSvcRegion', e.target.value);
          }}
        />

        <div style={styles.settingLabel}>
          Subscription Key
          <span style={styles.settingLabelShow} onClick={toggleVisibility}>
            {isVisible ? <FaRegEye /> : <FaRegEyeSlash />}
          </span>
        </div>
        <input
          type={isVisible ? 'text' : 'password'}
          style={styles.settingInput}
          value={cogSvcSubKey}
          placeholder={''}
          onChange={(e) => {
            setCogSvcSubKey(e.target.value);
            handleChange('cogSvcSubKey', e.target.value);
          }}
        />

        <div style={styles.settingLabel}>Use Speech Proxy (STT)</div>
        {/* tip */}
        <div style={styles.settings_tip}>
          Learn more about
          <a
            href="https://github.com/theodoreniu/speech_proxy"
            target="_blank"
            style={{ ...styles.link, marginLeft: '8px' }}
          >
            Speech Proxy
          </a>
        </div>
        <input
          type={'text'}
          style={styles.settingInput}
          value={cogSvcEndpoint}
          placeholder={
            'https://xxx.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1'
          }
          onChange={(e) => {
            setCogSvcEndpoint(e.target.value);
            handleChange('cogSvcEndpoint', e.target.value);
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
        <div style={styles.settingLabel}>
          Key
          <span style={styles.settingLabelShow} onClick={toggleVisibility}>
            {isVisible ? <FaRegEye /> : <FaRegEyeSlash />}
          </span>
        </div>
        <input
          type={isVisible ? 'text' : 'password'}
          style={styles.settingInput}
          value={bingApiKey}
          placeholder={''}
          onChange={(e) => {
            setBingApiKey(e.target.value);
            handleChange('bingApiKey', e.target.value);
          }}
        />

        <div style={styles.settingLabel}>Endpoint</div>
        <input
          type={'text'}
          style={styles.settingInput}
          disabled
          onChange={(e) => {
            handleChange('bingEndpoint', e.target.value);
          }}
          value={'https://api.bing.microsoft.com/'}
        />

        <div style={styles.settingLabel}>Location</div>
        <input
          type={'text'}
          style={styles.settingInput}
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
        <div style={styles.settingLabel}>Target URI</div>
        <input
          type={'text'}
          style={styles.settingInput}
          value={completionTargetUri}
          placeholder={
            'https://xxxx.openai.azure.com/openai/deployments/gpt-4o-mini/chat/completions?api-version=2024-08-01-preview'
          }
          onChange={(e) => {
            setCompletionTargetUri(e.target.value);
            handleChange('completionTargetUri', e.target.value);
          }}
        />

        <div style={styles.settingLabel}>
          Key
          <span style={styles.settingLabelShow} onClick={toggleVisibility}>
            {isVisible ? <FaRegEye /> : <FaRegEyeSlash />}
          </span>
        </div>
        <input
          type={isVisible ? 'text' : 'password'}
          style={styles.settingInput}
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

  const DeepSeek = () => {
    const [deepSeekTargetUri, setDeepSeekTargetUri] = useState(
      localStorage.getItem('deepSeekTargetUri') || '',
    );
    const [deepSeekApiKey, setDeepSeekApiKey] = useState(
      localStorage.getItem('deepSeekApiKey') || '',
    );
    const [deepSeekDeploymentName, setDeepSeekDeploymentName] = useState(
      localStorage.getItem('deepSeekDeploymentName') || 'DeepSeek-R1',
    );
    const [functionCalling, setFunctionCalling] = useState(
      localStorage.getItem('deepSeekFunctionCalling') ||
        DEEPSEEK_FUNCTION_CALL_DISABLE,
    );

    return (
      <div>
        <p style={styles.settings_tip}>
          <a
            href="https://ai.azure.com/explore/models/DeepSeek-R1/version/1/registry/azureml-deepseek?tid=a284bf15-c9ca-4f17-a034-9a459c7cb8d1"
            target="_blank"
            style={styles.link}
          >
            How to deploy DeepSeek in Azure AI Foundry?
          </a>
        </p>

        <div style={styles.settingLabel}>Deployment name</div>
        <input
          type={'text'}
          style={styles.settingInput}
          value={deepSeekDeploymentName}
          placeholder={deepSeekDeploymentName}
          onChange={(e) => {
            setDeepSeekDeploymentName(e.target.value);
            handleChange('deepSeekDeploymentName', e.target.value);
          }}
        />

        <div style={styles.settingLabel}>Target URI</div>
        <input
          type={'text'}
          style={styles.settingInput}
          value={deepSeekTargetUri}
          placeholder={
            'https://ai-xxx.services.ai.azure.com/models/chat/completions?api-version=2024-05-01-preview'
          }
          onChange={(e) => {
            setDeepSeekTargetUri(e.target.value);
            handleChange('deepSeekTargetUri', e.target.value);
          }}
        />

        <div style={styles.settingLabel}>
          Key
          <span style={styles.settingLabelShow} onClick={toggleVisibility}>
            {isVisible ? <FaRegEye /> : <FaRegEyeSlash />}
          </span>
        </div>
        <input
          type={isVisible ? 'text' : 'password'}
          style={styles.settingInput}
          value={deepSeekApiKey}
          placeholder={''}
          onChange={(e) => {
            setDeepSeekApiKey(e.target.value);
            handleChange('deepSeekApiKey', e.target.value);
          }}
        />

        <div style={styles.settingLabel}>Function Calling</div>
        <p style={styles.settings_tip}>
          The current version of the deepseek-chat model's Function Calling
          capability is unstable, which may result in looped calls or empty
          responses. We are actively working on a fix, and it is expected to be
          resolved in the next version.
          <a
            href="https://api-docs.deepseek.com/guides/function_calling"
            target="_blank"
            style={styles.link}
          >
            Function Calling
          </a>
        </p>
        <Dropdown
          options={deepSeekFunctionCallingTypes}
          selectedValue={functionCalling}
          onChange={(e) => {
            setFunctionCalling(e);
            handleChange('deepSeekFunctionCalling', e);
          }}
        />
      </div>
    );
  };

  const Prompt = () => {
    const [prompt, setPrompt] = useState(localStorage.getItem('prompt') || '');
    const [promptUrl, setPromptUrl] = useState(
      localStorage.getItem('promptUrl') || '',
    );

    return (
      <div>
        <div style={styles.settingLabel}>Prompt URL (Main)</div>
        <input
          type="text"
          style={styles.settingInput}
          value={promptUrl}
          placeholder={''}
          onChange={(e) => {
            setPromptUrl(e.target.value);
            handleChange('promptUrl', e.target.value);
            if (e.target.value === '') {
              setPrompt('');
              handleChange('prompt', '');
            }
          }}
        />

        <div
          style={{
            ...styles.settingLabel,
            display: promptUrl !== '' ? 'none' : 'block',
          }}
        >
          Prompt
        </div>
        <textarea
          style={styles.settingInput}
          value={prompt}
          placeholder={''}
          hidden={promptUrl !== ''}
          rows={20}
          maxLength={ALLOW_PROMPT_CHARACTERS}
          onChange={(e) => {
            setPrompt(e.target.value);
            handleChange('prompt', e.target.value);
          }}
        />

        <div style={styles.settingLabel}>
          Remaining Characters: {ALLOW_PROMPT_CHARACTERS - prompt.length}
        </div>
      </div>
    );
  };

  const Functions = () => {
    const [functions, setFunctions] = useState(
      localStorage.getItem('functions') || '',
    );

    const [functionsUrl, setFunctionsUrl] = useState(
      localStorage.getItem('functionsUrl') || '',
    );

    const format_functions = (functions: string) => {
      try {
        return JSON.stringify(JSON.parse(functions), null, 2);
      } catch {
        return functions;
      }
    };

    return (
      <div>
        <div style={styles.settingLabel}>Functions URL (Main)</div>
        <input
          type="text"
          style={styles.settingInput}
          value={functionsUrl}
          placeholder={''}
          onChange={(e) => {
            setFunctionsUrl(e.target.value);
            handleChange('functionsUrl', e.target.value);
            if (e.target.value === '') {
              setFunctions('');
              handleChange('functions', '');
            }
          }}
        />

        <div
          style={{
            ...styles.settingLabel,
            display: functionsUrl !== '' ? 'none' : 'block',
          }}
        >
          Functions
        </div>
        <textarea
          style={styles.settingInput}
          value={format_functions(functions)}
          placeholder={''}
          hidden={functionsUrl !== ''}
          rows={20}
          maxLength={ALLOW_FUNCTIONS_CHARACTERS}
          onChange={(e) => {
            setFunctions(e.target.value);
            handleChange('functions', e.target.value);
          }}
        />

        <div style={styles.settingLabel}>
          Remaining Characters: {ALLOW_FUNCTIONS_CHARACTERS - functions.length}
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
        <div style={styles.settingLabel}>
          Feishu Bot
          <span style={styles.settingLabelShow} onClick={toggleVisibility}>
            {isVisible ? <FaRegEye /> : <FaRegEyeSlash />}
          </span>
        </div>
        <input
          type={isVisible ? 'text' : 'password'}
          style={styles.settingInput}
          value={feishuHook}
          placeholder={''}
          onChange={(e) => {
            setFeishuHook(e.target.value);
            handleChange('feishuHook', e.target.value);
          }}
        />

        <div style={styles.settingLabel}>
          <a href="https://finnhub.io/" target="_blank" style={styles.link}>
            Finnhub
          </a>
          <span style={styles.settingLabelShow} onClick={toggleVisibility}>
            {isVisible ? <FaRegEye /> : <FaRegEyeSlash />}
          </span>
        </div>
        <input
          type={isVisible ? 'text' : 'password'}
          style={styles.settingInput}
          value={quoteToken}
          placeholder={''}
          onChange={(e) => {
            setQuoteToken(e.target.value);
            handleChange('quoteToken', e.target.value);
          }}
        />

        <div style={styles.settingLabel}>
          <a
            href="https://www.showapi.com/"
            target="_blank"
            style={styles.link}
          >
            News
          </a>
          <span style={styles.settingLabelShow} onClick={toggleVisibility}>
            {isVisible ? <FaRegEye /> : <FaRegEyeSlash />}
          </span>
        </div>
        <input
          type={isVisible ? 'text' : 'password'}
          style={styles.settingInput}
          value={newsKey}
          placeholder={''}
          onChange={(e) => {
            setNewsKey(e.target.value);
            handleChange('newsKey', e.target.value);
          }}
        />

        <div style={styles.settings_inline}>
          <div style={styles.settings_inline_block}>
            <div style={styles.settingLabel}>
              <a
                href="https://www.mxnzp.com/"
                target="_blank"
                style={styles.link}
              >
                Mxnzp AppId
              </a>
            </div>
            <input
              type={'text'}
              style={styles.settingInput}
              value={mxnzpAppId}
              placeholder={''}
              onChange={(e) => {
                setMxnzpAppId(e.target.value);
                handleChange('mxnzpAppId', e.target.value);
              }}
            />
          </div>

          <div style={styles.settings_inline_block}>
            <div style={styles.settingLabel}>
              <a
                href="https://www.mxnzp.com/"
                target="_blank"
                style={styles.link}
              >
                Mxnzp AppSecret
              </a>
              <span style={styles.settingLabelShow} onClick={toggleVisibility}>
                {isVisible ? <FaRegEye /> : <FaRegEyeSlash />}
              </span>
            </div>
            <input
              type={isVisible ? 'text' : 'password'}
              style={styles.settingInput}
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
    // get all settings to json object and base64 encode
    const settings = {
      appName: localStorage.getItem('appName') || '',

      endpoint: localStorage.getItem('endpoint') || '',
      key: localStorage.getItem('key') || '',

      completionTargetUri: localStorage.getItem('completionTargetUri') || '',
      completionApiKey: localStorage.getItem('completionApiKey') || '',

      deepSeekTargetUri: localStorage.getItem('deepSeekTargetUri') || '',
      deepSeekApiKey: localStorage.getItem('deepSeekApiKey') || '',

      cogSvcRegion: localStorage.getItem('cogSvcRegion') || '',
      cogSvcSubKey: localStorage.getItem('cogSvcSubKey') || '',
      cogSvcEndpoint: localStorage.getItem('cogSvcEndpoint') || '',
      dallTargetUri: localStorage.getItem('dallTargetUri') || '',
      dallApiKey: localStorage.getItem('dallApiKey') || '',

      graphragUrl: localStorage.getItem('graphragUrl') || '',
      graphragApiKey: localStorage.getItem('graphragApiKey') || '',
      graphragProjectName: localStorage.getItem('graphragProjectName') || '',
      graphragAbout: localStorage.getItem('graphragAbout') || '',

      assistantType: localStorage.getItem('assistantType') || '',
      language: localStorage.getItem('language') || '',
      prompt: localStorage.getItem('prompt') || '',
      promptUrl: localStorage.getItem('promptUrl') || '',

      feishuHook: localStorage.getItem('feishuHook') || '',
      quoteToken: localStorage.getItem('quoteToken') || '',
      newsKey: localStorage.getItem('newsKey') || '',

      mxnzpAppId: localStorage.getItem('mxnzpAppId') || '',
      mxnzpAppSecret: localStorage.getItem('mxnzpAppSecret') || '',

      ttsTargetUri: localStorage.getItem('ttsTargetUri') || '',
      ttsApiKey: localStorage.getItem('ttsApiKey') || '',

      bingApiKey: localStorage.getItem('bingApiKey') || '',

      functions: localStorage.getItem('functions') || '',
      functionsUrl: localStorage.getItem('functionsUrl') || '',

      buildInPrompt: localStorage.getItem('buildInPrompt') || '',
      buildInFunctions: localStorage.getItem('buildInFunctions') || '',
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

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const e = event.target.files?.[0];
    if (!e) {
      alert('No file selected');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const settings = JSON.parse(e.target?.result as string);

        // update settings
        handleChange('appName', settings.appName);

        handleChange('endpoint', settings.endpoint);
        handleChange('key', settings.key);

        handleChange('completionTargetUri', settings.completionTargetUri);
        handleChange('completionApiKey', settings.completionApiKey);

        handleChange('deepSeekTargetUri', settings.deepSeekTargetUri);
        handleChange('deepSeekApiKey', settings.deepSeekApiKey);

        handleChange('cogSvcRegion', settings.cogSvcRegion);
        handleChange('cogSvcSubKey', settings.cogSvcSubKey);
        handleChange('cogSvcEndpoint', settings.cogSvcEndpoint);

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
        handleChange('promptUrl', settings.promptUrl);
        handleChange('bingApiKey', settings.bingApiKey);

        handleChange('ttsApiKey', settings.ttsApiKey);
        handleChange('ttsTargetUri', settings.ttsTargetUri);

        handleChange('functions', settings.functions);
        handleChange('functionsUrl', settings.functionsUrl);
        handleChange('buildInPrompt', settings.buildInPrompt);
        handleChange('buildInFunctions', settings.buildInFunctions);

        alert('Import success');

        resetApp();
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
      case DEEPSEEK:
        return <DeepSeek />;
      case TOKENS:
        return <Tokens />;
      case PROMPT:
        return <Prompt />;
      case BING:
        return <Bing />;
      case FUNCTIONS:
        return <Functions />;
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
    resetApp();
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
        <div style={styles.settingsModal}>
          <div style={styles.settingsModalContent}>
            <button style={styles.settingsModalClose} onClick={closeModal}>
              <X />
            </button>

            <div style={styles.settingsModalHeader}>
              Settings
              <div style={styles.settingLabelTip}>(Local Only)</div>
            </div>

            <div>
              <div style={styles.settingsTabButtons}>
                <button
                  style={{
                    ...styles.settingsTabButton,
                    ...(activeTab === DEFAULT ? styles.tabActive : {}),
                  }}
                  onClick={() => setActiveTab(DEFAULT)}
                >
                  {DEFAULT}
                </button>
                <button
                  style={{
                    ...styles.settingsTabButton,
                    ...(activeTab === REAL_TIME_API ? styles.tabActive : {}),
                  }}
                  onClick={() => setActiveTab(REAL_TIME_API)}
                >
                  {REAL_TIME_API}
                </button>
                <button
                  style={{
                    ...styles.settingsTabButton,
                    ...(activeTab === PROMPT ? styles.tabActive : {}),
                  }}
                  onClick={() => setActiveTab(PROMPT)}
                >
                  {PROMPT}
                </button>
                <button
                  style={{
                    ...styles.settingsTabButton,
                    ...styles.settingsTabButtonLast,
                    ...(activeTab === FUNCTIONS ? styles.tabActive : {}),
                  }}
                  onClick={() => setActiveTab(FUNCTIONS)}
                >
                  {FUNCTIONS}
                </button>
                <button
                  style={{
                    ...styles.settingsTabButton,
                    ...(activeTab === SPEECH ? styles.tabActive : {}),
                  }}
                  onClick={() => setActiveTab(SPEECH)}
                >
                  {SPEECH}
                </button>
                {/* <button
                  onClick={() => setActiveTab(TTS)}
                  className={activeTab === TTS ? 'active' : ''}
                >
                  {TTS}
                </button> */}
                <button
                  style={{
                    ...styles.settingsTabButton,
                    ...(activeTab === COMPLETION ? styles.tabActive : {}),
                  }}
                  onClick={() => setActiveTab(COMPLETION)}
                >
                  {COMPLETION}
                </button>
                <button
                  style={{
                    ...styles.settingsTabButton,
                    ...(activeTab === DEEPSEEK ? styles.tabActive : {}),
                  }}
                  onClick={() => setActiveTab(DEEPSEEK)}
                >
                  {DEEPSEEK}
                </button>
                <button
                  style={{
                    ...styles.settingsTabButton,
                    ...(activeTab === DALL_E ? styles.tabActive : {}),
                  }}
                  onClick={() => setActiveTab(DALL_E)}
                >
                  {DALL_E}
                </button>
                <button
                  style={{
                    ...styles.settingsTabButton,
                    ...(activeTab === BING ? styles.tabActive : {}),
                  }}
                  onClick={() => setActiveTab(BING)}
                >
                  {BING}
                </button>
                <button
                  style={{
                    ...styles.settingsTabButton,
                    ...(activeTab === GRAPHRAG ? styles.tabActive : {}),
                  }}
                  onClick={() => setActiveTab(GRAPHRAG)}
                >
                  {GRAPHRAG}
                </button>
                <button
                  style={{
                    ...styles.settingsTabButton,
                    ...styles.settingsTabButtonLast,
                    ...(activeTab === TOKENS ? styles.tabActive : {}),
                  }}
                  onClick={() => setActiveTab(TOKENS)}
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
