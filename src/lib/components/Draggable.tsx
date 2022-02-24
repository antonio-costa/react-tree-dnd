import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { DragPreviewPortal } from "./DragPreviewPortal";
import { DraggableProps, DropPosition, NodeHoveredPosition } from "./types";

export const Draggable = React.memo<DraggableProps>(
  ({ node, _nodeEvents, children, dragPreviewRenderer, dragHandleRef }) => {
    const { onToggleDragging, onTargetDrop, onDropPositionChange, canDrop } =
      _nodeEvents || {};
    const ref = useRef<HTMLElement | null>(null);
    const dropLinePosition = useRef<NodeHoveredPosition | null>(null);
    const [draggable, setDraggable] = useState(false);
    const [dragging, setDragging] = useState(false);

    // for drag handle
    useEffect(() => {
      if (!dragHandleRef?.current) {
        setDraggable(true);
      } else {
        setDraggable(false);
      }
    }, [dragHandleRef]);

    const onDragStart = useCallback(
      (e: React.DragEvent) => {
        // only drag shallowest
        e.stopPropagation();
        // tree specific
        onToggleDragging && onToggleDragging(true, node);

        // used for the Preview Portal
        setDragging(true);

        // delete drag image
        const blankImg = new Image();
        e.dataTransfer.setDragImage(blankImg, 0, 0);
      },
      [node, onToggleDragging]
    );

    const onDragEnd = useCallback(
      (e: React.DragEvent) => {
        // set as non-draggable again
        if (dragHandleRef?.current) {
          setDraggable(false);
        }

        // tree specific
        onToggleDragging && onToggleDragging(false);

        // used for the Preview Portal
        setDragging(false);
      },
      [onToggleDragging, dragHandleRef]
    );

    const onDragOver = useCallback(
      (e: React.DragEvent) => {
        e.stopPropagation();

        if (!_nodeEvents) {
          return;
        }

        /*if (!canNodeDrop) {
          onDropPositionChange && onDropPositionChange(null, ref);
          return;
        }*/

        // emit hovering position

        // mouse position relating to box position:
        const elRect = e.currentTarget.getBoundingClientRect();

        const calcPropLinePos: DropPosition = (() => {
          const pos = (e.clientY - elRect.y) / elRect.height;

          if (node?.children?.length === 0 || node.expanded === false) {
            return pos >= 0.7 ? "bot" : pos >= 0.3 ? "inside" : "top";
          }

          return pos > 0.5 ? "bot" : "top";
        })();

        // will check if can be dropped here
        const canNodeDrop = canDrop && canDrop(e, node);

        onDropPositionChange &&
          onDropPositionChange(
            calcPropLinePos && { node, position: calcPropLinePos },
            ref,
            canNodeDrop
          );
        dropLinePosition.current = { node, position: calcPropLinePos };

        // update drag preview position
      },
      [node, _nodeEvents, onDropPositionChange, canDrop]
    );

    const onDragEnter = useCallback(
      (e: React.DragEvent) => {
        if (_nodeEvents) e.preventDefault();
      },
      [_nodeEvents]
    );

    const onDrop = useCallback(
      (e: React.DragEvent) => {
        // drop only on shallowest
        e.stopPropagation();

        // tree specific
        onTargetDrop && onTargetDrop(dropLinePosition.current);
        onToggleDragging && onToggleDragging(false);
        onDropPositionChange && onDropPositionChange(null, ref);
      },
      [onTargetDrop, onToggleDragging, onDropPositionChange]
    );

    // set draggable
    useEffect(() => {
      const onMouseDown = () => {
        setDraggable(true);
      };
      const onMouseUp = () => {
        setDraggable(false);
      };

      const dragHandleRefConst = dragHandleRef?.current;

      if (dragHandleRefConst) {
        dragHandleRefConst.addEventListener("mousedown", onMouseDown);
        dragHandleRefConst.addEventListener("mouseup", onMouseUp);
      }

      return () => {
        if (!dragHandleRefConst) return;

        dragHandleRefConst.removeEventListener("mousedown", onMouseDown);
        dragHandleRefConst.removeEventListener("mouseup", onMouseUp);
      };
    }, [dragHandleRef]);

    const Child = useMemo(() => {
      try {
        return React.Children.only(children);
      } catch (e) {
        console.error(
          "[react-tree-dnd] <Draggable> element must have exactly one child element (no more and no less)"
        );
        console.error(e);
      }
    }, [children]);

    // make sure to not overwrite dragevents
    // these always happen AFTER the droppable has done it's work
    // maybe we should add other events for the BEFORE?
    const dragEvents = useMemo(() => {
      if (!React.isValidElement(Child)) return;

      return {
        onDragStart: (e: React.DragEvent) => {
          onDragStart(e);
          Child.props.onDragStart && Child.props.onDragStart(e);
        },
        onDragEnd: (e: React.DragEvent) => {
          onDragEnd(e);
          Child.props.onDragEnd && Child.props.onDragEnd(e);
        },
        onDragOver: (e: React.DragEvent) => {
          onDragOver(e);
          Child.props.onDragOver && Child.props.onDragOver(e);
        },
        onDrop: (e: React.DragEvent) => {
          onDrop(e);
          Child.props.onDrop && Child.props.onDrop(e);
        },
        onDragEnter: (e: React.DragEvent) => {
          onDragEnter(e);
          Child.props.onDragEnter && Child.props.onDragEnter(e);
        },
      };
    }, [onDragStart, onDragEnd, onDragOver, onDrop, onDragEnter, Child]);

    if (React.isValidElement(Child)) {
      if (Child.props.draggable !== undefined) {
        console.error(
          '[react-tree-dnd] "draggable" prop is overwritten by react-tree-dnd, it has no effect when used directly on the child component of a Draggable.'
        );
      }
      return (
        <>
          {React.cloneElement(Child, {
            draggable,
            ref,
            ...dragEvents,
          })}

          {dragPreviewRenderer && (
            <DragPreviewPortal
              renderer={dragPreviewRenderer}
              dragging={dragging}
            />
          )}
        </>
      );
    }
    return null;
  }
);
