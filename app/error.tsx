'use client';

import { useEffect } from 'react';
import { Box, Button, Typography, Container } from '@mui/material';
import logger from '@/lib/logger';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to our production logger
    logger.error('Application error captured by boundary:', error);
  }, [error]);

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center',
          gap: 3
        }}
      >
        <Typography variant="h2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Oops!
        </Typography>
        <Typography variant="h5">
          Something went wrong in this section.
        </Typography>
        <Typography variant="body1" color="text.secondary">
          We&apos;ve logged the error and are looking into it.
        </Typography>
        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            onClick={() => reset()}
            sx={{ borderRadius: 2, px: 4 }}
          >
            Try again
          </Button>
          <Button
            variant="outlined"
            onClick={() => window.location.href = '/'}
            sx={{ borderRadius: 2, px: 4 }}
          >
            Go Home
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
