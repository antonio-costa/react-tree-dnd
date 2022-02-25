import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { DragPreviewPortalComponent } from "./types";

export const DragPreviewPortal: DragPreviewPortalComponent = React.memo(
  ({ dragging, renderer }) => {
    const ref = useRef<HTMLDivElement | null>(null);
    const [dragged, setDragged] = useState<boolean>(false);

    useEffect(() => {
      const onDrag = (e: MouseEvent) => {
        setDragged(true);
        if (e.pageX !== 0 && e.pageY !== 0 && ref.current) {
          ref.current.style.transform =
            "translate(" + e.pageX + "px, " + e.pageY + "px)";
        }
      };

      if (dragging) {
        document.addEventListener("drag", onDrag);
      }

      return () => {
        document.removeEventListener("drag", onDrag);
        if (dragging) {
          setDragged(false);
        }
      };
    }, [dragging]);

    if (!renderer || !dragging) return null;

    const bodyDom = document.getElementById("root");
    if (!bodyDom) {
      console.error(
        "[React Tree DnD] No Root Element found to create the Portal for the drag preview."
      );
      return null;
    }

    return dragged
      ? ReactDOM.createPortal(
          <div
            ref={ref}
            style={{
              top: "0px",
              left: "0px",
              position: "absolute",
              pointerEvents: "none",
              userSelect: "none",
              zIndex: 99999,
            }}
          >
            {renderer}
          </div>,
          bodyDom
        )
      : null;
  }
);
