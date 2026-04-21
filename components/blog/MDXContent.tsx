'use client';

import * as React from 'react';
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';
import { Typography, Box, Link as MuiLink, useTheme, alpha, Button, useMediaQuery } from '@mui/material';
import Link from 'next/link';
import { tokens } from '@/lib/theme-tokens';
import ImageLightbox from '@/components/common/ImageLightbox';

interface MDXContentProps {
  source: MDXRemoteSerializeResult;
}

interface MDXComponentsOptions {
  onImageOpen: (src?: string) => void;
}

const normalizeHref = (href?: string): string => {
  if (!href) return '#';

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

const CodeBlock = ({ children, ...props }: React.HTMLAttributes<HTMLPreElement>) => {
  const [copied, setCopied] = React.useState(false);
  const isMobile = useMediaQuery('(max-width:600px)');
  const [isWrapped, setIsWrapped] = React.useState(isMobile);
  const preRef = React.useRef<HTMLPreElement>(null);

  // Sync wrap state with mobile on initial load, but allow manual override
  React.useEffect(() => {
    setIsWrapped(isMobile);
  }, [isMobile]);

  const handleCopy = () => {
    if (preRef.current) {
      const code = preRef.current.innerText;
      navigator.clipboard.writeText(code).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const handleToggleWrap = () => {
    setIsWrapped(!isWrapped);
  };

  return (
    <Box
      component="div"
      sx={{
        my: 6,
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
        '& pre': {
          m: 0,
          bgcolor: 'transparent !important',
          color: '#e6edf3',
        },
      }}
    >
      <Box
        className="terminal-header"
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 2,
          py: 0.75,
          bgcolor: '#1a1e24',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ff5f56' }} />
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ffbd2e' }} />
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#27c93f' }} />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            onClick={handleToggleWrap}
            size="small"
            sx={{
              color: isWrapped ? 'primary.light' : 'rgba(255,255,255,0.5)',
              fontSize: '0.65rem',
              fontWeight: 700,
              textTransform: 'none',
              minWidth: 0,
              p: '2px 8px',
              borderRadius: '4px',
              bgcolor: isWrapped ? alpha('#fff', 0.05) : 'transparent',
              transition: 'all 0.2s',
              border: '1px solid',
              borderColor: isWrapped ? alpha(tokens.color.primary, 0.3) : 'transparent',
              '&:hover': { 
                color: '#fff', 
                bgcolor: alpha('#fff', 0.1),
                borderColor: alpha('#fff', 0.2)
              },
            }}
          >
            Wrap: {isWrapped ? 'On' : 'Off'}
          </Button>

          <Button
            onClick={handleCopy}
            size="small"
            sx={{
              color: copied ? 'primary.light' : 'rgba(255,255,255,0.7)',
              fontSize: '0.65rem',
              fontWeight: 700,
              textTransform: 'none',
              minWidth: 0,
              p: 0,
              transition: 'color 0.2s',
              '&:hover': { color: '#fff', bgcolor: 'transparent' },
            }}
          >
            {copied ? 'Copied!' : 'Copy'}
          </Button>
        </Box>
      </Box>
      <Box
        component="div"
        sx={{
          bgcolor: '#0d1117',
          overflow: 'hidden',
        }}
      >
        <pre 
          ref={preRef} 
          {...props}
          style={{
            margin: 0,
            padding: '16px',
            whiteSpace: isWrapped ? 'pre-wrap' : 'pre',
            wordBreak: isWrapped ? 'break-word' : 'normal',
            overflowX: isWrapped ? 'hidden' : 'auto',
          }}
        >
          {children}
        </pre>
      </Box>
    </Box>
  );
};

const MDXComponents = ({ onImageOpen }: MDXComponentsOptions) => ({
  // Demote all article headings by one level so they don't compete with the
  // PostHeader <h1>. Author writes `#` → renders as <h2>, `##` → <h3>, etc.
  // This keeps h1 → h2 → h3 sequential for Lighthouse + screen readers.
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <Typography
      variant="h3"
      component="h2"
      sx={{
        mt: 6, mb: 3,
        fontWeight: 700,
        fontFamily: tokens.typography.fontFamily.serif,
        letterSpacing: '-0.02em',
        lineHeight: 1.25,
        color: 'text.primary'
      }}
      {...props}
    />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <Typography
      variant="h4"
      component="h3"
      sx={{
        mt: 5, mb: 2,
        fontWeight: 700,
        fontFamily: tokens.typography.fontFamily.serif,
        letterSpacing: '-0.01em',
        lineHeight: 1.3,
        color: 'text.primary'
      }}
      {...props}
    />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <Typography
      variant="h5"
      component="h4"
      sx={{
        mt: 4, mb: 2,
        fontWeight: 700,
        fontFamily: tokens.typography.fontFamily.serif,
        lineHeight: 1.4,
        color: 'text.primary'
      }}
      {...props}
    />
  ),
  h4: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <Typography
      variant="h6"
      component="h5"
      sx={{
        mt: 3, mb: 1.5,
        fontWeight: 700,
        fontFamily: tokens.typography.fontFamily.serif,
        lineHeight: 1.4,
        color: 'text.primary'
      }}
      {...props}
    />
  ),
  h5: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <Typography
      variant="h6"
      component="h6"
      sx={{
        mt: 3, mb: 1.5,
        fontWeight: 600,
        fontFamily: tokens.typography.fontFamily.serif,
        lineHeight: 1.4,
        color: 'text.primary'
      }}
      {...props}
    />
  ),
  h6: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <Typography
      variant="body1"
      component="h6"
      sx={{
        mt: 3, mb: 1.5,
        fontWeight: 700,
        fontFamily: tokens.typography.fontFamily.serif,
        lineHeight: 1.4,
        color: 'text.primary'
      }}
      {...props}
    />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <Typography
      variant="body1"
      sx={{
        mb: 3,
        lineHeight: 1.75,
        fontSize: '1.125rem',
        fontFamily: tokens.typography.fontFamily.serif,
        color: 'text.secondary',
        fontWeight: 400,
        wordBreak: 'break-word',
        overflowWrap: 'break-word'
      }}
      {...props}
    />
  ),
  a: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
    const normalizedHref = normalizeHref(href);
    const isExternal = normalizedHref.startsWith('http://') || normalizedHref.startsWith('https://') || normalizedHref.startsWith('//');

    if (isExternal) {
      return (
        <MuiLink
          href={normalizedHref}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
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
          }}
          {...props}
        >
          {children}
        </MuiLink>
      );
    }

    return (
      <MuiLink 
        component={Link} 
        href={normalizedHref}
        sx={{ 
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
        }} 
        {...props}
      >
        {children}
      </MuiLink>
    );
  },
  blockquote: (props: React.BlockquoteHTMLAttributes<HTMLQuoteElement>) => (
    <Box
      component="blockquote"
      sx={{
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
      }}
      {...props}
    />
  ),
  pre: (props: any) => <CodeBlock {...props} />,
  img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    const { src, onClick, ...imgProps } = props;
    const normalizedSrc = typeof src === 'string' ? src : undefined;

    return (
      <Box sx={{ my: 6, textAlign: 'center' }}>
        <Box 
          component="img" 
          sx={{ 
            maxWidth: '100%', 
            borderRadius: tokens.radius.sm,
            boxShadow: `0 20px 40px ${alpha('#000000', 0.1)}`,
            cursor: normalizedSrc ? 'zoom-in' : 'default',
          }} 
          src={normalizedSrc}
          loading="lazy"
          decoding="async"
          onClick={(event: React.MouseEvent<HTMLImageElement>) => {
            onClick?.(event);
            onImageOpen(normalizedSrc);
          }}
          {...imgProps}
        />
      </Box>
    );
  },
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <Box component="ul" sx={{ mb: 3, pl: 4, '& li': { mb: 1.5, color: 'text.secondary', fontSize: '1.125rem', fontFamily: tokens.typography.fontFamily.serif, lineHeight: 1.7 } }} {...props} />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <Box component="ol" sx={{ mb: 3, pl: 4, '& li': { mb: 1.5, color: 'text.secondary', fontSize: '1.125rem', fontFamily: tokens.typography.fontFamily.serif, lineHeight: 1.7 } }} {...props} />
  ),
});

export default function MDXContent({ source }: MDXContentProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [imageSources, setImageSources] = React.useState<string[]>([]);
  const [lightboxOpen, setLightboxOpen] = React.useState(false);
  const [currentIndex, setCurrentIndex] = React.useState(0);

  React.useEffect(() => {
    const container = contentRef.current;
    if (!container) return;

    const images = Array.from(container.querySelectorAll('img[src]'))
      .map((image) => image.getAttribute('src'))
      .filter((src): src is string => Boolean(src));

    setImageSources(images);
  }, [source]);

  const handleImageOpen = React.useCallback((src?: string) => {
    if (!src) return;

    setImageSources((prev) => {
      const existingIndex = prev.indexOf(src);
      if (existingIndex >= 0) {
        setCurrentIndex(existingIndex);
        return prev;
      }

      const next = [...prev, src];
      setCurrentIndex(next.length - 1);
      return next;
    });

    setLightboxOpen(true);
  }, []);

  const components = React.useMemo(() => MDXComponents({ onImageOpen: handleImageOpen }), [handleImageOpen]);

  return (
    <>
      <Box
        ref={contentRef}
        sx={{ 
          '& .rehype-code-title': {
            background: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05),
            color: 'text.secondary',
            px: 3,
            py: 1.5,
            borderBottom: `1px solid ${alpha(tokens.color.primary, 0.1)}`,
            fontSize: '0.75rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontFamily: 'monospace'
          },
          wordBreak: 'break-word',
          overflowWrap: 'break-word',
          hyphens: 'auto'
        }}
      >
        <MDXRemote {...source} components={components} />
      </Box>

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
