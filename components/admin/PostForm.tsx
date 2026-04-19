'use client';

import { 
  Box, 
  TextField, 
  Button, 
  Stack, 
  Typography,
  CircularProgress,
  Alert,
  alpha,
  useTheme
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import QuillEditor from './QuillEditor';
import { useSession } from 'next-auth/react';
import { slugify } from '@/lib/slug';

interface PostData {
  id?: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  thumbnailUrl: string;
  published: boolean;
  order: number;
  tagsString?: string;
}

interface PostFormProps {
  initialData?: {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    thumbnailUrl: string;
    published: boolean;
    order: number;
    tags: Array<{ name: string; slug: string }>;
  };
  isEditing?: boolean;
}

export default function PostForm({ initialData, isEditing = false }: PostFormProps) {
  const router = useRouter();
  const theme = useTheme();
  const { data: session } = useSession();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-process initial tags for the form
  const defaultValues = initialData ? {
    ...initialData,
    tagsString: initialData.tags?.map((t) => t.name).join(', ') || ''
  } : {
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    thumbnailUrl: '',
    published: true,
    order: 0,
    tagsString: '',
  };

  const { register, handleSubmit, control } = useForm<PostData>({
    defaultValues
  });

  const onSubmit = async (data: PostData) => {
    setSaving(true);
    setError(null);

    const submissionData = { ...data };

    // Auto-generate slug if not present
    if (!submissionData.slug) {
      submissionData.slug = slugify(submissionData.title);
    }

    // Auto-generate excerpt from HTML content
    if (!data.excerpt) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = data.content;
      data.excerpt = tempDiv.innerText.slice(0, 200) + '...';
    }

    const url = isEditing && initialData?.id ? `/api/admin/posts/${initialData.id}` : '/api/admin/posts';
    const method = isEditing ? 'PATCH' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      });

      if (res.ok) {
        const saved = await res.json();
        localStorage.removeItem(`quill_autosave_${isEditing ? initialData?.id : 'new-post'}`);
        const target = saved?.slug ? `/blog/${saved.slug}` : '/';
        router.push(target);
        router.refresh();
      } else {
        const result = await res.json();
        setError(result.error || 'Something went wrong');
      }
    } catch {
      setError('Failed to save post.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ maxWidth: '800px', mx: 'auto', pt: 4, pb: 10 }}>
      {/* Telegraph Header */}
      <Box sx={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        height: 64, 
        bgcolor: 'background.default',
        zIndex: 1100,
        px: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.05)}`
      }}>
        <Button 
          onClick={() => router.back()}
          sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.8rem' }}
        >
          {isEditing ? 'Cancel' : 'Home'}
        </Button>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          {saving && <CircularProgress size={16} />}
          <Button 
            type="submit" 
            disabled={saving}
            sx={{ 
              color: 'primary.main', 
              fontWeight: 800, 
              fontSize: '1rem',
              letterSpacing: '0.05em',
              '&:hover': { bgcolor: 'transparent', opacity: 0.7 }
            }}
          >
            {isEditing ? 'SAVE' : 'PUBLISH'}
          </Button>
        </Stack>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 4, mt: 8 }}>{error}</Alert>}

      <Stack spacing={1} sx={{ mt: 8 }}>
        <TextField 
          fullWidth 
          variant="standard"
          placeholder="Title"
          {...register('title', { required: 'Title is required' })} 
          slotProps={{
            input: {
              sx: { 
                fontSize: '2.5rem', 
                fontWeight: 600,
                fontFamily: '"Georgia", serif',
                '&:before, &:after': { borderBottom: 'none' }
              }
            }
          }}
        />

        <TextField 
          fullWidth 
          variant="standard"
          placeholder="HASHTAGS (CÁCH NHAU BẰNG DẤU PHẨY)"
          {...register('tagsString')} 
          slotProps={{
            input: {
              sx: { 
                fontSize: '0.9rem', 
                fontWeight: 700,
                color: 'primary.main',
                letterSpacing: '0.1em',
                '&:before, &:after': { borderBottom: 'none' }
              }
            }
          }}
        />


        {/* Content Area */}
        <Box sx={{ mt: 4 }}>
          <Controller
            name="content"
            control={control}
            rules={{ required: 'Story is required' }}
            render={({ field }) => (
              <QuillEditor 
                value={field.value} 
                onChange={field.onChange} 
                placeholder="Your story..."
                id={isEditing ? initialData?.id : 'new-post'}
              />
            )}
          />
        </Box>
      </Stack>
    </Box>
  );
}
