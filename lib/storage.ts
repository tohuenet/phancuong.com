import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  thumbnailUrl: string;
  createdAt: Date;
  updatedAt: Date;
  published: boolean;
  deletedAt?: Date | null;
  order: number;
  isPinned: boolean;
  pinnedOrder: number;
  tags: BlogTag[];
  seriesId?: string;
  author?: { name: string | null; image: string | null } | null;
}

export interface BlogSeries {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  thumbnailUrl?: string;
  deletedAt?: Date | null;
}

export interface CommentEditEntry {
  content: string;
  editedAt: Date | string;
}

export interface BlogComment {
  id: string;
  slug?: string;
  postSlug: string;
  parentId?: string | null;
  authorName: string;
  authorEmail?: string | null;
  authorImage?: string | null;
  author?: string;
  email?: string | null;
  content: string;
  originalContent?: string;
  editHistory?: CommentEditEntry[];
  ip?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface MediaItem {
  id: string;
  slug?: string;
  url: string;
  filename: string;
  createdAt: Date;
}

export interface BlogCourse {
  id: string;
  slug: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  deletedAt?: Date | null;
}

export interface BlogLesson {
  id: string;
  slug: string;
  title: string;
  courseId: string;
  content?: string;
  order: number;
  deletedAt?: Date | null;
}

type StorageItem = { id: string; slug?: string };

// Singleton cache to avoid re-reading all files on every slug lookup.
// Stored on globalThis so it is shared across Next.js's separate RSC / route-handler
// module graphs in dev — otherwise invalidation on one graph leaves the other stale.
const globalForStorage = globalThis as unknown as { __storageCache?: Record<string, StorageItem[]> };
const storageCache: Record<string, StorageItem[]> =
  globalForStorage.__storageCache ?? (globalForStorage.__storageCache = {});

export class FileStorage<T extends StorageItem> {
  private collectionPath: string;
  private collectionKey: string;

  constructor(collection: string) {
    this.collectionPath = path.join(DATA_DIR, collection);
    this.collectionKey = collection;
  }

  private async ensureDir() {
    try {
      await fs.mkdir(this.collectionPath, { recursive: true });
    } catch {
      // Ignore
    }
  }

  private invalidateCache() {
    delete storageCache[this.collectionKey];
  }

  async getAll(): Promise<T[]> {
    if (storageCache[this.collectionKey]) {
      return storageCache[this.collectionKey] as T[];
    }

    await this.ensureDir();
    const files = await fs.readdir(this.collectionPath);
    const items = await Promise.all(
      files
        .filter(f => f.endsWith('.json'))
        .map(async f => {
          const content = await fs.readFile(path.join(this.collectionPath, f), 'utf-8');
          const data = JSON.parse(content);
          return this.hydrate(data);
        })
    );

    storageCache[this.collectionKey] = items;
    return items;
  }

  async getById(id: string): Promise<T | null> {
    const cached = storageCache[this.collectionKey]?.find(i => i.id === id);
    if (cached) return cached as T;

    await this.ensureDir();
    try {
      const content = await fs.readFile(path.join(this.collectionPath, `${id}.json`), 'utf-8');
      return this.hydrate(JSON.parse(content));
    } catch {
      return null;
    }
  }

  async getBySlug(slug: string): Promise<T | null> {
    const all = await this.getAll();
    return all.find(item => item.slug === slug) || null;
  }

  async save(data: T): Promise<T> {
    await this.ensureDir();
    const filePath = path.join(this.collectionPath, `${data.id}.json`);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    this.invalidateCache();
    return data;
  }

  async delete(id: string): Promise<void> {
    await this.ensureDir();
    try {
      await fs.unlink(path.join(this.collectionPath, `${id}.json`));
      this.invalidateCache();
    } catch {
      // Ignore if doesn't exist
    }
  }

  private hydrate(data: Record<string, unknown>): T {
    // Basic hydration of date strings
    Object.keys(data).forEach(key => {
      const value = data[key];
      if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
        data[key] = new Date(value);
      }
    });
    return data as unknown as T;
  }
}

export const PostsDB = new FileStorage<BlogPost>('posts');
export const CoursesDB = new FileStorage<BlogCourse>('courses');
export const LessonsDB = new FileStorage<BlogLesson>('lessons');
export const SeriesDB = new FileStorage<BlogSeries>('series');
export const TagsDB = new FileStorage<BlogTag>('tags');
export const MediaDB = new FileStorage<MediaItem>('media');
export const CommentsDB = new FileStorage<BlogComment>('comments');
