import { CommentsDB } from '@/lib/storage';

export interface VisibleComment {
  id: string;
  postSlug: string;
  parentId: string | null;
  authorName: string;
  authorEmail: string;
  authorImage: string | null;
  content: string;
  originalContent?: string;
  editHistory?: { content: string; editedAt: string }[];
  ip?: string;
  createdAt: string;
  updatedAt: string;
}

// Fetches visible comments for a post with viewer-aware privacy masking.
// Shared between the JSON API and server-side page rendering so initial
// comments can be hydrated without a client fetch waterfall.
export async function getVisibleCommentsForPost(
  slug: string,
  viewerEmail: string | null | undefined,
  isAdmin: boolean,
): Promise<VisibleComment[]> {
  const allComments = (await CommentsDB.getAll()) as VisibleComment[];
  const rawPostComments = allComments.filter((c) => c.postSlug === slug);

  // Drop orphan replies whose parent no longer exists.
  const ids = new Set(rawPostComments.map((c) => c.id));
  const postComments = rawPostComments
    .filter((c) => !c.parentId || ids.has(c.parentId))
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  return postComments.map((c) => {
    const isOwner = viewerEmail && viewerEmail === c.authorEmail;
    if (isAdmin || isOwner) return c;

    const email = c.authorEmail || '';
    const [name, domain] = email.split('@');
    let maskedEmail = 'Author';
    if (name && domain) {
      maskedEmail =
        name.length <= 2
          ? `${name}***@${domain}`
          : `${name.substring(0, 2)}***${name.substring(name.length - 1)}@${domain}`;
    }

    return {
      ...c,
      authorEmail: maskedEmail,
      ip: undefined,
    };
  });
}
