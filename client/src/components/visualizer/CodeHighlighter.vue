<script setup lang="ts">
import { useAlgorithmStore } from '../../stores/algorithm';
import { useI18n } from '../../i18n';

const algoStore = useAlgorithmStore();
const { t } = useI18n();
</script>

<template>
  <div class="bg-slate-900 rounded-xl border border-slate-800 shadow-xl overflow-hidden font-mono text-sm leading-relaxed">
    <div class="px-4 py-2 border-b border-slate-800 bg-slate-800/50 flex justify-between items-center">
      <span class="text-slate-400 font-medium">{{ t('visualizer.pseudo_code') }}</span>
      <span class="text-xs text-slate-500 uppercase tracking-wider">{{ algoStore.currentAlgorithm ? t(`categories.${algoStore.currentAlgorithm.category}`) : '' }}</span>
    </div>

    <div v-if="algoStore.currentSnapshot?.description" class="px-4 py-3 bg-primary-900/10 border-b border-slate-800">
      <p class="text-primary-400 text-xs italic">
        {{ t(`steps.${algoStore.currentSnapshot.description}`, algoStore.currentSnapshot.variables) }}
      </p>
    </div>

    <div class="p-4 space-y-1">
      <div 
        v-for="(line, index) in algoStore.currentAlgorithm?.pseudoCode" 
        :key="index"
        class="group flex space-x-4 px-2 py-0.5 rounded transition-all duration-200"
        :class="{
          'bg-primary-500/20 text-primary-400 border-l-2 border-primary-500 -ml-0.5': algoStore.currentSnapshot?.highlightedLineIds.includes(index),
          'text-slate-400': !algoStore.currentSnapshot?.highlightedLineIds.includes(index)
        }"
      >
        <span class="w-6 text-slate-600 text-right select-none group-hover:text-slate-500">{{ index + 1 }}</span>
        <pre class="whitespace-pre-wrap">{{ line }}</pre>
      </div>
    </div>
  </div>
</template>

