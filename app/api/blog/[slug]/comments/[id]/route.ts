import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { CommentsDB } from '@/lib/storage';

import { sanitizeHtml, cleanupImages, diffRemovedImages } from '@/lib/html';

function collectDescendants(rootId: string, all: any[]): any[] {
  const byParent = new Map<string, any[]>();
  for (const c of all) {
    const p = c.parentId ?? null;
    if (!p) continue;
    if (!byParent.has(p)) byParent.set(p, []);
    byParent.get(p)!.push(c);
  }
  const out: any[] = [];
  const stack = [rootId];
  while (stack.length) {
    const next = stack.pop()!;
    const children = byParent.get(next) || [];
    for (const c of children) {
      out.push(c);
      stack.push(c.id);
    }
  }
  return out;
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

    // Sanitize HTML instead of stripping it all
    const cleanContent = sanitizeHtml(content).trim();
    if (!cleanContent || cleanContent === '<p></p>') {
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

    // Release images that were removed during the edit
    await diffRemovedImages(comment.content || '', cleanContent);

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

    // Cascade: when a root comment is deleted, every reply (and their images)
    // must go with it. Replies are only one level deep in this system, but we
    // walk the tree defensively in case that ever changes.
    const allComments = await CommentsDB.getAll();
    const toDelete = collectDescendants(id, allComments);
    toDelete.push(comment);

    for (const c of toDelete) {
      if (c.content) await cleanupImages(c.content);
      await CommentsDB.delete(c.id);
    }

    return NextResponse.json({
      message: 'Comment deleted',
      deletedIds: toDelete.map(c => c.id),
    });

  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
  }
}
