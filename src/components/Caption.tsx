import React, { useEffect } from "react";
import './Caption.scss'
import { useContexts } from "../providers/AppProvider";


const Caption: React.FC = () => {
    const { caption, setCaption } = useContexts();
    const { captionQueue, captionQueueRef, setCaptionQueue } = useContexts();

    useEffect(() => {
        captionQueueRef.current = captionQueue;
        if (captionQueue.length > 0) {
            setCaption(captionQueue[0]);
        } else {
            setCaption('');
        }
    }, [captionQueue]);

    return (
        caption ?
            <div className="captions">
                <h4>{caption}</h4>
            </div> : null
    );
};

export default Caption;
