import React from "react";
export interface TreeNode {
    id: string;
    title: string;
    data?: any;
    expanded?: boolean;
    children?: TreeNode[];
}
export interface NodeHoveredPosition {
    node: TreeNode;
    position: DropPosition;
}
export declare type DropPosition = "top" | "bot" | "inside";
export interface DraggableRendererProps {
    draggable: boolean;
    onDragStart: (e: React.DragEvent) => void;
    onDragEnd: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDragEnter: (e: React.DragEvent) => void;
    ref: React.ForwardedRef<any>;
}
export declare type DropLineInjectedStyles = {
    top: number;
    left: number;
    position: "absolute";
    width: number;
    display: "block" | "none";
    pointerEvents: "none";
};
export declare type DropLineRendererInjectedProps = {
    injectedStyles: DropLineInjectedStyles;
};
export declare type DropLineRenderer = React.FC<DropLineRendererInjectedProps>;
export interface DropLineRendererPortalProps {
    renderer: DropLineRenderer;
    injectedStyles: DropLineInjectedStyles;
}
export declare type DropLineRendererPortal = React.FC<DropLineRendererPortalProps>;
export declare type DragPreviewRendererProps = {};
export declare type DragPreviewRenderer = React.FC<DragPreviewRendererProps>;
export declare type DragPreviewPortalProps = {
    dragging: boolean;
    renderer: DragPreviewRenderer;
};
export declare type DragPreviewPortalComponent = React.FC<DragPreviewPortalProps>;
export declare type TreeChange = {
    type: "add";
    data: {
        node: TreeNode | TreeNode[];
        position: NodeHoveredPosition;
    };
} | {
    type: "remove";
    data: {
        nodeId: string | string[];
    };
} | {
    type: "move";
    data: {
        node: TreeNode | TreeNode[];
        position: NodeHoveredPosition;
    };
} | {
    type: "edit";
    data: {
        nodeId: string | string[];
        data: Partial<TreeNode>;
    };
};
export declare type TreeOnBeforeDrop = (dragging: TreeNode | null, target: NodeHoveredPosition) => TreeNode | TreeNode[] | null;
export declare type TreeOnChange = (change: TreeChange | TreeChange[]) => void;
export interface DroppableRendererProps {
    onDragLeave: (e: React.DragEvent) => void;
    style: {
        position: "relative";
    };
    ref: React.ForwardedRef<any>;
    children: (React.ReactNode | Element)[];
}
export declare type OnNodeHovered = (node: TreeNode) => void;
export declare type OnToggleDragging = (dragging: boolean, node?: TreeNode) => void;
export declare type OnTargetDrop = (target: NodeHoveredPosition | null) => void;
export declare type WillDrop = (e: React.DragEvent, node: TreeNode) => boolean;
export declare type OnDropPositionChange = (position: NodeHoveredPosition | null, ref?: React.RefObject<any>) => void;
export interface NodeEvents {
    onToggleDragging: OnToggleDragging;
    onTargetDrop: OnTargetDrop;
    willDrop: WillDrop;
    onDropPositionChange: OnDropPositionChange;
}
export interface DraggableProps {
    node: TreeNode;
    dragPreviewRenderer?: DragPreviewRenderer;
    _nodeEvents?: NodeEvents;
    dragHandleRef?: React.RefObject<any>;
    children: React.ReactNode;
}
export declare type InjectDroppable = {
    ref: React.RefObject<any>;
    onDragLeave: (e: React.DragEvent) => void;
};
export declare type InjectDraggable = {
    _nodeEvents: NodeEvents;
    dragPreviewRenderer: DragPreviewRenderer | undefined;
};
export declare type DroppableChildrenArgs = {
    injectDroppable: InjectDroppable;
    injectDraggable: InjectDraggable;
};
export declare type DroppableChildren = (args: DroppableChildrenArgs) => React.ReactElement<any, any>;
