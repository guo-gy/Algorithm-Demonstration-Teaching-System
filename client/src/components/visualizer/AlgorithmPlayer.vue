<script setup lang="ts">
import { useAlgorithmStore } from '../../stores/algorithm';
import { Play, Pause, SkipBack, SkipForward, RefreshCw } from 'lucide-vue-next';
import { useI18n } from '../../i18n';

const algoStore = useAlgorithmStore();
const { t } = useI18n();
</script>

<template>
  <div class="bg-white p-4 border-t border-slate-200 shadow-sm flex items-center justify-between">
    <div class="flex items-center space-x-2">
      <button 
        @click="algoStore.reset"
        class="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        :title="t('visualizer.reset')"
      >
        <RefreshCw class="w-5 h-5" />
      </button>
      <button 
        @click="algoStore.prevStep"
        class="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        :title="t('visualizer.step_backward')"
      >
        <SkipBack class="w-5 h-5" />
      </button>
      
      <button 
        v-if="!algoStore.isPlaying"
        @click="algoStore.startPlayback"
        class="p-3 bg-primary-600 text-white hover:bg-primary-700 rounded-full shadow-md transition-all transform hover:scale-105"
        :title="t('visualizer.play')"
      >
        <Play class="w-6 h-6 fill-current" />
      </button>
      <button 
        v-else
        @click="algoStore.stopPlayback"
        class="p-3 bg-primary-600 text-white hover:bg-primary-700 rounded-full shadow-md transition-all transform hover:scale-105"
        :title="t('visualizer.pause')"
      >
        <Pause class="w-6 h-6 fill-current" />
      </button>

      <button 
        @click="algoStore.nextStep"
        class="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        :title="t('visualizer.step_forward')"
      >
        <SkipForward class="w-5 h-5" />
      </button>
    </div>

    <div class="flex items-center space-x-6">
      <div class="flex flex-col items-center">
        <label class="text-xs text-slate-500 mb-1 font-medium">{{ t('visualizer.speed') }}</label>
        <input 
          type="range" 
          min="50" 
          max="1000" 
          step="50"
          :value="1050 - algoStore.playbackSpeed"
          @input="(e: any) => algoStore.setSpeed(1050 - parseInt(e.target.value))"
          class="w-32 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
        />
      </div>
      
      <div class="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded">
        {{ t('visualizer.step_count') }}: {{ algoStore.currentStepIndex + 1 }} / {{ algoStore.snapshots.length }}
      </div>

    </div>
  </div>
</template>


<style scoped>
@reference "../../style.css";

input[type='range']::-webkit-slider-thumb {

  @apply w-4 h-4 rounded-full bg-primary-600 cursor-pointer border-2 border-white;
}
</style>

