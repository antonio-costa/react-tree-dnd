import React, { useCallback, useRef } from "react";
import {
  TreeDnD,
  useTreeDnD,
  TreeNodeDraggable,
  DropLineRendererInjectedProps,
  TreeNode,
  NodeRenderer,
  TreeChange,
} from "./lib/";

import "./styles.css";

import { ReactComponent as IconFolder } from "./lib/components/svg/folder.svg";
import { ReactComponent as IconFolderOpen } from "./lib/components/svg/folder-open.svg";
import { ReactComponent as IconFile } from "./lib/components/svg/file.svg";

const stressTest: TreeNode[] = Array.from(Array(100).keys()).map((id) =>
  id % 2
    ? {
        id: "" + id,
        title: "Title for " + id,
        directory: false,
      }
    : {
        id: "" + id,
        title: "Title for " + id,
        directory: true,
        expanded: true,
        children: [],
      }
);

const stressTest1: TreeNode[] = Array.from(Array(10).keys()).map((id) =>
  id % 2
    ? {
        id: "" + id,
        title: "Title for " + id,
        directory: false,
      }
    : {
        id: "" + id,
        title: "Title for " + id,
        directory: true,
        expanded: true,
        children: [],
      }
);

function App() {
  const { tree, applyChange } = useTreeDnD({
    id: "1",
    children: stressTest1,
  });

  const { tree: tree2, applyChange: applyChange2 } = useTreeDnD({
    id: "2",
    children: stressTest,
  });

  const onChange = useCallback(
    (change: TreeChange) => {
      applyChange(change);
    },
    [applyChange]
  );

  const onChange2 = useCallback(
    (change: TreeChange) => {
      applyChange2(change);
    },
    [applyChange2]
  );

  return (
    <div style={{ width: 200 }}>
      <TreeDnD
        tree={tree}
        onChange={onChange}
        renderer={Node}
        dropLineRenderer={DropLine}
        directoryHoveredClass={"directory-hovered"}
      />
      <div>---</div>
      <TreeDnD
        tree={tree2}
        onChange={onChange2}
        renderer={Node}
        dropLineRenderer={DropLine}
        directoryHoveredClass={"directory-hovered2"}
      />
    </div>
  );
}

const Node: NodeRenderer = React.memo(({ node, ...rest }) => {
  const expandRef = useRef<HTMLDivElement>(null);
  const icon_size = 12;

  const NodeIcon = !node.directory
    ? IconFile
    : node.expanded
    ? IconFolderOpen
    : IconFolder;

  return (
    <TreeNodeDraggable
      node={node}
      expandRef={node.directory ? expandRef : undefined}
      {...rest}
    >
      <div
        style={{
          fontSize: 12,
          fontFamily: "arial",
          padding: 2,
        }}
        ref={expandRef}
      >
        <div>
          <span style={{ paddingRight: 4 }}>
            <NodeIcon width={icon_size} height={icon_size} />
          </span>
          {node.title}
        </div>
        {node.directory && node.expanded ? (
          <div style={{ marginLeft: 10 }}>
            {node.children.map((childNode) => (
              <Node key={childNode.id} node={childNode} {...rest} />
            ))}
          </div>
        ) : null}
      </div>
    </TreeNodeDraggable>
  );
});
const DropLine: React.FC<DropLineRendererInjectedProps> = (props) => {
  return (
    <div
      style={{
        height: 2,
        background: "orange",
        ...props.injectedStyles,
      }}
    ></div>
  );
};

export default App;
