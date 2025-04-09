import { Eye } from 'react-feather';

export default function ClickToJson({ msg }: { msg: any }) {
  return (
    <Eye
      onClick={() => {
        alert(JSON.stringify(msg, null, 2));
      }}
      size={14}
      style={{
        cursor: 'pointer',
        marginTop: '5px',
      }}
    />
  );
}
