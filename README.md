# Class Learning Record

중학교 국어 수업에서 생성되는 필기 자료, 평가 자료, 학생 풀이 기록, 교사의 관찰 기록을 1년 단위로 축적하고 분석하는 웹앱입니다.

교사는 웹브라우저에서 자료를 업로드하고 평가/기록을 관리하며, 학생은 별도 설치 없이 웹브라우저에서 배정된 문제를 풉니다.

## 목표

- 손글씨 필기 PDF를 업로드하고 OCR/검수 과정을 거쳐 수업 데이터베이스로 정리합니다.
- 평가 기준표에 따라 학생별 성취를 기록하고 근거 자료를 연결합니다.
- 학생의 특성과 성장 과정을 바탕으로 생활기록부 문구 초안을 생성합니다.
- 교과서와 평가 문항을 업로드한 뒤 학생 기기에서 풀이하게 하고, 풀이 패턴과 성취도를 분석합니다.
- 교사와 함께 분석 알고리즘을 개선하며 학년도별 데이터를 누적합니다.

## 앱 구성

- Teacher Web: 교사용 대시보드, 자료 업로드, OCR 검수, 평가 기준 관리, 학생 기록, 생활기록부 문구 검토
- Student Web: 접속 코드 입장, 문제 풀이, 제출, 피드백 확인
- API Server: 인증, 권한, 자료 처리, 평가, 분석, AI 초안 생성
- Database: 학생/평가/자료/문구/로그 데이터 저장
- Worker: OCR, AI 문구 생성, 분석 계산처럼 오래 걸리는 작업 처리

## 저장소 구조

```text
apps/
  api/          FastAPI 기반 백엔드 API 자리
  web/          교사용/학생용 웹앱 자리
db/
  schema.sql    핵심 데이터베이스 스키마 초안
docs/
  product-proposal.md
  architecture.md
  security.md
  roadmap.md
```

## 제안 기술 스택

- Backend: Python, FastAPI, SQLAlchemy/Alembic
- Database: PostgreSQL
- OCR/PDF: Google Document AI, Azure AI Document Intelligence, 또는 자체 Tesseract 파이프라인 중 선택
- Frontend: Next.js 또는 React
- Auth: 교사용 계정, 학생 접속 코드, 반/학년도 권한 분리, 접근 로그
- AI: 교사 검토를 전제로 한 평가 근거 요약 및 생활기록부 문구 초안 생성

## 다음 단계

1. 교사용 핵심 화면을 실제 웹앱으로 구현합니다.
2. 로그인, 반/학생 관리, 권한 구조를 먼저 붙입니다.
3. PDF 업로드/OCR/검수 MVP를 만듭니다.
4. 평가 기준표와 학생 관찰 기록을 연결합니다.
5. 생활기록부 문구 생성은 교사 승인형으로 설계합니다.
6. 학생용 문제 풀이와 풀이 로그 분석을 확장합니다.

## 현재 프로토타입 열기

브라우저에서 `apps/web/index.html`을 열면 교사용 이메일 로그인, 학생 접속 코드, 교사용 대시보드, 반/학생 관리, PDF/OCR 검수, 평가 기준표, 학생 기록 카드, 평가 배포, 학생 문제 풀이, 풀이 분석, 생활기록부 문구 초안 흐름을 확인할 수 있습니다.

API 서버를 실행하면 브라우저 저장소가 아니라 FastAPI/SQLite 개발 DB에 저장됩니다.

`http://localhost:8000/api`는 웹 화면이 아니라 API 서버 주소입니다. 웹앱 미리보기는 `apps/web/index.html`을 직접 열거나, `node apps/web/preview-server.mjs` 실행 후 `http://127.0.0.1:4173`으로 접속합니다.
