export interface PostViewTransitionNames {
  header: string;
  title: string;
  tag: string;
  publishedAt: string;
  readingTime: string;
}

export function getPostViewTransitionNames(slug: string, isPinned = false): PostViewTransitionNames {
  const key = slug.trim().toLowerCase();
  const variant = isPinned ? 'pinned-' : '';

  return {
    header: `post-${variant}${key}-header`,
    title: `post-${variant}${key}-title`,
    tag: `post-${variant}${key}-tag`,
    publishedAt: `post-${variant}${key}-published-at`,
    readingTime: `post-${variant}${key}-reading-time`,
  };
}
