import React, { useCallback, useState } from 'react';
import { Linking, Platform } from 'react-native';
import { usePathname } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import {
  BrandIcon,
  Button,
  Icon,
  Menu,
  MenuDropdown,
  MenuItem,
  useToast,
} from '@platform-blocks/react-ui-library';

interface CopyPageMenuProps {
  /** CSS selector that points at the main article container */
  targetSelector?: string;
  /** Display title used for clipboard metadata and prompts */
  pageTitle: string;
  /** Optional override for the copy button size */
  size?: 'xs' | 'sm' | 'md';
  /** Optional pre-rendered markdown payload */
  markdown?: string;
}

const CHAT_GPT_BASE_URL = 'https://chatgpt.com/';
const CLAUDE_BASE_URL = 'https://claude.ai/new';
const SITE_URL = 'https://react-ui-library.com';
const GITHUB_URL = 'https://github.com/platform-blocks/react-ui-library';
const NPM_URL = 'https://www.npmjs.com/package/@platform-blocks/react-ui-library';
const isWeb = Platform.OS === 'web';

/**
 * Context header prepended to copied Markdown so an LLM (or a human reading it
 * out of context) knows where the content came from and where to find more.
 */
const buildContextHeader = (pageTitle: string, pageUrl: string) => {
  const lines = [
    `> Documentation for **${pageTitle.trim()}** from React UI Library — a cross-platform`,
    '> component library for React Native (iOS, Android) and the web.',
    '>',
    `> - Website: [react-ui-library.com](${SITE_URL})`,
    `> - GitHub: [platform-blocks/react-ui-library](${GITHUB_URL})`,
    `> - NPM Package: [@platform-blocks/react-ui-library](${NPM_URL})`,
  ];

  if (pageUrl) {
    lines.push(`> - Source page: ${pageUrl}`);
  }

  return `${lines.join('\n')}\n\n---`;
};

export const CopyPageMenu: React.FC<CopyPageMenuProps> = ({
  targetSelector = 'body',
  pageTitle,
  size = 'sm',
  markdown,
}) => {
  const toast = useToast();
  const [copying, setCopying] = useState(false);
  // Router state, not `window.location`. expo-router syncs the browser URL in an
  // effect that runs *after* the render triggered by a client-side navigation,
  // so reading `window.location.href` while rendering the new page still returns
  // the previous page's URL — which pointed the LLM handoffs at the component
  // the user was looking at before this one.
  const pathname = usePathname();
  const pageUrl = pathname ? `${SITE_URL}${pathname}` : SITE_URL;

  const buildFallbackPayload = useCallback(() => {
    if (typeof document === 'undefined') {
      return '';
    }

    const node = document.querySelector(targetSelector) ?? document.body;
    if (!node) {
      return '';
    }

    const content = (node as HTMLElement).innerText?.trim() ?? '';
    if (!content) {
      return '';
    }

    const title = pageTitle?.trim();
    return [title ? `# ${title}` : '', content].filter(Boolean).join('\n\n');
  }, [pageTitle, targetSelector]);

  const buildCopyPayload = useCallback(() => {
    const body = markdown?.trim() || buildFallbackPayload();
    if (!body) {
      return '';
    }

    const header = buildContextHeader(pageTitle, pageUrl);

    // Keep an existing top-level heading first so the context block reads as a
    // subtitle rather than pushing the title out of view.
    const [firstLine, ...rest] = body.split('\n');
    if (/^#\s+\S/.test(firstLine)) {
      return [firstLine, header, rest.join('\n').trim()].filter(Boolean).join('\n\n');
    }

    return [header, body].join('\n\n');
  }, [markdown, buildFallbackPayload, pageTitle, pageUrl]);

  const handleCopy = useCallback(async () => {
    if (!isWeb) {
      toast.info?.('Copy page is only available on the web docs for now.');
      return;
    }

    const payload = buildCopyPayload();
    if (!payload) {
      toast.warning?.('Nothing to copy yet—try again after the page finishes loading.');
      return;
    }

    try {
      setCopying(true);
      await Clipboard.setStringAsync(payload);
      toast.success?.('Copied Markdown to your clipboard.');
    } catch (error) {
      console.error('[CopyPageMenu] Failed to copy page', error);
      toast.error?.('Unable to copy the page. Please try again.');
    } finally {
      setCopying(false);
    }
  }, [buildCopyPayload, toast]);

  const buildChatPrompt = useCallback(() => (
    `Help me understand the React UI Library documentation page "${pageTitle}".` +
    ` Source: ${pageUrl}.` +
    ' Provide a concise summary and share common usage ideas.'
  ), [pageTitle, pageUrl]);

  const openChat = useCallback((baseUrl: string, label: string) => {
    const url = `${baseUrl}?q=${encodeURIComponent(buildChatPrompt())}`;
    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }
    Linking.openURL(url).catch(() => {
      toast.error?.(`Unable to launch ${label} right now.`);
    });
  }, [buildChatPrompt, toast]);

  const handleOpenChatGPT = useCallback(
    () => openChat(CHAT_GPT_BASE_URL, 'ChatGPT'),
    [openChat],
  );

  const handleOpenClaude = useCallback(
    () => openChat(CLAUDE_BASE_URL, 'Claude'),
    [openChat],
  );

  return (
    <Menu>
      <Button
        size={size}
        variant="secondary"
        startIcon={<Icon name="copy" size="sm" />}
        endIcon={<Icon name="chevron-down" size="xs" />}
        loading={copying}
        radius="xl"
      >
        Copy
      </Button>
      <MenuDropdown>
        <MenuItem startSection={<Icon name="markdown" size="sm" />} onPress={handleCopy}>
          Copy Markdown
        </MenuItem>
        {/* Each handoff wears its own logo — `openai` carries
            `supportsDarkMode`, so its black mark inverts on a dark menu by
            itself, and Anthropic's clay reads on either. */}
        <MenuItem
          startSection={<BrandIcon brand="openai" size="sm" />}
          onPress={handleOpenChatGPT}
        >
          Open in ChatGPT
        </MenuItem>
        <MenuItem
          startSection={<BrandIcon brand="anthropic" size="sm" />}
          onPress={handleOpenClaude}
        >
          Open in Claude
        </MenuItem>
      </MenuDropdown>
    </Menu>
  );
};

export default CopyPageMenu;
