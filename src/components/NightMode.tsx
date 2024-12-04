
import './NightMode.scss';

import { useContexts } from '../providers/AppProvider';


export function NightMode() {

  const { isNightModeRef, setIsNightMode } = useContexts();

  const toggleNightMode = () => {
    const currentValue = !isNightModeRef.current;
    setIsNightMode(currentValue);
  };

  return (
    <span onClick={toggleNightMode} style={{ cursor: 'pointer' }}>
      {isNightModeRef.current ? '🌙' : '☀️'}
    </span>
  )
}