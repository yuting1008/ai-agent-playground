import {
  ItemType,
  RealtimeClient,
  ToolDefinitionType,
} from '@theodoreniu/realtime-api-beta/dist/lib/client.js';
import ReactMarkdown from 'react-markdown';
import ProductList from '../components/ProductList';
import { X } from 'react-feather';
import { AVATAR_READY, notDisplay, products } from '../lib/const';
import { useCallback } from 'react';
import { useContexts } from '../providers/AppProvider';

export default function RealtimeMessages({
  items,
  avatarStatus,
  realtimeClient,
}: {
  items: ItemType[];
  avatarStatus: string;
  realtimeClient: RealtimeClient;
}) {
  const deleteConversationItem = useCallback(async (id: string) => {
    realtimeClient.deleteItem(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isHiddenTool = (item: ItemType) => {
    if (item?.formatted?.text && notDisplay.includes(item?.formatted?.text)) {
      return true;
    }

    if (item.type !== 'function_call_output') {
      return false;
    }

    // graphrag
    if (JSON.parse(item?.output)?.sources?.length > 0) {
      return false;
    }

    // products
    if (JSON.parse(item?.output)?.products?.length > 0) {
      return false;
    }

    // rag
    if (JSON.parse(item?.output)?.isRag == true) {
      return false;
    }

    return true;
  };

  return (
    <div>
      {items.map((conversationItem) => {
        if (isHiddenTool(conversationItem)) {
          return null;
        }

        return (
          <div
            className={`conversation-item ${conversationItem.role === 'user' ? 'user' : 'assistant'}`}
            key={conversationItem.id}
          >
            <div
              className={`speaker ${conversationItem.role === 'user' ? 'user' : 'assistant'}`}
            ></div>

            <div
              className={`speaker-content ${conversationItem.role === 'user' ? 'user' : 'assistant'}`}
            >
              <div
                className="close"
                onClick={() => deleteConversationItem(conversationItem.id)}
              >
                <X />
              </div>

              {/* tool call */}
              {!!conversationItem.formatted.tool && (
                <div className="loading-spinner" key={conversationItem.id}>
                  <div
                    className="spinner"
                    key={conversationItem.id + 'spinner'}
                  ></div>
                </div>
              )}

              {/* tool response */}
              {conversationItem.type === 'function_call_output' && (
                <div>
                  {JSON.parse(conversationItem?.output)?.sources?.map(
                    (item: any) => {
                      if (
                        item.screenshot_sas_url &&
                        item.screenshot_sas_url.length > 1
                      ) {
                        return (
                          <div>
                            <div className="icon_file_link">
                              <img src="/pdf.svg" alt="file" />
                              <a href={item.pdf_sas_url} target="_blank">
                                {item.pdf_file}
                              </a>{' '}
                              Page:{item.page_number}
                            </div>

                            <a href={item.screenshot_sas_url} target="_blank">
                              <img
                                src={item.screenshot_sas_url}
                                key={conversationItem.id + item.screenshot_file}
                                alt={item.screenshot_sas_url}
                                className="graphrag_img"
                              />
                            </a>
                          </div>
                        );
                      }
                      return null;
                    },
                  )}

                  {JSON.parse(conversationItem?.output)?.products && (
                    <ProductList products={products} />
                  )}
                </div>
              )}

              {/*user message*/}
              {!conversationItem.formatted.tool &&
                conversationItem.role === 'user' && (
                  <div>
                    {conversationItem.formatted.transcript ||
                      (conversationItem.formatted.audio?.length
                        ? '(awaiting transcript)'
                        : conversationItem.formatted.text || '(item sent)')}
                  </div>
                )}

              {/*assistant message*/}
              {!conversationItem.formatted.tool &&
                conversationItem.role === 'assistant' && (
                  <div>
                    <ReactMarkdown
                      components={{
                        a: ({ node, ...props }) => (
                          <a
                            {...props}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {props.children}
                          </a>
                        ),
                      }}
                    >
                      {conversationItem.formatted.transcript ||
                        conversationItem.formatted.text ||
                        '(truncated)'}
                    </ReactMarkdown>
                  </div>
                )}

              {/*file message*/}
              {conversationItem.formatted.file &&
                (conversationItem.role === 'user' ||
                  avatarStatus !== AVATAR_READY) && (
                  <audio src={conversationItem.formatted.file.url} controls />
                )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
