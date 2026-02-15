import { useState, useRef, useEffect } from "react";
import {
  FiHome,
  FiGitBranch,
  FiMessageSquare,
  FiMic,
  FiSettings,
  FiChevronDown,
} from "react-icons/fi";
import { useStates } from "../context/GlobalContext";

export default function BottomToolbar() {
  // Tool states (independent)
  const { toolState, setToolState } = useStates();

  // Export dropdown state (specific naming)
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const exportMenuRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target)) {
        setIsExportMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const toggleTool = (toolName) => {
    setToolState((prev) => ({
      ...prev,
      [toolName]: !prev[toolName],
    }));
  };

  const handleExport = (type) => {
    setIsExportMenuOpen(false);
    console.log("Exporting:", type);
  };

  const toggleStyle = (isActive) =>
    `p-2 rounded-lg transition-all ${
      isActive
        ? "bg-[#4a4a4a] shadow-inner scale-95"
        : "hover:bg-[#4a4a4a]"
    }`;

  return (
    <div className="absolute w-full bottom-2 flex items-center justify-center">

      <div className="flex items-center gap-4 bg-[#1E1E1E] px-4 py-1 rounded-xl shadow-2xl text-white">

        {/* Home (stateless action) */}
        <button
          onClick={() => console.log("Home clicked")}
          className="p-2 rounded-lg hover:bg-[#4a4a4a]"
        >
          <FiHome size={18} />
        </button>

        {/* Branch (toggle) */}
        <button
          onClick={() => toggleTool("branch")}
          className={toggleStyle(toolState.branch)}
        >
          <FiGitBranch size={18} />
        </button>

        {/* Voice (toggle) */}
        <button
          onClick={() => toggleTool("voice")}
          className={toggleStyle(toolState.voice)}
        >
          <FiMic size={18} />
        </button>

        {/* Comment (toggle) */}
        <button
          onClick={() => toggleTool("comment")}
          className={toggleStyle(toolState.comment)}
        >
          <FiMessageSquare size={18} />
        </button>

        {/* Export Dropdown */}
        <div className="relative" ref={exportMenuRef}>
          <button
            onClick={() => setIsExportMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 p-1 px-2 hover:bg-[#4a4a4a] rounded-lg"
          >
            Export
            <FiChevronDown size={14} />
          </button>

          {isExportMenuOpen && (
            <div className="absolute bottom-12 left-0 w-40 bg-[#1E1E1E] rounded-lg shadow-xl border border-neutral-700 overflow-hidden z-50 text-sm">
              <button
                onClick={() => handleExport("mindmap-image")}
                className="w-full text-left px-4 py-2 hover:bg-[#404040]"
              >
                Mind Map (Image)
              </button>

              <button
                onClick={() => handleExport("pdf")}
                className="w-full text-left px-4 py-2 hover:bg-[#404040]"
              >
                PDF
              </button>

              <button
                onClick={() => handleExport("text")}
                className="w-full text-left px-4 py-2 hover:bg-[#404040]"
              >
                Plain Text
              </button>

              <button
                onClick={() => handleExport("doc")}
                className="w-full text-left px-4 py-2 hover:bg-[#404040]"
              >
                DOC
              </button>
            </div>
          )}
        </div>

        {/* Settings (toggle) */}
        <button
          onClick={() => toggleTool("settings")}
          className={toggleStyle(toolState.settings)}
        >
          <FiSettings size={18} />
        </button>

      </div>
    </div>
  );
}