import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { CommentsDB } from '@/lib/storage';

// Helper to strip HTML tags
function stripHtml(html: string) {
  return html.replace(/<[^>]*>?/gm, '');
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  const { id } = await params;
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { content } = await request.json();
    const comment = await CommentsDB.getById(id);

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    const isAdmin = (session.user as any)?.isAdmin;
    const isOwner = session.user?.email === comment.authorEmail;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Sanitize new content
    const cleanContent = stripHtml(content).trim();
    if (!cleanContent) {
      return NextResponse.json({ error: 'Content cannot be empty' }, { status: 400 });
    }

    // Push current version to history before updating
    const updatedComment = {
      ...comment,
      content: cleanContent,
      updatedAt: new Date(),
      editHistory: [
        ...(comment.editHistory || []),
        {
          content: comment.content,
          editedAt: new Date(),
        }
      ]
    };

    await CommentsDB.save(updatedComment);
    return NextResponse.json(updatedComment);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update comment' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  const { id } = await params;
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const comment = await CommentsDB.getById(id);
    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    const isAdmin = (session.user as any)?.isAdmin;
    const isOwner = session.user?.email === comment.authorEmail;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await CommentsDB.delete(id);
    return NextResponse.json({ message: 'Comment deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
  }
}
