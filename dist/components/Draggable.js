var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useCallback, useEffect, useMemo, useRef, useState, } from "react";
import { DragPreviewPortal } from "./DragPreviewPortal";
export var Draggable = React.memo(function (_a) {
    var node = _a.node, _nodeEvents = _a._nodeEvents, children = _a.children, dragPreviewRenderer = _a.dragPreviewRenderer, dragHandleRef = _a.dragHandleRef;
    var _b = _nodeEvents || {}, onToggleDragging = _b.onToggleDragging, onTargetDrop = _b.onTargetDrop, onDropPositionChange = _b.onDropPositionChange, willDrop = _b.willDrop;
    var ref = useRef(null);
    var dropLinePosition = useRef(null);
    var _c = useState(false), draggable = _c[0], setDraggable = _c[1];
    var _d = useState(false), dragging = _d[0], setDragging = _d[1];
    // for drag handle
    useEffect(function () {
        if (!(dragHandleRef === null || dragHandleRef === void 0 ? void 0 : dragHandleRef.current)) {
            setDraggable(true);
        }
        else {
            setDraggable(false);
        }
    }, [dragHandleRef]);
    var onDragStart = useCallback(function (e) {
        // only drag shallowest
        e.stopPropagation();
        // tree specific
        onToggleDragging && onToggleDragging(true, node);
        // used for the Preview Portal
        setDragging(true);
        // delete drag image
        var blankImg = new Image();
        e.dataTransfer.setDragImage(blankImg, 0, 0);
    }, [node, onToggleDragging]);
    var onDragEnd = useCallback(function (e) {
        // set as non-draggable again
        if (dragHandleRef === null || dragHandleRef === void 0 ? void 0 : dragHandleRef.current) {
            setDraggable(false);
        }
        // tree specific
        onToggleDragging && onToggleDragging(false);
        // used for the Preview Portal
        setDragging(false);
    }, [onToggleDragging, dragHandleRef]);
    var onDragOver = useCallback(function (e) {
        e.stopPropagation();
        if (!_nodeEvents) {
            return;
        }
        // will check if can be dropped here
        var canNodeDrop = willDrop && willDrop(e, node);
        if (!canNodeDrop) {
            onDropPositionChange && onDropPositionChange(null, ref);
            return;
        }
        // emit hovering position
        // mouse position relating to box position:
        var elRect = e.currentTarget.getBoundingClientRect();
        var calcPropLinePos = (function () {
            var _a;
            var pos = (e.clientY - elRect.y) / elRect.height;
            if (((_a = node.children) === null || _a === void 0 ? void 0 : _a.length) === 0 || node.expanded === false) {
                return pos >= 0.7 ? "bot" : pos >= 0.3 ? "inside" : "top";
            }
            return pos > 0.5 ? "bot" : "top";
        })();
        onDropPositionChange &&
            onDropPositionChange(calcPropLinePos && { node: node, position: calcPropLinePos }, ref);
        dropLinePosition.current = { node: node, position: calcPropLinePos };
        // update drag preview position
    }, [node, _nodeEvents, onDropPositionChange, willDrop]);
    var onDragEnter = useCallback(function (e) {
        if (_nodeEvents)
            e.preventDefault();
    }, [_nodeEvents]);
    var onDrop = useCallback(function (e) {
        // drop only on shallowest
        e.stopPropagation();
        // tree specific
        onTargetDrop && onTargetDrop(dropLinePosition.current);
        onToggleDragging && onToggleDragging(false);
        onDropPositionChange && onDropPositionChange(null, ref);
    }, [onTargetDrop, onToggleDragging, onDropPositionChange]);
    // set draggable
    useEffect(function () {
        var onMouseDown = function () {
            setDraggable(true);
        };
        var onMouseUp = function () {
            setDraggable(false);
        };
        var dragHandleRefConst = dragHandleRef === null || dragHandleRef === void 0 ? void 0 : dragHandleRef.current;
        if (dragHandleRefConst) {
            dragHandleRefConst.addEventListener("mousedown", onMouseDown);
            dragHandleRefConst.addEventListener("mouseup", onMouseUp);
        }
        return function () {
            if (!dragHandleRefConst)
                return;
            dragHandleRefConst.removeEventListener("mousedown", onMouseDown);
            dragHandleRefConst.removeEventListener("mouseup", onMouseUp);
        };
    }, [dragHandleRef]);
    var Child = useMemo(function () { return React.Children.only(children); }, [children]);
    // make sure to not overwrite dragevents
    // these always happen AFTER the droppable has done it's work
    // maybe we should add other events for the BEFORE?
    var dragEvents = useMemo(function () {
        if (!React.isValidElement(Child))
            return;
        return {
            onDragStart: function (e) {
                onDragStart(e);
                Child.props.onDragStart && Child.props.onDragStart(e);
            },
            onDragEnd: function (e) {
                onDragEnd(e);
                Child.props.onDragEnd && Child.props.onDragEnd(e);
            },
            onDragOver: function (e) {
                onDragOver(e);
                Child.props.onDragOver && Child.props.onDragOver(e);
            },
            onDrop: function (e) {
                onDrop(e);
                Child.props.onDrop && Child.props.onDrop(e);
            },
            onDragEnter: function (e) {
                onDragEnter(e);
                Child.props.onDragEnter && Child.props.onDragEnter(e);
            },
        };
    }, [onDragStart, onDragEnd, onDragOver, onDrop, onDragEnter, Child]);
    if (React.isValidElement(Child)) {
        if (Child.props.draggable !== undefined) {
            console.error('[react-tree-dnd] "draggable" prop is overwritten by react-tree-dnd, it has no effect when used directly on the child component of a Draggable.');
        }
        return (_jsxs(_Fragment, { children: [React.cloneElement(Child, __assign({ draggable: draggable, ref: ref }, dragEvents)), dragPreviewRenderer && (_jsx(DragPreviewPortal, { renderer: dragPreviewRenderer, dragging: dragging }, void 0))] }, void 0));
    }
    return null;
});
