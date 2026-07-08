# Vercel 배포 가이드

이 프로젝트는 Vercel에 배포할 수 있도록 설정되어 있습니다.

## 배포 단계

### 1. GitHub에 푸시

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/supabase-file-storage.git
git push -u origin main
```

### 2. Vercel에 연결

1. [Vercel 대시보드](https://vercel.com)에 접속
2. "New Project" 클릭
3. GitHub 저장소 선택
4. "Import" 클릭

### 3. 환경 변수 설정

Vercel 프로젝트 설정에서 다음 환경 변수를 추가하세요:

```
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
VITE_APP_ID=your_app_id
OAUTH_SERVER_URL=https://oauth.manus.im
VITE_OAUTH_PORTAL_URL=https://login.manus.im
OWNER_OPEN_ID=your_owner_open_id
OWNER_NAME=Your Name
BUILT_IN_FORGE_API_URL=https://forge.manus.im
BUILT_IN_FORGE_API_KEY=your_forge_api_key
VITE_FRONTEND_FORGE_API_URL=https://forge.manus.im
VITE_FRONTEND_FORGE_API_KEY=your_frontend_forge_api_key
VITE_ANALYTICS_ENDPOINT=https://analytics.manus.im
VITE_ANALYTICS_WEBSITE_ID=your_website_id
VITE_APP_TITLE=파일 공유 플랫폼
VITE_APP_LOGO=https://example.com/logo.png
```

### 4. 배포

환경 변수 설정 후 "Deploy" 버튼을 클릭하면 자동으로 배포됩니다.

## 빌드 설정

- **Build Command**: `pnpm build`
- **Output Directory**: `dist`
- **Install Command**: `pnpm install`

## 주의사항

- 데이터베이스는 별도로 설정해야 합니다 (MySQL/TiDB)
- 환경 변수는 반드시 모두 설정해야 합니다
- 첫 배포 후 데이터베이스 마이그레이션이 필요할 수 있습니다

## 문제 해결

### 빌드 실패

1. 로컬에서 `pnpm build` 실행하여 빌드 성공 확인
2. 환경 변수가 모두 설정되어 있는지 확인
3. Vercel 대시보드에서 빌드 로그 확인

### 런타임 에러

1. 데이터베이스 연결 확인
2. 환경 변수 값이 정확한지 확인
3. 서버 로그 확인 (Vercel 대시보드 → Logs)
