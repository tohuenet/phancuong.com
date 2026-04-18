'use client';

import React, { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Box, alpha, useTheme, Typography, Fade } from '@mui/material';
import 'quill/dist/quill.bubble.css';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(async () => {
  const { default: RQ } = await import('react-quill-new');
  return RQ;
}, { 
  ssr: false,
  loading: () => <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>...</Box>
});

interface QuillEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  id?: string; // Used for local storage key
}

export default function QuillEditor({ value, onChange, placeholder, id = 'new-post' }: QuillEditorProps) {
  const theme = useTheme();
  const [saveStatus, setSaveStatus] = useState<boolean>(false);
  
  // Custom Modules for Quill
  const modules = useMemo(() => ({
    toolbar: [
      ['bold', 'italic', 'link'],
      [{ 'header': 1 }, { 'header': 2 }, 'blockquote', 'code-block'],
      ['image', 'video']
    ],
    clipboard: {
      matchVisual: false,
    }
  }), []);

  const formats = [
    'header',
    'bold', 'italic',
    'link', 'blockquote', 'code-block',
    'image', 'video'
  ];

  // Autosave Logic
  useEffect(() => {
    const saved = localStorage.getItem(`quill_autosave_${id}`);
    if (saved && !value) {
      onChange(saved);
    }
  }, [id, onChange, value]);

  const handleEditorChange = (content: string) => {
    onChange(content);
    localStorage.setItem(`quill_autosave_${id}`, content);
    setSaveStatus(true);
    setTimeout(() => setSaveStatus(false), 2000);
  };

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Subtle Save Indicator */}
      <Fade in={saveStatus}>
        <Typography 
          variant="caption" 
          sx={{ 
            position: 'fixed', 
            bottom: 32, 
            right: 32, 
            opacity: 0.4, 
            fontWeight: 700,
            letterSpacing: '0.1em',
            zIndex: 1000,
            pointerEvents: 'none'
          }}
        >
          SAVED
        </Typography>
      </Fade>

      <Box 
        sx={{ 
          '& .ql-container': {
            border: 'none',
            fontFamily: '"Georgia", serif', // Telegraph uses a serif font for the body
            fontSize: '1.25rem',
            minHeight: 400
          },
          '& .ql-editor': {
            p: 0,
            lineHeight: 1.58,
            color: 'text.primary',
            '&.ql-blank::before': {
              left: 0,
              color: alpha(theme.palette.text.primary, 0.2),
              fontStyle: 'normal'
            }
          },
          // Customize the bubble toolbar to match our theme
          '& .ql-bubble .ql-tooltip': {
            bgcolor: alpha(theme.palette.background.paper, 0.9),
            backdropFilter: 'blur(10px)',
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            boxShadow: theme.shadows[10],
            color: 'text.primary'
          },
          '& .ql-bubble .ql-stroke': { stroke: theme.palette.text.primary },
          '& .ql-bubble .ql-fill': { fill: theme.palette.text.primary }
        }}
      >
        <ReactQuill 
          theme="bubble"
          value={value}
          onChange={handleEditorChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder || 'Your story...'}
        />
      </Box>
    </Box>
  );
}
