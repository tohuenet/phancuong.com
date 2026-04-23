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
import { useForm, useWatch } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Link from 'next/link';
import { tokens } from '@/lib/theme-tokens';
import { slugify } from '@/lib/slug';

interface SeriesData {
  id?: string;
  title: string;
  slug: string;
  description: string;
  thumbnailUrl: string;
}

interface SeriesFormProps {
  initialData?: SeriesData;
  isEditing?: boolean;
}

export default function SeriesForm({ initialData, isEditing = false }: SeriesFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, control, setValue } = useForm<SeriesData>({
    defaultValues: initialData || {
      title: '',
      slug: '',
      description: '',
      thumbnailUrl: '',
    }
  });

  const [slugStatus, setSlugStatus] = useState<'auto' | 'manual'>('auto');
  const title = useWatch({ control, name: 'title' });

  // Auto-generate slug from title
  useEffect(() => {
    if (!isEditing && title && slugStatus === 'auto') {
      const generatedSlug = slugify(title);
      setValue('slug', generatedSlug);
    }
  }, [title, setValue, isEditing, slugStatus]);

  const onSubmit = async (data: SeriesData) => {
    setSaving(true);
    setError(null);
    const url = isEditing && initialData ? `/api/admin/series/${initialData.id}` : '/api/admin/series';
    const method = isEditing ? 'PATCH' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        router.push('/admin/series');
        router.refresh();
      } else {
        const result = await res.json();
        setError(result.error || 'Something went wrong');
      }
    } catch {
      setError('Failed to save series.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: tokens.spacing.block / 8 }}>
        <Button component={Link} href="/admin/series" startIcon={<ArrowBackIcon />}>Back</Button>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          {isEditing ? 'Edit Series' : 'New Article Series'}
        </Typography>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: tokens.spacing.block / 8 }}>{error}</Alert>}

      <Grid container spacing={tokens.spacing.xl / 8}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper variant="outlined" sx={{ p: tokens.spacing.xl / 8, borderRadius: 4 }}>
            <Stack spacing={3}>
              <TextField 
                fullWidth 
                label="Series Title" 
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
                placeholder="e.g. /uploads/series-thumb.jpg"
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
            {saving ? 'Saving...' : 'Save Series'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}
