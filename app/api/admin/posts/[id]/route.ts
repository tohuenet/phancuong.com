import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { revalidateTag } from 'next/cache';
import { BLOG_CACHE_TAGS } from '@/lib/blog';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session || session.user?.email !== process.env.ALLOWED_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { tagsString, ...postData } = await request.json();

    // If slug is being updated, check for collision
    if (postData.slug) {
      const existing = await prisma.post.findFirst({
        where: { 
          slug: postData.slug,
          NOT: { id }
        }
      });
      if (existing) {
        return NextResponse.json({ error: 'Slug already exists. Please choose another one.' }, { status: 400 });
      }
    }

    // Process tags
    const tags = tagsString 
      ? tagsString.split(',').map((t: string) => t.trim()).filter(Boolean).map((name: string) => {
          const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          return {
            where: { slug },
            create: { name: name.toLowerCase(), slug }
          };
        })
      : [];

    const post = await prisma.post.update({
      where: { id },
      data: {
        ...postData,
        tags: {
          set: [], // Clear existing tags
          connectOrCreate: tags
        }
      },
    });
    revalidateTag(BLOG_CACHE_TAGS.posts, 'max');
    revalidateTag(BLOG_CACHE_TAGS.tags, 'max');
    revalidateTag(BLOG_CACHE_TAGS.post(post.slug), 'max');
    return NextResponse.json(post);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session || session.user?.email !== process.env.ALLOWED_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const deleted = await prisma.post.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
    revalidateTag(BLOG_CACHE_TAGS.posts, 'max');
    revalidateTag(BLOG_CACHE_TAGS.tags, 'max');
    revalidateTag(BLOG_CACHE_TAGS.post(deleted.slug), 'max');
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to soft-delete post' }, { status: 500 });
  }
}
