import { CoursesDB, LessonsDB, SeriesDB, PostsDB } from './storage';

// SERIES LOGIC
export async function getAllSeries() {
  const allSeries = await SeriesDB.getAll();
  const allPosts = await PostsDB.getAll();

  return allSeries
    .filter(s => !s.deletedAt)
    .map(s => ({
      ...s,
      _count: {
        posts: allPosts.filter(p => p.seriesId === s.id && p.published && !p.deletedAt).length
      }
    }))
    .sort((a, b) => a.title.localeCompare(b.title));
}

export async function getSeriesBySlug(slug: string) {
  const series = await SeriesDB.getBySlug(slug);
  if (!series || series.deletedAt) return null;

  const allPosts = await PostsDB.getAll();
  const posts = allPosts
    .filter(p => p.seriesId === series.id && p.published && !p.deletedAt)
    .sort((a, b) => a.order - b.order)
    .map(p => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      createdAt: p.createdAt
    }));

  return { ...series, posts };
}

// COURSE LOGIC
export async function getAllCourses() {
  const allCourses = await CoursesDB.getAll();
  const allLessons = await LessonsDB.getAll();

  return allCourses
    .filter(c => !c.deletedAt)
    .map(c => ({
      ...c,
      _count: {
        lessons: allLessons.filter(l => l.courseId === c.id && !l.deletedAt).length
      }
    }))
    .sort((a, b) => a.title.localeCompare(b.title));
}

export async function getCourseWithLessons(slug: string) {
  const course = await CoursesDB.getBySlug(slug);
  if (!course || course.deletedAt) return null;

  const allLessons = await LessonsDB.getAll();
  const lessons = allLessons
    .filter(l => l.courseId === course.id && !l.deletedAt)
    .sort((a, b) => a.order - b.order);

  return { ...course, lessons };
}

export async function getLesson(courseSlug: string, lessonSlug: string) {
  const course = await CoursesDB.getBySlug(courseSlug);
  if (!course) return null;

  const allLessons = await LessonsDB.getAll();
  const courseLessons = allLessons
    .filter(l => l.courseId === course.id && !l.deletedAt)
    .sort((a, b) => a.order - b.order);

  const lessonIndex = courseLessons.findIndex((l) => l.slug === lessonSlug);
  if (lessonIndex === -1) return null;

  const lesson = courseLessons[lessonIndex];
  const nextLesson = courseLessons[lessonIndex + 1] || null;
  const prevLesson = courseLessons[lessonIndex - 1] || null;

  return {
    lesson,
    course,
    nextLesson,
    prevLesson,
    allLessons: courseLessons,
  };
}
