import { Handle, Position, useUpdateNodeInternals, useReactFlow } from "reactflow";
import { useState, useRef, useEffect } from "react";
import {
  FiMic,
  FiX,
  FiGitBranch,
  FiChevronUp,
  FiChevronDown,
  FiPlus
} from "react-icons/fi";
import { useStates } from "../context/GlobalContext";

import { astToHtml } from "./AstToHTML";

export const SendButton = ({ onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="px-3 py-2 rounded-lg bg-black text-white text-xs hover:bg-gray-800 disabled:opacity-40 transition"
  >
    Send
  </button>
);

const ChatNode = ({ id, data, selected }) => {
  const [input, setInput] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const [selectedApi, setSelectedApi] = useState("chatgpt");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const chatRef = useRef(null);
  const nodeRef = useRef(null);
  const branchButtonRef = useRef(null);
  const updateNodeInternals = useUpdateNodeInternals();
  const newBranchRef = useRef(null);
  const [dynamicHandles, setDynamicHandles] = useState([]);

  const { toolState, setToolState } = useStates();
  const { getViewport } = useReactFlow();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const el = chatRef.current;
    if (!el) return;

    const onScroll = () => {

      setDynamicHandles(prev =>
        prev.map(handle => {
          const visibleY = handle.originalY - chatRef.current.scrollTop;

          let clampedY = 0;

          if (clampedY !== handle.originalY) {
            updateNodeInternals(id);
          }

          if (visibleY < 0) {
            clampedY = chatRef.current.scrollTop;
          } else if (visibleY > nodeRef.current.clientHeight) {
            clampedY = chatRef.current.scrollTop + nodeRef.current.clientHeight - 100;
          } else {
            clampedY = handle.originalY;
          }

          return {
            ...handle,
            y: clampedY
          };
        })
      )
    };

    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [id, updateNodeInternals]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api: selectedApi,
          message: input
        })
      });

      const result = await res.json();
      const html = await astToHtml(result.output);

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: html || "No response" }
      ]);
    } catch (err) {
      console.log(err)
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠ Server error." }
      ]);
    }

    setLoading(false);
  };

  //element level branching
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
          (el_rect.top - node_rect.top + el_rect.height / 2) / viewport.zoom;

        branchButtonRef.current.style.top = `${y}px`;
        branchButtonRef.current.style.left = `${x}px`;

        branchButtonRef.current.onclick = () => {
          createBranch(el_rect, el.innerHTML);
        };
        branchButtonRef.current.classList.add("opacity-100");

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
  }, [toolState]);

  const isVisible = selected;

  // creating branch from element
  async function createBranch(newBranchRect, context) {
    const chatRect = chatRef.current.getBoundingClientRect();
    const viewport = getViewport();

    const relativeX =
      (newBranchRect.left - chatRect.left + newBranchRect.width) /
      viewport.zoom +
      20;

    const relativeY =
      (newBranchRect.top - chatRect.top) / viewport.zoom +
      chatRef.current.scrollTop;

    const newHandle = {
      id: `handle-${Date.now()}`,
      x: relativeX,
      originalY: relativeY,
      y: relativeY,
      type: "source",
    };

    setDynamicHandles((prev) => [...prev, newHandle]);
    // add new node 
    data.onAddChild?.(
      id,
      newHandle.id,
      { x: relativeX + 300, y: relativeY - chatRef.current.scrollTop - 80 },
      context
    );

    const updateTimeout = setTimeout(() => {
      updateNodeInternals(id);
      setToolState((prev) => ({ ...prev, branch: false }));
      clearInterval(updateTimeout);
    })
  }

  return (
    <div className={`group bg-gray-50 shadow-xl rounded-xl w-[400px] border border-gray-200 overflow-hidden flex flex-col justify-between
    ${collapsed ? "min-h-0" : "min-h-[80px]"
      }`}

      ref={nodeRef}
    >
      {/* if element branch */}
      {
        data.context ? (
          <>
            <Handle type="target" position={Position.Left}
              style={{
                position: "absolute",
                top: 24,
                left: 0,
                transform: "translate(-50%, -50%)",
                zIndex: 1000
              }} />

            <div className="prose prose-sm max-w-none not-branchable  p-2 px-3 text-lg bg-blue-100" dangerouslySetInnerHTML={{ __html: data.context }} />
          </>
        ) : (
          <Handle type="target" position={Position.Top} />
        )
      }

      {/* HEADER */}
      <div
        className={`
          w-full bg-gray-100 px-3 py-2
          flex items-center justify-between
          transition-all duration-200 z-10 cursor-grab active:cursor-grabbing shadow-md
          ${!collapsed && (
            isVisible
              ? "py-2 opacity-100"
              : "py-0 h-0 opacity-0 group-hover:py-2 group-hover:h-auto group-hover:opacity-100"
          )
          }
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
          className={`flex-1 p-3 space-y-3 transition-all duration-200 cursor-default max-h-screen overflow-y-auto custom-scroll not-branchable relative ${isVisible && "nodrag"
            }`}

          onWheel={(e) => {
            e.stopPropagation();
            const el = e.currentTarget;
            el.scrollTop += e.deltaY;
          }}

          ref={chatRef}
        >
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 text-gray-500 not-branchable">

              <p className="text-sm font-medium text-gray-600 not-branchable">
                Start a conversation
              </p>

              <div className="flex flex-wrap justify-center gap-2 not-branchable">
                {[
                  "Ask anything",
                  "Summarize topic",
                  "Generate ideas",
                  "backpropagation",
                  "Branch chat"
                ].map((item) => (
                  <button
                    key={item}
                    onClick={() => setInput(item)}
                    className="
            px-4 py-2 text-xs rounded-full
            bg-white border border-gray-300
            hover:bg-black hover:text-white
            transition not-branchable
          "
                  >
                    {item}
                  </button>
                ))}
              </div>

            </div>
          )}

          <Handle
            id="dummy-init"
            type="source"
            position={Position.Left}
            style={{ opacity: 0, position: "absolute" }}
          />

          {dynamicHandles.map((handle) => {
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
                }}
              />
            );
          })}

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex select-text not-branchable ${msg.role === "user" ? "justify-end" : "justify-start"
                }`}
            >
              <div
                className={`px-3 py-2 rounded-lg text-sm prose prose-sm max-w-none not-branchable ${msg.role === "user"
                  ? "bg-neutral-800 text-white"
                  : " text-gray-800"
                  }`}

                dangerouslySetInnerHTML={{ __html: msg.content }}
              >
              </div>
            </div>
          ))}

          {loading && (
            <div className="bg-gray-100 text-gray-500 px-3 py-2 rounded-2xl text-sm animate-pulse">
              Thinking...
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      )}

      {/* FOOTER */}
      {!collapsed && (
        <div
          className={`
            w-full bg-gray-100 p-3
            flex items-center gap-2 transition-all duration-200 z-10 cursor-default
            ${isVisible
              ? "py-2 opacity-100 nodrag"
              : "py-0 h-0 opacity-0 group-hover:py-2 group-hover:h-auto group-hover:opacity-100"
            }
          `}
        >
          <button className="text-gray-500 hover:text-black">
            <FiMic size={16} />
          </button>

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
            className="flex-1 text-xs px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
          />

          <SendButton
            onClick={handleSend}
            disabled={!input.trim() || loading}
          />
        </div>
      )}

      {/* Branch Button */}
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

      {/* branch element button */}
      {toolState.branch && (
        <button
          ref={branchButtonRef}
          className="
            absolute
            -right-3
            top-1/2
            -translate-y-1/2
            w-6
            h-6
            rounded-full
            bg-blue-500
            hover:bg-blue-600
            text-white
            flex
            items-center
            justify-center
            shadow-lg
            transition-all
            duration-100
          "
        >
          <FiPlus size={18} />
        </button>
      )}

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default ChatNode;