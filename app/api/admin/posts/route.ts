import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { revalidateTag } from 'next/cache';
import { BLOG_CACHE_TAGS } from '@/lib/blog';

export async function GET() {
  const session = await getServerSession(authOptions);
  
  // Security Check
  if (!session || session.user?.email !== process.env.ALLOWED_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(posts);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.email !== process.env.ALLOWED_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { tagsString, ...postData } = await request.json();
    
    // Check for slug uniqueness
    const existing = await prisma.post.findUnique({
      where: { slug: postData.slug }
    });
    
    if (existing) {
      return NextResponse.json({ error: 'Slug already exists. Please choose another one.' }, { status: 400 });
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

    const post = await prisma.post.create({
      data: {
        ...postData,
        authorId: session.user.id,
        tags: {
          connectOrCreate: tags
        }
      }
    });
    revalidateTag(BLOG_CACHE_TAGS.posts, 'max');
    revalidateTag(BLOG_CACHE_TAGS.tags, 'max');
    return NextResponse.json(post);
  } catch (error) {
    console.error('Post Create Error:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
