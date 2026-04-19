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
  MenuItem,
  Grid
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Link from 'next/link';
import { slugify } from '@/lib/slug';

interface LessonFormProps {
  initialData?: any;
  isEditing?: boolean;
}

export default function LessonForm({ initialData, isEditing = false }: LessonFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [courses, setCourses] = useState<any[]>([]);

  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: initialData || {
      title: '',
      slug: '',
      content: '',
      order: 0,
      courseId: '',
    }
  });

  const [slugStatus, setSlugStatus] = useState<'auto' | 'manual'>('auto');
  const title = watch('title');

  // Load courses for selection
  useEffect(() => {
    fetch('/api/admin/courses')
      .then(res => res.json())
      .then(data => setCourses(data));
  }, []);

  // Auto-generate slug from title
  useEffect(() => {
    if (!isEditing && title && slugStatus === 'auto') {
      const generatedSlug = slugify(title);
      setValue('slug', generatedSlug);
    }
  }, [title, setValue, isEditing, slugStatus]);

  const onSubmit = async (data: any) => {
    setSaving(true);
    setError(null);
    const url = isEditing ? `/api/admin/lessons/${initialData.id}` : '/api/admin/lessons';
    const method = isEditing ? 'PATCH' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        router.push('/admin/lessons');
        router.refresh();
      } else {
        const result = await res.json();
        setError(result.error || 'Something went wrong');
      }
    } catch (err) {
      setError('Failed to save lesson.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 4 }}>
        <Button component={Link} href="/admin/lessons" startIcon={<ArrowBackIcon />}>Back</Button>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          {isEditing ? 'Edit Lesson' : 'New Lesson'}
        </Typography>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper variant="outlined" sx={{ p: 4, borderRadius: 4 }}>
            <Stack spacing={3}>
              <TextField 
                fullWidth 
                label="Lesson Title" 
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
                label="Content (MDX/Markdown)" 
                multiline 
                rows={20} 
                {...register('content', { required: 'Content is required' })} 
                sx={{ '& .MuiInputBase-root': { fontFamily: 'monospace' } }}
              />
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={4}>
            <Paper variant="outlined" sx={{ p: 4, borderRadius: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }} gutterBottom>Lesson Settings</Typography>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  select
                  label="Parent Course"
                  {...register('courseId', { required: 'Course is required' })}
                  defaultValue={initialData?.courseId || ''}
                >
                  <MenuItem value="">Select a course</MenuItem>
                  {courses.map((c) => (
                    <MenuItem key={c.id} value={c.id}>{c.title}</MenuItem>
                  ))}
                </TextField>
                <TextField
                  fullWidth
                  type="number"
                  label="Order in Course"
                  {...register('order', { valueAsNumber: true })}
                  helperText="Lower numbers appear first"
                />
              </Stack>
            </Paper>

            <Button 
              type="submit" 
              variant="contained" 
              size="large" 
              fullWidth 
              startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
              disabled={saving}
              sx={{ py: 2, borderRadius: 3, fontWeight: 'bold' }}
            >
              {saving ? 'Saving...' : 'Save Lesson'}
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
