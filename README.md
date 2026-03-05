# 임장메이트 PRO v2

공인중개사 전용 매물 방문 관리 SaaS — Next.js 14 + Firebase + Tailwind CSS

---

## 빠른 시작

```bash
# 1. 패키지 설치
npm install

# 2. 환경변수 설정
cp .env.local.example .env.local
# .env.local 에서 관리자 이메일 설정

# 3. 개발 서버 실행
npm run dev
```

---

## Firebase 설정 (최초 1회)

### 1. Authentication
Firebase Console → Authentication → Sign-in method → Google 활성화

### 2. Firestore
Firebase Console → Firestore Database → 생성 (Production mode)

규칙 탭에서 `firestore.rules` 내용 붙여넣기:
```
// firestore.rules 파일 내용 복사
```

### 3. 관리자 이메일 설정
`.env.local` 파일에서:
```
NEXT_PUBLIC_ADMIN_EMAILS=your@gmail.com
```

---

## 주요 경로

| 경로 | 설명 |
|------|------|
| `/` | 로그인 페이지 |
| `/dashboard` | 메인 앱 (승인 후 접근) |
| `/pending` | 승인 대기 페이지 |
| `/admin` | 관리자 패널 (관리자만) |

---

## 기능

- ✅ Google 소셜 로그인
- ✅ 관리자 승인 시스템 (pending → approved)
- ✅ 기기 제한 (PC 1대 + 모바일 1대)
- ✅ Firestore 실시간 동기화
- ✅ 매물 등록/수정/삭제
- ✅ 카테고리별 관리 (아파트/오피스텔, 분양권, 주택)
- ✅ 고객 안내 문자 전송
- ✅ 전화번호 자동 하이픈
- ✅ 명함 정보 관리
- ✅ 모바일 최적화 (PWA 대응)
