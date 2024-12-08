import React, { useEffect, useState } from 'react';
import { X } from 'react-feather';
import './BingSearchResult.scss';
import { GptImage } from '../../types/GptImage';
import { Bell } from 'react-feather';
import { useBellMessages } from '../../contexts/BellMessagesContext';
import { useContexts } from '../../providers/AppProvider';


const BellMessage: React.FC = () => {

    const messages = useBellMessages();
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
            scrollbarColor: isNightMode ? 'rgba(0, 0, 0, 0.5) transparent' : 'transparent',
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

            position: 'sticky',  // 使用 sticky 定位
            top: 0,  // 确保 header 保持在顶部
            backgroundColor: isNightMode ? '#222' : 'white',  // 添加背景色，以确保内容滚动时不会遮挡
            zIndex: 1,  // 设置 z-index 确保它在其他内容之上
        },
        closeBtn: {
            background: 'none',
            border: 'none',
            fontSize: '16px',
            cursor: 'pointer'
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
        }
    };

    useEffect(() => {
        setIsShow(messages.length > 0);
    }, [messages]);

    const ShowBellMessage = () => {
        if (!isShow) {
            return null;
        }

        return (
            <div style={styles.backdrop}>
                <div style={styles.modal} className={'modal'}>

                    <div style={styles.header}>
                        <h2>Images</h2>
                        <button key="close" onClick={() => setIsShow(false)} style={styles.closeBtn}><X /></button>
                    </div>

                    <div style={styles.content}>

                        {messages.length === 0 && <div>No messages</div>}

                        {messages.map((message: GptImage) => (

                            <div>
                                <img
                                    src={`data:image/png;base64,${message.b64_json}`}
                                    alt={message.prompt}
                                    style={styles.img}
                                />
                            </div>

                        ))}

                    </div>
                </div>
            </div>
        )
    }

    return (
        <>
            <span onClick={() => setIsShow(true)}>
                <Bell />
            </span>
            <ShowBellMessage />
        </>
    );
};


export default BellMessage;
