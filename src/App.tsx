import React, { memo, useRef } from "react";
import { TreeDnD, useTreeDnD } from "./lib/components/TreeDnD";
import { TreeNodeDraggable } from "./lib/components/TreeNodeDraggable";
import {
  DropLineRendererInjectedProps,
  TreeNode,
} from "./lib/components/types";

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

function App() {
  const { tree, setTree } = useTreeDnD({
    id: "1",
    children: stressTest,
  });

  const { tree: tree2, setTree: setTree2 } = useTreeDnD({
    id: "2",
    children: [
      {
        id: "123",
        title: "You",
        directory: true,
        expanded: false,
        children: [
          { id: "2", title: "Can" },
          { id: "3", title: "Infinitely" },
        ],
      },
      { id: "4", title: "Nest" },
      { id: "5", title: "All" },
    ],
  });
  const onChange2 = (treeChildren: TreeNode[]) => {
    setTree2((old) => ({ ...old, children: treeChildren }));
  };
  const onChange = (treeChildren: TreeNode[]) => {
    setTree((old) => ({ ...old, children: treeChildren }));
  };
  return (
    <div style={{ width: 200 }}>
      <TreeDnD
        tree={tree}
        onChange={onChange}
        renderer={Node}
        dropLineRenderer={DropLine}
        directoryHoveredClass={"directory-hovered"}
      />
      ----
      <TreeDnD
        tree={tree2}
        onChange={onChange2}
        renderer={Node}
        dropLineRenderer={DropLine}
      />
    </div>
  );
}

const Node: React.FC<TreeNode> = React.memo((node) => {
  const expandRef = useRef<HTMLDivElement>(null);
  console.log("re-render");
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
              <Node key={childNode.id} {...childNode} />
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
