export const APP_AGENT = 'AI Agent Playground';
export const APP_AGENT_VECTOR_STORE =
  'ai-agent-playground-assistant-vector-store';

export const DEFAULT_AGENT_API_URL = 'https://agent-api.azuretsp.com';

export const ASSISTANT_TYPE_ASSISTANT = 'Assistant';
export const ASSISTANT_TYPE_REALTIME = 'Realtime';
export const ASSISTANT_TYPE_DEEPSEEK = 'DeepSeek';
export const ASSISTANT_TYPE_AGENT_AI = 'Agent API';
export const ASSISTANT_TYPE_DEFAULT = ASSISTANT_TYPE_REALTIME;
export const ASSISTANT_TYPES = [
  ASSISTANT_TYPE_ASSISTANT,
  ASSISTANT_TYPE_REALTIME,
  ASSISTANT_TYPE_DEEPSEEK,
  ASSISTANT_TYPE_AGENT_AI,
];

export const DEEPSEEK_FUNCTION_CALL_ENABLE = 'Enable';
export const DEEPSEEK_FUNCTION_CALL_DISABLE = 'Disable';

export const BUILD_IN_FUNCTIONS_ENABLE = 'Enable';
export const BUILD_IN_FUNCTIONS_DISABLE = 'Disable';

export const BUILD_IN_PROMPT_ENABLE = 'Enable';
export const BUILD_IN_PROMPT_DISABLE = 'Disable';

export const ALLOW_PROMPT_CHARACTERS = 15000;
export const ALLOW_FUNCTIONS_CHARACTERS = 100000;
export const ALLOW_URL_CHARACTERS = 1024;

export const CAMERA_PHOTO_LIMIT = 50; // gpt limit 50 images
export const CAMERA_PHOTO_INTERVAL_MS = 1000;

export const CAMERA_OFF = 'camera_off';
export const CAMERA_STARTING = 'camera_starting';
export const CAMERA_READY = 'camera_ready';

export const CONNECT_DISCONNECTED = 'connect_disconnected';
export const CONNECT_CONNECTING = 'connect_connecting';
export const CONNECT_CONNECTED = 'connect_connected';
export const NOT_SETTINGS_STATUS = [CONNECT_CONNECTING, CONNECT_CONNECTED];

export const AVATAR_OFF = 'avatar_off';
export const AVATAR_STARTING = 'avatar_starting';
export const AVATAR_READY = 'avatar_ready';

export const clientHiEnglish = `Hi!`;
export const clientHiChinese = `你好！`;

export const fileUploadInstructions = `我已经上传了数据文件，请告诉我你收到了什么内容的文件，只需要简单解释你收到了什么。不要超过30个字。内容在 ----用户已经上传的数据文件开始---- 下面`;
export const fileUploadTooBig = `请告诉用户，你只是一个 Demo，不处理内容过多的文件，请重新上传一个内容少的文件。`;
export const cameraOpen = `请你说你发现摄像头已经进入工作状态，你可以通过摄像头分析实时画面。`;
export const cameraClose = `请你说你发现摄像头已经关闭，关于摄像头画面的记忆已经清除。`;
export const notDisplay = [
  fileUploadInstructions,
  fileUploadTooBig,
  cameraOpen,
  cameraClose,
];

export const products = [
  {
    id: 1,
    name: '快乐套餐',
    price: 199,
    description: '情侣双人餐，可乐，鸡翅，汉堡，炸鸡腿。',
    image: 'products/1.jpg',
  },
  {
    id: 2,
    name: '汉堡',
    price: 99,
    description: '只是一个汉堡。',
    image: 'products/2.jpg',
  },
  {
    id: 3,
    name: '快乐薯条',
    price: 50,
    description: '想上火，来吃薯条！',
    image: 'products/4.jpg',
  },
];

export const demos = [
  {
    name: 'GraphRAG Kit',
    url: 'https://github.com/theodoreniu/graphrag_webui',
    required_password: false,
    description:
      '这是一个使用 GraphRAG 的全生命周期的 WEBUI 解决方案，不需要写代码，只需要操作界面，就能快速构建、测试甚至部署上线基于 GraphRAG 的服务。',
  },
];
