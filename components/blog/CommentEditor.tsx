'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Image } from '@tiptap/extension-image';
import { Mention } from '@tiptap/extension-mention';
import { Placeholder } from '@tiptap/extension-placeholder';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { Underline } from '@tiptap/extension-underline';
import { Link } from '@tiptap/extension-link';
import {
  Box,
  alpha,
  useTheme,
  IconButton,
  Stack,
  Tooltip,
  Divider,
  CircularProgress,
  Button,
} from '@mui/material';
import { tokens } from '@/lib/theme-tokens';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import {
  Bold,
  Italic,
  Link as LinkIcon,
  List,
  Quote,
  Code,
  Image as ImageIcon,
} from 'lucide-react';
import { splitCommentContent, combineCommentContent } from '@/lib/comment-content';

interface CommentEditorProps {
  value: string;
  onChange: (content: string) => void;
  onSubmit?: (e: React.FormEvent) => void;
  isSubmitting?: boolean;
  placeholder?: string;
  disabled?: boolean;
  onUploadingChange?: (uploading: boolean) => void;
  autoFocus?: boolean;
}

const THUMB_SIZE = 88;

export default function CommentEditor({
  value,
  onChange,
  onSubmit,
  isSubmitting,
  placeholder,
  disabled,
  onUploadingChange,
  autoFocus,
}: CommentEditorProps) {
  const theme = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const initialRef = useRef<{ body: string; attachments: string[] } | null>(null);
  if (initialRef.current === null) {
    initialRef.current = splitCommentContent(value);
  }
  const initial = initialRef.current;
  const [attachments, setAttachments] = useState<string[]>(initial.attachments);

  const uploadRef = useRef<(file: File) => Promise<void>>(null);
  const attachmentsRef = useRef(attachments);
  useEffect(() => {
    attachmentsRef.current = attachments;
  }, [attachments]);

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    onUploadingChange?.(isUploading);
  }, [isUploading, onUploadingChange]);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Image.configure({ HTMLAttributes: { class: 'comment-image' } }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'comment-link' },
      }),
      Underline,
      Placeholder.configure({ placeholder: placeholder || 'Viết bình luận...' }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Mention.configure({ HTMLAttributes: { class: 'comment-mention' } }),
    ],
    content: initial.body,
    onUpdate: ({ editor }) => {
      onChangeRef.current(
        combineCommentContent(editor.getHTML(), attachmentsRef.current)
      );
    },
    editorProps: {
      attributes: { class: 'comment-prose focus:outline-none' },
      handlePaste: (_view, event) => {
        const items = Array.from(event.clipboardData?.items || []);
        const image = items.find((item) => item.type.startsWith('image/'));
        if (image) {
          const file = image.getAsFile();
          if (file) {
            uploadRef.current?.(file);
            return true;
          }
        }
        return false;
      },
      handleDrop: (_view, event, _slice, moved) => {
        if (!moved && event.dataTransfer?.files.length) {
          const file = event.dataTransfer.files[0];
          if (file.type.startsWith('image/')) {
            uploadRef.current?.(file);
            return true;
          }
        }
        return false;
      },
    },
  });

  const emitCombined = useCallback(
    (nextAttachments: string[]) => {
      const body = editor?.getHTML() ?? '';
      onChangeRef.current(combineCommentContent(body, nextAttachments));
    },
    [editor]
  );

  const handleImageUpload = useCallback(
    async (file: File) => {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (data.url) {
          const next = [...attachmentsRef.current, data.url as string];
          setAttachments(next);
          emitCombined(next);
        }
      } catch (error) {
        console.error('Upload failed', error);
      } finally {
        setIsUploading(false);
      }
    },
    [emitCombined]
  );

  useEffect(() => {
    uploadRef.current = handleImageUpload;
  }, [handleImageUpload]);

  const removeAttachment = useCallback(
    (src: string) => {
      const next = attachmentsRef.current.filter((s) => s !== src);
      setAttachments(next);
      emitCombined(next);
    },
    [emitCombined]
  );

  const addImage = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      if (input.files?.length) {
        handleImageUpload(input.files[0]);
      }
    };
    input.click();
  }, [handleImageUpload]);

  useEffect(() => {
    if (!editor || !autoFocus || disabled) return;
    const id = requestAnimationFrame(() => {
      editor.commands.focus('end');
      const dom = editor.view.dom as HTMLElement;
      dom.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
    });
    return () => cancelAnimationFrame(id);
  }, [editor, autoFocus, disabled]);

  // Sync content if changed externally (e.g., parent resets after submit)
  useEffect(() => {
    if (!editor) return;
    const parsed = splitCommentContent(value);
    if (parsed.body !== editor.getHTML()) {
      if (!(parsed.body === '' && editor.isEmpty)) {
        editor.commands.setContent(parsed.body);
      }
    }
    const same =
      parsed.attachments.length === attachmentsRef.current.length &&
      parsed.attachments.every((a, i) => a === attachmentsRef.current[i]);
    if (!same) {
      setAttachments(parsed.attachments);
    }
  }, [value, editor]);

  if (!isMounted || !editor) return null;

  const isEditorEmpty = editor.isEmpty;
  const canSubmit =
    !isSubmitting && !isUploading && (!isEditorEmpty || attachments.length > 0);

  return (
    <Box
      sx={{
        position: 'relative',
        transition: 'all 0.3s ease',
        opacity: disabled ? 0.6 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
      }}
    >
      {(attachments.length > 0 || isUploading) && (
        <Box
          sx={{
            px: 1.5,
            pt: 1,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          {attachments.map((src) => (
            <Box
              key={src}
              sx={{
                position: 'relative',
                width: THUMB_SIZE,
                height: THUMB_SIZE,
                borderRadius: 1.5,
                overflow: 'hidden',
                border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
                bgcolor: alpha(theme.palette.background.default, 0.5),
              }}
            >
              <Box
                component="img"
                src={src}
                alt=""
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
              <IconButton
                size="small"
                onClick={() => removeAttachment(src)}
                aria-label="Xoá ảnh"
                sx={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  width: 22,
                  height: 22,
                  bgcolor: alpha(theme.palette.common.black, 0.6),
                  color: 'common.white',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.common.black, 0.8),
                  },
                }}
              >
                <CloseRoundedIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Box>
          ))}
          {isUploading && (
            <Box
              sx={{
                width: THUMB_SIZE,
                height: THUMB_SIZE,
                borderRadius: 1.5,
                border: `1px dashed ${alpha(theme.palette.divider, 0.25)}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha(theme.palette.background.default, 0.5),
              }}
            >
              <CircularProgress size={22} />
            </Box>
          )}
        </Box>
      )}

      <Box
        sx={{
          minHeight: 120,
          transition: 'all 0.3s ease',
          '& .ProseMirror': {
            minHeight: 100,
            outline: 'none !important',
            padding: '12px 16px',
          },
        }}
      >
        <EditorContent editor={editor} />
      </Box>

      <Box
        sx={{
          height: 44,
          px: 1.5,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mt: 'auto',
        }}
      >
        <Stack direction="row" spacing={0.25} sx={{ ml: -0.5, alignItems: 'center' }}>
          <Tooltip title="Bold (Ctrl+B)">
            <IconButton size="small" onClick={() => editor.chain().focus().toggleBold().run()} color={editor.isActive('bold') ? 'primary' : 'inherit'} sx={{ borderRadius: 1.5, opacity: 0.7, '&:hover': { opacity: 1 } }}><Bold size={16}/></IconButton>
          </Tooltip>
          <Tooltip title="Italic (Ctrl+I)">
            <IconButton size="small" onClick={() => editor.chain().focus().toggleItalic().run()} color={editor.isActive('italic') ? 'primary' : 'inherit'} sx={{ borderRadius: 1.5, opacity: 0.7, '&:hover': { opacity: 1 } }}><Italic size={16}/></IconButton>
          </Tooltip>
          <Tooltip title="Quote">
            <IconButton size="small" onClick={() => editor.chain().focus().toggleBlockquote().run()} color={editor.isActive('blockquote') ? 'primary' : 'inherit'} sx={{ borderRadius: 1.5, opacity: 0.7, '&:hover': { opacity: 1 } }}><Quote size={16}/></IconButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 16, alignSelf: 'center', opacity: 0.1 }} />

          <Tooltip title="Code">
            <IconButton size="small" onClick={() => editor.chain().focus().toggleCode().run()} color={editor.isActive('code') ? 'primary' : 'inherit'} sx={{ borderRadius: 1.5, opacity: 0.7, '&:hover': { opacity: 1 } }}><Code size={16}/></IconButton>
          </Tooltip>
          <Tooltip title="Link">
            <IconButton size="small" onClick={() => {
              const url = prompt('Nhập link:');
              if (url) editor.chain().focus().setLink({ href: url }).run();
            }} color={editor.isActive('link') ? 'primary' : 'inherit'} sx={{ borderRadius: 1.5, opacity: 0.7, '&:hover': { opacity: 1 } }}><LinkIcon size={16}/></IconButton>
          </Tooltip>
          <Tooltip title="List">
            <IconButton size="small" onClick={() => editor.chain().focus().toggleBulletList().run()} color={editor.isActive('bulletList') ? 'primary' : 'inherit'} sx={{ borderRadius: 1.5, opacity: 0.7, '&:hover': { opacity: 1 } }}><List size={16}/></IconButton>
          </Tooltip>
          <Tooltip title={isUploading ? 'Đang tải ảnh…' : 'Đính kèm ảnh'}>
            <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <IconButton size="small" onClick={addImage} disabled={isUploading} sx={{ borderRadius: 1.5, opacity: 0.7, '&:hover': { opacity: 1 } }}>
                {isUploading ? <CircularProgress size={16} /> : <ImageIcon size={16}/>}
              </IconButton>
            </Box>
          </Tooltip>
        </Stack>

        <Stack direction="row" sx={{ alignItems: 'center' }}>
          {onSubmit && (
            <Button
              size="small"
              variant="contained"
              onClick={onSubmit}
              disabled={!canSubmit}
              endIcon={isSubmitting ? <CircularProgress size={14} color="inherit" /> : <SendRoundedIcon sx={{ fontSize: 14 }} />}
              sx={{
                borderRadius: '8px',
                px: 2,
                py: 0.5,
                textTransform: 'none',
                fontWeight: 800,
                fontSize: '0.8rem',
                minWidth: 80,
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
              }}
            >
              {isSubmitting ? '' : isUploading ? 'Đang tải…' : 'Đăng'}
            </Button>
          )}
        </Stack>
      </Box>

      <style jsx global>{`
        .comment-prose {
          font-family: inherit;
          font-size: 0.95rem;
          line-height: 1.6;
          color: ${theme.palette.text.primary};
          min-height: 80px;
        }
        .comment-prose:focus { outline: none !important; }
        .ProseMirror { outline: none !important; }
        .ProseMirror:focus { outline: none !important; }
        .comment-prose p { margin-bottom: 0.5rem; }
        .comment-prose blockquote {
          border-left: 3px solid ${alpha(theme.palette.primary.main, 0.3)};
          padding-left: 1rem;
          margin-left: 0;
          color: ${alpha(theme.palette.text.secondary, 0.8)};
          font-style: italic;
        }
        .comment-prose code {
          background: ${alpha(theme.palette.primary.main, 0.1)};
          color: ${theme.palette.primary.main};
          padding: 0.2rem 0.4rem;
          border-radius: 4px;
          font-size: 0.9em;
        }
        .comment-prose pre {
          background: ${theme.palette.mode === 'dark' ? '#0d1117' : '#f8f9fa'};
          color: ${theme.palette.mode === 'dark' ? '#e6edf3' : '#24292f'};
          padding: 2.5rem 1.25rem 1.25rem;
          border-radius: 12px;
          margin: 1.5rem 0;
          overflow-x: auto;
          border: 1px solid ${alpha(theme.palette.divider, 0.1)};
          font-family: ${tokens.typography.fontFamily.mono};
          font-size: 0.85rem;
          position: relative;
        }
        .comment-prose pre::before {
          content: "";
          position: absolute;
          top: 12px;
          left: 12px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #ff5f56;
          box-shadow: 15px 0 0 #ffbd2e, 30px 0 0 #27c93f;
          opacity: 0.6;
        }
        .comment-image {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 1rem 0;
        }
        .comment-mention {
          color: ${theme.palette.primary.main};
          font-weight: 700;
          background: ${alpha(theme.palette.primary.main, 0.1)};
          padding: 0.1rem 0.3rem;
          border-radius: 4px;
        }
        .comment-prose ul, .comment-prose ol {
          padding-left: 1.5rem;
          margin-bottom: 1rem;
        }
        .comment-prose li { margin-bottom: 0.25rem; }
        .comment-prose .ProseMirror-placeholder {
          color: ${alpha(theme.palette.text.secondary, 0.3)};
          pointer-events: none;
          height: 0;
        }
      `}</style>
    </Box>
  );
}
