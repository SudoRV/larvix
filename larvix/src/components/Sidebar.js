import { FiFolder, FiPlus, FiSettings, FiX } from "react-icons/fi";

export default function Sidebar({ open, setOpen }) {
  return (
    <aside
      className={`bg-neutral-850 text-white h-full transition-all duration-300 
      ${open ? "w-72" : "w-0"} overflow-hidden relative`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <span className="font-semibold">New Chat</span>
        <button onClick={() => setOpen(false)}>
          <FiX />
        </button>
      </div>

      {/* Projects */}
      <div className="p-4 text-sm">
        <p className="text-gray-500 mb-2">Projects</p>
        <div className="flex items-center gap-2 py-1 cursor-pointer">
          <FiFolder /> AI Larvix
        </div>
        <div className="flex items-center gap-2 py-1 cursor-pointer">
          <FiFolder /> Lab Link
        </div>
      </div>

      {/* Chats */}
      <div className="p-4 text-sm">
        <p className="text-gray-500 mb-2">Your Chats</p>
        <div className="py-1 cursor-pointer">
          Backpropagation Explained
        </div>
        <div className="py-1 cursor-pointer">
          Backpropagation Explained
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 w-full p-3 border-t flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-neutral-700 rounded-full flex items-center justify-center text-sm">
            RV
          </div>
          <div>
            <p className="text-xs font-medium">Rahul Verma</p>
            <p className="text-[10px] text-gray-500">Free</p>
          </div>
        </div>
        <FiSettings className="cursor-pointer" />
      </div>
    </aside>
  );
}