import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

// Singleton cache to avoid re-reading all files on every slug lookup.
// Stored on globalThis so it is shared across Next.js's separate RSC / route-handler
// module graphs in dev — otherwise invalidation on one graph leaves the other stale.
const globalForStorage = globalThis as unknown as { __storageCache?: Record<string, any[]> };
const storageCache: Record<string, any[]> =
  globalForStorage.__storageCache ?? (globalForStorage.__storageCache = {});

export class FileStorage<T extends { id: string; slug?: string }> {
  private collectionPath: string;
  private collectionKey: string;

  constructor(collection: string) {
    this.collectionPath = path.join(DATA_DIR, collection);
    this.collectionKey = collection;
  }

  private async ensureDir() {
    try {
      await fs.mkdir(this.collectionPath, { recursive: true });
    } catch (e) {
      // Ignore
    }
  }

  private invalidateCache() {
    delete storageCache[this.collectionKey];
  }

  async getAll(): Promise<T[]> {
    if (storageCache[this.collectionKey]) {
      return storageCache[this.collectionKey];
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
    if (cached) return cached;

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

  private hydrate(data: any): T {
    // Basic hydration of date strings
    Object.keys(data).forEach(key => {
      if (typeof data[key] === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(data[key])) {
        data[key] = new Date(data[key]);
      }
    });
    return data as T;
  }
}

export const PostsDB = new FileStorage<any>('posts');
export const CoursesDB = new FileStorage<any>('courses');
export const LessonsDB = new FileStorage<any>('lessons');
export const SeriesDB = new FileStorage<any>('series');
export const TagsDB = new FileStorage<any>('tags');
export const MediaDB = new FileStorage<any>('media');
export const CommentsDB = new FileStorage<any>('comments');
