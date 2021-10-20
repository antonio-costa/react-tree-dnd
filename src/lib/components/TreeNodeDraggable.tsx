import React, { useState, useRef, useEffect, memo } from "react";
import { useTreeDnDState } from "./TreeDnD";
import {
  editNode,
  isDirectory,
  isDirectoryEmpty,
  isDirectoryExpanded,
  nodeIsParent,
} from "./helpers";
import { DropPosition, TreeNodeDraggableProps } from "./types";

export const TreeNodeDraggable: React.FC<
  TreeNodeDraggableProps & React.HTMLProps<HTMLDivElement>
> = memo(
  ({
    node,
    children,
    handleRef,
    previewRef,
    dropRef,
    expandRef,
    clickRef,
    ...rest
  }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [draggable, setDraggable] = useState<boolean>(false);
    const [state, dispatch] = useTreeDnDState();

    useEffect(() => {
      if (!ref.current) return;
      dispatch({ type: "CHANGE_REFS", data: { id: node.id, ref } });
    }, [ref, dispatch, node.id]);

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

        // emit onChange event
        state.events.onChange(
          editNode(node.id, { expanded: !node.expanded }, state.tree.children)
        );

        // emit event if exists
        if (state.events.onExpandedToggle) {
          state.events.onExpandedToggle(node, !node.expanded);
        }
      };

      // if there's a handle, set the DOM Event listeners
      expandRefC.current.addEventListener("click", onClick);

      return () => {
        if (!expandRefC.current) return;

        expandRefC.current.removeEventListener("click", onClick);
      };
    }, [expandRef, node, state.events, dispatch, state.tree.children]);

    // inject events into clickRef
    useEffect(() => {
      if (!clickRef?.current || !node) return;

      const clickRefC = { ...clickRef };

      if (!clickRefC.current) return;

      const onClick = (e: MouseEvent) => {
        if (!state.events.onClick) return;

        // emit event if exists
        state.events.onClick(node);
      };

      // if there's a handle, set the DOM Event listeners
      clickRefC.current.addEventListener("click", onClick);

      return () => {
        if (!clickRefC.current) return;

        clickRefC.current.removeEventListener("click", onClick);
      };
    }, [clickRef, node, state.events, dispatch]);

    const DraggableProps: React.HTMLAttributes<HTMLDivElement> = {
      draggable,
      onDrop: (e: React.DragEvent) => {
        // only execute if dragging in this context
        if (!state.dragging) return;

        // update context stopped dragging and hovering
        if (state.hovered?.nodeId === node.id) {
          dispatch({
            type: "DROP",
            data: { nodeId: state.dragging, target: state.hovered },
          });

          dispatch({ type: "CHANGE_HOVERED", data: null });
          dispatch({ type: "CHANGE_DRAGGING", data: null });
        }
      },
      onDragEnd: (e: React.DragEvent) => {
        // only execute if dragging in this context
        if (!state.dragging) return;

        if (handleRef?.current) {
          setDraggable(false);
        }
        // update context stopped dragging and hovering
        dispatch({ type: "CHANGE_HOVERED", data: null });
        dispatch({ type: "CHANGE_DRAGGING", data: null });
      },
      onDragEnter: (e: React.DragEvent) => {
        e.preventDefault();
      },
      onDragOver: (e: React.DragEvent) => {
        // don't trigger self and don't execute if not dragging in this context
        if (!state.dragging) return;
        if (state.dragging === node.id) return;
        // can't hover if dragging node is parent of this
        if (nodeIsParent(state.dragging, node.id, state.tree.children)) return;
        // only the shallowest child should be triggered
        e.stopPropagation();
        // droppable
        e.preventDefault();
        // where it is being dragged over (top or bot 50%)
        // mouse position relating to box position:
        const elRect = e.currentTarget.getBoundingClientRect();

        const verticalMousePos: DropPosition = (() => {
          const pos = (e.clientY - elRect.y) / elRect.height;

          if (
            isDirectory(node.id, state.tree.children) &&
            (isDirectoryEmpty(node.id, state.tree.children) ||
              !isDirectoryExpanded(node.id, state.tree.children))
          ) {
            return pos >= 0.7 ? "bot" : pos >= 0.3 ? "inside" : "top";
          } else {
            return pos > 0.5 ? "bot" : "top";
          }
        })();

        if (
          state.hovered?.nodeId !== node.id ||
          state.hovered?.position !== verticalMousePos
        ) {
          dispatch({
            type: "CHANGE_HOVERED",
            data: { nodeId: node.id, position: verticalMousePos },
          });
        }
      },
      onDragStart: (e: React.DragEvent) => {
        if (!draggable) return;

        // stop propagation otherwise the dragstart will propagate
        // through parents until reaching the root node element
        e.stopPropagation();

        // update context started draging
        dispatch({ type: "CHANGE_DRAGGING", data: node.id });

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
