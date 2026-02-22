import React, { useEffect, useRef, useState } from "react";

const StreamResponse = React.memo(function StreamResponse({ message, bottomRef, setScrollToBottomVisible }) {

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

                for (let char of node.textContent) {
                    if (cancelled) return;
                    textNode.textContent += char;

                    if (autoScroll.current) {
                        bottomRef.current.scrollIntoView({ behavior: "smooth" });
                    }

                    await sleep(7);
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
        function handleAutoScroll(event) {
            if (event.deltaY < 0) {
                autoScroll.current = false;
                setScrollToBottomVisible(true);
            } else if (bottomRef.current.getBoundingClientRect().bottom + 12 >= bottomRef.current.parentElement.getBoundingClientRect().bottom) {
                autoScroll.current = true;
                setScrollToBottomVisible(false);
            }
        }

        bottomRef.current.parentElement.addEventListener("wheel", handleAutoScroll)

        return () => {
            cancelled = true;
            bottomRef.current.parentElement.removeEventListener("wheel", handleAutoScroll);
        };

    }, [message.id]);

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
      `}
        // dangerouslySetInnerHTML={{ __html: message.role === "user" ? message.content : streamMessages }}
        />
    );
});

export default StreamResponse;