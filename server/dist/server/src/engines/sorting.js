"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SortingEngine = void 0;
const base_1 = require("./base");
class SortingEngine extends base_1.AlgorithmEngine {
    execute(input) {
        switch (input.type) {
            case 'bubbleSort':
                return this.bubbleSort(input.data);
            case 'quickSort':
                return this.quickSort(input.data);
            default:
                throw new Error('Algorithm not supported');
        }
    }
    bubbleSort(arr) {
        // ... (existing implementation)
        const snapshots = [];
        const n = [...arr];
        snapshots.push({
            dataStructureState: [...n],
            highlightedLineIds: [0],
            description: 'Starting Bubble Sort',
            variables: { i: 0, j: 0, n: n.length },
        });
        for (let i = 0; i < n.length; i++) {
            for (let j = 0; j < n.length - i - 1; j++) {
                snapshots.push({
                    dataStructureState: [...n],
                    currentNodeId: j,
                    highlightedLineIds: [2],
                    description: `Comparing ${n[j]} and ${n[j + 1]}`,
                    variables: { i, j, comparing: [j, j + 1] },
                });
                if (n[j] > n[j + 1]) {
                    [n[j], n[j + 1]] = [n[j + 1], n[j]];
                    snapshots.push({
                        dataStructureState: [...n],
                        currentNodeId: j + 1,
                        highlightedLineIds: [3],
                        description: `Swapping ${n[j + 1]} and ${n[j]}`,
                        variables: { i, j, swapping: [j, j + 1] },
                    });
                }
            }
        }
        snapshots.push({ dataStructureState: [...n], highlightedLineIds: [5], description: 'Bubble Sort complete!', variables: { sorted: true } });
        return snapshots;
    }
    quickSort(arr) {
        const snapshots = [];
        const n = [...arr];
        const partition = (low, high) => {
            const pivot = n[high];
            snapshots.push({
                dataStructureState: [...n],
                highlightedLineIds: [2],
                description: `Partitioning with pivot ${pivot} at index ${high}`,
                variables: { low, high, pivot, i: low - 1 },
            });
            let i = low - 1;
            for (let j = low; j < high; j++) {
                snapshots.push({
                    dataStructureState: [...n],
                    currentNodeId: j,
                    highlightedLineIds: [3],
                    description: `Comparing element ${n[j]} with pivot ${pivot}`,
                    variables: { low, high, pivot, i, j, comparing: [j, high] },
                });
                if (n[j] < pivot) {
                    i++;
                    [n[i], n[j]] = [n[j], n[i]];
                    snapshots.push({
                        dataStructureState: [...n],
                        highlightedLineIds: [4],
                        description: `Swapping ${n[i]} and ${n[j]} as ${n[j]} is smaller than pivot`,
                        variables: { low, high, pivot, i, j, swapping: [i, j] },
                    });
                }
            }
            [n[i + 1], n[high]] = [n[high], n[i + 1]];
            snapshots.push({
                dataStructureState: [...n],
                highlightedLineIds: [5],
                description: `Placing pivot ${pivot} at its correct position ${i + 1}`,
                variables: { low, high, pivot, pivotIndex: i + 1, swapping: [i + 1, high] },
            });
            return i + 1;
        };
        const sort = (low, high) => {
            if (low < high) {
                const pi = partition(low, high);
                sort(low, pi - 1);
                sort(pi + 1, high);
            }
        };
        snapshots.push({ dataStructureState: [...n], highlightedLineIds: [0], description: 'Starting Quick Sort', variables: { n: n.length } });
        sort(0, n.length - 1);
        snapshots.push({ dataStructureState: [...n], highlightedLineIds: [6], description: 'Quick Sort complete!', variables: { sorted: true } });
        return snapshots;
    }
}
exports.SortingEngine = SortingEngine;
