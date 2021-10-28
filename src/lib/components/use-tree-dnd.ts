import { useCallback, useState } from "react";
import { NodeDropPosition, TreeChange, TreeIdentifier, TreeNode } from "..";
import { addNode, editNode, moveNode, removeNode } from "./helpers";

export const useTreeDnD = (defaultValue: TreeIdentifier) => {
  const [tree, setTree] = useState<TreeIdentifier>(defaultValue);

  const addNodeState = useCallback(
    (node: TreeNode, position: NodeDropPosition) => {
      setTree((old) => ({
        ...old,
        children: addNode(node, position, old.children),
      }));
    },
    []
  );

  const moveNodeState = useCallback(
    (node: TreeNode, position: NodeDropPosition) => {
      setTree((old) => ({
        ...old,
        children: moveNode({ node, target: position }, old.children),
      }));
    },
    []
  );

  const editNodeState = useCallback(
    (nodeId: string, data: Partial<TreeNode>) => {
      setTree((old) => ({
        ...old,
        children: editNode(nodeId, data, old.children),
      }));
    },
    []
  );

  const removeNodeState = useCallback((nodeId: string) => {
    setTree((old) => ({
      ...old,
      children: removeNode(nodeId, old.children),
    }));
  }, []);

  const applyChange = useCallback(
    (change: TreeChange) => {
      switch (change.type) {
        case "add": {
          const { node, position } = change.data;
          addNodeState(node, position);
          return;
        }
        case "move": {
          const { node, position } = change.data;
          moveNodeState(node, position);
          return;
        }
        case "edit": {
          const { nodeId, data } = change.data;
          editNodeState(nodeId, data);
          return;
        }
        case "remove": {
          const { nodeId } = change.data;
          removeNodeState(nodeId);
          return;
        }
      }
    },
    [addNodeState, removeNodeState, moveNodeState, editNodeState]
  );
  return {
    tree,
    setTree,
    applyChange,
    addNode: addNodeState,
    moveNode: moveNodeState,
    editNode: editNodeState,
    removeNode: removeNodeState,
  };
};
