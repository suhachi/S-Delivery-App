# KS 심플배달앱 - 배포 안전장치 & 실행 기준

**생성일**: 2025-12-10  
**목적**: 배포 대상 통제 및 실행 기준 고정

---

## 1. scripts/check-deploy.mjs

**파일 위치**: `scripts/check-deploy.mjs`

**전체 원본 코드**:

```javascript
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// 필수 계정 이메일 (배포 전 확인)
const REQUIRED_ACCOUNT = 'jsbae59@gmail.com';

// 금지된 프로젝트 ID (실수로 배포하면 안 되는 프로젝트)
const FORBIDDEN_PROJECTS = [
  'production-project-id',
  'live-project-id',
];

// .firebaserc 파일 읽기
function getFirebaseProject() {
  try {
    const firebasercPath = join(rootDir, '.firebaserc');
    const content = readFileSync(firebasercPath, 'utf-8');
    const config = JSON.parse(content);
    return config.projects?.default || null;
  } catch (error) {
    console.error('❌ .firebaserc 파일을 읽을 수 없습니다:', error.message);
    process.exit(1);
  }
}

// Firebase CLI 계정 확인
async function checkFirebaseAccount() {
  try {
    const { execSync } = await import('child_process');
    const output = execSync('firebase whoami', { encoding: 'utf-8' });
    const email = output.trim();
    
    if (email !== REQUIRED_ACCOUNT) {
      console.error(`❌ 배포 계정 불일치!`);
      console.error(`   현재 계정: ${email}`);
      console.error(`   필수 계정: ${REQUIRED_ACCOUNT}`);
      console.error(`\n올바른 계정으로 로그인하세요:`);
      console.error(`   firebase login`);
      process.exit(1);
    }
    
    console.log(`✅ 배포 계정 확인: ${email}`);
    return email;
  } catch (error) {
    console.error('❌ Firebase CLI 계정 확인 실패:', error.message);
    console.error('   firebase login을 실행하세요.');
    process.exit(1);
  }
}

// 프로젝트 ID 확인
function checkProjectId(projectId) {
  if (!projectId) {
    console.error('❌ .firebaserc에 프로젝트 ID가 없습니다.');
    process.exit(1);
  }
  
  if (FORBIDDEN_PROJECTS.includes(projectId)) {
    console.error(`❌ 금지된 프로젝트에 배포하려고 합니다: ${projectId}`);
    console.error('   프로덕션 프로젝트에 실수로 배포하는 것을 방지합니다.');
    process.exit(1);
  }
  
  console.log(`✅ 배포 대상 프로젝트: ${projectId}`);
}

// 빌드 확인
function checkBuild() {
  try {
    const buildDir = join(rootDir, 'build');
    const { existsSync } = await import('fs');
    
    if (!existsSync(buildDir)) {
      console.error('❌ build 디렉토리가 없습니다.');
      console.error('   npm run build를 먼저 실행하세요.');
      process.exit(1);
    }
    
    console.log('✅ 빌드 디렉토리 확인됨');
  } catch (error) {
    console.error('❌ 빌드 확인 실패:', error.message);
    process.exit(1);
  }
}

// 메인 실행
async function main() {
  console.log('🔍 배포 전 안전 검증 시작...\n');
  
  const projectId = getFirebaseProject();
  checkProjectId(projectId);
  
  await checkFirebaseAccount();
  await checkBuild();
  
  console.log('\n✅ 모든 검증 통과! 배포를 진행합니다.\n');
}

main().catch((error) => {
  console.error('❌ 검증 중 오류 발생:', error);
  process.exit(1);
});
```

**설명**:
- 배포 전 필수 계정 확인 (`REQUIRED_ACCOUNT`)
- 금지된 프로젝트 ID 체크 (`FORBIDDEN_PROJECTS`)
- 빌드 디렉토리 존재 확인
- 모든 검증 통과 시에만 배포 진행

**사용법**:
```bash
# 배포 전 자동 실행
npm run predeploy

# 또는 직접 실행
node scripts/check-deploy.mjs
```

---

## 2. package.json (root)

**파일 위치**: 프로젝트 루트

**전체 원본 코드**:

```json
{
    "name": "simple-delivery-app",
    "version": "0.1.0",
    "private": true,
    "dependencies": {
        "@radix-ui/react-accordion": "^1.2.3",
        "@radix-ui/react-alert-dialog": "^1.1.6",
        "@radix-ui/react-aspect-ratio": "^1.1.2",
        "@radix-ui/react-avatar": "^1.1.3",
        "@radix-ui/react-checkbox": "^1.1.4",
        "@radix-ui/react-collapsible": "^1.1.3",
        "@radix-ui/react-context-menu": "^2.2.6",
        "@radix-ui/react-dialog": "^1.1.6",
        "@radix-ui/react-dropdown-menu": "^2.1.6",
        "@radix-ui/react-hover-card": "^1.1.6",
        "@radix-ui/react-label": "^2.1.2",
        "@radix-ui/react-menubar": "^1.1.6",
        "@radix-ui/react-navigation-menu": "^1.2.5",
        "@radix-ui/react-popover": "^1.1.6",
        "@radix-ui/react-progress": "^1.1.2",
        "@radix-ui/react-radio-group": "^1.2.3",
        "@radix-ui/react-scroll-area": "^1.2.3",
        "@radix-ui/react-select": "^2.1.6",
        "@radix-ui/react-separator": "^1.1.2",
        "@radix-ui/react-slider": "^1.2.3",
        "@radix-ui/react-slot": "^1.1.2",
        "@radix-ui/react-switch": "^1.1.3",
        "@radix-ui/react-tabs": "^1.1.3",
        "@radix-ui/react-toggle": "^1.1.2",
        "@radix-ui/react-toggle-group": "^1.1.2",
        "@radix-ui/react-tooltip": "^1.1.8",
        "class-variance-authority": "^0.7.1",
        "clsx": "*",
        "cmdk": "^1.1.1",
        "embla-carousel-react": "^8.6.0",
        "firebase": "*",
        "input-otp": "^1.4.2",
        "lucide-react": "^0.487.0",
        "next-themes": "^0.4.6",
        "react": "^18.3.1",
        "react-daum-postcode": "^3.2.0",
        "react-day-picker": "^8.10.1",
        "react-dom": "^18.3.1",
        "react-hook-form": "^7.55.0",
        "react-resizable-panels": "^2.1.7",
        "react-router-dom": "*",
        "recharts": "^2.15.2",
        "sonner": "^2.0.3",
        "tailwind-merge": "*",
        "tailwindcss": "*",
        "vaul": "^1.1.2"
    },
    "devDependencies": {
        "@testing-library/jest-dom": "^6.9.1",
        "@testing-library/react": "^16.3.0",
        "@testing-library/user-event": "^14.6.1",
        "@types/node": "^20.10.0",
        "@types/react": "^19.2.7",
        "@types/react-dom": "^19.2.3",
        "@typescript-eslint/eslint-plugin": "^8.49.0",
        "@typescript-eslint/parser": "^8.49.0",
        "@vitejs/plugin-react-swc": "^3.10.2",
        "eslint": "^8.57.0",
        "eslint-plugin-react-hooks": "^7.0.1",
        "eslint-plugin-react-refresh": "^0.4.24",
        "jsdom": "^27.3.0",
        "vite": "6.3.5",
        "vitest": "^4.0.15"
    },
    "scripts": {
        "dev": "vite",
        "build": "vite build",
        "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
        "preview": "vite preview",
        "firebase:init": "firebase init",
        "firebase:login": "firebase login",
        "test": "vitest",
        "test:ui": "vitest --ui",
        "predeploy": "node scripts/check-deploy.mjs",
        "firebase:deploy": "npm run predeploy && firebase deploy",
        "firebase:deploy:hosting": "npm run predeploy && firebase deploy --only hosting",
        "firebase:deploy:firestore": "npm run predeploy && firebase deploy --only firestore:rules,firestore:indexes",
        "firebase:deploy:storage": "npm run predeploy && firebase deploy --only storage"
    }
}
```

**핵심 스크립트**:
- `dev`: 개발 서버 실행 (포트 3000)
- `build`: 프로덕션 빌드 (`build` 디렉토리)
- `predeploy`: 배포 전 안전 검증 (자동 실행)
- `firebase:deploy`: 전체 배포 (predeploy 포함)
- `firebase:deploy:hosting`: Hosting만 배포
- `firebase:deploy:firestore`: Firestore Rules & Indexes만 배포
- `firebase:deploy:storage`: Storage Rules만 배포

---

## 배포 프로세스

### 1. 개발 환경
```bash
npm run dev
# http://localhost:3000 접속
```

### 2. 빌드
```bash
npm run build
# build/ 디렉토리에 빌드 결과 생성
```

### 3. 배포 전 검증 (자동)
```bash
npm run predeploy
# 또는
node scripts/check-deploy.mjs
```

**검증 항목**:
- ✅ Firebase 계정 확인 (`jsbae59@gmail.com`)
- ✅ 프로젝트 ID 확인 (금지된 프로젝트 체크)
- ✅ 빌드 디렉토리 존재 확인

### 4. 배포
```bash
# 전체 배포
npm run firebase:deploy

# 또는 개별 배포
npm run firebase:deploy:hosting
npm run firebase:deploy:firestore
npm run firebase:deploy:storage
```

---

## 배포 안전장치 동작 원리

1. **predeploy 훅**: `package.json`의 `firebase:deploy` 스크립트는 자동으로 `predeploy`를 실행합니다.
2. **계정 확인**: `firebase whoami`로 현재 로그인된 계정 확인
3. **프로젝트 확인**: `.firebaserc`에서 배포 대상 프로젝트 ID 확인
4. **빌드 확인**: `build/` 디렉토리 존재 확인

**검증 실패 시**: 배포가 중단되고 오류 메시지 표시

---

**다음 문서**: [KS-05-ADMIN-INITIAL-FLOW.md](./KS-05-ADMIN-INITIAL-FLOW.md)

