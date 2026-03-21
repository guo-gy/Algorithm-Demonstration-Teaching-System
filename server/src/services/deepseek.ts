import { normalizePracticeAnswer } from '@shared/practice';
import { AlgorithmMetaData, FillBlankEvaluation, FillBlankPracticeQuestion } from '@shared/types';

interface DeepSeekGradeResult {
    isCorrect?: boolean;
    score?: number;
    feedback?: string;
}

function clampScore(score: number): number {
    return Math.max(0, Math.min(100, Math.round(score)));
}

function fallbackEvaluation(question: FillBlankPracticeQuestion, answer: string, feedback?: string): FillBlankEvaluation {
    const normalizedAnswer = normalizePracticeAnswer(answer);
    const isCorrect = question.acceptableAnswers.some((candidate) => normalizePracticeAnswer(candidate) === normalizedAnswer);

    return {
        isCorrect,
        score: isCorrect ? 100 : 0,
        feedback:
            feedback ??
            (isCorrect
                ? '答案匹配参考写法，填空正确。'
                : `答案与参考写法不一致。可重点检查空格中的变量或表达式。参考答案：${question.expectedAnswer}`),
        expectedAnswer: question.expectedAnswer,
        source: 'fallback',
    };
}

function safeJsonParse(content: string): DeepSeekGradeResult | null {
    const fencedJson = content.match(/```json\s*([\s\S]*?)```/i);
    const candidate = fencedJson?.[1] ?? content.match(/\{[\s\S]*\}/)?.[0];

    if (!candidate) return null;

    try {
        return JSON.parse(candidate) as DeepSeekGradeResult;
    } catch {
        return null;
    }
}

export async function gradeFillBlankWithDeepSeek(
    algorithm: AlgorithmMetaData,
    question: FillBlankPracticeQuestion,
    answer: string,
): Promise<FillBlankEvaluation> {
    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
        return fallbackEvaluation(question, answer, '未检测到 DeepSeek API Key，已使用本地规则进行判定。');
    }

    try {
        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
                temperature: 0,
                messages: [
                    {
                        role: 'system',
                        content:
                            '你是算法教学系统的严谨阅卷老师，负责批改单个代码填空题。只返回 JSON，不要加 Markdown。JSON 格式必须是 {"isCorrect": boolean, "score": number, "feedback": string}。',
                    },
                    {
                        role: 'user',
                        content: [
                            `算法：${algorithm.id}`,
                            `题目：${question.prompt}`,
                            '代码模板：',
                            ...question.templateLines,
                            `参考答案：${question.acceptableAnswers.join(' | ')}`,
                            `学生答案：${answer}`,
                            `评分说明：满分 100 分；与参考答案完全一致或语义等价给 100 分；仅有轻微语法/空格问题给 60-90 分；核心变量、表达式或逻辑错误给 0-50 分。`,
                            `请特别注意这是一道“单空填空题”，不要扩写成整段代码，只判断空格部分是否正确。`,
                        ].join('\n'),
                    },
                ],
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            return fallbackEvaluation(question, answer, `DeepSeek 判题请求失败，已回退到本地规则。错误信息：${errorText}`);
        }

        const payload = await response.json() as {
            choices?: Array<{ message?: { content?: string } }>;
        };
        const content = payload.choices?.[0]?.message?.content ?? '';
        const parsed = safeJsonParse(content);

        if (!parsed) {
            return fallbackEvaluation(question, answer, 'DeepSeek 返回结果无法解析，已回退到本地规则判定。');
        }

        return {
            isCorrect: Boolean(parsed.isCorrect),
            score: clampScore(typeof parsed.score === 'number' ? parsed.score : (parsed.isCorrect ? 100 : 0)),
            feedback: parsed.feedback?.trim() || 'DeepSeek 已完成判题。',
            expectedAnswer: question.expectedAnswer,
            source: 'deepseek',
        };
    } catch (error: any) {
        return fallbackEvaluation(question, answer, `DeepSeek 服务调用异常，已回退到本地规则。错误信息：${error.message}`);
    }
}
