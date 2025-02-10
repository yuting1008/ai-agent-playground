import React from 'react';

const IconWithBadge: React.FC<{
  icon: React.ReactNode;
  badge?: React.ReactNode;
}> = ({ icon, badge }) => {
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-block',
  };

  const badgeStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    right: 0,
    transform: 'translate(50%, -50%)',
    backgroundColor: 'red',
    color: 'white',
    borderRadius: '50%',
    width: '12px',
    height: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '8px',
    fontWeight: 'bold',
  };

  return (
    <div style={containerStyle}>
      {icon}
      {badge && <span style={badgeStyle}>{badge}</span>}
    </div>
  );
};

export default IconWithBadge;
