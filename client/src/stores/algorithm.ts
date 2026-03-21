import { defineStore } from 'pinia';
import axios from 'axios';
import type { AlgorithmSnapshot, AlgorithmMetaData, FillBlankEvaluation } from '../../../shared/types';

const API_BASE_URL = 'http://localhost:3000/api';

export const useAlgorithmStore = defineStore('algorithm', {
    state: () => ({
        algorithms: [] as AlgorithmMetaData[],
        currentAlgorithm: null as AlgorithmMetaData | null,
        snapshots: [] as AlgorithmSnapshot[],
        currentStepIndex: -1,
        isPlaying: false,
        playbackSpeed: 500, // ms
        playbackTimer: null as any,
    }),
    getters: {
        currentSnapshot: (state) => state.snapshots[state.currentStepIndex] || null,
        progress: (state) => {
            if (state.snapshots.length === 0) return 0;
            return ((state.currentStepIndex + 1) / state.snapshots.length) * 100;
        }
    },
    actions: {
        async fetchAlgorithms() {
            const response = await axios.get(`${API_BASE_URL}/algorithms`);
            this.algorithms = response.data;
        },
        async runAlgorithm(id: string, data: any) {
            const response = await axios.post(`${API_BASE_URL}/algorithms/${id}/execute`, data);
            this.snapshots = response.data;
            this.currentStepIndex = 0;
            this.stopPlayback();
        },
        async gradeFillBlank(questionId: string, answer: string): Promise<FillBlankEvaluation> {
            if (!this.currentAlgorithm) {
                throw new Error('No algorithm selected');
            }

            const response = await axios.post(`${API_BASE_URL}/algorithms/${this.currentAlgorithm.id}/practice/fill-blank/grade`, {
                questionId,
                answer,
            });

            return response.data as FillBlankEvaluation;
        },
        nextStep() {
            if (this.currentStepIndex < this.snapshots.length - 1) {
                this.currentStepIndex++;
            } else {
                this.stopPlayback();
            }
        },
        prevStep() {
            if (this.currentStepIndex > 0) {
                this.currentStepIndex--;
            }
        },
        startPlayback() {
            if (this.isPlaying) return;
            this.isPlaying = true;
            this.playbackTimer = setInterval(() => {
                this.nextStep();
            }, this.playbackSpeed);
        },
        stopPlayback() {
            this.isPlaying = false;
            if (this.playbackTimer) {
                clearInterval(this.playbackTimer);
                this.playbackTimer = null;
            }
        },
        setSpeed(speed: number) {
            this.playbackSpeed = speed;
            if (this.isPlaying) {
                this.stopPlayback();
                this.startPlayback();
            }
        },
        reset() {
            this.currentStepIndex = 0;
            this.stopPlayback();
        }
    }
});
