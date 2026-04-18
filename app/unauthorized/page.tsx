'use client';

import { Container, Typography, Box, Button } from '@mui/material';
import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <Container maxWidth="sm">
      <Box sx={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
        <Typography variant="h3" color="error" gutterBottom sx={{ fontWeight: 'bold' }}>
          Access Denied
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
          Your Google account email is not authorized to log into this system. Please check your credentials or contact the administrator.
        </Typography>
        <Button variant="contained" color="primary" component={Link} href="/" sx={{ mt: 3, px: 4 }}>
          Return Home
        </Button>
      </Box>
    </Container>
  );
}
