
export default function ConnectMessage({
  connectMessage,
}: {
  connectMessage: string;
}) {
  return connectMessage ? (
    <div className={'waiting'}>{connectMessage}</div>
  ) : null;
}
