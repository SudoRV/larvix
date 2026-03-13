import { ReactFlowProvider } from "reactflow";
import { useState } from "react";
import FlowCanvas from "../components/FlowCanvas";
import Sidebar from "../components/Sidebar";
import BottomToolbar from "../components/BottomToolbar";

export default function Workspace() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ReactFlowProvider>
      <div className="h-screen w-screen flex overflow-hidden bg-[#1e1e1e]">

        {/* Sidebar */}
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

        {/* Main Section */}
        <div className="flex-1 bg-red-50 flex flex-col relative">

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