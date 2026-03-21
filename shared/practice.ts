import type {
    AlgorithmMetaData,
    AlgorithmSnapshot,
    FillBlankPracticeQuestion,
    MultipleChoicePracticeQuestion,
    PracticeChoiceOption,
    PracticeSet,
} from './types';

const OPTION_IDS = ['a', 'b', 'c', 'd'];

const ALGORITHM_LABELS: Record<string, string> = {
    'bubble-sort': '冒泡排序',
    'quick-sort': '快速排序',
    'selection-sort': '选择排序',
    'insertion-sort': '插入排序',
    'binary-search': '二分查找',
    dfs: '深度优先搜索',
    bfs: '广度优先搜索',
    'bst-insert': '二叉搜索树插入',
    dijkstra: 'Dijkstra 算法',
    knapsack: '0/1 背包',
};

function hashSeed(seed: string): number {
    return seed.split('').reduce((total, char) => total + char.charCodeAt(0), 0);
}

function rotateValues<T>(values: T[], seed: string): T[] {
    if (values.length <= 1) return values;
    const offset = hashSeed(seed) % values.length;
    return [...values.slice(offset), ...values.slice(0, offset)];
}

function makeOptions(values: string[], correctValue: string, seed: string): { options: PracticeChoiceOption[]; correctOptionId: string } {
    const orderedValues = rotateValues(values, seed);
    const options = orderedValues.map((text, index) => ({
        id: OPTION_IDS[index] ?? `option-${index}`,
        text,
    }));
    const correctOption = options.find((option) => option.text === correctValue);

    return {
        options,
        correctOptionId: correctOption?.id ?? OPTION_IDS[0] ?? 'option-0',
    };
}

function makeNumericQuestion(
    id: string,
    prompt: string,
    correctValue: number,
    explanation: string,
    subtype: MultipleChoicePracticeQuestion['subtype'],
    points = 50,
): MultipleChoicePracticeQuestion {
    const numericCandidates = Array.from(
        new Set([
            correctValue,
            Math.max(0, correctValue - 1),
            correctValue + 1,
            correctValue + 2,
            Math.max(1, correctValue * 2),
            Math.max(1, Math.floor(correctValue / 2)),
        ]),
    );

    const selectedValues = numericCandidates.slice(0, 4).map(String);
    while (selectedValues.length < 4) {
        selectedValues.push(String(correctValue + selectedValues.length + 1));
    }

    const { options, correctOptionId } = makeOptions(selectedValues, String(correctValue), id);

    return {
        id,
        type: 'multiple-choice',
        subtype,
        prompt,
        options,
        correctOptionId,
        explanation,
        points,
    };
}

function buildComplexityQuestion(algorithm: AlgorithmMetaData): MultipleChoicePracticeQuestion {
    const distractors: Record<string, string[]> = {
        'O(n^2)': ['O(n log n)', 'O(n)', 'O(log n)'],
        'O(n log n)': ['O(n^2)', 'O(n)', 'O(log n)'],
        'O(log n)': ['O(n)', 'O(1)', 'O(n log n)'],
        'O(V+E)': ['O(V log V)', 'O(V^2)', 'O(E log V)'],
        'O((V+E) log V)': ['O(V+E)', 'O(V^2)', 'O(E^2)'],
        'O(h)': ['O(log n)', 'O(n)', 'O(1)'],
        'O(nW)': ['O(n + W)', 'O(W^2)', 'O(log n)'],
    };

    const correctValue = algorithm.complexity.time;
    const candidates = [correctValue, ...(distractors[correctValue] ?? ['O(n)', 'O(log n)', 'O(n^2)'])];
    const { options, correctOptionId } = makeOptions(candidates, correctValue, `complexity-${algorithm.id}`);
    const algorithmLabel = ALGORITHM_LABELS[algorithm.id] ?? algorithm.id;

    return {
        id: `complexity-${algorithm.id}`,
        type: 'multiple-choice',
        subtype: 'concept',
        prompt: `基础理解：${algorithmLabel} 的平均或常见时间复杂度通常记为哪一个？`,
        options,
        correctOptionId,
        explanation: `这道题考查算法复杂度的基础记忆点，${algorithmLabel} 的时间复杂度是 ${correctValue}。`,
        points: 50,
    };
}

function buildTracingQuestion(algorithm: AlgorithmMetaData, snapshot?: AlgorithmSnapshot | null): MultipleChoicePracticeQuestion {
    const arrayState = Array.isArray(snapshot?.dataStructureState) ? (snapshot?.dataStructureState as number[]) : [];
    const size = arrayState.length || snapshot?.variables.n || 7;

    switch (algorithm.id) {
        case 'bubble-sort': {
            return makeNumericQuestion(
                `trace-${algorithm.id}`,
                `计算题：对于当前长度为 ${size} 的数组，冒泡排序第一趟外层循环最多会发生多少次相邻比较？`,
                Math.max(0, size - 1),
                '第一趟需要从头比较到最后一对相邻元素，因此比较次数是 n - 1。',
                'calculation',
            );
        }
        case 'quick-sort': {
            const low = snapshot?.variables.low ?? 0;
            const high = snapshot?.variables.high ?? Math.max(0, size - 1);
            const compareCount = Math.max(0, high - low);
            return makeNumericQuestion(
                `trace-${algorithm.id}`,
                `计算题：当前分区区间是 [${low}, ${high}]，若以 arr[${high}] 为主元，这一轮 partition 会把主元与多少个元素进行比较？`,
                compareCount,
                '分区时 j 会从 low 遍历到 high - 1，所以比较次数是 high - low。',
                'calculation',
            );
        }
        case 'selection-sort': {
            const i = snapshot?.variables.i ?? 0;
            const compareCount = Math.max(0, size - i - 1);
            return makeNumericQuestion(
                `trace-${algorithm.id}`,
                `计算题：当前外层索引 i = ${i}，选择排序为了找到本轮最小值，还需要比较多少个候选元素？`,
                compareCount,
                '选择排序每一轮都会在未排序区间中扫描剩余元素，因此比较次数是 n - i - 1。',
                'calculation',
            );
        }
        case 'insertion-sort': {
            const i = snapshot?.variables.i ?? 1;
            return makeNumericQuestion(
                `trace-${algorithm.id}`,
                `计算题：在插入排序的 i = ${i} 这一轮，把 key 插入之前，左侧已有序区的长度是多少？`,
                i,
                '插入排序会把当前元素插入到左侧已经排好序的前缀中，因此有序区长度就是 i。',
                'calculation',
            );
        }
        case 'binary-search': {
            const mid = snapshot?.variables.mid ?? Math.floor(size / 2);
            const target = snapshot?.variables.target ?? 'target';
            const { options, correctOptionId } = makeOptions(
                [
                    `将 left 移动到 ${mid + 1}`,
                    `将 right 移动到 ${mid - 1}`,
                    '说明已经找到目标值',
                    '直接重新排序数组',
                ],
                `将 left 移动到 ${mid + 1}`,
                `trace-${algorithm.id}`,
            );

            return {
                id: `trace-${algorithm.id}`,
                type: 'multiple-choice',
                subtype: 'calculation',
                prompt: `计算题：二分查找当前 mid = ${mid}。如果 arr[mid] < ${target}，下一步应该怎样收缩区间？`,
                options,
                correctOptionId,
                explanation: '当中间值小于目标值时，目标只能出现在右半区，因此 left 要移动到 mid + 1。',
                points: 50,
            };
        }
        case 'dfs': {
            const { options, correctOptionId } = makeOptions(
                ['沿着一条未访问分支继续向深处探索', '立即按层访问所有同层节点', '随机跳到任意节点', '直接结束遍历'],
                '沿着一条未访问分支继续向深处探索',
                `trace-${algorithm.id}`,
            );

            return {
                id: `trace-${algorithm.id}`,
                type: 'multiple-choice',
                subtype: 'calculation',
                prompt: '过程理解：DFS 在访问到当前节点后，若存在未访问邻居，下一步更符合哪种行为？',
                options,
                correctOptionId,
                explanation: 'DFS 的核心特征就是先尽量向深处走，再回溯。',
                points: 50,
            };
        }
        case 'bfs': {
            const { options, correctOptionId } = makeOptions(
                ['把新发现的邻居按顺序加入队列尾部', '立即回溯到父节点', '总是跳到最深节点', '删除所有未访问节点'],
                '把新发现的邻居按顺序加入队列尾部',
                `trace-${algorithm.id}`,
            );

            return {
                id: `trace-${algorithm.id}`,
                type: 'multiple-choice',
                subtype: 'calculation',
                prompt: '过程理解：BFS 发现未访问邻居后，通常会执行什么操作？',
                options,
                correctOptionId,
                explanation: 'BFS 依赖队列按层推进，因此会把新邻居加入队列尾部。',
                points: 50,
            };
        }
        case 'dijkstra': {
            const { options, correctOptionId } = makeOptions(
                ['松弛当前节点的所有出边', '把图重新排序', '删除权重最大的边', '随机选择下一个节点'],
                '松弛当前节点的所有出边',
                `trace-${algorithm.id}`,
            );

            return {
                id: `trace-${algorithm.id}`,
                type: 'multiple-choice',
                subtype: 'calculation',
                prompt: '过程理解：Dijkstra 取出当前距离最小的节点后，下一步最核心的操作是什么？',
                options,
                correctOptionId,
                explanation: '算法会尝试用当前最短路径去更新相邻节点距离，也就是进行边松弛。',
                points: 50,
            };
        }
        case 'bst-insert': {
            const value = snapshot?.variables.value ?? 25;
            const currVal = snapshot?.variables.currVal ?? 30;
            const correctText = value < currVal ? '继续进入左子树' : '继续进入右子树';
            const { options, correctOptionId } = makeOptions(
                ['继续进入左子树', '继续进入右子树', '直接删除当前节点', '把新值设为根节点'],
                correctText,
                `trace-${algorithm.id}`,
            );

            return {
                id: `trace-${algorithm.id}`,
                type: 'multiple-choice',
                subtype: 'calculation',
                prompt: `计算题：当前要插入的值是 ${value}，正在比较的节点值是 ${currVal}。下一步应该怎么走？`,
                options,
                correctOptionId,
                explanation: 'BST 插入时，较小的值进入左子树，较大的值进入右子树。',
                points: 50,
            };
        }
        case 'knapsack': {
            const { options, correctOptionId } = makeOptions(
                ['在 take 和 skip 中取较大值', '总是选择 take', '总是选择 skip', '把当前物品丢弃并结束'],
                '在 take 和 skip 中取较大值',
                `trace-${algorithm.id}`,
            );

            return {
                id: `trace-${algorithm.id}`,
                type: 'multiple-choice',
                subtype: 'calculation',
                prompt: '计算题：当当前物品可以放入背包时，0/1 背包状态转移应如何更新 dp[i][w]？',
                options,
                correctOptionId,
                explanation: '0/1 背包的核心是比较“选当前物品”和“不选当前物品”两种方案的最大价值。',
                points: 50,
            };
        }
        default: {
            const { options, correctOptionId } = makeOptions(
                ['根据当前状态继续推进下一步', '立即停止算法', '随机打乱输入', '忽略所有变量'],
                '根据当前状态继续推进下一步',
                `trace-${algorithm.id}`,
            );

            return {
                id: `trace-${algorithm.id}`,
                type: 'multiple-choice',
                subtype: 'calculation',
                prompt: '过程理解：结合当前演示状态，下一步最合理的行为是什么？',
                options,
                correctOptionId,
                explanation: '算法演示题通常要求你根据当前状态继续推演，而不是随机改变数据。',
                points: 50,
            };
        }
    }
}

function buildFillBlankQuestion(algorithm: AlgorithmMetaData): FillBlankPracticeQuestion {
    const common = {
        type: 'fill-blank' as const,
        subtype: 'code' as const,
        blankToken: '__BLANK__',
        points: 100,
        language: 'pseudocode' as const,
    };

    switch (algorithm.id) {
        case 'bubble-sort':
            return {
                id: `fill-${algorithm.id}`,
                prompt: '代码填空：补全冒泡排序中的交换语句，让较大的元素向后移动。',
                templateLines: [
                    'for i from 0 to n - 1:',
                    '  for j from 0 to n - i - 2:',
                    '    if arr[j] > arr[j + 1]:',
                    '      swap(arr[j], __BLANK__)',
                ],
                acceptableAnswers: ['arr[j + 1]', 'arr[j+1]'],
                expectedAnswer: 'arr[j + 1]',
                explanation: '交换时需要把当前位置和下一个相邻位置一起传入 swap。',
                hint: '想一想：冒泡排序每次比较的是哪一对相邻元素？',
                ...common,
            };
        case 'quick-sort':
            return {
                id: `fill-${algorithm.id}`,
                prompt: '代码填空：补全快速排序中主元的选取位置。',
                templateLines: [
                    'procedure partition(arr, low, high):',
                    '  pivot = arr[__BLANK__]',
                    '  for j from low to high - 1:',
                    '    if arr[j] < pivot: ...',
                ],
                acceptableAnswers: ['high'],
                expectedAnswer: 'high',
                explanation: '当前实现采用末尾元素作为主元，因此主元位置是 high。',
                hint: '主元来自当前区间的最右端元素。',
                ...common,
            };
        case 'selection-sort':
            return {
                id: `fill-${algorithm.id}`,
                prompt: '代码填空：补全选择排序中“当前最小值位置”的比较对象。',
                templateLines: [
                    'minIndex = i',
                    'for j from i + 1 to n - 1:',
                    '  if arr[j] < arr[__BLANK__]:',
                    '    minIndex = j',
                ],
                acceptableAnswers: ['minIndex'],
                expectedAnswer: 'minIndex',
                explanation: '选择排序要持续记录当前最小元素所在位置，并拿它和新的候选值比较。',
                hint: '这里缺少的是“当前最小值所在下标”这个变量名。',
                ...common,
            };
        case 'insertion-sort':
            return {
                id: `fill-${algorithm.id}`,
                prompt: '代码填空：补全插入排序中 while 条件里的比较对象。',
                templateLines: [
                    'key = arr[i]',
                    'j = i - 1',
                    'while j >= 0 and arr[j] > __BLANK__:',
                    '  arr[j + 1] = arr[j]',
                ],
                acceptableAnswers: ['key'],
                expectedAnswer: 'key',
                explanation: '插入排序会把 key 插入到前面已经排好序的部分，所以要和 key 比较。',
                hint: '被插入到有序区中的那个临时变量是什么？',
                ...common,
            };
        case 'binary-search':
            return {
                id: `fill-${algorithm.id}`,
                prompt: '代码填空：补全二分查找中中点公式的右边界变量。',
                templateLines: [
                    'while left <= right:',
                    '  mid = Math.floor((left + __BLANK__) / 2)',
                    '  if arr[mid] == target: return mid',
                ],
                acceptableAnswers: ['right'],
                expectedAnswer: 'right',
                explanation: '二分查找中 mid 由 left 和 right 共同决定。',
                hint: '它和 left 成对出现。',
                ...common,
            };
        case 'dfs':
            return {
                id: `fill-${algorithm.id}`,
                prompt: '代码填空：补全 DFS 递归前的访问判断条件。',
                templateLines: [
                    'for each neighbor v of u:',
                    '  if __BLANK__:',
                    '    DFS(v)',
                ],
                acceptableAnswers: ['!visited[v]', 'visited[v] == false', 'visited[v]===false'],
                expectedAnswer: '!visited[v]',
                explanation: 'DFS 只会继续递归访问尚未访问的邻居节点。',
                hint: '条件应该表达“节点 v 还没有被访问过”。',
                ...common,
            };
        case 'bfs':
            return {
                id: `fill-${algorithm.id}`,
                prompt: '代码填空：补全 BFS 将新邻居放入队列的方法名。',
                templateLines: [
                    'while queue not empty:',
                    '  u = queue.dequeue()',
                    '  if !visited[v]:',
                    '    queue.__BLANK__(v)',
                ],
                acceptableAnswers: ['enqueue', 'push'],
                expectedAnswer: 'enqueue',
                explanation: 'BFS 依赖队列先进先出地推进层序遍历。',
                hint: '这里缺的是“入队”动作。',
                ...common,
            };
        case 'dijkstra':
            return {
                id: `fill-${algorithm.id}`,
                prompt: '代码填空：补全 Dijkstra 在更新更短距离后，将节点重新放入优先队列的方法。',
                templateLines: [
                    'alt = dist[u] + weight(u, v)',
                    'if alt < dist[v]:',
                    '  dist[v] = alt',
                    '  priorityQueue.__BLANK__(v, alt)',
                ],
                acceptableAnswers: ['insert', 'enqueue', 'push'],
                expectedAnswer: 'insert',
                explanation: '距离被更新后，需要把候选节点重新放回优先队列参与后续选择。',
                hint: '可以理解成“把候选节点加入优先队列”。',
                ...common,
            };
        case 'bst-insert':
            return {
                id: `fill-${algorithm.id}`,
                prompt: '代码填空：补全 BST 插入时，小于当前节点值时要进入的子树方向。',
                templateLines: [
                    'if value < curr.val:',
                    '  curr = curr.__BLANK__',
                    'else:',
                    '  curr = curr.right',
                ],
                acceptableAnswers: ['left'],
                expectedAnswer: 'left',
                explanation: '二叉搜索树满足左小右大，因此较小值应该进入左子树。',
                hint: '和 right 相对的那个方向。',
                ...common,
            };
        case 'knapsack':
            return {
                id: `fill-${algorithm.id}`,
                prompt: '代码填空：补全 0/1 背包状态转移中的取最大值函数。',
                templateLines: [
                    'if weight[i - 1] <= w:',
                    '  take = value[i - 1] + dp[i - 1][w - weight[i - 1]]',
                    '  dp[i][w] = __BLANK__(take, skip)',
                ],
                acceptableAnswers: ['max', 'Math.max'],
                expectedAnswer: 'max',
                explanation: '当前状态要比较 take 和 skip 两个方案，取其中更大的价值。',
                hint: '这个函数会返回两个候选值中更大的那个。',
                ...common,
            };
        default:
            return {
                id: `fill-${algorithm.id}`,
                prompt: '代码填空：补全当前算法伪代码中的关键语句。',
                templateLines: [
                    algorithm.pseudoCode[0] ?? 'procedure algorithm(...):',
                    algorithm.pseudoCode[1]?.replace(/.+/, '__BLANK__') ?? '__BLANK__',
                ],
                acceptableAnswers: [algorithm.pseudoCode[1] ?? 'continue'],
                expectedAnswer: algorithm.pseudoCode[1] ?? 'continue',
                explanation: '请根据当前算法的伪代码结构补全这一空。',
                hint: '可以参考右侧伪代码高亮区域。',
                ...common,
            };
    }
}

export function buildPracticeSet(algorithm: AlgorithmMetaData, snapshot?: AlgorithmSnapshot | null): PracticeSet {
    return {
        multipleChoice: [buildComplexityQuestion(algorithm), buildTracingQuestion(algorithm, snapshot)],
        fillBlank: [buildFillBlankQuestion(algorithm)],
    };
}

export function normalizePracticeAnswer(value: string): string {
    return value
        .trim()
        .toLowerCase()
        .replace(/[“”]/g, '"')
        .replace(/[‘’]/g, "'")
        .replace(/[；;]/g, ';')
        .replace(/\s+/g, '');
}
