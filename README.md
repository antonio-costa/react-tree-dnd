# README

**This README is not complete and is a work in progress.**

Simple drag and drop tree with infinite nesting

Highly optimized to handle thousands of entries (no state updates when dragging)

![ReactDnDTree Preview](preview.gif "ReactDnDTree Preview")

### To Do

- Add support for touch events
- Animations when dropping items

# Example

```css
.directory-drop-class {
  border: 1px solid blue;
}
```

```typescript
function App() {
  const [nodes, setNodes] = useState<TreeNode[]>([
    {
      id: "node1",
      title: "Node for node1",
    },
    {
      id: "node2",
      title: "Node with children",
      expanded: true,
      children: [
        {
          id: "node3",
          title: "Child Node",
        },
      ],
    },
  ]);

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
    return (
      <Draggable node={node} {...injectDraggable}>
        <li>
          <div>{node.title}</div>
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
```

# Types

```typescript
export interface TreeNode {
  id: string;
  title: string;
  data?: any;
  expanded?: boolean;
  children?: TreeNode[];
}
```

```typescript
export interface DroppableProps {
  dropLineRenderer: DropLineRenderer;
  dragPreviewRenderer?: DragPreviewRenderer;
  onChange: TreeOnChange;
  onBeforeDrop?: TreeOnBeforeDrop;
  directoryDropClass?: string;
  children: DroppableChildren;
}
```

```typescript
export interface DraggableProps {
  node: TreeNode;
  dragPreviewRenderer?: DragPreviewRenderer;
  dragHandleRef?: React.RefObject<any>;
  children: React.ReactNode;
}
```
