import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  console.log('--- Diagnostic Start ---');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'PRESENT' : 'MISSING');
  
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    console.log('Testing Series query with deletedAt...');
    const series = await prisma.series.findMany({
      where: { deletedAt: null },
      take: 1
    });
    console.log('Series query successful! Found:', series.length);
    
    console.log('Testing Course query with deletedAt...');
    const courses = await prisma.course.findMany({
      where: { deletedAt: null },
      take: 1
    });
    console.log('Course query successful! Found:', courses.length);

    console.log('Testing Post query with deletedAt...');
    const posts = await prisma.post.findMany({
      where: { deletedAt: null },
      take: 1
    });
    console.log('Post query successful! Found:', posts.length);

  } catch (error: any) {
    console.error('--- DIAGNOSTIC ERROR ---');
    console.error(error.message);
    if (error.code) console.error('Error Code:', error.code);
  } finally {
    await prisma.$disconnect();
    await pool.end();
    console.log('--- Diagnostic End ---');
  }
}

main();
