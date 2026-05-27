const STORAGE_KEY = "class-learning-record-state-v1";
const API_BASE = localStorage.getItem("class-learning-record-api") || "http://localhost:8000/api";

const seedState = {
  session: null,
  route: "dashboard",
  loginMode: "teacher",
  teacher: {
    email: "teacher@class.local",
    name: "국어 선생님",
    role: "teacher",
    permissions: ["2026-2-3"],
  },
  classInfo: {
    id: "2026-2-3",
    year: "2026학년도",
    grade: "2학년",
    name: "3반",
    subject: "국어",
  },
  folders: [
    { id: "folder-unit-2", name: "2단원 토의" },
    { id: "folder-shared", name: "공통 자료" },
  ],
  selectedFolderId: "folder-unit-2",
  selectedDocumentId: "d1",
  students: [
    { id: "s1", number: "01", name: "김민준", tags: ["발표 보완"], evidence: 1, evaluation: "B" },
    { id: "s2", number: "02", name: "이서연", tags: ["쓰기 강점"], evidence: 3, evaluation: "A" },
    { id: "s3", number: "03", name: "박도윤", tags: ["풀이 로그 부족"], evidence: 0, evaluation: "미입력" },
    { id: "s4", number: "04", name: "최하린", tags: ["근거 제시 우수"], evidence: 4, evaluation: "A" },
  ],
  documents: [
    {
      id: "d1",
      title: "2단원 토의 활동 필기",
      folderId: "folder-unit-2",
      fileName: "discussion-notes.pdf",
      uploadedAt: "오늘 09:12",
      status: "검수 대기",
      unit: "2단원. 타당한 근거로 토의하기",
      pages: [
        {
          id: "p1",
          number: 1,
          ocr: "토의에서는 주장과 근거가 분명해야 한다. 상대 의견을 듣고 반박할 때 예의를 지킨다.",
          corrected: "토의에서는 주장과 근거가 분명해야 한다. 상대 의견을 듣고 반박할 때 예의를 지킨다.",
          reviewed: false,
        },
        {
          id: "p2",
          number: 2,
          ocr: "자료를 인용할 때 출처를 밝히고, 근거가 주장과 맞는지 확인한다.",
          corrected: "자료를 인용할 때 출처를 밝히고, 근거가 주장과 맞는지 확인한다.",
          reviewed: false,
        },
      ],
    },
  ],
  standards: [
    { id: "a1", title: "토의에서 타당한 근거를 들어 의견을 제시한다.", score: 74 },
    { id: "a2", title: "글의 구조를 고려하여 핵심 내용을 요약한다.", score: 61 },
    { id: "a3", title: "매체 자료의 관점과 표현 방식을 분석한다.", score: 47 },
  ],
  rubrics: [
    {
      id: "r1",
      standardId: "a1",
      title: "토의 근거 제시",
      levels: [
        { label: "A", text: "주장과 근거가 명확하며 상대 의견을 고려해 조정한다." },
        { label: "B", text: "주장과 근거를 연결하지만 일부 근거의 타당성이 부족하다." },
        { label: "C", text: "주장은 제시하나 근거가 부족하거나 관련성이 약하다." },
      ],
    },
  ],
  recordDrafts: [
    {
      id: "draft1",
      studentId: "s2",
      text: "글의 구조를 파악하고 핵심 내용을 자신의 언어로 정리하는 능력이 돋보이며, 토의 활동에서 타인의 의견을 경청하고 근거를 보완해 말하려는 태도가 안정적으로 나타남.",
      status: "검토 대기",
    },
  ],
  assessments: [
    {
      id: "as1",
      title: "토의와 근거 형성평가",
      code: "KOR-2026-01",
      status: "배포 중",
      standardId: "a1",
      questions: [
        {
          id: "q1",
          type: "choice",
          prompt: "토의에서 타당한 근거가 필요한 까닭으로 가장 알맞은 것은?",
          options: ["주장을 더 설득력 있게 만들기 위해서", "말하는 시간을 줄이기 위해서", "상대 의견을 기록하지 않기 위해서"],
          answer: "주장을 더 설득력 있게 만들기 위해서",
        },
        {
          id: "q2",
          type: "short",
          prompt: "주장과 근거를 연결할 때 확인해야 할 점을 한 문장으로 쓰세요.",
          answer: "근거가 주장과 관련 있고 믿을 만한지 확인한다.",
        },
      ],
    },
  ],
  attempts: [
    {
      id: "at1",
      assessmentId: "as1",
      studentId: "s2",
      studentName: "이서연",
      score: 2,
      total: 2,
      durationSeconds: 194,
      changedAnswers: 1,
      submittedAt: "어제",
      responses: {
        q1: "주장을 더 설득력 있게 만들기 위해서",
        q2: "근거가 주장과 관련 있는지 확인한다.",
      },
      events: ["assessment_started", "answer_changed", "assessment_submitted"],
    },
    {
      id: "at2",
      assessmentId: "as1",
      studentId: "s1",
      studentName: "김민준",
      score: 1,
      total: 2,
      durationSeconds: 283,
      changedAnswers: 3,
      submittedAt: "오늘",
      responses: {
        q1: "말하는 시간을 줄이기 위해서",
        q2: "근거가 주장과 맞는지 확인한다.",
      },
      events: ["assessment_started", "answer_changed", "answer_changed", "assessment_submitted"],
    },
  ],
  studentRuntime: {
    assessmentId: null,
    answers: {},
    changedAnswers: 0,
  },
  auditLogs: [
    { action: "teacher_login", target: "국어 선생님", at: "방금 전" },
    { action: "view_dashboard", target: "2학년 3반", at: "방금 전" },
  ],
};

let state = loadState();
const app = document.querySelector("#app");

window.addEventListener("error", (event) => {
  renderFatalError(event.error || event.message);
});

window.addEventListener("unhandledrejection", (event) => {
  renderFatalError(event.reason);
});

async function apiFetch(path, options = {}) {
  const headers = {
    ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    ...(state.session?.accessToken ? { Authorization: `Bearer ${state.session.accessToken}` } : {}),
    ...(options.headers || {}),
  };
  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!response.ok) {
    const detail = await response.json().catch(() => ({ detail: "API 요청 실패" }));
    throw new Error(detail.detail || "API 요청 실패");
  }
  return response.json();
}

async function loadDashboardFromApi() {
  if (!state.session?.accessToken) return;
  const data = await apiFetch("/dashboard");
  state.teacher = data.teacher;
  state.classInfo = data.classInfo;
  state.students = data.students.map((student) => ({
    id: student.id,
    grade: student.grade || state.classInfo.grade,
    className: student.className || state.classInfo.name,
    number: student.number,
    name: student.name,
    tags: student.tags,
    evidence: student.evidence_count,
    evaluation: student.evaluation,
  }));
  state.documents = data.documents.map((document) => ({
    id: document.id,
    title: document.title,
    folderId: document.folder_id || state.selectedFolderId || state.folders[0]?.id,
    fileName: document.original_filename,
    uploadedAt: document.uploaded_at,
    status: document.status,
    unit: document.unit,
    pages: document.pages || [],
  }));
  state.standards = data.standards;
  state.rubrics = data.rubrics.map((rubric) => ({ id: rubric.id, standardId: rubric.standard_id, title: rubric.title, levels: rubric.levels }));
  state.assessments = data.assessments.map((assessment) => ({
    id: assessment.id,
    title: assessment.title,
    code: assessment.code,
    status: assessment.status,
    standardId: assessment.standard_id,
    questions: assessment.questions,
  }));
  state.attempts = data.attempts.map((attempt) => ({
    id: attempt.id,
    assessmentId: attempt.assessment_id,
    studentId: attempt.student_id,
    studentName: attempt.student_name,
    score: attempt.score,
    total: attempt.total,
    durationSeconds: attempt.duration_seconds,
    changedAnswers: attempt.changed_answers,
    submittedAt: attempt.submitted_at,
    responses: attempt.responses,
    events: attempt.events,
  }));
  state.recordDrafts = data.recordDrafts.map((draft) => ({
    id: draft.id,
    studentId: draft.student_id,
    text: draft.text,
    status: draft.status,
  }));
  saveState();
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return clone(seedState);
  try {
    return mergeState(clone(seedState), JSON.parse(saved));
  } catch (error) {
    console.warn("저장된 데모 상태를 읽지 못해 초기 상태로 복구합니다.", error);
    localStorage.removeItem(STORAGE_KEY);
    return clone(seedState);
  }
}

function mergeState(base, saved) {
  const merged = { ...base, ...saved };
  merged.teacher = { ...base.teacher, ...saved.teacher };
  merged.classInfo = { ...base.classInfo, ...saved.classInfo };
  merged.studentRuntime = { ...base.studentRuntime, ...saved.studentRuntime };
  merged.route = getRouteRenderer(merged.route) ? merged.route : "dashboard";
  merged.folders = Array.isArray(merged.folders) ? merged.folders : base.folders;
  merged.selectedFolderId = merged.selectedFolderId || merged.folders[0]?.id || null;
  merged.students = Array.isArray(merged.students) ? merged.students : base.students;
  merged.documents = Array.isArray(merged.documents) ? merged.documents : base.documents;
  merged.documents = merged.documents.map((document) => ({
    ...document,
    folderId: document.folderId || merged.selectedFolderId || base.folders[0]?.id,
  }));
  merged.selectedDocumentId = merged.selectedDocumentId || merged.documents[0]?.id || null;
  merged.standards = Array.isArray(merged.standards) ? merged.standards : base.standards;
  merged.rubrics = Array.isArray(merged.rubrics) ? merged.rubrics : base.rubrics;
  merged.recordDrafts = Array.isArray(merged.recordDrafts) ? merged.recordDrafts : base.recordDrafts;
  merged.assessments = Array.isArray(merged.assessments) ? merged.assessments : base.assessments;
  merged.attempts = Array.isArray(merged.attempts) ? merged.attempts : base.attempts;
  merged.auditLogs = Array.isArray(merged.auditLogs) ? merged.auditLogs : base.auditLogs;
  merged.students = merged.students.map((student) => ({
    ...student,
    grade: student.grade || base.classInfo.grade,
    className: student.className || base.classInfo.name,
    evidence: student.evidence ?? student.evidence_count ?? 0,
    tags: Array.isArray(student.tags) ? student.tags : [],
  }));
  return merged;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function audit(action, target) {
  state.auditLogs.unshift({ action, target, at: "방금 전" });
  state.auditLogs = state.auditLogs.slice(0, 8);
  saveState();
}

function setRoute(route) {
  state.route = route;
  audit("navigate", route);
  saveState();
  render();
}

function setLoginMode(mode) {
  state.loginMode = mode;
  render();
}

async function teacherLogin(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  state.session = {
    type: "teacher",
    email: form.get("email"),
    name: state.teacher.name,
    classId: state.classInfo.id,
  };
  state.route = "dashboard";
  audit("teacher_login", state.teacher.name);
  render();

  try {
    const login = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
    });
    state.session = {
      type: "teacher",
      email: login.email,
      name: login.display_name,
      accessToken: login.access_token,
      classId: state.classInfo.id,
    };
    await loadDashboardFromApi();
    render();
  } catch (error) {
    console.warn("API 연결 없이 데모 모드로 로그인합니다.", error);
  }
}

async function studentJoin(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  let assessment = state.assessments.find((item) => item.code === form.get("code"));
  let startedAtMs = Date.now();
  try {
    const session = await apiFetch("/student-sessions", {
      method: "POST",
      body: JSON.stringify({ code: form.get("code"), student_name: form.get("studentName") }),
    });
    assessment = session.assessment;
    startedAtMs = session.started_at_ms;
  } catch (error) {
    console.warn("API 연결 없이 데모 학생 세션을 사용합니다.", error);
  }
  if (!assessment) {
    alert("접속 코드를 확인해 주세요.");
    return;
  }
  state.session = {
    type: "student",
    code: form.get("code"),
    name: form.get("studentName"),
  };
  state.studentRuntime = {
    assessmentId: assessment.id,
    answers: {},
    changedAnswers: 0,
    startedAtMs,
  };
  if (!state.assessments.some((item) => item.id === assessment.id)) {
    state.assessments.push({ ...assessment, code: form.get("code"), status: "배포 중" });
  }
  audit("student_join", form.get("code"));
  saveState();
  renderStudentAssessment();
}

function logout() {
  state.session = null;
  saveState();
  render();
}

async function addStudent(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const name = form.get("name").trim();
  if (!name) return;
  const grade = form.get("grade").trim() || state.classInfo.grade;
  const className = form.get("className").trim() || state.classInfo.name;
  let student = {
    id: `s${Date.now()}`,
    grade,
    className,
    number: form.get("number").trim(),
    name,
    tags: ["관찰 필요"],
    evidence: 0,
    evaluation: "미입력",
  };
  try {
    const saved = await apiFetch("/students", {
      method: "POST",
      body: JSON.stringify({ class_id: state.classInfo.id, number: student.number, name: student.name, tag: student.tags[0] }),
    });
    student = { id: saved.id, grade, className, number: saved.number, name: saved.name, tags: saved.tags || student.tags, evidence: saved.evidence_count, evaluation: saved.evaluation };
  } catch (error) {
    console.warn("학생을 브라우저 저장소에만 추가합니다.", error);
  }
  state.students.push(student);
  audit("create_student", name);
  saveState();
  render();
}

async function addDocument(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const file = form.get("pdf");
  const title = form.get("title").trim() || file?.name || "새 수업 자료";
  const folderId = form.get("folderId") || state.selectedFolderId || state.folders[0]?.id;
  let document = {
    id: `d${Date.now()}`,
    title,
    folderId,
    fileName: file?.name || "uploaded-note.pdf",
    uploadedAt: "방금 전",
    status: "검수 대기",
    unit: form.get("unit").trim() || "단원 미지정",
    pages: [
      {
        id: `p${Date.now()}`,
        number: 1,
        ocr: "OCR 처리 예시: 학생 필기에서 추출된 문장을 이곳에서 확인합니다.",
        corrected: "OCR 처리 예시: 학생 필기에서 추출된 문장을 이곳에서 확인합니다.",
        reviewed: false,
      },
    ],
  };
  try {
    const upload = new FormData();
    upload.set("title", title);
    upload.set("unit", form.get("unit").trim() || "단원 미지정");
    upload.set("class_id", state.classInfo.id);
    upload.set("folder_id", folderId);
    upload.set("file", file);
    const saved = await apiFetch("/documents", { method: "POST", body: upload });
    document = { ...document, ...saved, folderId: saved.folder_id || folderId };
  } catch (error) {
    console.warn("PDF를 브라우저 저장소에만 등록합니다.", error);
  }
  state.documents.unshift(document);
  state.selectedFolderId = folderId;
  state.selectedDocumentId = document.id;
  audit("upload_document", title);
  saveState();
  render();
}

function addFolder(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const name = form.get("folderName").trim();
  if (!name) return;
  const folder = { id: `folder-${Date.now()}`, name };
  state.folders.push(folder);
  state.selectedFolderId = folder.id;
  state.selectedDocumentId = null;
  audit("create_folder", name);
  saveState();
  render();
}

function selectFolder(folderId) {
  state.selectedFolderId = folderId;
  const firstDocument = state.documents.find((document) => document.folderId === folderId);
  state.selectedDocumentId = firstDocument?.id || null;
  saveState();
  render();
}

function selectDocument(documentId) {
  const document = state.documents.find((item) => item.id === documentId);
  if (!document) return;
  state.selectedDocumentId = document.id;
  state.selectedFolderId = document.folderId;
  saveState();
  render();
}

function updateOcr(pageId, value) {
  for (const document of state.documents) {
    const page = document.pages.find((item) => item.id === pageId);
    if (page) page.corrected = value;
  }
  saveState();
}

function approvePage(documentId, pageId) {
  const document = state.documents.find((item) => item.id === documentId);
  const page = document.pages.find((item) => item.id === pageId);
  page.reviewed = true;
  document.status = document.pages.every((item) => item.reviewed) ? "검수 완료" : "검수 대기";
  if (state.session?.accessToken) {
    apiFetch(`/documents/${documentId}/pages/${pageId}`, {
      method: "PATCH",
      body: JSON.stringify({ corrected_text: page.corrected }),
    }).catch((error) => console.warn("OCR 검수 결과를 브라우저 저장소에만 저장합니다.", error));
  }
  audit("review_ocr_page", `${document.title} ${page.number}쪽`);
  saveState();
  render();
}

async function addRubric(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  let rubric = {
    id: `r${Date.now()}`,
    standardId: form.get("standardId"),
    title: form.get("title").trim(),
    levels: [
      { label: "A", text: form.get("levelA").trim() },
      { label: "B", text: form.get("levelB").trim() },
      { label: "C", text: form.get("levelC").trim() },
    ],
  };
  try {
    const saved = await apiFetch("/rubrics", {
      method: "POST",
      body: JSON.stringify({ standard_id: rubric.standardId, title: rubric.title, levels: rubric.levels }),
    });
    rubric = { id: saved.id, standardId: saved.standard_id, title: saved.title, levels: saved.levels };
  } catch (error) {
    console.warn("평가 기준을 브라우저 저장소에만 저장합니다.", error);
  }
  state.rubrics.push(rubric);
  audit("create_rubric", form.get("title"));
  saveState();
  render();
}

function updateEvaluation(studentId, level) {
  const student = state.students.find((item) => item.id === studentId);
  student.evaluation = level;
  student.evidence += student.evidence === 0 ? 1 : 0;
  if (state.session?.accessToken) {
    apiFetch("/evaluations", {
      method: "POST",
      body: JSON.stringify({ student_id: studentId, rubric_level: level }),
    }).catch((error) => console.warn("평가를 브라우저 저장소에만 저장합니다.", error));
  }
  audit("update_evaluation", student.name);
  saveState();
  render();
}

async function addAssessment(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  let assessment = {
    id: `as${Date.now()}`,
    title: form.get("title").trim(),
    code: form.get("code").trim(),
    status: "배포 중",
    standardId: form.get("standardId"),
    questions: [
      {
        id: `q${Date.now()}`,
        type: "choice",
        prompt: form.get("prompt").trim(),
        options: [form.get("option1").trim(), form.get("option2").trim(), form.get("option3").trim()],
        answer: form.get("option1").trim(),
      },
    ],
  };
  try {
    const saved = await apiFetch("/assessments", {
      method: "POST",
      body: JSON.stringify({
        class_id: state.classInfo.id,
        standard_id: assessment.standardId,
        title: assessment.title,
        code: assessment.code,
        questions: assessment.questions,
      }),
    });
    assessment = { id: saved.id, title: saved.title, code: saved.code, status: saved.status, standardId: assessment.standardId, questions: saved.questions };
  } catch (error) {
    console.warn("평가를 브라우저 저장소에만 배포합니다.", error);
  }
  state.assessments.unshift(assessment);
  audit("create_assessment", form.get("title"));
  saveState();
  render();
}

function updateStudentAnswer(questionId, answer) {
  if (state.studentRuntime.answers[questionId] && state.studentRuntime.answers[questionId] !== answer) {
    state.studentRuntime.changedAnswers += 1;
  }
  state.studentRuntime.answers[questionId] = answer;
  saveState();
}

async function submitStudentAttempt() {
  const assessment = state.assessments.find((item) => item.id === state.studentRuntime.assessmentId);
  const student = state.students.find((item) => item.name === state.session.name) || state.students[0];
  const score = assessment.questions.reduce((sum, question) => {
    const response = state.studentRuntime.answers[question.id] || "";
    return sum + (question.type === "choice" && response === question.answer ? 1 : response.trim() ? 1 : 0);
  }, 0);

  let attempt = {
    id: `at${Date.now()}`,
    assessmentId: assessment.id,
    studentId: student.id,
    studentName: state.session.name,
    score,
    total: assessment.questions.length,
    durationSeconds: 210 + state.studentRuntime.changedAnswers * 18,
    changedAnswers: state.studentRuntime.changedAnswers,
    submittedAt: "방금 전",
    responses: { ...state.studentRuntime.answers },
    events: ["assessment_started", "answer_changed", "assessment_submitted"],
  };
  try {
    const saved = await apiFetch("/attempts/submit", {
      method: "POST",
      body: JSON.stringify({
        assessment_id: assessment.id,
        student_name: state.session.name,
        responses: state.studentRuntime.answers,
        changed_answers: state.studentRuntime.changedAnswers,
        started_at_ms: state.studentRuntime.startedAtMs,
      }),
    });
    attempt = { ...attempt, id: saved.id, score: saved.score, total: saved.total, durationSeconds: saved.duration_seconds, changedAnswers: saved.changed_answers };
  } catch (error) {
    console.warn("풀이 결과를 브라우저 저장소에만 저장합니다.", error);
  }

  state.attempts.unshift(attempt);
  audit("submit_assessment", `${state.session.name} · ${assessment.title}`);
  alert("제출되었습니다. 선생님 화면의 분석실에 기록됩니다.");
  logout();
}

function approveDraft(id) {
  const draft = state.recordDrafts.find((item) => item.id === id);
  draft.status = "승인 완료";
  audit("approve_record_draft", getStudent(draft.studentId).name);
  saveState();
  render();
}

async function generateDraft(studentId) {
  const student = getStudent(studentId);
  if (state.session?.accessToken) {
    try {
      const saved = await apiFetch("/record-drafts", {
        method: "POST",
        body: JSON.stringify({ student_id: studentId, class_id: state.classInfo.id }),
      });
      state.recordDrafts.unshift({
        id: saved.id,
        studentId: saved.student_id,
        text: saved.text,
        status: saved.status,
      });
      audit("generate_record_draft", student.name);
      saveState();
      render();
      return;
    } catch (error) {
      console.warn("생기부 문구를 브라우저에서 생성합니다.", error);
    }
  }
  const attempt = state.attempts.find((item) => item.studentId === studentId);
  const performance = attempt ? `${attempt.score}/${attempt.total}점의 풀이 결과와 ${attempt.changedAnswers}회의 답안 수정 기록` : "수업 활동 기록";
  const text = `${student.name}은 ${student.tags.join(", ")} 특성이 관찰되며, ${performance}을 바탕으로 자신의 이해를 점검하려는 태도를 보임. 평가 과정에서 드러난 강점과 보완점을 다음 활동에 반영하려는 성장이 기대됨.`;
  state.recordDrafts.unshift({
    id: `draft${Date.now()}`,
    studentId,
    text,
    status: "검토 대기",
  });
  audit("generate_record_draft", student.name);
  saveState();
  render();
}

function getStudent(id) {
  return state.students.find((student) => student.id === id);
}

function render() {
  try {
    if (!state.session) {
      renderLogin();
      return;
    }

    if (state.session.type === "student") {
      renderStudentAssessment();
      return;
    }

    app.innerHTML = `
      <section class="dashboard" aria-label="교사용 웹앱">
        ${renderSidebar()}
        <div class="workspace">
          ${renderTopbar()}
          ${renderRoute()}
        </div>
      </section>
    `;
    bindRouteEvents();
  } catch (error) {
    renderFatalError(error);
  }
}

function renderLogin() {
  const isTeacher = state.loginMode === "teacher";
  app.innerHTML = `
    <section class="auth-panel" aria-label="로그인">
      <div class="brand">
        <p class="eyebrow">Class Learning Record</p>
        <h1>국어수업 성장기록</h1>
        <p>수업 자료, 평가 근거, 학생별 성장 기록을 웹브라우저에서 관리합니다.</p>
      </div>
      <div class="login-card">
        <div class="mode-tabs" role="tablist" aria-label="로그인 방식">
          <button class="mode-tab ${isTeacher ? "active" : ""}" type="button" data-login-mode="teacher">교사 로그인</button>
          <button class="mode-tab ${!isTeacher ? "active" : ""}" type="button" data-login-mode="student">학생 접속</button>
        </div>
        <form class="login-form ${isTeacher ? "" : "hidden"}" id="teacherLogin">
          <label>이메일<input type="email" name="email" value="${state.teacher.email}" autocomplete="email" /></label>
          <label>비밀번호<input type="password" name="password" value="class-record" autocomplete="current-password" /></label>
          <button class="primary-button" type="submit">대시보드 열기</button>
          <p class="helper-text">교사는 이메일로 로그인하고, 배정된 반과 학년도 자료만 볼 수 있습니다.</p>
        </form>
        <form class="login-form ${isTeacher ? "hidden" : ""}" id="studentJoin">
          <label>접속 코드<input type="text" name="code" value="KOR-2026-01" autocomplete="one-time-code" /></label>
          <label>이름<input type="text" name="studentName" value="김민준" autocomplete="name" /></label>
          <button class="primary-button" type="submit">문제 풀이 입장</button>
          <p class="helper-text">학생은 교사가 배포한 코드로 배정된 평가에만 접근합니다.</p>
        </form>
      </div>
    </section>
  `;

  document.querySelectorAll("[data-login-mode]").forEach((button) => {
    button.addEventListener("click", () => setLoginMode(button.dataset.loginMode));
  });
  document.querySelector("#teacherLogin").addEventListener("submit", teacherLogin);
  document.querySelector("#studentJoin").addEventListener("submit", studentJoin);
}

function renderSidebar() {
  const nav = [
    ["dashboard", "대시보드"],
    ["classes", "반/학생 관리"],
    ["documents", "PDF 자료함"],
    ["rubrics", "평가 기준"],
    ["records", "학생 기록 카드"],
    ["assessments", "평가 배포"],
    ["analytics", "분석실"],
    ["drafts", "생기부 문구"],
    ["audit", "접근 로그"],
  ];

  return `
    <aside class="sidebar">
      <div class="sidebar-brand">
        <span class="mark">국</span>
        <div><strong>국어수업 성장기록</strong><small>${state.classInfo.year} ${state.classInfo.grade} ${state.classInfo.subject}</small></div>
      </div>
      <nav class="nav-list" aria-label="교사용 메뉴">
        ${nav.map(([route, label]) => `<button class="${state.route === route ? "active" : ""}" type="button" data-route="${route}">${label}</button>`).join("")}
      </nav>
      <div class="security-note"><strong>보안 상태</strong><span>교사 이메일 로그인 · 학생 접속 코드 · 감사 로그 기록 중</span></div>
    </aside>
  `;
}

function renderTopbar() {
  const titles = {
    dashboard: "오늘의 수업 기록 현황",
    classes: "반과 학생 명단 관리",
    documents: "PDF 업로드와 OCR 검수",
    rubrics: "성취기준과 평가 기준표",
    records: "학생별 평가 근거와 성장 기록",
    assessments: "학생용 문제 배포",
    analytics: "성취도와 풀이 패턴 분석",
    drafts: "생활기록부 문구 초안",
    audit: "민감 자료 접근 로그",
  };
  const title = titles[state.route];
  return `
    <header class="topbar">
      <div><h2>${title}</h2></div>
      <div class="topbar-actions">
        <span class="user-chip">${state.session.email}</span>
        <button class="ghost-button" type="button" data-action="logout">로그아웃</button>
      </div>
    </header>
  `;
}

function renderRoute() {
  return getRouteRenderer(state.route)();
}

function getRouteRenderer(route) {
  const routes = {
    dashboard: renderDashboard,
    classes: renderClasses,
    documents: renderDocuments,
    rubrics: renderRubrics,
    records: renderRecords,
    assessments: renderAssessments,
    analytics: renderAnalytics,
    drafts: renderDrafts,
    audit: renderAudit,
  };
  return routes[route];
}

function renderFatalError(error) {
  const message = error?.message || String(error || "알 수 없는 오류");
  app.innerHTML = `
    <section class="student-shell">
      <article class="student-assessment">
        <p class="eyebrow">Preview Recovery</p>
        <h1>미리보기를 다시 열 수 있습니다</h1>
        <p>브라우저에 남아 있던 이전 데모 데이터 때문에 화면 초기화가 멈췄을 수 있습니다.</p>
        <pre class="error-box">${escapeHtml(message)}</pre>
        <button class="primary-button" type="button" id="resetPreview">데모 데이터 초기화</button>
      </article>
    </section>
  `;
  document.querySelector("#resetPreview")?.addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEY);
    state = clone(seedState);
    render();
  });
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]);
}

function renderDashboard() {
  const pendingPages = state.documents.flatMap((doc) => doc.pages).filter((page) => !page.reviewed).length;
  const completeEvaluations = state.students.filter((student) => student.evaluation !== "미입력").length;
  return `
    <section class="summary-grid" aria-label="핵심 지표">
      ${metric("검수 대기 OCR", pendingPages, "PDF 페이지 기준")}
      ${metric("평가 입력률", `${Math.round((completeEvaluations / state.students.length) * 100)}%`, `${state.classInfo.grade} ${state.classInfo.name}`)}
      ${metric("문구 초안 대기", state.recordDrafts.filter((draft) => draft.status !== "승인 완료").length, "교사 승인 필요")}
      ${metric("풀이 제출", state.attempts.length, "학생용 평가 기록")}
    </section>
    <section class="main-grid">
      <article class="panel wide">
        <div class="panel-header"><div><h3>처리할 일</h3><p>실제 데이터와 연결된 우선순위입니다.</p></div></div>
        <div class="task-list">
          ${state.documents.map((doc) => task("PDF", doc.title, `${doc.uploadedAt} · ${doc.status}`, "documents")).join("")}
          ${state.students.filter((student) => student.evaluation === "미입력").map((student) => task("평가", `${student.name} 평가 입력 필요`, "루브릭 기준 선택 전", "records")).join("")}
          ${state.assessments.map((assessment) => task("문제", `${assessment.title} 배포`, `접속 코드 ${assessment.code}`, "assessments")).join("")}
          ${state.recordDrafts.map((draft) => task("문구", `${getStudent(draft.studentId).name} 생활기록부 문구`, draft.status, "drafts")).join("")}
        </div>
      </article>
      <article class="panel">
        <div class="panel-header"><div><h3>성취기준 흐름</h3><p>반 전체의 최근 성취 신호입니다.</p></div></div>
        <div class="progress-list">
          ${state.standards.map((standard) => `<label><span>${standard.title}</span><progress max="100" value="${standard.score}"></progress></label>`).join("")}
        </div>
      </article>
    </section>
  `;
}

function renderAssessments() {
  return `
    <section class="two-column">
      <article class="panel">
        <div class="panel-header"><div><h3>학생용 평가 만들기</h3><p>접속 코드를 배포하면 학생이 브라우저에서 풉니다.</p></div></div>
        <form class="form-grid" id="assessmentForm">
          <label>평가명<input name="title" value="새 형성평가" /></label>
          <label>접속 코드<input name="code" value="KOR-${new Date().getFullYear()}-${state.assessments.length + 1}" /></label>
          <label>성취기준<select name="standardId">${state.standards.map((s) => `<option value="${s.id}">${s.title}</option>`).join("")}</select></label>
          <label>문항<input name="prompt" value="글에서 주장을 뒷받침하는 근거를 찾는 방법은?" /></label>
          <label>정답 선택지<input name="option1" value="주장과 관련 있고 믿을 만한 자료인지 확인한다." /></label>
          <label>오답 선택지 1<input name="option2" value="가장 긴 문장을 근거로 고른다." /></label>
          <label>오답 선택지 2<input name="option3" value="처음 나온 문장을 무조건 근거로 고른다." /></label>
          <button class="primary-button" type="submit">평가 배포</button>
        </form>
      </article>
      <article class="panel">
        <div class="panel-header"><div><h3>배포된 평가</h3><p>학생 접속 코드를 확인합니다.</p></div></div>
        <div class="table-list">
          ${state.assessments.map((assessment) => `<div class="table-row"><strong>${assessment.title}</strong><span>코드 ${assessment.code} · 문항 ${assessment.questions.length}개</span><em>${assessment.status}</em></div>`).join("")}
        </div>
      </article>
    </section>
  `;
}

function renderAnalytics() {
  const attempts = state.attempts;
  const avgScore = attempts.length ? attempts.reduce((sum, item) => sum + item.score / item.total, 0) / attempts.length : 0;
  const avgTime = attempts.length ? Math.round(attempts.reduce((sum, item) => sum + item.durationSeconds, 0) / attempts.length) : 0;
  const changes = attempts.reduce((sum, item) => sum + item.changedAnswers, 0);
  return `
    <section class="summary-grid">
      ${metric("평균 정답률", `${Math.round(avgScore * 100)}%`, "제출된 풀이 기준")}
      ${metric("평균 풀이 시간", `${avgTime}초`, "학생별 제출 로그")}
      ${metric("답안 수정", changes, "선택 변경 누적")}
      ${metric("분석 알고리즘", "v0.1", "규칙 기반 초안")}
    </section>
    <section class="main-grid">
      <article class="panel wide">
        <div class="panel-header"><div><h3>학생별 풀이 패턴</h3><p>정답률, 시간, 답안 수정 횟수를 함께 봅니다.</p></div></div>
        <div class="table-list">
          ${attempts.map((attempt) => `<div class="table-row"><strong>${attempt.studentName}</strong><span>${attempt.score}/${attempt.total}점 · ${attempt.durationSeconds}초 · 수정 ${attempt.changedAnswers}회</span><em>${attempt.submittedAt}</em></div>`).join("")}
        </div>
      </article>
      <article class="panel">
        <div class="panel-header"><div><h3>분석 메모</h3><p>교사와 함께 알고리즘으로 발전시킬 기준입니다.</p></div></div>
        <div class="insight-grid single">
          <div><strong>오답 집중</strong><span>근거의 타당성을 묻는 문항에서 선택지 변경이 많습니다.</span></div>
          <div><strong>관찰 신호</strong><span>수정 횟수가 많은 학생은 개념 혼동 또는 신중한 검토 가능성을 함께 봅니다.</span></div>
          <div><strong>다음 수업</strong><span>주장-근거 연결을 짧은 재풀이 활동으로 확인합니다.</span></div>
        </div>
      </article>
    </section>
  `;
}

function renderClasses() {
  return `
    <section class="two-column">
      <article class="panel">
        <div class="panel-header"><div><h3>${state.classInfo.year}</h3><p>학년, 반, 번호, 이름을 등록합니다.</p></div></div>
        <form class="form-grid" id="studentForm">
          <label>학년<input name="grade" placeholder="예: 2학년" value="${state.classInfo.grade}" /></label>
          <label>반<input name="className" placeholder="예: 3반" value="${state.classInfo.name}" /></label>
          <label>번호<input name="number" placeholder="05" /></label>
          <label>이름<input name="name" placeholder="학생 이름" /></label>
          <button class="primary-button" type="submit">학생 추가</button>
        </form>
      </article>
      <article class="panel">
        <div class="panel-header"><div><h3>학생 명단</h3><p>학생별 기록 카드와 평가에 연결됩니다.</p></div></div>
        <div class="table-list">
          ${state.students.map((student) => `<div class="table-row"><strong>${student.grade || state.classInfo.grade} ${student.className || state.classInfo.name} ${student.number}. ${student.name}</strong><span>등록 완료</span><em>${student.evaluation}</em></div>`).join("")}
        </div>
      </article>
    </section>
  `;
}

function renderDocuments() {
  const selectedFolder = state.folders.find((folder) => folder.id === state.selectedFolderId) || state.folders[0];
  const folderDocuments = state.documents.filter((document) => document.folderId === selectedFolder?.id);
  const selectedDocument = folderDocuments.find((document) => document.id === state.selectedDocumentId) || folderDocuments[0] || null;
  return `
    <section class="document-shell">
      <aside class="panel document-library">
        <div class="panel-header"><div><h3>PDF 자료함</h3><p>폴더를 만들고 파일을 관리합니다.</p></div></div>
        <form class="folder-form" id="folderForm">
          <input name="folderName" placeholder="새 폴더 이름" />
          <button class="ghost-button compact" type="submit">폴더 만들기</button>
        </form>
        <div class="folder-list" aria-label="PDF 폴더">
          ${state.folders.map((folder) => `<button class="${folder.id === selectedFolder?.id ? "active" : ""}" type="button" data-folder="${folder.id}"><span>폴더</span><strong>${folder.name}</strong><em>${state.documents.filter((document) => document.folderId === folder.id).length}</em></button>`).join("")}
        </div>
        <form class="form-grid" id="documentForm">
          <input type="hidden" name="folderId" value="${selectedFolder?.id || ""}" />
          <label>자료 제목<input name="title" placeholder="예: 3단원 설명문 필기" /></label>
          <label>단원<input name="unit" placeholder="예: 3단원. 설명하는 글" /></label>
          <label>PDF 파일<input name="pdf" type="file" accept="application/pdf" /></label>
          <button class="primary-button" type="submit">업로드 등록</button>
        </form>
        <div class="file-list" aria-label="PDF 파일">
          ${folderDocuments.length ? folderDocuments.map((document) => `<button class="${document.id === selectedDocument?.id ? "active" : ""}" type="button" data-document="${document.id}"><strong>${document.title}</strong><span>${document.fileName}</span><em>${document.status}</em></button>`).join("") : `<p class="empty-state">이 폴더에 등록된 PDF가 없습니다.</p>`}
        </div>
      </aside>
      <div class="document-review-stage">
        ${selectedDocument ? renderDocumentReview(selectedDocument) : `<article class="panel"><div class="panel-header"><div><h3>검수할 파일 없음</h3><p>왼쪽 자료함에서 PDF를 업로드하거나 선택하세요.</p></div></div></article>`}
      </div>
    </section>
  `;
}

function renderDocumentReview(document) {
  return `
    <section class="pdf-ocr-split">
      <article class="panel pdf-preview-panel">
        <div class="panel-header"><div><h3>PDF 미리보기</h3><p>${document.fileName} · ${document.status}</p></div></div>
        <div class="pdf-viewer" aria-label="${document.title} PDF 미리보기">
          ${document.pages.map((page) => `
            <section class="pdf-page">
              <div class="pdf-page-header"><strong>${document.title}</strong><span>${page.number}쪽</span></div>
              <p>${escapeHtml(page.ocr || page.corrected)}</p>
            </section>
          `).join("")}
        </div>
      </article>
      <article class="panel ocr-panel">
        <div class="panel-header"><div><h3>OCR 검수</h3><p>PDF를 보면서 오른쪽 텍스트를 수정합니다.</p></div></div>
        <div class="ocr-page-list">
          ${document.pages.map((page) => `
            <div class="ocr-page-card">
              <label>OCR ${page.number}쪽
                <textarea data-ocr-page="${page.id}" rows="7">${page.corrected}</textarea>
              </label>
              <button class="ghost-button" type="button" data-review="${document.id}:${page.id}">${page.reviewed ? "검수 완료됨" : "이 페이지 검수 완료"}</button>
            </div>
          `).join("")}
        </div>
      </article>
    </section>
  `;
}

function renderRubrics() {
  return `
    <section class="two-column">
      <article class="panel">
        <div class="panel-header"><div><h3>평가 기준표 추가</h3><p>성취기준별 A/B/C 수준 설명을 관리합니다.</p></div></div>
        <form class="form-grid" id="rubricForm">
          <label>성취기준<select name="standardId">${state.standards.map((s) => `<option value="${s.id}">${s.title}</option>`).join("")}</select></label>
          <label>기준표 이름<input name="title" value="근거 제시 평가" /></label>
          <label>A 수준<textarea name="levelA" rows="2">타당한 근거를 들어 주장을 분명하게 제시한다.</textarea></label>
          <label>B 수준<textarea name="levelB" rows="2">주장과 근거를 제시하나 일부 연결이 약하다.</textarea></label>
          <label>C 수준<textarea name="levelC" rows="2">주장은 있으나 근거가 부족하다.</textarea></label>
          <button class="primary-button" type="submit">평가 기준 저장</button>
        </form>
      </article>
      <article class="panel">
        <div class="panel-header"><div><h3>등록된 평가 기준</h3><p>학생 기록 카드에서 바로 사용합니다.</p></div></div>
        <div class="rubric-list">
          ${state.rubrics.map((rubric) => `<div class="rubric-card"><strong>${rubric.title}</strong>${rubric.levels.map((level) => `<p><b>${level.label}</b> ${level.text}</p>`).join("")}</div>`).join("")}
        </div>
      </article>
    </section>
  `;
}

function renderRecords() {
  return `
    <section class="record-grid">
      ${state.students.map((student) => `
        <article class="panel student-card">
          <div class="panel-header"><div><h3>${student.number}. ${student.name}</h3><p>${student.tags.join(", ")}</p></div><strong>${student.evaluation}</strong></div>
          <div class="evidence-line"><span>연결 근거</span><b>${student.evidence}건</b></div>
          <div class="segmented">
            ${["A", "B", "C"].map((level) => `<button class="${student.evaluation === level ? "active" : ""}" type="button" data-eval="${student.id}:${level}">${level}</button>`).join("")}
          </div>
          <p class="helper-text">평가를 선택하면 근거 기록과 감사 로그가 함께 갱신됩니다.</p>
          <button class="ghost-button" type="button" data-generate-draft="${student.id}">문구 초안 생성</button>
        </article>
      `).join("")}
    </section>
  `;
}

function renderDrafts() {
  return `
    <section class="panel">
      <div class="panel-header"><div><h3>생활기록부 문구 초안</h3><p>AI 초안은 교사 승인 전까지 공식 기록이 아닙니다.</p></div></div>
      <div class="draft-list">
        ${state.recordDrafts.map((draft) => `
          <article class="draft-card">
            <div><strong>${getStudent(draft.studentId).name}</strong><span>${draft.status}</span></div>
            <textarea rows="4">${draft.text}</textarea>
            <button class="primary-button compact" type="button" data-approve-draft="${draft.id}">승인</button>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderAudit() {
  return `
    <section class="panel">
      <div class="panel-header"><div><h3>접근 로그</h3><p>민감 자료 접근과 주요 변경이 기록됩니다.</p></div></div>
      <div class="table-list">
        ${state.auditLogs.map((log) => `<div class="table-row"><strong>${log.action}</strong><span>${log.target}</span><em>${log.at}</em></div>`).join("")}
      </div>
    </section>
  `;
}

function renderStudentAssessment() {
  const assessment = state.assessments.find((item) => item.id === state.studentRuntime.assessmentId);
  if (!assessment) {
    logout();
    return;
  }
  app.innerHTML = `
    <section class="student-shell">
      <article class="student-assessment">
        <p class="eyebrow">Student Assessment</p>
        <h1>${state.session.name} 학생</h1>
        <p>${assessment.title} · 접속 코드 ${state.session.code}</p>
        ${assessment.questions.map((question, index) => renderStudentQuestion(question, index)).join("")}
        <button class="primary-button" type="button" data-submit-attempt>제출하기</button>
        <button class="ghost-button" type="button" onclick="logout()">나가기</button>
      </article>
    </section>
  `;
  document.querySelectorAll("[data-answer-question]").forEach((input) => {
    input.addEventListener("change", () => updateStudentAnswer(input.dataset.answerQuestion, input.value));
  });
  document.querySelector("[data-submit-attempt]").addEventListener("click", submitStudentAttempt);
}

function renderStudentQuestion(question, index) {
  if (question.type === "choice") {
    return `
      <div class="question-box">
        <strong>${index + 1}. ${question.prompt}</strong>
        ${question.options.map((option) => `<label><input type="radio" name="${question.id}" value="${option}" data-answer-question="${question.id}" /> ${option}</label>`).join("")}
      </div>
    `;
  }

  return `
    <div class="question-box">
      <strong>${index + 1}. ${question.prompt}</strong>
      <textarea rows="4" data-answer-question="${question.id}" placeholder="답을 입력하세요."></textarea>
    </div>
  `;
}

function metric(label, value, caption) {
  return `<article class="metric-card"><span>${label}</span><strong>${value}</strong><small>${caption}</small></article>`;
}

function task(badge, title, detail, route) {
  return `<button class="task-row" type="button" data-route="${route}"><span class="task-badge">${badge}</span><span><strong>${title}</strong><small>${detail}</small></span><em>열기</em></button>`;
}

function bindRouteEvents() {
  document.querySelectorAll("[data-route]").forEach((item) => item.addEventListener("click", () => setRoute(item.dataset.route)));
  document.querySelector("[data-action='logout']")?.addEventListener("click", logout);
  document.querySelector("#studentForm")?.addEventListener("submit", addStudent);
  document.querySelector("#folderForm")?.addEventListener("submit", addFolder);
  document.querySelector("#documentForm")?.addEventListener("submit", addDocument);
  document.querySelector("#rubricForm")?.addEventListener("submit", addRubric);
  document.querySelectorAll("[data-ocr-page]").forEach((textarea) => textarea.addEventListener("input", () => updateOcr(textarea.dataset.ocrPage, textarea.value)));
  document.querySelectorAll("[data-review]").forEach((button) => {
    button.addEventListener("click", () => {
      const [documentId, pageId] = button.dataset.review.split(":");
      approvePage(documentId, pageId);
    });
  });
  document.querySelectorAll("[data-folder]").forEach((button) => button.addEventListener("click", () => selectFolder(button.dataset.folder)));
  document.querySelectorAll("[data-document]").forEach((button) => button.addEventListener("click", () => selectDocument(button.dataset.document)));
  document.querySelectorAll("[data-eval]").forEach((button) => {
    button.addEventListener("click", () => {
      const [studentId, level] = button.dataset.eval.split(":");
      updateEvaluation(studentId, level);
    });
  });
  document.querySelectorAll("[data-approve-draft]").forEach((button) => button.addEventListener("click", () => approveDraft(button.dataset.approveDraft)));
  document.querySelectorAll("[data-generate-draft]").forEach((button) => button.addEventListener("click", () => generateDraft(button.dataset.generateDraft)));
  document.querySelector("#assessmentForm")?.addEventListener("submit", addAssessment);
}

render();
