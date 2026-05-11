import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { isAdmin } from '@/lib/auth-config';
import { PostsDB } from '@/lib/storage';
import { revalidateTag } from 'next/cache';
import { BLOG_CACHE_TAGS, ensureUniquePostSlug } from '@/lib/blog';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  const session = await auth();

  if (!isAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const posts = await PostsDB.getAll();
    const sortedPosts = posts.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return NextResponse.json(sortedPosts);
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { tagsString, ...postData } = await request.json();

    // Auto-suffix on collision (e.g. `my-title` → `my-title-2`) so duplicate
    // titles never block creation. Admin can still manually edit the slug
    // afterwards if the auto-pick isn't desired.
    postData.slug = await ensureUniquePostSlug(postData.slug);

    // Process tags
    const tags = tagsString 
      ? tagsString.split(',').map((t: string) => t.trim()).filter(Boolean).map((name: string) => {
          const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          return { id: uuidv4(), name: name.toLowerCase(), slug };
        })
      : [];

    const now = new Date();
    const post = await PostsDB.save({
      ...postData,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
      isPinned: false,
      pinnedOrder: 0,
      tags
    });

    revalidateTag(BLOG_CACHE_TAGS.posts, 'max');
    revalidateTag(BLOG_CACHE_TAGS.tags, 'max');
    
    return NextResponse.json(post);
  } catch (error) {
    console.error('Post Create Error:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
