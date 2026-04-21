'use client';

import React, { useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu, FloatingMenu } from '@tiptap/react/menus';
import { StarterKit } from '@tiptap/starter-kit';
import { Image } from '@tiptap/extension-image';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Typography } from '@tiptap/extension-typography';
import { TableKit } from '@tiptap/extension-table';
import { Youtube } from '@tiptap/extension-youtube';
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { Highlight } from '@tiptap/extension-highlight';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { TextAlign } from '@tiptap/extension-text-align';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { CharacterCount } from '@tiptap/extension-character-count';
import { FontFamily } from '@tiptap/extension-font-family';
import { common, createLowlight } from 'lowlight';
import { tokens } from '@/lib/theme-tokens';


import { 
  Box, 
  alpha, 
  useTheme, 
  Typography as MuiTypography, 
  IconButton, 
  Stack,
  Tooltip,
  Paper,
  Divider
} from '@mui/material';
import YouTubeIcon from '@mui/icons-material/YouTube';
import { Underline } from '@tiptap/extension-underline';
import { Link as TiptapLink } from '@tiptap/extension-link';
import { 
  Bold, 
  Italic, 
  Link as LinkIcon, 
  Heading1, 
  Heading2, 
  Heading3,
  List, 
  ListOrdered, 
  Quote, 
  Image as ImageIcon, 
  Table as TableIcon,
  SquareCode,
  Highlighter,
  Underline as UnderlineIcon,
  CheckSquare,
  Undo,
  Redo,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Palette,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
const lowlight = createLowlight(common);

interface TiptapEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  id?: string;
}

export default function TiptapEditor({ value, onChange, placeholder, id = 'new-post' }: TiptapEditorProps) {
  const theme = useTheme();

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        // Disable built-in link/underline so our customized versions below
        // (with class + openOnClick) register without collision.
        link: false,
        underline: false,
      }),
      TiptapLink.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'editor-link',
        },
      }),
      Underline,
      Image.configure({
        HTMLAttributes: {
          class: 'editor-image',
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Bắt đầu viết câu chuyện của bạn...',
      }),
      Typography,
      TableKit,
      Youtube.configure({
        width: 840,
        height: 480,
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Highlight.configure({ multicolor: true }),
      TextStyle,
      Color,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Subscript,
      Superscript,
      FontFamily,
      CharacterCount,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
      
      // Auto-save logic
      localStorage.setItem(`tiptap_autosave_${id}`, html);
    },
    editorProps: {
      attributes: {
        class: 'prose-editor focus:outline-none',
      },
    },
  });

  // Handle Copy to Clipboard for Code Blocks
  useEffect(() => {
    if (!editor) return;

    const handleCopy = async (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('copy-code-btn')) {
        const pre = target.closest('pre');
        const code = pre?.querySelector('code')?.innerText;
        if (code) {
          try {
            await navigator.clipboard.writeText(code);
            const originalText = target.innerText;
            target.innerText = 'COPIED!';
            target.classList.add('copied');
            setTimeout(() => {
              target.innerText = originalText;
              target.classList.remove('copied');
            }, 2000);
          } catch (err) {
            console.error('Failed to copy', err);
          }
        }
      }
    };

    document.addEventListener('click', handleCopy);
    return () => document.removeEventListener('click', handleCopy);
  }, [editor]);

  // Handle image upload
  const addImage = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      if (input.files?.length) {
        const file = input.files[0];
        const formData = new FormData();
        formData.append('file', file);

        try {
          const res = await fetch('/api/admin/upload', {
            method: 'POST',
            body: formData,
          });
          const data = await res.json();
          if (data.url) {
            editor?.chain().focus().setImage({ src: data.url }).run();
          }
        } catch (error) {
          console.error('Upload failed', error);
        }
      }
    };
    input.click();
  }, [editor]);

  const addYoutubeVideo = useCallback(() => {
    const url = prompt('Nhập link YouTube:');
    if (url) {
      editor?.chain().focus().setYoutubeVideo({ src: url }).run();
    }
  }, [editor]);

  // Sync content if changed externally
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      // Check if value is truly different (not just empty vs <p></p>)
      if (value === '' && editor.isEmpty) return;
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <Box sx={{ 
      position: 'relative', 
      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`, 
      borderRadius: '12px', 
      overflow: 'visible', // Allow sticky sidebar to be visible if needed or manage it inside
      bgcolor: alpha(theme.palette.background.paper, 0.2), 
      backdropFilter: 'blur(30px) saturate(180%)',
      boxShadow: theme.palette.mode === 'dark' 
        ? `0 20px 40px ${alpha(theme.palette.common.black, 0.4)}`
        : `0 20px 40px ${alpha(theme.palette.common.black, 0.05)}`,
      transition: 'all 0.3s ease',
    }}>
      {/* Floating Sticky Toggles Moved to AppShell Global */}
      
      {/* Main Toolbar */}
      <Box sx={{ 
        p: 1, 
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`, 
        bgcolor: alpha(theme.palette.background.paper, 0.8),
        display: 'flex',
        flexWrap: 'wrap',
        gap: 0.5,
        position: 'sticky',
        top: 64, // Sticky below the fixed PostForm header
        zIndex: 10
      }}>
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Undo">
            <span>
              <IconButton size="small" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}><Undo size={18}/></IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Redo">
            <span>
              <IconButton size="small" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}><Redo size={18}/></IconButton>
            </span>
          </Tooltip>
        </Stack>
        
        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Heading 1">
            <IconButton size="small" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} color={editor.isActive('heading', { level: 1 }) ? 'primary' : 'inherit'}><Heading1 size={18}/></IconButton>
          </Tooltip>
          <Tooltip title="Heading 2">
            <IconButton size="small" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} color={editor.isActive('heading', { level: 2 }) ? 'primary' : 'inherit'}><Heading2 size={18}/></IconButton>
          </Tooltip>
          <Tooltip title="Heading 3">
            <IconButton size="small" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} color={editor.isActive('heading', { level: 3 }) ? 'primary' : 'inherit'}><Heading3 size={18}/></IconButton>
          </Tooltip>
        </Stack>

        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Bold">
            <IconButton size="small" onClick={() => editor.chain().focus().toggleBold().run()} color={editor.isActive('bold') ? 'primary' : 'inherit'}><Bold size={18}/></IconButton>
          </Tooltip>
          <Tooltip title="Italic">
            <IconButton size="small" onClick={() => editor.chain().focus().toggleItalic().run()} color={editor.isActive('italic') ? 'primary' : 'inherit'}><Italic size={18}/></IconButton>
          </Tooltip>
          <Tooltip title="Underline">
            <IconButton size="small" onClick={() => editor.chain().focus().toggleUnderline().run()} color={editor.isActive('underline') ? 'primary' : 'inherit'}><UnderlineIcon size={18}/></IconButton>
          </Tooltip>
          <Tooltip title="Strikethrough">
            <IconButton size="small" onClick={() => editor.chain().focus().toggleStrike().run()} color={editor.isActive('strike') ? 'primary' : 'inherit'}><Strikethrough size={18}/></IconButton>
          </Tooltip>
          <Tooltip title="Highlight">
            <IconButton size="small" onClick={() => editor.chain().focus().toggleHighlight().run()} color={editor.isActive('highlight') ? 'primary' : 'inherit'}><Highlighter size={18}/></IconButton>
          </Tooltip>
        </Stack>

        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Align Left">
            <IconButton size="small" onClick={() => editor.chain().focus().setTextAlign('left').run()} color={editor.isActive({ textAlign: 'left' }) ? 'primary' : 'inherit'}><AlignLeft size={18}/></IconButton>
          </Tooltip>
          <Tooltip title="Align Center">
            <IconButton size="small" onClick={() => editor.chain().focus().setTextAlign('center').run()} color={editor.isActive({ textAlign: 'center' }) ? 'primary' : 'inherit'}><AlignCenter size={18}/></IconButton>
          </Tooltip>
          <Tooltip title="Align Right">
            <IconButton size="small" onClick={() => editor.chain().focus().setTextAlign('right').run()} color={editor.isActive({ textAlign: 'right' }) ? 'primary' : 'inherit'}><AlignRight size={18}/></IconButton>
          </Tooltip>
          <Tooltip title="Align Justify">
            <IconButton size="small" onClick={() => editor.chain().focus().setTextAlign('justify').run()} color={editor.isActive({ textAlign: 'justify' }) ? 'primary' : 'inherit'}><AlignJustify size={18}/></IconButton>
          </Tooltip>
        </Stack>

        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Color">
            <IconButton size="small" onClick={() => {
              const color = prompt('Nhập mã màu (hex):', '#ff0000');
              if (color) editor.chain().focus().setColor(color).run();
            }}><Palette size={18}/></IconButton>
          </Tooltip>
          <Tooltip title="Subscript">
            <IconButton size="small" onClick={() => editor.chain().focus().toggleSubscript().run()} color={editor.isActive('subscript') ? 'primary' : 'inherit'}><ArrowDown size={18}/></IconButton>
          </Tooltip>
          <Tooltip title="Superscript">
            <IconButton size="small" onClick={() => editor.chain().focus().toggleSuperscript().run()} color={editor.isActive('superscript') ? 'primary' : 'inherit'}><ArrowUp size={18}/></IconButton>
          </Tooltip>
        </Stack>

        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Bullet List">
            <IconButton size="small" onClick={() => editor.chain().focus().toggleBulletList().run()} color={editor.isActive('bulletList') ? 'primary' : 'inherit'}><List size={18}/></IconButton>
          </Tooltip>
          <Tooltip title="Ordered List">
            <IconButton size="small" onClick={() => editor.chain().focus().toggleOrderedList().run()} color={editor.isActive('orderedList') ? 'primary' : 'inherit'}><ListOrdered size={18}/></IconButton>
          </Tooltip>
          <Tooltip title="Task List">
            <IconButton size="small" onClick={() => editor.chain().focus().toggleTaskList().run()} color={editor.isActive('taskList') ? 'primary' : 'inherit'}><CheckSquare size={18}/></IconButton>
          </Tooltip>
        </Stack>

        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Link">
            <IconButton size="small" onClick={() => {
              const url = prompt('Nhập địa chỉ link:');
              if (url) editor.chain().focus().setLink({ href: url }).run();
            }} color={editor.isActive('link') ? 'primary' : 'inherit'}><LinkIcon size={18}/></IconButton>
          </Tooltip>
          <Tooltip title="Table">
            <IconButton size="small" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}><TableIcon size={18}/></IconButton>
          </Tooltip>
          <Tooltip title="Image">
            <IconButton size="small" onClick={addImage}><ImageIcon size={18}/></IconButton>
          </Tooltip>
        </Stack>

        <Box sx={{ flexGrow: 1 }} />
      </Box>

      {/* Character Count & Stats */}
      <Box sx={{ 
        position: 'absolute', 
        bottom: 8, 
        right: 16, 
        display: 'flex', 
        gap: 2, 
        zIndex: 5,
        pointerEvents: 'none',
        opacity: 0.5
      }}>
        <MuiTypography variant="caption" sx={{ fontWeight: 700 }}>
          {editor.storage.characterCount.words()} TỪ
        </MuiTypography>
        <MuiTypography variant="caption" sx={{ fontWeight: 700 }}>
          {editor.storage.characterCount.characters()} KÝ TỰ
        </MuiTypography>
      </Box>

      {/* Bubble Menu for Selections */}
      <BubbleMenu editor={editor}>
        <Paper
          elevation={4}
          sx={{
            display: 'flex',
            p: 0.5,
            bgcolor: alpha(theme.palette.background.paper, 0.9),
            backdropFilter: 'blur(10px)',
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
            gap: 0.5
          }}
        >
          <IconButton 
            size="small" 
            onClick={() => editor.chain().focus().toggleBold().run()}
            color={editor.isActive('bold') ? 'primary' : 'inherit'}
          >
            <Bold size={16} />
          </IconButton>
          <IconButton 
            size="small" 
            onClick={() => editor.chain().focus().toggleItalic().run()}
            color={editor.isActive('italic') ? 'primary' : 'inherit'}
          >
            <Italic size={16} />
          </IconButton>
          <IconButton 
            size="small" 
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            color={editor.isActive('underline') ? 'primary' : 'inherit'}
          >
            <UnderlineIcon size={16} />
          </IconButton>
          <Divider orientation="vertical" flexItem />
          <IconButton 
            size="small" 
            onClick={() => {
              const url = prompt('Nhập địa chỉ link:');
              if (url) editor.chain().focus().setLink({ href: url }).run();
            }}
            color={editor.isActive('link') ? 'primary' : 'inherit'}
          >
            <LinkIcon size={16} />
          </IconButton>
          <IconButton 
            size="small" 
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            color={editor.isActive('highlight') ? 'primary' : 'inherit'}
          >
            <Highlighter size={16} />
          </IconButton>
        </Paper>
      </BubbleMenu>

      {/* Floating Menu for New Lines */}
      <FloatingMenu editor={editor}>
        <Paper
          elevation={4}
          sx={{
            display: 'flex',
            p: 0.5,
            bgcolor: alpha(theme.palette.background.paper, 0.9),
            backdropFilter: 'blur(10px)',
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
            gap: 0.5
          }}
        >
          <Tooltip title="Heading 2">
            <IconButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} color={editor.isActive('heading', { level: 2 }) ? 'primary' : 'inherit'}>
              <Heading2 size={18} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Heading 3">
            <IconButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} color={editor.isActive('heading', { level: 3 }) ? 'primary' : 'inherit'}>
              <Heading3 size={18} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Bullet List">
            <IconButton onClick={() => editor.chain().focus().toggleBulletList().run()} color={editor.isActive('bulletList') ? 'primary' : 'inherit'}>
              <List size={18} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Blockquote">
            <IconButton onClick={() => editor.chain().focus().toggleBlockquote().run()} color={editor.isActive('blockquote') ? 'primary' : 'inherit'}>
              <Quote size={18} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Code Block">
            <IconButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} color={editor.isActive('codeBlock') ? 'primary' : 'inherit'}>
              <SquareCode size={18} />
            </IconButton>
          </Tooltip>
          <Divider orientation="vertical" flexItem />
          <Tooltip title="Insert Image">
            <IconButton onClick={addImage}>
              <ImageIcon size={18} />
            </IconButton>
          </Tooltip>
          <Tooltip title="YouTube Video">
            <IconButton onClick={addYoutubeVideo}>
              <YouTubeIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Paper>
      </FloatingMenu>

      {/* Editor Main Area */}
      <Box 
        sx={{ 
          p: { xs: 2, md: 4 }, // Add padding inside the editor Area
          '& .prose-editor': {
            minHeight: 500,
            outline: 'none',
            '& p': {
              mb: 3, 
              lineHeight: 1.8, 
              fontSize: '1.2rem',
              fontFamily: tokens.typography.fontFamily.serif,
              color: 'text.primary',
              fontWeight: 400
            },
            '& h1, & h2, & h3, & h4': {
              color: 'text.primary',
              fontFamily: tokens.typography.fontFamily.serif,
              letterSpacing: '-0.02em',
              mb: 3,
              mt: 6,
              fontWeight: 800,
              lineHeight: 1.2
            },
            '& h1': { fontSize: '2.5rem' },
            '& h2': { fontSize: '2rem' },
            '& h3': { fontSize: '1.5rem' },
            '& blockquote': {
              borderLeft: '4px solid',
              borderColor: 'primary.main',
              pl: { xs: 3, md: 5 },
              py: 1,
              my: 6,
              fontStyle: 'italic',
              fontSize: '1.25rem',
              bgcolor: alpha(theme.palette.primary.main, 0.03),
              borderRadius: '0 8px 8px 0',
              color: alpha(theme.palette.text.primary, 0.8),
            },
            '& ul, & ol': {
              pl: 5,
              mb: 3,
              '& li': {
                mb: 1.5,
                lineHeight: 1.7,
                fontSize: '1.125rem',
                fontFamily: tokens.typography.fontFamily.serif,
              }
            },
            '& pre': {
              bgcolor: theme.palette.mode === 'dark' ? '#0d1117' : '#f8f9fa',
              color: theme.palette.mode === 'dark' ? '#e6edf3' : '#24292f',
              p: 0,
              borderRadius: '12px',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              my: 6,
              fontFamily: tokens.typography.fontFamily.mono,
              fontSize: '0.9rem',
              overflow: 'hidden',
              position: 'relative',
              boxShadow: theme.palette.mode === 'dark' 
                ? '0 10px 30px rgba(0,0,0,0.3)' 
                : '0 10px 30px rgba(0,0,0,0.05)',
              '& code': {
                display: 'block',
                p: '2.5rem 1.5rem 1.5rem',
                overflowX: 'auto',
                bgcolor: 'transparent',
                lineHeight: 1.6,
              },
              /* Language Label */
              '&::before': {
                content: 'attr(data-language)',
                position: 'absolute',
                top: 0,
                right: 0,
                px: 2,
                py: 0.75,
                fontSize: '0.65rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                color: 'primary.main',
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                borderBottomLeftRadius: '10px',
                zIndex: 2,
                letterSpacing: '0.05em'
              },
              /* Terminal dots decoration */
              '&::after': {
                content: '""',
                position: 'absolute',
                top: '14px',
                left: '16px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                bgcolor: '#ff5f56',
                boxShadow: '16px 0 0 #ffbd2e, 32px 0 0 #27c93f',
                opacity: 0.6
              },
              /* Syntax Highlighting Colors (GitHub Dark/Light inspired) */
              '& .hljs-comment, & .hljs-quote': { color: '#8b949e', fontStyle: 'italic' },
              '& .hljs-keyword, & .hljs-selector-tag': { color: '#ff7b72' },
              '& .hljs-string, & .hljs-attr, & .hljs-variable, & .hljs-template-variable': { color: '#a5d6ff' },
              '& .hljs-title, & .hljs-section, & .hljs-built_in, & .hljs-type': { color: '#d2a8ff' },
              '& .hljs-number, & .hljs-meta, & .hljs-tag': { color: '#79c0ff' },
              '& .hljs-function, & .hljs-class, & .hljs-title.function_': { color: '#d2a8ff' },
            },
            /* Copy Button Placeholder - Handled via pseudo-element for simplicity */
            '& pre .copy-code-btn': {
              position: 'absolute',
              top: '8px',
              right: '80px', // Offset from language label
              padding: '4px 8px',
              fontSize: '0.65rem',
              fontWeight: 800,
              color: 'text.secondary',
              bgcolor: alpha(theme.palette.background.paper, 0.5),
              backdropFilter: 'blur(4px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              borderRadius: '4px',
              cursor: 'pointer',
              opacity: 0,
              transition: 'all 0.2s ease',
              zIndex: 3,
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: 'primary.main',
              }
            },
            '& pre:hover .copy-code-btn': {
              opacity: 1,
            },
            '& pre .copy-code-btn.copied': {
              color: 'success.main',
              borderColor: 'success.main',
            },
            '& code': {
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: 'primary.main',
              px: 0.8,
              py: 0.2,
              borderRadius: '4px',
              fontSize: '0.9em',
              fontWeight: 500
            },
            '& img': {
              maxWidth: '100%',
              height: 'auto',
              my: 6,
              borderRadius: '12px',
              boxShadow: theme.shadows[10],
            },
            '& .ProseMirror-placeholder': {
              color: alpha(theme.palette.text.primary, 0.2),
              fontStyle: 'normal',
              pointerEvents: 'none',
              height: 0,
            },
            '& table': {
              borderCollapse: 'collapse',
              tableLayout: 'fixed',
              width: '100%',
              margin: '2rem 0',
              overflow: 'hidden',
              borderRadius: '8px',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              '& td, & th': {
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                boxSizing: 'border-box',
                minWidth: '1em',
                padding: '12px 16px',
                position: 'relative',
                verticalAlign: 'top',
                '& > *': {
                  mb: '0 !important',
                },
              },
              '& th': {
                fontWeight: 'bold',
                textAlign: 'left',
                bgcolor: alpha(theme.palette.primary.main, 0.05),
              },
            },
          }
        }}
      >
        <EditorContent editor={editor} />
      </Box>
    </Box>
  );
}
