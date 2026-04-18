import { serialize } from 'next-mdx-remote/serialize';
import rehypePrettyCode from 'rehype-pretty-code';
import MDXContent from '@/components/blog/MDXContent';
import HTMLContent from '@/components/blog/HTMLContent';

interface PostArticleContentProps {
  content: string;
}

interface MDXNode {
  children: { type: string; value: string }[];
}

export default async function PostArticleContent({ content }: PostArticleContentProps) {
  const isHtml = content.trim().startsWith('<');

  if (isHtml) {
    return <HTMLContent html={content} />;
  }

  const mdxSource = await serialize(content, {
    mdxOptions: {
      rehypePlugins: [
        [
          rehypePrettyCode,
          {
            theme: { dark: 'vitesse-dark', light: 'github-light' },
            keepBackground: true,
            grid: true,
            onVisitLine(node: MDXNode) {
              if (node.children.length === 0) {
                node.children = [{ type: 'text', value: ' ' }];
              }
            },
          },
        ],
      ],
    },
  });

  return <MDXContent source={mdxSource} />;
}
