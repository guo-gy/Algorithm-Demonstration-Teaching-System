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

export interface PracticeChoiceOption {
    id: string;
    text: string;
}

export interface MultipleChoicePracticeQuestion {
    id: string;
    type: 'multiple-choice';
    subtype: 'concept' | 'calculation';
    prompt: string;
    options: PracticeChoiceOption[];
    correctOptionId: string;
    explanation: string;
    points: number;
}

export interface FillBlankPracticeQuestion {
    id: string;
    type: 'fill-blank';
    subtype: 'code';
    prompt: string;
    templateLines: string[];
    blankToken: string;
    acceptableAnswers: string[];
    expectedAnswer: string;
    explanation: string;
    hint?: string;
    points: number;
    language: 'pseudocode';
}

export interface PracticeSet {
    multipleChoice: MultipleChoicePracticeQuestion[];
    fillBlank: FillBlankPracticeQuestion[];
}

export interface FillBlankEvaluation {
    isCorrect: boolean;
    score: number;
    feedback: string;
    expectedAnswer: string;
    source: 'deepseek' | 'fallback';
}
