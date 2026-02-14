import { Handle, Position } from "reactflow";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import {
  FiMic,
  FiX,
  FiGitBranch,
  FiChevronUp,
  FiChevronDown
} from "react-icons/fi";

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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

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
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: result.output || "No response" }
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠ Server error." }
      ]);
    }

    setLoading(false);
  };

  const isVisible = selected;

  return (
    <div className={`group bg-white shadow-xl rounded-xl w-[400px] border border-gray-200 overflow-hidden flex flex-col justify-between
    ${collapsed ? "min-h-0" : "min-h-[80px]"
      }`}>

      <Handle type="target" position={Position.Top} />

      {/* HEADER */}
      <div
        className={`
          w-full bg-gray-50 px-3 py-2
          flex items-center justify-between
          transition-all duration-200 z-10 cursor-grab active:cursor-grabbing
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
          className={`flex-1 p-3 space-y-3 transition-all duration-200 cursor-default ${
            isVisible && "nodrag"
          }`}
        >
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 text-gray-500">

              <p className="text-sm font-medium text-gray-600">
                Start a conversation
              </p>

              <div className="flex flex-wrap justify-center gap-2">
                {[
                  "Ask anything",
                  "Summarize topic",
                  "Generate ideas",
                  "Explain concept",
                  "Branch chat"
                ].map((item) => (
                  <button
                    key={item}
                    onClick={() => setInput(item)}
                    className="
            px-4 py-2 text-xs rounded-full
            bg-white border border-gray-300
            hover:bg-black hover:text-white
            transition
          "
                  >
                    {item}
                  </button>
                ))}
              </div>

            </div>
          )}

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex select-text ${msg.role === "user" ? "justify-end" : "justify-start"
                }`}
            >
              <div
                className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm shadow-sm ${msg.role === "user"
                  ? "bg-black text-white rounded-br-sm"
                  : "bg-gray-100 text-gray-800 rounded-bl-sm"
                  }`}
              >
                <ReactMarkdown>{msg.content}</ReactMarkdown>
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
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default ChatNode;