'use client';

import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  TextField, 
  Stack, 
  Avatar,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import { useForm, useWatch } from 'react-hook-form';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import SaveIcon from '@mui/icons-material/Save';

export default function AdminProfilePage() {
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  interface ProfileFormValues {
    name: string;
    image: string;
  }

  const { register, handleSubmit, reset, control } = useForm<ProfileFormValues>({
    defaultValues: {
      name: '',
      image: '',
    }
  });

  const watchImage = useWatch({ control, name: 'image' });

  useEffect(() => {
    if (session?.user) {
      reset({
        name: session.user.name || '',
        image: session.user.image || '',
      });
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncs form once session resolves
      setLoading(false);
    }
  }, [session, reset]);

  const onSubmit = async (data: ProfileFormValues) => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        // Update the NextAuth session
        await update();
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      } else {
        throw new Error('Failed to update');
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Box sx={{ maxWidth: '600px' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>My Profile</Typography>
        <Typography variant="body2" color="text.secondary">Manage your public information and avatar.</Typography>
      </Box>

      {message && <Alert severity={message.type} sx={{ mb: 4, borderRadius: 3 }}>{message.text}</Alert>}

      <Paper variant="outlined" sx={{ p: 4, borderRadius: 4 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Avatar 
                src={watchImage || ''} 
                sx={{ width: 100, height: 100, border: '4px solid', borderColor: 'primary.main' }}
              >
                {session?.user?.name?.charAt(0)}
              </Avatar>
              <Typography variant="caption" color="text.secondary">
                Profile Preview
              </Typography>
            </Box>

            <Divider />

            <TextField
              fullWidth
              label="Display Name"
              {...register('name', { required: 'Name is required' })}
            />

            <TextField
              fullWidth
              label="Avatar URL"
              placeholder="Nhập link ảnh (ví dụ: https://...)"
              {...register('image')}
              helperText="Nhập link ảnh để làm hình đại diện."
            />

            <Box sx={{ pt: 2 }}>
              <Button 
                type="submit" 
                variant="contained" 
                startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />} 
                disabled={saving}
                fullWidth
                sx={{ borderRadius: 2, py: 1.5 }}
              >
                {saving ? 'Updating...' : 'Save Profile Changes'}
              </Button>
            </Box>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}
