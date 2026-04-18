'use client';

import { Box, Card, CardContent, Skeleton, Grid, Stack, alpha, useTheme } from '@mui/material';
import { tokens } from '@/lib/theme-tokens';

export function BlogCardSkeleton() {
  const theme = useTheme();
  return (
    <Card 
      sx={{ 
        height: '100%', 
        borderRadius: tokens.radius.lg,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        bgcolor: alpha(theme.palette.background.paper, 0.4),
      }}
    >
      <Box sx={{ position: 'relative', width: '100%', pt: '56.25%' }}> {/* 16:9 Aspect Ratio */}
        <Skeleton 
          variant="rectangular" 
          sx={{ 
            position: 'absolute', 
            mb: 2,
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%',
            bgcolor: alpha(theme.palette.text.primary, 0.05),
          }} 
        />
      </Box>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Skeleton variant="rounded" width={50} height={24} sx={{ borderRadius: tokens.radius.sm }} />
          <Skeleton variant="rounded" width={50} height={24} sx={{ borderRadius: tokens.radius.sm }} />
        </Box>
        <Skeleton variant="text" height={32} width="90%" sx={{ mb: 1 }} />
        <Skeleton variant="text" height={24} width="100%" sx={{ mb: 0.5 }} />
        <Skeleton variant="text" height={24} width="80%" sx={{ mb: 3 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
          <Skeleton variant="circular" width={24} height={24} />
          <Skeleton variant="text" width={80} />
        </Box>
      </CardContent>
    </Card>
  );
}

export function BlogListSkeleton() {
  return (
    <Grid container spacing={3}>
      {[...Array(6)].map((_, i) => (
        <Grid size={{ xs: 12, sm: 6 }} key={i}>
          <BlogCardSkeleton />
        </Grid>
      ))}
    </Grid>
  );
}

export function PostListItemSkeleton() {
  return (
    <Box
      sx={{
        py: 3,
        borderBottom: `1px solid`,
        borderColor: 'divider',
      }}
    >
      {/* Title — matches h4 uppercase bold */}
      <Skeleton variant="text" height={36} width="72%" sx={{ mb: 1.5, transform: 'none', borderRadius: 1 }} />
      {/* Metadata row: #tag · dot · date · dot · readingTime */}
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <Skeleton variant="text" width={64} height={18} />
        <Skeleton variant="circular" width={4} height={4} sx={{ opacity: 0.3 }} />
        <Skeleton variant="text" width={88} height={18} />
        <Skeleton variant="circular" width={4} height={4} sx={{ opacity: 0.3 }} />
        <Skeleton variant="text" width={60} height={18} />
      </Stack>
    </Box>
  );
}

export function HomePageSkeleton({ count = 8 }: { count?: number }) {
  return (
    <Box sx={{ py: { xs: 2, md: 4 }, maxWidth: 720, mx: 'auto' }}>
      {/* Search bar */}
      <Box sx={{ mb: 4 }}>
        <Skeleton variant="rounded" height={40} sx={{ borderRadius: tokens.radius.sm }} />
      </Box>

      {/* Tag cloud — flexbox row of chips, widths vary to feel natural */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 6 }}>
        {[68, 90, 72, 100, 80, 64, 110, 76].map((w, i) => (
          <Skeleton key={i} variant="rounded" width={w} height={32} sx={{ borderRadius: tokens.radius.full }} />
        ))}
      </Box>

      {/* Section label */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Skeleton variant="text" width={160} height={20} sx={{ mx: 'auto' }} />
      </Box>

      {/* Post list */}
      <Box>
        {Array.from({ length: count }).map((_, i) => (
          <PostListItemSkeleton key={i} />
        ))}
      </Box>
    </Box>
  );
}

export function PostSkeleton() {
  return (
    <Box sx={{ maxWidth: 768, mx: 'auto', py: 8 }}>
      <Skeleton variant="text" height={80} width="80%" sx={{ mb: 2 }} />
      <Box sx={{ display: 'flex', gap: 2, mb: tokens.spacing.block / 8 }}>
        <Skeleton variant="circular" width={40} height={40} />
        <Box sx={{ flexGrow: 1 }}>
          <Skeleton variant="text" width="150px" />
          <Skeleton variant="text" width="100px" />
        </Box>
      </Box>
      <Skeleton variant="rectangular" width="100%" height={400} sx={{ borderRadius: tokens.radius.lg, mb: tokens.spacing.block / 8 }} />
      <Skeleton variant="text" width="100%" sx={{ mb: 1 }} />
      <Skeleton variant="text" width="100%" sx={{ mb: 1 }} />
      <Skeleton variant="text" width="90%" sx={{ mb: 4 }} />
      <Skeleton variant="text" width="100%" sx={{ mb: 1 }} />
      <Skeleton variant="text" width="100%" sx={{ mb: 1 }} />
      <Skeleton variant="text" width="85%" />
    </Box>
  );
}
