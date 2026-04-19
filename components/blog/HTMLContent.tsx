'use client';

import React from 'react';
import { Box, alpha } from '@mui/material';
import { tokens } from '@/lib/theme-tokens';
import ImageLightbox from '@/components/common/ImageLightbox';
import ScrollReveal from '@/components/common/ScrollReveal';
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

      return nextTag;
    });

    const withNormalizedLinks = withEnhancedImages.replace(
      /<a\b([^>]*?)href=["']([^"']+)["']([^>]*)>/gi,
      (_fullTag, beforeHref, hrefValue, afterHref) => {
        const normalizedHref = normalizeHref(hrefValue);
        return `<a${beforeHref}href="${normalizedHref}"${afterHref}>`;
      }
    );

    // Transform Quill code blocks to macOS Terminal Code Blocks dynamically.
    // The content is left as plain text inside <code data-highlight> and will be
    // syntax-highlighted (with auto language detection) on the client in a useEffect.
    const transformed = withNormalizedLinks.replace(
      /<pre[^>]*>([\s\S]*?)<\/pre>/gi,
      (_match, content) => {
        // Strip zero-width-space workaround chars that were injected upstream to
        // protect PHP/HTML processing-instruction-looking tokens during rendering.
        const rawEscaped = String(content).replace(/\u200B/g, '');

        // Trim a single leading/trailing newline (Quill often adds them)
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
                  class="terminal-copy"
                  onclick="navigator.clipboard.writeText(this.closest('.terminal-wrapper').querySelector('code').innerText); this.innerText='Copied!'; setTimeout(() => { this.innerText='Copy'; }, 2000)"
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
  // annotate code blocks (Quill's editor doesn't expose a language field).
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

      const result = hljs.highlightAuto(source);
      const language = result.language;
      const relevance = result.relevance;

      // Low-confidence auto detection is usually noise — fall back to plain.
      const highlightedHtml =
        language && relevance >= 5
          ? result.value
          : source
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;');

      block.innerHTML = highlightedHtmlToLines(highlightedHtml);
      block.dataset.highlighted = 'done';

      if (language && relevance >= 5) {
        const wrapper = block.closest('.terminal-wrapper');
        const label = wrapper?.querySelector<HTMLElement>('[data-lang-label]');
        if (label) label.textContent = language;
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
            mb: 4, 
            lineHeight: 1.9, 
            fontSize: '1.3rem',
            fontFamily: tokens.typography.fontFamily.serif,
            color: 'text.secondary',
            fontWeight: 400
          },
          '& h1, & h2, & h3, & h4': {
            color: 'text.primary',
            fontFamily: tokens.typography.fontFamily.serif,
            letterSpacing: '-0.01em',
            mb: 4,
            mt: 8,
            fontWeight: 600
          },
          '& h1': { fontSize: '2.5rem' },
          '& h2': { fontSize: '2.25rem' },
          '& h3': { fontSize: '1.75rem' },
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
            py: 1.5,
            my: 10,
            '& p': { 
              mb: 0, 
              fontStyle: 'italic', 
              fontSize: '1.5rem', 
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
            borderRadius: 0,
            my: 10,
            boxShadow: `0 20px 40px ${alpha('#000000', 0.15)}`,
            cursor: 'zoom-in',
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'scale(1.01)'
            }
          },
          '& ul, & ol': {
            pl: 5,
            mb: 4,
            '& li': {
              mb: 2,
              lineHeight: 1.8,
              fontSize: '1.3rem',
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
          },
          '& .terminal-body [data-line]::before': {
            counterIncrement: 'line',
            content: 'counter(line)',
            display: 'inline-block',
            width: '2.5rem',
            textAlign: 'right',
            mr: '1rem',
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
