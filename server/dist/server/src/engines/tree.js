"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TreeEngine = void 0;
const base_1 = require("./base");
class TreeEngine extends base_1.AlgorithmEngine {
    execute(input) {
        switch (input.type) {
            case 'bstInsert':
                return this.bstInsert(input.nodes, input.value);
            default:
                throw new Error('Algorithm not supported');
        }
    }
    bstInsert(nodes, value) {
        const snapshots = [];
        const tree = this.buildTree(nodes);
        const snapshot = (nodeId, desc, line, vars = {}) => {
            snapshots.push({
                dataStructureState: this.flattenTree(tree),
                currentNodeId: nodeId || undefined,
                highlightedLineIds: [line],
                description: desc,
                variables: { value, ...vars },
            });
        };
        snapshot(null, `Starting BST insertion for value ${value}`, 0);
        if (!tree.root) {
            tree.root = { id: `node-${value}`, value, left: null, right: null };
            snapshot(tree.root.id, `Tree is empty, inserting ${value} as root`, 1);
        }
        else {
            let curr = tree.root;
            while (curr) {
                snapshot(curr.id, `Comparing ${value} with current node ${curr.value}`, 2);
                if (value < curr.value) {
                    if (!curr.left) {
                        curr.left = { id: `node-${value}`, value, left: null, right: null };
                        snapshot(curr.left.id, `${value} < ${curr.value}, inserting as left child`, 3);
                        break;
                    }
                    curr = curr.left;
                }
                else {
                    if (!curr.right) {
                        curr.right = { id: `node-${value}`, value, left: null, right: null };
                        snapshot(curr.right.id, `${value} >= ${curr.value}, inserting as right child`, 4);
                        break;
                    }
                    curr = curr.right;
                }
            }
        }
        snapshot(null, 'BST insertion complete!', 5);
        return snapshots;
    }
    buildTree(nodes) {
        // Simple helper to build tree from flat nodes if needed, 
        // but for insertion we often start with an existing one.
        // For now assume nodes is the current tree structure or empty.
        return { root: nodes[0] || null }; // Mock
    }
    flattenTree(tree) {
        // Helper to flatten tree for D3 rendering
        return tree.root;
    }
}
exports.TreeEngine = TreeEngine;
