"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DPEngine = void 0;
const base_1 = require("./base");
class DPEngine extends base_1.AlgorithmEngine {
    execute(input) {
        switch (input.type) {
            case 'knapsack':
                return this.knapsack(input.weights, input.values, input.capacity);
            default:
                throw new Error('Algorithm not supported');
        }
    }
    knapsack(weights, values, capacity) {
        const snapshots = [];
        const n = weights.length;
        const dp = Array.from({ length: n + 1 }, () => Array(capacity + 1).fill(0));
        snapshots.push({
            dataStructureState: dp.map(row => [...row]),
            highlightedLineIds: [0],
            description: `Starting 0/1 Knapsack with capacity ${capacity}`,
            variables: { capacity, n, weights, values },
        });
        for (let i = 1; i <= n; i++) {
            for (let w = 1; w <= capacity; w++) {
                snapshots.push({
                    dataStructureState: dp.map(row => [...row]),
                    highlightedLineIds: [1, 2],
                    description: `Considering item ${i} (weight: ${weights[i - 1]}, value: ${values[i - 1]}) for capacity ${w}`,
                    variables: { i, w, currentWeight: weights[i - 1], currentValue: values[i - 1] },
                });
                if (weights[i - 1] <= w) {
                    const take = values[i - 1] + dp[i - 1][w - weights[i - 1]];
                    const skip = dp[i - 1][w];
                    dp[i][w] = Math.max(take, skip);
                    snapshots.push({
                        dataStructureState: dp.map(row => [...row]),
                        highlightedLineIds: [3],
                        description: `Comparing take (${take}) vs skip (${skip}). Max is ${dp[i][w]}`,
                        variables: { i, w, take, skip, max: dp[i][w] },
                    });
                }
                else {
                    dp[i][w] = dp[i - 1][w];
                    snapshots.push({
                        dataStructureState: dp.map(row => [...row]),
                        highlightedLineIds: [4],
                        description: `Item ${i} is too heavy. Inheriting value ${dp[i][w]}`,
                        variables: { i, w, tooHeavy: true },
                    });
                }
            }
        }
        snapshots.push({
            dataStructureState: dp.map(row => [...row]),
            highlightedLineIds: [5],
            description: `Knapsack complete! Max value is ${dp[n][capacity]}`,
            variables: { maxValue: dp[n][capacity] },
        });
        return snapshots;
    }
}
exports.DPEngine = DPEngine;
