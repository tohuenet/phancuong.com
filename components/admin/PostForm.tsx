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
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
const TiptapEditor = dynamic(() => import('./TiptapEditor'), { ssr: false });
import { useSession } from 'next-auth/react';
import { slugify } from '@/lib/slug';
import { LayoutModeContext } from '../ThemeRegistry/ThemeContextProvider';
import { useContext } from 'react';
import { useFeedback } from '@/components/Providers/FeedbackProvider';

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
  const { isWide } = useContext(LayoutModeContext);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { notify } = useFeedback();

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

  const { register, handleSubmit, control, setValue, getValues, watch } = useForm<PostData>({
    defaultValues
  });

  const [showRestorePrompt, setShowRestorePrompt] = useState(false);
  const [localDraft, setLocalDraft] = useState<string | null>(null);

  // Check for autosave on mount
  useEffect(() => {
    const draft = localStorage.getItem(`tiptap_autosave_${isEditing ? initialData?.id : 'new-post'}`);
    if (draft && draft !== initialData?.content) {
      setLocalDraft(draft);
      setShowRestorePrompt(true);
    }
  }, [isEditing, initialData]);

  const handleRestore = () => {
    if (localDraft) {
      setValue('content', localDraft);
      setShowRestorePrompt(false);
    }
  };

  const onSubmit = async (data: PostData, isPublishing = true) => {
    setSaving(true);
    setError(null);

    const submissionData = { 
      ...data, 
      published: isPublishing 
    };

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
        localStorage.removeItem(`tiptap_autosave_${isEditing ? initialData?.id : 'new-post'}`);
        
        notify(isPublishing ? 'Đã lưu và công khai bài viết.' : 'Đã lưu bản nháp.', 'success');
        
        if (!isEditing && saved?.id) {
          // If it was a new post, redirect to the edit page so they can keep working
          router.push(`/admin/posts/edit/${saved.id}`);
        }
        
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

  const isPublished = watch('published');

  return (
    <Box component="form" sx={{ 
      maxWidth: isWide ? '100%' : '800px', 
      mx: 'auto', 
      pt: 4, 
      pb: 10,
      transition: 'max-width 0.5s cubic-bezier(0.2, 0, 0, 1)',
      px: isWide ? { xs: 2, md: 8 } : 0
    }}>
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
          {isEditing ? 'HỦY' : 'TRANG CHỦ'}
        </Button>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          {saving && <CircularProgress size={16} />}
          
          <Button 
            disabled={saving}
            onClick={handleSubmit((data) => onSubmit(data, false))}
            sx={{ 
              color: 'text.secondary', 
              fontWeight: 700, 
              fontSize: '0.9rem',
              '&:hover': { bgcolor: 'transparent', opacity: 0.7 }
            }}
          >
            LƯU NHÁP
          </Button>

          <Button 
            variant="contained"
            disabled={saving}
            onClick={handleSubmit((data) => onSubmit(data, true))}
            sx={{ 
              bgcolor: 'primary.main', 
              color: 'white',
              fontWeight: 800, 
              fontSize: '0.9rem',
              px: 3,
              borderRadius: 2,
              boxShadow: 'none',
              '&:hover': { bgcolor: 'primary.dark', boxShadow: 'none' }
            }}
          >
            {isPublished ? 'CẬP NHẬT' : 'CÔNG KHAI'}
          </Button>
        </Stack>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 4, mt: 8 }}>{error}</Alert>}

      {showRestorePrompt && (
        <Alert 
          severity="info" 
          sx={{ mb: 4, mt: 8 }}
          action={
            <Button color="inherit" size="small" onClick={handleRestore}>
              KHÔI PHỤC
            </Button>
          }
        >
          Phát hiện bản nháp chưa lưu từ trước. Bạn có muốn khôi phục không?
        </Alert>
      )}

      <Stack spacing={1} sx={{ mt: showRestorePrompt ? 2 : 8 }}>
        <TextField 
          fullWidth 
          variant="standard"
          placeholder="Tiêu đề bài viết..."
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
              <TiptapEditor 
                value={field.value} 
                onChange={field.onChange} 
                placeholder="Câu chuyện của bạn..."
                id={isEditing ? initialData?.id : 'new-post'}
              />
            )}
          />
        </Box>
      </Stack>
    </Box>

  );
}
