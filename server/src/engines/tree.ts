import { AlgorithmSnapshot } from '@shared/types';
import { AlgorithmEngine } from './base';

export class TreeEngine extends AlgorithmEngine {
    execute(input: { type: string; nodes: any[]; value: number }): AlgorithmSnapshot[] {
        switch (input.type) {
            case 'bstInsert':
                return this.bstInsert(input.nodes, input.value);
            default:
                throw new Error('Algorithm not supported');
        }
    }

    private bstInsert(nodes: any[], value: number): AlgorithmSnapshot[] {
        const snapshots: AlgorithmSnapshot[] = [];
        const tree = this.buildTree(nodes);

        const snapshot = (nodeId: string | number | null, desc: string, line: number, vars: any = {}) => {
            snapshots.push({
                dataStructureState: this.flattenTree(tree),
                currentNodeId: nodeId || undefined,
                highlightedLineIds: [line],
                description: desc,
                variables: { value, ...vars },
            });
        };

        snapshot(null, 'bst_insert_start', 0);

        if (!tree.root) {
            tree.root = { id: `node-${value}`, value, left: null, right: null };
            snapshot(tree.root.id, 'bst_insert_empty_tree', 1);
        } else {
            let curr = tree.root;
            while (curr) {
                snapshot(curr.id, 'bst_insert_comparing', 2, { currVal: curr.value });
                if (value < curr.value) {
                    if (!curr.left) {
                        curr.left = { id: `node-${value}`, value, left: null, right: null };
                        snapshot(curr.left.id, 'bst_insert_left_child', 3, { currVal: curr.value });
                        break;
                    }
                    curr = curr.left;
                } else {
                    if (!curr.right) {
                        curr.right = { id: `node-${value}`, value, left: null, right: null };
                        snapshot(curr.right.id, 'bst_insert_right_child', 4, { currVal: curr.value });
                        break;
                    }
                    curr = curr.right;
                }
            }
        }

        snapshot(null, 'bst_insert_complete', 5);
        return snapshots;
    }

    private buildTree(nodes: any[]) {
        return { root: nodes[0] || null }; // Mock
    }

    private flattenTree(tree: any) {
        return tree.root;
    }
}
