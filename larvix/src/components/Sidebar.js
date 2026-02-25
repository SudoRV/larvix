import { FiFolder, FiMenu, FiPlus, FiSettings, FiX } from "react-icons/fi";

export default function Sidebar({ open, setOpen }) {
  return (
    <aside
      className={`
        bg-neutral-850 text-white h-full
        transition-all duration-300
        ${open ? "w-72" : "w-16 items-center"}
        flex flex-col
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-700">
        {open && <span className="font-semibold">New Chat</span>}

        <button
          onClick={() => setOpen(!open)}
          className="text-neutral-400 hover:text-white transition"
        >
          {open ? <FiX size={18} /> : <FiMenu size={18} />}
        </button>
      </div>

      {/* Projects */}
      <div className="p-3 text-sm space-y-2">
        {open && (
          <p className="text-gray-500 text-xs uppercase tracking-wide px-2">
            Projects
          </p>
        )}

        <div className="flex items-center gap-3 py-2 px-2 hover:bg-neutral-800 rounded cursor-pointer transition">
          <FiFolder size={18} />
          {open && <span>AI Larvix</span>}
        </div>

        <div className="flex items-center gap-3 py-2 px-2 hover:bg-neutral-800 rounded cursor-pointer transition">
          <FiFolder size={18} />
          {open && <span>Lab Link</span>}
        </div>
      </div>

      {/* Chats */}
      <div className="p-3 text-sm space-y-2">
        {open && (
          <p className="text-gray-500 text-xs uppercase tracking-wide px-2">
            Your Chats
          </p>
        )}

        <div className="py-2 px-2 hover:bg-neutral-800 rounded cursor-pointer transition">
          {open ? "Backpropagation Explained" : "BP"}
        </div>

        <div className="py-2 px-2 hover:bg-neutral-800 rounded cursor-pointer transition">
          {open ? "Transformer Attention" : "TA"}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto p-3 border-t border-neutral-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-neutral-700 rounded-full flex items-center justify-center">
            RV
          </div>

          {open && (
            <div>
              <p className="text-sm">Rahul Verma</p>
              <p className="text-xs text-gray-500">Free</p>
            </div>
          )}
        </div>

        {open && (
          <FiSettings
            size={18}
            className="cursor-pointer text-neutral-400 hover:text-white transition"
          />
        )}
      </div>
    </aside>
  );
}