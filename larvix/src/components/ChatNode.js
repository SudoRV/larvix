import { Handle, Position, useUpdateNodeInternals, useReactFlow } from "reactflow";
import { useState, useRef, useEffect, useMemo } from "react";
import {
  FiMic,
  FiX,
  FiGitBranch,
  FiChevronUp,
  FiChevronDown,
  FiPlus,
  FiArrowDown
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
  // const [messages, setMessages] = useState([]);
  const [ast, setAst] = useState([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const [scrollToBottomVisible, setScrollToBottomVisible] = useState(false);
  const chatRef = useRef(null);
  const nodeRef = useRef(null);
  const branchButtonRef = useRef(null);
  const updateNodeInternals = useUpdateNodeInternals();
  const newBranchRef = useRef(null);
  const [dynamicHandles, setDynamicHandles] = useState([]);
  const initializedRef = useRef(false);

  const { toolState, setToolState } = useStates();
  const { getViewport } = useReactFlow();


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

    const onScroll = () => {

      if (bottomRef.current.getBoundingClientRect().top - nodeRef.current.getBoundingClientRect().top - chatRef.current.clientHeight <= 0) {
        setScrollToBottomVisible(false);
      } else {
        setScrollToBottomVisible(true);
      }

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

  // ai response
  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const newUserNode = {
      id: crypto.randomUUID(),   // safer than ast.length
      role: "user",
      ast: null,
      html: `<p>${input}</p>`
    };

    setAst(prev => [...prev, newUserNode]);

    setInput("");
    setLoading(true);

    let assistantNode;

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

      assistantNode = {
        id: crypto.randomUUID(),
        role: "assistant",
        ast: result.output,
        html: await astToHtml(result.output)
      };
    } catch (err) {
      console.log(err)
      assistantNode = {
        id: crypto.randomUUID(),
        role: "assistant",
        ast: null,
        html: "<p>⚠ Server error.</p>"
      };
    }

    setAst(prev => [...prev, assistantNode]);
    setLoading(false);
  };

  // update messages after ast updation
  const messages = useMemo(() => {
    console.log("ast changed: \n", ast);
    return ast.map(node => ({
      id: node.id,
      role: node.role,
      content: node.html
    }));
  }, [ast]);

  // smooth scroll when message added
  useEffect(() => {
    // bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

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

    const newBranchElt = document.elementFromPoint(newBranchRect.x, newBranchRect.y);

    const chatRect = chatRef.current.getBoundingClientRect();
    const viewport = getViewport();

    const relativeX =
      (newBranchRect.left - chatRect.left + newBranchRect.width) /
      viewport.zoom +
      10;

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

    // update ast 
    const ast_id = newBranchElt.closest(".msg-container").id;
    const targetNodeId = newBranchElt.getAttribute("data-node-id");

    const msg_ast = ast.find(a => a.id === ast_id)?.ast;

    if(!msg_ast) return;

    const updatedTree = updateNodeById(
      msg_ast,
      targetNodeId,

      (node) => {
        const existingClasses = node.data?.hProperties?.className || [];

        return {
          ...node,
          data: {
            ...node.data,
            newHandleId: newHandle.id,
            hProperties: {
              ...(node.data?.hProperties || {}),
              className: existingClasses.includes("branched") ? existingClasses : [...existingClasses, "branched"]
            }
          }
        }
      }
    )

    const updatedHtml = await astToHtml(updatedTree);

    setAst(prev =>
      prev.map(m =>
        m.id === ast_id ? {
          ...m,
          ast: updatedTree,
          html: updatedHtml
        } : m
      )
    )

    const updateTimeout = setTimeout(() => {
      updateNodeInternals(id);
      setToolState((prev) => ({ ...prev, branch: false }));
      clearInterval(updateTimeout);
    })
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
          className={`flex-1 p-3 pt-0 space-y-3 transition-all duration-200 cursor-default max-h-screen overflow-y-auto custom-scroll not-branchable relative ${isVisible && "nodrag"
            }`}

          onWheel={(e) => {
            e.stopPropagation();
            const el = e.currentTarget;
            el.scrollTop += e.deltaY;
          }}

          ref={chatRef}
        >
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 text-gray-500 not-branchable pt-3">

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

          {messages.map((msg, index) => (
            <div
              key={index}
              id={msg.id}
              className={`msg-container flex select-text not-branchable ${msg.role === "user" ? "justify-end" : "justify-start"
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

      {/* scroll to bottom button  */}
      <button className={`
        absolute bottom-14 bg-gray-200 p-3 rounded-full left-1/2 translate-x-[-50%] shadow-xl hover:bg-gray-300 transition-all duration-200 ${scrollToBottomVisible ? "opacity-1" : "opacity-0"}
        `} onClick={() => bottomRef.current?.scrollIntoView({ behavior: "smooth" })}>
        <FiArrowDown size={20} />
      </button>

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