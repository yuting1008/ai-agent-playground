import { useState } from 'react';
import { Profiles } from '../lib/Profiles';

const TodoComponent = () => {
  const profiles = new Profiles();
  const profile = profiles.currentProfile;

  const [endpoint, setEndpoint] = useState(profile?.realtimeEndpoint || '');
  const [key, setKey] = useState(profile?.realtimeKey || '');
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

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
