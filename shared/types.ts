export interface AlgorithmSnapshot {
    dataStructureState: any;
    currentNodeId?: string | number;
    highlightedLineIds: (string | number)[];
    description: string;
    variables: Record<string, any>;
    phase?: string;
}

export interface AlgorithmMetaData {
    id: string;
    name: string;
    category: 'sorting' | 'searching' | 'tree' | 'graph' | 'dp';
    complexity: {
        time: string;
        space: string;
    };
    description: string;
    pseudoCode: string[];
}

export interface UserProgress {
    userId: string;
    algorithmId: string;
    completed: boolean;
    score?: number;
    lastVisit: number;
}
