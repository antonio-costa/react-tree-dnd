import React, { useEffect, useState } from "react";
import { DnDSortableTree, useDndTree } from "./lib/components/DnDSortableTree";
import { addNode } from "./lib/components/helpers";
import { TreeNodeRendererDefault } from "./lib/components/TreeNodeRendererDefault";
import { NodeHovered, TreeNode } from "./lib/components/types";

function App() {
  const { tree, setTree } = useDndTree({
    id: "1",
    children: [
      {
        id: "1",
        title: "You",
        directory: true,
        expanded: true,
        children: [
          { id: "2", title: "Can" },
          { id: "3", title: "Infinitely" },
        ],
      },
      { id: "4", title: "Nest" },
      { id: "5", title: "All" },
      {
        id: "6",
        title: "Of",
        directory: true,
        expanded: true,
        children: [
          { id: "10", title: "These" },
          { id: "11", title: "Items" },
        ],
      },
      { id: "7", title: "If" },
      { id: "8", title: "Wou" },
      { id: "9", title: "Want" },
    ],
  });

  useEffect(() => {
    //console.log(tree);
  }, [tree]);

  const onChange = (treeChildren: TreeNode[]) => {
    setTree((old) => ({ ...old, children: treeChildren }));
  };
  const onClick = (node: TreeNode) => {};
  const onExpandedToggle = (node: TreeNode, expanded: boolean) => {};
  const onDragStateChange = () => {};
  const onDropPositionChange = (target: NodeHovered | null) => {};

  const [itemIsFolder, setItemIsFolder] = useState<boolean>(false);
  const [itemName, setItemName] = useState<string>("");

  const addItem = () => {
    setTree((old) => {
      const newNode: TreeNode = itemIsFolder
        ? {
            id: "" + Math.random() * 999999,
            title: itemName,
            directory: true,
            expanded: true,
            children: [],
          }
        : {
            id: "" + Math.random() * 999999,
            title: itemName,
            directory: false,
          };
      const target: NodeHovered = {
        nodeId: old.children[old.children.length - 1].id,
        position: "bot",
      };
      return { ...old, children: addNode(newNode, target, old.children) };
    });
  };
  return (
    <>
      <input value={itemName} onChange={(e) => setItemName(e.target.value)} />
      folder?{" "}
      <input
        type="checkbox"
        checked={itemIsFolder}
        onChange={(e) => setItemIsFolder(e.target.checked)}
      />
      <button onClick={addItem}>add item</button>
      <DnDSortableTree
        tree={tree}
        onChange={onChange}
        onClick={onClick}
        onExpandedToggle={onExpandedToggle}
        onDragStateChange={onDragStateChange}
        onDropPositionChange={onDropPositionChange}
        renderer={(id) => (
          <TreeNodeRendererDefault
            key={id}
            nodeId={id}
            color="black"
            iconColor="grey"
          />
        )}
      />
    </>
  );
}

export default App;
