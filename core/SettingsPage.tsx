'use client';

import { useState } from 'react';
import { useAuth } from '@/auth/AuthContext';
import { useBusinessCard } from './hooks/useBusinessCard';
import { revokeDevice } from '@/lib/firestore';
import { getDeviceId } from '@/auth/deviceFingerprint';
import { cn } from '@/lib/utils';

const TERMS_URL = 'https://sojangnote.com/terms';

const inputCls = 'w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 transition-all';
const labelCls = 'block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1.5';

export default function SettingsPage() {
  const { firebaseUser, appUser, logout } = useAuth();
  const { card, setCard, save, saving }   = useBusinessCard(firebaseUser?.uid);
  const [saved, setSaved] = useState(false);
  const myDeviceId = typeof window !== 'undefined' ? getDeviceId() : '';

  const fields = [
    { key:'officeName',  label:'부동산 이름', ph:'강남 임장부동산' },
    { key:'managerName', label:'소장님 성함', ph:'홍길동' },
    { key:'phone',       label:'연락처',      ph:'010-0000-0000' },
    { key:'address',     label:'주소',        ph:'서울 강남구 테헤란로 123' },
    { key:'blog',        label:'블로그/SNS',  ph:'sojangnote.com' },
  ] as const;

  async function handleSave() {
    await save(card);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleRevokeDevice(deviceId: string) {
    if (!appUser) return;
    if (!confirm('이 기기를 해제하시겠습니까?\n해제된 기기는 다시 로그인해야 합니다.')) return;
    await revokeDevice(appUser.uid, deviceId);
    if (deviceId === myDeviceId) await logout();
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 pb-28 space-y-4">
      <div>
        <h2 className="text-[19px] font-extrabold text-slate-900 tracking-tight">설정</h2>
        <p className="text-xs text-slate-400 mt-1">명함 정보와 계정을 관리합니다</p>
      </div>

      {/* 명함 정보 */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
          <p className="font-bold text-sm text-slate-900">🏢 부동산 명함 정보</p>
          <p className="text-xs text-slate-400 mt-0.5">문자 전송 시 메시지 하단에 자동 추가됩니다</p>
        </div>
        <div className="p-4 space-y-3">
          {fields.map(f => (
            <div key={f.key}>
              <label className={labelCls}>{f.label}</label>
              <input
                value={card[f.key] || ''}
                onChange={e => setCard(p => ({ ...p, [f.key]: e.target.value }))}
                placeholder={f.ph}
                className={inputCls}
              />
            </div>
          ))}
          <button
            onClick={handleSave}
            disabled={saving}
            className={cn(
              'w-full py-3 font-bold text-sm rounded-xl text-white transition-all disabled:opacity-60',
              saved ? 'bg-emerald-500' : 'bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700'
            )}
          >
            {saving ? '저장 중...' : saved ? '✓ 저장 완료!' : '명함 정보 저장'}
          </button>
        </div>
      </div>

      {/* 계정 정보 */}
      {firebaseUser && (
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
            <p className="font-bold text-sm text-slate-900">👤 계정 정보</p>
          </div>
          <div className="p-4">
            <div className="flex items-center gap-3 mb-4">
              {firebaseUser.photoURL
                ? <img src={firebaseUser.photoURL} alt="" className="w-12 h-12 rounded-full" />
                : <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 text-xl">👤</div>}
              <div>
                <p className="font-bold text-slate-900">{firebaseUser.displayName}</p>
                <p className="text-sm text-slate-500">{firebaseUser.email}</p>
                <span className="inline-block mt-1 text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full px-2 py-0.5">승인됨</span>
              </div>
            </div>
            <button onClick={logout} className="w-full py-2.5 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 text-sm font-semibold rounded-xl transition-colors">
              로그아웃
            </button>
          </div>
        </div>
      )}

      {/* 등록 기기 */}
      {appUser && appUser.devices?.length > 0 && (
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
            <p className="font-bold text-sm text-slate-900">💻 등록된 기기 ({appUser.devices.length}/2)</p>
            <p className="text-xs text-slate-400 mt-0.5">최대 PC 1대, 모바일 1대 등록 가능</p>
          </div>
          <div className="p-4 space-y-3">
            {appUser.devices.map(d => (
              <div key={d.deviceId} className={cn('flex items-center gap-3 p-3 rounded-xl border', d.deviceId === myDeviceId ? 'bg-brand-50 border-brand-200' : 'bg-slate-50 border-slate-200')}>
                <span className="text-2xl">{d.deviceType === 'pc' ? '💻' : '📱'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{d.deviceName}</p>
                  <p className="text-xs text-slate-400">
                    {d.deviceId === myDeviceId && <span className="text-brand-600 font-bold mr-1">[현재 기기]</span>}
                    마지막: {new Date(d.lastLogin).toLocaleDateString('ko-KR')}
                  </p>
                </div>
                <button onClick={() => handleRevokeDevice(d.deviceId)} className="text-xs text-red-400 hover:text-red-600 font-bold px-2 py-1 rounded-lg hover:bg-red-50 transition-colors">
                  해제
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 이용약관 */}
      <div className="bg-white rounded-2xl p-5 shadow-sm text-center">
        <p className="text-[12px] text-slate-400 leading-relaxed">
          본 프로그램 이용 시{' '}
          <a href={TERMS_URL} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold">[이용약관]</a>
          에 동의한 것으로 간주합니다.
        </p>
        <p className="text-[11px] text-slate-300 mt-2">임장메이트 PRO v2.0 · Copyright 2026. 임장메이트.</p>
      </div>
    </div>
  );
}
