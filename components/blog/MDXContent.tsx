'use client';

import * as React from 'react';
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';
import { Typography, Box, Link as MuiLink, useTheme, alpha, Button } from '@mui/material';
import Link from 'next/link';
import { tokens } from '@/lib/theme-tokens';
import ImageLightbox from '@/components/common/ImageLightbox';
import ScrollReveal from '@/components/common/ScrollReveal';

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
  const preRef = React.useRef<HTMLPreElement>(null);

  const handleCopy = () => {
    if (preRef.current) {
      // Get only the text content
      const code = preRef.current.innerText;
      navigator.clipboard.writeText(code).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  return (
    <Box
      component="div"
      sx={{
        my: 6,
        '& pre': { 
          m: 0, 
          bgcolor: 'transparent !important',
        }
      }}
    >
      <Box 
        className="terminal-header" 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 2,
          py: 0.5,
          bgcolor: alpha('#fff', 0.05),
          borderRadius: '12px 12px 0 0',
          border: `1px solid ${alpha(tokens.color.primary, 0.1)}`,
          borderBottom: 'none'
        }}
      >
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ff5f56' }} />
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ffbd2e' }} />
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#27c93f' }} />
        </Box>
        
        <Button 
          onClick={handleCopy}
          size="small"
          sx={{ 
            color: copied ? 'primary.main' : 'text.secondary', 
            fontSize: '0.65rem', 
            fontWeight: 700,
            textTransform: 'none',
            minWidth: 0,
            p: 0,
            opacity: 0.8,
            transition: 'all 0.2s',
            '&:hover': { opacity: 1, bgcolor: 'transparent' }
          }}
        >
          {copied ? 'Copied!' : 'Copy'}
        </Button>
      </Box>
      <Box 
        component="div" 
        className="glass" 
        sx={{ 
          border: `1px solid ${alpha(tokens.color.primary, 0.1)}`, 
          borderRadius: '0 0 12px 12px', 
          borderTop: 'none',
          overflow: 'hidden'
        }}
      >
        <pre ref={preRef} {...props}>
          {children}
        </pre>
      </Box>
    </Box>
  );
};

const MDXComponents = ({ onImageOpen }: MDXComponentsOptions) => ({
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <ScrollReveal>
      <Typography 
        variant="h3" 
        component="h1" 
        sx={{ 
          mt: 10, mb: 4, 
          fontWeight: 600, 
          fontFamily: tokens.typography.fontFamily.serif,
          letterSpacing: '-0.02em',
          lineHeight: 1.2,
          color: 'text.primary'
        }} 
        {...props} 
      />
    </ScrollReveal>
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <ScrollReveal>
      <Typography 
        variant="h4" 
        component="h2" 
        sx={{ 
          mt: 8, mb: 3, 
          fontWeight: 600, 
          fontFamily: tokens.typography.fontFamily.serif,
          letterSpacing: '-0.01em',
          lineHeight: 1.3,
          color: 'text.primary'
        }} 
        {...props} 
      />
    </ScrollReveal>
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <ScrollReveal>
      <Typography 
        variant="h5" 
        component="h3" 
        sx={{ 
          mt: 6, mb: 2, 
          fontWeight: 600, 
          fontFamily: tokens.typography.fontFamily.serif,
          lineHeight: 1.4,
          color: 'text.primary'
        }} 
        {...props} 
      />
    </ScrollReveal>
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <ScrollReveal>
      <Typography 
        variant="body1" 
        sx={{ 
          mb: 4, 
          lineHeight: 1.9, 
          fontSize: '1.3rem',
          fontFamily: tokens.typography.fontFamily.serif,
          color: 'text.secondary',
          fontWeight: 400,
          wordBreak: 'break-word',
          overflowWrap: 'break-word'
        }} 
        {...props} 
      />
    </ScrollReveal>
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
    <ScrollReveal>
      <Box
        component="blockquote"
        sx={{
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
        }}
        {...props}
      />
    </ScrollReveal>
  ),
  pre: (props: any) => (
    <ScrollReveal>
      <CodeBlock {...props} />
    </ScrollReveal>
  ),
  img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    const { src, onClick, ...imgProps } = props;
    const normalizedSrc = typeof src === 'string' ? src : undefined;

    return (
      <Box sx={{ my: 10, textAlign: 'center' }}>
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
    <Box component="ul" sx={{ mb: 4, pl: 4, '& li': { mb: 2, color: 'text.secondary', fontSize: '1.3rem', fontFamily: tokens.typography.fontFamily.serif, lineHeight: 1.8 } }} {...props} />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <Box component="ol" sx={{ mb: 4, pl: 4, '& li': { mb: 2, color: 'text.secondary', fontSize: '1.3rem', fontFamily: tokens.typography.fontFamily.serif, lineHeight: 1.8 } }} {...props} />
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
