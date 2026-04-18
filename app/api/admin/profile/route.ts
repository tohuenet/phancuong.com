import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  // Strict Security Check
  if (!session || session.user?.email !== process.env.ALLOWED_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, image } = await request.json();
    
    const updatedUser = await prisma.user.update({
      where: { email: session.user?.email as string },
      data: { name, image }
    });
    
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Admin API Profile Error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
