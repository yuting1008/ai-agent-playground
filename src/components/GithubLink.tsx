import React from 'react';
import { GitHub } from 'react-feather';

const GithubLink: React.FC = () => {
  const openUrl = () => {
    window.open('https://github.com/theodoreniu/ai-agent-playground', '_blank');
  };

  return (
    <span onClick={() => openUrl()}>
      <GitHub />
    </span>
  );
};

export default GithubLink;
