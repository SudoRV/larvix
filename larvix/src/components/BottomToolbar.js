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
    `p-2 rounded-lg transition-all ${isActive
      ? "bg-[#4a4a4a] shadow-inner scale-95"
      : "hover:bg-[#3a3a3a]"
    }`;

  
    const isFocused = toolState.home.activeNode !== null;

  return (
    <div className={`absolute bottom-2 flex items-center justify-center
    ${isFocused ? "w-fit right-2" : "w-full"}
    `}>

      <div className={`relative flex items-center gap-4 bg-[#1E1E1E] px-4 py-2 rounded-xl shadow-2xl text-white transition-all duration-300
        ${isFocused ? "ml-auto mr-2 w-[4rem]" : ""}`}>

        {/* Home (stateless action) */}
        <div className={`absolute p-3 bg-transparent border border-dashed border-neutral-700 rounded-lg text-sm text-neutral-900 top-[-60px] left-4 transition-all duration-300 flex gap-2 select-none ${toolState.home.message ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
          {toolState.home.description && (
            <p className="absolute -top-16 left-0">Selecting a node will open it in the full canvas as a standalone chat.</p>
          )}

          <p>Select Node to focus on!</p>

          <span className="w-5 h-5 flex justify-center items-center border border-neutral-700 rounded-full text-xs italic font-bold cursor-pointer hover:bg-neutral-50"
            onClick={() => setToolState(prev => ({
              ...prev,
              home: { ...toolState.home, description: !toolState.home.description }
            }))} >i</span>
        </div>

        <button
          onClick={() => {
            setToolState(prev => ({
              ...prev,
              home: { ...toolState.home, state: !toolState.home.state, activeNode: null, message: isFocused ? false : !toolState.home.message }
            }))
          }}
          className={toggleStyle(toolState.home.state)}
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