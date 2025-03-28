// FadeTransition.tsx
import React, { ReactNode } from 'react';
import { CSSTransition } from 'react-transition-group';
import './WithFade.css';

interface FadeTransitionProps {
  in: boolean;
  timeout?: number;
  children: ReactNode;
  unmountOnExit?: boolean;
  className?: string;
}

const WithFade: React.FC<FadeTransitionProps> = ({
  in: inProp,
  timeout = 3000,
  children,
  unmountOnExit = true,
}) => {
  return (
    <CSSTransition
      in={inProp}
      timeout={timeout}
      classNames="fade"
      unmountOnExit={unmountOnExit}
    >
      {children}
    </CSSTransition>
  );
};

export default WithFade;
