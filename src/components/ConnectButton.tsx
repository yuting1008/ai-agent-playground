import { Button } from '../components/button/Button';
import { CONNECT_CONNECTED, CONNECT_CONNECTING } from '../lib/const';
import { X, Zap } from 'react-feather';

export default function ConnectButton({
  connectStatus,
  connectConversation,
}: {
  connectStatus: string;
  connectConversation: () => void;
}) {
  /**
   * Disconnect and reset conversation state
   */
  const disconnectConversation = () => {
    window.location.reload();
  };

  return (
    <div className="content-actions">
      <Button
        disabled={connectStatus === CONNECT_CONNECTING}
        className={'container_bg'}
        label={
          connectStatus === CONNECT_CONNECTED
            ? 'Disconnect'
            : connectStatus === CONNECT_CONNECTING
              ? 'Connecting'
              : 'Connect'
        }
        icon={connectStatus === CONNECT_CONNECTED ? X : Zap}
        buttonStyle={connectStatus === CONNECT_CONNECTED ? 'regular' : 'action'}
        onClick={
          connectStatus === CONNECT_CONNECTED
            ? disconnectConversation
            : connectConversation
        }
      />
    </div>
  );
}
