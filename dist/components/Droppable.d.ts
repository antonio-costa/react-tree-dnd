import React from "react";
import { DragPreviewRenderer, DropLineRenderer, DroppableChildren, TreeOnBeforeDrop, TreeOnChange } from "./types";
export interface DroppableProps {
    dropLineRenderer: DropLineRenderer;
    dragPreviewRenderer?: DragPreviewRenderer;
    onChange: TreeOnChange;
    /**
     * This event is called before any drop (and to decide if dropline should be displayed)
     * @dragging TreeNode | null - The node that's being dragged. If it's null,
     * then the node being dragged is an external node
     * @target NodeHoveredPosition - Where the node will be dropped
     * @return TreeNode | TreeNode[] | null - The return value
     * will be the value of the onChange() change. If it is null
     * then onChange() will NOT be triggered
     *  */
    onBeforeDrop?: TreeOnBeforeDrop;
    /**
     * when a empty/non-expanded directory is being hovered
     * this className is appended to the element which is being hovered
     */
    directoryDropClass?: string;
    /**
     * children must be a function which accepts to arguments
     * be careful to not overwrite these props!!
     * (you can customize them, but do not fully overwrite them)
     * @injectDroppable - props to inject in the root element of the tree/droppable
     * @injectDraggable - props to inject into every draggable node
     */
    children: DroppableChildren;
}
export declare const Droppable: React.VFC<DroppableProps>;
