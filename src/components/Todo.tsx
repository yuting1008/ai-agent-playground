import { useEffect, useState } from 'react';

const TodoComponent = () => {
  const [endpoint, setEndpoint] = useState(
    localStorage.getItem('endpoint') || '',
  );
  const [key, setKey] = useState(localStorage.getItem('key') || '');
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  useEffect(() => {
    localStorage.setItem('endpoint', endpoint.trim());
    localStorage.setItem('key', key.trim());
  }, [endpoint, key]);

  const handleEndpointChange = (e: any) => {
    setEndpoint(e.target.value);
  };

  const handleKeyChange = (e: any) => {
    setKey(e.target.value);
  };

  return (
    <div className="planned container_bg">
      <div className="settings-label">Planned Features</div>
      <li>[ing] Talk to your data</li>
      <li>[ing] Perform tasks on your device</li>
      <li>[ing] Identify goods and information</li>
    </div>
  );
};

export default TodoComponent;
