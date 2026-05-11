import { NextResponse } from 'next/server';
import { PostsDB } from '@/lib/storage';
import { auth } from '@/auth';
import { isAdmin } from '@/lib/auth-config';
import { revalidateTag } from 'next/cache';
import { BLOG_CACHE_TAGS } from '@/lib/blog';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!isAdmin(session)) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { id } = await params;

    const post = await PostsDB.getById(id);

    if (!post) {
      return new NextResponse('Post not found', { status: 404 });
    }

    const updatedPost = await PostsDB.save({
      ...post,
      isPinned: !post.isPinned,
      pinnedOrder: post.isPinned ? 0 : 999 // New pins go to the end by default
    });

    revalidateTag(BLOG_CACHE_TAGS.posts, 'max');
    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error('Pin toggle error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
