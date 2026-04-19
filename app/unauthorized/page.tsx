'use client';

import { Container, Typography, Box, Button } from '@mui/material';
import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <Container maxWidth="sm">
      <Box sx={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
        <Typography variant="h3" color="error" gutterBottom sx={{ fontWeight: 'bold' }}>
          Không có quyền truy cập
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
          Tài khoản Google của bạn không được phép đăng nhập hệ thống này. Vui lòng kiểm tra lại hoặc liên hệ quản trị viên.
        </Typography>
        <Button variant="contained" color="primary" component={Link} href="/" sx={{ mt: 3, px: 4 }}>
          Về trang chủ
        </Button>
      </Box>
    </Container>
  );
}
