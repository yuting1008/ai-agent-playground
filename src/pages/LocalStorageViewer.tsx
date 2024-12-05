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
  const { photosRef,
    assistantResponseBufferRef,
    threadJobRef,
    threadRef,
    avatarSpeechSentencesArrayRef,
    isAvatarStartedRef,
    realtimeInstructionsRef,
    assistantRef,
    isCameraOnRef,
    isWebcamReadyRef,
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
                <tr key='isCameraOnRef'><td className={styles.tdKey}>isCameraOnRef</td><td className={styles.tdValue}>{JSON.stringify(isCameraOnRef.current)}</td></tr>
                <tr key='isWebcamReadyRef'><td className={styles.tdKey}>isWebcamReadyRef</td><td className={styles.tdValue}>{JSON.stringify(isWebcamReadyRef.current)}</td></tr>
       
                <tr key='photosRefLength'><td className={styles.tdKey}>photosRef.length</td><td className={styles.tdValue}>{photosRef.current.length} / {CAMERA_PHOTO_LIMIT}</td></tr>
                <tr key='photosRefSize'><td className={styles.tdKey}>photosRefSize</td><td className={styles.tdValue}>{getStringArraySizeUtf8InMB(photosRef.current)} MB</td></tr>
                
                <tr key='assistantRef.id'><td className={styles.tdKey}>assistantRef</td><td className={styles.tdValue}>{assistantRef?.current?.id}</td></tr>
                <tr key='threadRef'><td className={styles.tdKey}>threadRef</td><td className={styles.tdValue}>{JSON.stringify(threadRef.current)}</td></tr>
                <tr key='threadJobRef'><td className={styles.tdKey}>threadJobRef</td><td className={styles.tdValue}>{JSON.stringify(threadJobRef.current)}</td></tr>
                <tr key='assistantResponseBufferRef'><td className={styles.tdKey}>assistantResponseBufferRef</td><td className={styles.tdValue}>{assistantResponseBufferRef.current}</td></tr>

                <tr key='isAvatarStartedRef'><td className={styles.tdKey}>isAvatarStartedRef</td><td className={styles.tdValue}>{JSON.stringify(isAvatarStartedRef.current)}</td></tr>
                <tr key='avatarSpeechSentencesArrayRef'><td className={styles.tdKey} >avatarSpeechSentencesArrayRef</td><td className={styles.tdValue}>{JSON.stringify(avatarSpeechSentencesArrayRef.current)}</td></tr>
                
                <tr key='realtimeInstructionsRef'><td className={styles.tdKey}>realtimeInstructionsRef</td><td className={styles.tdValue}>{realtimeInstructionsRef.current}</td></tr>
                
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
