import React from "react";

export type TreeId = string; // readability
export type WithTree<T> = { treeId: TreeId; data: T };

export interface TreeIdentifier {
  id: string;
  children: TreeNode[];
}

export interface TreeNodeBase {
  id: string;
  title: string;
  directory?: false;
  data?: any;
}
export interface TreeNodeDirectory {
  id: string;
  title: string;
  directory: true;
  data?: any;
  expanded: boolean;
  children: TreeNode[];
}
export type TreeNode = TreeNodeBase | TreeNodeDirectory;
export type NodeRendererProps = {
  node: TreeNode;
  events: TreeEvents;
  addRef: any; // CHANGE
  treeId: TreeId;
};
export type NodeRenderer = React.FC<NodeRendererProps>;

export type DropLineInjectedStyles = {
  top: number;
  left: number;
  position: "absolute";
  width: number;
  display: "block" | "none";
  pointerEvents: "none";
};

export type DropLineRendererInjectedProps = {
  injectedStyles?: DropLineInjectedStyles;
};

export type DropLineRenderer = React.FC<DropLineRendererInjectedProps>;

export interface TreeDnDProps extends TreeEvents {
  tree: TreeIdentifier;
  renderer: NodeRenderer;
  dropLineRenderer: DropLineRenderer;
  /**
   * Classname to be added when a directory is being hovered
   * and is either collapsed or has no items
   * (make sure this class name is completely unique)
   */
  directoryHoveredClass?: string;
}
export type TreeNodeRefs = {
  [key: string]: HTMLDivElement;
};
export type TreeContext = {
  tree: { [key: TreeId]: TreeIdentifier };
  dragging: { [key: TreeId]: TreeNode | null };
  hovered: { [key: TreeId]: NodeHovered | null };
  drop: { [key: TreeId]: NodeDropped | null };
};
export type NodeDropped = { nodeId: string; target: NodeHovered | null };
export type NodeHovered = { nodeId: string; position: DropPosition | null };
export type NodeDropPosition = NodeHovered; // alias

export interface TreeEvents {
  onChange: (change: TreeChange) => void;
  onClick?: (node: TreeNode) => void;
  onExpandedToggle?: (node: TreeNodeDirectory, expanded: boolean) => void;
  onDragStateChange?: (dragging: boolean, node?: TreeNode) => void;
  onDropPositionChange?: (target: NodeHovered | null) => void;
}
export type DropPosition = "top" | "bot" | "inside";
export interface TreeNodeDraggableProps {
  handleRef?: React.MutableRefObject<HTMLElement | null>;
  expandRef?: React.MutableRefObject<HTMLElement | null>;
  previewRef?: React.MutableRefObject<HTMLElement | null>;
  clickRef?: React.MutableRefObject<HTMLElement | null>;
  node: TreeNode;
  events: TreeEvents;
  addRef: any;
  treeId: TreeId;
}
export type TreeChange =
  | {
      type: "add";
      data: { node: TreeNode; position: NodeDropPosition };
    }
  | {
      type: "remove";
      data: { nodeId: string };
    }
  | {
      type: "move";
      data: { nodeId: string; position: NodeDropPosition };
    }
  | {
      type: "edit";
      data: { nodeId: string; data: Partial<TreeNode> };
    };
