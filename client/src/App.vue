<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { AlgorithmMetaData } from '@shared/types';
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
const customInputError = ref('');

interface CustomInputForm {
  arrayData: string;
  target: string;
  graphNodes: string;
  graphEdges: string;
  startNode: string;
  treeRoot: string;
  treeInsert: string;
  dpWeights: string;
  dpValues: string;
  dpCapacity: string;
}

const buildDefaultInputForm = (category: AlgorithmMetaData['category']): CustomInputForm => {
  const baseForm: CustomInputForm = {
    arrayData: '38,27,43,3,9,82,10',
    target: '70',
    graphNodes: 'A,B,C,D,E',
    graphEdges: 'A,B,4\nA,C,2\nB,C,5\nB,D,10\nC,E,3\nE,D,4',
    startNode: 'A',
    treeRoot: '40',
    treeInsert: '25',
    dpWeights: '2,3,4,5',
    dpValues: '3,4,5,8',
    dpCapacity: '5',
  };

  if (category === 'searching') {
    return {
      ...baseForm,
      arrayData: '10,20,30,40,50,60,70,80,90,100',
      target: '70',
    };
  }

  if (category === 'sorting') {
    return {
      ...baseForm,
      arrayData: '38,27,43,3,9,82,10',
    };
  }

  return baseForm;
};

const customInputForm = ref<CustomInputForm>(buildDefaultInputForm('sorting'));

interface ParseNumberOptions {
  integer?: boolean;
  min?: number;
}

const parseNumberList = (raw: string, fieldName: string, options: ParseNumberOptions = {}): number[] => {
  const tokens = raw
    .split(/[\s,]+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 0);

  if (tokens.length === 0) {
    throw new Error(`${fieldName}不能为空`);
  }

  return tokens.map((token, index) => {
    const value = Number(token);

    if (!Number.isFinite(value)) {
      throw new Error(`${fieldName}的第 ${index + 1} 项不是有效数字`);
    }

    if (options.integer && !Number.isInteger(value)) {
      throw new Error(`${fieldName}的第 ${index + 1} 项必须是整数`);
    }

    if (options.min !== undefined && value < options.min) {
      throw new Error(`${fieldName}的第 ${index + 1} 项不能小于 ${options.min}`);
    }

    return value;
  });
};

const parseGraphInput = () => {
  const nodeIds = customInputForm.value.graphNodes
    .split(/[\s,]+/)
    .map((id) => id.trim())
    .filter((id) => id.length > 0);

  if (nodeIds.length === 0) {
    throw new Error('图节点不能为空');
  }

  const uniqueNodeIds = Array.from(new Set(nodeIds));
  const nodeIdSet = new Set(uniqueNodeIds);
  const edgeLines = customInputForm.value.graphEdges
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (edgeLines.length === 0) {
    throw new Error('图边不能为空');
  }

  const edges = edgeLines.map((line, index) => {
    const parts = line.split(',').map((part) => part.trim()).filter((part) => part.length > 0);
    if (parts.length < 2 || parts.length > 3) {
      throw new Error(`第 ${index + 1} 条边格式错误，请使用“起点,终点,权重”`);
    }

    const source = parts[0];
    const target = parts[1];
    const weightText = parts[2];

    if (!source || !target) {
      throw new Error(`第 ${index + 1} 条边缺少起点或终点`);
    }

    if (!nodeIdSet.has(source) || !nodeIdSet.has(target)) {
      throw new Error(`第 ${index + 1} 条边包含未声明节点`);
    }

    let weight = 1;
    if (weightText !== undefined) {
      const parsedWeight = Number(weightText);
      if (!Number.isFinite(parsedWeight)) {
        throw new Error(`第 ${index + 1} 条边的权重不是有效数字`);
      }
      weight = parsedWeight;
    }

    return { source, target, weight };
  });

  const startNode = customInputForm.value.startNode.trim();
  if (!startNode) {
    throw new Error('图起点不能为空');
  }
  if (!nodeIdSet.has(startNode)) {
    throw new Error('图起点必须在节点列表中');
  }

  return {
    nodes: uniqueNodeIds.map((id) => ({ id })),
    edges,
    startNode,
  };
};

const buildExecutionInput = (category: AlgorithmMetaData['category']) => {
  if (category === 'sorting') {
    const data = parseNumberList(customInputForm.value.arrayData, '数组');
    return { data };
  }

  if (category === 'searching') {
    const data = parseNumberList(customInputForm.value.arrayData, '数组');
    for (let i = 1; i < data.length; i++) {
      const current = data[i];
      const previous = data[i - 1];

      if (current === undefined || previous === undefined) {
        continue;
      }

      if (current < previous) {
        throw new Error('二分查找要求数组为升序');
      }
    }

    const [target] = parseNumberList(customInputForm.value.target, '目标值');
    return { data, target };
  }

  if (category === 'graph') {
    return parseGraphInput();
  }

  if (category === 'tree') {
    const [insertValue] = parseNumberList(customInputForm.value.treeInsert, '插入值', { integer: true });
    const rootText = customInputForm.value.treeRoot.trim();
    const rootValues = rootText ? parseNumberList(rootText, '初始根节点值', { integer: true }) : [];

    if (rootValues.length > 1) {
      throw new Error('初始根节点值只能填写一个整数');
    }

    const rootValue = rootValues[0];
    const nodes = rootValue === undefined
      ? []
      : [{ id: `node-${rootValue}`, value: rootValue, left: null, right: null }];

    return { nodes, value: insertValue };
  }

  if (category === 'dp') {
    const weights = parseNumberList(customInputForm.value.dpWeights, '物品重量', { integer: true, min: 0 });
    const values = parseNumberList(customInputForm.value.dpValues, '物品价值', { integer: true, min: 0 });
    const [capacity] = parseNumberList(customInputForm.value.dpCapacity, '背包容量', { integer: true, min: 0 });

    if (weights.length !== values.length) {
      throw new Error('物品重量和物品价值的数量必须一致');
    }

    return { weights, values, capacity };
  }

  return {};
};

const runWithCustomInput = async () => {
  if (!algoStore.currentAlgorithm) return;

  customInputError.value = '';

  try {
    const payload = buildExecutionInput(algoStore.currentAlgorithm.category);
    await algoStore.runAlgorithm(algoStore.currentAlgorithm.id, payload);
  } catch (error) {
    if (error instanceof Error) {
      customInputError.value = error.message;
      return;
    }
    customInputError.value = '输入格式错误，请检查后重试';
  }
};

const applyDefaultInput = async () => {
  if (!algoStore.currentAlgorithm) return;

  customInputForm.value = buildDefaultInputForm(algoStore.currentAlgorithm.category);
  customInputError.value = '';
  await runWithCustomInput();
};


onMounted(async () => {
  await algoStore.fetchAlgorithms();
  const firstAlgorithm = algoStore.algorithms[0];
  if (firstAlgorithm) {
    selectAlgorithm(firstAlgorithm);
  }
});

const selectAlgorithm = async (algo: AlgorithmMetaData) => {
  algoStore.currentAlgorithm = algo;

  customInputForm.value = buildDefaultInputForm(algo.category);
  customInputError.value = '';
  await runWithCustomInput();
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
                  <div
                    v-if="algoStore.currentAlgorithm"
                    class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4"
                  >
                    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <h3 class="text-sm font-bold text-slate-800">自定义演示数据</h3>
                      <p class="text-xs text-slate-500">修改输入后点击“运行数据”即可重新生成步骤</p>
                    </div>

                    <template v-if="algoStore.currentAlgorithm.category === 'sorting'">
                      <div>
                        <label class="block text-xs font-semibold text-slate-500 mb-2">数组（逗号或空格分隔）</label>
                        <textarea
                          v-model="customInputForm.arrayData"
                          rows="2"
                          class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400"
                          placeholder="例如：38,27,43,3,9,82,10"
                        />
                      </div>
                    </template>

                    <template v-else-if="algoStore.currentAlgorithm.category === 'searching'">
                      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div class="md:col-span-2">
                          <label class="block text-xs font-semibold text-slate-500 mb-2">有序数组（升序）</label>
                          <textarea
                            v-model="customInputForm.arrayData"
                            rows="2"
                            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400"
                            placeholder="例如：10,20,30,40,50"
                          />
                        </div>
                        <div>
                          <label class="block text-xs font-semibold text-slate-500 mb-2">目标值</label>
                          <input
                            v-model="customInputForm.target"
                            type="text"
                            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400"
                            placeholder="例如：70"
                          />
                        </div>
                      </div>
                    </template>

                    <template v-else-if="algoStore.currentAlgorithm.category === 'graph'">
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label class="block text-xs font-semibold text-slate-500 mb-2">节点（逗号或空格分隔）</label>
                          <input
                            v-model="customInputForm.graphNodes"
                            type="text"
                            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400"
                            placeholder="例如：A,B,C,D"
                          />
                        </div>
                        <div>
                          <label class="block text-xs font-semibold text-slate-500 mb-2">起点</label>
                          <input
                            v-model="customInputForm.startNode"
                            type="text"
                            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400"
                            placeholder="例如：A"
                          />
                        </div>
                        <div class="md:col-span-2">
                          <label class="block text-xs font-semibold text-slate-500 mb-2">边（每行一条：起点,终点,权重）</label>
                          <textarea
                            v-model="customInputForm.graphEdges"
                            rows="5"
                            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400"
                            placeholder="A,B,4&#10;A,C,2&#10;C,D,3"
                          />
                        </div>
                      </div>
                    </template>

                    <template v-else-if="algoStore.currentAlgorithm.category === 'tree'">
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label class="block text-xs font-semibold text-slate-500 mb-2">初始根节点值（可选）</label>
                          <input
                            v-model="customInputForm.treeRoot"
                            type="text"
                            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400"
                            placeholder="留空表示空树，例如：40"
                          />
                        </div>
                        <div>
                          <label class="block text-xs font-semibold text-slate-500 mb-2">插入值</label>
                          <input
                            v-model="customInputForm.treeInsert"
                            type="text"
                            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400"
                            placeholder="例如：25"
                          />
                        </div>
                      </div>
                    </template>

                    <template v-else-if="algoStore.currentAlgorithm.category === 'dp'">
                      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label class="block text-xs font-semibold text-slate-500 mb-2">重量数组</label>
                          <input
                            v-model="customInputForm.dpWeights"
                            type="text"
                            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400"
                            placeholder="例如：2,3,4,5"
                          />
                        </div>
                        <div>
                          <label class="block text-xs font-semibold text-slate-500 mb-2">价值数组</label>
                          <input
                            v-model="customInputForm.dpValues"
                            type="text"
                            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400"
                            placeholder="例如：3,4,5,8"
                          />
                        </div>
                        <div>
                          <label class="block text-xs font-semibold text-slate-500 mb-2">背包容量</label>
                          <input
                            v-model="customInputForm.dpCapacity"
                            type="text"
                            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400"
                            placeholder="例如：5"
                          />
                        </div>
                      </div>
                    </template>

                    <div v-if="customInputError" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                      {{ customInputError }}
                    </div>

                    <div class="flex flex-wrap gap-2">
                      <button
                        @click="runWithCustomInput"
                        class="px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors"
                      >
                        运行数据
                      </button>
                      <button
                        @click="applyDefaultInput"
                        class="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
                      >
                        恢复默认数据
                      </button>
                    </div>
                  </div>

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

