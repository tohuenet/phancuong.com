import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PostsDB } from '@/lib/storage';
import { revalidateTag } from 'next/cache';
import { BLOG_CACHE_TAGS } from '@/lib/blog';
import { v4 as uuidv4 } from 'uuid';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.email !== process.env.ALLOWED_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { tagsString, ...postData } = await request.json();

    const existingPost = await PostsDB.getById(id);
    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // If slug is being updated, check for collision
    if (postData.slug && postData.slug !== existingPost.slug) {
      const collision = await PostsDB.getBySlug(postData.slug);
      if (collision) {
        return NextResponse.json({ error: 'Slug already exists. Please choose another one.' }, { status: 400 });
      }
    }

    // Process tags
    let tags = existingPost.tags || [];
    if (tagsString !== undefined) {
      tags = tagsString 
        ? tagsString.split(',').map((t: string) => t.trim()).filter(Boolean).map((name: string) => {
            const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            return { id: uuidv4(), name: name.toLowerCase(), slug };
          })
        : [];
    }

    const updatedPost = await PostsDB.save({
      ...existingPost,
      ...postData,
      updatedAt: new Date(),
      tags
    });

    revalidateTag(BLOG_CACHE_TAGS.posts);
    revalidateTag(BLOG_CACHE_TAGS.tags);
    
    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error('Post Update Error:', error);
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.email !== process.env.ALLOWED_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const existingPost = await PostsDB.getById(id);
    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    await PostsDB.save({
      ...existingPost,
      deletedAt: new Date()
    });

    revalidateTag(BLOG_CACHE_TAGS.posts);
    revalidateTag(BLOG_CACHE_TAGS.tags);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Post Delete Error:', error);
    return NextResponse.json({ error: 'Failed to soft-delete post' }, { status: 500 });
  }
}
