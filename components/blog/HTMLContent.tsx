'use client';

import React from 'react';
import { Box, alpha } from '@mui/material';
import { tokens } from '@/lib/theme-tokens';
import ImageLightbox from '@/components/common/ImageLightbox';

interface HTMLContentProps {
  html: string;
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

export default function HTMLContent({ html }: HTMLContentProps) {
  const [lightboxOpen, setLightboxOpen] = React.useState(false);
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const { transformedHtml, imageSources } = React.useMemo(() => {
    const images: string[] = [];

    const withEnhancedImages = html.replace(/<img\b[^>]*>/gi, (imgTag) => {
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

    // Transform Quill code blocks to macOS Terminal Code Blocks dynamically
    const transformed = withNormalizedLinks.replace(
      /<pre[^>]*>([\s\S]*?)<\/pre>/gi,
      (match, content) => {
        // Decode HTML entities so we can safely process the string and lines
        const decodedContent = content;
        // Split content into lines for CSS-based line numbering
        const linesArray = decodedContent.split('\n');
        if (linesArray[0] === '') linesArray.shift(); // Remove leading newline
        if (linesArray[linesArray.length - 1] === '') linesArray.pop(); // Remove trailing newline

        const lines = linesArray
          .map((line: string) => `<span data-line>${line || ' '}</span>`)
          .join('\n');

        return `
          <div class="terminal-wrapper" style="margin: 48px 0;">
            <div class="terminal-header" style="display: flex; justify-content: space-between; align-items: center; padding: 4px 16px; background: rgba(255, 255, 255, 0.05); border-radius: 12px 12px 0 0; border: 1px solid rgba(136, 136, 136, 0.1); border-bottom: none;">
              <div class="terminal-dots" style="display: flex; gap: 8px;">
                <div style="width: 12px; height: 12px; border-radius: 50%; background: #ff5f56;"></div>
                <div style="width: 12px; height: 12px; border-radius: 50%; background: #ffbd2e;"></div>
                <div style="width: 12px; height: 12px; border-radius: 50%; background: #27c93f;"></div>
              </div>
              <button 
                onclick="navigator.clipboard.writeText(this.parentElement.nextElementSibling.innerText); this.innerText='Copied!'; setTimeout(() => { this.innerText='Copy'; }, 2000)"
                style="background: transparent; border: none; color: rgba(255, 255, 255, 0.6); font-family: sans-serif; font-size: 0.65rem; font-weight: 700; cursor: pointer; transition: all 0.2s; padding: 4px;"
              >
                Copy
              </button>
            </div>
            <div class="glass terminal-body" style="border: 1px solid rgba(136, 136, 136, 0.1); border-radius: 0 0 12px 12px; border-top: none; overflow: hidden; background: transparent;">
              <pre style="margin: 0; padding: 16px 0; overflow-x: auto; background: transparent;"><code style="display: grid; min-width: 100%; counter-reset: line;">${lines}</code></pre>
            </div>
          </div>
        `;
      }
    );

    return {
      transformedHtml: transformed,
      imageSources: images,
    };
  }, [html]);

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

  return (
    <>
      <Box
        onClick={handleContentClick}
        sx={{
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
              lineHeight: 1.6
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
          // Support for the dynamically injected spans
          '& .terminal-body code': {
            fontFamily: tokens.typography.fontFamily.mono,
            fontSize: '0.85rem'
          },
          '& .terminal-body [data-line]::before': {
            counterIncrement: 'line',
            content: 'counter(line)',
            display: 'inline-block',
            width: '2.5rem',
            textAlign: 'right',
            mr: '1rem',
            color: '#555',
            fontSize: '0.75rem',
            userSelect: 'none',
            borderRight: `1px solid ${alpha('#fff', 0.05)}`
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
