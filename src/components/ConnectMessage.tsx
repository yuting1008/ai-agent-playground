import {
  CONNECT_CONNECTED,
  CONNECT_CONNECTING,
  CONNECT_DISCONNECTED,
} from '../lib/const';

export default function ConnectMessage({
  connectMessage,
}: {
  connectMessage: string;
}) {
  return connectMessage ? (
    <div className={'waiting'}>{connectMessage}</div>
  ) : null;
}
