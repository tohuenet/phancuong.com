import PostForm from '@/components/admin/PostForm';
import { PostsDB } from '@/lib/storage';
import { notFound } from 'next/navigation';
import { Box } from '@mui/material';

interface EditPostPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params;
  
  const post = await PostsDB.getById(id);
  
  if (!post) {
    notFound();
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <PostForm
        initialData={{
          ...post,
          excerpt: post.excerpt ?? '',
          thumbnailUrl: post.thumbnailUrl ?? '',
        }}
        isEditing={true}
      />
    </Box>
  );
}
