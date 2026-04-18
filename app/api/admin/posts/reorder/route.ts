import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidateTag } from 'next/cache';
import { BLOG_CACHE_TAGS } from '@/lib/blog';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { postIds } = await request.json();

    if (!Array.isArray(postIds)) {
      return new NextResponse('Invalid data', { status: 400 });
    }

    // Update pinnedOrder for each post in the list
    await Promise.all(
      postIds.map((id, index) =>
        prisma.post.update({
          where: { id },
          data: { pinnedOrder: index }
        })
      )
    );

    revalidateTag(BLOG_CACHE_TAGS.posts, 'max');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reorder update error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
