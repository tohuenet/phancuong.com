'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  alpha,
  useTheme,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Collapse,
  Chip,
} from '@mui/material';
import { useSession, signIn } from 'next-auth/react';
import dynamic from 'next/dynamic';
const CommentEditor = dynamic(() => import('./CommentEditor'), { ssr: false });
import { motion, AnimatePresence } from 'framer-motion';
import { useFeedback } from '@/components/Providers/FeedbackProvider';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import GoogleIcon from '@mui/icons-material/Google';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ForumRoundedIcon from '@mui/icons-material/ForumRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import { tokens } from '@/lib/theme-tokens';
import ImageLightbox from '@/components/common/ImageLightbox';

interface EditHistory {
  content: string;
  editedAt: string;
}

interface Comment {
  id: string;
  parentId: string | null;
  authorName: string;
  authorEmail: string;
  authorImage: string | null;
  content: string;
  originalContent?: string;
  editHistory?: EditHistory[];
  ip?: string;
  createdAt: string;
  updatedAt: string;
}

interface CommentSectionProps {
  postSlug: string;
}

// Seeded hue generator so each author gets a stable avatar color.
function stringToHue(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(h, 31) + s.charCodeAt(i)) | 0;
  return Math.abs(h) % 360;
}

function AuthorAvatar({
  name,
  image,
  size = 36,
}: {
  name: string;
  image?: string | null;
  size?: number;
}) {
  if (image) {
    return (
      <Box
        component="img"
        src={image}
        alt={name}
        sx={{
          width: size,
          height: size,
          borderRadius: '50%',
          objectFit: 'cover',
          flexShrink: 0,
        }}
      />
    );
  }
  const letter = (name || '?').trim().charAt(0).toUpperCase() || '?';
  const hue = stringToHue(name || 'anon');
  return (
    <Box
      aria-hidden
      sx={{
        width: size,
        height: size,
        borderRadius: '50%',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontWeight: 700,
        fontSize: size * 0.42,
        lineHeight: 1,
        letterSpacing: '-0.02em',
        background: `linear-gradient(135deg, hsl(${hue} 72% 55%), hsl(${(hue + 38) % 360} 72% 42%))`,
        boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.16)`,
        userSelect: 'none',
      }}
    >
      {letter}
    </Box>
  );
}

export default function CommentSection({ postSlug }: CommentSectionProps) {
  const { data: session } = useSession();
  const theme = useTheme();
  const { confirm, notify } = useFeedback();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [expandedAdminId, setExpandedAdminId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [, setMainUploading] = useState(false);
  const [editUploading, setEditUploading] = useState(false);
  const [replyUploading, setReplyUploading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAdmin = mounted && (session?.user as { isAdmin?: boolean })?.isAdmin === true;

  const threadedComments = useMemo(() => {
    const mainComments = comments.filter((c) => !c.parentId);
    const replies = comments.filter((c) => c.parentId);
    return mainComments
      .map((parent) => ({
        ...parent,
        replies: replies
          .filter((r) => r.parentId === parent.id)
          .sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          ),
      }))
      .sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [comments]);

  const fetchComments = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/blog/${postSlug}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (err) {
      console.error('Failed to fetch comments');
    } finally {
      setLoading(false);
    }
  }, [postSlug]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleReplyClick = (comment: Comment) => {
    setReplyToId(replyToId === comment.id ? null : comment.id);
    setReplyContent(
      `<p><span data-type="mention" data-id="${comment.authorName}">@${comment.authorName}</span> </p>`
    );
  };

  const handleSubmit = async (e: React.FormEvent, parentId: string | null = null) => {
    e.preventDefault();
    const content = parentId ? replyContent : newComment;
    if (!content.trim()) return;

    const currentSubmittingId = parentId ? `reply-${replyToId}` : 'main';
    setSubmittingId(currentSubmittingId);
    setError(null);

    try {
      const targetComment = comments.find((c) => c.id === parentId);
      const rootParentId = targetComment?.parentId || parentId;

      const res = await fetch(`/api/blog/${postSlug}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, parentId: rootParentId }),
      });

      if (res.ok) {
        const created = await res.json();
        setComments((prev) => [created, ...prev]);
        notify('Đã đăng bình luận thành công!', 'success');
        if (rootParentId) {
          setReplyToId(null);
          setReplyContent('');
        } else {
          setNewComment('');
        }
      } else {
        const data = await res.json();
        const msg = data.error || 'Không thể đăng bình luận.';
        setError(msg);
        notify(msg, 'error');
      }
    } catch (err) {
      const msg = 'Đã có lỗi xảy ra. Vui lòng thử lại.';
      setError(msg);
      notify(msg, 'error');
    } finally {
      setSubmittingId(null);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editContent.trim()) return;
    setSubmittingId(id);
    try {
      const res = await fetch(`/api/blog/${postSlug}/comments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent }),
      });
      if (res.ok) {
        const updated = await res.json();
        setComments(comments.map((c) => (c.id === id ? updated : c)));
        setEditingId(null);
        notify('Đã cập nhật bình luận.', 'success');
      }
    } catch (err) {
      notify('Không thể cập nhật bình luận.', 'error');
    } finally {
      setSubmittingId(null);
    }
  };

  const allCommentImages = useMemo(() => {
    const srcs: string[] = [];
    for (const c of comments) {
      const matches = (c.content || '').matchAll(
        /<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi
      );
      for (const m of matches) srcs.push(m[1]);
    }
    return srcs;
  }, [comments]);

  const handleContentClick = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement;
      if (
        target instanceof HTMLImageElement &&
        (target.classList.contains('comment-image') ||
          target.classList.contains('comment-attachment'))
      ) {
        e.preventDefault();
        const idx = allCommentImages.indexOf(target.getAttribute('src') || '');
        setLightboxImages(allCommentImages);
        setLightboxIndex(idx >= 0 ? idx : 0);
        setLightboxOpen(true);
      }
    },
    [allCommentImages]
  );

  const handleDelete = async (id: string) => {
    const isConfirmed = await confirm({
      message: 'Bạn có chắc chắn muốn xóa bình luận này? Hành động này không thể hoàn tác.',
      severity: 'error',
      confirmText: 'Xóa ngay',
      cancelText: 'Để sau',
    });

    if (!isConfirmed) return;

    try {
      const res = await fetch(`/api/blog/${postSlug}/comments/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setComments(comments.filter((c) => c.id !== id && c.parentId !== id));
        notify('Đã xóa bình luận thành công.', 'success');
      } else {
        const data = await res.json();
        notify(data.error || 'Không thể xóa bình luận.', 'error');
      }
    } catch (err) {
      notify('Đã xảy ra lỗi khi xóa bình luận.', 'error');
    }
  };

  // Shared style for content area — constrains all rich-text children so
  // images, code blocks, quotes, attachments and long tokens never break the
  // column width regardless of how much the user pastes in.
  const contentSx = (isReply: boolean) => ({
    mt: 0.5,
    color: 'text.primary',
    fontSize: isReply ? '0.9rem' : '0.95rem',
    lineHeight: 1.65,
    wordBreak: 'break-word' as const,
    overflowWrap: 'anywhere' as const,
    '& p': { mb: 1, '&:last-child': { mb: 0 } },
    '& a.comment-link, & a': {
      color: 'primary.main',
      textDecoration: 'none',
      borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
      transition: 'border-color 0.2s',
      '&:hover': { borderBottomColor: theme.palette.primary.main },
    },
    '& .comment-mention': {
      color: 'primary.main',
      fontWeight: 700,
      bgcolor: alpha(theme.palette.primary.main, 0.08),
      px: 0.75,
      py: 0.15,
      borderRadius: '999px',
      textDecoration: 'none',
      fontSize: '0.85em',
    },
    '& .comment-image': {
      maxWidth: 160,
      maxHeight: 160,
      width: 'auto',
      height: 'auto',
      objectFit: 'cover',
      borderRadius: 1.5,
      my: 1,
      mr: 1,
      display: 'inline-block',
      verticalAlign: 'top',
      cursor: 'zoom-in',
      border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
      transition: 'transform 0.2s ease',
      '&:hover': { transform: 'scale(1.02)' },
    },
    '& .comment-attachments': {
      mt: 1.25,
      display: 'grid',
      gridTemplateColumns: {
        xs: 'repeat(3, 1fr)',
        sm: 'repeat(auto-fill, minmax(112px, 1fr))',
      },
      gap: 0.75,
      maxWidth: 420,
    },
    '& .comment-attachment': {
      width: '100%',
      aspectRatio: '1 / 1',
      height: 'auto',
      objectFit: 'cover',
      borderRadius: 1.5,
      cursor: 'zoom-in',
      border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      '&:hover': {
        transform: 'scale(1.02)',
        boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.25)}`,
      },
    },
    '& blockquote': {
      borderLeft: `3px solid ${alpha(theme.palette.primary.main, 0.35)}`,
      pl: 1.5,
      py: 0.25,
      my: 1,
      fontStyle: 'italic',
      color: alpha(theme.palette.text.primary, 0.75),
    },
    '& pre': {
      my: 1.25,
      p: 1.5,
      borderRadius: 2,
      bgcolor: theme.palette.mode === 'dark' ? '#0d1117' : '#f6f8fa',
      color: theme.palette.mode === 'dark' ? '#e6edf3' : '#24292f',
      border: `1px solid ${alpha(theme.palette.divider, 0.18)}`,
      fontFamily: tokens.typography.fontFamily.mono,
      fontSize: '0.82rem',
      lineHeight: 1.55,
      maxHeight: 360,
      overflow: 'auto',
      whiteSpace: 'pre',
    },
    '& code': {
      fontFamily: tokens.typography.fontFamily.mono,
      fontSize: '0.88em',
      bgcolor: alpha(theme.palette.primary.main, 0.08),
      color: 'primary.main',
      px: 0.65,
      py: 0.15,
      borderRadius: 0.75,
    },
    '& pre code': {
      bgcolor: 'transparent',
      color: 'inherit',
      p: 0,
      borderRadius: 0,
      fontSize: 'inherit',
    },
    '& ul, & ol': { pl: 2.5, my: 1 },
    '& li': { mb: 0.25 },
  });

  // Small text-action button (M3 ghost text button with subtle hover wash).
  const TextAction = ({
    children,
    onClick,
    tone = 'neutral',
  }: {
    children: React.ReactNode;
    onClick: () => void;
    tone?: 'neutral' | 'danger' | 'primary';
  }) => {
    const color =
      tone === 'danger'
        ? theme.palette.error.main
        : tone === 'primary'
        ? theme.palette.primary.main
        : theme.palette.text.secondary;
    return (
      <Button
        size="small"
        onClick={onClick}
        disableRipple
        sx={{
          minWidth: 0,
          px: 1,
          py: 0.25,
          height: 26,
          fontSize: '0.75rem',
          fontWeight: 700,
          letterSpacing: '0.01em',
          textTransform: 'none',
          color,
          borderRadius: '999px',
          bgcolor: 'transparent',
          '&:hover': {
            bgcolor: alpha(color, 0.1),
          },
        }}
      >
        {children}
      </Button>
    );
  };

  const renderComment = (comment: any, isReply: boolean = false) => {
    const isOwner = session?.user?.email === comment.authorEmail;
    const isEditing = editingId === comment.id;
    const isEdited = comment.editHistory && comment.editHistory.length > 0;
    const isReplying = replyToId === comment.id;

    return (
      <motion.article
        key={comment.id}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
        style={{ display: 'block' }}
      >
        <Box
          sx={{
            display: 'flex',
            gap: isReply ? 1.5 : 2,
            alignItems: 'flex-start',
            // Reveal edit/delete on hover/focus only, keep Reply always visible.
            '&:hover .comment-hover-actions, &:focus-within .comment-hover-actions': {
              opacity: 1,
              pointerEvents: 'auto',
            },
          }}
        >
          <AuthorAvatar
            name={comment.authorName}
            image={comment.authorImage}
            size={isReply ? 28 : 36}
          />

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: 'baseline', flexWrap: 'wrap', rowGap: 0.25, mb: 0.25 }}
            >
              <Typography
                component="span"
                sx={{
                  fontWeight: 700,
                  fontSize: isReply ? '0.85rem' : '0.92rem',
                  color: 'text.primary',
                  letterSpacing: '-0.005em',
                }}
              >
                {comment.authorName}
              </Typography>
              <Typography
                component="span"
                sx={{
                  fontSize: '0.72rem',
                  color: 'text.secondary',
                  opacity: 0.7,
                }}
                suppressHydrationWarning
              >
                ·{' '}
                {formatDistanceToNow(new Date(comment.createdAt), {
                  addSuffix: true,
                  locale: vi,
                }).replace(/^khoảng\s/, '')}
              </Typography>
              {isEdited && (
                <Typography
                  component="span"
                  sx={{
                    fontSize: '0.7rem',
                    color: 'text.secondary',
                    opacity: 0.55,
                    fontStyle: 'italic',
                  }}
                >
                  · đã chỉnh sửa
                </Typography>
              )}
            </Stack>

            {isEditing ? (
              <Box sx={{ mt: 1 }}>
                <Box
                  sx={{
                    borderRadius: 2.5,
                    bgcolor: alpha(theme.palette.background.paper, 0.4),
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
                    backdropFilter: 'blur(16px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(16px) saturate(180%)',
                    overflow: 'hidden',
                  }}
                >
                  <CommentEditor
                    value={editContent}
                    onChange={setEditContent}
                    onUploadingChange={setEditUploading}
                    placeholder="Chỉnh sửa bình luận..."
                    autoFocus
                  />
                </Box>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ mt: 1, justifyContent: 'flex-end' }}
                >
                  <Button
                    size="small"
                    onClick={() => setEditingId(null)}
                    sx={{ textTransform: 'none', borderRadius: '999px' }}
                  >
                    Huỷ
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    disableElevation
                    disabled={
                      submittingId === comment.id ||
                      editUploading ||
                      !editContent.trim()
                    }
                    onClick={() => handleUpdate(comment.id)}
                    sx={{
                      borderRadius: '999px',
                      textTransform: 'none',
                      px: 2.5,
                      fontWeight: 700,
                    }}
                  >
                    {submittingId === comment.id ? (
                      <CircularProgress size={14} color="inherit" />
                    ) : editUploading ? (
                      'Đang tải…'
                    ) : (
                      'Lưu thay đổi'
                    )}
                  </Button>
                </Stack>
              </Box>
            ) : (
              <Box
                className="comment-content-renderer"
                onClick={handleContentClick}
                sx={contentSx(isReply)}
                dangerouslySetInnerHTML={{ __html: comment.content }}
              />
            )}

            {!isEditing && (
              <Stack
                direction="row"
                spacing={0.25}
                sx={{ alignItems: 'center', mt: 0.75, ml: -1 }}
              >
                {session && (
                  <TextAction
                    tone={isReplying ? 'primary' : 'neutral'}
                    onClick={() => handleReplyClick(comment)}
                  >
                    {isReplying ? 'Đang trả lời…' : 'Trả lời'}
                  </TextAction>
                )}

                <Box
                  className="comment-hover-actions"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.25,
                    opacity: { xs: 1, md: 0 },
                    pointerEvents: { xs: 'auto', md: 'none' },
                    transition: 'opacity 0.2s ease',
                  }}
                >
                  {isOwner && (
                    <TextAction
                      onClick={() => {
                        setEditingId(comment.id);
                        setEditContent(comment.content);
                      }}
                    >
                      Sửa
                    </TextAction>
                  )}
                  {(isOwner || isAdmin) && (
                    <TextAction tone="danger" onClick={() => handleDelete(comment.id)}>
                      Xoá
                    </TextAction>
                  )}
                  {isAdmin && (
                    <Tooltip title="Xem thông tin quản trị">
                      <IconButton
                        size="small"
                        onClick={() =>
                          setExpandedAdminId(
                            expandedAdminId === comment.id ? null : comment.id
                          )
                        }
                        sx={{
                          width: 26,
                          height: 26,
                          color:
                            expandedAdminId === comment.id
                              ? 'primary.main'
                              : 'text.secondary',
                          bgcolor:
                            expandedAdminId === comment.id
                              ? alpha(theme.palette.primary.main, 0.1)
                              : 'transparent',
                          '&:hover': {
                            bgcolor: alpha(theme.palette.primary.main, 0.12),
                            color: 'primary.main',
                          },
                        }}
                      >
                        <InfoOutlinedIcon sx={{ fontSize: 15 }} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </Stack>
            )}

            {isAdmin && (
              <Collapse in={expandedAdminId === comment.id} unmountOnExit>
                <Box
                  sx={{
                    mt: 1.5,
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                    border: `1px dashed ${alpha(theme.palette.primary.main, 0.25)}`,
                    fontSize: '0.72rem',
                    lineHeight: 1.6,
                    color: 'text.secondary',
                  }}
                >
                  <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
                    <Box>
                      <strong>Email:</strong> {comment.authorEmail}
                    </Box>
                    {comment.ip && (
                      <Box>
                        <strong>IP:</strong> {comment.ip}
                      </Box>
                    )}
                  </Stack>
                  {isEdited && comment.originalContent && (
                    <Box sx={{ mt: 1, color: 'primary.main' }}>
                      <strong>Nội dung gốc:</strong>{' '}
                      <Box
                        component="span"
                        sx={{ color: 'text.primary', opacity: 0.75 }}
                        dangerouslySetInnerHTML={{
                          __html: comment.originalContent,
                        }}
                      />
                    </Box>
                  )}
                </Box>
              </Collapse>
            )}

            {/* Reply composer (appears under the targeted comment) */}
            <Collapse in={isReplying} unmountOnExit>
              <Box
                sx={{
                  mt: 1.5,
                  borderRadius: 2.5,
                  bgcolor: alpha(theme.palette.background.paper, 0.4),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
                  backdropFilter: 'blur(16px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(16px) saturate(180%)',
                  overflow: 'hidden',
                }}
              >
                <CommentEditor
                  value={replyContent}
                  onChange={setReplyContent}
                  onUploadingChange={setReplyUploading}
                  placeholder={`Trả lời ${comment.authorName}…`}
                  disabled={submittingId === `reply-${comment.id}`}
                  autoFocus
                />
              </Box>
              <Stack
                direction="row"
                spacing={1}
                sx={{ mt: 1, justifyContent: 'flex-end' }}
              >
                <Button
                  size="small"
                  onClick={() => setReplyToId(null)}
                  sx={{ textTransform: 'none', borderRadius: '999px' }}
                >
                  Huỷ
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  disableElevation
                  disabled={
                    submittingId === `reply-${comment.id}` ||
                    replyUploading ||
                    !replyContent.trim() ||
                    replyContent === '<p></p>'
                  }
                  onClick={(e) => handleSubmit(e, comment.id)}
                  sx={{
                    borderRadius: '999px',
                    textTransform: 'none',
                    px: 2.5,
                    fontWeight: 700,
                  }}
                >
                  {submittingId === `reply-${comment.id}` ? (
                    <CircularProgress size={14} color="inherit" />
                  ) : replyUploading ? (
                    'Đang tải…'
                  ) : (
                    'Gửi phản hồi'
                  )}
                </Button>
              </Stack>
            </Collapse>

            {/* Replies — single-level thread with a connector rail. */}
            {!isReply && comment.replies && comment.replies.length > 0 && (
              <Box
                sx={{
                  mt: 2,
                  pl: { xs: 1.5, sm: 2.5 },
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: 4,
                    bottom: 4,
                    width: '2px',
                    borderRadius: '2px',
                    background: `linear-gradient(180deg, ${alpha(
                      theme.palette.primary.main,
                      0.2
                    )}, ${alpha(theme.palette.primary.main, 0.02)})`,
                  },
                }}
              >
                <Stack spacing={2.5}>
                  {comment.replies.map((reply: any) => renderComment(reply, true))}
                </Stack>
              </Box>
            )}
          </Box>
        </Box>
      </motion.article>
    );
  };

  const commentCount = comments.length;

  return (
    <Box sx={{ mt: 10, mb: 10 }}>
      {/* Section header — M3 display-small with a quiet count chip. */}
      <Stack
        direction="row"
        spacing={1.25}
        sx={{
          alignItems: 'center',
          mb: 3,
          pb: 2,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
        }}
      >
        <ForumRoundedIcon
          sx={{ color: 'primary.main', fontSize: 22, opacity: 0.9 }}
        />
        <Typography
          variant="h5"
          sx={{
            fontWeight: 800,
            fontFamily: tokens.typography.fontFamily.serif,
            fontSize: '1.15rem',
            letterSpacing: '-0.01em',
            color: 'text.primary',
          }}
        >
          Ý kiến
        </Typography>
        <Chip
          label={commentCount}
          size="small"
          sx={{
            height: 22,
            fontSize: '0.72rem',
            fontWeight: 700,
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            color: 'primary.main',
            border: 'none',
          }}
        />
        <Box sx={{ flex: 1 }} />
        {mounted && session && (
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', opacity: 0.6, fontSize: '0.72rem' }}
          >
            Đang đăng nhập là <strong>{session.user?.name}</strong>
          </Typography>
        )}
      </Stack>

      {/* Composer — liquid glass surface with stronger focus state. */}
      <Box
        sx={{
          mb: 5,
          borderRadius: 3,
          overflow: 'hidden',
          bgcolor: alpha(theme.palette.background.paper, 0.45),
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          transition:
            'border-color 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease',
          '&:focus-within': {
            bgcolor: alpha(theme.palette.background.paper, 0.6),
            borderColor: alpha(theme.palette.primary.main, 0.2),
            boxShadow: `0 16px 48px -20px ${alpha(
              theme.palette.primary.main,
              0.35
            )}`,
          },
        }}
      >
        {!mounted ? null : session ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(e);
            }}
          >
            <Stack
              direction="row"
              spacing={1.5}
              sx={{ alignItems: 'flex-start', p: { xs: 1.25, sm: 1.75 } }}
            >
              <Box sx={{ pt: 1 }}>
                <AuthorAvatar
                  name={session.user?.name || 'Bạn'}
                  image={session.user?.image}
                  size={36}
                />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <CommentEditor
                  value={newComment}
                  onChange={setNewComment}
                  onSubmit={(e) => {
                    e?.preventDefault();
                    handleSubmit(e);
                  }}
                  onUploadingChange={setMainUploading}
                  isSubmitting={submittingId === 'main'}
                  placeholder="Viết một ý kiến ngắn gọn, lịch sự…"
                  disabled={submittingId === 'main'}
                />
                {error && (
                  <Alert severity="error" sx={{ mt: 1.5, borderRadius: 2 }}>
                    {error}
                  </Alert>
                )}
              </Box>
            </Stack>
          </form>
        ) : (
          <Stack
            spacing={1.25}
            sx={{ alignItems: 'center', py: 4, px: 2, textAlign: 'center' }}
          >
            <ChatBubbleOutlineRoundedIcon
              sx={{ fontSize: 32, color: 'primary.main', opacity: 0.7 }}
            />
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', maxWidth: 320 }}
            >
              Đăng nhập bằng Google để chia sẻ suy nghĩ của bạn cho bài viết này.
            </Typography>
            <Button
              variant="contained"
              disableElevation
              startIcon={<GoogleIcon />}
              onClick={() => signIn('google')}
              sx={{
                mt: 0.5,
                borderRadius: '999px',
                px: 3,
                textTransform: 'none',
                fontWeight: 700,
              }}
            >
              Đăng nhập với Google
            </Button>
          </Stack>
        )}
      </Box>

      {/* Comments list */}
      <AnimatePresence mode="popLayout">
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress size={22} />
          </Box>
        ) : threadedComments.length > 0 ? (
          <Stack spacing={4.5}>
            {threadedComments.map((comment) => renderComment(comment))}
          </Stack>
        ) : (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
              px: 3,
              borderRadius: 3,
              border: `1px dashed ${alpha(theme.palette.divider, 0.25)}`,
              color: 'text.secondary',
            }}
          >
            <ChatBubbleOutlineRoundedIcon
              sx={{ fontSize: 28, opacity: 0.5, mb: 1 }}
            />
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              Chưa có ý kiến nào. Hãy là người đầu tiên chia sẻ!
            </Typography>
          </Box>
        )}
      </AnimatePresence>

      <ImageLightbox
        images={lightboxImages}
        currentIndex={lightboxIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNavigate={(i) => setLightboxIndex(i)}
      />
    </Box>
  );
}
