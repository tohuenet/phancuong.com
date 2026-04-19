import { NextResponse } from 'next/server';
import { PostsDB } from '@/lib/storage';
import { auth } from '@/auth';
import { revalidateTag } from 'next/cache';
import { BLOG_CACHE_TAGS } from '@/lib/blog';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { postIds } = await request.json();

    if (!Array.isArray(postIds)) {
      return new NextResponse('Invalid data', { status: 400 });
    }

    // Update pinnedOrder for each post in the list using FileStorage
    await Promise.all(
      postIds.map(async (id, index) => {
        const post = await PostsDB.getById(id);
        if (post) {
          await PostsDB.save({
            ...post,
            pinnedOrder: index
          });
        }
      })
    );

    revalidateTag(BLOG_CACHE_TAGS.posts, 'max');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reorder update error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
