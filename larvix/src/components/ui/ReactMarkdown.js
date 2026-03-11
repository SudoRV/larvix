import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";

import { visit } from "unist-util-visit";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";


/* -------------------- */
/* Rehype Plugin */
/* -------------------- */

function rehypeAddIds() {
  let counter = 0;

  return (tree) => {
    visit(tree, "element", (node) => {
      counter++;

      if (!node.properties) node.properties = {};

      // Check if the attribute already exists to avoid overwriting
      if (!node.properties['data-uid']) {
        // Sets data-element-id="1", data-element-id="2", etc.
        node.properties['data-uid'] = `${counter}`; 
      }
    });
  };
}


/* -------------------- */
/* Code Renderer */
/* -------------------- */

function CodeBlock({ inline, className, children, highlight = 0, ...props }) {
  const match = /language-(\w+)/.exec(className || "");
  const language = match ? match[1] : "text";

  if (highlight) {
    return (
      <CustomEditor language={language}>
        <SyntaxHighlighter
          language={language}
          style={oneDark}
          {...props}
        >
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      </CustomEditor>
    );
  }

  return (
    <CustomEditor language={language}>
      <code className={className} {...props}>
        {children}
      </code>
    </CustomEditor>
  );
}


/* -------------------- */
/* Code Container */
/* -------------------- */

function CustomEditor({ children, language }) {
  return (
    <div className="rounded-xl overflow-hidden">
      <pre className="pre-code-block !bg-neutral-800 p-5 py-2 pb-4 rounded-xl text-neutral-100 text-[16px]">

        <div className="flex justify-between mb-3">
          <p className="text-white font-bold !m-0">{language}</p>
          <button className="text-white">Copy</button>
        </div>

        {children}

      </pre>
    </div>
  );
}


/* -------------------- */
/* Markdown Renderer */
/* -------------------- */

export default function MarkdownRenderer({ content, role }) {
  return (
    <div className={`markdown-body ${role === "user" ? "bg-neutral-900 text-white w-fit max-w-[80%] rounded-xl px-4" : "w-full"}`}>

      {
        role === "user" ? (
          <p className="!my-2">{content}</p>
        ) : (
          <ReactMarkdown
            rehypePlugins={
              [
                rehypeRaw,
                rehypeSanitize,
                rehypeAddIds
              ]
            }
            components={{
              pre: CodeBlock
            }}
          >
            {content}
          </ReactMarkdown>
        )
      }

    </div >
  );
}