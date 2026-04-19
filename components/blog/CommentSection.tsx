'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Avatar, 
  Stack, 
  alpha, 
  useTheme,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Collapse,
} from '@mui/material';
import { useSession, signIn } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import GoogleIcon from '@mui/icons-material/Google';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import ReplyRoundedIcon from '@mui/icons-material/ReplyRounded';
import { tokens } from '@/lib/theme-tokens';

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

export default function CommentSection({ postSlug }: CommentSectionProps) {
  const { data: session } = useSession();
  const theme = useTheme();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Scoped loading states
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  // States for editing & replies
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [expandedAdminId, setExpandedAdminId] = useState<string | null>(null);

  const isAdmin = (session?.user as any)?.isAdmin === true;

  // Organize comments into threads (Facebook Style: Level 1 Indentation)
  const threadedComments = useMemo(() => {
    const mainComments = comments.filter(c => !c.parentId);
    const replies = comments.filter(c => c.parentId);
    
    return mainComments.map(parent => ({
      ...parent,
      replies: replies
        .filter(r => r.parentId === parent.id)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [comments]);

  useEffect(() => {
    fetchComments();
  }, [postSlug]);

  const fetchComments = async () => {
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
  };

  const handleReplyClick = (comment: Comment) => {
    // If it's already a reply, we still point to the same root parentId
    const targetParentId = comment.parentId || comment.id;
    setReplyToId(replyToId === comment.id ? null : comment.id);
    
    // Facebook style: Prepend @author if replying to a child comment
    if (comment.parentId) {
      setReplyContent(`@${comment.authorName} `);
    } else {
      setReplyContent('');
    }
  };

  const handleSubmit = async (e: React.FormEvent, parentId: string | null = null) => {
    e.preventDefault();
    const content = parentId ? replyContent : newComment;
    if (!content.trim()) return;

    const currentSubmittingId = parentId ? `reply-${replyToId}` : 'main';
    setSubmittingId(currentSubmittingId);
    setError(null);

    try {
      // Find root parent ID if replying to a child
      const targetComment = comments.find(c => c.id === parentId);
      const rootParentId = targetComment?.parentId || parentId;

      const res = await fetch(`/api/blog/${postSlug}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, parentId: rootParentId }),
      });

      if (res.ok) {
        const created = await res.json();
        setComments(prev => [created, ...prev]);
        if (rootParentId) {
          setReplyToId(null);
          setReplyContent('');
        } else {
          setNewComment('');
        }
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to post comment');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
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
        setComments(comments.map(c => c.id === id ? updated : c));
        setEditingId(null);
      }
    } catch (err) {
      setError('Failed to update comment');
    } finally {
      setSubmittingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    try {
      const res = await fetch(`/api/blog/${postSlug}/comments/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setComments(comments.filter(c => c.id !== id && c.parentId !== id));
      }
    } catch (err) {
      setError('Failed to delete comment');
    }
  };

  // Helper to render a comment item
  const renderComment = (comment: any, isReply: boolean = false) => {
    const isOwner = session?.user?.email === comment.authorEmail;
    const isEditing = editingId === comment.id;
    const isEdited = comment.editHistory && comment.editHistory.length > 0;
    const isReplying = replyToId === comment.id;

    // Detect if content starts with a mention to style it
    const mentionMatch = comment.content.match(/^@([^ ]+)/);
    const hasMention = !!mentionMatch;
    const contentBody = hasMention ? comment.content.slice(mentionMatch[0].length) : comment.content;

    return (
      <motion.div
        key={comment.id}
        initial={{ opacity: 0, x: isReply ? 10 : 0, y: 10 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
      >
        <Stack direction="row" spacing={2} sx={{ position: 'relative' }}>
          {isReply && (
            <Box 
              sx={{ 
                position: 'absolute', 
                left: -24, 
                top: 0, 
                bottom: 20, 
                width: 2, 
                bgcolor: alpha(theme.palette.divider, 0.05),
                '&:after': {
                  content: '""',
                  position: 'absolute',
                  left: 0,
                  top: 20,
                  width: 12,
                  height: 2,
                  bgcolor: alpha(theme.palette.divider, 0.05),
                }
              }} 
            />
          )}
          <Avatar 
            sx={{ 
              width: isReply ? 32 : 40, height: isReply ? 32 : 40, 
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: 'primary.main',
              fontSize: isReply ? '0.8rem' : '1rem',
              fontWeight: 800,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`
            }}
          >
            {comment.authorName.charAt(0)}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'baseline', mb: 0.5, justifyContent: 'space-between' }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'baseline' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary', fontSize: isReply ? '0.85rem' : '0.95rem' }}>
                  {comment.authorName}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', opacity: 0.4 }}>
                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: vi })}
                </Typography>
                {isEdited && (
                  <Typography variant="caption" sx={{ color: 'text.secondary', opacity: 0.3, fontStyle: 'italic' }}>
                    (đã chỉnh sửa)
                  </Typography>
                )}
              </Stack>
              
              <Stack direction="row" spacing={0.5}>
                {session && (
                  <Tooltip title="Trả lời">
                    <IconButton 
                      size="small" 
                      onClick={() => handleReplyClick(comment)}
                      sx={{ opacity: 0.4, '&:hover': { opacity: 1, color: 'primary.main' } }}
                    >
                      <ReplyRoundedIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                )}
                {isOwner && (
                  <Tooltip title="Chỉnh sửa">
                    <IconButton 
                      size="small" 
                      onClick={() => {
                        setEditingId(comment.id);
                        setEditContent(comment.content);
                      }}
                      sx={{ opacity: 0.4, '&:hover': { opacity: 1, color: 'primary.main' } }}
                    >
                      <EditRoundedIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                )}
                {(isOwner || isAdmin) && (
                  <Tooltip title="Xóa">
                    <IconButton 
                      size="small" 
                      onClick={() => handleDelete(comment.id)}
                      sx={{ opacity: 0.4, '&:hover': { opacity: 1, color: 'error.main' } }}
                    >
                      <DeleteRoundedIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                )}
                {isAdmin && (
                  <Tooltip title="Quản trị">
                    <IconButton 
                      size="small" 
                      onClick={() => setExpandedAdminId(expandedAdminId === comment.id ? null : comment.id)}
                      sx={{ color: 'primary.main', opacity: expandedAdminId === comment.id ? 1 : 0.4 }}
                    >
                      <InfoOutlinedIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                )}
              </Stack>
            </Stack>

            {isEditing ? (
              <Box sx={{ mt: 1 }}>
                <TextField
                  fullWidth
                  multiline
                  variant="standard"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  slotProps={{ input: { sx: { fontSize: '0.95rem' } } }}
                />
                <Stack direction="row" spacing={1} sx={{ mt: 1, justifyContent: 'flex-end' }}>
                  <Button size="small" onClick={() => setEditingId(null)} sx={{ textTransform: 'none' }}>Hủy</Button>
                  <Button 
                    size="small" 
                    variant="contained" 
                    disabled={submittingId === comment.id}
                    onClick={() => handleUpdate(comment.id)} 
                    sx={{ borderRadius: '6px', textTransform: 'none' }}
                  >
                    {submittingId === comment.id ? <CircularProgress size={16} color="inherit" /> : 'Lưu'}
                  </Button>
                </Stack>
              </Box>
            ) : (
              <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6, whiteSpace: 'pre-wrap', fontSize: isReply ? '0.9rem' : '0.95rem' }}>
                {hasMention && (
                  <Box component="span" sx={{ color: 'primary.main', fontWeight: 700, mr: 0.5 }}>
                    {mentionMatch[0]}
                  </Box>
                )}
                {contentBody}
              </Typography>
            )}

            {/* Reply Input */}
            <Collapse in={isReplying}>
              <Box sx={{ mt: 2, pl: 2, borderLeft: `2px solid ${alpha(theme.palette.primary.main, 0.2)}` }}>
                <TextField
                  fullWidth
                  multiline
                  placeholder="Viết phản hồi..."
                  variant="standard"
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  slotProps={{ input: { sx: { fontSize: '0.9rem' } } }}
                />
                <Stack direction="row" spacing={1} sx={{ mt: 1, justifyContent: 'flex-end' }}>
                  <Button size="small" sx={{ textTransform: 'none' }} onClick={() => setReplyToId(null)}>Hủy</Button>
                  <Button 
                    size="small" 
                    variant="contained" 
                    disabled={submittingId === `reply-${comment.id}` || !replyContent.trim()}
                    onClick={(e) => handleSubmit(e, comment.id)}
                    sx={{ borderRadius: '6px', textTransform: 'none' }}
                  >
                    {submittingId === `reply-${comment.id}` ? <CircularProgress size={16} color="inherit" /> : 'Phản hồi'}
                  </Button>
                </Stack>
              </Box>
            </Collapse>

            {isAdmin && <Collapse in={expandedAdminId === comment.id}>
              <Box sx={{ mt: 1.5, p: 2, borderRadius: '8px', bgcolor: alpha(theme.palette.primary.main, 0.03), border: `1px dashed ${alpha(theme.palette.primary.main, 0.2)}`, fontSize: '0.75rem' }}>
                <Stack spacing={1}>
                  <Typography variant="caption"><strong>Email:</strong> {comment.authorEmail}</Typography>
                  <Typography variant="caption"><strong>IP:</strong> {comment.ip}</Typography>
                  {isEdited && (
                    <Box sx={{ pl: 1, borderLeft: `1px solid ${alpha(theme.palette.divider, 0.2)}` }}>
                      <Typography variant="caption" sx={{ display: 'block' }}><strong>Gốc:</strong> {comment.originalContent}</Typography>
                    </Box>
                  )}
                </Stack>
              </Box>
            </Collapse>}

            {/* Render Replies (Only for root comments) */}
            {!isReply && comment.replies && comment.replies.length > 0 && (
              <Stack spacing={3} sx={{ mt: 3, pl: 4 }}>
                {comment.replies.map((reply: any) => renderComment(reply, true))}
              </Stack>
            )}
          </Box>
        </Stack>
      </motion.div>
    );
  };

  return (
    <Box sx={{ mt: 10, mb: 10 }}>
      {/* Animated Divider */}
      <motion.div
        initial={{ width: 0, opacity: 0 }}
        whileInView={{ width: '100%', opacity: 1 }}
        transition={{ duration: 1.2, ease: "circOut" }}
        viewport={{ once: true }}
        style={{ 
          height: '1px', 
          background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.divider, 0.1)}, transparent)`,
          marginBottom: '60px',
          marginHorizontal: 'auto'
        }}
      />

      <Typography 
        variant="h5" 
        sx={{ 
          fontWeight: 800, 
          letterSpacing: '-0.02em', 
          mb: 4,
          fontFamily: tokens.typography.fontFamily.serif,
          textTransform: 'uppercase',
          fontSize: '1.25rem',
          color: 'text.primary',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}
      >
        <span>Conversation</span>
        <Box sx={{ height: 1, flexGrow: 1, bgcolor: 'divider', opacity: 0.5 }} />
        <Typography variant="caption" sx={{ opacity: 0.5, fontWeight: 600 }}>
          {comments.length} Thoughts
        </Typography>
      </Typography>

      {/* Comment Input */}
      <Box sx={{ p: 3, borderRadius: '12px', bgcolor: alpha(theme.palette.background.paper, 0.4), backdropFilter: 'blur(10px)', border: `1px solid ${alpha(theme.palette.divider, 0.1)}`, mb: 6 }}>
        {session ? (
          <form onSubmit={(e) => handleSubmit(e)}>
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              <Avatar sx={{ 
                width: 40, height: 40, 
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: 'primary.main',
                fontSize: '1rem',
                fontWeight: 800,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`
              }}>
                {session.user?.name?.charAt(0)}
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>{session.user?.name}</Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="Share your thoughts..."
                  variant="standard"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  disabled={submittingId === 'main'}
                  slotProps={{ input: { disableUnderline: true, sx: { fontSize: '0.95rem', py: 1, fontFamily: 'inherit' } } }}
                />
              </Box>
            </Stack>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                disabled={submittingId === 'main' || !newComment.trim()}
                endIcon={submittingId === 'main' ? <CircularProgress size={16} color="inherit" /> : <SendRoundedIcon />}
                sx={{ borderRadius: '8px', px: 3, textTransform: 'none', fontWeight: 700 }}
              >
                Post
              </Button>
            </Box>
          </form>
        ) : (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>Đăng nhập để bình luận.</Typography>
            <Button variant="outlined" startIcon={<GoogleIcon />} onClick={() => signIn('google')} sx={{ borderRadius: '8px', px: 4, textTransform: 'none', fontWeight: 700 }}>Sign in with Google</Button>
          </Box>
        )}
      </Box>

      {/* Comments List */}
      <AnimatePresence mode="popLayout">
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={24} /></Box>
        ) : threadedComments.length > 0 ? (
          <Stack spacing={6}>
            {threadedComments.map((comment) => renderComment(comment))}
          </Stack>
        ) : (
          <Box sx={{ textAlign: 'center', py: 8, opacity: 0.2 }}><Typography variant="body2">Chưa có bình luận nào.</Typography></Box>
        )}
      </AnimatePresence>
    </Box>
  );
}
