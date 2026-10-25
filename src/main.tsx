import React, { useEffect, useState } from 'react';
import JSZip from 'jszip';
import { createRoot } from 'react-dom/client';
import {
  Activity,
  Award,
  BookOpen,
  Bot,
  Boxes,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  CircleHelp,
  ClipboardCheck,
  CloudDownload,
  Database,
  Edit,
  Eye,
  FileCode2,
  FolderOpen,
  GraduationCap,
  Languages,
  LayoutDashboard,
  Menu,
  Plus,
  RefreshCw,
  Save,
  Send,
  Shield,
  ShieldCheck,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Users,
  WandSparkles,
} from 'lucide-react';
import {
  db,
  ensureInitialLessons,
  INITIAL_LESSONS,
  type LessonRecord,
  type ProgressRecord,
  type SavedPrompt,
  type SkillRecord,
} from './db';
import { validateSkillMarkdown, type SkillCheck } from './skillValidator';
import './style.css';

type ClientPage = 'home' | 'lessons' | 'prompt' | 'skills' | 'projects' | 'settings';
type AdminPage =
  | 'admin-overview'
  | 'admin-lessons'
  | 'admin-submissions'
  | 'admin-skills'
  | 'admin-prompts'
  | 'admin-system';

type ViewMode = 'client' | 'admin';

const clientNav: { id: ClientPage; label: string; icon: React.ElementType }[] = [
  { id: 'home', label: 'باش بەت', icon: LayoutDashboard },
  { id: 'lessons', label: 'AI دەرسلىرى', icon: GraduationCap },
  { id: 'prompt', label: 'Prompt قورالى', icon: WandSparkles },
  { id: 'skills', label: 'Skill تەجرىبىخانىسى', icon: FileCode2 },
  { id: 'projects', label: 'خىزمەتلىرىم', icon: Boxes },
  { id: 'settings', label: 'تەڭشەكلەر', icon: Languages },
];

const adminNav: { id: AdminPage; label: string; icon: React.ElementType }[] = [
  { id: 'admin-overview', label: 'سىستېما دوكلاتى', icon: LayoutDashboard },
  { id: 'admin-lessons', label: 'دەرس باشقۇرۇش', icon: BookOpen },
  { id: 'admin-submissions', label: 'ئوقۇغۇچى تاپشۇرۇقلىرى', icon: Award },
  { id: 'admin-skills', label: 'ماھارەت ئامبىرى', icon: FileCode2 },
  { id: 'admin-prompts', label: 'Prompt قېلىپلىرى', icon: WandSparkles },
  { id: 'admin-system', label: 'سىستېما ۋە سانلىق مەلۇمات', icon: Database },
];

export function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('client');
  const [clientPage, setClientPage] = useState<ClientPage>('home');
  const [adminPage, setAdminPage] = useState<AdminPage>('admin-overview');
  const [mobileNav, setMobileNav] = useState(false);
  const [language, setLanguage] = useState('ug');
  const [notice, setNotice] = useState('');

  // Data states
  const [lessons, setLessons] = useState<LessonRecord[]>([]);
  const [submissions, setSubmissions] = useState<ProgressRecord[]>([]);
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([]);
  const [skills, setSkills] = useState<SkillRecord[]>([]);

  // Learner view state
  const [stageFilter, setStageFilter] = useState<string>('All');
  const [expandedLessonId, setExpandedLessonId] = useState<number | null>(null);
  const [learnerAnswers, setLearnerAnswers] = useState<Record<number, string>>({});

  // Prompt workbench state
  const [prompt, setPrompt] = useState({
    title: 'يېڭى Prompt',
    goal: '',
    context: '',
    task: '',
    constraints: '',
    outputFormat: '',
  });

  // Skill lab state
  const [check, setCheck] = useState<SkillCheck | null>(null);
  const [skillContent, setSkillContent] = useState('');
  const [skillName, setSkillName] = useState('');
  const [skillPackageFiles, setSkillPackageFiles] = useState<string[]>([]);

  // Admin Lesson Form state
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState<number | null>(null);
  const [lessonForm, setLessonForm] = useState<Omit<LessonRecord, 'id'>>({
    lessonNumber: '05',
    stage: 'Foundation',
    duration: '20–30 داقىقە',
    title: '',
    summary: '',
    content: '',
    exercise: '',
    rubric: '',
    tags: ['Prompt'],
    status: 'published',
    updatedAt: new Date().toISOString(),
  });

  // Admin Grading state
  const [gradingSubmissionId, setGradingSubmissionId] = useState<number | null>(null);
  const [gradingScore, setGradingScore] = useState<number>(9);
  const [gradingFeedback, setGradingFeedback] = useState<string>('مۇنەۋۋەر جاۋاب، بارلىق تەلەپلەرگە تولۇق ئەمەل قىلىندى.');

  async function refreshData() {
    const l = await ensureInitialLessons();
    setLessons(l);
    setSubmissions(await db.progress.toArray());
    setSavedPrompts(await db.prompts.toArray());
    setSkills(await db.skills.toArray());
  }

  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'en' || language === 'tr' ? 'ltr' : 'rtl';
  }, [language]);

  // Prompt actions
  async function savePrompt() {
    const hasBody = [prompt.goal, prompt.context, prompt.task, prompt.constraints, prompt.outputFormat].some(
      (v) => v.trim().length > 0
    );
    if (!prompt.title.trim() || !hasBody) {
      setNotice('ساقلاشتىن بۇرۇن Prompt نامى ۋە كەم دېگەندە بىر بۆلەكنى تولدۇرۇڭ.');
      return;
    }
    const record: SavedPrompt = {
      ...prompt,
      title: prompt.title.trim(),
      updatedAt: new Date().toISOString(),
    };
    await db.prompts.add(record);
    setSavedPrompts(await db.prompts.toArray());
    setNotice('Prompt يەرلىك ساقلاش بوشلۇقىغا ساقلاندى.');
  }

  function copyPrompt() {
    const text = `Goal: ${prompt.goal}\nContext: ${prompt.context}\nTask: ${prompt.task}\nConstraints: ${prompt.constraints}\nOutput format: ${prompt.outputFormat}`;
    navigator.clipboard
      ?.writeText(text)
      .then(() => setNotice('Prompt كۆچۈرۈلدى.'))
      .catch(() => setNotice('كۆچۈرۈش قوللىنىلمىدى؛ تېكىستنى قولدا كۆچۈرۈڭ.'));
  }

  // Skill actions
  async function importSkill(file?: File) {
    if (!file) return;
    try {
      if (file.name.toLowerCase().endsWith('.zip')) {
        const zip = await JSZip.loadAsync(file);
        const entries = Object.values(zip.files).filter(
          (x) =>
            !x.dir &&
            !x.name.startsWith('__MACOSX/') &&
            !x.name.split('/').pop()?.startsWith('._') &&
            !x.name.endsWith('.DS_Store')
        );
        const skillEntry = entries.find((x) => x.name.split('/').pop()?.toLowerCase() === 'skill.md');
        if (!skillEntry) {
          setNotice('ZIP ئىچىدە SKILL.md تېپىلمىدى.');
          return;
        }
        const content = await skillEntry.async('text');
        const pkgFiles = entries.map((x) => x.name);
        setSkillContent(content);
        setSkillName(skillEntry.name);
        setSkillPackageFiles(pkgFiles);
        setCheck(validateSkillMarkdown(content, pkgFiles));
        setNotice(`Skill ZIP ئوقۇلدى: ${entries.length} ھۆججەت. ئەسلى ئارخىپ ئۆزگەرتىلمىدى.`);
      } else {
        const content = await file.text();
        setSkillContent(content);
        setSkillName(file.name);
        setSkillPackageFiles([file.name]);
        setCheck(validateSkillMarkdown(content));
        setNotice('ھۆججەت يۈكلەندى؛ قۇرۇلما تەكشۈرۈشى تاماملاندى.');
      }
    } catch {
      setNotice('ھۆججەتنى ئوقۇغىلى بولمىدى. ZIP ياكى Markdown ھۆججىتىنىڭ توغرىلىقىنى تەكشۈرۈڭ.');
    }
  }

  async function saveSkill() {
    if (!skillContent.trim()) {
      setNotice('ساقلاشتىن بۇرۇن SKILL.md مەزمۇنىنى كىرگۈزۈڭ ياكى ھۆججەت تاللاڭ.');
      return;
    }
    const c = validateSkillMarkdown(skillContent, skillPackageFiles);
    setCheck(c);
    const fallbackName = skillName.replace(/\.md$/i, '').trim() || 'نامسىز Skill';
    const record: SkillRecord = {
      name: c.name || fallbackName,
      fileName: skillName.trim() || 'SKILL.md',
      content: skillContent,
      status: c.valid ? 'valid' : 'invalid',
      notes: [...c.errors, ...c.warnings],
      updatedAt: new Date().toISOString(),
    };
    await db.skills.add(record);
    setSkills(await db.skills.toArray());
    setNotice('Skill تەكشۈرۈش خاتىرىسى ساقلاندى.');
  }

  // Learner Exercise Submission (Connected to Admin Queue)
  async function submitExercise(lesson: LessonRecord) {
    if (!lesson.id) return;
    const answer = (learnerAnswers[lesson.id] || '').trim();
    if (!answer) {
      setNotice('تاپشۇرۇشتىن بۇرۇن مەشىق جاۋابىڭىزنى كىرگۈزۈڭ.');
      return;
    }

    const existing = await db.progress.where('lessonId').equals(lesson.id).first();
    if (existing && existing.id) {
      await db.progress.update(existing.id, {
        lessonTitle: lesson.title,
        learnerAnswer: answer,
        status: 'in-progress',
        updatedAt: new Date().toISOString(),
      });
    } else {
      await db.progress.add({
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        learnerAnswer: answer,
        status: 'in-progress',
        updatedAt: new Date().toISOString(),
      });
    }
    setSubmissions(await db.progress.toArray());
    setNotice(`«${lesson.title}» مەشىقى تاپشۇرۇلدى! ئارقا سۇپىدىكى باھالاش سەپىگە كىردى.`);
  }

  // Admin Lesson Management
  function openAddLesson() {
    setEditingLessonId(null);
    setLessonForm({
      lessonNumber: String(lessons.length + 1).padStart(2, '0'),
      stage: 'Foundation',
      duration: '20–30 داقىقە',
      title: '',
      summary: '',
      content: '',
      exercise: '',
      rubric: '10 نومۇرلۇق باھالاش ئۆلچىمى',
      tags: ['Prompt Basics'],
      status: 'published',
      updatedAt: new Date().toISOString(),
    });
    setShowLessonForm(true);
  }

  function openEditLesson(l: LessonRecord) {
    if (!l.id) return;
    setEditingLessonId(l.id);
    setLessonForm({
      lessonNumber: l.lessonNumber,
      stage: l.stage,
      duration: l.duration,
      title: l.title,
      summary: l.summary,
      content: l.content,
      exercise: l.exercise,
      rubric: l.rubric,
      tags: l.tags,
      status: l.status,
      updatedAt: new Date().toISOString(),
    });
    setShowLessonForm(true);
  }

  async function handleSaveLesson() {
    if (!lessonForm.title.trim() || !lessonForm.content.trim()) {
      setNotice('دەرس ماۋزۇسى ۋە مەزمۇنىنى كىرگۈزۈڭ.');
      return;
    }
    if (editingLessonId) {
      await db.lessons.update(editingLessonId, {
        ...lessonForm,
        updatedAt: new Date().toISOString(),
      });
      setNotice('دەرس مۇۋەپپەقىيەتلىك تەھرىرلەندى؛ كۆرۈنمە يۈزگە دەرھال ئۇلاندى.');
    } else {
      await db.lessons.add({
        ...lessonForm,
        updatedAt: new Date().toISOString(),
      });
      setNotice('يېڭى دەرس ئېلان قىلىندى؛ كۆرۈنمە يۈزدىكى ئۆگىنىش مەركىزىگە ئۇلاندى.');
    }
    setShowLessonForm(false);
    setEditingLessonId(null);
    setLessons(await db.lessons.toArray());
  }

  async function toggleLessonStatus(lesson: LessonRecord) {
    if (!lesson.id) return;
    const nextStatus = lesson.status === 'published' ? 'draft' : 'published';
    await db.lessons.update(lesson.id, {
      status: nextStatus,
      updatedAt: new Date().toISOString(),
    });
    setLessons(await db.lessons.toArray());
    setNotice(`دەرس ھالىتى «${nextStatus === 'published' ? 'ئېلان قىلىنغان' : 'لايىھە'}» غا ئۆزگەرتىلدى.`);
  }

  async function deleteLesson(id?: number) {
    if (id === undefined) return;
    if (!window.confirm('بۇ دەرسنى ئۆچۈرۈشنى جەزملەشتۈرەمسىز؟')) return;
    await db.lessons.delete(id);
    setLessons(await db.lessons.toArray());
    setNotice('دەرس مۇۋەپپەقىيەتلىك ئۆچۈرۈلدى.');
  }

  // Admin Grading Action
  async function submitGrading(id?: number) {
    if (id === undefined) return;
    await db.progress.update(id, {
      score: gradingScore,
      feedback: gradingFeedback,
      status: 'complete',
      updatedAt: new Date().toISOString(),
    });
    setGradingSubmissionId(null);
    setSubmissions(await db.progress.toArray());
    setNotice('ئوقۇغۇچى مەشىقى باھالاندى ۋە كۆرۈنمە يۈزگە نەتىجە يوللاندى.');
  }

  // Backup & Restore
  async function exportBackup() {
    const payload = {
      app: 'Premium AI Learning Studio',
      schemaVersion: 2,
      exportedAt: new Date().toISOString(),
      prompts: await db.prompts.toArray(),
      skills: await db.skills.toArray(),
      progress: await db.progress.toArray(),
      lessons: await db.lessons.toArray(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ai-learning-studio-full-backup.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice('پۈتۈن سىستېما JSON زاپاس ھۆججىتى چۈشۈرۈلدى.');
  }

  async function importBackup(file?: File) {
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (!Array.isArray(data.prompts) || !Array.isArray(data.skills)) {
        throw new Error('schema');
      }
      if (
        !window.confirm(
          `زاپاستا ${data.prompts?.length || 0} Prompt، ${data.skills?.length || 0} Skill ۋە ${
            data.lessons?.length || 0
          } دەرس بار. بۇ مەزمۇنلار سانلىق مەلۇمات ئامبىرىغا ئۇلىنىدۇ. داۋاملاشتۇرامسىز؟`
        )
      ) {
        return;
      }
      if (Array.isArray(data.prompts)) {
        for (const x of data.prompts) {
          if (typeof x.title === 'string') {
            await db.prompts.add({
              title: x.title,
              goal: String(x.goal || ''),
              context: String(x.context || ''),
              task: String(x.task || ''),
              constraints: String(x.constraints || ''),
              outputFormat: String(x.outputFormat || ''),
              updatedAt: x.updatedAt || new Date().toISOString(),
            });
          }
        }
      }
      if (Array.isArray(data.skills)) {
        for (const x of data.skills) {
          if (typeof x.name === 'string') {
            await db.skills.add({
              name: x.name,
              fileName: String(x.fileName || 'SKILL.md'),
              content: x.content || '',
              status: ['valid', 'invalid', 'not-checked'].includes(x.status) ? x.status : 'not-checked',
              notes: Array.isArray(x.notes) ? x.notes.map(String) : [],
              updatedAt: String(x.updatedAt || new Date().toISOString()),
            });
          }
        }
      }
      if (Array.isArray(data.lessons)) {
        for (const x of data.lessons) {
          if (typeof x.title === 'string' && typeof x.content === 'string') {
            await db.lessons.add({
              lessonNumber: String(x.lessonNumber || '01'),
              stage: x.stage || 'Beginner',
              duration: String(x.duration || '20 داقىقە'),
              title: x.title,
              summary: String(x.summary || ''),
              content: x.content,
              exercise: String(x.exercise || ''),
              rubric: String(x.rubric || ''),
              tags: Array.isArray(x.tags) ? x.tags : ['General'],
              status: x.status === 'draft' ? 'draft' : 'published',
              updatedAt: String(x.updatedAt || new Date().toISOString()),
            });
          }
        }
      }
      await refreshData();
      setNotice('زاپاس سانلىق مەلۇماتلىرى تولۇق ئۇلاندى ۋە يېڭىلاندى.');
    } catch {
      setNotice('زاپاس ھۆججىتىنىڭ فورماتى خاتا ياكى ئوقۇش مەغلۇپ بولدى.');
    }
  }

  async function resetDefaultCurriculum() {
    if (!window.confirm('بارلىق دەرسلەرنى ئۆچۈرۈپ، ئەسلى تەستىقلانغان دەرسلىك پروگراممىسىغا قايتۇرامسىز؟')) return;
    await db.lessons.clear();
    for (const item of INITIAL_LESSONS) {
      await db.lessons.add(item);
    }
    setLessons(await db.lessons.toArray());
    setNotice('دەرسلىكلەر ئەسلى رەسمىي دەرس پىلانىغا قايتۇرۇلدى.');
  }

  // Filtered lessons for frontend
  const publishedLessons = lessons.filter((l) => l.status === 'published');
  const visibleLessons = publishedLessons.filter((l) => {
    if (stageFilter === 'All') return true;
    return l.stage.toLowerCase() === stageFilter.toLowerCase();
  });

  // Calculate system stats
  const totalSubmissions = submissions.length;
  const gradedSubmissions = submissions.filter((s) => s.status === 'complete').length;
  const avgScore =
    gradedSubmissions > 0
      ? (submissions.filter((s) => s.score !== undefined).reduce((a, b) => a + (b.score || 0), 0) /
          gradedSubmissions).toFixed(1)
      : '0.0';

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className={`sidebar ${viewMode === 'admin' ? 'admin-mode' : ''} ${mobileNav ? 'open' : ''}`}>
        <div className="brand">
          <div className="brand-mark">
            {viewMode === 'admin' ? <Shield size={22} /> : <Sparkles size={22} />}
          </div>
          <div>
            <b>AI LEARNING</b>
            <span>{viewMode === 'admin' ? 'ADMIN STUDIO' : 'STUDIO'}</span>
          </div>
        </div>

        <div className="workspace-label">
          <span>{viewMode === 'admin' ? 'ئارقا باشقۇرۇش سۇپىسى' : 'ئۆگىنىش مۇھىتى'}</span>
          <span className="admin-mode-pill">{viewMode === 'admin' ? 'باشقۇرغۇچى' : 'كۆرۈنمە يۈز'}</span>
        </div>

        <nav>
          {viewMode === 'client'
            ? clientNav.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    className={`nav-item ${clientPage === item.id ? 'active' : ''}`}
                    onClick={() => {
                      setClientPage(item.id);
                      setMobileNav(false);
                    }}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                    {clientPage === item.id && <ChevronLeft size={15} className="nav-chevron dir-icon" />}
                  </button>
                );
              })
            : adminNav.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    className={`nav-item ${adminPage === item.id ? 'active' : ''}`}
                    onClick={() => {
                      setAdminPage(item.id);
                      setMobileNav(false);
                    }}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                    {adminPage === item.id && <ChevronLeft size={15} className="nav-chevron dir-icon" />}
                  </button>
                );
              })}
        </nav>

        <div className="sidebar-bottom">
          <div className="offline-chip">
            <span className="status-dot" /> سىستېما ئۇلىنىشى نورمال
          </div>
          <small>نۇسخا 0.2.0 · Local-first</small>
        </div>
      </aside>

      {/* Main Area */}
      <main className="main-area">
        <header className="topbar">
          <button
            className="icon-button mobile-menu"
            onClick={() => setMobileNav(!mobileNav)}
            aria-label="تىزىملىك"
          >
            <Menu size={20} />
          </button>

          <div className="breadcrumb">
            AI Studio <span>/</span>{' '}
            {viewMode === 'admin'
              ? adminNav.find((n) => n.id === adminPage)?.label
              : clientNav.find((n) => n.id === clientPage)?.label}
          </div>

          <div className="top-actions">
            {/* View Mode Toggle: Frontend ⇄ Backend Admin */}
            {viewMode === 'client' ? (
              <button
                className="mode-toggle-btn to-admin"
                onClick={() => {
                  setViewMode('admin');
                  setAdminPage('admin-overview');
                }}
                title="تور بېكەتنىڭ ئارقا باشقۇرۇش بېتىگە ئۆتۈش"
              >
                <Shield size={16} />
                <span>ئارقا باشقۇرۇشقا ئۆتۈش</span>
              </button>
            ) : (
              <button
                className="mode-toggle-btn to-client"
                onClick={() => {
                  setViewMode('client');
                  setClientPage('lessons');
                }}
                title="تور بېكەتنىڭ كۆرۈنمە يۈزىگە قايتىش"
              >
                <Eye size={16} />
                <span>كۆرۈنمە يۈزگە قايتىش</span>
              </button>
            )}

            <select aria-label="تىل تاللاش" value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="ug">ئۇيغۇرچە</option>
              <option value="ar">العربية</option>
              <option value="en">English</option>
              <option value="tr">Türkçe</option>
            </select>

            <button className="icon-button" title="پۈتۈن سىستېما زاپاسلاش" onClick={exportBackup}>
              <CloudDownload size={18} />
            </button>
            <div className="avatar">{viewMode === 'admin' ? 'AD' : 'AI'}</div>
          </div>
        </header>

        {notice && (
          <div className="notice" role="status">
            <span>{notice}</span>
            <button onClick={() => setNotice('')} aria-label="ئۇقتۇرۇشنى تاقاش">
              ×
            </button>
          </div>
        )}

        {/* -------------------- CLIENT / FRONTEND PAGES -------------------- */}
        {viewMode === 'client' && (
          <>
            {clientPage === 'home' && (
              <section className="page-content">
                <div className="hero">
                  <div className="hero-pattern" />
                  <div className="hero-copy">
                    <div className="eyebrow">
                      <Sparkles size={14} /> PERSONAL AI WORKSPACE
                    </div>
                    <h1>ئۆگىنىش مەركىزىم</h1>
                    <p>
                      ئارقا سۇپىدىن تەستىقلانغان كەسپىي AI دەرسلىكلىرى، سىناق مەشىقلىرى ۋە Prompt/Skill باھالاش قوراللىرى.
                    </p>
                    <div className="button-row">
                      <button className="gold-button" onClick={() => setClientPage('lessons')}>
                        دەرسلەرگە كىرىش <ChevronLeft size={17} className="dir-icon" />
                      </button>
                      <button
                        className="outline-button"
                        style={{ color: '#fff', borderColor: '#ffffff44' }}
                        onClick={() => {
                          setViewMode('admin');
                          setAdminPage('admin-overview');
                        }}
                      >
                        <Shield size={15} /> ئارقا باشقۇرۇشقا ئۆتۈش
                      </button>
                    </div>
                  </div>
                  <div className="hero-emblem">
                    <div className="emblem-ring">
                      <Bot size={48} />
                    </div>
                    <span>LEARN · BUILD · VERIFY</span>
                  </div>
                </div>

                <div className="section-heading">
                  <div>
                    <h2>ئۆگىنىش ۋە خىزمەت قوراللىرى</h2>
                    <p>ئالدى كۆرۈنمە يۈز بىلەن ئارقا باشقۇرۇش مەركىزى بىۋاسىتە ئۇلانغان</p>
                  </div>
                  <span className="subtle-tag">CONNECTED APPS</span>
                </div>

                <div className="tool-grid">
                  <ToolCard
                    icon={<BookOpen />}
                    tone="emerald"
                    title={`AI دەرسلىرى (${publishedLessons.length})`}
                    description="ئارقا سۇپا ئېلان قىلغان رەسمىي دەرسلىكلەر ۋە باھالىنىدىغان مەشىقلەر"
                    action="دەرسلەرنى ئېچىش"
                    onClick={() => setClientPage('lessons')}
                  />
                  <ToolCard
                    icon={<WandSparkles />}
                    tone="gold"
                    title={`Prompt قورالى (${savedPrompts.length})`}
                    description="Goal، Context، Task ۋە Output نى سىستېمىلىق قۇرۇش"
                    action="Prompt لايىھىلەش"
                    onClick={() => setClientPage('prompt')}
                  />
                  <ToolCard
                    icon={<FileCode2 />}
                    tone="forest"
                    title={`Skill تەجرىبىخانىسى (${skills.length})`}
                    description="SKILL.md ۋە ZIP بوغچىلىرىنى قۇرۇلمىلىق تەكشۈرۈش"
                    action="Skill تەھلىلى"
                    onClick={() => setClientPage('skills')}
                  />
                  <ToolCard
                    icon={<FolderOpen />}
                    tone="ivory"
                    title="خىزمەتلىرىم"
                    description="ساقلانغان تۈرلەر، Prompt ۋە شەخسىي تەجرىبىلەر"
                    action="خىزمەتلەرنى كۆرۈش"
                    onClick={() => setClientPage('projects')}
                  />
                </div>

                <div className="bottom-grid">
                  <div className="panel">
                    <div className="panel-title">
                      <div>
                        <h3>يېقىنقى ئۆگىنىش ۋە خىزمەتلەر</h3>
                        <p>ئارقا سۇپا ۋە يەرلىك ساندان بىلەن ماس قەدەملەشتى</p>
                      </div>
                      <button className="text-button" onClick={() => setClientPage('projects')}>
                        ھەممىنى كۆرۈش <ChevronLeft size={14} className="dir-icon" />
                      </button>
                    </div>

                    {savedPrompts.length === 0 && skills.length === 0 && submissions.length === 0 ? (
                      <div className="empty-state">
                        <div className="empty-icon">
                          <ClipboardCheck size={22} />
                        </div>
                        <b>تېخى خىزمەت خاتىرىسى يوق</b>
                        <span>بىرىنچى دەرسنى تاماملاپ مەشىق تاپشۇرسىڭىز بۇ يەردە كۆرۈنىدۇ.</span>
                      </div>
                    ) : (
                      <div className="recent-list">
                        {submissions.slice(-2).reverse().map((sub) => (
                          <div className="recent-row" key={'sub-' + sub.id}>
                            <Award size={17} />
                            <span>
                              {sub.lessonTitle}{' '}
                              <small>{sub.status === 'complete' ? `نەتىجە: ${sub.score}/10` : 'باھالاش كۈتۈلمەكتە'}</small>
                            </span>
                            <small className={sub.status === 'complete' ? 'valid-label' : 'invalid-label'}>
                              {sub.status === 'complete' ? 'تاماملاندى' : 'سۇنۇلدى'}
                            </small>
                          </div>
                        ))}
                        {savedPrompts.slice(-2).reverse().map((p) => (
                          <div className="recent-row" key={'p-' + p.id}>
                            <WandSparkles size={17} />
                            <span>{p.title}</span>
                            <small>Prompt</small>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="panel progress-panel">
                    <div className="panel-title">
                      <div>
                        <h3>سىستېما ئۇلىنىش ھالىتى</h3>
                        <p>كۆرۈنمە يۈز بىلەن باشقۇرۇش مەركىزى</p>
                      </div>
                      <ShieldCheck size={21} className="gold-icon" />
                    </div>
                    <div className="progress-step">
                      <div className="step-num done">
                        <CheckCircle2 size={16} />
                      </div>
                      <div>
                        <b>رەسمىي دەرسلىكلەر ئۇلاندى</b>
                        <span>ئارقا سۇپىدىن {publishedLessons.length} دەرس كۆرۈنمە يۈزگە يۈكلەندى</span>
                      </div>
                    </div>
                    <div className="progress-step">
                      <div className="step-num done">
                        <CheckCircle2 size={16} />
                      </div>
                      <div>
                        <b>باھالاش سەپى ئاكتىپ</b>
                        <span>تاپشۇرۇلغان مەشىقلەر بىۋاسىتە ئارقا باشقۇرۇش بېتىگە كىرىدۇ</span>
                      </div>
                    </div>
                    <button
                      className="outline-button full"
                      onClick={() => {
                        setViewMode('admin');
                        setAdminPage('admin-submissions');
                      }}
                    >
                      ئارقا باشقۇرۇش تاپشۇرۇق سەپىنى كۆرۈش <ChevronLeft size={16} className="dir-icon" />
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* DYNAMIC LESSONS PAGE (Connected directly to Backend DB) */}
            {clientPage === 'lessons' && (
              <section className="page-content">
                <PageTitle
                  eyebrow="OFFICIAL CURRICULUM"
                  title="AI دەرسلىرى"
                  desc="ئارقا سۇپىدىن تارقىتىلغان قەدەممۇقەدەم ئۆگىنىش ۋە باھالانغان ئەمەلىي مەشىقلەر."
                />

                {/* Filter Pills */}
                <div className="filter-bar">
                  {['All', 'Beginner', 'Foundation', 'Intermediate'].map((s) => (
                    <button
                      key={s}
                      className={`filter-pill ${stageFilter === s ? 'active' : ''}`}
                      onClick={() => setStageFilter(s)}
                    >
                      {s === 'All' ? 'بارلىق دەرسلەر' : s}
                    </button>
                  ))}
                  <button
                    className="text-button"
                    style={{ marginInlineStart: 'auto' }}
                    onClick={() => {
                      setViewMode('admin');
                      setAdminPage('admin-lessons');
                    }}
                  >
                    <Plus size={14} /> ئارقا سۇپىدىن يېڭى دەرس قوشۇش
                  </button>
                </div>

                <div className="lesson-list">
                  {visibleLessons.map((l) => {
                    const isExpanded = expandedLessonId === l.id;
                    const sub = submissions.find((s) => s.lessonId === l.id);
                    return (
                      <div className={`lesson-card ${isExpanded ? 'expanded' : ''}`} key={l.id}>
                        <div className="lesson-number">{l.lessonNumber}</div>
                        <div className="lesson-main">
                          <span className="subtle-tag">
                            {l.stage.toUpperCase()} · {l.duration}
                          </span>
                          <h2>{l.title}</h2>
                          <p>{l.summary}</p>

                          <div className="lesson-tags">
                            {l.tags.map((t, idx) => (
                              <span key={idx}>{t}</span>
                            ))}
                            {sub && sub.status === 'complete' && (
                              <span style={{ background: '#e3f2e6', color: '#276f41', fontWeight: 700 }}>
                                تاماملىدىڭىز · باھا: {sub.score}/10
                              </span>
                            )}
                            {sub && sub.status === 'in-progress' && (
                              <span style={{ background: '#fff5dc', color: '#976e1f' }}>
                                مەشىق سۇنۇلدى · باھالىنىشتا
                              </span>
                            )}
                          </div>

                          <div className="button-row" style={{ marginTop: '16px' }}>
                            <button
                              className={isExpanded ? 'outline-button' : 'primary-button'}
                              onClick={() => setExpandedLessonId(isExpanded ? null : l.id || null)}
                            >
                              {isExpanded ? 'دەرسنى پۈكلەش' : 'دەرسنى ئوقۇش ۋە مەشىق قىلىش'}
                              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                          </div>

                          {/* Expanded Content & Exercise */}
                          {isExpanded && (
                            <div className="lesson-body-content">
                              <div style={{ whiteSpace: 'pre-line' }}>{l.content}</div>

                              {/* Exercise Submission Box */}
                              <div className="lesson-exercise-box">
                                <h4>
                                  <GraduationCap size={18} /> دەرس مەشىقى (ئارقا باشقۇرۇشقا تاپشۇرۇلىدۇ)
                                </h4>
                                <p style={{ fontSize: '12px', color: '#4d5e56', margin: '4px 0 10px' }}>
                                  {l.exercise}
                                </p>
                                <div style={{ fontSize: '11px', color: '#887445', marginBottom: '8px' }}>
                                  <b>باھالاش ئۆلچىمى (Rubric):</b> {l.rubric}
                                </div>

                                <textarea
                                  placeholder="مەشىق جاۋابىڭىزنى ياكى پىلانلىغان Prompt نى بۇ يەرگە يېزىڭ..."
                                  value={learnerAnswers[l.id!] ?? (sub?.learnerAnswer || '')}
                                  onChange={(e) =>
                                    setLearnerAnswers({
                                      ...learnerAnswers,
                                      [l.id!]: e.target.value,
                                    })
                                  }
                                />

                                <div className="button-row">
                                  <button className="primary-button" onClick={() => submitExercise(l)}>
                                    <Send size={15} /> مەشىقنى تاپشۇرۇش
                                  </button>
                                  <button
                                    className="outline-button"
                                    onClick={() => {
                                      setPrompt({
                                        title: `${l.title} مەشىقى`,
                                        goal: '',
                                        context: '',
                                        task: learnerAnswers[l.id!] || '',
                                        constraints: '',
                                        outputFormat: '',
                                      });
                                      setClientPage('prompt');
                                    }}
                                  >
                                    Prompt قورالىدا قۇرۇش
                                  </button>
                                </div>

                                {/* Grade & Feedback if available */}
                                {sub && (
                                  <div
                                    className={`feedback-box ${sub.status === 'complete' ? '' : 'pending'}`}
                                  >
                                    {sub.status === 'complete' ? (
                                      <>
                                        <b>
                                          <CheckCircle2 size={15} style={{ verticalAlign: 'text-bottom' }} /> ئوقۇتقۇچى
                                          باھاسى: {sub.score} / 10
                                        </b>
                                        <p style={{ margin: '4px 0 0' }}>{sub.feedback || 'تەستىقلاندى.'}</p>
                                      </>
                                    ) : (
                                      <>
                                        <b>مەشىق تاپشۇرۇلدى؛ ئارقا باشقۇرۇش سۇپىسىدا تەكشۈرۈلمەكتە.</b>
                                        <span>ئارقا باشقۇرغۇچى باھالىغاندىن كېيىن، نومۇر ۋە تەۋسىيە بۇ يەردە كۆرۈنىدۇ.</span>
                                      </>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* PROMPT WORKBENCH */}
            {clientPage === 'prompt' && (
              <section className="page-content">
                <PageTitle
                  eyebrow="PROMPT WORKBENCH"
                  title="Prompt قورالى"
                  desc="بەش ئاساسىي قىسىمنى تولدۇرۇپ Prompt قۇرۇڭ، كۆچۈرۈڭ ۋە يەرلىك ساقلاڭ."
                />
                <div className="builder-layout">
                  <div className="panel form-panel">
                    <div className="field">
                      <label>Prompt نامى</label>
                      <input
                        value={prompt.title}
                        onChange={(e) => setPrompt({ ...prompt, title: e.target.value })}
                        placeholder="مەسىلەن: CV ياخشىلاش"
                      />
                    </div>
                    <div className="field">
                      <label>
                        <span>01</span> Goal — مەقسەت
                      </label>
                      <textarea
                        value={prompt.goal}
                        onChange={(e) => setPrompt({ ...prompt, goal: e.target.value })}
                        placeholder="بۇ Prompt ئارقىلىق قانداق نەتىجىگە ئېرىشمەكچى؟"
                      />
                    </div>
                    <div className="field">
                      <label>
                        <span>02</span> Context — ئارقا كۆرۈنۈش
                      </label>
                      <textarea
                        value={prompt.context}
                        onChange={(e) => setPrompt({ ...prompt, context: e.target.value })}
                        placeholder="AI چۈشىنىشكە تېگىشلىك ئۇچۇرلار..."
                      />
                    </div>
                    <div className="field">
                      <label>
                        <span>03</span> Task — ۋەزىپە
                      </label>
                      <textarea
                        value={prompt.task}
                        onChange={(e) => setPrompt({ ...prompt, task: e.target.value })}
                        placeholder="AI دىن كونكرېت نېمە قىلىشنى تەلەپ قىلىسىز؟"
                      />
                    </div>
                    <div className="field">
                      <label>
                        <span>04</span> Constraints — چەكلىمىلەر
                      </label>
                      <textarea
                        value={prompt.constraints}
                        onChange={(e) => setPrompt({ ...prompt, constraints: e.target.value })}
                        placeholder="تىل، ئۇزۇنلۇق، شەخسىي ئۇچۇرنى قوغداش..."
                      />
                    </div>
                    <div className="field">
                      <label>
                        <span>05</span> Output Format — چىقىرىش فورماتى
                      </label>
                      <textarea
                        value={prompt.outputFormat}
                        onChange={(e) => setPrompt({ ...prompt, outputFormat: e.target.value })}
                        placeholder="تىزىملىك، جەدۋەل، Markdown ياكى JSON..."
                      />
                    </div>
                    <div className="button-row">
                      <button className="primary-button" onClick={savePrompt}>
                        <Save size={16} /> ساقلاش
                      </button>
                      <button className="outline-button" onClick={copyPrompt}>
                        Prompt نى كۆچۈرۈش
                      </button>
                      <button
                        className="ghost-button"
                        onClick={() =>
                          setPrompt({
                            title: 'يېڭى Prompt',
                            goal: '',
                            context: '',
                            task: '',
                            constraints: '',
                            outputFormat: '',
                          })
                        }
                      >
                        تازىلاش
                      </button>
                    </div>
                  </div>
                  <div className="panel preview-panel">
                    <div className="panel-title">
                      <div>
                        <h3>ئالدىن كۆرۈش</h3>
                        <p>ھازىرقى Prompt قۇرۇلمىسى</p>
                      </div>
                      <WandSparkles size={20} className="gold-icon" />
                    </div>
                    <div className="prompt-preview">
                      {(
                        [
                          ['Goal', prompt.goal],
                          ['Context', prompt.context],
                          ['Task', prompt.task],
                          ['Constraints', prompt.constraints],
                          ['Output format', prompt.outputFormat],
                        ] as const
                      ).map(([k, v]) => (
                        <div key={k}>
                          <b>{k}</b>
                          <p>{v || 'بۇ بۆلەك تېخى تولدۇرۇلمىدى.'}</p>
                        </div>
                      ))}
                    </div>
                    <div className="tip-box">
                      <Sparkles size={16} />
                      <span>
                        تەۋسىيە: ھەقىقىي نەتىجىگە تەسىر قىلىدىغان چەكلىمىلەرنىلا قوشۇڭ؛ زۆرۈر بولمىغان تەپسىلاتنى كۆپەيتمەڭ.
                      </span>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* SKILL LAB */}
            {clientPage === 'skills' && (
              <section className="page-content">
                <PageTitle
                  eyebrow="SKILL LAB · VALIDATION"
                  title="Skill تەجرىبىخانىسى"
                  desc="SKILL.md ياكى ZIP بوغچىسىنى ئىمپورت قىلىپ قۇرۇلما ۋە مەيدانلارنى تەكشۈرۈڭ."
                />
                <div className="callout">
                  <ShieldCheck size={20} />
                  <div>
                    <b>ئەسلى نۇسخا قوغدىلىدۇ</b>
                    <p>
                      بۇ قورال يۈكلىگەن ھۆججەتنى پەقەت ئوقۇپ تەكشۈرىدۇ؛ ئەسلى ZIP ھۆججىتىنى ئۆزگەرتمەيدۇ. باھالانغان
                      ماھارەتلەر ئارقا باشقۇرۇش ئامبىرىغا ئۇلىنىدۇ.
                    </p>
                  </div>
                </div>
                <div className="skill-layout">
                  <div className="panel skill-import">
                    <div className="upload-zone">
                      <div className="upload-icon">
                        <FileCode2 size={27} />
                      </div>
                      <h3>SKILL.md ياكى ZIP تاللاڭ</h3>
                      <p>Markdown ياكى ZIP بوغچىسىنى كومپيۇتېرىڭىزدىن تاللاڭ.</p>
                      <label className="primary-button file-button">
                        SKILL.md ياكى ZIP تاللاش
                        <input
                          type="file"
                          accept=".md,.markdown,.txt,.zip,application/zip"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            e.target.value = '';
                            importSkill(f);
                          }}
                        />
                      </label>
                    </div>
                    <div className="field">
                      <label>ھۆججەت نامى</label>
                      <input value={skillName} onChange={(e) => setSkillName(e.target.value)} placeholder="SKILL.md" />
                    </div>
                    {skillPackageFiles.length > 0 && (
                      <div className="tip-box">
                        <FileCode2 size={16} />
                        <span>
                          ئوقۇلغان ئارخىپتىكى ھۆججەت سانى: {skillPackageFiles.length}.{' '}
                          {skillPackageFiles.slice(0, 5).join(' · ')}
                          {skillPackageFiles.length > 5 ? ' · …' : ''}
                        </span>
                      </div>
                    )}
                    <div className="field">
                      <label>SKILL.md مەزمۇنى</label>
                      <textarea
                        className="code-textarea"
                        value={skillContent}
                        onChange={(e) => {
                          setSkillContent(e.target.value);
                          setCheck(null);
                        }}
                        rows={13}
                      />
                    </div>
                    <div className="button-row">
                      <button
                        className="primary-button"
                        onClick={() => setCheck(validateSkillMarkdown(skillContent, skillPackageFiles))}
                      >
                        <ClipboardCheck size={16} /> قۇرۇلمىنى تەكشۈرۈش
                      </button>
                      <button className="outline-button" onClick={saveSkill}>
                        <Save size={16} /> نەتىجىنى ساقلاش
                      </button>
                    </div>
                  </div>
                  <div className="panel results-panel">
                    <div className="panel-title">
                      <div>
                        <h3>تەكشۈرۈش نەتىجىسى</h3>
                        <p>YAML، ئاساسىي مەيدانلار ۋە ھۆججەت ئۇلىنىشلىرى</p>
                      </div>
                      <ShieldCheck size={21} className="gold-icon" />
                    </div>
                    {!check ? (
                      <div className="empty-state">
                        <div className="empty-icon">
                          <ClipboardCheck size={22} />
                        </div>
                        <b>تەكشۈرۈش تېخى باشلانمىدى</b>
                        <span>ھۆججەت تاللاپ «قۇرۇلمىنى تەكشۈرۈش» نى بېسىڭ.</span>
                      </div>
                    ) : (
                      <div className="check-results">
                        <div className={`result-banner ${check.valid ? 'success' : 'error'}`}>
                          {check.valid ? <CheckCircle2 size={19} /> : <CircleHelp size={19} />}
                          <div>
                            <b>{check.valid ? 'ئاساسىي قۇرۇلما تەكشۈرۈشىدىن ئۆتتى' : 'تۈزىتىشكە تېگىشلىك مەسىلە بار'}</b>
                            <span>
                              {check.valid
                                ? 'YAML پارس قىلىندى، name ۋە description تەكشۈرۈلدى.'
                                : 'تۆۋەندىكى خاتالىقلارنى تۈزىتىپ قايتا سىناڭ.'}
                            </span>
                          </div>
                        </div>
                        {check.name && (
                          <div className="metadata-row">
                            <span>name</span>
                            <code>{check.name}</code>
                          </div>
                        )}
                        {check.description && (
                          <div className="metadata-row">
                            <span>description</span>
                            <p>{check.description}</p>
                          </div>
                        )}
                        {check.referencedFiles && check.referencedFiles.length > 0 && (
                          <div className="metadata-row">
                            <span>تىلغا ئېلىنغان پايدىلىنىش ھۆججەتلىرى ({check.referencedFiles.length})</span>
                            <code>{check.referencedFiles.join(', ')}</code>
                          </div>
                        )}
                        {check.errors.map((x, i) => (
                          <div className="issue error-text" key={'e' + i}>
                            ✕ {x}
                          </div>
                        ))}
                        {check.warnings.map((x, i) => (
                          <div className="issue warning-text" key={'w' + i}>
                            ! {x}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* PROJECTS VAULT */}
            {clientPage === 'projects' && (
              <section className="page-content">
                <PageTitle eyebrow="PROJECT VAULT" title="خىزمەتلىرىم" desc="ساقلانغان Prompt، Skill ۋە تاپشۇرۇقلار." />
                <div className="bottom-grid">
                  <div className="panel">
                    <div className="panel-title">
                      <div>
                        <h3>ساقلانغان Prompt لار ({savedPrompts.length})</h3>
                        <p>تەھرىرلىگۈچكە يۈكلەپ ئىشلىتىڭ</p>
                      </div>
                    </div>
                    {savedPrompts.length === 0 ? (
                      <p className="muted">تېخى ساقلانغان Prompt يوق.</p>
                    ) : (
                      <div className="recent-list">
                        {savedPrompts.map((p) => (
                          <div className="recent-row" key={p.id}>
                            <WandSparkles size={17} />
                            <span
                              onClick={() => {
                                setPrompt({ ...p });
                                setClientPage('prompt');
                              }}
                              style={{ cursor: 'pointer' }}
                            >
                              {p.title} <small>{p.goal || p.task || 'مەزمۇن بار'}</small>
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="panel">
                    <div className="panel-title">
                      <div>
                        <h3>مەشىق ۋە تاپشۇرۇقلىرىم ({submissions.length})</h3>
                        <p>ئارقا سۇپىدىن باھالانغان نەتىجىلەر</p>
                      </div>
                    </div>
                    {submissions.length === 0 ? (
                      <p className="muted">تېخى مەشىق تاپشۇرمىدىڭىز.</p>
                    ) : (
                      <div className="recent-list">
                        {submissions.map((s) => (
                          <div className="recent-row" key={s.id}>
                            <Award size={17} />
                            <span>
                              {s.lessonTitle}{' '}
                              <small>{s.status === 'complete' ? `نەتىجە: ${s.score}/10` : 'باھالاشتا'}</small>
                            </span>
                            <small className={s.status === 'complete' ? 'valid-label' : 'invalid-label'}>
                              {s.status === 'complete' ? 'باھالاندى' : 'كۈتۈلمەكتە'}
                            </small>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* SETTINGS */}
            {clientPage === 'settings' && (
              <section className="page-content">
                <PageTitle eyebrow="PREFERENCES" title="تەڭشەكلەر" desc="تىل، يۆنىلىش ۋە سىستېما ئۇلىنىشلىرى." />
                <div className="panel settings-panel">
                  <div className="field">
                    <label>كۆرۈنۈش تىلى</label>
                    <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                      <option value="ug">ئۇيغۇرچە — RTL</option>
                      <option value="ar">العربية — RTL</option>
                      <option value="en">English — LTR</option>
                      <option value="tr">Türkçe — LTR</option>
                    </select>
                  </div>
                  <div className="settings-row">
                    <div>
                      <b>ئارقا باشقۇرۇش ئۇلىنىشى</b>
                      <span>ئۆگىنىش كۆرۈنمە يۈزى بىلەن ئارقا باشقۇرۇش مەركىزى بىر سانداندا تۇتاشتۇرۇلدى.</span>
                    </div>
                    <span className="status-pill good">ئۇلانغان</span>
                  </div>
                  <div className="button-row" style={{ marginTop: '16px' }}>
                    <button
                      className="primary-button"
                      onClick={() => {
                        setViewMode('admin');
                        setAdminPage('admin-overview');
                      }}
                    >
                      <Shield size={16} /> ئارقا باشقۇرۇش سۇپىسىنى ئېچىش
                    </button>
                    <button className="outline-button" onClick={exportBackup}>
                      <CloudDownload size={16} /> پۈتۈن سىستېمىنى زاپاسلاش
                    </button>
                  </div>
                </div>
              </section>
            )}
          </>
        )}

        {/* -------------------- BACKEND / ADMIN PAGES -------------------- */}
        {viewMode === 'admin' && (
          <>
            {/* ADMIN OVERVIEW */}
            {adminPage === 'admin-overview' && (
              <section className="page-content">
                <div className="section-heading" style={{ marginTop: '0' }}>
                  <div>
                    <span className="subtle-tag" style={{ background: '#c5a66a26', color: '#8d7034' }}>
                      ADMIN BACKOFFICE · ئارقا باشقۇرۇش مەركىزى
                    </span>
                    <h1 style={{ margin: '8px 0 4px', fontSize: '26px', color: '#163b2f' }}>
                      سىستېما ۋە ئوقۇتۇش دوكلاتى
                    </h1>
                    <p>ئالدى كۆرۈنمە يۈز بىلەن دەرس، مەشىق ۋە باھالاش سانلىق مەلۇماتلىرى تۇتاشتۇرۇلدى.</p>
                  </div>
                  <button
                    className="mode-toggle-btn to-client"
                    onClick={() => {
                      setViewMode('client');
                      setClientPage('lessons');
                    }}
                  >
                    <Eye size={15} /> كۆرۈنمە يۈزگە ئۆتۈپ كۆرۈش
                  </button>
                </div>

                {/* Real-time stats */}
                <div className="stat-grid">
                  <div className="stat-card">
                    <div className="stat-card-icon emerald">
                      <BookOpen size={22} />
                    </div>
                    <div>
                      <b>{lessons.length}</b>
                      <span>دەرس سانى ({publishedLessons.length} ئېلان قىلىنغان)</span>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card-icon blue">
                      <Users size={22} />
                    </div>
                    <div>
                      <b>{totalSubmissions}</b>
                      <span>تاپشۇرۇلغان مەشىق</span>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card-icon gold">
                      <Award size={22} />
                    </div>
                    <div>
                      <b>{gradedSubmissions}</b>
                      <span>باھالانغان تاپشۇرۇق (ئوتتۇرا: {avgScore})</span>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card-icon">
                      <FileCode2 size={22} />
                    </div>
                    <div>
                      <b>{skills.length}</b>
                      <span>تەكشۈرۈلگەن Skill</span>
                    </div>
                  </div>
                </div>

                {/* Submissions Queue Quick Review */}
                <div className="panel">
                  <div className="panel-title">
                    <div>
                      <h3>ئوقۇغۇچىلاردىن كەلگەن تاپشۇرۇقلار (باھالاش سەپى)</h3>
                      <p>ئالدى كۆرۈنمە يۈزدىن يوللانغان مەشىقلەرنى تەكشۈرۈپ نومۇر قويۇش</p>
                    </div>
                    <button className="text-button" onClick={() => setAdminPage('admin-submissions')}>
                      ھەممىسىنى باشقۇرۇش <ChevronLeft size={14} className="dir-icon" />
                    </button>
                  </div>

                  {submissions.length === 0 ? (
                    <p className="muted">تېخى باھالاش سەپىدە تاپشۇرۇق يوق.</p>
                  ) : (
                    <div className="admin-table-container">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>دەرس ماۋزۇسى</th>
                            <th>مەشىق جاۋابى</th>
                            <th>ھالەت</th>
                            <th>نومۇر</th>
                            <th>مەشغۇلات</th>
                          </tr>
                        </thead>
                        <tbody>
                          {submissions.slice(0, 5).map((sub) => (
                            <tr key={sub.id}>
                              <td>
                                <b>{sub.lessonTitle}</b>
                              </td>
                              <td style={{ maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {sub.learnerAnswer}
                              </td>
                              <td>
                                <span className={`status-badge ${sub.status}`}>
                                  {sub.status === 'complete' ? 'باھالاندى' : 'كۈتۈلمەكتە'}
                                </span>
                              </td>
                              <td>{sub.score !== undefined ? `${sub.score} / 10` : '—'}</td>
                              <td>
                                <button
                                  className="primary-button"
                                  style={{ padding: '4px 10px', fontSize: '11px' }}
                                  onClick={() => {
                                    setAdminPage('admin-submissions');
                                    setGradingSubmissionId(sub.id || null);
                                    setGradingScore(sub.score || 9);
                                    setGradingFeedback(sub.feedback || 'مۇنەۋۋەر نەتىجە.');
                                  }}
                                >
                                  باھالاش
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Lessons Quick List */}
                <div className="panel">
                  <div className="panel-title">
                    <div>
                      <h3>دەرسلىكلەر جەدۋىلى</h3>
                      <p>ئالدى كۆرۈنمە يۈزگە تەسىر كۆرسىتىدۇ</p>
                    </div>
                    <button className="primary-button" onClick={openAddLesson}>
                      <Plus size={15} /> يېڭى دەرس قوشۇش
                    </button>
                  </div>
                  <div className="admin-table-container">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>نومۇرى</th>
                          <th>ماۋزۇ</th>
                          <th>باسقۇچ</th>
                          <th>ۋاقتى</th>
                          <th>ھالەت</th>
                          <th>باشقۇرۇش</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lessons.map((l) => (
                          <tr key={l.id}>
                            <td>
                              <code>{l.lessonNumber}</code>
                            </td>
                            <td>
                              <b>{l.title}</b>
                            </td>
                            <td>{l.stage}</td>
                            <td>{l.duration}</td>
                            <td>
                              <span className={`status-badge ${l.status}`}>
                                {l.status === 'published' ? 'ئېلان قىلىنغان' : 'لايىھە'}
                              </span>
                            </td>
                            <td>
                              <div className="action-buttons">
                                <button onClick={() => toggleLessonStatus(l)}>
                                  {l.status === 'published' ? 'توختىتىش' : 'ئېلان قىلىش'}
                                </button>
                                <button onClick={() => openEditLesson(l)}>تەھرىرلەش</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            )}

            {/* ADMIN LESSONS MANAGEMENT */}
            {adminPage === 'admin-lessons' && (
              <section className="page-content">
                <div className="section-heading" style={{ marginTop: 0 }}>
                  <div>
                    <h1 style={{ margin: 0, fontSize: '24px', color: '#163b2f' }}>دەرسلەرنى باشقۇرۇش</h1>
                    <p>بۇ يەردە قوشۇلغان ياكى تەھرىرلەنگەن دەرسلەر كۆرۈنمە يۈزدىكى «AI دەرسلىرى» گە دەرھال ئۇلىنىدۇ.</p>
                  </div>
                  <button className="primary-button" onClick={openAddLesson}>
                    <Plus size={16} /> يېڭى دەرس قۇرۇش
                  </button>
                </div>

                {/* Lesson Form Modal/Inline */}
                {showLessonForm && (
                  <div className="admin-form-modal">
                    <div className="panel-title">
                      <h3>{editingLessonId ? 'دەرسنى تەھرىرلەش' : 'يېڭى دەرس ئېلان قىلىش'}</h3>
                      <button className="ghost-button" onClick={() => setShowLessonForm(false)}>
                        تاقاش ×
                      </button>
                    </div>
                    <div className="form-grid">
                      <div className="field">
                        <label>دەرس رەت نومۇرى</label>
                        <input
                          value={lessonForm.lessonNumber}
                          onChange={(e) => setLessonForm({ ...lessonForm, lessonNumber: e.target.value })}
                          placeholder="01"
                        />
                      </div>
                      <div className="field">
                        <label>ئۆگىنىش باسقۇچى (Stage)</label>
                        <select
                          value={lessonForm.stage}
                          onChange={(e) =>
                            setLessonForm({
                              ...lessonForm,
                              stage: e.target.value as LessonRecord['stage'],
                            })
                          }
                        >
                          <option value="Beginner">Beginner — دەسلەپكى</option>
                          <option value="Foundation">Foundation — ئاساس</option>
                          <option value="Intermediate">Intermediate — ئوتتۇرا</option>
                          <option value="Advanced">Advanced — يۇقىرى</option>
                          <option value="Professional">Professional — كەسپىي</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-grid">
                      <div className="field">
                        <label>دەرس ماۋزۇسى</label>
                        <input
                          value={lessonForm.title}
                          onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                          placeholder="مەسىلەن: Few-shot مىساللىرى بىلەن سۈپەت ئاشۇرۇش"
                        />
                      </div>
                      <div className="field">
                        <label>مۆلچەردىكى ۋاقىت</label>
                        <input
                          value={lessonForm.duration}
                          onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })}
                          placeholder="20–30 داقىقە"
                        />
                      </div>
                    </div>

                    <div className="field">
                      <label>قىسقىچە چۈشەندۈرۈش</label>
                      <input
                        value={lessonForm.summary}
                        onChange={(e) => setLessonForm({ ...lessonForm, summary: e.target.value })}
                        placeholder="ئوقۇغۇچى ئېرىشىدىغان ئاساسىي كۆرسەتمە..."
                      />
                    </div>

                    <div className="field">
                      <label>تولۇق دەرس مەزمۇنى (Markdown قوللايدۇ)</label>
                      <textarea
                        rows={6}
                        value={lessonForm.content}
                        onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
                        placeholder="دەرسلىك نىشانى، ناچار مىسال، ياخشىلانغان مىسال..."
                      />
                    </div>

                    <div className="form-grid">
                      <div className="field">
                        <label>ئەمەلىي مەشىق تاپشۇرۇقى</label>
                        <textarea
                          rows={3}
                          value={lessonForm.exercise}
                          onChange={(e) => setLessonForm({ ...lessonForm, exercise: e.target.value })}
                          placeholder="ئوقۇغۇچى قىلىدىغان ئەمەلىي ۋەزىپە..."
                        />
                      </div>
                      <div className="field">
                        <label>باھالاش ئۆلچىمى (Rubric)</label>
                        <textarea
                          rows={3}
                          value={lessonForm.rubric}
                          onChange={(e) => setLessonForm({ ...lessonForm, rubric: e.target.value })}
                          placeholder="10 نومۇرلۇق بۆلۈنۈش تەرتىپى..."
                        />
                      </div>
                    </div>

                    <div className="button-row">
                      <button className="primary-button" onClick={handleSaveLesson}>
                        <Save size={16} /> ساقلاش ۋە كۆرۈنمە يۈزگە يوللاش
                      </button>
                      <button className="outline-button" onClick={() => setShowLessonForm(false)}>
                        بىكار قىلىش
                      </button>
                    </div>
                  </div>
                )}

                <div className="panel">
                  <div className="admin-table-container">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>نومۇرى</th>
                          <th>دەرس ماۋزۇسى</th>
                          <th>باسقۇچ</th>
                          <th>ۋاقتى</th>
                          <th>ھالەت</th>
                          <th>باشقۇرۇش مەشغۇلاتلىرى</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lessons.map((l) => (
                          <tr key={l.id}>
                            <td>
                              <code>{l.lessonNumber}</code>
                            </td>
                            <td>
                              <b>{l.title}</b>
                            </td>
                            <td>{l.stage}</td>
                            <td>{l.duration}</td>
                            <td>
                              <span className={`status-badge ${l.status}`}>
                                {l.status === 'published' ? 'ئېلان قىلىنغان' : 'لايىھە'}
                              </span>
                            </td>
                            <td>
                              <div className="action-buttons">
                                <button onClick={() => toggleLessonStatus(l)}>
                                  {l.status === 'published' ? 'توختىتىش' : 'ئېلان قىلىش'}
                                </button>
                                <button onClick={() => openEditLesson(l)}>تەھرىرلەش</button>
                                <button
                                  style={{ color: '#a44834' }}
                                  onClick={() => deleteLesson(l.id)}
                                >
                                  ئۆچۈرۈش
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            )}

            {/* ADMIN SUBMISSIONS & GRADING */}
            {adminPage === 'admin-submissions' && (
              <section className="page-content">
                <div className="section-heading" style={{ marginTop: 0 }}>
                  <div>
                    <h1 style={{ margin: 0, fontSize: '24px', color: '#163b2f' }}>
                      ئوقۇغۇچى تاپشۇرۇقلىرى ۋە باھالاش سەپى
                    </h1>
                    <p>كۆرۈنمە يۈزدىن كەلگەن جاۋابلارنى باھالاپ نەتىجە ۋە مەسلىھەت يوللاڭ.</p>
                  </div>
                </div>

                {/* Grading Panel if opened */}
                {gradingSubmissionId !== null && (
                  <div className="admin-form-modal">
                    <div className="panel-title">
                      <h3>تاپشۇرۇقنى باھالاش ۋە نەتىجىنى كۆرۈنمە يۈزگە قايتۇرۇش</h3>
                      <button className="ghost-button" onClick={() => setGradingSubmissionId(null)}>
                        × تاقاش
                      </button>
                    </div>

                    {(() => {
                      const currentSub = submissions.find((s) => s.id === gradingSubmissionId);
                      if (!currentSub) return null;
                      return (
                        <div>
                          <div style={{ marginBottom: '12px' }}>
                            <span style={{ fontSize: '11px', color: '#97793c' }}>دەرس:</span>
                            <h4 style={{ margin: '3px 0' }}>{currentSub.lessonTitle}</h4>
                          </div>
                          <div style={{ marginBottom: '16px', background: '#f5f2e8', padding: '12px', borderRadius: '8px' }}>
                            <span style={{ fontSize: '11px', color: '#55665d', display: 'block', marginBottom: '4px' }}>
                              ئوقۇغۇچى تاپشۇرغان مەشىق جاۋابى:
                            </span>
                            <div style={{ fontSize: '12px', whiteSpace: 'pre-wrap', color: '#1f3c30' }}>
                              {currentSub.learnerAnswer}
                            </div>
                          </div>

                          <div className="form-grid">
                            <div className="field">
                              <label>نومۇر (0 – 10)</label>
                              <input
                                type="number"
                                min={0}
                                max={10}
                                value={gradingScore}
                                onChange={(e) => setGradingScore(Number(e.target.value))}
                              />
                            </div>
                            <div className="field">
                              <label>ئوقۇتقۇچى تەۋسىيەسى ۋە تۈزىتىش پىكىرى</label>
                              <input
                                value={gradingFeedback}
                                onChange={(e) => setGradingFeedback(e.target.value)}
                                placeholder="ئوقۇغۇچىغا پايدىلىق پىكىر..."
                              />
                            </div>
                          </div>

                          <div className="button-row">
                            <button
                              className="primary-button"
                              onClick={() => submitGrading(gradingSubmissionId)}
                            >
                              <CheckCircle2 size={16} /> باھالاشنى جەزملەش ۋە ئوقۇغۇچىغا يوللاش
                            </button>
                            <button
                              className="outline-button"
                              onClick={() => setGradingSubmissionId(null)}
                            >
                              بىكار قىلىش
                            </button>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                <div className="panel">
                  {submissions.length === 0 ? (
                    <div className="empty-state">
                      <Award size={36} style={{ color: '#d3c299' }} />
                      <b>تېخى تاپشۇرۇق يوق</b>
                      <span>ئوقۇغۇچىلار كۆرۈنمە يۈزدىن مەشىق تاپشۇرغاندا بۇ يەرگە چۈشىدۇ.</span>
                    </div>
                  ) : (
                    <div className="admin-table-container">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>دەرس</th>
                            <th>ئوقۇغۇچى جاۋابى</th>
                            <th>سۇنۇلغان ۋاقىت</th>
                            <th>ھالەت</th>
                            <th>نومۇر</th>
                            <th>مەشغۇلات</th>
                          </tr>
                        </thead>
                        <tbody>
                          {submissions.map((s) => (
                            <tr key={s.id}>
                              <td>
                                <b>{s.lessonTitle}</b>
                              </td>
                              <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {s.learnerAnswer}
                              </td>
                              <td style={{ fontSize: '11px', color: '#77857d' }}>
                                {new Date(s.updatedAt).toLocaleDateString()}
                              </td>
                              <td>
                                <span className={`status-badge ${s.status}`}>
                                  {s.status === 'complete' ? 'باھالاندى' : 'كۈتۈلمەكتە'}
                                </span>
                              </td>
                              <td>
                                <b>{s.score !== undefined ? `${s.score}/10` : '—'}</b>
                              </td>
                              <td>
                                <button
                                  className="primary-button"
                                  style={{ padding: '5px 12px', fontSize: '11px' }}
                                  onClick={() => {
                                    setGradingSubmissionId(s.id || null);
                                    setGradingScore(s.score || 9);
                                    setGradingFeedback(s.feedback || 'مۇنەۋۋەر نەتىجە.');
                                  }}
                                >
                                  {s.status === 'complete' ? 'قايتا باھالاش' : 'نومۇر قويۇش'}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* ADMIN SKILLS */}
            {adminPage === 'admin-skills' && (
              <section className="page-content">
                <div className="section-heading" style={{ marginTop: 0 }}>
                  <div>
                    <h1 style={{ margin: 0, fontSize: '24px', color: '#163b2f' }}>ماھارەت ئامبىرى</h1>
                    <p>كۆرۈنمە يۈز ۋە سىستېمىدىن كەلگەن SKILL بوغچىلىرىنى تەكشۈرۈش خاتىرىسى.</p>
                  </div>
                </div>
                <div className="panel">
                  {skills.length === 0 ? (
                    <p className="muted">تېخى سىستېمىدا ساقلانغان Skill يوق.</p>
                  ) : (
                    <div className="admin-table-container">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>نامى</th>
                            <th>ھۆججەت</th>
                            <th>قۇرۇلما ھالىتى</th>
                            <th>ئەسكەرتىشلەر</th>
                            <th>مەشغۇلات</th>
                          </tr>
                        </thead>
                        <tbody>
                          {skills.map((s) => (
                            <tr key={s.id}>
                              <td>
                                <b>{s.name}</b>
                              </td>
                              <td>
                                <code>{s.fileName}</code>
                              </td>
                              <td>
                                <span className={s.status === 'valid' ? 'valid-label' : 'invalid-label'}>
                                  {s.status === 'valid' ? 'ئۆتتى' : 'خاتالىق بار'}
                                </span>
                              </td>
                              <td style={{ fontSize: '11px', color: '#73837a' }}>{s.notes.join(' · ') || 'نورمال'}</td>
                              <td>
                                <button
                                  className="ghost-button"
                                  onClick={async () => {
                                    if (s.id) {
                                      await db.skills.delete(s.id);
                                      setSkills(await db.skills.toArray());
                                    }
                                  }}
                                >
                                  <Trash2 size={14} /> ئۆچۈرۈش
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* ADMIN PROMPTS */}
            {adminPage === 'admin-prompts' && (
              <section className="page-content">
                <div className="section-heading" style={{ marginTop: 0 }}>
                  <div>
                    <h1 style={{ margin: 0, fontSize: '24px', color: '#163b2f' }}>نەمۇنىلىك Prompt قېلىپلىرى</h1>
                    <p>كۆرۈنمە يۈزدىكى ئىشلەتكۈچىلەر تۈزگەن ۋە سىستېمىدا ساقلانغان بارلىق Prompt لار.</p>
                  </div>
                </div>
                <div className="panel">
                  {savedPrompts.length === 0 ? (
                    <p className="muted">تېخى ساقلانغان Prompt يوق.</p>
                  ) : (
                    <div className="admin-table-container">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>ماۋزۇ</th>
                            <th>Goal</th>
                            <th>Task</th>
                            <th>چىقىرىش شەكلى</th>
                            <th>مەشغۇلات</th>
                          </tr>
                        </thead>
                        <tbody>
                          {savedPrompts.map((p) => (
                            <tr key={p.id}>
                              <td>
                                <b>{p.title}</b>
                              </td>
                              <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {p.goal || '—'}
                              </td>
                              <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {p.task || '—'}
                              </td>
                              <td>{p.outputFormat || 'تېكىست'}</td>
                              <td>
                                <button
                                  className="ghost-button"
                                  onClick={async () => {
                                    if (p.id) {
                                      await db.prompts.delete(p.id);
                                      setSavedPrompts(await db.prompts.toArray());
                                    }
                                  }}
                                >
                                  <Trash2 size={14} /> ئۆچۈرۈش
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* ADMIN SYSTEM & DATA MAINTENANCE */}
            {adminPage === 'admin-system' && (
              <section className="page-content">
                <div className="section-heading" style={{ marginTop: 0 }}>
                  <div>
                    <h1 style={{ margin: 0, fontSize: '24px', color: '#163b2f' }}>
                      سىستېما ۋە سانلىق مەلۇمات مەركىزى
                    </h1>
                    <p>دەرس، مەشىق ۋە سانداننى بىرلەشتۈرۈپ ساقلاش ياكى ئەسلىگە كەلتۈرۈش.</p>
                  </div>
                </div>

                <div className="panel">
                  <div className="panel-title">
                    <div>
                      <h3>پۈتۈن سىستېمىنى تولۇق زاپاسلاش (Full JSON Export)</h3>
                      <p>دەرسلەر، تاپشۇرۇقلار، Prompt ۋە Skill لارنى بىر ھۆججەتتە ساقلايدۇ.</p>
                    </div>
                    <CloudDownload size={20} className="gold-icon" />
                  </div>
                  <div className="button-row">
                    <button className="primary-button" onClick={exportBackup}>
                      پۈتۈن سىستېما زاپاس ھۆججىتىنى چۈشۈرۈش
                    </button>
                    <label className="outline-button file-button">
                      زاپاس ھۆججەتنى قايتا ئەكىرىش
                      <input
                        type="file"
                        accept=".json,application/json"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          e.target.value = '';
                          importBackup(f);
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div className="panel" style={{ borderColor: '#e4cfba' }}>
                  <div className="panel-title">
                    <div>
                      <h3 style={{ color: '#974f26' }}>ئەسلى دەرس پىلانىغا قايتۇرۇش</h3>
                      <p>ئەگەر كۆرۈنمە يۈز ياكى سانداندا مەسىلە كۆرۈلسە، رەسمىي 4 ئاساسىي دەرسكە قايتۇرىدۇ.</p>
                    </div>
                    <RefreshCw size={20} style={{ color: '#974f26' }} />
                  </div>
                  <button className="outline-button" onClick={resetDefaultCurriculum}>
                    رەسمىي دەرسلىكلەرنى ئەسلىگە كەلتۈرۈش
                  </button>
                </div>
              </section>
            )}
          </>
        )}

        <footer className="footer">
          <span>AI LEARNING STUDIO · {viewMode === 'admin' ? 'ADMIN CONSOLE' : 'STUDENT INTERFACE'}</span>
          <span>ئۇيغۇرچە · RTL/LTR · Local-first & IndexedDB Connected</span>
        </footer>
      </main>
    </div>
  );
}

function ToolCard({
  icon,
  tone,
  title,
  description,
  action,
  onClick,
}: {
  icon: React.ReactNode;
  tone: string;
  title: string;
  description: string;
  action: string;
  onClick: () => void;
}) {
  return (
    <button className="tool-card" onClick={onClick}>
      <div className={`tool-icon ${tone}`}>{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
      <span className="tool-action">
        {action}
        <ChevronLeft size={15} className="dir-icon" />
      </span>
    </button>
  );
}

function PageTitle({ eyebrow, title, desc }: { eyebrow: string; title: string; desc: string }) {
  return (
    <div className="page-title">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{desc}</p>
    </div>
  );
}

const rootEl = document.getElementById('root');
if (rootEl) {
  createRoot(rootEl).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
