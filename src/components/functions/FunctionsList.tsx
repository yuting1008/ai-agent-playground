import React, { useState } from 'react';
import { X } from 'react-feather';
import { Package } from 'react-feather';
import { useContexts } from '../../providers/AppProvider';
import { modalStyles } from '../../styles/modalStyles';

const FunctionsList: React.FC = () => {
  const [isShow, setIsShow] = useState(false);
  const { isNightMode } = useContexts();
  const importModalStyles = modalStyles({ isNightMode });
  const { functionsToolsRef } = useContexts();

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
  };

  const ShowList = () => {
    if (!isShow) return null;

    return (
      <div style={importModalStyles.backdrop}>
        <div style={importModalStyles.modal} className={'modal'}>
          <div style={importModalStyles.header}>
            <h2>Functions</h2>
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
        <Package />
      </span>
      <ShowList />
    </>
  );
};

export default FunctionsList;
