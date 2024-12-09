import React, { useEffect, useState } from 'react';
import { X } from 'react-feather';
import './BingSearchResult.scss';
import { GptImage } from '../../types/GptImage';
import { Image } from 'react-feather';
import { useGptImages } from '../../contexts/GptImagesContext';
import { useContexts } from '../../providers/AppProvider';

const PaintingResult: React.FC = () => {
  const images = useGptImages();
  const [isShow, setIsShow] = useState(false);
  const { isNightMode } = useContexts();

  const styles: { [key: string]: React.CSSProperties } = {
    backdrop: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
      backgroundColor: 'rgba(0,0,0,0.5)',
      wordBreak: 'break-all',
      scrollbarColor: isNightMode
        ? 'rgba(0, 0, 0, 0.5) transparent'
        : 'transparent',
    },
    modal: {
      borderRadius: '4px',
      width: '70%',
      maxHeight: '80%',
      overflowY: 'auto',
      boxShadow: '0 0 10px rgba(0,0,0,0.3)',
      position: 'relative',
    },
    header: {
      padding: '10px 15px',
      borderBottom: '1px solid #ccc',
      display: 'flex',
      justifyContent: 'space-between',

      position: 'sticky', // 使用 sticky 定位
      top: 0, // 确保 header 保持在顶部
      backgroundColor: isNightMode ? '#222' : 'white', // 添加背景色，以确保内容滚动时不会遮挡
      zIndex: 1, // 设置 z-index 确保它在其他内容之上
    },
    closeBtn: {
      background: 'none',
      border: 'none',
      fontSize: '16px',
      cursor: 'pointer',
    },
    content: {
      padding: '20px',
      flexWrap: 'wrap',
      gap: '10px',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(25%, 1fr))',
      gridGap: '10px',
    },
    img: {
      width: '100%',
      height: 'auto',
    },
  };

  useEffect(() => {
    setIsShow(images.length > 0);
  }, [images]);

  const ShowPainting = () => {
    if (!isShow) {
      return null;
    }

    return (
      <div style={styles.backdrop}>
        <div style={styles.modal} className={'modal'}>
          <div style={styles.header}>
            <h2>Images</h2>
            <button
              key="close"
              onClick={() => setIsShow(false)}
              style={styles.closeBtn}
            >
              <X />
            </button>
          </div>

          <div style={styles.content}>
            {images.length === 0 && <div>No images</div>}

            {images.map((image: GptImage, index: number) => (
              <div key={index}>
                <img
                  src={`data:image/png;base64,${image.b64_json}`}
                  alt={image.prompt}
                  key={index}
                  style={styles.img}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <span onClick={() => setIsShow(true)}>
        <Image />
      </span>
      <ShowPainting />
    </>
  );
};

export default PaintingResult;
