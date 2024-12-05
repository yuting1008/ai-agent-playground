import React, { ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    console.error('error', error);
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('error', error, errorInfo);
  }

  render() {

    if (this.state.hasError) {
      return <h1>
        Something went wrong.
        {this.state.hasError.toString()}
      </h1>;
    }

    return this.props.children;
  }
}


export default ErrorBoundary;

