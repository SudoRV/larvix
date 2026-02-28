import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactFlow, {
    Background,
    Controls,
    addEdge,
    useNodesState,
    useEdgesState,
    useReactFlow,
    useUpdateNodeInternals
} from "reactflow";
import "reactflow/dist/style.css";
import ChatNode from "../components/ChatNode";
import { astToHtml } from "./AstToHTML";
import { useStates } from "../context/GlobalContext";

/* ✅ Move outside component to prevent warning #002 */
const nodeTypes = {
    chat: ChatNode
};

export default function FlowCanvas() {
    const { toolState, setToolState } = useStates();
    const reactFlowWrapper = document.querySelector(".react-flow");
    const updateNodeInternals = useUpdateNodeInternals();

    const {
        fitView,
    } = useReactFlow();

    const initialNodes = [
        {
            id: crypto.randomUUID(),
            type: "chat",
            position: { x: 100, y: 100 },
            data: { label: "Root message" },
        }
    ];

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [dynamicHandles, setDynamicHandles] = useState([]);
    const [ast, setAst] = useState([]);
    const homeButtonMessageRef = useRef(null);

    /* ✅ Run only once safely after mount */
    useEffect(() => {
        const timer = setTimeout(() => {
            fitView({ padding: window.innerWidth > 1000 ? 3.8 : 1.4 });
        }, 0);

        return () => clearTimeout(timer);
    }, [fitView]);

    const onConnect = useCallback(
        (params) =>
            setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
        [setEdges]
    );

    const addChild = useCallback(
        (parentId, newHandle, handlePosition, context, messageId) => {
            const parentNode = nodes.find((n) => n.id === parentId);
            if (!parentNode) return;
            const newId = crypto.randomUUID();

            if(!handlePosition || !context || !messageId){
                // New Node
                const newNode = {
                    id: newId,
                    type: "chat",
                    position: {
                        x: parentNode.position.x,
                        y: parentNode.position.y + parentNode.height + 100 
                    },
                    data: { label: "Node", context: context, messageId }
                };
    
                setNodes((nds) => [...nds, newNode]);

                const newEdge = {
                    id: `e${parentId}-${newHandle.id}-${newId}`,
                    source: parentId,
                    sourceHandle: newHandle,
                    target: newId,
                    animated: true,
                    zIndex: 1000
                }
    
                setEdges((eds) => [...eds, newEdge]);

                return;
            }

            // New Branched Node 
            const newNode = {
                id: newId,
                type: "chat",
                position: {
                    x: parentNode.position.x + (handlePosition?.x || 0),
                    y: parentNode.position.y + (handlePosition?.y || 150)
                },
                data: { label: "Branched Node", context: context, messageId }
            };

            setNodes((nds) => [...nds, newNode]);

            const newEdge = {
                id: `e${parentId}-${newHandle.id}-${newId}`,
                source: parentId,
                sourceHandle: newHandle.id,
                target: newId,
                animated: true,
                zIndex: 1000
            }

            setEdges((eds) => [...eds, newEdge]);

            // create new branch handle 
            if (newHandle.id) {
                setDynamicHandles(prev => [
                    ...prev,
                    newHandle
                ])
            }
        },
        [nodes, edges, setNodes, setEdges]
    );

    const deleteNode = useCallback(
        async (id) => {
            // update ast 
            const handleId = edges.find(e => e.target === id)?.sourceHandle;
            const branchedElement = document.querySelector(`.branchedto-${handleId}`);
            const dataNodeId = branchedElement?.getAttribute("data-node-id");

            if (dataNodeId) {
                const ast_id = branchedElement.closest(".msg-container").id;
                const msg_ast = ast.find(a => a.id === ast_id)?.ast;

                const updatedTree = updateNodeById(msg_ast, dataNodeId, (node) => {
                    const existingClasses = node.data?.hProperties?.className || [];

                    return {
                        ...node,
                        data: {
                            ...node.data,
                            branchId: null,
                            hProperties: {
                                ...(node.data?.hProperties || {}),
                                className: existingClasses.includes("branched") ? existingClasses.filter(ec => !["branched", `branchedto-${handleId}`].includes(ec)) : [...existingClasses]
                            }
                        }
                    }
                })

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
            }

            // remove handle, edge, and node
            setDynamicHandles((prev) => prev.filter((p) => p.id !== edges.find(e => e.target === id)?.sourceHandle));

            setNodes((nds) => nds.filter((n) => n.id !== id));
            setEdges((eds) =>
                eds.filter((e) => e.source !== id && e.target !== id)
            );
        },
        [nodes, edges, setNodes, setEdges]
    );

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

    // home button function ( to focus on selected node )
    useEffect(() => {
        if (toolState.home.state && toolState.home.activeNode && toolState.home.message) {
            const activeNode = toolState.home.activeNode;
            // 1️⃣ Force ReactFlow to recalc node size
            updateNodeInternals(activeNode);

            // 2️⃣ Wait one frame so DOM applies new size
            requestAnimationFrame(() => {
                fitView({
                    nodes: [{ id: activeNode }],
                    padding: 0,
                    duration: 400,
                });
            });

            // 🔹 Focus selected node
            setToolState(prev => ({
                ...prev,
                home: { ...toolState.home, message: false }
            }));

        } else if (!toolState.home.activeNode) {
            // 🔹 Deselect all nodes
            setNodes(nds =>
                nds.map(n => ({
                    ...n,
                    selected: false
                }))
            );
            // 🔹 Reset → fit all nodes
            fitView({
                padding: 0.4,
                duration: 400
            });
        }

    }, [toolState.home, fitView]);

    const isFocused = toolState.home.state && toolState.home.activeNode;

    const activeNodeId = toolState.home.activeNode;

    const nodesWithHandlers = nodes.map((node) => {
        const isFocused = !!activeNodeId;
        const isActive = node.id === activeNodeId;

        return {
            ...node,
            style: {
                ...node.style,
                opacity: isFocused ? (isActive ? 1 : 0) : 1,
                pointerEvents: isFocused ? (isActive ? "auto" : "none") : "auto",
                transition: "opacity 200ms ease",
            },
            data: {
                ...node.data,
                dynamicHandles,
                onAddHandle: setDynamicHandles,
                onAddChild: addChild,
                onDelete: deleteNode,
                ast,
                onAddAst: setAst,
            },
        };
    });

    return (
        <div ref={reactFlowWrapper}
            className={`w-full h-full overflow-hidden bg-neutral-800`}
        >

            <ReactFlow
                nodes={nodesWithHandlers}
                nodeTypes={nodeTypes}
                edges={edges.filter(e => e.source !== activeNodeId)}

                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}

                zoomOnScroll={!isFocused}
                zoomOnPinch={!isFocused}
                // panOnScroll={!isFocused}
                // panOnDrag={!isFocused}
                nodesDraggable={!isFocused}

                preventScrolling={false}
                fitView={false}
                autoPanOnNodeFocus={false}
            >
                {/* <Background gap={20} size={1} color="#444" /> */}
                {
                    !isFocused && (
                        <Controls />
                    )
                }
            </ReactFlow>
        </div>
    );
}