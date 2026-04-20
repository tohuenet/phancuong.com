import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { PostsDB, CommentsDB } from '@/lib/storage';
import { revalidateTag } from 'next/cache';
import { BLOG_CACHE_TAGS } from '@/lib/blog';
import { cleanupImages, diffRemovedImages } from '@/lib/html';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session || session.user?.email !== process.env.ALLOWED_EMAIL) {
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

    // Release images that were removed from the body during the edit
    if (typeof postData.content === 'string' && postData.content !== existingPost.content) {
      await diffRemovedImages(existingPost.content || '', postData.content);
    }

    // If thumbnail was replaced with a different local upload, free the old one
    if (
      typeof postData.thumbnailUrl !== 'undefined' &&
      postData.thumbnailUrl !== existingPost.thumbnailUrl &&
      existingPost.thumbnailUrl?.startsWith('/uploads/')
    ) {
      const oldName = existingPost.thumbnailUrl.replace('/uploads/', '');
      const oldPath = path.join(process.cwd(), 'public', 'uploads', oldName);
      try { await fs.unlink(oldPath); } catch { /* ignore */ }
    }

    revalidateTag(BLOG_CACHE_TAGS.posts, 'max');
    revalidateTag(BLOG_CACHE_TAGS.tags, 'max');

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
  const session = await auth();
  if (!session || session.user?.email !== process.env.ALLOWED_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const existingPost = await PostsDB.getById(id);
    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // 1. Cleanup images associated with this post body
    if (existingPost.content) {
      await cleanupImages(existingPost.content);
    }

    // 2. Cleanup post thumbnail if it is a local upload
    if (existingPost.thumbnailUrl && existingPost.thumbnailUrl.startsWith('/uploads/')) {
      const fileName = existingPost.thumbnailUrl.replace('/uploads/', '');
      const filePath = path.join(process.cwd(), 'public', 'uploads', fileName);
      try {
        await fs.unlink(filePath);
        console.log(`Thumbnail released: ${fileName}`);
      } catch (err) {
        // Ignore
      }
    }

    // 3. Cleanup associated comments and their images
    const allComments = await CommentsDB.getAll();
    const postComments = allComments.filter(c => c.postSlug === existingPost.slug);
    
    for (const comment of postComments) {
      // Cleanup images in comment
      if (comment.content) {
        await cleanupImages(comment.content);
      }
      // Delete comment record
      await CommentsDB.delete(comment.id);
      console.log(`Comment deleted: ${comment.id}`);
    }

    // Soft-delete the post record (keeping the record for audit, but resources are released)
    await PostsDB.save({
      ...existingPost,
      deletedAt: new Date()
    });

    revalidateTag(BLOG_CACHE_TAGS.posts, 'max');
    revalidateTag(BLOG_CACHE_TAGS.tags, 'max');
    
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Post Delete Error:', error);
    return NextResponse.json({ error: 'Failed to soft-delete post' }, { status: 500 });
  }
}
