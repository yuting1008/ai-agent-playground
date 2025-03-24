import React, { useState } from 'react';
import { useContexts } from '../../providers/AppProvider';
import { X } from 'react-feather';
import { modalStyles } from '../../styles/modalStyles';

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
  const [activeTab, setActiveTab] = useState<
    'webpages' | 'entities' | 'related' | 'videos'
  >('webpages');

  const { bingSearchData, setBingSearchData } = useContexts();
  const { isNightMode } = useContexts();

  if (!bingSearchData) {
    return null;
  }

  const { webPages, entities, relatedSearches, videos } = bingSearchData || {};
  const styles = modalStyles({ isNightMode });

  const tabStyles = {
    h2: {
      fontWeight: 400,
    },
    ul: {
      listStyle: 'none',
      padding: 0,
      margin: 0,
    },
    li: {
      marginBottom: '10px',
    },
    a: {
      color: 'green',
    },
  };

  return (
    <div style={styles.backdrop}>
      <div style={styles.modal} className={'modal'}>
        <div style={styles.header}>
          <h2>Bing Results: {bingSearchData?.queryContext?.originalQuery}</h2>
          <button
            onClick={() => setBingSearchData(null)}
            style={styles.closeBtn}
          >
            <X />
          </button>
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
              <ul style={tabStyles.ul}>
                {webPages.value.map((item: any, idx: number) => (
                  <li key={idx} style={tabStyles.li}>
                    <a
                      href={item.url}
                      target="_blank"
                      style={tabStyles.a}
                      rel="noreferrer"
                    >
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
              <ul style={tabStyles.ul}>
                {entities.value.map((entity: any, idx: number) => (
                  <li key={idx} style={tabStyles.li}>
                    <strong>{entity.name}</strong>: {entity.description}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {activeTab === 'related' && relatedSearches && (
            <div>
              <ul style={tabStyles.ul}>
                {relatedSearches.value.map((rel: any, idx: number) => (
                  <li key={idx} style={tabStyles.li}>
                    <a href={rel.webSearchUrl} target="_blank" rel="noreferrer">
                      {rel.displayText}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {activeTab === 'videos' && videos && (
            <div>
              <ul style={tabStyles.ul}>
                {videos.value.map((video: any, idx: number) => (
                  <li key={idx} style={tabStyles.li}>
                    <a href={video.contentUrl} target="_blank" rel="noreferrer">
                      {video.name}
                    </a>
                    <br />
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

export default BingSearchResult;
