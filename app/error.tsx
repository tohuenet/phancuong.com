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
          Đã có lỗi xảy ra ở phần này.
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Chúng tôi đã ghi nhận lỗi và đang xem xét.
        </Typography>
        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            onClick={() => reset()}
            sx={{ borderRadius: 2, px: 4 }}
          >
            Thử lại
          </Button>
          <Button
            variant="outlined"
            onClick={() => window.location.href = '/'}
            sx={{ borderRadius: 2, px: 4 }}
          >
            Về trang chủ
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
