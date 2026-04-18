import prisma from './prisma';

// SERIES LOGIC
export async function getAllSeries() {
  return prisma.series.findMany({
    where: { deletedAt: null },
    include: {
      _count: {
        select: { posts: { where: { published: true, deletedAt: null } } },
      },
    },
    orderBy: { title: 'asc' },
  });
}

export async function getSeriesBySlug(slug: string) {
  return prisma.series.findUnique({
    where: { slug, deletedAt: null },
    include: {
      posts: {
        where: { published: true, deletedAt: null },
        orderBy: { order: 'asc' },
        select: { id: true, title: true, slug: true, excerpt: true, createdAt: true },
      },
    },
  });
}

// COURSE LOGIC
export async function getAllCourses() {
  return prisma.course.findMany({
    where: { deletedAt: null },
    include: {
      _count: {
        select: { lessons: true },
      },
    },
    orderBy: { title: 'asc' },
  });
}

export async function getCourseWithLessons(slug: string) {
  return prisma.course.findUnique({
    where: { slug, deletedAt: null },
    include: {
      lessons: {
        orderBy: { order: 'asc' },
      },
    },
  });
}

export async function getLesson(courseSlug: string, lessonSlug: string) {
  const course = await prisma.course.findUnique({
    where: { slug: courseSlug },
    include: {
      lessons: {
        where: { deletedAt: null },
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!course) return null;

  const lessonIndex = course.lessons.findIndex((l) => l.slug === lessonSlug);
  if (lessonIndex === -1) return null;

  const lesson = course.lessons[lessonIndex];
  const nextLesson = course.lessons[lessonIndex + 1] || null;
  const prevLesson = course.lessons[lessonIndex - 1] || null;

  return {
    lesson,
    course,
    nextLesson,
    prevLesson,
    allLessons: course.lessons,
  };
}
