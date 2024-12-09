import { CONNECT_CONNECTED, CONNECT_DISCONNECTED } from '../lib/const';

export default function ConnectMessage({
  connectStatus,
  connectMessage,
}: {
  connectStatus: string;
  connectMessage: string;
}) {
  if (connectStatus === CONNECT_CONNECTED) {
    return null;
  }

  let message = 'Connection...';

  if (connectStatus === CONNECT_DISCONNECTED) {
    message = connectMessage;
  }

  return <div className={'waiting'}>{message}</div>;
}
