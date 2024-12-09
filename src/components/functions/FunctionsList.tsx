import React, { useState } from 'react';
import { X } from 'react-feather';
import './BingSearchResult.scss';
import { Package } from 'react-feather';
import { useContexts } from '../../providers/AppProvider';


const FunctionsList: React.FC = () => {

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
            width: '100%',
            height: 'auto',
            padding: '30px',
        },
        functionItem: {
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            paddingBottom: '20px',
        },
        functionItemName: {
            fontSize: '16px',
            fontWeight: 'bold',
        },
        functionItemDescription: {
            fontSize: '14px',
            color: '#666',
        },
    };


    const { functionsToolsRef } = useContexts();

    const ShowList = () => {
        if (!isShow) return null;

        return <div style={styles.backdrop}>
            <div style={styles.modal} className={'modal'}>
                <div style={styles.header}>
                    <h2>Functions</h2>
                    <button key="close" onClick={() => setIsShow(false)} style={styles.closeBtn}><X /></button>
                </div>

                <div style={styles.content}>
                    {functionsToolsRef.current.map((item) => (
                        <div style={styles.functionItem} key={item[0].name}>
                            <div style={styles.functionItemName}>{item[0].name}</div>
                            <div style={styles.functionItemDescription}>{item[0].description}</div>
                        </div>
                    ))}
                </div>

            </div>
        </div>;
    }

    return (
        <>
            <span onClick={() => setIsShow(true)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <Package />
            </span>
            <ShowList />
        </>
    );
};


export default FunctionsList;
