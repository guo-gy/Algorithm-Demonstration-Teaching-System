<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import * as d3 from 'd3';
import { useAlgorithmStore } from '../../stores/algorithm';
import { useI18n } from '../../i18n';

const props = defineProps<{
  type: 'array' | 'tree' | 'graph' | 'dp';
}>();


const algoStore = useAlgorithmStore();
const { t } = useI18n();
const visualizerRef = ref<HTMLElement | null>(null);

const renderArray = (data: number[], highlightedIndices: number[] = [], comparing: number[] = [], swapping: number[] = []) => {
  if (!visualizerRef.value) return;
  const container = d3.select(visualizerRef.value);
  container.selectAll('*').remove();
  const width = visualizerRef.value.clientWidth;
  const height = 400;
  const margin = { top: 40, right: 30, bottom: 40, left: 40 };

  const svg = container.append('svg').attr('width', width).attr('height', height);

  const x = d3.scaleBand()
    .domain(data.map((_, i) => i.toString()))
    .range([margin.left, width - margin.right])
    .padding(0.1);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data) || 10])
    .range([height - margin.bottom, margin.top]);

  svg.selectAll('rect')
    .data(data)
    .join('rect')
    .attr('x', (_, i) => x(i.toString())!)
    .attr('y', d => y(d))
    .attr('height', d => y(0) - y(d))
    .attr('width', x.bandwidth())
    .attr('fill', (_, i) => {
      if (swapping.includes(i)) return '#ef4444';
      if (comparing.includes(i)) return '#f59e0b';
      if (highlightedIndices.includes(i)) return '#10b981';
      return '#3b82f6';
    })
    .attr('rx', 4);

  svg.selectAll('.val')
    .data(data)
    .join('text')
    .attr('x', (_, i) => x(i.toString())! + x.bandwidth() / 2)
    .attr('y', d => y(d) - 10)
    .attr('text-anchor', 'middle')
    .attr('class', 'text-xs font-bold fill-slate-700')
    .text(d => d);
};

const renderTree = (root: any, currentNodeId?: string | number) => {
  if (!visualizerRef.value || !root) return;
  const container = d3.select(visualizerRef.value);
  container.selectAll('*').remove();
  const width = visualizerRef.value.clientWidth;
  const height = 400;

  const svg = container.append('svg').attr('width', width).attr('height', height);
  const g = svg.append('g').attr('transform', 'translate(0, 40)');

  const hierarchy = d3.hierarchy(root);
  const treeLayout = d3.tree().size([width, height - 100]);
  treeLayout(hierarchy);

  // Links
  g.selectAll('line')
    .data(hierarchy.links())
    .join('line')
    .attr('x1', d => (d.source as any).x)
    .attr('y1', d => (d.source as any).y)
    .attr('x2', d => (d.target as any).x)
    .attr('y2', d => (d.target as any).y)
    .attr('stroke', '#cbd5e1')
    .attr('stroke-width', 2);

  // Nodes
  const nodes = g.selectAll('g.node')
    .data(hierarchy.descendants())
    .join('g')
    .attr('transform', d => `translate(${(d as any).x}, ${(d as any).y})`);

  nodes.append('circle')
    .attr('r', 20)
    .attr('fill', d => (d.data as any).id === currentNodeId ? '#10b981' : '#fff')
    .attr('stroke', d => (d.data as any).id === currentNodeId ? '#10b981' : '#3b82f6')
    .attr('stroke-width', 2);

  nodes.append('text')
    .attr('dy', '0.35em')
    .attr('text-anchor', 'middle')
    .attr('class', 'text-xs font-bold')
    .attr('fill', d => (d.data as any).id === currentNodeId ? '#fff' : '#1e293b')
    .text(d => (d.data as any).value);
};

const renderGraph = (data: any, currentNodeId?: string | number, variables: any = {}) => {
  if (!visualizerRef.value || !data) return;
  const container = d3.select(visualizerRef.value);
  container.selectAll('*').remove();
  const width = visualizerRef.value.clientWidth;
  const height = 400;

  const svg = container.append('svg').attr('width', width).attr('height', height);
  
  const simulation = d3.forceSimulation(data.nodes)
    .force('link', d3.forceLink(data.edges).id((d: any) => d.id).distance(100))
    .force('charge', d3.forceManyBody().strength(-300))
    .force('center', d3.forceCenter(width / 2, height / 2));

  const link = svg.append('g')
    .selectAll('line')
    .data(data.edges)
    .join('line')
    .attr('stroke', '#cbd5e1')
    .attr('stroke-width', 2);

  const node = svg.append('g')
    .selectAll('circle')
    .data(data.nodes)
    .join('circle')
    .attr('r', 15)
    .attr('fill', (d: any) => {
      if (d.id === currentNodeId) return '#10b981';
      if (variables.visited?.includes(d.id)) return '#bae6fd';
      return '#fff';
    })
    .attr('stroke', '#3b82f6')
    .attr('stroke-width', 2);

  const label = svg.append('g')
    .selectAll('text')
    .data(data.nodes)
    .join('text')
    .attr('dy', '0.35em')
    .attr('text-anchor', 'middle')
    .attr('class', 'text-[10px] font-bold fill-slate-700')
    .text((d: any) => d.id);

  simulation.on('tick', () => {
    link
      .attr('x1', (d: any) => d.source.x)
      .attr('y1', (d: any) => d.source.y)
      .attr('x2', (d: any) => d.target.x)
      .attr('y2', (d: any) => d.target.y);

    node
      .attr('cx', (d: any) => d.x)
      .attr('cy', (d: any) => d.y);

    label
      .attr('x', (d: any) => d.x)
      .attr('y', (d: any) => d.y);
  });
};

const renderDP = (matrix: number[][], currentCell?: [number, number]) => {
  if (!visualizerRef.value) return;
  const container = d3.select(visualizerRef.value);
  container.selectAll('*').remove();
  const width = visualizerRef.value.clientWidth;
  const height = 400;

  const svg = container.append('svg').attr('width', width).attr('height', height);
  const rows = matrix.length;
  const cols = matrix[0]?.length || 0;
  const cellSize = Math.min((width - 100) / cols, (height - 100) / rows, 40);

  const g = svg.append('g').attr('transform', `translate(${(width - cols * cellSize) / 2}, ${(height - rows * cellSize) / 2})`);

  matrix.forEach((row, r) => {
    row.forEach((val, c) => {
      const isCurrent = currentCell?.[0] === r && currentCell?.[1] === c;
      g.append('rect')
        .attr('x', c * cellSize)
        .attr('y', r * cellSize)
        .attr('width', cellSize)
        .attr('height', cellSize)
        .attr('fill', isCurrent ? '#10b981' : '#fff')
        .attr('stroke', '#e2e8f0');

      if (val !== undefined) {
        g.append('text')
          .attr('x', c * cellSize + cellSize / 2)
          .attr('y', r * cellSize + cellSize / 2)
          .attr('dy', '0.35em')
          .attr('text-anchor', 'middle')
          .attr('class', 'text-[10px] fill-slate-600')
          .text(val);
      }
    });
  });
};

watch(() => algoStore.currentSnapshot, (snapshot) => {
  if (snapshot) {
    if (props.type === 'array') {
      renderArray(snapshot.dataStructureState, [], snapshot.variables.comparing || [], snapshot.variables.swapping || []);
    } else if (props.type === 'tree') {
      renderTree(snapshot.dataStructureState, snapshot.currentNodeId);
    } else if (props.type === 'graph') {
      renderGraph(snapshot.dataStructureState, snapshot.currentNodeId, snapshot.variables);
    } else if (props.type === 'dp') {
      renderDP(snapshot.dataStructureState, [snapshot.variables.i, snapshot.variables.w]);
    }
  }
}, { deep: true });

onMounted(() => {
  if (algoStore.currentSnapshot) {
    if (props.type === 'array') renderArray(algoStore.currentSnapshot.dataStructureState);
    else if (props.type === 'tree') renderTree(algoStore.currentSnapshot.dataStructureState);
    else if (props.type === 'graph') renderGraph(algoStore.currentSnapshot.dataStructureState);
    else if (props.type === 'dp') renderDP(algoStore.currentSnapshot.dataStructureState);
  }
});

</script>

<template>
  <div class="relative w-full overflow-hidden bg-slate-50 rounded-xl border border-slate-200 shadow-inner min-h-[400px]">
    <div ref="visualizerRef" class="w-full h-full"></div>
    
    <!-- Info Overlay -->
    <div v-if="algoStore.currentSnapshot" class="absolute top-4 left-4 right-4 bg-white/80 backdrop-blur-sm p-3 rounded-lg border border-white shadow-sm pointer-events-none">
      <p class="text-sm font-medium text-slate-800">{{ t(`steps.${algoStore.currentSnapshot.description}`, algoStore.currentSnapshot.variables) }}</p>
    </div>
  </div>
</template>
