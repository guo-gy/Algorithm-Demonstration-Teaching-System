"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchingEngine = void 0;
const base_1 = require("./base");
class SearchingEngine extends base_1.AlgorithmEngine {
    execute(input) {
        switch (input.type) {
            case 'binarySearch':
                return this.binarySearch(input.data, input.target);
            default:
                throw new Error('Algorithm not supported');
        }
    }
    binarySearch(arr, target) {
        const snapshots = [];
        let left = 0;
        let right = arr.length - 1;
        // Initial state
        snapshots.push({
            dataStructureState: [...arr],
            highlightedLineIds: [0],
            description: `Starting Binary Search for ${target}`,
            variables: { left, right, target },
        });
        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            snapshots.push({
                dataStructureState: [...arr],
                currentNodeId: mid,
                highlightedLineIds: [1, 2],
                description: `Calculating mid: ${mid}, value is ${arr[mid]}`,
                variables: { left, right, mid, target, range: [left, right] },
            });
            if (arr[mid] === target) {
                snapshots.push({
                    dataStructureState: [...arr],
                    currentNodeId: mid,
                    highlightedLineIds: [3],
                    description: `Found target ${target} at index ${mid}!`,
                    variables: { left, right, mid, target, found: true },
                });
                return snapshots;
            }
            if (arr[mid] < target) {
                left = mid + 1;
                snapshots.push({
                    dataStructureState: [...arr],
                    highlightedLineIds: [4],
                    description: `${arr[mid]} < ${target}, moving left boundary to ${left}`,
                    variables: { left, right, mid, target },
                });
            }
            else {
                right = mid - 1;
                snapshots.push({
                    dataStructureState: [...arr],
                    highlightedLineIds: [5],
                    description: `${arr[mid]} > ${target}, moving right boundary to ${right}`,
                    variables: { left, right, mid, target },
                });
            }
        }
        snapshots.push({
            dataStructureState: [...arr],
            highlightedLineIds: [6],
            description: `Target ${target} not found in array.`,
            variables: { found: false },
        });
        return snapshots;
    }
}
exports.SearchingEngine = SearchingEngine;
