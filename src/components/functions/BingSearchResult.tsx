import React, { useState } from 'react';
import { useContexts } from '../../providers/AppProvider';
import { X } from 'react-feather';
import './BingSearchResult.scss';

interface DeepLink {
    name: string;
    url: string;
    snippet?: string;
}

interface WebPage {
    id: string;
    name: string;
    url: string;
    snippet?: string;
    displayUrl?: string;
    dateLastCrawled?: string;
    deepLinks?: DeepLink[];
}

interface WebPagesData {
    value: WebPage[];
}

interface EntityItem {
    name: string;
    description?: string;
}

interface EntitiesData {
    value: EntityItem[];
}

interface RelatedSearchItem {
    text: string;
    displayText: string;
    webSearchUrl: string;
}

interface RelatedSearchesData {
    value: RelatedSearchItem[];
}

interface VideoItem {
    name: string;
    contentUrl: string;
    description?: string;
}

interface VideosData {
    value: VideoItem[];
}

interface BingSearchData {
    webPages?: WebPagesData;
    entities?: EntitiesData;
    relatedSearches?: RelatedSearchesData;
    videos?: VideosData;
}

const BingSearchResult: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'webpages' | 'entities' | 'related' | 'videos'>('webpages');

    const { bingSearchData, setBingSearchData } = useContexts();

    if (!bingSearchData) {
        return null;
    }

    const { webPages, entities, relatedSearches, videos } = bingSearchData || {};

    return (
        <div style={styles.backdrop} className="bing-search-result">
            <div style={styles.modal} className={'modal'}>
                <div style={styles.header}>
                    <h2>Bing Results: {bingSearchData?.queryContext?.originalQuery}</h2>
                    <button onClick={() => setBingSearchData(null)} style={styles.closeBtn}><X /></button>
                </div>
                <div style={styles.tabs}>
                    <button
                        style={activeTab === 'webpages' ? styles.activeTab : styles.tab}
                        onClick={() => setActiveTab('webpages')}
                    >
                        WebPages
                    </button>
                    <button
                        style={activeTab === 'entities' ? styles.activeTab : styles.tab}
                        onClick={() => setActiveTab('entities')}
                    >
                        Entities
                    </button>
                    <button
                        style={activeTab === 'related' ? styles.activeTab : styles.tab}
                        onClick={() => setActiveTab('related')}
                    >
                        Related Searches
                    </button>
                    <button
                        style={activeTab === 'videos' ? styles.activeTab : styles.tab}
                        onClick={() => setActiveTab('videos')}
                    >
                        Videos
                    </button>
                </div>
                <div style={styles.content}>
                    {activeTab === 'webpages' && webPages && (
                        <div>
                            <ul>
                                {webPages.value.map((item: any, idx: number) => (
                                    <li key={idx}>
                                        <a href={item.url} target="_blank" rel="noreferrer">
                                            {item.name}
                                        </a>
                                        <br />
                                        <small>{item.snippet}</small>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {activeTab === 'entities' && entities && (
                        <div>
                            <ul>
                                {entities.value.map((entity: any, idx: number) => (
                                    <li key={idx}>
                                        <strong>{entity.name}</strong>: {entity.description}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {activeTab === 'related' && relatedSearches && (
                        <div>
                            <ul>
                                {relatedSearches.value.map((rel: any, idx: number) => (
                                    <li key={idx}>
                                        <a href={rel.webSearchUrl} target="_blank" rel="noreferrer">{rel.displayText}</a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {activeTab === 'videos' && videos && (
                        <div>
                            <ul>
                                {videos.value.map((video: any, idx: number) => (
                                    <li key={idx}>
                                        <a href={video.contentUrl} target="_blank" rel="noreferrer">{video.name}</a><br />
                                        <small>{video.description}</small>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

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
        width: '80%',
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
    tabs: {
        display: 'flex',
        borderBottom: '1px solid #ccc'
    },
    tab: {
        padding: '10px 15px',
        cursor: 'pointer',
        border: 'none',
        marginRight: '5px'
    },
    activeTab: {
        padding: '10px 15px',
        cursor: 'pointer',
        border: 'none',
        marginRight: '5px',
        fontWeight: 'bold',
    },
    content: {
        padding: '20px',
    },
};

export default BingSearchResult;
