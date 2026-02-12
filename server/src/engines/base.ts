import { AlgorithmSnapshot } from '@shared/types';

export abstract class AlgorithmEngine {
    abstract execute(input: any): AlgorithmSnapshot[];
}
