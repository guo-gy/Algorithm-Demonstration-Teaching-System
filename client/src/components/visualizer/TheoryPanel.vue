<script setup lang="ts">
import { useAlgorithmStore } from '../../stores/algorithm';
import { BookOpen, Info, Clock, Box } from 'lucide-vue-next';
import { useI18n } from '../../i18n';

const algoStore = useAlgorithmStore();
const { t } = useI18n();
</script>

<template>
  <div class="space-y-6">
    <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <h3 class="font-bold text-slate-800 flex items-center mb-4">
        <Info class="w-5 h-5 mr-2 text-primary-500" />
        {{ t('theory.overview') }}
      </h3>
      <div class="text-slate-600 space-y-4 text-sm leading-relaxed">
        <p v-if="algoStore.currentAlgorithm">{{ t(`algorithms.${algoStore.currentAlgorithm.description}`) }}</p>
        <p>{{ t('theory.logic_desc') }}</p>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div class="flex items-center text-slate-400 mb-2">
          <Clock class="w-4 h-4 mr-1" />
          <span class="text-[10px] font-bold uppercase tracking-wider">{{ t('theory.complexity_time') }}</span>
        </div>
        <p class="text-xl font-bold text-slate-800">{{ algoStore.currentAlgorithm?.complexity.time }}</p>
        <p class="text-[10px] text-slate-500 mt-1">{{ t('theory.complexity_time_desc') }}</p>
      </div>
      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div class="flex items-center text-slate-400 mb-2">
          <Box class="w-4 h-4 mr-1" />
          <span class="text-[10px] font-bold uppercase tracking-wider">{{ t('theory.complexity_space') }}</span>
        </div>
        <p class="text-xl font-bold text-slate-800">{{ algoStore.currentAlgorithm?.complexity.space }}</p>
        <p class="text-[10px] text-slate-500 mt-1">{{ t('theory.complexity_space_desc') }}</p>
      </div>
    </div>

    <div class="bg-primary-900 p-6 rounded-xl text-white shadow-xl overflow-hidden relative">
      <BookOpen class="absolute -bottom-4 -right-4 w-24 h-24 opacity-10" />
      <h4 class="font-bold mb-2">{{ t('theory.learning_goals') }}</h4>
      <p class="text-primary-100 text-sm">{{ t('theory.learning_goals_desc') }}</p>
    </div>

  </div>
</template>

