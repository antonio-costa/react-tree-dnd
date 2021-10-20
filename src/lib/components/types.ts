import React from "react";

export interface TreeIdentifier {
  id: string;
  children: TreeNode[];
}
export type TreeNodeRefs = {
  [key: string]: React.RefObject<HTMLDivElement>;
};
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

export type NodeRenderer = React.FC<TreeNode>;

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

export interface TreeContext {
  tree: TreeIdentifier;
  dragging: string | null;
  hovered: NodeHovered | null;
  drop: NodeDropped | null;
  events: TreeEvents;
  refs: TreeNodeRefs;
}

export type NodeDropped = { nodeId: string; target: NodeHovered | null };
export type NodeHovered = { nodeId: string; position: DropPosition | null };
export type NodeDropPosition = NodeHovered; // alias

export type TreeContextAction =
  | {
      type: "CHANGE_TREE";
      data: TreeIdentifier;
    }
  | { type: "CHANGE_DRAGGING"; data: string | null }
  | {
      type: "CHANGE_HOVERED";
      data: NodeHovered | null;
    }
  | {
      type: "SET_EVENTS";
      data: Partial<TreeEvents>;
    }
  | {
      type: "DROP";
      data: NodeDropped | null;
    }
  | {
      type: "CHANGE_REFS";
      data: { id: string; ref: React.RefObject<HTMLDivElement> };
    };

export interface TreeEvents {
  onChange: (treeChildren: TreeNode[]) => void;
  onClick?: (node: TreeNode) => void;
  onExpandedToggle?: (node: TreeNode, expanded: boolean) => void;
  onDragStateChange?: (dragging: boolean, node?: TreeNode) => void;
  onDropPositionChange?: (target: NodeHovered | null) => void;
}
export type DropPosition = "top" | "bot" | "inside";
export interface TreeNodeDraggableProps {
  handleRef?: React.MutableRefObject<HTMLElement | null>;
  expandRef?: React.MutableRefObject<HTMLElement | null>;
  previewRef?: React.MutableRefObject<HTMLElement | null>;
  dropRef?: React.MutableRefObject<HTMLElement | null>;
  clickRef?: React.MutableRefObject<HTMLElement | null>;
  node: TreeNode;
}
