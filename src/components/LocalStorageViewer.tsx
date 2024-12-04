import React, { useCallback, useEffect, useState } from 'react';
import { IS_DEBUG } from '../pages/ConsolePage';
import { X } from 'react-feather';

interface LocalStorageItem {
  key: string;
  value: string | null;
}

const excludeKeys = ['Hm_', 'ally-supports-cache'];

const LocalStorageViewer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [localStorageData, setLocalStorageData] = useState<LocalStorageItem[]>([]);

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

  return (
    <div>

      {isOpen && (
        <>

          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '100%',
              maxHeight: '100%',
              backgroundColor: '#1e1e1e',
              color: 'white',
              padding: '20px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
              zIndex: 10000,
              overflow: 'auto',
              borderRadius: '8px'
            }}
          >

            <X onClick={handleClose}
              style={{ cursor: 'pointer', fontSize: '20px', float: 'right', marginBottom: '10px' }} />

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ border: '1px solid gray', padding: '8px' }}>Key</th>
                  <th style={{ border: '1px solid gray', padding: '8px' }}>Value</th>
                </tr>
              </thead>
              <tbody>
                {localStorageData.length > 0 ? (
                  localStorageData.map((item, index) => (
                    <tr key={index}>
                      <td
                        style={{
                          border: '1px solid gray',
                          padding: '8px',
                          backgroundColor: '#2e2e2e'
                        }}
                      >
                        {item.key}
                      </td>
                      <td
                        style={{
                          border: '1px solid gray',
                          padding: '8px',
                          wordBreak: 'break-all',
                          whiteSpace: 'pre-wrap',
                          backgroundColor: '#2e2e2e'
                        }}
                      >
                        {item.value}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={2}
                      style={{
                        border: '1px solid gray',
                        padding: '8px',
                        textAlign: 'center',
                        backgroundColor: '#2e2e2e'
                      }}
                    >
                      No data
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

          </div>


          <div
            style={{
              position: 'fixed',
              top: '0',
              left: '0',
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 9999
            }}
            onClick={handleClose}
          ></div>
        </>
      )}
    </div>
  );
};

export default LocalStorageViewer;
