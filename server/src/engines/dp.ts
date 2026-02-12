import { AlgorithmSnapshot } from '@shared/types';
import { AlgorithmEngine } from './base';

export class DPEngine extends AlgorithmEngine {
    execute(input: { type: string; weights: number[]; values: number[]; capacity: number }): AlgorithmSnapshot[] {
        switch (input.type) {
            case 'knapsack':
                return this.knapsack(input.weights, input.values, input.capacity);
            default:
                throw new Error('Algorithm not supported');
        }
    }

    private knapsack(weights: number[], values: number[], capacity: number): AlgorithmSnapshot[] {
        const snapshots: AlgorithmSnapshot[] = [];
        const n = weights.length;
        const dp: number[][] = Array.from({ length: n + 1 }, () => Array(capacity + 1).fill(0));

        snapshots.push({
            dataStructureState: dp.map(row => [...row]),
            highlightedLineIds: [0],
            description: 'knapsack_start',
            variables: { capacity, n, weights, values },
        });

        for (let i = 1; i <= n; i++) {
            for (let w = 1; w <= capacity; w++) {
                snapshots.push({
                    dataStructureState: dp.map(row => [...row]),
                    highlightedLineIds: [1, 2],
                    description: 'knapsack_considering_item',
                    variables: { i, w, weight: weights[i - 1], val: values[i - 1] },
                });

                if (weights[i - 1] <= w) {
                    const take = values[i - 1] + dp[i - 1][w - weights[i - 1]];
                    const skip = dp[i - 1][w];
                    dp[i][w] = Math.max(take, skip);

                    snapshots.push({
                        dataStructureState: dp.map(row => [...row]),
                        highlightedLineIds: [3],
                        description: 'knapsack_comparing_take_skip',
                        variables: { i, w, take, skip, max: dp[i][w] },
                    });
                } else {
                    dp[i][w] = dp[i - 1][w];
                    snapshots.push({
                        dataStructureState: dp.map(row => [...row]),
                        highlightedLineIds: [4],
                        description: 'knapsack_too_heavy',
                        variables: { i, w, weight: weights[i - 1], val: dp[i][w] },
                    });
                }
            }
        }

        snapshots.push({
            dataStructureState: dp.map(row => [...row]),
            highlightedLineIds: [5],
            description: 'knapsack_complete',
            variables: { maxValue: dp[n][capacity] },
        });

        return snapshots;
    }
}
