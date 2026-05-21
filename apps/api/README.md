# API

FastAPI 기반 백엔드 자리입니다. 브라우저는 이 API를 통해서만 데이터에 접근하며, DB와 파일 저장소는 직접 노출하지 않습니다.

## 현재 구현

- SQLite 개발 DB 자동 초기화
- 교사용 이메일 로그인과 세션 토큰 발급
- 교사-반 권한 확인
- 학생 접속 코드 검증
- 학생/평가 기준/평가 배포/풀이 제출 저장
- PDF 업로드 파일 저장
- OCR 검수 데이터 저장
- 풀이 결과 채점과 분석 요약
- 생활기록부 문구 초안 생성
- AI 요청 익명화 기록
- 감사 로그 저장

## 실행

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

개발 서버는 `apps/api` 폴더에서 실행합니다. 웹 프로토타입은 기본적으로 `http://localhost:8000/api`에 연결을 시도하고, 서버가 없으면 브라우저 저장소 기반 데모 모드로 동작합니다.

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
- `GET /audit-logs`: 민감 자료 접근 로그 조회
