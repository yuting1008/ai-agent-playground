import React, { useRef, useState } from 'react';
import { CONNECT_CONNECTED, fileUploadTooBig } from '../lib/const';
import { Upload } from 'react-feather';
import { Button } from './button/Button';
import { DATA_BEGIN, DATA_END } from '../lib/instructions';
import { useContexts } from '../providers/AppProvider';
import { RealtimeClient } from '@theodoreniu/realtime-api-beta';
import { image_vision } from '../lib/openai';
import { Profiles } from '../lib/Profiles';
const FileUploadComponent: React.FC<{
  connectStatus: string;
  realtimeClient: RealtimeClient;
}> = ({ connectStatus, realtimeClient }) => {
  const { replaceInstructions, setLoading } = useContexts();

  const [fileName, setFileName] = useState<string>('Upload File');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profiles, setProfiles] = useState<Profiles>(new Profiles());

  if (connectStatus !== CONNECT_CONNECTED) {
    return null;
  }

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      alert('请选择一个文件');
      event.target.value = '';
      return;
    }

    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        setLoading(true);
        const imageData = e.target?.result as string;
        const res = await image_vision(imageData as string);
        setLoading(false);
        realtimeClient.sendUserMessageContent([
          {
            type: `input_text`,
            text: `帮我画一张图片，内容是：${res?.message}`,
          },
        ]);
      };
      reader.readAsDataURL(selectedFile);
      event.target.value = '';
      return;
    }

    if (
      selectedFile.type !== 'text/plain' &&
      !selectedFile.name.endsWith('.xlsx')
    ) {
      alert('只允许上传 .txt 和 .xlsx 文件');
      event.target.value = '';
      return;
    }

    setFileName(selectedFile.name);

    if (selectedFile.type === 'text/plain') {
      const text = await selectedFile.text();
      console.log('TXT文件内容:', text);
      updateSession(text);
      return;
    }

    if (selectedFile.name.endsWith('.xlsx')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result;
        if (data) {
          import('xlsx').then((XLSX) => {
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, {
              header: 1,
            });
            console.log('Excel文件内容:', jsonData);
            updateSession(JSON.stringify(jsonData));
          });
        }
      };
      reader.readAsArrayBuffer(selectedFile);
    }
  };

  const updateSession = (content: string) => {
    if (realtimeClient.isConnected()) {
      if (content.length > 20000) {
        realtimeClient.sendUserMessageContent([
          {
            type: `input_text`,
            text: fileUploadTooBig,
          },
        ]);
        return;
      }

      console.log('content', content.length);

      updateDataFile(content);

      // realtimeClient.sendUserMessageContent([
      //   {
      //     type: `input_text`,
      //     text: fileUploadInstructions,
      //   },
      // ]);
    }
  };

  const updateDataFile = (content: string) => {
    const regex = new RegExp(`${DATA_BEGIN}[\\s\\S]*?${DATA_END}`, 'g');
    const target = `${DATA_BEGIN}\n${content}\n${DATA_END}`;

    return replaceInstructions(regex, target);
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return profiles.currentProfile?.buildInFunctions ? (
    <div className="content-actions">
      <Button
        label={fileName}
        icon={Upload}
        className={'container_bg'}
        buttonStyle={'regular'}
        onClick={handleButtonClick}
      />

      <input
        type="file"
        accept=".txt, .xlsx, .xls, .jpg, .jpeg, .png, .webp"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </div>
  ) : null;
};

export default FileUploadComponent;
