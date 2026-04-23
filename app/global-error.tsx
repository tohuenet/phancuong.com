'use client';

import { useEffect } from 'react';
import { Box, Button, Typography, Container, ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import logger from '@/lib/logger';

// We need a basic theme here because the global error boundary might bypass the main theme provider
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#6366f1' },
    background: { default: '#0a0a0a', paper: '#141414' },
  },
});

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error('CRITICAL GLOBAL ERROR:', error);
  }, [error]);

  return (
    <html>
      <body>
        <ThemeProvider theme={darkTheme}>
          <CssBaseline />
          <Container maxWidth="sm">
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                textAlign: 'center',
                gap: 4
              }}
            >
              <Typography variant="h1" sx={{ fontWeight: 800, color: 'primary.main', fontSize: '5rem' }}>
                500
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                A critical error occurred.
              </Typography>
              <Typography variant="body1" color="text.secondary">
                We&apos;re sorry for the inconvenience. A report has been sent to our engineering team.
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => reset()}
                sx={{ borderRadius: 3, px: 6, py: 2, fontWeight: 'bold' }}
              >
                Refresh Page
              </Button>
            </Box>
          </Container>
        </ThemeProvider>
      </body>
    </html>
  );
}
