import { Handle, Position, useUpdateNodeInternals, useReactFlow } from "reactflow";
import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  FiMic,
  FiX,
  FiGitBranch,
  FiChevronUp,
  FiChevronDown,
  FiPlus,
  FiArrowDown,
  FiCopy,
  FiEdit2,
  FiRefreshCw,
  FiVolume2,
  FiSend
} from "react-icons/fi";
import hljs from "highlight.js";

import "highlight.js/styles/github-dark.css"; // or any theme
import { useStates } from "../context/GlobalContext";
import { astToHtml } from "./AstToHTML";
import BlankChat from "../components/BlankChat";
import StreamResponse from "../components/StreamResponse";

const ChatNode = ({ id, data, selected }) => {
  const [input, setInput] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const [selectedApi, setSelectedApi] = useState("chatgpt");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const [scrollToBottomVisible, setScrollToBottomVisible] = useState(false);
  const chatRef = useRef(null);
  const nodeRef = useRef(null);
  const branchButtonRef = useRef(null);
  const updateNodeInternals = useUpdateNodeInternals();
  const initializedRef = useRef(false);

  const { toolState, setToolState } = useStates();
  const { getViewport } = useReactFlow();

  const [canvasSize, setCanvasSize] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const canvas = document.querySelector(".react-flow");

    if (!canvas) return;

    const updateSize = () => {
      const newWidth = canvas.clientWidth;
      const newHeight = canvas.clientHeight;

      setCanvasSize(prev => {
        // prevent unnecessary re-renders
        if (
          prev.width === newWidth &&
          prev.height === newHeight
        ) {
          return prev;
        }

        return {
          width: newWidth,
          height: newHeight,
        };
      });
    };

    // Initial measurement
    updateSize();

    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(canvas);

    return () => resizeObserver.disconnect();
  }, []);

  // set context if element branched
  useEffect(() => {
    if (!initializedRef.current && data?.context) {
      setInput(data.context);
      initializedRef.current = true;
    }
  }, [data?.context]);

  // adjust handels on scroll clamping
  useEffect(() => {
    const el = chatRef.current;
    if (!el) return;

    let ticking = false;

    const onScroll = () => {
      if (ticking) return;

      ticking = true;

      requestAnimationFrame(() => {
        const scrollTop = el.scrollTop;
        const chatHeight = el.clientHeight;
        const nodeHeight = nodeRef.current.clientHeight;

        const bottomTop =
          bottomRef.current.getBoundingClientRect().top;
        const nodeTop =
          nodeRef.current.getBoundingClientRect().top;

        data.onAddHandle(prev =>
          prev.map(handle => {
            const visibleY = handle.originalY - scrollTop;
            let clampedY = handle.originalY;

            if (visibleY < 0) {
              clampedY = scrollTop - 40;
            } else if (visibleY > nodeHeight) {
              clampedY = scrollTop + nodeHeight - 40;
            }

            if (clampedY !== handle.y) {
              return { ...handle, y: clampedY };
            }

            return handle;
          })
        );

        updateNodeInternals(id);

        ticking = false;
      });
    };

    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [id, updateNodeInternals]);

  // ai response
  const handleSend = async (overrideInput) => {
    const messageToSend = overrideInput ?? input;

    if (!messageToSend?.trim() || loading) return;

    const newUserNode = {
      timestamp: Date.now(),
      id: crypto.randomUUID(),
      parent: id,
      role: "user",
      ast: null,
      html: `<p>${messageToSend}</p>`
    };

    data.onAddAst(prev => [...prev, newUserNode]);

    setInput("");
    setLoading(true);

    let assistantNode;

    try {
      const res = await fetch("http://localhost:8000/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api: selectedApi,
          message: messageToSend
        })
      });

      const result = await res.json();

      assistantNode = {
        timestamp: Date.now(),
        id: crypto.randomUUID(),
        parent: id,
        role: "assistant",
        ast: result.output,
        html: await astToHtml(result.output)
      };
    } catch (err) {
      console.log(err)
      assistantNode = {
        timestamp: Date.now(),
        id: crypto.randomUUID(),
        parent: id,
        role: "assistant",
        ast: null,
        html: "<p>⚠ Server error.</p>"
      };
    }

    data.onAddAst(prev => [...prev, assistantNode]);
    setLoading(false);
  };

  // update messages after ast updation
  const messages = useMemo(() => {
    console.log(data.ast)
    return data.ast.filter(a => a.parent === id).map(node => ({
      timestamp: node.timestamp,
      id: node.id,
      role: node.role,
      content: node.html
    }));
  }, [data.ast, id]);

  // smooth scroll when message added and code highlighting
  useEffect(() => {
    const newUserMessage = messages[messages.length - 1];
    const newUserMessageElement = newUserMessage ? document.getElementById(newUserMessage.id) : undefined;

    if (newUserMessageElement && newUserMessage.role === "user") {
      newUserMessageElement.scrollIntoView({ behavior: "smooth" });
    } else return

    // bottomRef.current?.scrollIntoView({ behavior: "smooth" });

    document.querySelectorAll("pre code").forEach((block) => {
      hljs.highlightElement(block);
    });
  }, [messages, loading]);

  //element level branching (hover)
  useEffect(() => {
    let prevEl = null;

    const handleMove = (e) => {
      if (!toolState.branch) return;

      const el = document.elementFromPoint(e.clientX, e.clientY);

      // Remove style from previous element
      if (prevEl && prevEl !== el) {
        prevEl.classList.remove("bg-blue-100", "text-black", "w-fit");
      }

      if (e.ctrlKey) return;

      // Add style to new element
      if (el && !el.classList.contains("not-branchable")) {
        el.classList.add("bg-blue-100", "text-black", "w-fit");

        // show branch button
        const el_rect = el.getBoundingClientRect();
        const node_rect = nodeRef.current.getBoundingClientRect();
        const viewport = getViewport();

        const x =
          (el_rect.left - node_rect.left + el_rect.width) / viewport.zoom + 10;

        const y =
          (el_rect.top - chatRef.current.getBoundingClientRect().top) / viewport.zoom + chatRef.current.scrollTop;

        branchButtonRef.current.style.top = `${y}px`;
        branchButtonRef.current.style.left = `${x}px`;

        branchButtonRef.current.onclick = () => {
          createBranch(el_rect, el.innerText);
        };

        prevEl = el;
      } else {
        prevEl = null;
      }
    };

    const node = chatRef.current;
    node?.addEventListener("mousemove", handleMove);

    return () => {
      node?.removeEventListener("mousemove", handleMove);
    };
  }, [toolState.branch, data.ast]);

  // home button function ( make node activenode / focus node )
  useEffect(() => {
    console.log(toolState.home.state)
    if (toolState.home.state && selected) {
      console.log("setting")
      setToolState(prev => ({
        ...prev,
        home: { ...toolState.home, state: true, activeNode: id }
      }))
    }
  }, [selected]);

  // creating branch from element
  async function createBranch(newBranchRect, context) {

    const newBranchElt = document.elementFromPoint(newBranchRect.x, newBranchRect.y);

    const ast_id = newBranchElt.closest(".msg-container").id;
    const targetNodeId = newBranchElt.getAttribute("data-node-id");

    const chatRect = chatRef.current.getBoundingClientRect();
    const viewport = getViewport();

    const relativeX =
      (newBranchRect.left - chatRect.left + newBranchRect.width) /
      viewport.zoom +
      10;

    const relativeY =
      (newBranchRect.top - chatRect.top - 3) / viewport.zoom +
      chatRef.current.scrollTop;

    const newHandle = {
      id: `handle-${crypto.randomUUID()}`,
      parent: id,
      x: relativeX,
      originalY: relativeY,
      y: relativeY,
      type: "source",
    };

    // add new node 
    data.onAddChild?.(
      id,
      newHandle,
      { x: relativeX + 300, y: relativeY - chatRef.current.scrollTop - 80 },
      context,
      ast_id
    );

    // update ast 
    const msg_ast = data.ast.find(a => a.id === ast_id)?.ast;

    if (!msg_ast) return;

    const updatedTree = updateNodeById(
      msg_ast,
      targetNodeId,

      (node) => {
        const existingClasses = node.data?.hProperties?.className || [];

        return {
          ...node,
          data: {
            ...node.data,
            branchId: newHandle.id,
            hProperties: {
              ...(node.data?.hProperties || {}),
              className: existingClasses.includes("branched") ? existingClasses : [...existingClasses, "branched", `branchedto-${newHandle.id}`]
            }
          }
        }
      }
    )

    const updatedHtml = await astToHtml(updatedTree);

    data.onAddAst(prev =>
      prev.map(m =>
        m.id === ast_id ? {
          ...m,
          ast: updatedTree,
          html: updatedHtml
        } : m
      )
    )
    // console.log(updatedTree, updatedHtml)
    setToolState(prev => ({
      ...prev,
      branch: false
    }))
    updateNodeInternals(id);
  }

  function updateNodeById(node, nodeId, updater) {
    if (!node) return node;

    // If this is the target node
    if (node.data?.nodeId === nodeId) {
      return updater(node);  // return NEW modified node
    }

    // If node has children, recurse
    if (node.children && Array.isArray(node.children)) {
      return {
        ...node,
        children: node.children.map(child =>
          updateNodeById(child, nodeId, updater)
        )
      };
    }

    return node;
  }

  const handleCopy = (html) => {
    const text = new DOMParser().parseFromString(html, "text/html").body.textContent;
    navigator.clipboard.writeText(text);
  };

  const handleEdit = (event, msg) => {
    const container = document.getElementById(msg.id);
    if (!container) return;

    const msgElement = container.firstElementChild;
    if (!msgElement) return;

    msgElement.contentEditable = "true";
    msgElement.style.width = "100%";
    msgElement.focus();

    // 🔹 Move cursor to end
    const range = document.createRange();
    const selection = window.getSelection();

    range.selectNodeContents(msgElement);
    range.collapse(false); // collapse to end

    selection.removeAllRanges();
    selection.addRange(range);

    // 🔹 Handle Enter (submit)
    const handleKeyDown = (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();

        const newText = msgElement.innerText.trim();
        msgElement.blur(); // trigger focusout

        if (newText) {
          data.onAddAst(prev => prev.filter((a, index) => index < data.ast.indexOf(data.ast.find(a => a.id === msg.id))))
          handleSend(newText);
        }
      }
    };

    // 🔹 Handle focus out
    const handleBlur = () => {
      msgElement.contentEditable = "false";
      msgElement.style.width = "fit-content";

      msgElement.removeEventListener("keydown", handleKeyDown);
      msgElement.removeEventListener("blur", handleBlur);
    };

    msgElement.addEventListener("keydown", handleKeyDown);
    msgElement.addEventListener("blur", handleBlur);
  };

  const handleRegenerate = () => {
    const input = new DOMParser().parseFromString(messages[messages.length - 2].content, "text/html").body.textContent;
    data.onAddAst(prev => prev.filter((a, index) => index < data.ast.length - 2))
    handleSend(input.trim());
  };

  const handleReadAloud = (html) => {
    const text = new DOMParser().parseFromString(html, "text/html").body.textContent;
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
  };

  const isVisible = selected;
  const isFocused = toolState.home.activeNode === id;

  return (
    <>
      {/* if element branch */}
      {
        data.context && !isFocused ? (
          <>
            <Handle type="target" position={Position.Left}
              style={{
                position: "absolute",
                top: 22,
                left: 0,
                transform: "translate(-50%, -50%)",
                zIndex: 1000
              }} />

            <div className="not-branchable mb-2 p-2 px-3 rounded-xl font-bold text-lg text-neutral-800 bg-blue-200 w-fit max-w-[460px]" dangerouslySetInnerHTML={{ __html: data.context }} />
          </>
        ) : (
          <Handle type="target" position={Position.Top} />
        )
      }
      
      <div
        style={
          isFocused
            ? {
              width: canvasSize.width,
              height: canvasSize.height,
            }
            : undefined
        }

        className={`node group bg-gray-50 shadow-xl rounded-xl max-h-screen border border-gray-200 overflow-hidden flex flex-col justify-between
    ${collapsed ? "min-h-0" : "min-h-[80px]"
          }

      ${isFocused
            ? "bg-transparent !rounded-none border-0 shadow-non"
            : "w-[460px] border border-gray-200"
          }
      
    `}

        ref={nodeRef}
      >
        {/* HEADER */}
        <div
          className={`
          w-full bg-gray-50 px-3 py-2
          flex items-center justify-between
          transition-all duration-200 z-10
          ${!collapsed && (
              isVisible
                ? "py-2 opacity-100"
                : isFocused ? "" : "py-0 h-0 opacity-0 group-hover:py-2 group-hover:h-auto group-hover:opacity-100"
            )
            }

          ${isFocused && "!bg-transparent nodrag nopan"} 
        `}
        >
          <div className="flex items-center gap-2">
            <select
              value={selectedApi}
              onChange={(e) => setSelectedApi(e.target.value)}
              className="text-xs border border-gray-300 rounded px-2 py-1 bg-white outline-none cursor-pointer"
            >
              <option value="chatgpt">ChatGPT</option>
              <option value="gemini">Gemini</option>
            </select>

            <button
              onClick={() => setCollapsed(!collapsed)}
              className="text-gray-500 hover:text-black"
            >
              {collapsed ? <FiChevronDown size={16} /> : <FiChevronUp size={14} />}
            </button>
          </div>

          <button
            onClick={() => data.onDelete?.(id)}
            className="p-1 text-gray-400 hover:text-red-500"
          >
            <FiX size={16} />
          </button>
        </div>

        {/* CHAT */}
        {!collapsed && (
          <div
            className={`group/branch flex-1 p-3 pt-0 space-y-3 transition-all duration-200 cursor-default min-h-0 overflow-x-hidden overflow-y-auto scroll-smooth custom-scroll not-branchable relative ${isVisible && "nodrag nopan"} ${isFocused && "nodrag nopan"}
            `}

            // onWheel={(e) => {
            //   e.stopPropagation();
            //   const el = e.currentTarget;
            //   el.scrollTop += e.deltaY;
            // }}

            ref={chatRef}
          >

            <BlankChat messages={messages} setInput={setInput} />

            <Handle id="dummy-init" type="source" position={Position.Left} style={{ opacity: 0, position: "absolute" }} />

            {data.dynamicHandles.filter(dh => dh.parent === id && dh.parent !== toolState.home.activeNode).map((handle) => {
              if (handle.parent !== id) return;
              return (
                <Handle
                  key={handle.id}
                  id={handle.id}
                  type="source"
                  position={Position.Right}
                  style={{
                    position: "absolute",
                    left: handle.x,
                    top: handle.y,
                    transform: "translate(-50%, -50%)",

                    width: 16,
                    height: 16,
                    background: "#2563eb",
                    opacity: 0.6,
                    border: "2px solid white",
                    borderRadius: "50%",
                  }}
                />
              );
            })}

            <div className="lg:max-w-3xl max-w-2xl mx-auto">
            {messages.map((msg, index) => (
              <div
                key={msg.id}
                id={msg.id}
                className={`msg-container not-branchable group flex flex-col select-text ${msg.role === "user" ? "items-end group/tools !mt-4" : "items-start !m-0"
                  }`}
              >
                {/* Message Bubble */}

                <StreamResponse isLast={index === messages.length - 1 && !toolState.branch} message={msg} bottomRef={bottomRef} setScrollToBottomVisible={setScrollToBottomVisible} updateNodeInternals={updateNodeInternals} />

                {/* Action Row */}
                <div className={`
                flex gap-2 mt-1
                text-gray-400

                ${msg.role === "user" ? "opacity-0" : "opacity-100"}
                
                transition-all
                duration-300
                group-hover/tools:opacity-100
              `}>

                  {msg.role === "user" ? (
                    <>
                      <button
                        onClick={(e) => handleEdit(e, msg)}
                        className="p-1.5 rounded-md hover:bg-gray-200 hover:text-black transition"
                        title="Edit"
                      >
                        <FiEdit2 size={16} />
                      </button>

                      <button
                        onClick={() => handleCopy(msg.content)}
                        className="p-1.5 rounded-md hover:bg-gray-200 hover:text-black transition"
                        title="Copy"
                      >
                        <FiCopy size={16} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleCopy(msg.content)}
                        className="p-1.5 rounded-md hover:bg-gray-200 hover:text-black transition"
                        title="Copy"
                      >
                        <FiCopy size={16} />
                      </button>

                      <button
                        onClick={() => handleRegenerate()}
                        className="p-1.5 rounded-md hover:bg-gray-200 hover:text-black transition"
                        title="Regenerate"
                      >
                        <FiRefreshCw size={16} />
                      </button>

                      {/* <button
                      onClick={() => handleReadAloud(msg.content)}
                      className="p-1.5 rounded-md hover:bg-gray-200 hover:text-black transition"
                      title="Read aloud"
                    >
                      <FiVolume2 size={18} />
                    </button> */}
                    </>
                  )}
                </div>
              </div>
            ))}
            </div>

            {loading && (
              <div className="bg-gray-100 text-gray-500 px-3 py-2 rounded-2xl text-sm animate-pulse">
                Thinking...
              </div>
            )}

            {/* branch element button */}
            {toolState.branch && messages.length > 0 && (
              <button
                ref={branchButtonRef}
                className="absolute right-1 top-1 -translate-y-1/2 w-9 h-9
            rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center shadow-lg

            scale-0 opacity-0
            group-hover/branch:opacity-100
            group-hover/branch:scale-100
            transition-all duration-150
            "
              >
                <FiGitBranch size={20} />
              </button>
            )}
            <div ref={bottomRef} />
          </div>
        )}

        {/* FOOTER */}
        {!collapsed && (
          <div
            className={`
            w-full bg-gray-50 p-3
            flex items-center gap-2 transition-all duration-200 z-10 cursor-default nodrag nopan
            ${isVisible
                ? "py-2 opacity-100"
                : isFocused ? "!bg-transparent" : "py-0 h-0 opacity-0 group-hover:py-2 group-hover:h-auto group-hover:opacity-100"
              }

            ${isFocused && "!bg-gray-50 rounded-full pl-4 mb-3 lg:max-w-3xl max-w-2xl m-auto"}
          `}
          >
            <button className="p-1 text-gray-600 hover:text-black">
              <FiMic size={22} />
            </button>

            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend(undefined)}
              placeholder="Type a message..."
              className={`flex-1 px-3 py-2 rounded-full border border-gray-300 focus:outline-none
              ${isFocused && "bg-transparent border-0 px-1"}`}
            />

            <button
              onClick={() => handleSend(undefined)}
              disabled={!input.trim() || loading}
              className="p-2.5 rounded-full bg-blue-500 text-white text-xs hover:bg-blue-600 disabled:opacity-40 transition"
            >
              <FiSend size={22} />
            </button>
          </div>
        )}

        {/* scroll to bottom button  */}
        {
          !collapsed && (
            <button className={`
            absolute bg-gray-200 p-3 rounded-full left-1/2 translate-x-[-50%] shadow-3xl hover:bg-gray-300 transition-all duration-200
            ${scrollToBottomVisible ? "opacity-1" : "opacity-0"}

            ${(isVisible && !isFocused) ? "bottom-16" : "bottom-4"}

            ${isFocused ? "bottom-[5rem] bg-gray-50" : "group-hover:bottom-16"}
            
            `} onClick={() => bottomRef.current?.scrollIntoView({ behavior: "smooth" })}>
              <FiArrowDown size={20} />
            </button>
          )
        }

        {/* Branch Node Button */}
        <div className="absolute bottom-0 left-0 w-full h-2 cursor-crosshair group/branch">

          <div className="absolute bottom-0 left-0 w-full h-full z-20" />

          <div className="absolute bottom-0 left-0 w-full flex justify-center pointer-events-none">
            <button
              onClick={() => data.onAddChild?.(id)}
              className={`
            mb-[-16px] bg-white border border-gray-300 shadow-md rounded-full opacity-0 scale-90 p-2
            transition-all duration-200 z-20 hover:bg-black hover:text-white
            group-hover/branch:opacity-100 
            group-hover/branch:scale-100
            pointer-events-auto
            `}
            >
              <FiGitBranch size={16} />
            </button>
          </div>

        </div>

        <Handle type="source" position={Position.Bottom} />
      </div>
    </>
  );
};

export default React.memo(ChatNode);