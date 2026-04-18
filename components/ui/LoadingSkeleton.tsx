'use client';

import { Box, Skeleton, Grid, Paper } from '@mui/material';
import { motion } from 'framer-motion';

/**
 * Skeleton for a Post or Course card
 */
export const CardSkeleton = () => (
  <Paper 
    variant="outlined" 
    sx={{ 
      height: '100%', 
      borderRadius: 4, 
      overflow: 'hidden',
      border: '1px solid',
      borderColor: 'divider'
    }}
  >
    <Skeleton variant="rectangular" height={200} animation="wave" />
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Skeleton variant="rounded" width={60} height={20} animation="wave" />
        <Skeleton variant="rounded" width={60} height={20} animation="wave" />
      </Box>
      <Skeleton variant="text" sx={{ fontSize: '2rem', mb: 1 }} animation="wave" />
      <Skeleton variant="text" sx={{ mb: 2 }} animation="wave" />
      <Skeleton variant="text" width="60%" animation="wave" />
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Skeleton variant="circular" width={30} height={30} animation="wave" />
        <Skeleton variant="text" width="40%" animation="wave" />
      </Box>
    </Box>
  </Paper>
);

/**
 * Grid of skeletons for list pages
 */
export const ListSkeleton = ({ count = 6 }: { count?: number }) => (
  <Grid container spacing={4}>
    {Array.from({ length: count }).map((_, i) => (
      <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: i * 0.05 }}
        >
          <CardSkeleton />
        </motion.div>
      </Grid>
    ))}
  </Grid>
);

/**
 * Skeleton for the Admin Dashboard Stats
 */
export const StatSkeleton = () => (
  <Paper variant="outlined" sx={{ p: 3, borderRadius: 4 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Skeleton variant="rounded" width={48} height={48} animation="wave" />
      <Box sx={{ flex: 1 }}>
        <Skeleton variant="text" width="40%" animation="wave" />
        <Skeleton variant="text" width="60%" height={40} animation="wave" />
      </Box>
    </Box>
  </Paper>
);
