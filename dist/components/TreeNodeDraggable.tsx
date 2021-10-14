import React, { useState, useRef, useEffect, memo, useMemo } from "react";
import { useDndTreeState } from "./DnDSortableTree";
import {
  getNode,
  isDirectory,
  isDirectoryEmpty,
  isDirectoryExpanded,
  nodeIsParent,
} from "./helpers";
import { DropPosition } from "./types";

interface TreeNodeDraggableProps {
  handleRef?: React.MutableRefObject<HTMLElement | null>;
  expandRef?: React.MutableRefObject<HTMLElement | null>;
  previewRef?: React.MutableRefObject<HTMLElement | null>;
  dropRef?: React.MutableRefObject<HTMLElement | null>;
  nodeId: string;
}

export const TreeNodeDraggable: React.FC<
  TreeNodeDraggableProps & React.HTMLProps<HTMLDivElement>
> = memo(
  ({
    nodeId,
    children,
    handleRef,
    previewRef,
    dropRef,
    expandRef,
    ...rest
  }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [draggable, setDraggable] = useState<boolean>(false);
    const hovering = useRef<boolean>(false);
    const [state, dispatch] = useDndTreeState();
    const node = useMemo(
      () => getNode(nodeId, state.tree.children),
      [nodeId, state.tree.children]
    );

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
      if (!expandRef?.current || !node) return;

      const expandRefC = { ...expandRef };

      if (!expandRefC.current) return;

      const onClick = (e: MouseEvent) => {
        if (!node.directory) return;

        // if folder toggle then don't act as a click
        e.stopPropagation();

        // update state
        dispatch({ type: "DIRECTORY_TOGGLE", data: node.id });

        // emit event if exists
        if (state.events.onExpandedToggle) {
          state.events.onExpandedToggle(node, !node?.expanded);
        }
      };

      // if there's a handle, set the DOM Event listeners
      expandRefC.current.addEventListener("click", onClick);

      return () => {
        if (!expandRefC.current) return;

        expandRefC.current.removeEventListener("click", onClick);
      };
    }, [expandRef, node, state.events, dispatch]);

    const DraggableProps: React.HTMLAttributes<HTMLDivElement> = {
      draggable,
      onDrop: (e: React.DragEvent) => {
        // don't trigger self and don't execute if not dragging explicitly
        if (!state.dragging) return;

        // update context stopped dragging and hovering
        if (state.hovered?.nodeId === nodeId) {
          dispatch({
            type: "DROP",
            data: { nodeId: state.dragging, target: state.hovered },
          });
          dispatch({ type: "CHANGE_HOVERED", data: null });
          dispatch({ type: "CHANGE_DRAGGING", data: null });
        }
      },
      onDragEnd: (e: React.DragEvent) => {
        if (handleRef?.current) {
          setDraggable(false);
        }

        // update context stopped dragging and hovering
        if (state.hovered?.nodeId === nodeId) {
          dispatch({ type: "CHANGE_HOVERED", data: null });
          dispatch({ type: "CHANGE_DRAGGING", data: null });
        }
      },
      onDragOver: (e: React.DragEvent) => {
        // only the shallowest child should be triggered
        e.stopPropagation();

        // don't trigger self and don't execute if not dragging explicitly
        if (!state.dragging) return;
        if (state.dragging === nodeId) return;

        // can't hover if dragging node is parent of this
        if (nodeIsParent(state.dragging, nodeId, state.tree.children)) return;

        // droppable
        e.preventDefault();

        // where it is being dragged over (top or bot 50%)
        // mouse position relating to box position:
        const elRect = e.currentTarget.getBoundingClientRect();

        const verticalMousePos: DropPosition = (() => {
          const pos = (e.clientY - elRect.y) / elRect.height;

          if (
            isDirectory(nodeId, state.tree.children) &&
            (isDirectoryEmpty(nodeId, state.tree.children) ||
              !isDirectoryExpanded(nodeId, state.tree.children))
          ) {
            return pos >= 0.7 ? "bot" : pos >= 0.3 ? "inside" : "top";
          } else {
            return pos > 0.5 ? "bot" : "top";
          }
        })();

        if (
          state.hovered?.nodeId !== nodeId ||
          state.hovered?.position !== verticalMousePos
        ) {
          dispatch({
            type: "CHANGE_HOVERED",
            data: { nodeId, position: verticalMousePos },
          });
        }
      },
      onDragEnter: (e: React.MouseEvent) => {
        hovering.current = true;
      },
      onDragLeave: (e: React.DragEvent) => {
        if (!hovering.current) {
          dispatch({
            type: "CHANGE_HOVERED",
            data: null,
          });
        }
        hovering.current = false;
      },
      onDragStart: (e: React.DragEvent) => {
        if (!draggable) return;

        // stop propagation otherwise the dragstart will propagate
        // through parents until reaching the root node element
        e.stopPropagation();

        // update context started draging
        dispatch({ type: "CHANGE_DRAGGING", data: nodeId });

        // set the drag preview
        if (previewRef?.current) {
          e.dataTransfer.setDragImage(previewRef.current, 0, 0);
        } else if (ref.current) {
          e.dataTransfer.setDragImage(ref.current, 0, 0);
        }
      },
    };

    return (
      <div ref={ref} {...DraggableProps} {...rest}>
        {children}
      </div>
    );
  }
);
