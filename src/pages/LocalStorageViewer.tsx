import React, { useCallback, useEffect, useState } from 'react';
import { X } from 'react-feather';
import { useContexts } from '../providers/AppProvider';
import styles from './LocalStorageViewer.module.css';
import { CAMERA_PHOTO_LIMIT } from '../lib/const';

interface LocalStorageItem {
  key: string;
  value: string | null;
}

const excludeKeys = ['Hm_', 'ally-supports-cache'];

const LocalStorageViewer: React.FC = () => {

  const [isOpen, setIsOpen] = useState(false);
  const [localStorageData, setLocalStorageData] = useState<LocalStorageItem[]>([]);
  const {
    cameraStatus,
    avatarStatus,
    isNightMode,
    isAvatarSpeaking,
    photos,
    responseBuffer,
    threadJob,
    thread,
    speechSentencesCacheArray,
    llmInstructions,
    assistant,
    memoryKv,
    inputValue,
    needSpeechQueue,
    captionQueue,
  } = useContexts();

  const fetchLocalStorageData = useCallback(() => {
    const keys = Object.keys(localStorage);

    const data: LocalStorageItem[] = keys
      .filter((key) => {
        return !excludeKeys.some((excludeKey) => key.startsWith(excludeKey));
      })
      .map((key) => ({
        key,
        value: localStorage.getItem(key)
      }))
      .sort((a, b) => a.key.localeCompare(b.key));

    setLocalStorageData(data);
  }, []);

  const handleOpen = useCallback(() => {
    fetchLocalStorageData();
    setIsOpen(true);
  }, [fetchLocalStorageData]);


  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);


  const handleEscKey = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    },
    [handleClose]
  );


  const handleShortcutKey = useCallback(
    (event: KeyboardEvent) => {
      if (event.ctrlKey && event.altKey && event.key.toLowerCase() === 'l') {
        event.preventDefault();
        handleOpen();
      }
    },
    [handleOpen]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    } else {
      document.removeEventListener('keydown', handleEscKey);
    }

    document.addEventListener('keydown', handleShortcutKey);

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.removeEventListener('keydown', handleShortcutKey);
    };
  }, [isOpen, handleEscKey, handleShortcutKey]);

  function getStringArraySizeUtf8InMB(arr: string[]): number {
    const encoder = new TextEncoder();
    const totalBytes = arr.reduce((total, str) => total + encoder.encode(str).length, 0);
    return parseFloat((totalBytes / (1024 * 1024)).toFixed(5));
  }


  return (
    <div>

      {isOpen && (
        <>

          <div className={styles.table}>

            <X onClick={handleClose} className={styles.close} />

            <h1 className={styles.title}>App State</h1>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th className={styles.th}>Key</th>
                  <th className={styles.th}>Value</th>
                </tr>
              </thead>
              <tbody>

                <tr key='cameraStatus'><td className={styles.tdKey}>cameraStatus</td><td className={styles.tdValue}>{cameraStatus}</td></tr>
                <tr key='photos.length'><td className={styles.tdKey}>photos.length</td><td className={styles.tdValue}>{photos.length} / {CAMERA_PHOTO_LIMIT}</td></tr>
                <tr key='photos.size'><td className={styles.tdKey}>photos.size</td><td className={styles.tdValue}>{getStringArraySizeUtf8InMB(photos)} MB</td></tr>

                <tr key='avatarStatus'><td className={styles.tdKey}>avatarStatus</td><td className={styles.tdValue}>{avatarStatus}</td></tr>
                <tr key='isAvatarSpeaking'><td className={styles.tdKey}>isAvatarSpeaking</td><td className={styles.tdValue}>{JSON.stringify(isAvatarSpeaking)}</td></tr>
                <tr key='isNightMode'><td className={styles.tdKey}>isNightMode</td><td className={styles.tdValue}>{JSON.stringify(isNightMode)}</td></tr>

                <tr key='inputValue'><td className={styles.tdKey}>inputValue</td><td className={styles.tdValue}>{inputValue}</td></tr>
                <tr key='responseBuffer'><td className={styles.tdKey}>responseBuffer</td><td className={styles.tdValue}>{responseBuffer}</td></tr>

                <tr key='memoryKv'><td className={styles.tdKey}>memoryKv</td><td className={styles.tdValue}>{JSON.stringify(memoryKv)}</td></tr>

                <tr key='assistant.id'><td className={styles.tdKey}>assistant.id</td><td className={styles.tdValue}>{assistant?.id}</td></tr>
                <tr key='thread'><td className={styles.tdKey}>thread</td><td className={styles.tdValue}>{JSON.stringify(thread)}</td></tr>
                <tr key='threadJob'><td className={styles.tdKey}>threadJob</td><td className={styles.tdValue}>{JSON.stringify(threadJob)}</td></tr>

                <tr key='speechSentencesCacheArray'><td className={styles.tdKey} >speechSentencesCacheArray</td><td className={styles.tdValue}>{JSON.stringify(speechSentencesCacheArray)}</td></tr>
                <tr key='needSpeechQueue'><td className={styles.tdKey}>needSpeechQueue</td><td className={styles.tdValue}>{JSON.stringify(needSpeechQueue)}</td></tr>
                <tr key='captionQueue'><td className={styles.tdKey}>captionQueue</td><td className={styles.tdValue}>{JSON.stringify(captionQueue)}</td></tr>

                <tr key='llmInstructions'><td className={styles.tdKey}>llmInstructions</td><td className={styles.tdValue}>{llmInstructions}</td></tr>

              </tbody>
            </table>

            <h1 className={styles.title}>Local Storage</h1>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th className={styles.th}>Key</th><th className={styles.th}>Value</th>
                </tr>
              </thead>
              <tbody>
                {
                  localStorageData.map((item, index) => (
                    <tr key={index}>
                      <td className={styles.tdKey} >{item.key}</td><td className={styles.tdValue}>{item.value}</td>
                    </tr>
                  ))
                }
              </tbody>
            </table>

          </div>

          <div className={styles.closeDiv} onClick={handleClose}></div>
        </>
      )}
    </div>
  );
};

export default LocalStorageViewer;
