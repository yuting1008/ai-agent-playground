import { useEffect, useState } from 'react';
import styles from './FileViewer.module.css';
import { getOpenAIClient } from '../lib/openai';
import { useContexts } from '../providers/AppProvider';
import { CONNECT_CONNECTED } from '../lib/const';

const TrashIcon = () => (
  <svg
    className={styles.fileDeleteIcon}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 12 12"
    height="12"
    width="12"
    fill="#353740"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5.15736 1.33332C4.8911 1.33332 4.65864 1.51361 4.59238 1.77149L4.4214 2.43693H7.58373L7.41275 1.77149C7.34649 1.51361 7.11402 1.33332 6.84777 1.33332H5.15736ZM8.78829 2.43693L8.54271 1.48115C8.34393 0.707516 7.64653 0.166656 6.84777 0.166656H5.15736C4.35859 0.166656 3.6612 0.707515 3.46241 1.48115L3.21683 2.43693H1.33333C1.01117 2.43693 0.75 2.6981 0.75 3.02026C0.75 3.34243 1.01117 3.6036 1.33333 3.6036H1.39207L2.10068 10.2683C2.19529 11.1582 2.94599 11.8333 3.84087 11.8333H8.15913C9.05401 11.8333 9.80471 11.1582 9.89932 10.2683L10.6079 3.6036H10.6667C10.9888 3.6036 11.25 3.34243 11.25 3.02026C11.25 2.6981 10.9888 2.43693 10.6667 2.43693H8.78829ZM9.43469 3.6036H2.56531L3.2608 10.145C3.29234 10.4416 3.54257 10.6667 3.84087 10.6667H8.15913C8.45743 10.6667 8.70766 10.4416 8.7392 10.145L9.43469 3.6036ZM4.83333 4.83332C5.1555 4.83332 5.41667 5.09449 5.41667 5.41666V8.33332C5.41667 8.65549 5.1555 8.91666 4.83333 8.91666C4.51117 8.91666 4.25 8.65549 4.25 8.33332V5.41666C4.25 5.09449 4.51117 4.83332 4.83333 4.83332ZM7.16667 4.83332C7.48883 4.83332 7.75 5.09449 7.75 5.41666V8.33332C7.75 8.65549 7.48883 8.91666 7.16667 8.91666C6.8445 8.91666 6.58333 8.65549 6.58333 8.33332V5.41666C6.58333 5.09449 6.8445 4.83332 7.16667 4.83332Z"
    />
  </svg>
);

const FileViewer = ({ connectStatus }: { connectStatus: string }) => {
  const [files, setFiles] = useState<any[]>([]);

  const { assistantRef } = useContexts();

  useEffect(() => {
    const interval = setInterval(() => {
      fetchFiles();
    }, 2000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getOrCreateVectorStore = async () => {
    if (!assistantRef?.current) {
      return '';
    }

    // if the assistant already has a vector store, return it
    if (
      assistantRef?.current.tool_resources?.file_search?.vector_store_ids
        ?.length &&
      assistantRef?.current.tool_resources.file_search.vector_store_ids.length >
        0
    ) {
      return assistantRef?.current.tool_resources.file_search
        .vector_store_ids[0];
    }
    // otherwise, create a new vector store and attatch it to the assistant
    const vectorStore = await getOpenAIClient().beta.vectorStores.create({
      name: 'sample-assistant-vector-store',
    });
    await getOpenAIClient().beta.assistants.update(assistantRef?.current.id, {
      tool_resources: {
        file_search: {
          vector_store_ids: [vectorStore.id],
        },
      },
    });
    return vectorStore.id;
  };

  // list files in assistant's vector store
  const fetchFiles = async () => {
    if (!assistantRef?.current) {
      return;
    }

    const vectorStoreId = await getOrCreateVectorStore(); // get or create vector store
    const fileList =
      await getOpenAIClient().beta.vectorStores.files.list(vectorStoreId);

    const filesArray = await Promise.all(
      fileList.data.map(async (file) => {
        const fileDetails = await getOpenAIClient().files.retrieve(file.id);
        const vectorFileDetails =
          await getOpenAIClient().beta.vectorStores.files.retrieve(
            vectorStoreId,
            file.id,
          );
        return {
          file_id: file.id,
          filename: fileDetails.filename,
          status: vectorFileDetails.status,
        };
      }),
    );

    setFiles(filesArray);
  };

  // delete file from assistant's vector store
  const handleFileDelete = async (fileId: string) => {
    const vectorStoreId = await getOrCreateVectorStore(); // get or create vector store
    await getOpenAIClient().beta.vectorStores.files.del(vectorStoreId, fileId); // delete file from vector store
  };

  const handleFileUpload = async (event: any) => {
    if (event.target.files.length < 0) return;

    const file = event.target.files[0];

    try {
      const vectorStoreId = await getOrCreateVectorStore();

      // upload using the file stream
      const openaiFile = await getOpenAIClient().files.create({
        file: file,
        purpose: 'assistants',
      });

      // add file to vector store
      await getOpenAIClient().beta.vectorStores.files.create(vectorStoreId, {
        file_id: openaiFile.id,
      });
    } catch (error) {
      console.error('Error uploading file: ', error);
      alert(error);
    }
  };

  if (connectStatus !== CONNECT_CONNECTED) {
    return null;
  }

  return (
    <div className="content-actions container_bg">
      <div className={styles.fileViewer}>
        <div
          className={`${styles.filesList} ${
            files.length !== 0 ? styles.grow : ''
          }`}
        >
          {files.length === 0 ? (
            <div className={styles.title}>Test file search</div>
          ) : (
            files.map((file: any) => (
              <div key={file.file_id} className={styles.fileEntry}>
                <div className={styles.fileName}>
                  <span className={styles.fileName}>{file.filename}</span>
                  <span className={styles.fileStatus}>{file.status}</span>
                </div>
                <span onClick={() => handleFileDelete(file.file_id)}>
                  <TrashIcon />
                </span>
              </div>
            ))
          )}
        </div>
        <div className={styles.fileUploadContainer}>
          <label htmlFor="file-upload" className={styles.fileUploadBtn}>
            Attach files
          </label>
          <input
            type="file"
            id="file-upload"
            name="file-upload"
            className={styles.fileUploadInput}
            multiple
            onChange={handleFileUpload}
          />
        </div>
      </div>
    </div>
  );
};

export default FileViewer;
