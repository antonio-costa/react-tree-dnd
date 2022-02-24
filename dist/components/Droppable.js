import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useMemo, useRef, useState } from "react";
import { DropLinePortal } from "./DropLinePortal";
import { nodeIsParent } from "./helpers";
var noDropLineStyles = {
    top: 0,
    left: 0,
    position: "absolute",
    width: 0,
    display: "none",
    pointerEvents: "none",
};
export var Droppable = function (_a) {
    var children = _a.children, DropLineRenderer = _a.dropLineRenderer, onBeforeDrop = _a.onBeforeDrop, onChange = _a.onChange, directoryDropClass = _a.directoryDropClass, dragPreviewRenderer = _a.dragPreviewRenderer;
    var parentRef = useRef(null);
    var dropLinePosition = useRef(null);
    var _b = useState(noDropLineStyles), dropLineStyles = _b[0], setDropLineStyles = _b[1];
    var _c = useState(null), draggingNode = _c[0], setDraggingNode = _c[1];
    var onToggleDragging = useCallback(function (dragging, node) {
        if (dragging && node)
            setDraggingNode({ node: node });
        else
            setDraggingNode(null);
    }, []);
    var onTargetDrop = useCallback(function (target) {
        // if it's dragging a node internally
        if (target && draggingNode) {
            var dropping = (onBeforeDrop && onBeforeDrop(draggingNode.node, target)) ||
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
        }
        else if (target && onBeforeDrop) {
            // if external handler provides a node
            var dropping = onBeforeDrop(null, target);
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
    }, [draggingNode, onChange, onBeforeDrop]);
    var onDropPositionChange = useCallback(function (position, ref) {
        var _a, _b, _c, _d, _e;
        if (position === null) {
            setDropLineStyles(noDropLineStyles);
            directoryDropClass &&
                ((_a = ref === null || ref === void 0 ? void 0 : ref.current) === null || _a === void 0 ? void 0 : _a.classList.remove(directoryDropClass));
            dropLinePosition.current = position;
            return;
        }
        // check if drop position has changed since last time
        if ((position === null && dropLinePosition.current === null) ||
            ((position === null || position === void 0 ? void 0 : position.node) === ((_b = dropLinePosition.current) === null || _b === void 0 ? void 0 : _b.node) &&
                (position === null || position === void 0 ? void 0 : position.position) === ((_c = dropLinePosition.current) === null || _c === void 0 ? void 0 : _c.position))) {
            dropLinePosition.current = position;
            return;
        }
        // check if can drop here
        if ((draggingNode === null || draggingNode === void 0 ? void 0 : draggingNode.node.id) === "0" && position.node.id === "c0") {
            setDropLineStyles(noDropLineStyles);
            directoryDropClass &&
                ((_d = ref === null || ref === void 0 ? void 0 : ref.current) === null || _d === void 0 ? void 0 : _d.classList.remove(directoryDropClass));
            dropLinePosition.current = position;
            return;
        }
        // inject styles on dropline
        if (ref === null || ref === void 0 ? void 0 : ref.current) {
            if (position.position === "inside") {
                if (directoryDropClass) {
                    ref.current.classList.add(directoryDropClass);
                }
                setDropLineStyles(noDropLineStyles);
            }
            else {
                if (directoryDropClass) {
                    ref.current.classList.remove(directoryDropClass);
                }
                var rect = (_e = ref.current) === null || _e === void 0 ? void 0 : _e.getBoundingClientRect();
                var scrollTop = document.documentElement.scrollTop || window.scrollY;
                var scrollLeft = document.documentElement.scrollLeft || window.scrollX;
                if (rect) {
                    setDropLineStyles({
                        position: "absolute",
                        display: "block",
                        left: rect.left + scrollLeft,
                        top: rect.top +
                            (position.position === "bot" ? rect.height : 0) +
                            scrollTop,
                        width: rect.width,
                        pointerEvents: "none",
                    });
                }
            }
        }
        dropLinePosition.current = position;
    }, [dropLinePosition, draggingNode, directoryDropClass]);
    var onDragLeave = useCallback(function (e) {
        var _a;
        var relatedTarget = e.relatedTarget;
        if ((relatedTarget === null || relatedTarget === void 0 ? void 0 : relatedTarget.contains(parentRef.current)) ||
            !((_a = parentRef === null || parentRef === void 0 ? void 0 : parentRef.current) === null || _a === void 0 ? void 0 : _a.contains(relatedTarget))) {
            onDropPositionChange(null);
        }
    }, [onDropPositionChange]);
    var willDrop = useCallback(function (e, node) {
        // if not dragging through this tree
        // (it's an external node)
        if (!draggingNode) {
            // no handler for external drops, so they are not allowed
            if (!onBeforeDrop) {
                return false;
            }
            // dropping in a specific position
            if (dropLinePosition.current) {
                var allowDrop = onBeforeDrop(null, dropLinePosition.current);
                // if the external handler returns a node
                if (allowDrop) {
                    // by default accept everything
                    e.preventDefault();
                    return true;
                }
                else {
                    return false;
                }
            }
        }
        // if dragging inside the tree
        else {
            // cannot drop on itself or on a child
            if (draggingNode.node.id === node.id ||
                nodeIsParent(draggingNode.node, node.id)) {
                return false;
            }
        }
        // by default accept everything
        e.preventDefault();
        return true;
    }, [draggingNode, onBeforeDrop]);
    // child must be a function which provides the injectable props
    // for both the tree wrapper and the tree nodes
    var _nodeEvents = useMemo(function () { return ({
        onToggleDragging: onToggleDragging,
        onTargetDrop: onTargetDrop,
        onDropPositionChange: onDropPositionChange,
        willDrop: willDrop,
    }); }, [onToggleDragging, onTargetDrop, onDropPositionChange, willDrop]);
    var childrenMemoed = useMemo(function () {
        return children({
            injectDroppable: {
                ref: parentRef,
                onDragLeave: onDragLeave,
            },
            injectDraggable: {
                _nodeEvents: _nodeEvents,
                dragPreviewRenderer: dragPreviewRenderer,
            },
        });
    }, [parentRef, onDragLeave, _nodeEvents, dragPreviewRenderer, children]);
    return (_jsxs(_Fragment, { children: [childrenMemoed, _jsx(DropLinePortal, { renderer: DropLineRenderer, injectedStyles: dropLineStyles }, void 0)] }, void 0));
};
