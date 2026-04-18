import { Box, Skeleton } from '@mui/material';

export default function ArticleBodySkeleton() {
  return (
    <Box component="section" aria-label="Loading article content">
      <Skeleton variant="text" height={42} sx={{ width: '72%', mb: 2 }} />
      <Skeleton variant="text" height={28} sx={{ width: '100%' }} />
      <Skeleton variant="text" height={28} sx={{ width: '96%' }} />
      <Skeleton variant="text" height={28} sx={{ width: '93%', mb: 4 }} />

      <Skeleton
        variant="rectangular"
        sx={{ width: '100%', height: { xs: 220, md: 420 }, borderRadius: 2, mb: 6 }}
      />

      <Skeleton variant="text" height={28} sx={{ width: '98%' }} />
      <Skeleton variant="text" height={28} sx={{ width: '95%' }} />
      <Skeleton variant="text" height={28} sx={{ width: '90%' }} />
      <Skeleton variant="text" height={28} sx={{ width: '97%', mb: 5 }} />

      <Skeleton variant="rectangular" sx={{ width: '100%', height: 220, borderRadius: 2, mb: 5 }} />

      <Skeleton variant="text" height={28} sx={{ width: '92%' }} />
      <Skeleton variant="text" height={28} sx={{ width: '87%' }} />
      <Skeleton variant="text" height={28} sx={{ width: '94%' }} />
    </Box>
  );
}
