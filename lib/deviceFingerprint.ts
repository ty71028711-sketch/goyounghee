'use client';

export type DeviceKind = 'pc' | 'mobile';

/** 브라우저 속성 기반 기기 고유 ID 생성 */
export function getDeviceId(): string {
  if (typeof window === 'undefined') return '';

  const stored = localStorage.getItem('imjang_device_id');
  if (stored) return stored;

  const raw = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    screen.colorDepth,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    navigator.hardwareConcurrency ?? 0,
  ].join('|');

  // 간단한 해시
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = (Math.imul(31, hash) + raw.charCodeAt(i)) | 0;
  }
  const id = Math.abs(hash).toString(36) + Date.now().toString(36);
  localStorage.setItem('imjang_device_id', id);
  return id;
}

/** 모바일 여부 판별 */
export function getDeviceType(): DeviceKind {
  if (typeof window === 'undefined') return 'pc';
  const ua = navigator.userAgent;
  const isMobile = /Mobile|Android|iPhone|iPad|iPod/i.test(ua) ||
    (navigator.maxTouchPoints > 1 && /Mac/i.test(ua));
  return isMobile ? 'mobile' : 'pc';
}

/** 기기 이름 (예: "Chrome / Windows") */
export function getDeviceName(): string {
  if (typeof window === 'undefined') return '알 수 없는 기기';
  const ua = navigator.userAgent;
  let browser = 'Browser';
  if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Edg')) browser = 'Edge';

  let os = 'Unknown OS';
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac OS')) os = 'macOS';
  else if (ua.includes('Android')) os = 'Android';
  else if (/iPhone|iPad/.test(ua)) os = 'iOS';
  else if (ua.includes('Linux')) os = 'Linux';

  return `${browser} / ${os}`;
}
