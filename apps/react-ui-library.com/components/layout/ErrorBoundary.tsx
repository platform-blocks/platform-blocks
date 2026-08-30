import React from 'react';
import { Text, Flex, Button, Icon } from '@platform-blocks/react-ui-library';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; retry: () => void }>;
}

export class LayoutErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Layout Error:', error, errorInfo);
    // You could also log to an error reporting service here
  }

  retry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error} retry={this.retry} />;
    }

    return this.props.children;
  }
}

const DefaultErrorFallback: React.FC<{ error?: Error; retry: () => void }> = ({
  error,
  retry,
}) => (
  <Flex
    direction="column"
    align="center"
    justify="center"
    gap="lg"
    style={{ flex: 1, padding: 20 }}
  >
    <Icon name="alert-triangle" size={48} color="red" />
    <Text size="lg" weight="bold">
      Something went wrong
    </Text>
    <Text size="sm" color="muted" style={{ textAlign: 'center' }}>
      {error?.message || 'An unexpected error occurred in the layout'}
    </Text>
    <Button variant="outline" title="Try Again" onPress={retry} />
  </Flex>
);
