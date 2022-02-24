import React from "react";

// General Tree Node
export interface TreeNode {
  id: string;
  title: string;
  data?: any;
  expanded?: boolean;
  children?: TreeNode[];
}

export interface NodeHoveredPosition {
  node: TreeNode;
  position: DropPosition;
}
export type DropPosition = "top" | "bot" | "inside";

export interface DraggableRendererProps {
  draggable: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDragEnter: (e: React.DragEvent) => void;
  ref: React.ForwardedRef<any>;
}

// Drop Line
export type DropLineInjectedStyles = {
  top: number;
  left: number;
  position: "absolute";
  width: number;
  display: "block" | "none";
  pointerEvents: "none";
};

export type DropLineRendererInjectedProps = {
  injectedStyles: DropLineInjectedStyles;
};

export type DropLineRenderer = React.FC<DropLineRendererInjectedProps>;

export interface DropLineRendererPortalProps {
  renderer: DropLineRenderer;
  injectedStyles: DropLineInjectedStyles;
}
export type DropLineRendererPortal = React.FC<DropLineRendererPortalProps>;

// Drag Preview
export type DragPreviewRendererProps = {};

export type DragPreviewRenderer = React.FC<DragPreviewRendererProps>;

export type DragPreviewPortalProps = {
  dragging: boolean;
  renderer: DragPreviewRenderer;
};
export type DragPreviewPortalComponent = React.FC<DragPreviewPortalProps>;

// tree change
export type TreeChange =
  | {
      type: "add";
      data: {
        node: TreeNode | TreeNode[];
        position: NodeHoveredPosition;
      };
    }
  | {
      type: "remove";
      data: { nodeId: string | string[] };
    }
  | {
      type: "move";
      data: { node: TreeNode | TreeNode[]; position: NodeHoveredPosition };
    }
  | {
      type: "edit";
      data: { nodeId: string | string[]; data: Partial<TreeNode> };
    };

// DroppableProps
export type TreeOnBeforeDrop = (
  dragging: TreeNode | null,
  target: NodeHoveredPosition
) => TreeNode | TreeNode[] | null;

export type TreeOnChange = (change: TreeChange | TreeChange[]) => void;
export interface DroppableRendererProps {
  onDragLeave: (e: React.DragEvent) => void;
  style: { position: "relative" };
  ref: React.ForwardedRef<any>;
  children: (React.ReactNode | Element)[];
}

// NodeEvents
export type OnNodeHovered = (node: TreeNode) => void;
export type OnToggleDragging = (dragging: boolean, node?: TreeNode) => void;
export type OnTargetDrop = (target: NodeHoveredPosition | null) => void;
export type CanDrop = (e: React.DragEvent, node: TreeNode) => boolean;
export type OnDropPositionChange = (
  position: NodeHoveredPosition | null,
  ref?: React.RefObject<any>,
  canDrop?: boolean
) => void;

export interface NodeEvents {
  onToggleDragging: OnToggleDragging;
  onTargetDrop: OnTargetDrop;
  canDrop: CanDrop;
  onDropPositionChange: OnDropPositionChange;
}
// Draggable
export interface DraggableProps {
  node: TreeNode;
  dragPreviewRenderer?: DragPreviewRenderer;
  _nodeEvents?: NodeEvents;
  dragHandleRef?: React.RefObject<any>;
  children?: React.ReactNode;
}

// Tree DnD Children
export type InjectDroppable = {
  ref: React.RefObject<any>;
  onDragLeave: (e: React.DragEvent) => void;
};

export type InjectDraggable = {
  _nodeEvents: NodeEvents;
  dragPreviewRenderer: DragPreviewRenderer | undefined;
};
export type DroppableChildrenArgs = {
  injectDroppable: InjectDroppable;
  injectDraggable: InjectDraggable;
};
export type DroppableChildren = (
  args: DroppableChildrenArgs
) => React.ReactElement<any, any>;
