const STORAGE_KEY = "class-learning-record-state-v1";

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
  auditLogs: [
    { action: "teacher_login", target: "국어 선생님", at: "방금 전" },
    { action: "view_dashboard", target: "2학년 3반", at: "방금 전" },
  ],
};

let state = loadState();
const app = document.querySelector("#app");

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return structuredClone(seedState);
  return { ...structuredClone(seedState), ...JSON.parse(saved) };
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

function teacherLogin(event) {
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
}

function studentJoin(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  state.session = {
    type: "student",
    code: form.get("code"),
    name: form.get("studentName"),
  };
  audit("student_join", form.get("code"));
  renderStudentAssessment();
}

function logout() {
  state.session = null;
  saveState();
  render();
}

function addStudent(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const name = form.get("name").trim();
  if (!name) return;
  state.students.push({
    id: `s${Date.now()}`,
    number: form.get("number").trim(),
    name,
    tags: [form.get("tag").trim() || "관찰 필요"],
    evidence: 0,
    evaluation: "미입력",
  });
  audit("create_student", name);
  saveState();
  render();
}

function addDocument(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const file = form.get("pdf");
  const title = form.get("title").trim() || file?.name || "새 수업 자료";
  state.documents.unshift({
    id: `d${Date.now()}`,
    title,
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
  });
  audit("upload_document", title);
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
  audit("review_ocr_page", `${document.title} ${page.number}쪽`);
  saveState();
  render();
}

function addRubric(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  state.rubrics.push({
    id: `r${Date.now()}`,
    standardId: form.get("standardId"),
    title: form.get("title").trim(),
    levels: [
      { label: "A", text: form.get("levelA").trim() },
      { label: "B", text: form.get("levelB").trim() },
      { label: "C", text: form.get("levelC").trim() },
    ],
  });
  audit("create_rubric", form.get("title"));
  saveState();
  render();
}

function updateEvaluation(studentId, level) {
  const student = state.students.find((item) => item.id === studentId);
  student.evaluation = level;
  student.evidence += student.evidence === 0 ? 1 : 0;
  audit("update_evaluation", student.name);
  saveState();
  render();
}

function approveDraft(id) {
  const draft = state.recordDrafts.find((item) => item.id === id);
  draft.status = "승인 완료";
  audit("approve_record_draft", getStudent(draft.studentId).name);
  saveState();
  render();
}

function getStudent(id) {
  return state.students.find((student) => student.id === id);
}

function render() {
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
    dashboard: ["Teacher Dashboard", "오늘의 수업 기록 현황"],
    classes: ["Class Management", "반과 학생 명단 관리"],
    documents: ["Document Review", "PDF 업로드와 OCR 검수"],
    rubrics: ["Rubrics", "성취기준과 평가 기준표"],
    records: ["Student Records", "학생별 평가 근거와 성장 기록"],
    drafts: ["Record Drafts", "생활기록부 문구 초안"],
    audit: ["Security Audit", "민감 자료 접근 로그"],
  };
  const [eyebrow, title] = titles[state.route];
  return `
    <header class="topbar">
      <div><p class="eyebrow">${eyebrow}</p><h2>${title}</h2></div>
      <div class="topbar-actions">
        <span class="user-chip">${state.session.email}</span>
        <button class="ghost-button" type="button" data-action="logout">로그아웃</button>
      </div>
    </header>
  `;
}

function renderRoute() {
  const routes = {
    dashboard: renderDashboard,
    classes: renderClasses,
    documents: renderDocuments,
    rubrics: renderRubrics,
    records: renderRecords,
    drafts: renderDrafts,
    audit: renderAudit,
  };
  return routes[state.route]();
}

function renderDashboard() {
  const pendingPages = state.documents.flatMap((doc) => doc.pages).filter((page) => !page.reviewed).length;
  const completeEvaluations = state.students.filter((student) => student.evaluation !== "미입력").length;
  return `
    <section class="summary-grid" aria-label="핵심 지표">
      ${metric("검수 대기 OCR", pendingPages, "PDF 페이지 기준")}
      ${metric("평가 입력률", `${Math.round((completeEvaluations / state.students.length) * 100)}%`, `${state.classInfo.grade} ${state.classInfo.name}`)}
      ${metric("문구 초안 대기", state.recordDrafts.filter((draft) => draft.status !== "승인 완료").length, "교사 승인 필요")}
      ${metric("학생 수", state.students.length, "현재 반 명단")}
    </section>
    <section class="main-grid">
      <article class="panel wide">
        <div class="panel-header"><div><h3>처리할 일</h3><p>실제 데이터와 연결된 우선순위입니다.</p></div></div>
        <div class="task-list">
          ${state.documents.map((doc) => task("PDF", doc.title, `${doc.uploadedAt} · ${doc.status}`, "documents")).join("")}
          ${state.students.filter((student) => student.evaluation === "미입력").map((student) => task("평가", `${student.name} 평가 입력 필요`, "루브릭 기준 선택 전", "records")).join("")}
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

function renderClasses() {
  return `
    <section class="two-column">
      <article class="panel">
        <div class="panel-header"><div><h3>${state.classInfo.year} ${state.classInfo.grade} ${state.classInfo.name}</h3><p>교사 권한은 이 반에 한정됩니다.</p></div></div>
        <form class="form-grid" id="studentForm">
          <label>번호<input name="number" placeholder="05" /></label>
          <label>이름<input name="name" placeholder="학생 이름" /></label>
          <label>초기 특성<input name="tag" placeholder="예: 발표 강점" /></label>
          <button class="primary-button" type="submit">학생 추가</button>
        </form>
      </article>
      <article class="panel">
        <div class="panel-header"><div><h3>학생 명단</h3><p>학생별 기록 카드와 평가에 연결됩니다.</p></div></div>
        <div class="table-list">
          ${state.students.map((student) => `<div class="table-row"><strong>${student.number}. ${student.name}</strong><span>${student.tags.join(", ")}</span><em>${student.evaluation}</em></div>`).join("")}
        </div>
      </article>
    </section>
  `;
}

function renderDocuments() {
  return `
    <section class="two-column">
      <article class="panel">
        <div class="panel-header"><div><h3>PDF 업로드</h3><p>업로드 후 OCR 결과를 검수합니다.</p></div></div>
        <form class="form-grid" id="documentForm">
          <label>자료 제목<input name="title" placeholder="예: 3단원 설명문 필기" /></label>
          <label>단원<input name="unit" placeholder="예: 3단원. 설명하는 글" /></label>
          <label>PDF 파일<input name="pdf" type="file" accept="application/pdf" /></label>
          <button class="primary-button" type="submit">업로드 등록</button>
        </form>
      </article>
      <article class="panel">
        <div class="panel-header"><div><h3>OCR 검수</h3><p>수정한 텍스트는 학생 기록 근거로 연결됩니다.</p></div></div>
        ${state.documents.map(renderDocumentReview).join("")}
      </article>
    </section>
  `;
}

function renderDocumentReview(document) {
  return `
    <div class="review-block">
      <div class="review-title"><strong>${document.title}</strong><span>${document.fileName} · ${document.status}</span></div>
      ${document.pages.map((page) => `
        <label>OCR ${page.number}쪽
          <textarea data-ocr-page="${page.id}" rows="4">${page.corrected}</textarea>
        </label>
        <button class="ghost-button" type="button" data-review="${document.id}:${page.id}">${page.reviewed ? "검수 완료됨" : "이 페이지 검수 완료"}</button>
      `).join("")}
    </div>
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
  app.innerHTML = `
    <section class="student-shell">
      <article class="student-assessment">
        <p class="eyebrow">Student Assessment</p>
        <h1>${state.session.name} 학생</h1>
        <p>접속 코드 ${state.session.code}로 형성평가에 입장했습니다.</p>
        <div class="question-box">
          <strong>1. 토의에서 타당한 근거가 필요한 까닭을 고르세요.</strong>
          <label><input type="radio" name="q1" /> 주장을 더 설득력 있게 만들기 위해서</label>
          <label><input type="radio" name="q1" /> 말하는 시간을 줄이기 위해서</label>
          <label><input type="radio" name="q1" /> 상대 의견을 기록하지 않기 위해서</label>
        </div>
        <button class="primary-button" type="button" onclick="alert('제출 기록이 저장되었습니다.')">제출하기</button>
        <button class="ghost-button" type="button" onclick="logout()">나가기</button>
      </article>
    </section>
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
  document.querySelector("#documentForm")?.addEventListener("submit", addDocument);
  document.querySelector("#rubricForm")?.addEventListener("submit", addRubric);
  document.querySelectorAll("[data-ocr-page]").forEach((textarea) => textarea.addEventListener("input", () => updateOcr(textarea.dataset.ocrPage, textarea.value)));
  document.querySelectorAll("[data-review]").forEach((button) => {
    button.addEventListener("click", () => {
      const [documentId, pageId] = button.dataset.review.split(":");
      approvePage(documentId, pageId);
    });
  });
  document.querySelectorAll("[data-eval]").forEach((button) => {
    button.addEventListener("click", () => {
      const [studentId, level] = button.dataset.eval.split(":");
      updateEvaluation(studentId, level);
    });
  });
  document.querySelectorAll("[data-approve-draft]").forEach((button) => button.addEventListener("click", () => approveDraft(button.dataset.approveDraft)));
}

render();
