'use client';

import * as React from 'react';
import { Box } from '@mui/material';
import { LayoutModeContext } from '../ThemeRegistry/ThemeContextProvider';

interface PostDetailShellProps {
  children: React.ReactNode;
}

export default function PostDetailShell({ children }: PostDetailShellProps) {
  const { isWide } = React.useContext(LayoutModeContext);

  return (
    <Box
      sx={{
        py: { xs: 2, md: 4 },
        maxWidth: isWide ? '100%' : 720,
        mx: 'auto',
        width: '100%',
        transition: 'max-width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {children}
    </Box>
  );
}
