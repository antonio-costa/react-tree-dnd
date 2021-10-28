import React, { useEffect, useRef, useMemo, useCallback } from "react";
import { TreeDnDProps, TreeNodeRefs } from "..";
import { DropLineInjectedStyles, NodeHovered } from "./types";

import { Provider } from "react-redux";
import { useAppDispatch, useAppSelector, store } from "../store";
import { treeActions } from "../store/tree-slice";

export const TreeDnD: React.FC<TreeDnDProps> = ({
  tree,
  onChange,
  onClick,
  onExpandedToggle,
  onDragStateChange,
  onDropPositionChange,
  renderer: NodeRenderer,
  dropLineRenderer: DropLineRenderer,
  directoryHoveredClass,
}) => {
  // tree refs
  const refs = useRef<TreeNodeRefs>({});

  // keep track of old states so that events are only emitted if required
  const wasDragging = useRef<string | undefined>();
  const wasHovering = useRef<NodeHovered | null>(null);
  const parentRef = useRef<HTMLDivElement>(null);

  // retrieve from redux store
  const rdispatch = useAppDispatch();

  const hovered = useAppSelector((state) => state.hovered[tree.id]);
  const drop = useAppSelector((state) => state.drop[tree.id]);
  const dragging = useAppSelector((state) => state.dragging[tree.id]);
  const treeChildren = useAppSelector((state) => state.tree[tree.id]?.children);

  // create tree on store
  useEffect(() => {
    if (!treeChildren) {
      rdispatch(treeActions.createTree(tree));
    }
  }, [tree, rdispatch, treeChildren]);

  // events prop
  const treeEvents = useMemo(
    () => ({
      onChange,
      onClick,
      onExpandedToggle,
      onDragStateChange,
      onDropPositionChange,
    }),
    [
      onChange,
      onClick,
      onExpandedToggle,
      onDragStateChange,
      onDropPositionChange,
    ]
  );

  // change tree state
  useEffect(() => {
    rdispatch(
      treeActions.updateTreeChildren({ treeId: tree.id, data: tree.children })
    );
  }, [tree, rdispatch]);

  // emit events
  // onDropPositionChange
  useEffect(() => {
    // check if there was any change to the hovered element
    // (this avoid any false triggers made by state.events or state.refs)
    if (
      hovered === wasHovering.current ||
      (hovered?.nodeId === wasHovering.current?.nodeId &&
        hovered?.position === wasHovering.current?.position)
    )
      return;

    // if dragged "inside" a directory
    if (directoryHoveredClass) {
      // remove all existing stylings
      document
        .querySelector("." + directoryHoveredClass)
        ?.classList.remove(directoryHoveredClass);
      // re-add stylings if it is hovering "inside" de node
      if (hovered?.position === "inside") {
        const hoveredRef = refs.current[hovered.nodeId];
        hoveredRef?.classList.add(directoryHoveredClass);
      }
    }

    // emit onDropPositionChange
    if (treeEvents.onDropPositionChange) {
      if (hovered) {
        treeEvents.onDropPositionChange({
          nodeId: hovered.nodeId,
          position: hovered.position,
        });
      } else {
        treeEvents.onDropPositionChange(null);
      }
    }

    wasHovering.current = hovered;
  }, [treeEvents, hovered, directoryHoveredClass]);

  // emit event onDragStateChange
  useEffect(() => {
    if (dragging?.id === wasDragging.current) return;

    if (treeEvents.onDragStateChange) {
      if (dragging) {
        treeEvents.onDragStateChange(true, dragging || undefined);
      } else {
        treeEvents.onDragStateChange(false);
      }
    }
    wasDragging.current = dragging?.id;
  }, [treeEvents, dragging]);

  // emit onChange
  // item is dropped for 1 tick, then it's removed
  useEffect(() => {
    // move node if it was dropped
    if (drop && drop.target) {
      rdispatch(treeActions.dropEnd(tree.id));
      if (drop.node)
        if (drop.node.external) {
          const newDropNode = { ...drop.node };
          delete newDropNode.external;

          treeEvents.onChange({
            type: "add",
            data: {
              node: newDropNode,
              position: drop.target,
            },
          });
        } else {
          treeEvents.onChange({
            type: "move",
            data: { node: drop.node, position: drop.target },
          });
        }
    }
  }, [drop, treeEvents, treeChildren, rdispatch, tree.id]);

  // update dropline styles
  const dropLineInjectedStyles: DropLineInjectedStyles = useMemo(() => {
    const noDropLine: DropLineInjectedStyles = {
      position: "absolute",
      display: "none",
      top: 0,
      left: 0,
      width: 0,
      pointerEvents: "none",
    };
    if (hovered?.nodeId) {
      const targetEl = refs.current[hovered.nodeId];
      const rootEl = parentRef.current;
      if (!targetEl || !rootEl || hovered.position === "inside") {
        return noDropLine;
      }

      const rootRect = rootEl.getBoundingClientRect();
      const targetRect = targetEl.getBoundingClientRect();

      const height: number =
        hovered.position === "top" ? 0 : targetEl.offsetHeight;
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
  }, [hovered, refs]);

  const addRef = useCallback((nodeId: string, ref: HTMLDivElement) => {
    refs.current[nodeId] = ref;
  }, []);

  // update hovered when outisde the tree
  const onDragLeave = useCallback(
    (e: React.DragEvent) => {
      const relatedTarget = e.relatedTarget as HTMLElement;
      if (
        relatedTarget?.contains(parentRef.current) ||
        !parentRef?.current?.contains(relatedTarget)
      ) {
        rdispatch(treeActions.updateHovered({ treeId: tree.id, data: null }));
      }
    },
    [rdispatch, tree.id]
  );

  return (
    <div
      className="root"
      onDragLeave={onDragLeave}
      style={{ position: "relative" }}
      ref={parentRef}
    >
      {tree.children.map((node) => (
        <NodeRenderer
          node={node}
          treeEvents={treeEvents}
          addRef={addRef}
          treeId={tree.id}
          key={node.id}
        />
      ))}
      {hovered?.nodeId ? (
        <DropLineRenderer injectedStyles={{ ...dropLineInjectedStyles }} />
      ) : null}
    </div>
  );
};

export const TreeDnDProvider: React.FC<{}> = (props) => {
  return <Provider store={store}>{props.children}</Provider>;
};
