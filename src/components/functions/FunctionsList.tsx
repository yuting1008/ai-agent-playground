import React, { useState } from 'react';
import { Code, X } from 'react-feather';
import { Package } from 'react-feather';
import { useContexts } from '../../providers/AppProvider';
import { modalStyles } from '../../styles/modalStyles';
import { enableFunctionCalling } from '../../lib/helper';
import IconWithBadge from '../IconWithBadge';

const FunctionsList: React.FC = () => {
  const [isShow, setIsShow] = useState(false);
  const { isNightMode } = useContexts();
  const importModalStyles = modalStyles({ isNightMode });
  const { functionsToolsRef } = useContexts();
  const [showFunctionDefinition, setShowFunctionDefinition] = useState<
    any | null
  >(null);

  const styles = {
    content: {
      width: '100%',
      height: 'auto',
      padding: '30px',
    } as React.CSSProperties,
    functionItem: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      paddingBottom: '20px',
    } as React.CSSProperties,
    functionItemName: {
      fontSize: '16px',
      fontWeight: 'bold',
    } as React.CSSProperties,
    functionItemDescription: {
      fontSize: '14px',
      color: '#666',
    } as React.CSSProperties,
    addFunctionButton: {
      backgroundColor: '#000',
      color: '#fff',
      padding: '10px 20px',
      borderRadius: '5px',
      marginRight: '10px',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease',
      '&:hover': {
        backgroundColor: '#333',
      },
    } as React.CSSProperties,
    codeModal: {
      width: '100%',
      height: '600px',
      padding: '10px',
      borderRadius: '5px',
      border: 'none',
      backgroundColor: isNightMode ? '#000' : '#fff',
      color: isNightMode ? '#fff' : '#000',
    } as React.CSSProperties,
    codeModalCloseBtn: {
      cursor: 'pointer',
      color: isNightMode ? '#fff' : '#000',
      backgroundColor: isNightMode ? '#333' : '#fff',
      border: 'none',
      borderRadius: '5px',
      padding: '5px',
      height: '30px',
      width: '30px',
    } as React.CSSProperties,
  };

  const FunctionDefinitionJsonModal = () => {
    if (!showFunctionDefinition) return null;
    return (
      <div style={importModalStyles.backdrop}>
        <div style={importModalStyles.modal}>
          <X
            style={styles.codeModalCloseBtn}
            onClick={() => setShowFunctionDefinition(false)}
          />

          {/* textarea */}
          <textarea
            readOnly
            style={styles.codeModal}
            value={JSON.stringify(showFunctionDefinition, null, 2)}
          />
        </div>
      </div>
    );
  };

  const ShowList = () => {
    if (!isShow) return null;

    return (
      <div style={importModalStyles.backdrop}>
        <div style={importModalStyles.modal} className={'modal'}>
          <div style={importModalStyles.header}>
            <h2>Functions ({functionsToolsRef.current.length})</h2>
            <button
              key="close"
              onClick={() => setIsShow(false)}
              style={importModalStyles.closeBtn}
            >
              <X />
            </button>
          </div>

          <div style={styles.content}>
            {functionsToolsRef.current.map((item) => (
              <div style={styles.functionItem} key={item[0].name}>
                <div style={styles.functionItemName}>{item[0].name}</div>
                <div style={styles.functionItemDescription}>
                  {item[0].description}
                  <Code
                    size={14}
                    style={{
                      cursor: 'pointer',
                      marginLeft: '5px',
                    }}
                    onClick={() => {
                      setShowFunctionDefinition(item[0]);
                    }}
                  />
                </div>
              </div>
            ))}

            <br />
            <br />
            {/* button to add new function */}
            <button
              style={styles.addFunctionButton}
              onClick={() => {
                // upload a json file
                const fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.accept = '.json';
                fileInput.onchange = (e: any) => {
                  const file = e.target.files[0];
                  const reader = new FileReader();
                  reader.onload = (e: any) => {
                    const json = JSON.parse(e.target.result as string);
                    console.log(json);
                    localStorage.setItem('functions', JSON.stringify(json));
                    alert('Functions loaded successfully');
                    window.location.reload();
                  };
                  reader.readAsText(file);
                };
                fileInput.click();
              }}
            >
              Load Functions
            </button>
            {/* clear all functions */}
            <button
              style={styles.addFunctionButton}
              onClick={() => {
                localStorage.removeItem('functions');
                alert('Functions cleared successfully');
                window.location.reload();
              }}
            >
              Clear Functions
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <span
        onClick={() => setIsShow(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
        }}
      >
        <IconWithBadge
          icon={<Package size={24} />}
          badge={enableFunctionCalling() ? null : <X />}
        />
      </span>

      <ShowList />
      <FunctionDefinitionJsonModal />
    </>
  );
};

export default FunctionsList;
