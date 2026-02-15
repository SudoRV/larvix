import { ReactFlowProvider } from "reactflow";
import { useState } from "react";
import FlowCanvas from "../components/FlowCanvas";
import Sidebar from "../components/Sidebar";
import BottomToolbar from "../components/BottomToolbar";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <ReactFlowProvider>
      <div className="h-screen w-screen flex overflow-hidden bg-[#1e1e1e]">

        {/* Sidebar */}
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

        {/* Main Section */}
        <div className="flex-1 bg-red-50 flex flex-col relative">

          {/* Toggle Button */}
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="absolute top-4 left-4 z-50 bg-[#2a2a2a] text-white px-3 py-1 rounded-md"
            >
              ☰
            </button>
          )}

          {/* Canvas */}
          <div className="flex-1">
            <FlowCanvas />
          </div>

          {/* Bottom Toolbar */}
          <BottomToolbar />

        </div>
      </div>
    </ReactFlowProvider>
  );
}