const authPanel = document.querySelector("#authPanel");
const dashboard = document.querySelector("#dashboard");
const modeTabs = document.querySelectorAll(".mode-tab");
const teacherLogin = document.querySelector("#teacherLogin");
const studentJoin = document.querySelector("#studentJoin");

function setMode(mode) {
  modeTabs.forEach((tab) => {
    const isActive = tab.dataset.mode === mode;
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });

  teacherLogin.classList.toggle("hidden", mode !== "teacher");
  studentJoin.classList.toggle("hidden", mode !== "student");
}

modeTabs.forEach((tab) => {
  tab.addEventListener("click", () => setMode(tab.dataset.mode));
});

teacherLogin.addEventListener("submit", (event) => {
  event.preventDefault();
  authPanel.classList.add("hidden");
  dashboard.classList.remove("hidden");
});

studentJoin.addEventListener("submit", (event) => {
  event.preventDefault();
  alert("학생용 문제 풀이 화면은 다음 단계에서 연결합니다.");
});

