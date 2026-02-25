import React, { useEffect, useRef, useState } from "react";

const StreamResponse = React.memo(function StreamResponse({ isLast, message, bottomRef, setScrollToBottomVisible, updateNodeInternals }) {

    const messageRef = useRef(null);
    const autoScroll = useRef(true);

    useEffect(() => {
        let cancelled = false;

        const parent = messageRef.current;
        parent.innerHTML = "";

        const parser = new DOMParser();
        const doc = parser.parseFromString(message.content, "text/html");

        const sleep = (ms) => new Promise(res => setTimeout(res, ms));

        async function streamNode(node, parentEl) {
            if (cancelled) return;

            if (node.nodeType === Node.TEXT_NODE) {
                const textNode = document.createTextNode("");
                parentEl.appendChild(textNode);

                if(message.role === "assistant" && Date.now() - message.timestamp < 3000){
                    for (let char of node.textContent) {
                        if (cancelled) return;
                        textNode.textContent += char;
    
                        if (autoScroll.current) {
                            bottomRef.current.scrollIntoView({ behavior: "smooth" });
                            updateNodeInternals()
                        }
    
                        await sleep(5);
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
                    : "text-gray-800 pt-0 px-1.5"
                }
      `}/>
    );
});

export default StreamResponse;