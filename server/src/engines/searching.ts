import { AlgorithmSnapshot } from '@shared/types';
import { AlgorithmEngine } from './base';

export class SearchingEngine extends AlgorithmEngine {
    execute(input: { type: string; data: number[]; target: number }): AlgorithmSnapshot[] {
        switch (input.type) {
            case 'binarySearch':
                return this.binarySearch(input.data, input.target);
            default:
                throw new Error('Algorithm not supported');
        }
    }

    private binarySearch(arr: number[], target: number): AlgorithmSnapshot[] {
        const snapshots: AlgorithmSnapshot[] = [];
        let left = 0;
        let right = arr.length - 1;

        // Initial state
        snapshots.push({
            dataStructureState: [...arr],
            highlightedLineIds: [0],
            description: 'binary_search_start',
            variables: { left, right, target },
        });

        while (left <= right) {
            const mid = Math.floor((left + right) / 2);

            snapshots.push({
                dataStructureState: [...arr],
                currentNodeId: mid,
                highlightedLineIds: [1, 2],
                description: 'binary_search_calculating_mid',
                variables: { left, right, mid, target, val: arr[mid] },
            });

            if (arr[mid] === target) {
                snapshots.push({
                    dataStructureState: [...arr],
                    currentNodeId: mid,
                    highlightedLineIds: [3],
                    description: 'binary_search_found',
                    variables: { left, right, mid, target, found: true },
                });
                return snapshots;
            }

            if (arr[mid] < target) {
                left = mid + 1;
                snapshots.push({
                    dataStructureState: [...arr],
                    highlightedLineIds: [4],
                    description: 'binary_search_moving_left',
                    variables: { left, right, mid, target, val: arr[mid] },
                });
            } else {
                right = mid - 1;
                snapshots.push({
                    dataStructureState: [...arr],
                    highlightedLineIds: [5],
                    description: 'binary_search_moving_right',
                    variables: { left, right, mid, target, val: arr[mid] },
                });
            }
        }

        snapshots.push({
            dataStructureState: [...arr],
            highlightedLineIds: [6],
            description: 'binary_search_not_found',
            variables: { target, found: false },
        });

        return snapshots;
    }
}
