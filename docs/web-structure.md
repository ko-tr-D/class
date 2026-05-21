# Web App Structure

## Routes

### Teacher

- `/login`: 교사용 이메일 로그인
- `/teacher/dashboard`: 오늘 처리할 자료, 최근 평가, 학생별 기록 상태
- `/teacher/classes`: 학년도, 반, 학생 관리
- `/teacher/documents`: PDF/교과서/평가 자료 업로드
- `/teacher/documents/:id/review`: OCR 결과 검수
- `/teacher/curriculum`: 단원, 성취기준 관리
- `/teacher/rubrics`: 평가 기준표 관리
- `/teacher/students/:id`: 학생 기록 카드
- `/teacher/record-drafts`: 생활기록부 문구 초안 검토
- `/teacher/assessments`: 평가 생성과 배포
- `/teacher/analytics`: 성취도와 풀이 패턴 분석
- `/teacher/settings`: 계정, 보안, 데이터 내보내기

### Student

- `/student/join`: 학생 접속 코드 입력
- `/student/assessments/:id`: 문제 풀이
- `/student/submitted`: 제출 완료
- `/student/feedback/:attemptId`: 허용된 피드백 확인

### Admin

- `/admin/users`: 교사 계정과 권한
- `/admin/audit-logs`: 접근/수정 로그
- `/admin/storage`: 백업과 파일 저장 상태

## Teacher Dashboard Widgets

- 검수 대기 PDF
- 이번 주 평가 입력 현황
- 생활기록부 문구 초안 대기
- 성취기준별 반 평균
- 학생별 기록 부족 알림

## Student Assessment Events

- assessment_started
- question_viewed
- answer_changed
- answer_submitted
- assessment_submitted
