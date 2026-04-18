import PostForm from '@/components/admin/PostForm';
import { Box } from '@mui/material';

export default function NewPostPage() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <PostForm />
    </Box>
  );
}
