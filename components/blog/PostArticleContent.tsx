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

  // Pre-process content to ensure PHP tags are escaped.
  // We use a zero-width space after the < to prevent the browser/MDX 
  // from stripping tags that look like Processing Instructions (<?php).
  // We handle both raw <? and HTML-encoded &lt;?
  let processedContent = content
    .replace(/<\?/g, '<\u200B?')
    .replace(/&lt;\?/g, '&lt;\u200B?')
    .replace(/<!/g, '<\u200B!')
    .replace(/&lt;!/g, '&lt;\u200B!');

  if (isHtml) {
    return <HTMLContent content={processedContent} />;
  }

  const mdxSource = await serialize(processedContent, {
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
