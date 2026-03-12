import { unified } from "unified";
import rehypeParse from "rehype-parse";

export default async function htmlToAst(html) {
  const processor = unified().use(rehypeParse, { fragment: true });

  const tree = processor.parse(html);
  const ast = await processor.run(tree);

  return ast;
}