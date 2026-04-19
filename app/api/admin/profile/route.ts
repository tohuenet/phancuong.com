import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import fs from 'fs/promises';
import path from 'path';

const PROFILE_FILE = path.join(process.cwd(), 'data', 'profile.json');

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  // Strict Security Check
  if (!session || (session.user as any)?.email !== process.env.ALLOWED_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, image } = await request.json();
    
    const profile = { name, image, email: session.user?.email };
    await fs.mkdir(path.dirname(PROFILE_FILE), { recursive: true });
    await fs.writeFile(PROFILE_FILE, JSON.stringify(profile, null, 2));
    
    return NextResponse.json(profile);
  } catch (error) {
    console.error('Admin API Profile Error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const content = await fs.readFile(PROFILE_FILE, 'utf-8');
    return NextResponse.json(JSON.parse(content));
  } catch {
    return NextResponse.json({ name: 'Admin', image: null });
  }
}
