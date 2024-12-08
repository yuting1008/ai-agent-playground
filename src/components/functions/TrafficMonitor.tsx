import React, { useState } from 'react';
import { X } from 'react-feather';
import './BingSearchResult.scss';
import { Activity } from 'react-feather';
import { useContexts } from '../../providers/AppProvider';
import { CONNECT_CONNECTED } from '../../lib/const';
import { quantile } from "simple-statistics";
import { calculatePercentiles } from '../../lib/helper';


// avgLatency, round to 5
function avgLatency(array: number[]) {
    return Math.round(array.reduce((sum, latency) => sum + latency, 0) / array.length * 100) / 100;
}

type TableItem = {
    value: string;
    key: string;
    unit?: string;
}

type TableSheet = {
    name: string,
    items: TableItem[]
}

const TrafficMonitor: React.FC = () => {

    const [isShow, setIsShow] = useState(false);
    const { isNightMode } = useContexts();
    const { firstTokenLatencyArray, connectStatus } = useContexts();
    const { tokenLatencyArray } = useContexts();

    const firstTokenLatencyLast = firstTokenLatencyArray.length > 0 ? firstTokenLatencyArray[firstTokenLatencyArray.length - 1] : 0;
    const tokenLatencyLast = tokenLatencyArray.length > 0 ? tokenLatencyArray[tokenLatencyArray.length - 1] : 0;

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
            // width: '70%',
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
        img: {
            width: '100%',
            height: 'auto',
        },
        tables: {
            padding: '5px',
            flexWrap: 'wrap',
            gap: '5px',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            // backgroundColor: 'rgb(0, 0, 0, 0.1)',
            borderRadius: '4px',
        },
        table: {
            borderCollapse: 'collapse',
            fontWeight: 'bold',
        },
        tablesDashboard: {
            padding: '20px',
            flexWrap: 'wrap',
            gap: '25px',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
        },
        tableDashboard: {
            border: '1px solid #ccc',
            padding: '10px',
            minWidth: '170px',
            // width: '100%',
            marginTop: '10px',
        },
        key: {
            textAlign: 'right',
            margin: '0',
            padding: '0',
        },
        value: {
            color: 'green',
            textAlign: 'left',
            float: 'left',
            margin: '0',
            padding: '0',
            marginLeft: '5px',
        },
        unit: {
            textAlign: 'left',
            paddingLeft: '5px',
        },
    };

    const renderTable = (style: React.CSSProperties, table: TableSheet) => {
        return <div>
            {table.name && <div>{table.name}</div>}
            <div>
                <table style={style}>
                    <tbody>
                        {
                            table.items.map((item) => (
                                <tr>
                                    <td style={styles.key}>{item.key}</td>
                                    <td style={styles.value}>{item.value}</td>
                                    <td style={styles.unit}>{item?.unit || ""}</td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>
        </div>;
    }

    const ShowTopBar = () => {
        const table1: TableSheet = {
            name: '',
            items: [
                { key: 'Request', value: firstTokenLatencyArray.length.toString() },
                { key: 'Response', value: tokenLatencyArray.length.toString() },
            ]
        };

        const table2: TableSheet = {
            name: '',
            items: [
                { key: 'First Token', value: firstTokenLatencyLast.toString(), unit: 'ms' },
                { key: 'Next  Token', value: tokenLatencyLast.toString(), unit: 'ms' },
            ]
        };

        return connectStatus === CONNECT_CONNECTED ? (
            <div style={styles.tables}>
                {renderTable(styles.table, table1)}
                {renderTable(styles.table, table2)}
            </div>
        ) : null;
    }

    const ShowTrafficMonitor = () => {
        if (!isShow) {
            return null;
        }

        console.log('compute', firstTokenLatencyArray, tokenLatencyArray);
        
        const firstTokenLatencyMin = firstTokenLatencyArray.length > 0 ? Math.min(...firstTokenLatencyArray) : 0;
        const firstTokenLatencyMax = firstTokenLatencyArray.length > 0 ? Math.max(...firstTokenLatencyArray) : 0;
        const firstTokenLatencyAvg = firstTokenLatencyArray.length > 0 ? avgLatency(firstTokenLatencyArray) : 0;
        const firstTokenLatencyPercentiles = calculatePercentiles(firstTokenLatencyArray);
        const firstTokenLatencyP50 = firstTokenLatencyPercentiles['P50'];
        const firstTokenLatencyP90 = firstTokenLatencyPercentiles['P90'];
        const firstTokenLatencyP95 = firstTokenLatencyPercentiles['P95'];
        const firstTokenLatencyP99 = firstTokenLatencyPercentiles['P99'];

        const tokenLatencyMin = tokenLatencyArray.length > 0 ? Math.min(...tokenLatencyArray) : 0;
        const tokenLatencyMax = tokenLatencyArray.length > 0 ? Math.max(...tokenLatencyArray) : 0;
        const tokenLatencyAvg = tokenLatencyArray.length > 0 ? avgLatency(tokenLatencyArray) : 0;
        const tokenLatencyPercentiles = calculatePercentiles(tokenLatencyArray);
        const tokenLatencyP50 = tokenLatencyPercentiles['P50'];
        const tokenLatencyP90 = tokenLatencyPercentiles['P90'];
        const tokenLatencyP95 = tokenLatencyPercentiles['P95'];
        const tokenLatencyP99 = tokenLatencyPercentiles['P99'];

        const timesTable: TableSheet = {
            name: 'Times',
            items: [
                { key: 'Request:', value: firstTokenLatencyArray.length.toString() },
                { key: 'Response:', value: tokenLatencyArray.length.toString() },
                { key: ':', value: '' },
                { key: ':', value: '' },
                { key: ':', value: '' },
                { key: ':', value: '' },
                { key: ':', value: '' },
                { key: ':', value: '' },
            ]
        }
        const firstTokenLatencyTable: TableSheet = {
            name: 'First Token Latency',
            items: [
                { key: 'Min:', value: firstTokenLatencyMin.toString(), unit: 'ms' },
                { key: 'Max:', value: firstTokenLatencyMax.toString(), unit: 'ms' },
                { key: 'Avg:', value: firstTokenLatencyAvg.toString(), unit: 'ms' },
                { key: 'P50:', value: firstTokenLatencyP50.toString(), unit: 'ms' },
                { key: 'P90:', value: firstTokenLatencyP90.toString(), unit: 'ms' },
                { key: 'P95:', value: firstTokenLatencyP95.toString(), unit: 'ms' },
                { key: 'P99:', value: firstTokenLatencyP99.toString(), unit: 'ms' },
                { key: 'Last:', value: firstTokenLatencyLast.toString(), unit: 'ms' },
            ]
        };

        const tokenLatencyTable: TableSheet = {
            name: 'Token Latency',
            items: [
                { key: 'Min:', value: tokenLatencyMin.toString(), unit: 'ms' },
                { key: 'Max:', value: tokenLatencyMax.toString(), unit: 'ms' },
                { key: 'Avg:', value: tokenLatencyAvg.toString(), unit: 'ms' },
                { key: 'P50:', value: tokenLatencyP50.toString(), unit: 'ms' },
                { key: 'P90:', value: tokenLatencyP90.toString(), unit: 'ms' },
                { key: 'P95:', value: tokenLatencyP95.toString(), unit: 'ms' },
                { key: 'P99:', value: tokenLatencyP99.toString(), unit: 'ms' },
                { key: 'Last:', value: tokenLatencyLast.toString(), unit: 'ms' },
            ]
        };

        return (
            <div style={styles.backdrop}>
                <div style={styles.modal} className={'modal'}>

                    <div style={styles.header}>
                        <h2>Traffic Monitor</h2>
                        <button key="close" onClick={() => setIsShow(false)} style={styles.closeBtn}><X /></button>
                    </div>

                    <div style={styles.tablesDashboard}>
                        {renderTable(styles.tableDashboard, timesTable)}
                        {renderTable(styles.tableDashboard, firstTokenLatencyTable)}
                        {renderTable(styles.tableDashboard, tokenLatencyTable)}
                    </div>

                </div>
            </div>
        )
    }

    return (
        <>
            <span onClick={() => setIsShow(true)}>
                <ShowTopBar />
                <Activity />
            </span>
            <ShowTrafficMonitor />
        </>
    );
};


export default TrafficMonitor;
