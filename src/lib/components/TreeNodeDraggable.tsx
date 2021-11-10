import React, { useState, useRef, useEffect, memo, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../store";
import { treeActions } from "../store/tree-slice";
import { nodeIsParent } from "./helpers";
import { DropPosition, TreeNodeDraggableProps } from "./types";

export const TreeNodeDraggable: React.FC<
  TreeNodeDraggableProps & React.HTMLProps<Element>
> = memo(
  ({
    node,
    children,
    handleRef,
    previewRef,
    expandRef,
    clickRef,
    addRef,
    treeId,
    external,
    treeEvents,
  }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [draggable, setDraggable] = useState<boolean>(false);
    const rdispatch = useAppDispatch();
    const dragging = useAppSelector((state) => state.dragging[treeId]);

    // if an handle exists, set the node only draggable when clicking the handle
    useEffect(() => {
      // if there's no handle, the node is always draggable
      if (!handleRef?.current) {
        setDraggable(true);
        return;
      }
      const onMouseDown = () => {
        setDraggable(true);
      };
      const onMouseUp = () => {
        setDraggable(false);
      };

      const handleRefC = { ...handleRef };
      if (!handleRefC.current) return;
      // if there's a handle, set the DOM Event listeners
      handleRefC.current.addEventListener("mousedown", onMouseDown);
      handleRefC.current.addEventListener("mouseup", onMouseUp);

      return () => {
        if (!handleRefC.current) return;

        handleRefC.current.removeEventListener("mousedown", onMouseDown);
        handleRefC.current.removeEventListener("mouseup", onMouseUp);
      };
    }, [handleRef]);

    // inject events into expandRef
    useEffect(() => {
      if (external) return;
      if (!expandRef?.current || !node) return;

      const expandRefC = { ...expandRef };

      if (!expandRefC.current) return;

      const onClick = (e: MouseEvent) => {
        if (!node.directory) return;

        // if folder toggle then don't act as a click
        e.stopPropagation();

        // emit events
        if (treeEvents?.onExpandedToggle)
          treeEvents.onExpandedToggle(node, !node.expanded);

        treeEvents?.onChange({
          type: "edit",
          data: { nodeId: node.id, data: { expanded: !node.expanded } },
        });
      };

      // if there's a handle, set the DOM Event listeners
      expandRefC.current.addEventListener("click", onClick);

      return () => {
        if (!expandRefC.current) return;

        expandRefC.current.removeEventListener("click", onClick);
      };
    }, [expandRef, node, treeEvents, external]);

    // inject events into clickRef
    useEffect(() => {
      if (!clickRef?.current || !node) return;

      const clickRefC = { ...clickRef };

      if (!clickRefC.current) return;

      const onClick = (e: MouseEvent) => {
        if (!treeEvents?.onClick) return;

        // emit event if exists
        treeEvents.onClick(node);
      };

      // if there's a handle, set the DOM Event listeners
      clickRefC.current.addEventListener("click", onClick);

      return () => {
        if (!clickRefC.current) return;

        clickRefC.current.removeEventListener("click", onClick);
      };
    }, [clickRef, node, treeEvents]);
    // DRAG EVENTS
    const onDrop = useCallback(
      (e: React.DragEvent) => {
        // only execute if dragging in this context
        if (!dragging) return;

        // update context stopped dragging and hovering
        rdispatch(treeActions.drop(treeId));
        rdispatch(treeActions.updateHovered({ treeId, data: null }));
        rdispatch(treeActions.updateDragging({ treeId, data: null }));
      },
      [rdispatch, dragging, treeId]
    );

    const onDragEnd = useCallback(
      (e: React.DragEvent) => {
        const draggingNode = dragging;
        // only execute if dragging in this context
        if (!draggingNode) return;

        if (handleRef?.current) {
          setDraggable(false);
        }
        // update context stopped dragging and hovering
        rdispatch(treeActions.updateHovered({ treeId, data: null }));
        rdispatch(treeActions.updateDragging({ treeId, data: null }));
      },
      [dragging, handleRef, rdispatch, treeId]
    );
    const onDragEnter = useCallback((e: React.DragEvent) => {
      e.preventDefault();
    }, []);
    const onDragOver = useCallback(
      (e: React.DragEvent) => {
        // don't trigger self and don't execute if not dragging in this context
        if (!dragging) return;
        // only the shallowest child should be triggered
        e.stopPropagation();
        if (dragging.node.id === node.id) {
          rdispatch(treeActions.updateHovered({ treeId, data: null }));
          return;
        }
        // can't hover if dragging node is parent of this
        if (nodeIsParent(dragging.node, node.id)) return;

        // droppable
        e.preventDefault();
        // where it is being dragged over (top or bot 50%)
        // mouse position relating to box position:
        const elRect = e.currentTarget.getBoundingClientRect();

        const verticalMousePos: DropPosition = (() => {
          const pos = (e.clientY - elRect.y) / elRect.height;

          if (
            node.directory &&
            (node.children.length === 0 || !node.expanded)
          ) {
            return pos >= 0.7 ? "bot" : pos >= 0.3 ? "inside" : "top";
          } else {
            return pos > 0.5 ? "bot" : "top";
          }
        })();

        // dispatch hovered action,
        // this will only update the state
        // if there is actually a change (verified in the store)
        rdispatch(
          treeActions.updateHovered({
            treeId,
            data: {
              nodeId: node.id,
              position: verticalMousePos,
            },
          })
        );
      },
      [dragging, node, rdispatch, treeId]
    );

    const onDragStart = useCallback(
      (e: React.DragEvent) => {
        // stop propagation otherwise the dragstart will propagate
        // through parents until reaching the root node element
        e.stopPropagation();

        // update context started draging
        rdispatch(
          treeActions.updateDragging({ treeId, data: { node, external } })
        );

        // set the drag preview
        if (previewRef?.current) {
          e.dataTransfer.setDragImage(previewRef.current, 0, 0);
        } else if (ref.current) {
          e.dataTransfer.setDragImage(ref.current, 0, 0);
        }
      },
      [node, previewRef, rdispatch, treeId, external]
    );
    return (
      <div
        ref={(ref) => addRef && addRef(node.id, ref)}
        onDrop={onDrop}
        onDragEnd={onDragEnd}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnter={onDragEnter}
        draggable={draggable}
      >
        {children}
      </div>
    );
  }
);
