import { unified } from "unified";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";

export async function astToHtml(ast) {
  const processor = unified()
    .use(remarkRehype)
    .use(rehypeStringify);

  assignIds(ast);
  console.log(ast)
  const file = await processor.run(ast);
  return processor.stringify(file);
}

function assignIds(ast) {
  ast.children.forEach(node => {
    if (!node.data) node.data = {};
    node.data.blockId = generateId("block");

    // wrap block with div
    node.data.hProperties = {
      ...(node.data.hProperties || {}),
      "data-block-id": node.data.blockId,
      className: [
        ...(node.data.hProperties?.className || []),
        "branchable-block"
      ]
    };
  });
}

export function generateId(prefix = "node") {
  return prefix + "_" + crypto.randomUUID();
}