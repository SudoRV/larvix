import { useState } from "react";

import { unified } from "unified";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";

import { ArtifactTypeFromLang } from "../scripts/ArtifactTypeFromLang";
import { extractCodeMetadata } from "../scripts/extractCodeMetadata";

export async function astToHtml(ast) {
  const processor = unified()
    .use(remarkRehype)
    .use(rehypeStringify);

  assignIds(ast);
  const file = await processor.run(ast);
  return processor.stringify(file);
}

function assignIds(node, userPrompt) {
  if (!node) return;

  if (!node.data) node.data = {};

  if(node.data.nodeId) return;

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
    node.children.forEach(child => assignIds(child, userPrompt));
  }
}

export function generateId(prefix = "node") {
  return prefix + "_" + crypto.randomUUID();
}



// 
function extractArtifacts(node, userPrompt) {
  const { type, format } = ArtifactTypeFromLang(node.lang);

  const store = shouldCreateArtifact(node.value, type, userPrompt);

  if (store) {
    // extract keywords for code only
    let keywords = {};
    if (type === "code") {
      keywords = extractCodeMetadata(node.value, node.lang);
    }

    const artifact = {
      id: crypto.randomUUID(),
      parentId: null,
      dataBlockId: node.data.nodeId,

      type,
      content: node.value,
      lang: node.lang,
      format,

      keywords,

      metadata: {
        version: 1,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    }
  };

}





function shouldCreateArtifact(response, type, userPrompt) {
  const contentLength = response.trim().length;
  const lines = response.split("\n").length;

  const strongIntent =
    /create|generate|build|full|complete|entire|provide|deep/i.test(userPrompt);

  if (strongIntent) return true;

  if (type === "code") {
    return lines >= 5 || contentLength >= 80;
  }

  if (type === "document") {
    return contentLength >= 120;
  }

  if (type === "diagram") {
    return lines >= 3;
  }

  return false;
}