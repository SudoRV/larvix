import { ReactFlowProvider } from "reactflow";
import FlowCanvas from "../components/FlowCanvas";

export default function Home() {
  return (
    <ReactFlowProvider>
      <FlowCanvas />
    </ReactFlowProvider>
  );
}