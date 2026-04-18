import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // 1. Create a Tag
  const tag = await prisma.tag.upsert({
    where: { slug: 'nextjs' },
    update: {},
    create: {
      name: 'Next.js',
      slug: 'nextjs',
    },
  });

  // 2. Create a Series
  const series = await prisma.series.upsert({
    where: { slug: 'building-portfolio' },
    update: {},
    create: {
      title: 'Building a Portfolio with Next.js',
      slug: 'building-portfolio',
      description: 'A complete series on how to build a portfolio website.',
    },
  });

  // 3. Create a Post
  await prisma.post.upsert({
    where: { slug: 'introduction-to-nextjs' },
    update: {},
    create: {
      title: 'Introduction to Next.js',
      slug: 'introduction-to-nextjs',
      content: '# Hello World \n\n Welcome to my first MDX post!',
      excerpt: 'Learn the basics of Next.js and how to get started.',
      published: true,
      seriesId: series.id,
      tags: {
        connect: [{ id: tag.id }],
      },
    },
  });

  // 4. Create a Course & Lessons
  const course = await prisma.course.upsert({
    where: { slug: 'mastering-react' },
    update: {},
    create: {
      title: 'Mastering React',
      slug: 'mastering-react',
      description: 'The ultimate guide to React and its ecosystem.',
      lessons: {
        create: [
          {
            title: '1. What is React?',
            slug: 'what-is-react',
            content: 'React is a library for building user interfaces...',
            order: 1,
          },
          {
            title: '2. Hooks 101',
            slug: 'hooks-101',
            content: 'Hooks allow you to use state and other React features...',
            order: 2,
          },
        ],
      },
    },
  });

  // 5. Create a Mock CV entry
  await prisma.cV.create({
    data: {
      content: {
        experience: [
          { company: 'Google', role: 'Software Engineer', years: '2023-Present' }
        ],
        education: [
          { school: 'Harvard', degree: 'Computer Science' }
        ]
      }
    }
  });

  console.log('Seed finished successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
