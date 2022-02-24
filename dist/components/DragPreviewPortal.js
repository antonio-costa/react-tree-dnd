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
import { jsx as _jsx } from "react/jsx-runtime";
import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
export var DragPreviewPortal = React.memo(function (_a) {
    var dragging = _a.dragging, Renderer = _a.renderer;
    var ref = useRef(null);
    var _b = useState(false), dragged = _b[0], setDragged = _b[1];
    useEffect(function () {
        var onDrag = function (e) {
            setDragged(true);
            if (e.pageX !== 0 && e.pageY !== 0 && ref.current) {
                ref.current.style.transform =
                    "translate(" + e.pageX + "px, " + e.pageY + "px)";
            }
        };
        if (dragging) {
            document.addEventListener("drag", onDrag);
        }
        return function () {
            if (dragging) {
                document.removeEventListener("drag", onDrag);
                setDragged(false);
            }
        };
    }, [dragging]);
    if (!Renderer || !dragging)
        return null;
    var bodyDom = document.getElementById("root");
    if (!bodyDom) {
        console.error("[React Tree DnD] No Root Element found to create the Portal for the drag preview.");
        return null;
    }
    return dragged
        ? ReactDOM.createPortal(_jsx("div", __assign({ ref: ref, style: {
                top: "0px",
                left: "0px",
                position: "absolute",
                pointerEvents: "none",
                userSelect: "none",
                zIndex: 99999,
            } }, { children: _jsx(Renderer, {}, void 0) }), void 0), bodyDom)
        : null;
});
