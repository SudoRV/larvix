import React, { useCallback, useEffect } from "react";
import ReactFlow, {
    Background,
    Controls,
    addEdge,
    useNodesState,
    useEdgesState,
    useReactFlow
} from "reactflow";
import "reactflow/dist/style.css";
import ChatNode from "../components/ChatNode";

/* ✅ Move outside component to prevent warning #002 */
const nodeTypes = {
    chat: ChatNode
};

export default function FlowCanvas() {
    const {
        zoomIn,
        zoomOut,
        setViewport,
        getViewport,
        fitView
    } = useReactFlow();

    /* ✅ Run only once safely after mount */
    useEffect(() => {
        const timer = setTimeout(() => {
            fitView({ padding: 2 });
        }, 0);

        return () => clearTimeout(timer);
    }, [fitView]);

    /* ✅ Custom wheel logic preserved */
    const handleWheel = useCallback(
        (event) => {
            const { x, y, zoom } = getViewport();

            // CTRL + Scroll → Zoom
            if (event.ctrlKey) {
                event.preventDefault();
                event.deltaY < 0
                    ? zoomIn({ duration: 120 })
                    : zoomOut({ duration: 120 });
                return;
            }

            // SHIFT + Scroll → Horizontal Pan
            if (event.shiftKey) {
                setViewport({
                    x: x - event.deltaY,
                    y,
                    zoom
                });
                return;
            }

            // Normal Scroll → Vertical Pan
            setViewport({
                x,
                y: y - event.deltaY,
                zoom
            });
        },
        [getViewport, setViewport, zoomIn, zoomOut]
    );

    const initialNodes = [
        {
            id: "1",
            type: "chat",
            position: { x: 400, y: 100 },
            data: { label: "Root message" },
        }
    ];

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    const onConnect = useCallback(
        (params) =>
            setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
        [setEdges]
    );

    const addChild = useCallback(
        (parentId, sourceHandleId, handlePosition, context) => {
            const newId = Date.now().toString();
            const parentNode = nodes.find((n) => n.id === parentId);
            if (!parentNode) return;

            const newNode = {
                id: newId,
                type: "chat",
                position: {
                    x: parentNode.position.x + (handlePosition?.x || 0),
                    y: parentNode.position.y + (handlePosition?.y || 150)
                },
                data: { label: sourceHandleId ? "Element branch" : "Node branch", context: context }
            };

            setNodes((nds) => [...nds, newNode]);

            setEdges((eds) => [
                ...eds,
                {
                    id: `e${parentId}-${sourceHandleId}-${newId}`,
                    source: parentId,
                    sourceHandle: sourceHandleId,
                    target: newId,
                    animated: true,
                    zIndex: sourceHandleId && 1000
                }
            ]);
        },
        [nodes, setNodes, setEdges]
    );

    const deleteNode = useCallback(
        (id) => {
            setNodes((nds) => nds.filter((n) => n.id !== id));
            setEdges((eds) =>
                eds.filter((e) => e.source !== id && e.target !== id)
            );
        },
        [setNodes, setEdges]
    );

    const nodesWithHandlers = nodes.map((n) => ({
        ...n,
        data: {
            ...n.data,
            onAddChild: addChild,
            onDelete: deleteNode
        }
    }));

    return (
        <div
            className="w-full h-full overflow-hidden  bg-neutral-900"
        >
            <ReactFlow
                nodes={nodesWithHandlers}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                zoomOnScroll={false}
                panOnScroll={false}
                panOnDrag={true}
                preventScrolling={true}
                fitView={false}
                autoPanOnNodeFocus={false}
                onPaneScroll={handleWheel}

                nodesDraggable={true}
                elementsSelectable={true}
                nodeDragHandle=".drag-handle"

            >
                <Background gap={20} size={1} color="#444" />
                <Controls />
            </ReactFlow>
        </div>
    );
}