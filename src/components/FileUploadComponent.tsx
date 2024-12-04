import { RealtimeClient } from '@theodoreniu/realtime-api-beta';
import React, { useRef, useState } from 'react';
import { fileUploadInstructions, fileUploadTooBig } from '../lib/const';
import './FileUploadComponent.scss';
import { Upload } from 'react-feather';
import { Button } from '../components/button/Button';
import { DATA_BEGIN, DATA_END } from '../lib/instructions';
import { useContexts } from '../providers/AppProvider';



const FileUploadComponent: React.FC = () => {

  const { realtimeClientRef } = useContexts();

  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('Upload File');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { replaceInstructions } = useContexts();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];

    if (selectedFile && (selectedFile.type === 'text/plain' || selectedFile.name.endsWith('.xlsx'))) {
      setFileName(selectedFile.name);

      if (selectedFile.type === 'text/plain') {
        const text = await selectedFile.text();
        console.log('TXT文件内容:', text);
        updateSession(text);
      } else if (selectedFile.name.endsWith('.xlsx')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const data = e.target?.result;
          if (data) {
            import('xlsx').then((XLSX) => {
              const workbook = XLSX.read(data, { type: 'array' });
              const firstSheetName = workbook.SheetNames[0];
              const worksheet = workbook.Sheets[firstSheetName];
              const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
              console.log('Excel文件内容:', jsonData);
              updateSession(JSON.stringify(jsonData));
            });
          }
        };
        reader.readAsArrayBuffer(selectedFile);
      }
    } else {
      alert('只允许上传 .txt 和 .xlsx 文件');
      event.target.value = '';
    }
  };

  const updateSession = (content: string) => {

    if (realtimeClientRef?.current.isConnected()) {

      if (content.length > 20000) {
        realtimeClientRef?.current.sendUserMessageContent([
          {
            type: `input_text`,
            text: fileUploadTooBig
          }
        ]);
        return;
      }

      console.log('content', content.length);

      realtimeClientRef?.current.updateSession({
        instructions: updateDataFile(content)
      });
      console.log('update instructions');

      realtimeClientRef?.current.sendUserMessageContent([
        {
          type: `input_text`,
          text: fileUploadInstructions
        }
      ]);

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


  return (
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
        accept=".txt, .xlsx"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

    </div>
  );
};

export default FileUploadComponent;
