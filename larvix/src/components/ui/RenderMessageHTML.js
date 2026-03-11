import React, { useEffect, useRef } from "react";

import { normalizeLang } from "../../scripts/ArtifactTypeFromLang";
import hljs from "../../scripts/SyntaxHighlighter";

const RenderMessageHTML = React.memo(function RenderMessageHTML({ message }) {

    const messageRef = useRef(null);

    useEffect(() => {
        const parent = messageRef.current;
        parent.innerHTML = "";

        const parser = new DOMParser();
        const doc = parser.parseFromString(message.content, "text/html");
        enhanceCodeBlocks(doc);

        parent.innerHTML = doc.body.innerHTML;
    }, [message.content]);

    return (
        <div
            ref={messageRef}
            className={`px-3 py-2 rounded-lg text-sm
                not-branchable
                prose prose-sm
                break-words
                prose-pre:bg-[#1d1f24]
                prose-pre:text-gray-200
                prose-pre:border
                prose-pre:border-gray-700
                prose-pre:rounded-lg
                prose-pre:p-4
                prose-pre:overflow-x-auto
                ${message.role === "user"
                    ? "bg-neutral-800 text-white max-w-[80%] "
                    : "text-gray-800 pt-0 px-1.5 w-full max-w-[100%] "
                }
      `} />
    );
});

export default RenderMessageHTML;


function enhanceCodeBlocks(container) {
    const blocks = container.querySelectorAll("pre");

    blocks.forEach((pre) => {
        if (pre.dataset.enhanced) return;
        pre.dataset.enhanced = "true";

        const codeEl = pre.querySelector("code");
        const raw_code = codeEl?.textContent || "";

        const lang =
            normalizeLang(codeEl?.className.match(/language-(\w+)/)?.[1] || "javascript");

        const code_attributes = Object.values(codeEl.attributes).map(a => `${a.name}="${a.value}"`).join(" ");

        let code = "";

        try {
            code = hljs.highlight(raw_code, {
                language: lang
            }).value;
        } catch (error) {
            console.log(error)
            code = raw_code;
        }

        const wrapper = document.createElement("div");
        wrapper.className =
            "not-branchable w-full my-6 rounded-xl border border-zinc-700 bg-neutral-900 overflow-hidden";

        wrapper.innerHTML = `
        <div class="flex justify-between items-center px-4 py-2 bg-neutral-800">
          <span class="text-sm font-bold text-zinc-300 font-mono">${lang}</span>
          <div class="flex gap-2">
            <button class="copy-btn text-xs px-3 py-1 bg-neutral-700 rounded text-white">Copy</button>
            <button class="edit-btn text-xs px-3 py-1 bg-indigo-600 rounded text-white invisible">Edit</button>
          </div>
        </div>
  
        <pre class="code-block custom-scroll overflow-auto not-branchable !m-0 !bg-transparent !rounded-none !border-none"><code ${code_attributes}>${code}</code></pre>
  
        <div class="editor hidden p-4 bg-zinc-950 border-t border-zinc-800">
          <textarea class="w-full h-40 bg-zinc-900 text-zinc-100 font-mono p-3 rounded"></textarea>
          <div class="flex justify-end mt-3">
            <button class="send-btn px-4 py-2 bg-indigo-600 rounded text-white text-sm">Send</button>
          </div>
        </div>
      `;

        pre.replaceWith(wrapper);
    });
}

function escapeHtml(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}