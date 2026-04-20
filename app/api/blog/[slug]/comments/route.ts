import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { CommentsDB, PostsDB } from '@/lib/storage';
import { sendCommentNotification } from '@/lib/mail';
import { v4 as uuidv4 } from 'uuid';

import { sanitizeHtml } from '@/lib/html';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const session = await auth();
    const isAdmin = session?.user?.email === process.env.ALLOWED_EMAIL;

    const allComments = await CommentsDB.getAll();
    const rawPostComments = allComments.filter(c => c.postSlug === slug);

    // Drop replies whose parent no longer exists. These are artifacts of older
    // deletes that didn't cascade; they inflate counts and never render.
    const ids = new Set(rawPostComments.map(c => c.id));
    const postComments = rawPostComments
      .filter(c => !c.parentId || ids.has(c.parentId))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Mask emails and hide IP for non-admins for privacy
    const sanitizedComments = postComments.map(c => {
      const isOwner = session?.user?.email === c.authorEmail;
      if (isAdmin || isOwner) return c;

      const email = c.authorEmail || '';
      const [name, domain] = email.split('@');
      let maskedEmail = 'Author'; 
      if (name && domain) {
        maskedEmail = name.length <= 2 
          ? `${name}***@${domain}` 
          : `${name.substring(0, 2)}***${name.substring(name.length - 1)}@${domain}`;
      }

      return {
        ...c,
        authorEmail: maskedEmail,
        ip: undefined, // Fully remove sensitive IP from non-admins
      };
    });

    return NextResponse.json(sanitizedComments);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized. Please sign in to comment.' }, { status: 401 });
  }

  try {
    const { content, parentId } = await request.json();
    
    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Comment content cannot be empty' }, { status: 400 });
    }

    // Sanitize HTML instead of stripping it all
    const cleanContent = sanitizeHtml(content).trim();
    
    if (cleanContent.length === 0 || cleanContent === '<p></p>') {
      return NextResponse.json({ error: 'Invalid comment content' }, { status: 400 });
    }

    const post = await PostsDB.getBySlug(slug);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const headersList = await request.headers;
    const ip = headersList.get('x-forwarded-for')?.split(',')[0] || 
               headersList.get('x-real-ip') || 
               'unknown';

    const comment = {
      id: uuidv4(),
      postSlug: slug,
      parentId: parentId || null, 
      authorName: session.user?.name || 'Anonymous',
      authorImage: null, // Always null for Letter Avatars
      authorEmail: session.user?.email,
      content: cleanContent,
      originalContent: cleanContent,
      editHistory: [],
      ip: ip,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await CommentsDB.save(comment);


    // Notify Admin
    const siteUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    sendCommentNotification({
      postTitle: post.title,
      postUrl: `${siteUrl}/blog/${slug}`,
      commentAuthor: comment.authorName,
      commentContent: comment.content,
    }).catch(err => console.error('Notification Error:', err));

    return NextResponse.json(comment);
  } catch (error) {
    console.error('Comment POST Error:', error);
    return NextResponse.json({ error: 'Failed to post comment' }, { status: 500 });
  }
}
