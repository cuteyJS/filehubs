# 🚀 Vercel 배포 가이드 (드래그 앤 드롭)

이 프로젝트는 **Vercel에 드래그 앤 드롭으로 바로 배포**할 수 있습니다!

---

## 📦 배포 방법 (3단계)

### 1️⃣ Vercel 대시보드 열기

[Vercel 대시보드](https://vercel.com)에 접속하세요.

### 2️⃣ 이 폴더를 드래그 앤 드롭

1. 이 프로젝트 폴더 전체를 선택
2. Vercel 대시보드에 드래그 앤 드롭
3. 배포 자동 시작 ✨

### 3️⃣ 환경 변수 설정

배포 후 **반드시** 환경 변수를 설정해야 합니다.

---

## 🔧 필수 환경 변수

Vercel 프로젝트 → Settings → Environment Variables에서 추가하세요.

### 필수 (반드시 설정)

| 변수명 | 값 | 설명 |
|--------|-----|------|
| `DATABASE_URL` | `mysql://user:pass@host:3306/db` | MySQL 데이터베이스 연결 문자열 |
| `JWT_SECRET` | `your-random-secret-key` | 세션 암호화 키 (아무거나 입력 가능) |
| `VITE_APP_ID` | `your-app-id` | 앱 ID |
| `OWNER_OPEN_ID` | `your-owner-id` | 소유자 ID |
| `OWNER_NAME` | `Your Name` | 소유자 이름 |

### Manus 관련 (필수)

| 변수명 | 값 |
|--------|-----|
| `OAUTH_SERVER_URL` | `https://oauth.manus.im` |
| `VITE_OAUTH_PORTAL_URL` | `https://login.manus.im` |
| `BUILT_IN_FORGE_API_URL` | `https://forge.manus.im` |
| `BUILT_IN_FORGE_API_KEY` | `your-forge-key` |
| `VITE_FRONTEND_FORGE_API_URL` | `https://forge.manus.im` |
| `VITE_FRONTEND_FORGE_API_KEY` | `your-frontend-key` |
| `VITE_ANALYTICS_ENDPOINT` | `https://analytics.manus.im` |
| `VITE_ANALYTICS_WEBSITE_ID` | `your-website-id` |

### 선택 (필요시 설정)

| 변수명 | 값 |
|--------|-----|
| `VITE_APP_TITLE` | `파일 공유 플랫폼` |
| `VITE_APP_LOGO` | `https://example.com/logo.png` |

---

## ✅ 배포 확인

1. Vercel에서 제공하는 URL 클릭
2. 사이트 로드 확인
3. 로그인 버튼 클릭하여 인증 테스트
4. 파일 업로드/다운로드 테스트

---

## 🆘 문제 해결

### ❌ 배포 실패

**확인사항:**
- Vercel 대시보드 → Deployments → Build Logs 확인
- 모든 필수 환경 변수 설정 확인
- 데이터베이스 URL 형식 확인

### ❌ 500 에러 또는 페이지 로드 안됨

**확인사항:**
- 환경 변수가 모두 설정되었는지 확인
- DATABASE_URL, JWT_SECRET 확인
- Vercel Logs에서 에러 메시지 확인 (Deployments → Logs)

### ❌ 파일 업로드 안됨

**확인사항:**
- BUILT_IN_FORGE_API_KEY 확인
- BUILT_IN_FORGE_API_URL 확인
- S3 스토리지 연결 상태 확인

---

## 📝 주의사항

⚠️ **데이터베이스는 별도로 준비해야 합니다**
- MySQL 또는 TiDB 데이터베이스 필요
- 클라우드 데이터베이스 서비스 추천 (AWS RDS, PlanetScale 등)

⚠️ **모든 필수 환경 변수를 설정하지 않으면 작동하지 않습니다**

⚠️ **첫 배포 후 자동으로 데이터베이스 마이그레이션이 실행됩니다**

---

## 🔗 커스텀 도메인 설정 (선택)

1. Vercel 프로젝트 → Settings → Domains
2. 도메인 추가
3. DNS 레코드 설정 (Vercel 지시사항 따르기)

---

## 💡 팁

- **환경 변수 변경 후**: Vercel에서 자동으로 재배포됨
- **로컬 테스트**: `pnpm build` 실행하여 빌드 성공 확인
- **로그 확인**: Vercel 대시보드 → Logs에서 실시간 로그 확인 가능

---

**배포 완료! 🎉**
