import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/auth/AuthContext';

export const metadata: Metadata = {
  title:       '소장노트 PRO',
  description: '공인중개사 전용 매물 방문 관리 서비스',
  manifest:    '/manifest.json',
  icons:       { apple: '/icon.svg', icon: '/icon.svg' },
  appleWebApp: { capable: true, statusBarStyle: 'default', title: '임장PRO' },
};

export const viewport: Viewport = {
  width:            'device-width',
  initialScale:     1,
  viewportFit:      'cover',
  themeColor:       '#f59e0b',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
        {/* PWA 서비스 워커 등록 (기존 인증 로직과 독립적) */}
        <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js')
                .then(function(reg) { console.log('[SW] 등록 완료:', reg.scope); })
                .catch(function(err) { console.log('[SW] 등록 실패:', err); });
            });
          }
        ` }} />
      </body>
    </html>
  );
}
