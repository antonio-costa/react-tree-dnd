import { NodeDropped, NodeHovered, TreeNode } from "./types";

export const getNode = (
  nodeId: string,
  treeChildren: TreeNode[]
): TreeNode | null => {
  return treeChildren.reduce((prev, curr) => {
    if (prev) return prev;
    if (curr.id === nodeId) return curr;
    if (curr.directory) return getNode(nodeId, curr.children);

    return null;
  }, null as TreeNode | null);
};

export const nodeIsParent = (
  nodeId: string,
  childId: string,
  treeChildren: TreeNode[]
): boolean => {
  const node = getNode(nodeId, treeChildren);
  if (!node?.directory) return false;

  return !!getNode(childId, node?.children);
};
export const removeNode = (
  nodeId: string,
  treeChildren: TreeNode[]
): TreeNode[] => {
  let done = false;
  return treeChildren.reduce((prev, curr) => {
    if (done) return [...prev, curr];
    if (curr.id === nodeId) {
      done = true;
      return [...prev];
    }
    if (curr.directory)
      return [
        ...prev,
        { ...curr, children: removeNode(nodeId, curr.children) },
      ];
    return [...prev, curr];
  }, [] as TreeNode[]);
};
export const addNode = (
  node: TreeNode,
  target: NodeHovered,
  treeChildren: TreeNode[]
): TreeNode[] => {
  let done = false;
  return treeChildren.reduce((prev, curr) => {
    if (done) return [...prev, curr];

    if (curr.id === target.nodeId) {
      done = true;
      switch (target.position) {
        case "top":
          return [...prev, node, curr];
        case "bot":
          return [...prev, curr, node];
        case "inside": {
          if (!curr.directory) return [...prev, curr];

          return [...prev, { ...curr, children: [node, ...curr.children] }];
        }
      }
    }

    if (curr.directory) {
      return [
        ...prev,
        { ...curr, children: addNode(node, target, curr.children) },
      ];
    }
    return [...prev, curr];
  }, [] as TreeNode[]);
};
export const moveNode = (
  change: NodeDropped,
  treeChildren: TreeNode[]
): TreeNode[] => {
  if (!change.target) return treeChildren;

  const node = getNode(change.nodeId, treeChildren);
  if (!node) return treeChildren;

  return addNode(node, change.target, removeNode(node.id, treeChildren));
};

export const isDirectoryEmpty = (
  nodeId: string,
  treeChildren: TreeNode[]
): boolean => {
  return treeChildren.reduce((prev, curr) => {
    if (prev) return prev;
    if (curr.id === nodeId && curr.directory && curr.children.length === 0) {
      return true;
    }
    if (curr.directory) return isDirectoryEmpty(nodeId, curr.children);
    return false;
  }, false as boolean);
};

export const isDirectoryExpanded = (
  nodeId: string,
  treeChildren: TreeNode[]
): boolean => {
  return treeChildren.reduce((prev, curr) => {
    if (prev) return prev;
    if (curr.id === nodeId && curr.directory && curr.expanded) {
      return true;
    }
    if (curr.directory) return isDirectoryExpanded(nodeId, curr.children);
    return false;
  }, false as boolean);
};

export const editNode = (
  nodeId: string,
  data: Partial<TreeNode>,
  treeChildren: TreeNode[]
): TreeNode[] => {
  let done = false;
  return treeChildren.reduce((prev, curr) => {
    if (done) return [...prev, curr];
    if (curr.id === nodeId) {
      done = true;
      const editedNode = { ...curr, ...data } as TreeNode;
      return [...prev, editedNode];
    }
    if (curr.directory)
      return [
        ...prev,
        { ...curr, children: editNode(nodeId, data, curr.children) },
      ];
    return [...prev, curr];
  }, [] as TreeNode[]);
};

export const isDirectory = (
  nodeId: string,
  treeChildren: TreeNode[]
): boolean => {
  return treeChildren.reduce((prev, curr) => {
    if (prev) return prev;
    if (curr.id === nodeId && curr.directory) {
      return true;
    }
    if (curr.directory) return isDirectory(nodeId, curr.children);
    return false;
  }, false as boolean);
};
