import React, { useCallback, useMemo, useRef, useState } from "react";
import { DropLinePortal } from "./DropLinePortal";
import { nodeIsParent } from "./helpers";
import {
  DragPreviewRenderer,
  DropLineInjectedStyles,
  DropLineRenderer,
  NodeHoveredPosition,
  DroppableChildren,
  TreeNode,
  TreeOnBeforeDrop,
  TreeOnChange,
} from "./types";

export interface DroppableProps {
  dropLineRenderer: DropLineRenderer;
  dragPreviewRenderer?: DragPreviewRenderer;
  onChange: TreeOnChange;
  /**
   * This event is called before any drop (and to decide if dropline should be displayed)
   * @dragging TreeNode | null - The node that's being dragged. If it's null,
   * then the node being dragged is an external node
   * @target NodeHoveredPosition - Where the node will be dropped
   * @return TreeNode | TreeNode[] | null - The return value
   * will be the value of the onChange() change. If it is null
   * then onChange() will NOT be triggered
   *  */
  onBeforeDrop?: TreeOnBeforeDrop;
  /**
   * when a empty/non-expanded directory is being hovered
   * this className is appended to the element which is being hovered
   */
  directoryDropClass?: string;
  /**
   * children must be a function which accepts to arguments
   * be careful to not overwrite these props!!
   * (you can customize them, but do not fully overwrite them)
   * @injectDroppable - props to inject in the root element of the tree/droppable
   * @injectDraggable - props to inject into every draggable node
   */
  children: DroppableChildren;
}

const noDropLineStyles: DropLineInjectedStyles = {
  top: 0,
  left: 0,
  position: "absolute",
  width: 0,
  display: "none",
  pointerEvents: "none",
};

export const Droppable: React.VFC<DroppableProps> = ({
  children,
  dropLineRenderer: DropLineRenderer,
  onBeforeDrop,
  onChange,
  directoryDropClass,
  dragPreviewRenderer,
}) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const dropLinePosition = useRef<NodeHoveredPosition | null>(null);
  const canNodeDrop = useRef<boolean>(true);

  const [dropLineStyles, setDropLineStyles] =
    useState<DropLineInjectedStyles>(noDropLineStyles);

  const [draggingNode, setDraggingNode] = useState<{
    node: TreeNode;
  } | null>(null);

  const onToggleDragging = useCallback((dragging: boolean, node?: TreeNode) => {
    if (dragging && node) setDraggingNode({ node });
    else setDraggingNode(null);
  }, []);

  const onTargetDrop = useCallback(
    (target: NodeHoveredPosition | null) => {
      // if it's dragging a node internally
      if (target && draggingNode) {
        const dropping =
          (onBeforeDrop && onBeforeDrop(draggingNode.node, target)) ||
          draggingNode.node;
        onChange({
          type: "move",
          data: {
            node: dropping,
            position: target,
          },
        });
        // if it is not dragging a node internally
        // and has an external handler
      } else if (target && onBeforeDrop) {
        // if external handler provides a node
        const dropping = onBeforeDrop(null, target);
        if (dropping) {
          onChange({
            type: "add",
            data: {
              node: dropping,
              position: target,
            },
          });
        }
      }
    },
    [draggingNode, onChange, onBeforeDrop]
  );

  const onDropPositionChange = useCallback(
    (
      position: NodeHoveredPosition | null,
      ref?: React.RefObject<HTMLDivElement>,
      canDrop?: boolean
    ) => {
      if (position === null) {
        setDropLineStyles(noDropLineStyles);
        canNodeDrop.current = false;
        directoryDropClass &&
          ref?.current?.classList.remove(directoryDropClass);
        dropLinePosition.current = position;
        return;
      }

      // check if drop position has changed since last time
      if (
        (position === null && dropLinePosition.current === null) ||
        (position?.node === dropLinePosition.current?.node &&
          position?.position === dropLinePosition.current?.position)
      ) {
        dropLinePosition.current = position;
        return;
      }

      // inject styles on dropline
      if (ref?.current) {
        if (position.position === "inside" && canDrop) {
          if (directoryDropClass) {
            ref.current.classList.add(directoryDropClass);
          }
          setDropLineStyles(noDropLineStyles);
          canNodeDrop.current = false;
        } else {
          if (directoryDropClass) {
            ref.current.classList.remove(directoryDropClass);
          }
          const rect = ref.current?.getBoundingClientRect();
          const scrollTop =
            document.documentElement.scrollTop || window.scrollY;
          const scrollLeft =
            document.documentElement.scrollLeft || window.scrollX;
          if (rect) {
            if (canDrop) {
              setDropLineStyles({
                position: "absolute",
                display: "block",
                left: rect.left + scrollLeft,
                top:
                  rect.top +
                  (position.position === "bot" ? rect.height : 0) +
                  scrollTop,
                width: rect.width,
                pointerEvents: "none",
              });
              canNodeDrop.current = true;
            } else {
              setDropLineStyles(noDropLineStyles);
              canNodeDrop.current = false;
            }
          }
        }
      }
      dropLinePosition.current = position;
    },
    [dropLinePosition, directoryDropClass]
  );

  const onDragLeave = useCallback(
    (e: React.DragEvent) => {
      const relatedTarget = e.relatedTarget as HTMLElement;
      if (
        relatedTarget?.contains(parentRef.current) ||
        !parentRef?.current?.contains(relatedTarget)
      ) {
        onDropPositionChange(null);
      }
    },
    [onDropPositionChange]
  );

  const canDrop = useCallback(
    (e: React.DragEvent, node: TreeNode): boolean => {
      // if not dragging through this tree
      // (it's an external node)
      if (!draggingNode) {
        // no handler for external drops, so they are not allowed
        if (!onBeforeDrop) {
          return false;
        }

        // dropping in a specific position
        if (dropLinePosition.current) {
          const allowDrop = onBeforeDrop(null, dropLinePosition.current);

          // if the external handler returns a node, allow the drop to be made
          if (allowDrop) {
            e.preventDefault();
            return true;
          } else {
            return false;
          }
        }
        // by default reject every external node
        return false;
      }
      // if dragging inside the tree
      else {
        // cannot drop on itself or on a child
        if (
          draggingNode.node.id === node.id ||
          nodeIsParent(draggingNode.node, node.id)
        ) {
          return false;
        }
      }
      // by default accept everything else
      e.preventDefault();
      return true;
    },
    [draggingNode, onBeforeDrop]
  );

  // child must be a function which provides the injectable props
  // for both the tree wrapper and the tree nodes
  const _nodeEvents = useMemo(
    () => ({
      onToggleDragging,
      onTargetDrop,
      onDropPositionChange,
      canDrop,
    }),
    [onToggleDragging, onTargetDrop, onDropPositionChange, canDrop]
  );

  const childrenMemoed = useMemo(
    () =>
      children({
        injectDroppable: {
          ref: parentRef,
          onDragLeave,
        },
        injectDraggable: {
          _nodeEvents,
          dragPreviewRenderer,
        },
      }),
    [parentRef, onDragLeave, _nodeEvents, dragPreviewRenderer, children]
  );

  return (
    <>
      {childrenMemoed}
      <DropLinePortal
        renderer={DropLineRenderer}
        injectedStyles={dropLineStyles}
      />
    </>
  );
};
