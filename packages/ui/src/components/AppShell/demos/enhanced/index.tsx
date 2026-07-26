import { AppShell, Block, Text } from '@platform-blocks/ui';

const sampleTOC = (
  <Block>
    <Text variant="h6" mb="sm">Contents</Text>
    <Text size="sm" style={{ paddingLeft: 0 }}>Introduction</Text>
    <Text size="sm" style={{ paddingLeft: 12 }}>Getting Started</Text>
    <Text size="sm" style={{ paddingLeft: 12 }}>Installation</Text>
    <Text size="sm" style={{ paddingLeft: 24 }}>NPM Package</Text>
    <Text size="sm" style={{ paddingLeft: 24 }}>Yarn Setup</Text>
    <Text size="sm" style={{ paddingLeft: 12 }}>Configuration</Text>
    <Text size="sm" style={{ paddingLeft: 0 }}>Components</Text>
    <Text size="sm" style={{ paddingLeft: 12 }}>AppShell</Text>
    <Text size="sm" style={{ paddingLeft: 12 }}>Layout System</Text>
    <Text size="sm" style={{ paddingLeft: 0 }}>Examples</Text>
  </Block>
);

export default function AppShellDemo() {
  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ 
        width: 280, 
        breakpoint: 'md',
        collapsed: { mobile: true }
      }}
      autoLayout
      headerContent={() => (
        <Text variant="h4" style={{ padding: 16 }}>
          Documentation
        </Text>
      )}
      navbarContent={() => (
        <Block p="md">
          <Text variant="h6">Navigation</Text>
          <Text size="sm">Getting Started</Text>
          <Text size="sm">Components</Text>
          <Text size="sm">Examples</Text>
          <Text size="sm">API Reference</Text>
        </Block>
      )}
      maxContentWidth={960}
      tableOfContents={sampleTOC}
      tableOfContentsWidth={280}
      hideTableOfContentsOnMobile
      centerContent
    >
      <Block p="lg">
        <Text variant="h1">Main Content with TOC</Text>
        <Text>
          This demonstrates the enhanced AppShell with max width constraints 
          and a table of contents sidebar. The main content area has a maximum 
          width and is centered, while the table of contents appears on the right 
          on desktop screens.
        </Text>
        <Text>
          The layout is fully responsive - on mobile devices, the table of contents 
          is hidden by default to preserve screen space.
        </Text>
        <Text variant="h2">Features</Text>
        <Text>
          • Max width constraint for better readability on wide screens
        </Text>
        <Text>
          • Table of contents sidebar with responsive behavior
        </Text>
        <Text>
          • Configurable through AppShell or AppShellMain props
        </Text>
        <Text>
          • Seamless integration with existing AppShell layout system
        </Text>
      </Block>
    </AppShell>
  );
}