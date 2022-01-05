import { NodeHoveredPosition, TreeChange, TreeNode } from "./types";

export const getNode = (nodeId: string, tree: TreeNode[]): TreeNode | null => {
  return tree.reduce((prev, curr) => {
    if (prev) return prev;
    if (curr.id === nodeId) return curr;
    if (curr.children) return getNode(nodeId, curr.children);

    return null;
  }, null as TreeNode | null);
};
export const getParent = (
  nodeId: string,
  tree: TreeNode[],
  parent: TreeNode | null = null
): TreeNode | null => {
  return tree.reduce((prev, curr) => {
    if (prev) return prev;
    if (curr.id === nodeId) return parent;
    if (curr.children) return getParent(nodeId, curr.children, curr);

    return null;
  }, null as TreeNode | null);
};
export const nodeIsParent = (node: TreeNode, childId: string): boolean => {
  if (!Array.isArray(node.children)) return false;

  return !!getNode(childId, node.children);
};
export const removeNode = (nodeId: string, tree: TreeNode[]): TreeNode[] => {
  let done = false;
  return tree.reduce((prev, curr) => {
    if (done) return [...prev, curr];
    if (curr.id === nodeId) {
      done = true;
      return [...prev];
    }
    if (Array.isArray(curr.children)) {
      return [
        ...prev,
        { ...curr, children: removeNode(nodeId, curr.children) },
      ];
    }
    return [...prev, curr];
  }, [] as TreeNode[]);
};
export const addNode = (
  node: TreeNode,
  target: NodeHoveredPosition,
  tree: TreeNode[]
): TreeNode[] => {
  let done = false;
  return tree.reduce((prev, curr) => {
    if (done) return [...prev, curr];

    if (curr.id === target.node.id) {
      done = true;
      switch (target.position) {
        case "top":
          return [...prev, node, curr];
        case "bot":
          return [...prev, curr, node];
        case "inside": {
          if (!Array.isArray(curr.children)) return [...prev, curr];

          return [...prev, { ...curr, children: [node, ...curr.children] }];
        }
      }
    }

    if (Array.isArray(curr.children)) {
      return [
        ...prev,
        { ...curr, children: addNode(node, target, curr.children) },
      ];
    }
    return [...prev, curr];
  }, [] as TreeNode[]);
};
export const moveNode = (
  node: TreeNode,
  change: NodeHoveredPosition,
  tree: TreeNode[]
): TreeNode[] => {
  return addNode(node, change, removeNode(node.id, tree));
};

export const editNode = (
  nodeId: string,
  data: Partial<TreeNode>,
  tree: TreeNode[]
): TreeNode[] => {
  let done = false;
  return tree.reduce((prev, curr) => {
    if (done) return [...prev, curr];
    if (curr.id === nodeId) {
      done = true;
      const editedNode = { ...curr, ...data } as TreeNode;
      return [...prev, editedNode];
    }
    if (Array.isArray(curr.children))
      return [
        ...prev,
        { ...curr, children: editNode(nodeId, data, curr.children) },
      ];
    return [...prev, curr];
  }, [] as TreeNode[]);
};

export const applyTreeChange = (
  change: TreeChange,
  tree: TreeNode[]
): TreeNode[] => {
  switch (change.type) {
    case "add": {
      const { node, position } = change.data;

      // accept multiple nodes
      if (Array.isArray(node)) {
        return node
          .reverse()
          .reduce((prev, curr) => addNode(curr, position, prev), tree);
      }

      return addNode(node, position, tree);
    }
    case "move": {
      const { node, position } = change.data;

      // accept multiple nodes
      if (Array.isArray(node)) {
        return node
          .reverse()
          .reduce((prev, curr) => moveNode(curr, position, prev), tree);
      }

      return moveNode(node, position, tree);
    }
    case "edit": {
      const { nodeId, data } = change.data;

      // accept multiple nodes
      if (Array.isArray(nodeId)) {
        return nodeId.reduce((prev, curr) => editNode(curr, data, prev), tree);
      }

      return editNode(nodeId, data, tree);
    }
    case "remove": {
      const { nodeId } = change.data;

      // accept multiple nodes
      if (Array.isArray(nodeId)) {
        return nodeId.reduce((prev, curr) => removeNode(curr, prev), tree);
      }
      return removeNode(nodeId, tree);
    }
  }
};
