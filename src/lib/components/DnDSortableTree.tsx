import React, {
  createContext,
  Reducer,
  useContext,
  useReducer,
  useEffect,
  useRef,
  useState,
} from "react";
import { editNode, getNode, moveNode } from "./helpers";
import { TreeNodeRendererDefault } from "./TreeNodeRendererDefault";
import {
  DnDSortableTreeProps,
  NodeHovered,
  TreeContext,
  TreeContextAction,
  TreeEvents,
  TreeIdentifier,
  TreeNode,
} from "./types";

export const DnDTreeContext = createContext<
  [TreeContext, React.Dispatch<TreeContextAction>]
>([
  {
    tree: { id: "", children: [] },
    dragging: null,
    hovered: null,
    drop: null,
    events: {},
  },
  () => {},
]);

export const DnDSortableTree: React.VFC<DnDSortableTreeProps> = ({
  tree,
  onChange,
  onClick,
  onExpandedToggle,
  onDragStateChange,
  onDropPositionChange,
  renderer,
}) => {
  // keep track of old states so that events are only emitted if required
  const wasDragging = useRef<string | null>(null);
  const wasHovering = useRef<NodeHovered | null>(null);
  const treeChildren = useRef<TreeNode[]>([]);

  // loop through tree and render the nodes thorugh the renderer...

  const reducer = (state: TreeContext, action: TreeContextAction) => {
    switch (action.type) {
      case "CHANGE_TREE":
        return { ...state, tree: action.data };
      case "CHANGE_DRAGGING":
        return { ...state, dragging: action.data };
      case "CHANGE_HOVERED":
        return { ...state, hovered: action.data };
      case "SET_EVENTS":
        const events = (
          Object.keys(action.data) as (keyof TreeEvents)[]
        ).reduce((prev, curr) => {
          if (action.data[curr]) return { ...prev, [curr]: action.data[curr] };
          return prev;
        }, {} as Partial<TreeEvents>);

        return { ...state, events: { ...events } };
      case "DROP":
        return { ...state, drop: action.data };
      case "DIRECTORY_TOGGLE":
        const node = getNode(action.data, state.tree.children);
        if (!node?.directory) return state;

        const expanded = !node?.expanded;

        if (expanded === undefined || expanded === null) return state;

        return {
          ...state,
          tree: {
            ...state.tree,
            children: editNode(action.data, { expanded }, state.tree.children),
          },
        };
    }
  };

  const [state, dispatch] = useReducer<Reducer<TreeContext, TreeContextAction>>(
    reducer,
    {
      tree,
      dragging: null,
      hovered: null,
      drop: null,
      events: {},
    }
  );
  // emit events
  // emit event onDropPositionChange
  useEffect(() => {
    if (
      state.hovered === wasHovering.current ||
      (state.hovered?.nodeId === wasHovering.current?.nodeId &&
        state.hovered?.position === wasHovering.current?.position)
    )
      return;
    if (state.events.onDropPositionChange) {
      if (state.hovered) {
        state.events.onDropPositionChange({
          nodeId: state.hovered.nodeId,
          position: state.hovered.position,
        });
      } else {
        state.events.onDropPositionChange(null);
      }
    }
    wasHovering.current = state.hovered;
  }, [state.events, state.hovered]);

  // emit event onDragStateChange
  useEffect(() => {
    if (state.dragging === wasDragging.current) return;

    if (state.events.onDragStateChange) {
      if (state.dragging) {
        const node = getNode(state.dragging, state.tree.children);
        state.events.onDragStateChange(true, node || undefined);
      } else {
        state.events.onDragStateChange(false);
      }
    }
    wasDragging.current = state.dragging;
  }, [state.events, state.dragging, state.tree.children]);

  // update tree
  useEffect(() => {
    dispatch({ type: "CHANGE_TREE", data: tree });
  }, [tree]);

  useEffect(() => {
    // make sure that the "previous" tree is up to date
    treeChildren.current = state.tree.children;
  }, [state.tree.children]);

  // item is dropped for 1 tick, then it's removed
  useEffect(() => {
    let newTreeChildren = state.tree.children;

    // move node if it was dropped
    if (state.drop) {
      dispatch({ type: "DROP", data: null });
      newTreeChildren = moveNode(state.drop, state.tree.children);
    }

    // if the tree has changed, trigger onChange event
    if (
      JSON.stringify(treeChildren.current) !== JSON.stringify(newTreeChildren)
    ) {
      if (state.events.onChange) {
        state.events.onChange(newTreeChildren);
      }
    }
  }, [state.drop, state.events, state.tree.children]);

  // update events if changed
  useEffect(() => {
    dispatch({
      type: "SET_EVENTS",
      data: {
        onChange,
        onClick,
        onExpandedToggle,
        onDragStateChange,
        onDropPositionChange,
      },
    });
  }, [
    onChange,
    onClick,
    onExpandedToggle,
    onDragStateChange,
    onDropPositionChange,
  ]);

  return (
    <DnDTreeContext.Provider value={[state, dispatch]}>
      {tree.children.map((node) =>
        renderer ? (
          renderer(node.id)
        ) : (
          <TreeNodeRendererDefault key={node.id} nodeId={node.id} />
        )
      )}
    </DnDTreeContext.Provider>
  );
};

export const useDndTreeState = (): [
  TreeContext,
  React.Dispatch<TreeContextAction>
] => {
  const [state, dispatch] = useContext(DnDTreeContext);
  return [state, dispatch];
};

export const useDndTree = (defaultValue: TreeIdentifier) => {
  const [tree, setTree] = useState<TreeIdentifier>(defaultValue);
  return {
    tree,
    setTree,
    addNode: () => {},
    removeNode: () => {},
  };
};
