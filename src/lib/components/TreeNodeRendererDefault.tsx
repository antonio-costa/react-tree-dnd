import React, { memo, useMemo, useRef } from "react";
import { useDndTreeState } from "./DnDSortableTree";
import { getNode } from "./helpers";
import { TreeNodeDraggable } from "./TreeNodeDraggable";
import { TreeNodeRendererDefaultProps } from "./types";

import "./css/DefaultTreeNode.css";

import { ReactComponent as Folder } from "./svg/folder.svg";
import { ReactComponent as FolderOpen } from "./svg/folder-open.svg";
import { ReactComponent as File } from "./svg/file.svg";

export const TreeNodeRendererDefault: React.VFC<TreeNodeRendererDefaultProps> =
  memo(({ nodeId, color = "black", iconColor = "grey" }) => {
    const nodeRef = useRef<HTMLDivElement | null>(null);
    const [state] = useDndTreeState();

    const node = useMemo(
      () => getNode(nodeId, state.tree.children),
      [state.tree.children, nodeId]
    );

    const onClick = (e: React.MouseEvent) => {
      // emit event if exists
      if (state.events.onClick) {
        state.events.onClick(node);
      }
    };

    const isHoveredTop =
      state.hovered?.nodeId === nodeId && state.hovered?.position === "top";
    const isHoveredBot =
      state.hovered?.nodeId === nodeId && state.hovered?.position === "bot";
    const isHoveredInside =
      state.hovered?.nodeId === nodeId && state.hovered?.position === "inside";

    return (
      <TreeNodeDraggable
        nodeId={nodeId}
        className={
          "node-wrapper" +
          (isHoveredTop ? " hovered-t" : "") +
          (isHoveredBot ? " hovered-b" : "")
        }
        style={{
          color,
          opacity: isHoveredInside ? "0.5" : "1",
        }}
        handleRef={nodeRef}
        expandRef={nodeRef}
      >
        <div style={{ display: "flex" }} onClick={onClick}>
          <div
            ref={nodeRef}
            style={{ flexGrow: 1, display: "flex", flexDirection: "row" }}
          >
            <div style={{ marginRight: 4 }}>
              {node?.directory ? (
                node?.expanded ? (
                  <FolderOpen width={11} height={11} fill={iconColor} />
                ) : (
                  <Folder width={11} height={11} fill={iconColor} />
                )
              ) : (
                <File width={11} height={11} fill={iconColor} />
              )}
            </div>
            <div>{node?.title}</div>
          </div>
        </div>
        {node?.directory && node?.expanded ? (
          <div className="children-wrapper">
            {node?.children.map((childNode) => (
              <TreeNodeRendererDefault
                key={childNode.id}
                nodeId={childNode.id}
              />
            ))}
          </div>
        ) : null}
      </TreeNodeDraggable>
    );
  });
