import { ToolDefinitionType } from '@theodoreniu/realtime-api-beta/dist/lib/client';

export interface DeviceInterface {
  name: string;
  home_name: string;
  group_name: string[];
  status: string;
  battery_percent: number;
  error_message: string;
  action_names: string[];
  brightness_percent: number | null;
}

export const devices: DeviceInterface[] = [
  {
    name: '客厅摄像头',
    home_name: '家庭1',
    group_name: ['客厅组', '摄像头组'],
    status: 'online',
    battery_percent: 90,
    error_message: '',
    action_names: ['get_info', 'turn_on', 'turn_off'],
    brightness_percent: null,
  },
  {
    name: '卧室摄像头',
    home_name: '家庭1',
    group_name: ['卧室', '摄像头组'],
    status: 'online',
    battery_percent: 90,
    error_message: '',
    action_names: ['get_info', 'turn_on', 'turn_off'],
    brightness_percent: null,
  },
  {
    name: '艺术灯',
    home_name: '家庭1',
    group_name: ['卧室'],
    status: 'online',
    battery_percent: 85,
    error_message: '',
    action_names: ['get_info', 'turn_on', 'turn_off', 'set_brightness'],
    brightness_percent: null,
  },
  {
    name: '扫地机',
    home_name: '家庭1',
    group_name: ['客厅组'],
    status: 'online',
    battery_percent: 90,
    error_message: '',
    action_names: ['get_info', 'turn_on', 'turn_off'],
    brightness_percent: null,
  },
  {
    name: '大门锁',
    home_name: '家庭1',
    group_name: ['客厅组', '门锁'],
    status: 'online',
    battery_percent: 20,
    error_message: '电量过低，请及时更换电池',
    action_names: ['get_info', 'turn_on'],
    brightness_percent: null,
  },
  {
    name: '书房呼吸灯',
    home_name: '家庭1',
    group_name: ['书房'],
    status: 'online',
    battery_percent: 70,
    error_message: '',
    action_names: ['get_info', 'turn_on', 'turn_off', 'set_brightness'],
    brightness_percent: 70,
  },
  {
    name: '卧室呼吸灯',
    home_name: '家庭1',
    group_name: ['卧室'],
    status: 'online',
    battery_percent: 70,
    error_message: '',
    action_names: ['get_info', 'turn_on', 'turn_off', 'set_brightness'],
    brightness_percent: 85,
  },
];

export const definition: ToolDefinitionType = {
  name: 'devices_action',
  description: `you can use this tool to get information or control the devices in home. if user does not tell the device name, you need to ask user to tell the device name.`,
  parameters: {
    type: 'object',
    properties: {
      action_name: {
        type: 'string',
        description: `the action name`,
        enum: ['get_info', 'turn_on', 'turn_off', 'set_brightness'],
      },
      home_name: {
        type: 'string',
        description: `the home name`,
        enum: ['all', ...devices.map((device) => device.home_name)],
      },
      brightness_percent: {
        type: 'number',
        description: `the brightness percent`,
        default: 100,
      },
      group_name: {
        type: 'string',
        description: `the group name`,
        // default: '',
        enum: [...devices.map((device) => device.group_name).flat()],
      },
      device_name: {
        type: 'string',
        description: `the device name`,
        // default: '',
        enum: [...devices.map((device) => device.name)],
      },
    },
    required: ['action_name'],
    additionalProperties: false,
    // strict: true,
  },
};

export const handler: Function = async ({
  group_name,
  device_name,
  action_name,
  brightness_percent,
  home_name,
}: {
  [key: string]: any;
}) => {
  if (
    group_name == undefined &&
    device_name == undefined &&
    home_name == undefined
  ) {
    return {
      error_message:
        'please tell the specific group name or device name to control.',
    };
  }

  console.log({
    action_name,
    group_name,
    device_name,
    brightness_percent,
    home_name,
  });

  const selected_devices: DeviceInterface[] = devicesByGroupNameAndDeviceName(
    group_name,
    device_name,
    home_name,
  );

  if (selected_devices.length === 0) {
    return {
      error_message:
        'no devices found,please tell the specific group name or device name to control.',
    };
  }

  const success_devices: DeviceInterface[] = [];
  const error_devices: DeviceInterface[] = [];
  for (const device of selected_devices) {
    if (device.action_names.includes(action_name)) {
      if (action_name === 'set_brightness') {
        device.brightness_percent = brightness_percent;
      }
      success_devices.push(device);
    } else {
      device.error_message = `device ${device.name} does not support action ${action_name}`;
      error_devices.push(device);
    }
  }

  const results = {
    action_name,
    selected_devices,
    success_devices,
    error_devices,
  };

  console.log(results);

  return results;
};

function devicesByGroupNameAndDeviceName(
  group_name: string,
  device_name: string,
  home_name: string,
) {
  const selected_devices: DeviceInterface[] = [];

  if (group_name === undefined) {
    group_name = 'all';
  }

  if (device_name === undefined) {
    device_name = 'all';
  }

  if (home_name === undefined) {
    home_name = 'all';
  }

  for (const device of devices) {
    if (home_name === 'all' && group_name === 'all' && device_name === 'all') {
      selected_devices.push(device);
      continue;
    }

    if (group_name === 'all' && device_name !== 'all') {
      if (device.name === device_name) {
        selected_devices.push(device);
      }
      continue;
    }

    if (group_name !== 'all' && device_name === 'all') {
      if (device.group_name.includes(group_name)) {
        selected_devices.push(device);
      }
      continue;
    }

    if (group_name !== 'all' && device_name !== 'all') {
      if (
        device.group_name.includes(group_name) &&
        device.name === device_name
      ) {
        selected_devices.push(device);
      }
      continue;
    }

    if (group_name === 'all' && device_name !== 'all') {
      if (device.name === device_name) {
        selected_devices.push(device);
      }
      continue;
    }
  }

  return selected_devices;
}
