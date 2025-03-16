import { v4 as uuidv4 } from 'uuid';
import {
  APP_AGENT,
  ASSISTANT_TYPE_ASSISTANT,
  ASSISTANT_TYPE_DEEPSEEK,
  ASSISTANT_TYPE_DEFAULT,
  ASSISTANT_TYPE_REALTIME,
  ASSISTANT_TYPES,
  DEEPSEEK_FUNCTION_CALL_DISABLE,
} from './const';
import defaultIcon from '../static/logomark.svg';
import { supportedAssistantTypes } from '../components/Settings';

// Profile is the profile of the app
class Profile {
  public id: string = '';
  public name: string = '';
  public assistantType: string = '';
  public temperature: number = 0.5;
  public prompt: string = '';
  public buildInPrompt: boolean = false;
  public buildInFunctions: boolean = false;
  public realtimeEndpoint: string = '';
  public realtimeKey: string = '';
  public ttsTargetUri: string = '';
  public ttsApiKey: string = '';
  public dallTargetUri: string = '';
  public dallApiKey: string = '';
  public graphragUrl: string = '';
  public graphragApiKey: string = '';
  public graphragProjectName: string = '';
  public graphragAbout: string = '';
  public cogSvcEndpoint: string = '';
  public cogSvcSubKey: string = '';
  public cogSvcRegion: string = 'westus2';
  public bingEndpoint: string = '';
  public bingLocation: string = '';
  public bingApiKey: string = '';
  public completionTargetUri: string = '';
  public completionApiKey: string = '';
  public deepSeekFunctionCalling: string = DEEPSEEK_FUNCTION_CALL_DISABLE;
  public deepSeekDeploymentName: string = 'DeepSeek-R1';
  public deepSeekTargetUri: string = '';
  public deepSeekApiKey: string = '';
  public promptUrl: string = '';
  public functionsUrl: string = '';
  public functions: string = '';
  public feishuHook: string = '';
  public quoteToken: string = '';
  public newsKey: string = '';
  public mxnzpAppId: string = '';
  public mxnzpAppSecret: string = '';
  public appIconDark: string = '';
  public appIconLight: string = '';
  public supportedAssistantType: string = '';

  public isAssistant: boolean = this.assistantType === ASSISTANT_TYPE_ASSISTANT;
  public isRealtime: boolean = this.assistantType === ASSISTANT_TYPE_REALTIME;
  public isDeepSeek: boolean = this.assistantType === ASSISTANT_TYPE_DEEPSEEK;

  setProperty<K extends keyof Profile>(key: K, value: Profile[K]) {
    Object.assign(this, { [key]: value });
  }
}

// Profiles is the list of profiles
export class Profiles {
  public currentProfileId: string;
  public profiles: Profile[] = [];
  public currentProfile: Profile | undefined;

  constructor() {
    this.init();

    this.currentProfileId = localStorage.getItem('currentProfileId') || '';

    if (this.profiles.length === 1) {
      this.currentProfileId = this.profiles[0].id;
      this.save();
    }

    if (!this.currentProfileId) {
      this.currentProfileId = this.profiles[0].id;
      this.save();
    }

    this.currentProfile = this.find(this.currentProfileId);

    this.loadOldProfile();
  }

  clone() {
    const profile = this.currentProfile;
    if (!profile) {
      return;
    }

    const newProfile = new Profile();

    for (const key in profile) {
      newProfile.setProperty(
        key as keyof Profile,
        profile[key as keyof Profile],
      );
    }

    newProfile.id = uuidv4();
    newProfile.name = `${profile.name} (Clone)`;

    this.profiles.push(newProfile);

    this.switch(newProfile);
  }

  init() {
    const jsonData = JSON.parse(localStorage.getItem('profiles') || '[]');

    for (const profile of jsonData) {
      const p = new Profile();

      if (!ASSISTANT_TYPES.includes(profile['assistantType'])) {
        profile['assistantType'] = ASSISTANT_TYPE_DEFAULT;
      }

      for (const key in profile) {
        p.setProperty(key as keyof Profile, profile[key]);
      }

      p.isAssistant = p.assistantType === ASSISTANT_TYPE_ASSISTANT;
      p.isRealtime = p.assistantType === ASSISTANT_TYPE_REALTIME;
      p.isDeepSeek = p.assistantType === ASSISTANT_TYPE_DEEPSEEK;

      p.supportedAssistantType =
        supportedAssistantTypes.find((type) => type.value === p.assistantType)
          ?.label || '';

      this.profiles.push(p);
    }
  }

  loadOldProfile() {
    if (this.profiles.length > 0) {
      return;
    }

    const p = new Profile();

    p.id = uuidv4();
    p.name = APP_AGENT;
    p.assistantType = ASSISTANT_TYPE_DEFAULT;
    p.temperature = 0.7;
    p.appIconDark = defaultIcon;
    p.appIconLight = defaultIcon;

    p.realtimeEndpoint = localStorage.getItem('endpoint') || '';
    p.realtimeKey = localStorage.getItem('key') || '';

    p.completionTargetUri = localStorage.getItem('completionTargetUri') || '';
    p.completionApiKey = localStorage.getItem('completionApiKey') || '';

    p.deepSeekTargetUri = localStorage.getItem('deepSeekTargetUri') || '';
    p.deepSeekApiKey = localStorage.getItem('deepSeekApiKey') || '';

    p.cogSvcRegion = localStorage.getItem('cogSvcRegion') || '';
    p.cogSvcSubKey = localStorage.getItem('cogSvcSubKey') || '';
    p.cogSvcEndpoint = localStorage.getItem('cogSvcEndpoint') || '';

    p.dallTargetUri = localStorage.getItem('dallTargetUri') || '';
    p.dallApiKey = localStorage.getItem('dallApiKey') || '';

    p.graphragUrl = localStorage.getItem('graphragUrl') || '';
    p.graphragApiKey = localStorage.getItem('graphragApiKey') || '';
    p.graphragProjectName = localStorage.getItem('graphragProjectName') || '';
    p.graphragAbout = localStorage.getItem('graphragAbout') || '';

    p.prompt = localStorage.getItem('prompt') || '';
    p.promptUrl = localStorage.getItem('promptUrl') || '';

    p.feishuHook = localStorage.getItem('feishuHook') || '';
    p.quoteToken = localStorage.getItem('quoteToken') || '';
    p.newsKey = localStorage.getItem('newsKey') || '';

    p.mxnzpAppId = localStorage.getItem('mxnzpAppId') || '';
    p.mxnzpAppSecret = localStorage.getItem('mxnzpAppSecret') || '';

    p.ttsTargetUri = localStorage.getItem('ttsTargetUri') || '';
    p.ttsApiKey = localStorage.getItem('ttsApiKey') || '';

    p.bingApiKey = localStorage.getItem('bingApiKey') || '';

    p.functions = localStorage.getItem('functions') || '';
    p.functionsUrl = localStorage.getItem('functionsUrl') || '';

    p.buildInPrompt = localStorage.getItem('buildInPrompt') === 'Enable';
    p.buildInFunctions = localStorage.getItem('buildInFunctions') === 'Enable';

    this.profiles.push(p);
    this.save();

    localStorage.removeItem('appName');
    localStorage.removeItem('language');
    localStorage.removeItem('assistant');
    localStorage.removeItem('endpoint');
    localStorage.removeItem('key');
    localStorage.removeItem('completionTargetUri');
    localStorage.removeItem('completionApiKey');
    localStorage.removeItem('deepSeekTargetUri');
    localStorage.removeItem('deepSeekApiKey');
    localStorage.removeItem('cogSvcRegion');
    localStorage.removeItem('cogSvcSubKey');
    localStorage.removeItem('cogSvcEndpoint');
    localStorage.removeItem('dallTargetUri');
    localStorage.removeItem('dallApiKey');
    localStorage.removeItem('graphragUrl');
    localStorage.removeItem('graphragApiKey');
    localStorage.removeItem('graphragProjectName');
    localStorage.removeItem('graphragAbout');
    localStorage.removeItem('prompt');
    localStorage.removeItem('promptUrl');
    localStorage.removeItem('feishuHook');
    localStorage.removeItem('quoteToken');
    localStorage.removeItem('newsKey');
    localStorage.removeItem('mxnzpAppId');
    localStorage.removeItem('mxnzpAppSecret');
    localStorage.removeItem('ttsTargetUri');
    localStorage.removeItem('ttsApiKey');
    localStorage.removeItem('bingApiKey');
    localStorage.removeItem('functions');
    localStorage.removeItem('functionsUrl');
    localStorage.removeItem('buildInPrompt');
    localStorage.removeItem('buildInFunctions');
    localStorage.removeItem('assistantType');
    localStorage.removeItem('temperature');
    localStorage.removeItem('appIconDark');
    localStorage.removeItem('appIconLight');
  }

  add() {
    const p = new Profile();

    p.id = uuidv4();
    p.name = `${APP_AGENT} ${this.profiles.length + 1}`;
    p.appIconDark = defaultIcon;
    p.appIconLight = defaultIcon;
    p.assistantType = ASSISTANT_TYPE_DEFAULT;

    this.profiles.push(p);
    this.switch(p);
  }

  delete(profile: Profile | undefined) {
    if (!profile) {
      return;
    }

    if (this.profiles.length === 1) {
      alert('You must have at least one profile');
      return;
    }

    this.profiles = this.profiles.filter((p) => p.id !== profile.id);
    this.save();
    this.switch(this.profiles[0]);
  }

  getProfileNamesAsDropdown() {
    return this.profiles.map((profile) => ({
      label: profile.name,
      value: profile.name,
    }));
  }

  find(id: string) {
    return this.profiles.find((profile) => profile.id === id);
  }

  switch(profile: Profile) {
    this.currentProfileId = profile.id;
    this.currentProfile = profile;
    this.save();
  }

  save() {
    localStorage.setItem('currentProfileId', this.currentProfileId);
    localStorage.setItem('profiles', JSON.stringify(this.profiles));
  }
}
