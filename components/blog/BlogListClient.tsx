'use client';

import {
  Typography,
  Box,
  Pagination,
  alpha,
  useTheme,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert
} from '@mui/material';
import PostListItem from '@/components/blog/PostListItem';
import BlogSearchFilter from '@/components/blog/BlogSearchFilter';
import { tokens } from '@/lib/theme-tokens';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LayoutModeContext } from '../ThemeRegistry/ThemeContextProvider';
import { useState, useMemo, useContext } from 'react';

// ... (interfaces stay same)
interface Tag {
  id: string;
  name: string;
  slug: string;
  _count: { posts: number };
}

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  createdAt: Date | string;
  readingTime: string;
  thumbnailUrl?: string | null;
  isPinned: boolean;
  pinnedOrder: number;
  tags: Array<{ name: string; slug: string }>;
}

interface BlogListClientProps {
  posts: Post[];
  pages: number;
  currentPage: number;
  tags: Tag[];
  loading?: boolean;
}

export default function BlogListClient({ posts: initialPosts, pages, currentPage, tags, loading }: BlogListClientProps) {
  const theme = useTheme();
  const router = useRouter();
  const { data: session } = useSession();
  const { isWide } = useContext(LayoutModeContext);
  
  const { pinnedPosts: initialPinned, otherPosts: initialOthers } = useMemo(() => {
    const pinned = initialPosts.filter(p => p.isPinned).sort((a, b) => a.pinnedOrder - b.pinnedOrder);
    const others = initialPosts.filter(p => !p.isPinned);
    return { pinnedPosts: pinned, otherPosts: others };
  }, [initialPosts]);

  const [pinnedPosts, setPinnedPosts] = useState<Post[]>(initialPinned);
  const [otherPosts, setOtherPosts] = useState<Post[]>(initialOthers);

  const [prevInitial, setPrevInitial] = useState(initialPosts);
  if (initialPosts !== prevInitial) {
    setPrevInitial(initialPosts);
    setPinnedPosts(initialPinned);
    setOtherPosts(initialOthers);
  }

  // Admin Action States
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean, message: string, severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success'
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/posts/${deleteId}`, { method: 'DELETE' });
      if (res.ok) {
        setPinnedPosts(prev => prev.filter(p => p.id !== deleteId));
        setOtherPosts(prev => prev.filter(p => p.id !== deleteId));
        setSnackbar({ open: true, message: 'Xóa bài viết thành công.', severity: 'success' });
      } else throw new Error();
    } catch {
      setSnackbar({ open: true, message: 'Không thể xóa bài viết.', severity: 'error' });
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const handlePin = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/posts/pin/${id}`, { method: 'POST' });
      if (res.ok) {
        const updated = await res.json();
        const allPosts = [...pinnedPosts, ...otherPosts].map(p => p.id === id ? { ...p, isPinned: updated.isPinned } : p);
        setPinnedPosts(allPosts.filter(p => p.isPinned).sort((a, b) => a.pinnedOrder - b.pinnedOrder));
        setOtherPosts(allPosts.filter(p => !p.isPinned));
        setSnackbar({ open: true, message: updated.isPinned ? 'Đã ghim bài viết.' : 'Đã bỏ ghim.', severity: 'success' });
      }
    } catch {
      setSnackbar({ open: true, message: 'Lỗi khi ghim bài viết.', severity: 'error' });
    }
  };

  const handleReorder = async (newOrder: Post[]) => {
    setPinnedPosts(newOrder);
    try {
      await fetch('/api/admin/posts/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postIds: newOrder.map(p => p.id) })
      });
    } catch {
      console.error('Failed to sync order');
    }
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    const url = new URL(window.location.href);
    url.searchParams.set('page', value.toString());
    router.push(url.pathname + url.search);
  };

  return (
    <Box sx={{ 
      py: { xs: 2, md: 4 },
      maxWidth: isWide ? '100%' : 720,
      mx: 'auto',
      transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
    }}>

      <Box sx={{ mb: 6 }}>
        <BlogSearchFilter tags={tags} />
      </Box>

      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography 
          variant="overline" 
          sx={{ 
            fontWeight: 800, 
            letterSpacing: '0.1em', 
            color: 'text.secondary',
            textTransform: 'uppercase',
          }}
        >
          Danh Sách Bài Viết
        </Typography>
      </Box>

      {/* Pinned Posts Section */}
      <Box sx={{ mb: 8 }}>
        {pinnedPosts.length > 0 && (
          <>
            <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 900, mb: 2, display: 'block' }}>
              Bài viết nổi bật
            </Typography>
            <Reorder.Group 
              axis="y" 
              values={pinnedPosts} 
              onReorder={handleReorder}
              style={{ listStyle: 'none', padding: 0 }}
            >
              <AnimatePresence mode="popLayout">
                {pinnedPosts.map((post) => (
                  <Reorder.Item 
                    key={post.id} 
                    value={post}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    layout
                  >
                    <PostListItem 
                      post={post} 
                      isAdmin={!!session?.user} 
                      onDelete={(id) => setDeleteId(id)}
                      onPin={handlePin}
                    />
                  </Reorder.Item>
                ))}
              </AnimatePresence>
            </Reorder.Group>
          </>
        )}
      </Box>

      {/* Regular Posts Section */}
      <Box sx={{ minHeight: 400 }}>
        {pinnedPosts.length > 0 && otherPosts.length > 0 && (
            <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 900, mb: 2, display: 'block' }}>
            Tất cả bài viết
          </Typography>
        )}
        
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <AnimatePresence mode="popLayout">
            {otherPosts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                layout
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              >
                <PostListItem 
                  post={post} 
                  isAdmin={!!session?.user} 
                  onDelete={(id) => setDeleteId(id)}
                  onPin={handlePin}
                />
              </motion.div>
            ))}
          </AnimatePresence>

          {!loading && pinnedPosts.length === 0 && otherPosts.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Box className="glass" sx={{ py: 8, textAlign: 'center', bgcolor: alpha(theme.palette.action.hover, 0.05) }}>
                <Typography variant="h5" color="text.secondary" sx={{ fontWeight: 600 }}>Không tìm thấy bài viết nào.</Typography>
              </Box>
            </motion.div>
          )}
        </Box>
      </Box>

      {/* Pagination */}
      {pages > 1 && (
        <Box sx={{ mt: 8, display: 'flex', justifyContent: 'center' }}>
          <Pagination
            count={pages}
            page={currentPage}
            color="primary"
            size="large"
            onChange={handlePageChange}
            sx={{ '& .MuiPaginationItem-root': { borderRadius: tokens.radius.sm, fontWeight: 700 } }}
          />
        </Box>
      )}

      {/* Admin Dialogs & Snakbars stay same... */}
      <Dialog 
        open={!!deleteId} 
        onClose={() => !deleting && setDeleteId(null)}
        slotProps={{ paper: { sx: { borderRadius: tokens.radius.lg, p: 2 } } }}
      >
        <DialogTitle sx={{ fontWeight: 900 }}>Xóa bài viết?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontWeight: 500 }}>
            Bạn có chắc chắn muốn xóa bài viết này không? Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteId(null)} disabled={deleting} sx={{ fontWeight: 700 }}>Hủy</Button>
          <Button 
            onClick={handleDelete} 
            color="error" 
            variant="contained" 
            disabled={deleting}
            sx={{ borderRadius: tokens.radius.md, fontWeight: 800 }}
          >
            {deleting ? 'Đang xóa...' : 'Xác nhận xóa'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ borderRadius: tokens.radius.md }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
