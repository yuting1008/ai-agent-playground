import React, { useEffect, useState } from 'react';
import { X } from 'react-feather';
import './BingSearchResult.scss';
import { GptImage } from '../../types/GptImage';
import { Bell } from 'react-feather';
import { useBellMessages } from '../../contexts/BellMessagesContext';

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
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    modal: {
        borderRadius: '4px',
        width: '60%',
        maxHeight: '80%',
        overflowY: 'auto',
        boxShadow: '0 0 10px rgba(0,0,0,0.3)',
        position: 'relative',
    },
    header: {
        padding: '10px',
        borderBottom: '1px solid #ccc',
        display: 'flex',
        justifyContent: 'space-between'
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

const BellMessage: React.FC = () => {

    const messages = useBellMessages();
    const [isShow, setIsShow] = useState(false);

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
