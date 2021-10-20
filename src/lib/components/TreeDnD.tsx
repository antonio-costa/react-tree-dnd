import React, {
  createContext,
  Reducer,
  useContext,
  useReducer,
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from "react";
import { addNode, editNode, getNode, moveNode, removeNode } from "./helpers";
import {
  DnDSortableTreeProps,
  DropLineInjectedStyles,
  NodeDropPosition,
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
    events: { onChange: () => {} },
    refs: {},
  },
  () => {},
]);

export const TreeDnD: React.VFC<DnDSortableTreeProps> = ({
  tree,
  onChange,
  onClick,
  onExpandedToggle,
  onDragStateChange,
  onDropPositionChange,
  renderer: NodeRenderer,
  dropLineRenderer: DropLineRenderer,
}) => {
  // keep track of old states so that events are only emitted if required
  const wasDragging = useRef<string | null>(null);
  const wasHovering = useRef<NodeHovered | null>(null);
  const parentRef = useRef<HTMLDivElement>(null);

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
        }, {} as TreeEvents);

        return { ...state, events: { ...events } };
      case "DROP":
        return { ...state, drop: action.data };
      case "CHANGE_REFS":
        return {
          ...state,
          refs: { ...state.refs, [action.data.id]: action.data.ref },
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
      events: { onChange: () => {} },
      refs: {},
    }
  );
  // change tree state
  useEffect(() => {
    dispatch({ type: "CHANGE_TREE", data: tree });
  }, [tree, dispatch]);

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

  // item is dropped for 1 tick, then it's removed
  useEffect(() => {
    // move node if it was dropped
    if (state.drop) {
      dispatch({ type: "DROP", data: null });
      state.events.onChange(moveNode(state.drop, state.tree.children));
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

  const dropLineInjectedStyles: DropLineInjectedStyles = useMemo(() => {
    const noDropLine: DropLineInjectedStyles = {
      position: "absolute",
      display: "none",
      top: 0,
      left: 0,
      width: 0,
      pointerEvents: "none",
    };
    if (state.hovered?.nodeId) {
      const targetEl = state.refs[state.hovered?.nodeId].current;
      const rootEl = parentRef.current;
      if (!targetEl || !rootEl || state.hovered.position === "inside")
        return noDropLine;

      const rootRect = rootEl.getBoundingClientRect();
      const targetRect = targetEl.getBoundingClientRect();

      const height: number =
        state.hovered.position === "top" ? 0 : targetEl.offsetHeight;
      const width: number = targetEl.offsetWidth;

      return {
        position: "absolute",
        display: "block",
        left: targetRect.left - rootRect.left,
        top: targetRect.top - rootRect.top + height,
        width,
        pointerEvents: "none",
      };
    }
    return noDropLine;
  }, [state.hovered, state.refs]);

  const onDragLeave = useCallback(
    (e: React.DragEvent) => {
      if ((e.relatedTarget as HTMLElement).contains(parentRef.current)) {
        dispatch({ type: "CHANGE_HOVERED", data: null });
      }
    },
    [dispatch]
  );

  return (
    <DnDTreeContext.Provider value={[state, dispatch]}>
      <div
        className="root"
        onDragLeave={onDragLeave}
        style={{ position: "relative" }}
        ref={parentRef}
      >
        {tree.children.map((node) => (
          <NodeRenderer {...node} key={node.id} />
        ))}
        {state.hovered?.nodeId ? (
          <DropLineRenderer injectedStyles={{ ...dropLineInjectedStyles }} />
        ) : null}
      </div>
    </DnDTreeContext.Provider>
  );
};

export const useTreeDnDState = (): [
  TreeContext,
  React.Dispatch<TreeContextAction>
] => {
  const [state, dispatch] = useContext(DnDTreeContext);
  return [state, dispatch];
};

export const useTreeDnD = (defaultValue: TreeIdentifier) => {
  const [tree, setTree] = useState<TreeIdentifier>(defaultValue);
  return {
    tree,
    setTree,
    addNode: (node: TreeNode, position: NodeDropPosition) => {
      setTree((old) => ({
        ...old,
        children: addNode(node, position, old.children),
      }));
    },
    moveNode: (nodeId: string, position: NodeDropPosition) => {
      setTree((old) => ({
        ...old,
        children: moveNode({ nodeId, target: position }, old.children),
      }));
    },
    editNode: (nodeId: string, data: Partial<TreeNode>) => {
      setTree((old) => ({
        ...old,
        children: editNode(nodeId, data, old.children),
      }));
    },
    removeNode: (nodeId: string) => {
      setTree((old) => ({
        ...old,
        children: removeNode(nodeId, old.children),
      }));
    },
  };
};
