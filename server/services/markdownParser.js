import { remark } from "remark";
import remarkParse from "remark-parse";

export function parseMarkdownToAST(markdown) {
  const tree = remark().use(remarkParse).parse(markdown);
  return tree;
}