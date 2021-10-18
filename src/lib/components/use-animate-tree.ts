import { useEffect, useRef } from "react";
import { getParent } from "./helpers";
import { TreeContext, TreeNode } from "./types";

export const useAnimateTree = (state: TreeContext) => {
  const firstRenderWithRefs = useRef<boolean>(true);
  const nodeRects = useRef<{ [key: string]: DOMRect | null }>({});

  // populate node rects for animation
  useEffect(() => {
    Object.keys(state.refs).forEach((nodeId) => {
      if (nodeRects.current[nodeId] !== undefined) return;

      let nodeEl = state.refs[nodeId].current;
      if (!nodeEl) return;

      const rect = nodeEl.getBoundingClientRect();
      nodeRects.current = { ...nodeRects.current, [nodeId]: rect };
      firstRenderWithRefs.current = false;
    });
  }, [state.refs]);

  useEffect(() => {
    if (firstRenderWithRefs.current) return;
    console.log("t");
    const loopChildren = (children: TreeNode[]) => {
      children.forEach((child) => {
        if (child.directory) loopChildren(child.children);

        const nodeEl = state.refs[child.id]?.current;

        if (!nodeEl) {
          nodeRects.current = { ...nodeRects.current, [child.id]: null };
          return;
        }

        const parentNode = getParent(child.id, state.tree.children);
        const parentBox = parentNode
          ? state.refs[parentNode.id].current?.getBoundingClientRect()
          : null;
        const oldParentBox = parentNode
          ? nodeRects.current[parentNode.id]
          : null;

        const parentDelta = {
          left: (oldParentBox?.left || 0) - (parentBox?.left || 0),
          top: (oldParentBox?.top || 0) - (parentBox?.top || 0),
        };

        const newBox = nodeEl.getBoundingClientRect();
        const oldBox = nodeRects.current[child.id];

        const delta = { x: 0, y: 0 };

        if (oldBox) {
          delta.x = oldBox.left - newBox.left - parentDelta.left;
          delta.y = oldBox.top - newBox.top - parentDelta.top;
        } else if (parentBox) {
          delta.x = 0;
          delta.y = parentBox.top - newBox.top;
        }

        requestAnimationFrame(() => {
          nodeEl.style.transform =
            "translate(" + delta.x + "px, " + delta.y + "px)";

          if (!oldBox) {
            nodeEl.style.opacity = "0";
          }

          nodeEl.style.transition = "transform 0s, opacity 0s";
          nodeRects.current = {
            ...nodeRects.current,
            [child.id]: nodeEl.getBoundingClientRect(),
          };

          requestAnimationFrame(() => {
            if (!nodeEl) return;

            nodeEl.style.transform = "translate(0px, 0px)";

            if (!oldBox) {
              nodeEl.style.opacity = "1";
            }

            nodeEl.style.transition = "transform 2s, opacity 4s";
          });
        });
      });
    };

    loopChildren(state.tree.children);

    const updateRects = (children: TreeNode[]) => {
      children.forEach((child) => {
        if (child.directory) updateRects(child.children);
      });
    };

    updateRects(state.tree.children);
  }, [state.refs, state.tree.children]);
};
