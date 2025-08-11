import {
  type FileProps,
  type MindMapType,
  mindmapAPI,
} from "@/lib/api/mindmap";
import { nanoid } from "nanoid";
import type {
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  OnEdgesChange,
  OnNodesChange,
  XYPosition,
} from "reactflow";
import { MarkerType, applyEdgeChanges, applyNodeChanges } from "reactflow";
import { create } from "zustand";

export type MindmapConfigState = {
  layoutOption: string;
  showMinimap: boolean;
};

type CopilotNode = {
  label: string;
  parentId: string;
};

export type RFMindmapState = {
  // State
  mindmapLoadingStatus?: string;
  mindmapNodes: Node[];
  mindmapEdges: Edge[];
  mindmapConfig: MindmapConfigState;
  mindmapCurrentFile?: FileProps | null;
  mindmapSelectedNode?: Node;
  mindmapFiles: FileProps[];
  onDataChange?: () => void;

  // Actions
  onMindmapNodesChange: OnNodesChange;
  onMindmapEdgesChange: OnEdgesChange;
  addMindmapChildNode: (parentNode: Node, position: XYPosition) => void;
  updateMindmapNodeData: (nodeId: string, data: any) => void;
  deleteMindmapNode: (nodeId: string) => void;
  addMindmapNode: (node: Node, position: XYPosition) => void;
  setMindmapData: (nodes: Node[], edges: Edge[]) => void;
  setMindmapLayout: () => void;
  setMindmapConfig: (key: string, value: any) => void;
  setMindmapCurrentFile: (file: FileProps | null) => void;
  setMindmapSelectedNode: (node?: Node) => void;
  addMindmapNodesFromCopilot: (nodes: CopilotNode[]) => void;
  setOnDataChange: (callback: () => void) => void;

  // File operations
  loadFiles: () => Promise<void>;
  createFile: (
    name: string,
    data: any,
    type?: MindMapType,
  ) => Promise<FileProps>;
  updateFile: (id: string, data: any, type?: string) => Promise<void>;
  deleteFile: (id: string) => Promise<void>;
  loadFile: (id: string) => Promise<void>;
};

const DEFAULT_MINDMAP_TYPE = "mindmap";
const DEFAULT_ROOT_NAME = "New Node";

export const DEFAULT_ROOT_NODE: Node = {
  id: "root",
  type: DEFAULT_MINDMAP_TYPE,
  data: { label: DEFAULT_ROOT_NAME },
  position: { x: 0, y: 0 },
};

export const useMindmapStore = create<RFMindmapState>((set, get) => ({
  // Initial state
  mindmapConfig: {
    layoutOption: "dagre",
    showMinimap: true,
  },
  mindmapNodes: [DEFAULT_ROOT_NODE],
  mindmapEdges: [],
  mindmapFiles: [],
  mindmapCurrentFile: null,

  // Node and Edge changes
  onMindmapNodesChange: (changes: NodeChange[]) => {
    set({
      mindmapNodes: applyNodeChanges(changes, get().mindmapNodes),
    });
    // Notify about data changes
    const { onDataChange } = get();
    if (onDataChange) {
      onDataChange();
    }
  },

  onMindmapEdgesChange: (changes: EdgeChange[]) => {
    set({
      mindmapEdges: applyEdgeChanges(changes, get().mindmapEdges),
    });
    // Notify about data changes
    const { onDataChange } = get();
    if (onDataChange) {
      onDataChange();
    }
  },

  // Node operations
  addMindmapChildNode: (parentNode: Node, position: XYPosition) => {
    const newNode: Node = {
      id: nanoid(),
      type: DEFAULT_MINDMAP_TYPE,
      data: { label: "New Node" },
      position,
    };

    const newEdge: Edge = {
      id: nanoid(),
      source: parentNode.id,
      target: newNode.id,
      type: "mindmap",
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
    };

    set({
      mindmapNodes: [...get().mindmapNodes, newNode],
      mindmapEdges: [...get().mindmapEdges, newEdge],
    });
  },

  addMindmapNode: (node: Node, position: XYPosition) => {
    const newNode = {
      ...node,
      id: nanoid(),
      position,
    };

    set({
      mindmapNodes: [...get().mindmapNodes, newNode],
    });
  },

  updateMindmapNodeData: (nodeId: string, data: any) => {
    set({
      mindmapNodes: get().mindmapNodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...data } }
          : node,
      ),
    });
  },

  deleteMindmapNode: (nodeId: string) => {
    const { mindmapNodes, mindmapEdges } = get();

    // Remove the node
    const updatedNodes = mindmapNodes.filter((node) => node.id !== nodeId);

    // Remove connected edges
    const updatedEdges = mindmapEdges.filter(
      (edge) => edge.source !== nodeId && edge.target !== nodeId,
    );

    set({
      mindmapNodes: updatedNodes,
      mindmapEdges: updatedEdges,
    });
  },

  setMindmapData: (nodes: Node[], edges: Edge[]) => {
    set({
      mindmapNodes: nodes,
      mindmapEdges: edges,
    });
  },

  setMindmapLayout: () => {
    // Layout logic will be implemented later
    set({});
  },

  setMindmapConfig: (key: string, value: any) => {
    set({
      mindmapConfig: {
        ...get().mindmapConfig,
        [key]: value,
      },
    });
  },

  setMindmapCurrentFile: (file: FileProps | null) => {
    set({
      mindmapCurrentFile: file,
    });
  },

  setMindmapSelectedNode: (node?: Node) => {
    set({
      mindmapSelectedNode: node,
    });
  },

  setOnDataChange: (callback: () => void) => {
    set({
      onDataChange: callback,
    });
  },

  addMindmapNodesFromCopilot: (nodes: CopilotNode[]) => {
    const { mindmapNodes, mindmapEdges } = get();
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];

    for (const copilotNode of nodes) {
      const newNode: Node = {
        id: nanoid(),
        type: DEFAULT_MINDMAP_TYPE,
        data: { label: copilotNode.label },
        position: { x: Math.random() * 200, y: Math.random() * 200 },
      };

      newNodes.push(newNode);

      if (copilotNode.parentId) {
        const newEdge: Edge = {
          id: nanoid(),
          source: copilotNode.parentId,
          target: newNode.id,
          type: "mindmap",
          markerEnd: {
            type: MarkerType.ArrowClosed,
          },
        };
        newEdges.push(newEdge);
      }
    }

    set({
      mindmapNodes: [...mindmapNodes, ...newNodes],
      mindmapEdges: [...mindmapEdges, ...newEdges],
    });
  },

  // File operations
  loadFiles: async () => {
    set({ mindmapLoadingStatus: "loading" });
    try {
      const files = await mindmapAPI.getFiles();
      set({ mindmapFiles: files, mindmapLoadingStatus: "success" });
    } catch (error) {
      console.error("Failed to load files:", error);
      set({ mindmapLoadingStatus: "error" });
    }
  },

  createFile: async (name: string, data: any, type?: MindMapType) => {
    set({ mindmapLoadingStatus: "loading" });
    try {
      console.log("Creating mindmap file:", { name, data });

      // Ensure data is properly stringified
      const dataString = typeof data === "string" ? data : JSON.stringify(data);

      const file = await mindmapAPI.createFile({
        name,
        data: dataString,
        type: type || "STUDY_NOTES",
      });

      console.log("File created successfully:", file);

      const { mindmapFiles } = get();
      set({
        mindmapFiles: [file, ...mindmapFiles],
        mindmapCurrentFile: file,
        mindmapLoadingStatus: "success",
      });

      return file;
    } catch (error) {
      console.error("Failed to create file:", error);
      set({ mindmapLoadingStatus: "error" });
      throw error;
    }
  },

  updateFile: async (id: string, data: any) => {
    set({ mindmapLoadingStatus: "loading" });
    try {
      console.log("Updating mindmap file:", { id, data });

      // Ensure data is properly stringified
      const dataString = typeof data === "string" ? data : JSON.stringify(data);

      await mindmapAPI.updateFile(id, {
        data: dataString,
        type: "STUDY_NOTES", // Default type for updates
      });

      console.log("File updated successfully");

      const { mindmapFiles } = get();
      const updatedFiles = mindmapFiles.map((file) =>
        file.id === id
          ? {
              ...file,
              data: dataString,
              updatedAt: new Date().toISOString(),
            }
          : file,
      );

      set({
        mindmapFiles: updatedFiles,
        mindmapLoadingStatus: "success",
      });
    } catch (error) {
      console.error("Failed to update file:", error);
      set({ mindmapLoadingStatus: "error" });
      throw error;
    }
  },

  deleteFile: async (id: string) => {
    set({ mindmapLoadingStatus: "loading" });
    try {
      await mindmapAPI.deleteFile(id);

      const { mindmapFiles, mindmapCurrentFile } = get();
      const updatedFiles = mindmapFiles.filter((file) => file.id !== id);

      set({
        mindmapFiles: updatedFiles,
        mindmapCurrentFile:
          mindmapCurrentFile?.id === id ? null : mindmapCurrentFile,
        mindmapLoadingStatus: "success",
      });
    } catch (error) {
      console.error("Failed to delete file:", error);
      set({ mindmapLoadingStatus: "error" });
      throw error;
    }
  },

  loadFile: async (id: string) => {
    set({ mindmapLoadingStatus: "loading" });
    try {
      const file = await mindmapAPI.getFileById(id);
      const data = JSON.parse(file.data);

      set({
        mindmapCurrentFile: file,
        mindmapNodes: data.nodes || [],
        mindmapEdges: data.edges || [],
        mindmapLoadingStatus: "success",
      });
    } catch (error) {
      console.error("Failed to load file:", error);
      set({ mindmapLoadingStatus: "error" });
      throw error;
    }
  },
}));
