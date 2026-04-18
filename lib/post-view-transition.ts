export interface PostViewTransitionNames {
  title: string;
  tag: string;
  publishedAt: string;
  readingTime: string;
}

export function getPostViewTransitionNames(slug: string): PostViewTransitionNames {
  const key = slug.trim().toLowerCase();

  return {
    title: `post-${key}-title`,
    tag: `post-${key}-tag`,
    publishedAt: `post-${key}-published-at`,
    readingTime: `post-${key}-reading-time`,
  };
}
