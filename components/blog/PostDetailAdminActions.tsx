'use client';

import { useState } from 'react';
import { 
  Stack, 
  IconButton, 
  Tooltip, 
  alpha, 
  useTheme 
} from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PushPinIcon from '@mui/icons-material/PushPin';
import { useFeedback } from '@/components/Providers/FeedbackProvider';
import { tokens } from '@/lib/theme-tokens';

interface PostDetailAdminActionsProps {
  id: string;
  slug: string;
  initialIsPinned: boolean;
}

export default function PostDetailAdminActions({ id, slug, initialIsPinned }: PostDetailAdminActionsProps) {
  const theme = useTheme();
  const router = useRouter();
  const { confirm, notify } = useFeedback();
  const [isPinned, setIsPinned] = useState(initialIsPinned);

  const handleDelete = async () => {
    const isConfirmed = await confirm({
      title: 'Xóa bài viết?',
      message: 'Bạn có chắc chắn muốn xóa bài viết này không? Hành động này không thể hoàn tác.',
      severity: 'error',
      confirmText: 'Xác nhận xóa'
    });

    if (!isConfirmed) return;

    try {
      const res = await fetch(`/api/admin/posts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        notify('Xóa bài viết thành công.', 'success');
        router.push('/'); // Redirect to home after deletion
      } else {
        throw new Error();
      }
    } catch {
      notify('Không thể xóa bài viết.', 'error');
    }
  };

  const handlePin = async () => {
    try {
      const res = await fetch(`/api/admin/posts/pin/${id}`, { method: 'POST' });
      if (res.ok) {
        const updated = await res.json();
        setIsPinned(updated.isPinned);
        notify(updated.isPinned ? 'Đã ghim bài viết.' : 'Đã bỏ ghim.', 'success');
      }
    } catch {
      notify('Lỗi khi ghim bài viết.', 'error');
    }
  };

  return (
    <Stack 
      direction="row" 
      spacing={1} 
      sx={{ 
        bgcolor: alpha(theme.palette.background.paper, 0.4),
        backdropFilter: 'blur(10px)',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        borderRadius: tokens.radius.full,
        p: 0.5,
        px: 1,
        boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.1)}`,
        '& .MuiIconButton-root': {
          color: 'text.secondary',
          '&:hover': {
            color: 'primary.main',
            bgcolor: alpha(theme.palette.primary.main, 0.05)
          }
        }
      }}
    >
      <Tooltip title={isPinned ? "Bỏ ghim" : "Ghim bài viết"}>
        <IconButton 
          size="small" 
          onClick={handlePin}
          sx={{ 
            color: isPinned ? 'primary.main' : 'text.secondary',
            '& svg': {
              transform: isPinned ? 'rotate(90deg)' : 'none',
              transition: 'transform 0.3s ease'
            }
          }}
        >
          <PushPinIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      
      <Tooltip title="Chỉnh sửa">
        <IconButton 
          size="small" 
          component={Link} 
          href={`/admin/posts/edit/${id}`}
          sx={{ color: 'text.secondary' }}
        >
          <EditIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      
      <Tooltip title="Xóa">
        <IconButton 
          size="small" 
          color="error" 
          onClick={handleDelete}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}
