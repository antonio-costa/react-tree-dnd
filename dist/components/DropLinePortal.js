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
import React, { useRef } from "react";
import ReactDOM from "react-dom";
// the styles should be calculated here
// but for now let them be in TreeDnD component
export var DropLinePortal = React.memo(function (_a) {
    var Renderer = _a.renderer, injectedStyles = _a.injectedStyles;
    var ref = useRef(null);
    if (!Renderer)
        return null;
    var bodyDom = document.getElementById("root");
    if (!bodyDom) {
        console.error("[React Tree DnD] No Root Element found to create the Portal for the drop line.");
        return null;
    }
    if (injectedStyles.display === "none") {
        return null;
    }
    return ReactDOM.createPortal(_jsx("div", __assign({ ref: ref, style: {
            top: "0px",
            left: "0px",
            position: "absolute",
            pointerEvents: "none",
            userSelect: "none",
        } }, { children: _jsx(Renderer, { injectedStyles: injectedStyles }, void 0) }), void 0), bodyDom);
});
