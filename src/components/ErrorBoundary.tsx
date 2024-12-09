import React, { ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error) {
    console.error('error', error);
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('error', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.container}>
          <div>Something Went Wrong</div>
          <div>{this.state.errorMessage}</div>
          <div style={styles.reload} onClick={() => window.location.reload()}>
            Reload
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const styles: { [key: string]: React.CSSProperties } = {
  reload: {
    cursor: 'pointer',
    fontSize: '20px',
    color: 'white',
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: '10px 20px',
    borderRadius: '5px',
  },
  container: {
    zIndex: 999999,
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    height: '100vh',
    fontSize: '30px',
    backgroundColor: 'rgba(0,0,0,0.5)',
    color: 'white',
    gap: '20px',
  },
};

export default ErrorBoundary;
