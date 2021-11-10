import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  NodeHovered,
  TreeContext,
  TreeId,
  TreeIdentifier,
  TreeNode,
  WithTree,
} from "..";

const initialState: TreeContext = {
  tree: {},
  dragging: {},
  hovered: {},
  drop: {},
};

const treeSlice = createSlice({
  name: "tree",
  initialState: initialState as TreeContext,
  reducers: {
    createTree(state, action: PayloadAction<TreeIdentifier>) {
      const { id, children } = action.payload;
      state.tree[id] = { id, children };
    },
    updateTreeChildren(state, action: PayloadAction<WithTree<TreeNode[]>>) {
      const { treeId, data } = action.payload;
      if (state.tree[treeId]) {
        state.tree[treeId].children = data;
      }
    },
    updateDragging(
      state,
      action: PayloadAction<
        WithTree<{ node: TreeNode; external?: boolean } | null>
      >
    ) {
      const { treeId, data } = action.payload;
      state.dragging[treeId] = data;
    },
    updateHovered(state, action: PayloadAction<WithTree<NodeHovered | null>>) {
      const { treeId, data } = action.payload;
      if (
        state.hovered[treeId]?.nodeId !== data?.nodeId ||
        state.hovered[treeId]?.position !== data?.position
      ) {
        state.hovered[treeId] = data;
      }
    },
    drop(state, action: PayloadAction<TreeId>) {
      const treeId = action.payload;
      const draggingNode = state.dragging[treeId];
      // should this be a thunk ???
      if (draggingNode?.node) {
        state.drop[treeId] = {
          droppedNode: {
            node: draggingNode.node,
            target: state.hovered[treeId],
          },
          external: draggingNode.external,
        };
      }
    },
    dropEnd(state, action: PayloadAction<TreeId>) {
      const treeId = action.payload;
      state.drop[treeId] = null;
    },
  },
});

const treeActions = treeSlice.actions;

export { treeSlice, treeActions };
