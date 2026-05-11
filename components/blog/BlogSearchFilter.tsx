'use client';

import {
  Box,
  Chip,
  IconButton,
  InputAdornment,
  TextField,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
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
  const searchParams = useSearchParams();

  const urlQ = searchParams.get('q') || '';
  const rawTag = searchParams.get('tag') || '';
  const activeTag = rawTag === 'all' ? '' : rawTag;

  const [search, setSearch] = useState(urlQ);
  const [trackedUrlQ, setTrackedUrlQ] = useState(urlQ);
  if (trackedUrlQ !== urlQ) {
    setTrackedUrlQ(urlQ);
    setSearch(urlQ);
  }

  const handleTagClick = (tagSlug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (activeTag === tagSlug) {
      params.delete('tag');
    } else {
      params.set('tag', tagSlug);
    }
    params.set('page', '1');
    router.push(`/?${params.toString()}`);
  };

  // Debounce: push search to URL 300ms after the user stops typing.
  useEffect(() => {
    if (search === urlQ) return;
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (search) params.set('q', search);
      else params.delete('q');
      params.set('page', '1');
      router.replace(`/?${params.toString()}`);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, urlQ, searchParams, router]);

  const clearSearch = () => setSearch('');

  // M3 filter-chip style: secondaryContainer fill when selected,
  // outlineVariant border when not. Plain hover, no lift, no shadow.
  const chipSx = (selected: boolean) => ({
    borderRadius: `${tokens.radius.full}px`,
    fontSize: '0.85rem',
    fontWeight: selected ? 600 : 500,
    bgcolor: selected
      ? (t: import('@mui/material').Theme) => t.palette.secondaryContainer
      : 'transparent',
    color: selected
      ? (t: import('@mui/material').Theme) => t.palette.onSecondaryContainer
      : 'text.secondary',
    border: '1px solid',
    borderColor: selected
      ? 'transparent'
      : (t: import('@mui/material').Theme) => t.palette.outlineVariant,
    transition: `background-color ${tokens.duration.short3}ms ${tokens.transitions.standard}, border-color ${tokens.duration.short3}ms ${tokens.transitions.standard}, color ${tokens.duration.short3}ms ${tokens.transitions.standard}`,
    '&:hover': {
      bgcolor: selected
        ? (t: import('@mui/material').Theme) => t.palette.secondaryContainer
        : 'transparent',
      borderColor: selected ? 'transparent' : 'text.primary',
      color: selected
        ? (t: import('@mui/material').Theme) => t.palette.onSecondaryContainer
        : 'text.primary',
    },
  });

  return (
    // suppressHydrationWarning: password-manager extensions inject attrs
    // onto containers that wrap a text input, racing with React hydration.
    <Box suppressHydrationWarning>
      <Box sx={{ mb: 4 }}>
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
                  <SearchIcon
                    sx={{ color: 'text.secondary', opacity: 0.7 }}
                    fontSize="small"
                  />
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
              borderRadius: `${tokens.radius.sm}px`,
              bgcolor: 'background.paper',
              transition: `border-color ${tokens.duration.short3}ms ${tokens.transitions.standard}`,
              '& fieldset': {
                borderColor: (t) => t.palette.outlineVariant,
              },
              '&:hover fieldset': {
                borderColor: 'text.primary',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'text.primary',
                borderWidth: 1,
              },
            },
          }}
        />
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        <Chip
          label="#all"
          onClick={() => {
            const params = new URLSearchParams(searchParams.toString());
            params.delete('tag');
            params.set('page', '1');
            router.push(`/?${params.toString()}`);
          }}
          sx={chipSx(!activeTag)}
        />
        {tags.map((tag) => (
          <Chip
            key={tag.id}
            label={`#${tag.slug}`}
            onClick={() => handleTagClick(tag.slug)}
            sx={chipSx(activeTag === tag.slug)}
          />
        ))}
      </Box>
    </Box>
  );
}
