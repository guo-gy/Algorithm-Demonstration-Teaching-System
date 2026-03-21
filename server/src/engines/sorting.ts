import { AlgorithmSnapshot } from '@shared/types';
import { AlgorithmEngine } from './base';

export class SortingEngine extends AlgorithmEngine {
    execute(input: { type: string; data: number[] }): AlgorithmSnapshot[] {
        switch (input.type) {
            case 'bubbleSort':
                return this.bubbleSort(input.data);
            case 'quickSort':
                return this.quickSort(input.data);
            case 'selectionSort':
                return this.selectionSort(input.data);
            case 'insertionSort':
                return this.insertionSort(input.data);
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
            variables: { i: 0, j: 0, n: n.length, comparing: [], swapping: [] },
        });

        for (let i = 0; i < n.length; i++) {
            for (let j = 0; j < n.length - i - 1; j++) {
                snapshots.push({
                    dataStructureState: [...n],
                    currentNodeId: j,
                    highlightedLineIds: [4],
                    description: 'bubble_sort_comparing',
                    variables: { i, j, val1: n[j], val2: n[j + 1], comparing: [j, j + 1], swapping: [] },
                });

                if (n[j] > n[j + 1]) {
                    [n[j], n[j + 1]] = [n[j + 1], n[j]];
                    snapshots.push({
                        dataStructureState: [...n],
                        currentNodeId: j + 1,
                        highlightedLineIds: [5],
                        description: 'bubble_sort_swapping',
                        variables: { i, j, val1: n[j], val2: n[j + 1], comparing: [], swapping: [j, j + 1] },
                    });
                }
            }
        }

        snapshots.push({
            dataStructureState: [...n],
            highlightedLineIds: [6],
            description: 'bubble_sort_complete',
            variables: { sorted: true, comparing: [], swapping: [] },
        });

        return snapshots;
    }

    private quickSort(arr: number[]): AlgorithmSnapshot[] {
        const snapshots: AlgorithmSnapshot[] = [];
        const n = [...arr];

        const partition = (low: number, high: number) => {
            const pivot = n[high];
            let i = low - 1;

            snapshots.push({
                dataStructureState: [...n],
                highlightedLineIds: [2],
                description: 'quick_sort_partitioning',
                variables: { low, high, pivot, i, comparing: [], swapping: [] },
            });

            for (let j = low; j < high; j++) {
                snapshots.push({
                    dataStructureState: [...n],
                    currentNodeId: j,
                    highlightedLineIds: [3],
                    description: 'quick_sort_comparing',
                    variables: { low, high, pivot, i, j, val1: n[j], val2: pivot, comparing: [j, high], swapping: [] },
                });

                if (n[j] < pivot) {
                    i++;
                    [n[i], n[j]] = [n[j], n[i]];
                    snapshots.push({
                        dataStructureState: [...n],
                        highlightedLineIds: [4],
                        description: 'quick_sort_swapping',
                        variables: { low, high, pivot, i, j, val1: n[i], val2: n[j], comparing: [], swapping: [i, j] },
                    });
                }
            }

            [n[i + 1], n[high]] = [n[high], n[i + 1]];
            snapshots.push({
                dataStructureState: [...n],
                highlightedLineIds: [5],
                description: 'quick_sort_placing_pivot',
                variables: { low, high, pivot, pivotIndex: i + 1, comparing: [], swapping: [i + 1, high] },
            });

            return i + 1;
        };

        const sort = (low: number, high: number) => {
            if (low < high) {
                const pivotIndex = partition(low, high);
                sort(low, pivotIndex - 1);
                sort(pivotIndex + 1, high);
            }
        };

        snapshots.push({
            dataStructureState: [...n],
            highlightedLineIds: [0],
            description: 'quick_sort_start',
            variables: { n: n.length, low: 0, high: n.length - 1, comparing: [], swapping: [] },
        });

        sort(0, n.length - 1);

        snapshots.push({
            dataStructureState: [...n],
            highlightedLineIds: [6],
            description: 'quick_sort_complete',
            variables: { sorted: true, comparing: [], swapping: [] },
        });

        return snapshots;
    }

    private selectionSort(arr: number[]): AlgorithmSnapshot[] {
        const snapshots: AlgorithmSnapshot[] = [];
        const n = [...arr];

        snapshots.push({
            dataStructureState: [...n],
            highlightedLineIds: [0],
            description: 'selection_sort_start',
            variables: { i: 0, minIndex: 0, comparing: [], swapping: [] },
        });

        for (let i = 0; i < n.length - 1; i++) {
            let minIndex = i;
            snapshots.push({
                dataStructureState: [...n],
                currentNodeId: i,
                highlightedLineIds: [2],
                description: 'selection_sort_selecting_min',
                variables: { i, minIndex, comparing: [], swapping: [] },
            });

            for (let j = i + 1; j < n.length; j++) {
                snapshots.push({
                    dataStructureState: [...n],
                    currentNodeId: j,
                    highlightedLineIds: [3],
                    description: 'selection_sort_comparing',
                    variables: { i, j, minIndex, val1: n[j], val2: n[minIndex], comparing: [j, minIndex], swapping: [] },
                });

                if (n[j] < n[minIndex]) {
                    minIndex = j;
                    snapshots.push({
                        dataStructureState: [...n],
                        currentNodeId: minIndex,
                        highlightedLineIds: [4],
                        description: 'selection_sort_new_min',
                        variables: { i, j, minIndex, newMin: n[minIndex], comparing: [j, minIndex], swapping: [] },
                    });
                }
            }

            if (minIndex !== i) {
                [n[i], n[minIndex]] = [n[minIndex], n[i]];
            }

            snapshots.push({
                dataStructureState: [...n],
                highlightedLineIds: [5],
                description: 'selection_sort_swapping',
                variables: { i, minIndex, comparing: [], swapping: [i, minIndex] },
            });
        }

        snapshots.push({
            dataStructureState: [...n],
            highlightedLineIds: [6],
            description: 'selection_sort_complete',
            variables: { sorted: true, comparing: [], swapping: [] },
        });

        return snapshots;
    }

    private insertionSort(arr: number[]): AlgorithmSnapshot[] {
        const snapshots: AlgorithmSnapshot[] = [];
        const n = [...arr];

        snapshots.push({
            dataStructureState: [...n],
            highlightedLineIds: [0],
            description: 'insertion_sort_start',
            variables: { i: 1, key: n[1], comparing: [], swapping: [] },
        });

        for (let i = 1; i < n.length; i++) {
            const key = n[i];
            let j = i - 1;

            snapshots.push({
                dataStructureState: [...n],
                currentNodeId: i,
                highlightedLineIds: [2],
                description: 'insertion_sort_select_key',
                variables: { i, j, key, comparing: [i], swapping: [] },
            });

            while (j >= 0 && n[j] > key) {
                snapshots.push({
                    dataStructureState: [...n],
                    currentNodeId: j,
                    highlightedLineIds: [3],
                    description: 'insertion_sort_comparing',
                    variables: { i, j, key, val1: n[j], val2: key, comparing: [j, j + 1], swapping: [] },
                });

                n[j + 1] = n[j];
                snapshots.push({
                    dataStructureState: [...n],
                    highlightedLineIds: [4],
                    description: 'insertion_sort_shifting',
                    variables: { i, j, key, shifted: n[j + 1], comparing: [], swapping: [j, j + 1] },
                });
                j--;
            }

            n[j + 1] = key;
            snapshots.push({
                dataStructureState: [...n],
                highlightedLineIds: [5],
                description: 'insertion_sort_inserting',
                variables: { i, j, key, insertIndex: j + 1, comparing: [], swapping: [j + 1] },
            });
        }

        snapshots.push({
            dataStructureState: [...n],
            highlightedLineIds: [6],
            description: 'insertion_sort_complete',
            variables: { sorted: true, comparing: [], swapping: [] },
        });

        return snapshots;
    }
}
