<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useAlgorithmStore } from './stores/algorithm';
import Navbar from './components/layout/Navbar.vue';
import DataStructureVisualizer from './components/visualizer/DataStructureVisualizer.vue';
import AlgorithmPlayer from './components/visualizer/AlgorithmPlayer.vue';
import CodeHighlighter from './components/visualizer/CodeHighlighter.vue';
import InteractiveExercise from './components/visualizer/InteractiveExercise.vue';
import TheoryPanel from './components/visualizer/TheoryPanel.vue';
import ProgressCard from './components/visualizer/ProgressCard.vue';
import { Layers, ChevronRight, BarChart2, Search, PlayCircle, Edit3, Settings } from 'lucide-vue-next';
import { useI18n } from './i18n';

const algoStore = useAlgorithmStore();
const { t } = useI18n();
const sidebarOpen = ref(true);
const activeTab = ref<'visualize' | 'practice' | 'theory'>('visualize');


onMounted(async () => {
  await algoStore.fetchAlgorithms();
  if (algoStore.algorithms.length > 0) {
    selectAlgorithm(algoStore.algorithms[0]);
  }
});

const selectAlgorithm = async (algo: any) => {
  algoStore.currentAlgorithm = algo;
  let initialData: any = {};
  
  if (algo.category === 'sorting') {
    initialData = { data: [38, 27, 43, 3, 9, 82, 10] };
  } else if (algo.category === 'searching') {
    initialData = { data: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100], target: 70 };
  } else if (algo.category === 'graph') {
    initialData = {
      nodes: [{ id: 'A' }, { id: 'B' }, { id: 'C' }, { id: 'D' }, { id: 'E' }],
      edges: [
        { source: 'A', target: 'B', weight: 4 },
        { source: 'A', target: 'C', weight: 2 },
        { source: 'B', target: 'C', weight: 5 },
        { source: 'B', target: 'D', weight: 10 },
        { source: 'C', target: 'E', weight: 3 },
        { source: 'E', target: 'D', weight: 4 }
      ],
      startNode: 'A'
    };
  } else if (algo.category === 'tree') {
    initialData = { nodes: [], value: 25 }; 
  } else if (algo.category === 'dp') {
    initialData = { weights: [2, 3, 4, 5], values: [3, 4, 5, 8], capacity: 5 };
  }
  
  await algoStore.runAlgorithm(algo.id, initialData);
};

const getVisualizerType = (category: string) => {
  if (category === 'sorting' || category === 'searching') return 'array';
  if (category === 'graph') return 'graph';
  if (category === 'tree') return 'tree';
  if (category === 'dp') return 'dp';
  return 'array';
};
</script>


<template>
  <div class="min-h-screen flex flex-col bg-slate-50">
    <Navbar />

    <div class="flex-1 flex overflow-hidden">
      <!-- Sidebar -->
      <aside 
        class="bg-white border-r border-slate-200 transition-all duration-300 overflow-y-auto"
        :class="sidebarOpen ? 'w-64' : 'w-0'"
      >
        <div class="p-4">
          <h2 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{{ t('sidebar.algorithm_list') }}</h2>
          <div class="space-y-1">
            <button 
              v-for="algo in algoStore.algorithms" 
              :key="algo.id"
              @click="selectAlgorithm(algo)"
              class="w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors mb-1"
              :class="algoStore.currentAlgorithm?.id === algo.id 
                ? 'bg-primary-50 text-primary-700' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'"
            >
              <div class="flex items-center">
                <BarChart2 v-if="algo.category === 'sorting'" class="w-4 h-4 mr-3" />
                <Search v-else-if="algo.category === 'searching'" class="w-4 h-4 mr-3" />
                <ChevronRight v-else class="w-4 h-4 mr-3 text-slate-400" />
                <div class="text-left">
                  <div class="text-sm font-semibold">{{ t(`algorithms.${algo.name}`) }}</div>
                  <div class="text-[10px] text-slate-400 font-bold uppercase">{{ t(`categories.${algo.category}`) }}</div>
                </div>
              </div>
            </button>

          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 flex flex-col min-w-0 bg-slate-50 relative">
        <div class="flex-1 overflow-y-auto p-6 space-y-6">
          <div class="max-w-6xl mx-auto space-y-6">
            <!-- Header Info -->
            <div v-if="algoStore.currentAlgorithm" class="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div class="flex items-center space-x-2 mb-1">
                  <span class="px-2 py-0.5 bg-primary-100 text-primary-700 text-[10px] font-bold uppercase rounded">{{ t(`categories.${algoStore.currentAlgorithm.category}`) }}</span>
                </div>
                <h1 class="text-3xl font-bold text-slate-900">{{ t(`algorithms.${algoStore.currentAlgorithm.name}`) }}</h1>
              </div>
              <div class="flex space-x-1 p-1 bg-slate-200/50 rounded-xl">
                <button 
                  @click="activeTab = 'visualize'"
                  class="flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  :class="activeTab === 'visualize' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
                >
                  <PlayCircle class="w-4 h-4 mr-2" />
                  {{ t('visualizer.visualize_demo') }}
                </button>
                <button 
                  @click="activeTab = 'practice'"
                  class="flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  :class="activeTab === 'practice' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
                >
                  <Edit3 class="w-4 h-4 mr-2" />
                  {{ t('visualizer.interactive_practice') }}
                </button>
                <button 
                  @click="activeTab = 'theory'"
                  class="flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  :class="activeTab === 'theory' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
                >
                  <Settings class="w-4 h-4 mr-2" />
                  {{ t('visualizer.theory_explanation') }}
                </button>
              </div>
            </div>

            <!-- Dashboard Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <!-- Left Column: Main View (Visualize or Practice) -->
              <div class="lg:col-span-2 space-y-4">
                <template v-if="activeTab === 'visualize'">
                  <DataStructureVisualizer 
                    v-if="algoStore.currentAlgorithm"
                    :type="getVisualizerType(algoStore.currentAlgorithm.category)" 
                  />
                  <AlgorithmPlayer />
                </template>
                <template v-else-if="activeTab === 'practice'">
                  <InteractiveExercise />
                </template>
                <template v-else>
                  <TheoryPanel />
                </template>
              </div>


              <!-- Sidebar Info Panel -->
              <div class="space-y-6">
                <CodeHighlighter />
                
                <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <h3 class="font-bold text-slate-800 mb-2 flex items-center">
                    <Layers class="w-4 h-4 mr-2 text-primary-500" />
                    {{ t('sidebar.variable_state') }}
                  </h3>
                  <div class="grid grid-cols-2 gap-2">
                    <div v-for="(val, key) in algoStore.currentSnapshot?.variables" :key="key" class="p-2 bg-slate-50 rounded border border-slate-100">
                      <p class="text-[10px] text-slate-400 font-bold uppercase">{{ key }}</p>
                      <p class="text-sm font-mono font-bold text-slate-700">{{ val }}</p>
                    </div>
                  </div>
                </div>

                <ProgressCard />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>


<style>
@reference "./style.css";

/* Custom scrollbar for better aesthetics */

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  @apply bg-transparent;
}
::-webkit-scrollbar-thumb {
  @apply bg-slate-300 rounded-full hover:bg-slate-400;
}
</style>

