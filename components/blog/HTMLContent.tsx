'use client';

import React from 'react';
import { Box, alpha } from '@mui/material';
import { tokens } from '@/lib/theme-tokens';
import ImageLightbox from '@/components/common/ImageLightbox';
// `highlight.js/lib/common` bundles ~35 common languages (php, js/ts, py, go,
// rust, bash, sql, html/css, json, yaml, etc.) instead of all 190+ languages.
import hljs from 'highlight.js/lib/common';
import 'highlight.js/styles/github-dark.css';

interface HTMLContentProps {
  content: string;
}

const normalizeHref = (href: string): string => {
  if (
    href.startsWith('http://') ||
    href.startsWith('https://') ||
    href.startsWith('//') ||
    href.startsWith('mailto:') ||
    href.startsWith('tel:') ||
    href.startsWith('#')
  ) {
    return href;
  }

  if (href.startsWith('/')) {
    return href;
  }

  if (href.startsWith('?')) {
    return `/blog${href}`;
  }

  const cleanHref = href.replace(/^\.\//, '').replace(/^\/+/, '');
  if (!cleanHref) {
    return '/blog';
  }

  return `/blog/${cleanHref}`;
};

// Walk the hljs-highlighted DOM tree and split it into one HTML string per line,
// re-opening any open <span class="hljs-*"> wrappers that straddle a newline so
// each line is a self-contained fragment (required for the CSS counter-based
// line-number rendering below).
function highlightedHtmlToLines(highlightedHtml: string): string {
  if (typeof document === 'undefined') return highlightedHtml;

  const container = document.createElement('div');
  container.innerHTML = highlightedHtml;

  const escape = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const lines: string[] = [''];
  const openStack: string[] = [];

  const walk = (node: Node) => {
    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType === Node.TEXT_NODE) {
        const parts = (child.textContent || '').split('\n');
        parts.forEach((part, i) => {
          if (i > 0) {
            // close all open tags on the current line, start a new line, reopen them
            lines[lines.length - 1] += '</span>'.repeat(openStack.length);
            lines.push(openStack.join(''));
          }
          lines[lines.length - 1] += escape(part);
        });
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const el = child as Element;
        const cls = el.getAttribute('class') || '';
        const openTag = `<span class="${cls}">`;
        lines[lines.length - 1] += openTag;
        openStack.push(openTag);
        walk(el);
        openStack.pop();
        lines[lines.length - 1] += '</span>';
      }
    }
  };

  walk(container);

  return lines
    .map((line) => `<span data-line>${line.length ? line : ' '}</span>`)
    .join('\n');
}

export default function HTMLContent({ content }: HTMLContentProps) {
  const [lightboxOpen, setLightboxOpen] = React.useState(false);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const contentRef = React.useRef<HTMLDivElement | null>(null);

  const { transformedHtml, imageSources } = React.useMemo(() => {
    const images: string[] = [];

    const withEnhancedImages = content.replace(/<img\b[^>]*>/gi, (imgTag) => {
      const srcMatch = imgTag.match(/\bsrc\s*=\s*["']([^"']+)["']/i);
      if (!srcMatch?.[1]) {
        return imgTag;
      }

      const src = srcMatch[1];
      const imageIndex = images.length;
      images.push(src);

      let nextTag = imgTag;
      if (!/\bloading\s*=/.test(nextTag)) {
        nextTag = nextTag.replace('<img', '<img loading="lazy"');
      }
      if (!/\bdecoding\s*=/.test(nextTag)) {
        nextTag = nextTag.replace('<img', '<img decoding="async"');
      }
      if (!/\bdata-lightbox-index\s*=/.test(nextTag)) {
        nextTag = nextTag.replace('<img', `<img data-lightbox-index="${imageIndex}"`);
      }
      // Tiptap/Quill output rarely includes dimensions — give the browser an aspect-ratio
      // hint so it can reserve space before the image loads (prevents CLS).
      // Combined with the `max-width: 100%; height: auto` wrapper styles, the
      // rendered size remains responsive to the real aspect ratio once loaded.
      const hasWidthAttr = /\bwidth\s*=/.test(nextTag);
      const hasHeightAttr = /\bheight\s*=/.test(nextTag);
      const hasInlineWidth = /\bstyle\s*=\s*["'][^"']*\bwidth\s*:/i.test(nextTag);
      if (!hasWidthAttr && !hasHeightAttr && !hasInlineWidth) {
        nextTag = nextTag.replace('<img', '<img width="1600" height="900"');
      }

      return nextTag;
    });

    const withNormalizedLinks = withEnhancedImages.replace(
      /<a\b([^>]*?)href=["']([^"']+)["']([^>]*)>/gi,
      (_fullTag, beforeHref, hrefValue, afterHref) => {
        const normalizedHref = normalizeHref(hrefValue);
        return `<a${beforeHref}href="${normalizedHref}"${afterHref}>`;
      }
    );

    // Transform editor code blocks to macOS Terminal Code Blocks dynamically.
    // The content is left as plain text inside <code data-highlight> and will be
    // syntax-highlighted (with auto language detection) on the client in a useEffect.
    const transformed = withNormalizedLinks.replace(
      /<pre[^>]*>([\s\S]*?)<\/pre>/gi,
      (_match, content) => {
        // Strip zero-width-space workaround chars that were injected upstream to
        // protect PHP/HTML processing-instruction-looking tokens during rendering.
        const rawEscaped = String(content).replace(/\u200B/g, '');

        // Trim a single leading/trailing newline (editors often add them)
        const trimmed = rawEscaped.replace(/^\n/, '').replace(/\n$/, '');

        return `
          <div class="terminal-wrapper">
            <div class="terminal-header">
              <div class="terminal-dots">
                <div class="terminal-dot" data-dot="red"></div>
                <div class="terminal-dot" data-dot="yellow"></div>
                <div class="terminal-dot" data-dot="green"></div>
              </div>
              <div class="terminal-meta">
                <span data-lang-label class="terminal-lang"></span>
                <button
                  class="terminal-wrap-toggle"
                  data-state="off"
                  onclick="const wrapper = this.closest('.terminal-wrapper'); const isWrapped = wrapper.classList.toggle('is-wrapped'); this.innerText = isWrapped ? 'Wrap: On' : 'Wrap: Off'; this.setAttribute('data-state', isWrapped ? 'on' : 'off');"
                >
                  Wrap: Off
                </button>
                <button
                  class="terminal-copy"
                  onclick="navigator.clipboard.writeText(this.closest('.terminal-wrapper').querySelector('code').innerText); const originalText = this.innerText; this.innerText='Copied!'; setTimeout(() => { this.innerText=originalText; }, 2000)"
                >
                  Copy
                </button>
              </div>
            </div>
            <div class="terminal-body">
              <pre><code data-highlight class="hljs">${trimmed}</code></pre>
            </div>
          </div>
        `;
      }
    );

    return {
      transformedHtml: transformed,
      imageSources: images,
    };
  }, [content]);

  const handleContentClick = React.useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;

    if (target instanceof HTMLImageElement) {
      const indexValue = target.getAttribute('data-lightbox-index');
      if (indexValue === null) {
        return;
      }

      const index = Number.parseInt(indexValue, 10);
      if (Number.isNaN(index)) {
        return;
      }

      event.preventDefault();
      setCurrentIndex(index);
      setLightboxOpen(true);
    }
  }, []);

  // Syntax highlight every code block inside the article after render.
  // We use highlight.js's auto language detection so the author doesn't have to
  // annotate code blocks (older editor outputs may not have a language field).
  React.useEffect(() => {
    const root = contentRef.current;
    if (!root) return;

    const blocks = root.querySelectorAll<HTMLElement>('code[data-highlight]');
    blocks.forEach((block) => {
      if (block.dataset.highlighted === 'done') return;

      // Use textContent so any HTML entities inside the pre (e.g. &lt;?php)
      // are decoded back to real characters for the highlighter.
      const source = (block.textContent || '').replace(/\u200B/g, '');
      if (!source.trim()) {
        block.dataset.highlighted = 'done';
        return;
      }

      // highlight.js's bare `highlightAuto(source)` builds a giant Unicode
      // character-class regex from every registered language, which V8 rejects
      // with `SyntaxError: Range out of order in character class` on certain
      // builds (the bug surfaces when language regexes are merged in a specific
      // order — see highlight.js issue #4205). Passing an explicit candidate
      // subset avoids the merged-regex codepath and keeps highlighting working.
      // Languages here mirror what authors actually paste into posts.
      const AUTO_DETECT_LANGS = [
        'bash', 'shell', 'json', 'yaml', 'xml', 'html',
        'css', 'scss', 'javascript', 'typescript', 'python',
        'go', 'rust', 'java', 'c', 'cpp', 'csharp', 'php',
        'ruby', 'sql', 'dockerfile', 'ini',
      ];

      const escape = (text: string) =>
        text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

      let highlightedHtml: string;
      let language: string | undefined;
      let relevance = 0;

      try {
        const result = hljs.highlightAuto(source, AUTO_DETECT_LANGS);
        language = result.language;
        relevance = result.relevance;

        // Low-confidence auto detection is usually noise — fall back to plain.
        highlightedHtml = language && relevance >= 5 ? result.value : escape(source);
      } catch {
        highlightedHtml = escape(source);
      }

      block.innerHTML = highlightedHtmlToLines(highlightedHtml);
      block.dataset.highlighted = 'done';

      if (language && relevance >= 5) {
        const wrapper = block.closest('.terminal-wrapper');
        const label = wrapper?.querySelector<HTMLElement>('[data-lang-label]');
        if (label) label.textContent = language;
      }

      // Auto-wrap on mobile by default
      const isMobile = window.matchMedia('(max-width: 600px)').matches;
      if (isMobile) {
        const wrapper = block.closest('.terminal-wrapper');
        if (wrapper && !wrapper.classList.contains('is-wrapped')) {
          wrapper.classList.add('is-wrapped');
          const toggle = wrapper.querySelector('.terminal-wrap-toggle');
          if (toggle) {
            (toggle as HTMLElement).innerText = 'Wrap: On';
            toggle.setAttribute('data-state', 'on');
          }
        }
      }
    });
  }, [content]);

  return (
    <>
      <Box
        ref={contentRef}
        onClick={handleContentClick}
        sx={{
          wordBreak: 'break-word',
          overflowWrap: 'break-word',
          hyphens: 'auto',
          '& p': {
            mb: 3, 
            lineHeight: 1.75, 
            fontSize: '1.125rem',
            fontFamily: tokens.typography.fontFamily.serif,
            color: 'text.secondary',
            fontWeight: 400
          },
          '& h1, & h2, & h3, & h4': {
            color: 'text.primary',
            fontFamily: tokens.typography.fontFamily.serif,
            letterSpacing: '-0.01em',
            mb: 2,
            mt: 6,
            fontWeight: 700
          },
          '& h1': { fontSize: '2.25rem' },
          '& h2': { fontSize: '1.85rem' },
          '& h3': { fontSize: '1.5rem' },
          '& a': {
            color: 'primary.main', 
            fontWeight: 700,
            textDecoration: 'none',
            borderBottom: '2px solid',
            borderColor: alpha(tokens.color.primary, 0.2),
            transition: 'all 0.2s',
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: alpha(tokens.color.primary, 0.05)
            }
          },
          '& blockquote': {
            borderLeft: '4px solid',
            borderColor: 'primary.main',
            pl: 5,
            py: 1,
            my: 6,
            '& p': { 
              mb: 0, 
              fontStyle: 'italic', 
              fontSize: '1.25rem', 
              fontFamily: tokens.typography.fontFamily.serif,
              color: 'text.primary', 
              opacity: 0.8,
              lineHeight: 1.6,
              wordBreak: 'break-word',
              overflowWrap: 'break-word'
            },
          },
          '& img': {
            maxWidth: '100%',
            height: 'auto',
            borderRadius: 0,
            my: 6,
            boxShadow: `0 15px 35px ${alpha('#000000', 0.1)}`,
            cursor: 'zoom-in',
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'scale(1.01)'
            }
          },
          '& ul, & ol': {
            pl: 5,
            mb: 3,
            '& li': {
              mb: 1.5,
              lineHeight: 1.7,
              fontSize: '1.125rem',
              fontFamily: tokens.typography.fontFamily.serif,
              color: 'text.secondary'
            }
          },
          // Terminal MacOS-style code block — always dark, readable in both color schemes.
          '& .terminal-wrapper': {
            my: 6,
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
            border: '1px solid rgba(255,255,255,0.08)',
          },
          '& .terminal-header': {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: 2,
            py: 0.75,
            background: '#1a1e24',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          },
          '& .terminal-dots': { display: 'flex', gap: '8px' },
          '& .terminal-dot': { width: 12, height: 12, borderRadius: '50%' },
          '& .terminal-dot[data-dot="red"]': { background: '#ff5f56' },
          '& .terminal-dot[data-dot="yellow"]': { background: '#ffbd2e' },
          '& .terminal-dot[data-dot="green"]': { background: '#27c93f' },
          '& .terminal-meta': { display: 'flex', alignItems: 'center', gap: '12px' },
          '& .terminal-lang': {
            color: 'rgba(255,255,255,0.5)',
            fontFamily: 'sans-serif',
            fontSize: '0.65rem',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          },
          '& .terminal-wrap-toggle': {
            background: 'transparent',
            border: '1px solid transparent',
            color: 'rgba(255,255,255,0.5)',
            fontFamily: 'sans-serif',
            fontSize: '0.65rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s',
            p: '2px 8px',
            borderRadius: '4px',
            '&[data-state="on"]': {
              color: 'primary.light',
              bgcolor: alpha('#fff', 0.05),
              borderColor: alpha(tokens.color.primary, 0.3),
            },
            '&:hover': { 
              color: '#fff',
              bgcolor: alpha('#fff', 0.1),
              borderColor: alpha('#fff', 0.2)
            },
          },
          '& .terminal-copy': {
            background: 'transparent',
            border: 'none',
            color: 'rgba(255,255,255,0.7)',
            fontFamily: 'sans-serif',
            fontSize: '0.65rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'color 0.2s',
            p: '4px',
            '&:hover': { color: '#fff' },
          },
          '& .terminal-body': {
            background: '#0d1117',
            overflow: 'hidden',
          },
          '& .terminal-body pre': {
            margin: 0,
            padding: '16px 0',
            overflowX: 'auto',
            background: 'transparent',
          },
          '& .terminal-body code': {
            display: 'grid',
            minWidth: '100%',
            counterReset: 'line',
            background: 'transparent',
            fontFamily: tokens.typography.fontFamily.mono,
            fontSize: '0.85rem',
            color: '#e6edf3',
            whiteSpace: 'pre',
            wordBreak: 'normal',
          },
          '& .is-wrapped .terminal-body code': {
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          },
          '& .is-wrapped .terminal-body pre': {
            overflowX: 'hidden',
          },
          '& .terminal-body [data-line]': {
            display: 'block',
            position: 'relative',
            paddingLeft: '4.5rem',
            minHeight: '1.25rem',
          },
          '& .terminal-body [data-line]::before': {
            counterIncrement: 'line',
            content: 'counter(line)',
            position: 'absolute',
            left: 0,
            top: 0,
            width: '3.5rem',
            textAlign: 'right',
            paddingRight: '1rem',
            color: 'rgba(255,255,255,0.25)',
            fontSize: '0.75rem',
            userSelect: 'none',
            borderRight: `1px solid ${alpha('#fff', 0.08)}`,
          }
        }}
        dangerouslySetInnerHTML={{ __html: transformedHtml }}
      />

      <ImageLightbox
        images={imageSources}
        currentIndex={currentIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNavigate={(index) => setCurrentIndex(index)}
      />
    </>
  );
}
