import React, { useRef } from "react";
import ReactDOM from "react-dom";
import { DropLineRendererPortal } from "./types";

// the styles should be calculated here
// but for now let them be in TreeDnD component

export const DropLinePortal: DropLineRendererPortal = React.memo(
  ({ renderer: Renderer, injectedStyles }) => {
    const ref = useRef<HTMLDivElement | null>(null);

    if (!Renderer) return null;

    const bodyDom = document.getElementById("root");

    if (!bodyDom) {
      console.error(
        "[React Tree DnD] No Root Element found to create the Portal for the drop line."
      );
      return null;
    }

    if (injectedStyles.display === "none") {
      return null;
    }

    return ReactDOM.createPortal(
      <div
        ref={ref}
        style={{
          top: "0px",
          left: "0px",
          position: "absolute",
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        <Renderer injectedStyles={injectedStyles} />
      </div>,
      bodyDom
    );
  }
);
