# API

FastAPI 기반 백엔드 자리입니다. 브라우저는 이 API를 통해서만 데이터에 접근하며, DB와 파일 저장소는 직접 노출하지 않습니다.

## 모듈

- `auth`: 교사용 이메일 로그인, 역할, 학생 접속 코드
- `classes`: 학년도, 반, 학생 배정
- `documents`: PDF 업로드, OCR 검수
- `curriculum`: 단원, 성취기준
- `rubrics`: 평가 기준표
- `evaluations`: 학생 평가와 근거 연결
- `record_drafts`: 생활기록부 문구 초안
- `assessments`: 학생용 평가와 문항
- `analytics`: 성취도와 풀이 패턴 분석
- `audit`: 민감 데이터 접근 로그

## 예정 엔드포인트

- `POST /auth/login`: 교사용 이메일 로그인
- `POST /student-sessions`: 학생 접속 코드 입장
- `POST /documents`: PDF 업로드
- `GET /documents/{id}/pages`: OCR/검수 결과 조회
- `PATCH /documents/{id}/pages/{page_id}`: OCR 텍스트 검수 저장
- `POST /rubrics`: 평가 기준 등록
- `POST /evaluations`: 학생 평가 저장
- `POST /record-drafts`: 생활기록부 문구 초안 생성
- `PATCH /record-drafts/{id}`: 교사 수정/승인
- `POST /assessments`: 평가 생성
- `POST /attempts`: 학생 풀이 시작
- `POST /attempts/{id}/responses`: 학생 응답 저장
- `POST /attempts/{id}/submit`: 학생 풀이 제출
- `GET /analytics/classes/{class_id}`: 반별 분석 조회
