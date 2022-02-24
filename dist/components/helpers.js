var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
export var getNode = function (nodeId, tree) {
    return tree.reduce(function (prev, curr) {
        if (prev)
            return prev;
        if (curr.id === nodeId)
            return curr;
        if (curr.children)
            return getNode(nodeId, curr.children);
        return null;
    }, null);
};
export var getParent = function (nodeId, tree, parent) {
    if (parent === void 0) { parent = null; }
    return tree.reduce(function (prev, curr) {
        if (prev)
            return prev;
        if (curr.id === nodeId)
            return parent;
        if (curr.children)
            return getParent(nodeId, curr.children, curr);
        return null;
    }, null);
};
export var nodeIsParent = function (node, childId) {
    if (!Array.isArray(node.children))
        return false;
    return !!getNode(childId, node.children);
};
export var removeNode = function (nodeId, tree) {
    var done = false;
    return tree.reduce(function (prev, curr) {
        if (done)
            return __spreadArray(__spreadArray([], prev, true), [curr], false);
        if (curr.id === nodeId) {
            done = true;
            return __spreadArray([], prev, true);
        }
        if (Array.isArray(curr.children)) {
            return __spreadArray(__spreadArray([], prev, true), [
                __assign(__assign({}, curr), { children: removeNode(nodeId, curr.children) }),
            ], false);
        }
        return __spreadArray(__spreadArray([], prev, true), [curr], false);
    }, []);
};
export var addNode = function (node, target, tree) {
    var done = false;
    return tree.reduce(function (prev, curr) {
        if (done)
            return __spreadArray(__spreadArray([], prev, true), [curr], false);
        if (curr.id === target.node.id) {
            done = true;
            switch (target.position) {
                case "top":
                    return __spreadArray(__spreadArray([], prev, true), [node, curr], false);
                case "bot":
                    return __spreadArray(__spreadArray([], prev, true), [curr, node], false);
                case "inside": {
                    if (!Array.isArray(curr.children))
                        return __spreadArray(__spreadArray([], prev, true), [curr], false);
                    return __spreadArray(__spreadArray([], prev, true), [__assign(__assign({}, curr), { children: __spreadArray([node], curr.children, true) })], false);
                }
            }
        }
        if (Array.isArray(curr.children)) {
            return __spreadArray(__spreadArray([], prev, true), [
                __assign(__assign({}, curr), { children: addNode(node, target, curr.children) }),
            ], false);
        }
        return __spreadArray(__spreadArray([], prev, true), [curr], false);
    }, []);
};
export var moveNode = function (node, change, tree) {
    return addNode(node, change, removeNode(node.id, tree));
};
export var editNode = function (nodeId, data, tree) {
    var done = false;
    return tree.reduce(function (prev, curr) {
        if (done)
            return __spreadArray(__spreadArray([], prev, true), [curr], false);
        if (curr.id === nodeId) {
            done = true;
            var editedNode = __assign(__assign({}, curr), data);
            return __spreadArray(__spreadArray([], prev, true), [editedNode], false);
        }
        if (Array.isArray(curr.children))
            return __spreadArray(__spreadArray([], prev, true), [
                __assign(__assign({}, curr), { children: editNode(nodeId, data, curr.children) }),
            ], false);
        return __spreadArray(__spreadArray([], prev, true), [curr], false);
    }, []);
};
export var applyTreeChange = function (change, tree) {
    switch (change.type) {
        case "add": {
            var _a = change.data, node = _a.node, position_1 = _a.position;
            // accept multiple nodes
            if (Array.isArray(node)) {
                return node
                    .reverse()
                    .reduce(function (prev, curr) { return addNode(curr, position_1, prev); }, tree);
            }
            return addNode(node, position_1, tree);
        }
        case "move": {
            var _b = change.data, node = _b.node, position_2 = _b.position;
            // accept multiple nodes
            if (Array.isArray(node)) {
                return node
                    .reverse()
                    .reduce(function (prev, curr) { return moveNode(curr, position_2, prev); }, tree);
            }
            return moveNode(node, position_2, tree);
        }
        case "edit": {
            var _c = change.data, nodeId = _c.nodeId, data_1 = _c.data;
            // accept multiple nodes
            if (Array.isArray(nodeId)) {
                return nodeId.reduce(function (prev, curr) { return editNode(curr, data_1, prev); }, tree);
            }
            return editNode(nodeId, data_1, tree);
        }
        case "remove": {
            var nodeId = change.data.nodeId;
            // accept multiple nodes
            if (Array.isArray(nodeId)) {
                return nodeId.reduce(function (prev, curr) { return removeNode(curr, prev); }, tree);
            }
            return removeNode(nodeId, tree);
        }
    }
};
