import { AlgorithmSnapshot } from '@shared/types';
import { AlgorithmEngine } from './base';

export class SortingEngine extends AlgorithmEngine {
    execute(input: { type: string; data: number[] }): AlgorithmSnapshot[] {
        switch (input.type) {
            case 'bubbleSort':
                return this.bubbleSort(input.data);
            case 'quickSort':
                return this.quickSort(input.data);
            default:
                throw new Error('Algorithm not supported');
        }
    }

    private bubbleSort(arr: number[]): AlgorithmSnapshot[] {
        const snapshots: AlgorithmSnapshot[] = [];
        const n = [...arr];

        snapshots.push({
            dataStructureState: [...n],
            highlightedLineIds: [0],
            description: 'bubble_sort_start',
            variables: { i: 0, j: 0, n: n.length },
        });

        for (let i = 0; i < n.length; i++) {
            for (let j = 0; j < n.length - i - 1; j++) {
                snapshots.push({
                    dataStructureState: [...n],
                    currentNodeId: j,
                    highlightedLineIds: [2],
                    description: 'bubble_sort_comparing',
                    variables: { i, j, val1: n[j], val2: n[j + 1] },
                });

                if (n[j] > n[j + 1]) {
                    [n[j], n[j + 1]] = [n[j + 1], n[j]];
                    snapshots.push({
                        dataStructureState: [...n],
                        currentNodeId: j + 1,
                        highlightedLineIds: [3],
                        description: 'bubble_sort_swapping',
                        variables: { i, j, val1: n[j], val2: n[j + 1] },
                    });
                }
            }
        }
        snapshots.push({ dataStructureState: [...n], highlightedLineIds: [5], description: 'bubble_sort_complete', variables: { sorted: true } });
        return snapshots;
    }

    private quickSort(arr: number[]): AlgorithmSnapshot[] {
        const snapshots: AlgorithmSnapshot[] = [];
        const n = [...arr];

        const partition = (low: number, high: number) => {
            const pivot = n[high];
            snapshots.push({
                dataStructureState: [...n],
                highlightedLineIds: [2],
                description: 'quick_sort_partitioning',
                variables: { low, high, pivot, i: low - 1 },
            });

            let i = low - 1;
            for (let j = low; j < high; j++) {
                snapshots.push({
                    dataStructureState: [...n],
                    currentNodeId: j,
                    highlightedLineIds: [3],
                    description: 'quick_sort_comparing',
                    variables: { low, high, pivot, i, j, val1: n[j], val2: pivot },
                });

                if (n[j] < pivot) {
                    i++;
                    [n[i], n[j]] = [n[j], n[i]];
                    snapshots.push({
                        dataStructureState: [...n],
                        highlightedLineIds: [4],
                        description: 'quick_sort_swapping',
                        variables: { low, high, pivot, i, j, val1: n[i], val2: n[j] },
                    });
                }
            }
            [n[i + 1], n[high]] = [n[high], n[i + 1]];
            snapshots.push({
                dataStructureState: [...n],
                highlightedLineIds: [5],
                description: 'quick_sort_placing_pivot',
                variables: { low, high, pivot, pivotIndex: i + 1, swapping: [i + 1, high] },
            });
            return i + 1;
        };

        const sort = (low: number, high: number) => {
            if (low < high) {
                const pi = partition(low, high);
                sort(low, pi - 1);
                sort(pi + 1, high);
            }
        };

        snapshots.push({ dataStructureState: [...n], highlightedLineIds: [0], description: 'quick_sort_start', variables: { n: n.length } });
        sort(0, n.length - 1);
        snapshots.push({ dataStructureState: [...n], highlightedLineIds: [6], description: 'quick_sort_complete', variables: { sorted: true } });
        return snapshots;
    }
}
