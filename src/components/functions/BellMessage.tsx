import React, { useEffect, useState } from 'react';
import { useContexts } from '../../providers/AppProvider';
import { X } from 'react-feather';
import './BingSearchResult.scss';
import { GptImage } from '../../interfaces/GptImage';
import { Activity, Bell } from 'react-feather';

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

    const { paintingData, setPaintingData } = useContexts();
    const [isShow, setIsShow] = useState(false);

    useEffect(() => {
        setIsShow(paintingData.length > 0);
    }, [paintingData]);

    const ShowPainting = () => {
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

                        {paintingData.length === 0 && <div>No images</div>}

                        {paintingData.map((image: GptImage) => (

                            <div>
                                <img
                                    src={`data:image/png;base64,${image.b64_json}`}
                                    alt={image.prompt}
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
            <ShowPainting />
        </>
    );
};


export default BellMessage;
