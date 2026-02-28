import { unified } from "unified";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";

export async function astToHtml(ast) {
  const processor = unified()
    .use(remarkRehype)
    .use(rehypeStringify);

  assignIds(ast);
  const file = await processor.run(ast);
  return processor.stringify(file);
}

function assignIds(node) {
  if (!node) return;

  if (!node.data) node.data = {};

  node.data.nodeId = generateId("node");

  const isBlock = [
    "paragraph",
    "heading",
    "list",
    "listItem",
    "blockquote",
    "code"
  ].includes(node.type);

  node.data.hProperties = {
    ...(node.data.hProperties || {}),
    "data-node-id": node.data.nodeId,
    className: [
      ...(node.data.hProperties?.className || []),
      isBlock ? "branchable-block" : "branchable-inline",
      node.lang && `language-${node.lang}`
    ]
  };

  if (node.children) {
    node.children.forEach(assignIds);
  }
}

export function generateId(prefix = "node") {
  return prefix + "_" + crypto.randomUUID();
}