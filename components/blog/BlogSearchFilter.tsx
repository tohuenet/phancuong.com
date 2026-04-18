'use client';

import { 
  Box, 
  Typography, 
  TextField, 
  Chip, 
  InputAdornment, 
  IconButton,
  useTheme,
  alpha
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { tokens } from '@/lib/theme-tokens';

interface TagWithCount {
  id: string;
  name: string;
  slug: string;
  _count: { posts: number };
}

interface BlogSearchFilterProps {
  tags: TagWithCount[];
}

export default function BlogSearchFilter({ tags }: BlogSearchFilterProps) {
  const router = useRouter();
  const theme = useTheme();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('q') || '');
  const activeTag = searchParams.get('tag') || '';

  const handleTagClick = (tagSlug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (activeTag === tagSlug) {
      params.delete('tag');
    } else {
      params.set('tag', tagSlug);
    }
    params.set('page', '1');
    router.push(`/blog?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (search) {
      params.set('q', search);
    } else {
      params.delete('q');
    }
    params.set('page', '1');
    router.push(`/blog?${params.toString()}`);
  };

  const clearSearch = () => {
    setSearch('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('q');
    router.push(`/blog?${params.toString()}`);
  };

  return (
    <Box>
      {/* Search Section */}
      <Box component="form" onSubmit={handleSearchSubmit} sx={{ mb: 4 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Nhập từ khóa..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'primary.main', opacity: 0.6 }} fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: search && (
                <InputAdornment position="end">
                  <IconButton onClick={clearSearch} size="small" sx={{ p: 0.5 }}>
                    <ClearIcon fontSize="inherit" />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: tokens.radius.sm,
              bgcolor: alpha(theme.palette.background.default, 0.5),
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: alpha(theme.palette.background.default, 0.8),
              },
              '&.Mui-focused': {
                bgcolor: alpha(theme.palette.background.default, 1),
                boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
              }
            }
          }}
        />
      </Box>

      {/* Hashtag Cloud Section */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
        <Chip
          label="#tất-cả"
          onClick={() => {
            const params = new URLSearchParams(searchParams.toString());
            params.delete('tag');
            params.set('page', '1');
            router.push(`/blog?${params.toString()}`);
          }}
          sx={{ 
            borderRadius: tokens.radius.full,
            fontWeight: !activeTag ? 800 : 500,
            fontSize: '0.85rem',
            bgcolor: !activeTag ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
            color: !activeTag ? 'primary.main' : 'text.secondary',
            border: `1px solid ${!activeTag ? alpha(theme.palette.primary.main, 1) : alpha(theme.palette.text.secondary, 0.1)}`,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              borderColor: theme.palette.primary.main,
              color: 'primary.main',
              transform: 'translateY(-2px)'
            }
          }}
        />
        {tags.map((tag) => {
          const isActive = activeTag === tag.slug;
          return (
            <Chip
              key={tag.id}
              label={`#${tag.slug}`}
              onClick={() => handleTagClick(tag.slug)}
              sx={{ 
                borderRadius: tokens.radius.full, 
                fontWeight: isActive ? 800 : 500,
                fontSize: '0.85rem',
                bgcolor: isActive ? alpha(theme.palette.primary.main, 0.15) : 'transparent',
                color: isActive ? 'primary.main' : 'text.secondary',
                border: `1px solid ${isActive ? alpha(theme.palette.primary.main, 1) : alpha(theme.palette.text.secondary, 0.1)}`,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  borderColor: theme.palette.primary.main,
                  color: 'primary.main',
                  transform: 'translateY(-2px)',
                  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`
                }
              }}
            />
          );
        })}
      </Box>
    </Box>
  );
}
