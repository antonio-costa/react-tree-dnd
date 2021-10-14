import { TreeNode } from ".";

export interface TreeIdentifier {
  id: string;
  children: TreeNode[];
}

export interface TreeNodeBase {
  id: string;
  title: string;
  directory: false;
  data?: any;
}
export interface TreeNodeDirectory extends TreeNodeBase {
  directory: true;
  expanded: boolean;
  children: TreeNode[];
}
export type TreeNode = TreeNodeBase | TreeNodeDirectory;

export type NodeRenderer = (id) => JSX.Element;

export type TreeNodeRendererDefaultProps = {
  nodeId: string;
  color?: string;
  iconColor?: string;
};

export interface DnDSortableTreeProps extends Partial<TreeEvents> {
  tree: TreeIdentifier;
  renderer?: NodeRenderer;
}

export interface TreeContext {
  tree: TreeIdentifier;
  dragging: string | null;
  hovered: NodeHovered | null;
  drop: NodeDropped | null;
  events: Partial<TreeEvents>;
}

export type NodeDropped = { nodeId: string; target: NodeHovered | null };
export type NodeHovered = { nodeId: string; position: DropPosition | null };

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
      type: "DIRECTORY_TOGGLE";
      data: string;
    };

export interface TreeEvents {
  onChange: (treeChildren: TreeNode[]) => void;
  onClick: (node: TreeNode) => void;
  onExpandedToggle: (node: TreeNode, expanded: boolean) => void;
  onDragStateChange: (dragging: boolean, node?: TreeNode) => void;
  onDropPositionChange: (target: NodeHovered | null) => void;
}
export type DropPosition = "top" | "bot" | "inside";
