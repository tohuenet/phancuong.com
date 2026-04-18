'use client';

import { 
  Box, 
  TextField, 
  Button, 
  Stack, 
  Paper, 
  Typography,
  CircularProgress,
  Alert,
  Grid
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Link from 'next/link';

interface CourseFormProps {
  initialData?: any;
  isEditing?: boolean;
}

export default function CourseForm({ initialData, isEditing = false }: CourseFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: initialData || {
      title: '',
      slug: '',
      description: '',
      thumbnailUrl: '',
    }
  });

  const [slugStatus, setSlugStatus] = useState<'auto' | 'manual'>('auto');
  const title = watch('title');

  // Auto-generate slug from title
  useEffect(() => {
    if (!isEditing && title && slugStatus === 'auto') {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^a-z0-t0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setValue('slug', generatedSlug);
    }
  }, [title, setValue, isEditing, slugStatus]);

  const onSubmit = async (data: any) => {
    setSaving(true);
    setError(null);
    const url = isEditing ? `/api/admin/courses/${initialData.id}` : '/api/admin/courses';
    const method = isEditing ? 'PATCH' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        router.push('/admin/courses');
        router.refresh();
      } else {
        const result = await res.json();
        setError(result.error || 'Something went wrong');
      }
    } catch (err) {
      setError('Failed to save course.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 4 }}>
        <Button component={Link} href="/admin/courses" startIcon={<ArrowBackIcon />}>Back</Button>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          {isEditing ? 'Edit Course' : 'New Course'}
        </Typography>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper variant="outlined" sx={{ p: 4, borderRadius: 4 }}>
            <Stack spacing={3}>
              <TextField 
                fullWidth 
                label="Course Title" 
                {...register('title', { required: 'Title is required' })} 
              />
              <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
                <TextField 
                  fullWidth 
                  label="URL Slug" 
                  {...register('slug', { required: 'Slug is required' })} 
                  disabled={slugStatus === 'auto'}
                  helperText={slugStatus === 'auto' ? "Auto-generated from title" : "Manual override enabled"}
                />
                <Button 
                  size="small" 
                  onClick={() => setSlugStatus(slugStatus === 'auto' ? 'manual' : 'auto')}
                  sx={{ mt: 1 }}
                >
                  {slugStatus === 'auto' ? 'Edit' : 'Lock'}
                </Button>
              </Stack>
              <TextField 
                fullWidth 
                label="Thumbnail URL" 
                {...register('thumbnailUrl')} 
                placeholder="e.g. /uploads/course-thumb.jpg"
              />
              <TextField 
                fullWidth 
                label="Description" 
                multiline 
                rows={4} 
                {...register('description')} 
              />
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Button 
            type="submit" 
            variant="contained" 
            size="large" 
            fullWidth 
            startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            disabled={saving}
            sx={{ py: 2, borderRadius: 3, fontWeight: 'bold' }}
          >
            {saving ? 'Saving...' : 'Save Course'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}
