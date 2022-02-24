import { NodeHoveredPosition, TreeChange, TreeNode } from "./types";
export declare const getNode: (nodeId: string, tree: TreeNode[]) => TreeNode | null;
export declare const getParent: (nodeId: string, tree: TreeNode[], parent?: TreeNode | null) => TreeNode | null;
export declare const nodeIsParent: (node: TreeNode, childId: string) => boolean;
export declare const removeNode: (nodeId: string, tree: TreeNode[]) => TreeNode[];
export declare const addNode: (node: TreeNode, target: NodeHoveredPosition, tree: TreeNode[]) => TreeNode[];
export declare const moveNode: (node: TreeNode, change: NodeHoveredPosition, tree: TreeNode[]) => TreeNode[];
export declare const editNode: (nodeId: string, data: Partial<TreeNode>, tree: TreeNode[]) => TreeNode[];
export declare const applyTreeChange: (change: TreeChange, tree: TreeNode[]) => TreeNode[];
