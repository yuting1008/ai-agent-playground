import React, { useEffect, useState } from 'react';
import { Code, X } from 'react-feather';
import { Package } from 'react-feather';
import { useContexts } from '../../providers/AppProvider';
import { modalStyles } from '../../styles/modalStyles';
import { enableFunctionCalling } from '../../lib/helper';
import IconWithBadge from '../IconWithBadge';
import { Profiles } from '../../lib/Profiles';

const FunctionsList: React.FC = () => {
  const [isShow, setIsShow] = useState(false);
  const { isNightMode } = useContexts();
  const importModalStyles = modalStyles({ isNightMode });

  const { functionsToolsRef, builtinFunctionTools, loadFunctionsTools } =
    useContexts();
  const [showFunctionDefinition, setShowFunctionDefinition] = useState<
    any | false
  >(false);

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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showFunctionDefinition !== false) {
          setShowFunctionDefinition(false);
        } else {
          setIsShow(false);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showFunctionDefinition, isShow]);

  const FunctionDefinitionJsonModal: React.FC = () => {
    return showFunctionDefinition === false ? null : (
      <div style={importModalStyles.backdrop}>
        <div style={importModalStyles.modal}>
          <X
            style={styles.codeModalCloseBtn}
            onClick={() => setShowFunctionDefinition(false)}
          />

          <textarea
            readOnly
            autoFocus
            draggable={false}
            style={{ ...styles.codeModal, zIndex: 1000 }}
            value={JSON.stringify(showFunctionDefinition, null, 2)}
          />
        </div>
      </div>
    );
  };

  const ShowFunctionsList = () => {
    if (!isShow) {
      return null;
    }

    const profiles = new Profiles();

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
            {loadFunctionsTools.map((item) => (
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

            {profiles.currentProfile?.buildInFunctions &&
              builtinFunctionTools.map((item) => (
                <div style={styles.functionItem} key={item[0].name}>
                  <div style={styles.functionItemName}>
                    {item[0].name} (Built-in)
                  </div>
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

      <ShowFunctionsList />
      <FunctionDefinitionJsonModal />
    </>
  );
};

export default FunctionsList;
