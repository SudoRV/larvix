import React, { useEffect, useRef, useState } from "react";

import hljs from "highlight.js/lib/core";

import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import python from "highlight.js/lib/languages/python";
import html from "highlight.js/lib/languages/xml";
import css from "highlight.js/lib/languages/css";
import json from "highlight.js/lib/languages/json";
import bash from "highlight.js/lib/languages/bash";
import markdown from "highlight.js/lib/languages/markdown";

hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("js", javascript);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("ts", typescript);
hljs.registerLanguage("python", python);
hljs.registerLanguage("html", html);
hljs.registerLanguage("css", css);
hljs.registerLanguage("json", json);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("markdown", markdown);


const StreamResponse = React.memo(function StreamResponse({ isLast, message, bottomRef, setScrollToBottomVisible, updateNodeInternals }) {

    const messageRef = useRef(null);
    const autoScroll = useRef(true);

    useEffect(() => {
        let cancelled = false;

        const parent = messageRef.current;
        parent.innerHTML = "";

        const parser = new DOMParser();
        const doc = parser.parseFromString(message.content, "text/html");
        enhanceCodeBlocks(doc);

        const sleep = (ms) => new Promise(res => setTimeout(res, ms));

        async function streamNode(node, parentEl) {
            if (cancelled) return;

            if (node.nodeType === Node.TEXT_NODE) {
                const textNode = document.createTextNode("");
                parentEl.appendChild(textNode);

                if (message.role === "assistant" && Date.now() - message.createdAt < 30000) {
                    for (let char of node.textContent) {
                        if (cancelled) return;
                        textNode.textContent += char;

                        if (autoScroll.current) {
                            bottomRef.current.scrollIntoView({ behavior: "smooth" });
                            updateNodeInternals()
                        }

                        await sleep(0.5);
                    }
                } else {
                    textNode.textContent = node.textContent;
                }

            } else if (node.nodeType === Node.ELEMENT_NODE) {
                const el = document.createElement(node.tagName);

                for (let attr of node.attributes) {
                    el.setAttribute(attr.name, attr.value);
                }

                parentEl.appendChild(el);

                for (let child of Array.from(node.childNodes)) {
                    await streamNode(child, el);
                }
            }
        }

        async function startStreaming() {
            for (let child of Array.from(doc.body.childNodes)) {
                await streamNode(child, parent);
            }
        }

        startStreaming();

        // check for wheen up
        function handleAutoScroll() {
            const container = bottomRef.current.parentElement;

            const isNearBottom =
                container.scrollHeight - container.scrollTop - container.clientHeight < 40;

            if (!isNearBottom) {
                autoScroll.current = false;
                setScrollToBottomVisible(true);
            } else {
                autoScroll.current = true;
                setScrollToBottomVisible(false);
            }
        }

        bottomRef.current.parentElement.addEventListener("scroll", handleAutoScroll)

        return () => {
            cancelled = true;
            bottomRef.current?.parentElement.removeEventListener("scroll", handleAutoScroll);
        };

    }, [message.content]);

    return (
        <div
            ref={messageRef}
            className={`px-3 py-2 rounded-lg text-sm
                not-branchable
                prose prose-sm
                max-w-[100%] break-words
                prose-pre:bg-[#1d1f24]
                prose-pre:text-gray-200
                prose-pre:border
                prose-pre:border-gray-700
                prose-pre:rounded-lg
                prose-pre:p-4
                prose-pre:overflow-x-auto
                ${message.role === "user"
                    ? "bg-neutral-800 text-white"
                    : "text-gray-800 pt-0 px-1.5 w-full"
                }
      `} />
    );
});

export default StreamResponse;


function enhanceCodeBlocks(container) {
    const blocks = container.querySelectorAll("pre");

    blocks.forEach((pre) => {
        if (pre.dataset.enhanced) return;
        pre.dataset.enhanced = "true";

        const codeEl = pre.querySelector("code");
        const raw_code = codeEl?.textContent || "";

        const lang =
            codeEl?.className.match(/language-(\w+)/)?.[1] || "javascript";

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
          <span class="text-sm font-bold text-zinc-300 font-mono uppercase">${lang}</span>
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