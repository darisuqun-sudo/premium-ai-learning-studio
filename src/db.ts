import Dexie, { type EntityTable } from 'dexie';

export type SavedPrompt = {
  id?: number;
  title: string;
  goal: string;
  context: string;
  task: string;
  constraints: string;
  outputFormat: string;
  updatedAt: string;
};

export type SkillRecord = {
  id?: number;
  name: string;
  fileName: string;
  content: string;
  status: 'valid' | 'invalid' | 'not-checked';
  notes: string[];
  updatedAt: string;
};

export type ProgressRecord = {
  id?: number;
  lessonId: number;
  lessonTitle: string;
  learnerAnswer?: string;
  status: 'not-started' | 'in-progress' | 'complete';
  score?: number;
  feedback?: string;
  updatedAt: string;
};

export type LessonRecord = {
  id?: number;
  lessonNumber: string;
  stage: 'Beginner' | 'Foundation' | 'Intermediate' | 'Advanced' | 'Professional';
  duration: string;
  title: string;
  summary: string;
  content: string;
  exercise: string;
  rubric: string;
  tags: string[];
  status: 'published' | 'draft';
  updatedAt: string;
};

export const INITIAL_LESSONS: Omit<LessonRecord, 'id'>[] = [
  {
    lessonNumber: '01',
    stage: 'Beginner',
    duration: '15–25 داقىقە',
    title: 'كەسپىي Prompt نىڭ ئاساسى (Professional Prompt Basics)',
    summary: 'Goal، Context، Task، Constraints ۋە Output Format نى ئىشلىتىپ ئاددىي تەلەپنى كەسپىي Prompt قا ئايلاندۇرۇش.',
    content: `### ئۆگىنىش نىشانى
دەرس ئاخىرىدا ئۆگەنگۈچى ئېنىق بىر مەقسەتنى، لازىملىق Context نى، كونكرېت Task نى ۋە پايدىلىق Output Format نى بىر Prompt قا يازالايدۇ.

### ئاساسىي ئۇقۇملار
- **Goal (مەقسەت):** جاۋابتىن كېيىن نېمە ئىش قىلماقچى؟
- **Context (مەزمۇن):** AI غا ۋەزىپىنى چۈشىنىشكە كېرەكلىك ئارقا كۆرۈنۈش.
- **Task (ۋەزىپە):** AI قىلىدىغان كونكرېت ھەرىكەت.
- **Constraints (چەكلىمە):** ئۇزۇنلۇق، تىل، ئۇسلۇب، چەكلەنگەن ياكى زۆرۈر نۇقتىلار.
- **Output format (چىقىرىش فورماتى):** جاۋابنىڭ شەكلى، مەسىلەن تىزىملىك ياكى جەدۋەل.

### ئاددىي چۈشەندۈرۈش ۋە ناچار Prompt
Prompt بولسا بىر ئادەمگە تاپشۇرۇق چۈشەندۈرگەندەك: نېمە لازىم، قايسى ئۇچۇرغا تايىنىدۇ، نەتىجە قانداق بولۇشى كېرەكلىكىنى دېيىش.
**ناچار:** «ماڭا ساياھەت پىلانى تۈز.»
**ياخشىلانغان:** «مەن رىيادتا تۇرىمەن، كېلەر جۈمە كۈنى ئائىلەمدىكىلەر بىلەن شەھەر ئىچىدە يېرىم كۈن سەيلە قىلماقچىمىز. بالىلارغا ماس، دالا ۋە يېمەكلىك تاللىشى بار 3 پىلان تەۋسىيە قىل...»`,
    exercise: '«مېنىڭ تەرجىمىھالىمغا (CV غا) ياردەم قىل» دېگەن ناچار كۆرسەتمىنى يۇقىرىدىكى بەش بۆلەك بويىچە تولۇقلاپ كەسپىي Prompt قا ئايلاندۇرۇڭ. شەخسىي سانلىق مەلۇماتلارنى قوشماڭ.',
    rubric: '10 نومۇرلۇق باھالاش: مەقسەت ۋە ۋەزىپە ئېنىقلىقى (2) + زۆرۈر كونتېكىست (2) + كەم دېگەندە ئىككى ئۈنۈملۈك چەكلىمە (2) + چىقىرىش شەكلى بەلگىلەنگەن (2) + بىخەتەرلىك ۋە ئەمەلىيلىك (2).',
    tags: ['Beginner', 'Basics', 'Prompt Design'],
    status: 'published',
    updatedAt: new Date().toISOString(),
  },
  {
    lessonNumber: '02',
    stage: 'Beginner',
    duration: '20–30 داقىقە',
    title: 'ۋەزىپە ۋە قوبۇل قىلىش ئۆلچىمىنى ئېنىقلاش (Task & Criteria)',
    summary: 'AI قىلىدىغان كونكرېت ھەرىكەت دائىرىسى ۋە نەتىجىنىڭ توغرىلىقىنى باھالاش پىلانى.',
    content: `### ئۆگىنىش نىشانى
AI نىڭ مۈجمەل جاۋاب بېرىشىنىڭ ئالدىنى ئېلىش، ۋەزىپىنى ئۆلچىگىلى بولىدىغان قوبۇل قىلىش ئۆلچەملىرى (Acceptance Criteria) بىلەن چەكلەش.

### ئاساسىي قائىدىلەر
1. كۆرسەتمىدىكى مۈجمەل سۆزلەرنى كونكرېت ئۆلچەم بىلەن ئالماشتۇرۇش.
2. ھالقىلىق نەتىجىلەرگە تەكشۈرۈش پەللىسى بەلگىلەش.
3. پاكىتقا ئاساسلىنىدىغان مەزمۇنلاردا مەنبە كۆرسىتىشنى مەجبۇرىي قىلىش.`,
    exercise: 'خېرىدارلارنىڭ تاپشۇرغان ئەرز-شىكايەتلىرىنى تۈرگە ئايرىش ئۈچۈن، 4 ئېنىق كاتېگورىيە ۋە ئېنىقسىز ئەھۋالدا «نامەلۇم» دەپ بەلگىلەيدىغان Task يېزىڭ.',
    rubric: '10 نومۇرلۇق باھالاش: كاتېگورىيەلەر تولۇقلىقى (3) + ئېنىقسىزلىقنى بىر تەرەپ قىلىش (4) + فورمات ماسلىقى (3).',
    tags: ['Beginner', 'Task Scope', 'Evaluation'],
    status: 'published',
    updatedAt: new Date().toISOString(),
  },
  {
    lessonNumber: '03',
    stage: 'Foundation',
    duration: '25–35 داقىقە',
    title: 'Few-shot مىساللىرى ۋە قۇرۇلمىلىق چىقىرىش (Structured Output & JSON)',
    summary: 'مىساللار ئارقىلىق AI غا چېگرا ۋە ئۇسلۇب كۆرسىتىش، سانلىق مەلۇماتلارنى ماشىنا ئوقۇيدىغان JSON غا ئايلاندۇرۇش.',
    content: `### Few-shot ئۇسۇلى
- **Zero-shot:** مىسال بەرمەي كۆرسەتمە بىلەنلا بۇيرۇش.
- **Few-shot:** كىرگۈزۈش/چىقىرىش مىساللىرى ئارقىلىق چېگرا ۋە ئۇسلۇبنى كۆرسىتىش.

### Structured Output ئەۋزەللىكى
نەتىجىنى API ياكى پروگراممىغا بىۋاسىتە ئۇلاش ئۈچۈن JSON Schema بىلەن ئېنىق فورمات تەلەپ قىلىش كېرەك. قوشۇمچە سۆز قوشماسلىق ۋە schema غا قاتتىق ئەمەل قىلىش تەكىتلىنىدۇ.`,
    exercise: 'ئىشلەتكۈچى باھاسىنى تەھلىل قىلىدىغان (مەنپىي، نېيترال، ئىجابىي) ۋە نەتىجىنى JSON object شەكلىدە قايتۇرىدىغان، 2 دانە Few-shot مىسالى بار Prompt لايىھەلەڭ.',
    rubric: '10 نومۇرلۇق باھالاش: Few-shot سۈپىتى (4) + JSON Schema توغرىلىقى (4) + ئارتۇقچە سۆزدىن ساقلىنىش (2).',
    tags: ['Foundation', 'Few-shot', 'JSON Schema'],
    status: 'published',
    updatedAt: new Date().toISOString(),
  },
  {
    lessonNumber: '04',
    stage: 'Intermediate',
    duration: '30–45 داقىقە',
    title: 'AI Workflows ۋە قورال ئىشلىتىش (Agent & Tool Workflows)',
    summary: 'مۇرەككەپ ۋەزىپىلەرنى باسقۇچقا ئايرىش، قوراللارنىڭ ھوقۇقىنى چەكلەش ۋە خەۋپنى كونترول قىلىش.',
    content: `### خىزمەت ئېقىمى (Workflow) پىرىنسىپى
1. چوڭ ۋەزىپىنى بۆلەكلەرگە بۆلۈش.
2. ھەر بۆلەكنىڭ چىقىرىشى كېيىنكى قەدەمگە كىرگۈزۈش بولۇشى.
3. خەتەرلىك ھەرىكەتلەردە (ئۆچۈرۈش، ھەق تۆلەش، يوللاش) ئادەمنىڭ تەستىقىنى ئېلىش.
4. خاتالىق يۈز بەرگەندە قايتا سىناش ۋە توختاش چەكلىمىسىنى بەلگىلەش.`,
    exercise: 'ھۆججەتتىن سانلىق مەلۇمات ئوقۇش، خۇلاسە چىقىرىش ۋە دەلىللەشتىن ئىبارەت 3 باسقۇچلۇق تەتقىقات workflow نى لايىھەلەڭ.',
    rubric: '10 نومۇرلۇق باھالاش: خىزمەت بۆلۈنۈشى (4) + قورال ئىشلىتىش بىخەتەرلىكى (3) + خاتالىق تاقابىللىقى (3).',
    tags: ['Intermediate', 'Agent Workflow', 'Tool Safety'],
    status: 'published',
    updatedAt: new Date().toISOString(),
  },
];

class StudioDB extends Dexie {
  prompts!: EntityTable<SavedPrompt, 'id'>;
  skills!: EntityTable<SkillRecord, 'id'>;
  progress!: EntityTable<ProgressRecord, 'id'>;
  lessons!: EntityTable<LessonRecord, 'id'>;

  constructor() {
    super('premium-ai-learning-studio');
    this.version(1).stores({
      prompts: '++id,title,updatedAt',
      skills: '++id,name,fileName,updatedAt',
      progress: '++id,lessonId,status,updatedAt',
    });
    this.version(2).stores({
      prompts: '++id,title,updatedAt',
      skills: '++id,name,fileName,updatedAt',
      progress: '++id,lessonId,status,updatedAt',
      lessons: '++id,lessonNumber,stage,status,updatedAt',
    });
  }
}

export const db = new StudioDB();

export async function ensureInitialLessons(): Promise<LessonRecord[]> {
  const count = await db.lessons.count();
  if (count === 0) {
    for (const item of INITIAL_LESSONS) {
      await db.lessons.add(item);
    }
  }
  return db.lessons.toArray();
}
