import { useCallback, useRef, useState } from "react";
import ReactFlow, {
  Background,
  ConnectionLineType,
  Controls,
  MiniMap,
  type Node,
  type NodeOrigin,
  ReactFlowProvider,
  useReactFlow,
  useStoreApi,
} from "reactflow";
import "reactflow/dist/style.css";
import { Button } from "@/components/ui/button";
import { useMindmapStore } from "@/stores/mindmap";
import { nanoid } from "nanoid";
import { useTranslations } from "next-intl";
import ContextMenu from "./context-menu";
import MindMapEdge from "./edge";
import MindMapNode from "./node";

const nodeTypes = {
  mindmap: MindMapNode,
};

const edgeTypes = {
  mindmap: MindMapEdge,
};

// this places the node origin in the center of a node
const nodeOrigin: NodeOrigin = [0.5, 0.5];
const connectionLineStyle = {
  strokeWidth: 1,
};
const defaultEdgeOptions = { style: connectionLineStyle, type: "mindmap" };

interface MindmapProps {
  isFullScreen?: boolean;
}

const Mindmap = ({ isFullScreen = false }: MindmapProps) => {
  const [menu, setMenu] = useState<any>(null);
  const [styleDialog, setStyleDialog] = useState<{ node: Node | null }>({
    node: null,
  });
  const ref = useRef<any>(null);
  const mindmapNodes = useMindmapStore((state) => state.mindmapNodes);
  const mindmapEdges = useMindmapStore((state) => state.mindmapEdges);
  const onMindmapNodesChange = useMindmapStore(
    (state) => state.onMindmapNodesChange,
  );
  const onMindmapEdgesChange = useMindmapStore(
    (state) => state.onMindmapEdgesChange,
  );
  const addMindmapChildNode = useMindmapStore(
    (state) => state.addMindmapChildNode,
  );
  const updateMindmapNodeData = useMindmapStore(
    (state) => state.updateMindmapNodeData,
  );
  const deleteMindmapNode = useMindmapStore((state) => state.deleteMindmapNode);
  const addMindmapNode = useMindmapStore((state) => state.addMindmapNode);
  const setMindmapData = useMindmapStore((state) => state.setMindmapData);

  const connectingNodeId = useRef<string | null>(null);
  const [rfInstance, setRfInstance] = useState<any>(null);
  const t = useTranslations("Mindmap");

  const store = useStoreApi();
  const { screenToFlowPosition } = useReactFlow();

  const getChildNodePosition = useCallback(
    (event: MouseEvent, parentNode?: Node) => {
      const { domNode } = store.getState();

      if (
        !domNode ||
        !parentNode?.positionAbsolute ||
        !parentNode?.width ||
        !parentNode?.height
      ) {
        return;
      }

      const panePosition = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      return {
        x:
          panePosition.x - parentNode.positionAbsolute.x + parentNode.width / 2,
        y:
          panePosition.y -
          parentNode.positionAbsolute.y +
          parentNode.height / 2,
      };
    },
    [screenToFlowPosition, store],
  );

  const onConnectStart = useCallback((_: any, { nodeId }: any) => {
    connectingNodeId.current = nodeId;
  }, []);

  // Thêm callback onConnect
  const onConnect = useCallback(
    (params: any) => {
      // params: { source, sourceHandle, target, targetHandle }
      if (
        params.source &&
        params.target &&
        params.source !== params.target &&
        !mindmapEdges.some(
          (e) => e.source === params.source && e.target === params.target,
        )
      ) {
        setMindmapData(mindmapNodes, [
          ...mindmapEdges,
          {
            id: nanoid(),
            source: params.source,
            target: params.target,
          },
        ]);
      }
    },
    [mindmapNodes, mindmapEdges, setMindmapData],
  );

  // Sửa lại onConnectEnd chỉ dùng cho việc tạo node con khi kéo ra ngoài pane
  const onConnectEnd = useCallback(
    (event: any) => {
      const { nodeInternals } = store.getState();
      const targetIsPane = (event.target as Element).classList.contains(
        "react-flow__pane",
      );
      if (targetIsPane && connectingNodeId.current) {
        const parentNode = nodeInternals.get(connectingNodeId.current);
        const childNodePosition = getChildNodePosition(event, parentNode);
        if (parentNode && childNodePosition) {
          addMindmapChildNode(parentNode, childNodePosition);
        }
      }
    },
    [getChildNodePosition, addMindmapChildNode, store],
  );

  const onNodeContextMenu = useCallback((event: any, node: Node) => {
    event.preventDefault();
    const paneRect = ref.current.getBoundingClientRect();
    const OFFSET = 12; // show slightly to the right of cursor
    const MENU_WIDTH = 200;
    const MENU_HEIGHT = 200;

    let left = event.clientX - paneRect.left + OFFSET;
    let top = event.clientY - paneRect.top;

    // Clamp within pane bounds
    if (left + MENU_WIDTH > paneRect.width) {
      left = Math.max(0, paneRect.width - MENU_WIDTH - 8);
    }
    if (top + MENU_HEIGHT > paneRect.height) {
      top = Math.max(0, paneRect.height - MENU_HEIGHT - 8);
    }

    setMenu({
      id: node.id,
      top,
      left,
      data: node.data,
      node,
    });
  }, []);

  const onPaneClick = useCallback(() => setMenu(null), []);

  const handleContextMenuAction = (action: string) => {
    if (menu?.id === "pane") {
      if (action === "add") {
        const position = rfInstance.screenToFlowPosition({
          x: menu.left,
          y: menu.top,
        });
        addMindmapNode(
          {
            id: `node-${Date.now()}`,
            type: "mindmap",
            position,
            data: { label: t("node.newNode") },
          },
          position,
        );
      }
    } else if (menu?.id) {
      const node = mindmapNodes.find((n) => n.id === menu.id);
      if (node) {
        if (action === "add") {
          const position = {
            x: node.position.x + 200,
            y: node.position.y,
          };
          addMindmapChildNode(node, position);
        } else if (action === "delete") {
          deleteMindmapNode(node.id);
        }
      }
    }
    setMenu(null);
  };

  const getNodeData = (node: Node) => ({
    ...node.data,
    onChange: (
      label: string,
      style?: { background?: string; color?: string },
    ) => {
      updateMindmapNodeData(node.id, {
        label,
        ...(style || {}),
      });
    },
    onAddChild: () => {
      const position = {
        x: node.position.x + 200,
        y: node.position.y,
      };
      addMindmapChildNode(node, position);
    },
    onDelete: () => deleteMindmapNode(node.id),
  });

  return (
    <div
      className={`h-full w-full ${isFullScreen ? "fixed inset-0 z-50" : ""}`}
      style={{ height: "100%", width: "100%" }}
    >
      <div
        ref={ref}
        className="h-full w-full"
        style={{ height: "100%", width: "100%" }}
      >
        <ReactFlow
          nodes={mindmapNodes.map((node) => ({
            ...node,
            data: getNodeData(node),
          }))}
          edges={mindmapEdges}
          onNodesChange={onMindmapNodesChange}
          onEdgesChange={onMindmapEdgesChange}
          onConnect={onConnect}
          onConnectStart={onConnectStart}
          onConnectEnd={onConnectEnd}
          onNodeClick={() => {
            // Handle node click if needed
          }}
          onPaneClick={onPaneClick}
          onNodeContextMenu={onNodeContextMenu}
          onPaneContextMenu={(event) => {
            event.preventDefault();
            const paneRect = ref.current.getBoundingClientRect();
            const OFFSET = 12;
            setMenu({
              id: "pane",
              top: event.clientY - paneRect.top,
              left: event.clientX - paneRect.left + OFFSET,
            });
          }}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          nodeOrigin={nodeOrigin}
          defaultEdgeOptions={defaultEdgeOptions}
          connectionLineType={ConnectionLineType.SmoothStep}
          onInit={setRfInstance}
          fitView
        >
          <Background className="bg-background" />
          <Controls className="rounded-lg border border-border bg-background shadow-lg" />
          <MiniMap className="rounded-lg border border-border bg-background shadow-lg" />

          {/* Save button is now in the header */}

          {menu && menu.id !== "pane" && (
            <ContextMenu
              top={menu.top}
              left={menu.left}
              onAddChild={() => handleContextMenuAction("add")}
              onDelete={() => handleContextMenuAction("delete")}
              onEditStyle={() => setStyleDialog({ node: menu.node })}
              onClose={() => setMenu(null)}
            />
          )}
          {styleDialog.node && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
              <div className="min-w-[360px] rounded-lg border border-border bg-background p-6 shadow-lg">
                <div className="mb-4 font-bold">{t("node.editStyle")}</div>
                {/* ô chọn màu */}
                <div className="grid grid-cols-[150px,1fr] items-center gap-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground text-sm">
                      {t("node.backgroundColor")}:
                    </span>
                    <input
                      type="color"
                      value={styleDialog.node?.data?.background || "#ffffff"}
                      onChange={(e) =>
                        styleDialog.node &&
                        updateMindmapNodeData(styleDialog.node.id, {
                          background: e.target.value,
                        })
                      }
                      className="h-10 w-24 cursor-pointer rounded border border-border"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-muted-foreground text-sm">
                      {t("node.textColor")}:
                    </div>
                    <input
                      type="color"
                      value={styleDialog.node?.data?.color}
                      onChange={(e) =>
                        styleDialog.node &&
                        updateMindmapNodeData(styleDialog.node.id, {
                          color: e.target.value,
                        })
                      }
                      className="h-10 w-24 cursor-pointer rounded border border-border"
                    />
                  </div>
                </div>

                <div className="mt-5 flex justify-end gap-2">
                  <Button
                    size="sm"
                    onClick={() => setStyleDialog({ node: null })}
                  >
                    {t("node.close")}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </ReactFlow>
      </div>
    </div>
  );
};

export default ({ isFullScreen = false }: MindmapProps) => {
  return (
    <ReactFlowProvider>
      <Mindmap isFullScreen={isFullScreen} />
    </ReactFlowProvider>
  );
};
