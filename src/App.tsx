import React, { useCallback, useRef, useState } from "react";
import { Draggable } from "./lib/components/Draggable";
import { applyTreeChange } from "./lib/components/helpers";
import { Droppable } from "./lib/components/Droppable";
import { DraggableProps, TreeNode } from "./lib/components/types";

const stressTest = Array.from(Array(1000).keys()).map((k) => {
  if (!(k % 10)) {
    return {
      id: "" + (k + Math.random() * 9999),
      title: "Node for: " + k,
      expanded: true,
      children: Array.from(Array(5).keys()).map((i) => {
        if (!(k % 3)) {
          return {
            id: k + "c" + (i + Math.random() * 9999),
            title: "Child node " + i + " for: " + k,
            expanded: true,
            children: [
              {
                id: k + "gc" + (i + Math.random() * 9999),
                title: "Grandchild " + i + " node for: " + k,
              },
            ],
          };
        }
        return {
          id: k + "c" + (i + Math.random() * 9999),
          title: "Child node " + i + " for: " + k,
        };
      }),
    };
  }
  return { id: "" + (k + Math.random() * 9999), title: "Node for: " + k };
});

function App() {
  const [nodes, setNodes] = useState<TreeNode[]>(stressTest);
  const onChange = useCallback((change) => {
    setNodes((old) => applyTreeChange(change, old));
  }, []);

  return (
    <div className="App">
      <Droppable
        onChange={onChange}
        dropLineRenderer={({ injectedStyles }) => (
          <div
            style={{ height: 1, backgroundColor: "blue", ...injectedStyles }}
          />
        )}
        dragPreviewRenderer={() => (
          <div
            style={{
              width: 100,
              height: 100,
              background: "white",
              border: "1px solid black",
            }}
          >
            preview
          </div>
        )}
        directoryDropClass="directory-drop-class"
      >
        {({ injectTree, injectDraggable }: any) => (
          <ul {...injectTree}>
            {nodes.map((node) => (
              <DraggableStyled key={node.id} node={node} {...injectDraggable} />
            ))}
          </ul>
        )}
      </Droppable>
    </div>
  );
}

const DraggableStyled: React.FC<DraggableProps> = React.memo(
  ({ node, ...injectDraggable }) => {
    const dragHandleRef = useRef(null);
    return (
      <Draggable node={node} {...injectDraggable} dragHandleRef={dragHandleRef}>
        <li>
          <div>
            <span ref={dragHandleRef}>[drag handle]</span>
            {node.title}
          </div>
          {Array.isArray(node.children) && node.expanded
            ? node.children.map((child) => (
                <ul key={child.id}>
                  <DraggableStyled node={child} {...injectDraggable} />
                </ul>
              ))
            : null}
        </li>
      </Draggable>
    );
  }
);

export default App;
