
import { PostsDB } from '../lib/storage';
import { v4 as uuidv4 } from 'uuid';

async function createTestPost() {
  const id = uuidv4();
  const post = {
    id,
    title: 'PHP Render Test',
    slug: 'php-render-test-' + id.slice(0, 5),
    content: '<h1>Testing PHP Render</h1><p>Below should be a PHP block:</p><pre class="ql-syntax" spellcheck="false">&lt;?php\nphpinfo();\n?&gt;</pre><p>End of test.</p>',
    excerpt: 'Testing PHP rendering in the blog.',
    thumbnailUrl: '',
    published: true,
    order: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: []
  };

  await PostsDB.save(post);
  console.log('Test post created with slug:', post.slug);
}

createTestPost().catch(console.error);
