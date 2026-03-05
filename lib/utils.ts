import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Visit } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMan(n: string | number): string {
  if (!n && n !== 0) return '';
  const num = Number(String(n).replace(/[^0-9]/g, ''));
  if (isNaN(num) || num === 0) return '';
  return num.toLocaleString('ko-KR');
}

export function formatPhone(raw: string): string {
  const d = raw.replace(/[^0-9]/g, '').slice(0, 11);
  if (!d) return '';
  if (d.startsWith('02')) {
    if (d.length <= 2) return d;
    if (d.length <= 5) return `${d.slice(0,2)}-${d.slice(2)}`;
    if (d.length <= 9) return `${d.slice(0,2)}-${d.slice(2,5)}-${d.slice(5)}`;
    return `${d.slice(0,2)}-${d.slice(2,6)}-${d.slice(6)}`;
  }
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0,3)}-${d.slice(3)}`;
  if (d.length <= 10) return `${d.slice(0,3)}-${d.slice(3,6)}-${d.slice(6)}`;
  return `${d.slice(0,3)}-${d.slice(3,7)}-${d.slice(7)}`;
}

export function getPriceText(v: Visit): string {
  const rt = v.rentalType || 'jeonse';
  switch (v.dealType) {
    case 'sale':
      return v.salePrice ? `매매 ${formatMan(v.salePrice)}만원` : '';
    case 'rental':
    case 'saleRightRental':
      if (rt === 'jeonse') return v.jeonsePrice ? `전세 ${formatMan(v.jeonsePrice)}만원` : '';
      return [
        v.deposit     ? `보증금 ${formatMan(v.deposit)}만원`    : '',
        v.monthlyRent ? `월 ${formatMan(v.monthlyRent)}만원` : '',
      ].filter(Boolean).join(' / ');
    case 'saleRight': {
      const t = (Number(v.basePrice)||0) + (Number(v.optionPrice)||0) + (Number(v.premium)||0);
      if (t === 0) return '';
      const pText = v.premium ? ` · P ${formatMan(v.premium)}만원` : '';
      return `총분양가 ${t.toLocaleString('ko-KR')}만원${pText}`;
    }
    default:
      if (v.jeonsePrice) return `전세 ${formatMan(v.jeonsePrice)}만원`;
      return [
        v.deposit     ? `보증금 ${formatMan(v.deposit)}만원`    : '',
        v.monthlyRent ? `월 ${formatMan(v.monthlyRent)}만원` : '',
      ].filter(Boolean).join(' / ');
  }
}

export function getFormattedDate(): string {
  const d = new Date();
  const days = ['일','월','화','수','목','금','토'];
  return `${d.getFullYear()}년 ${d.getMonth()+1}월 ${d.getDate()}일 (${days[d.getDay()]})`;
}

export function buildSmsMessage(
  sel: Visit[],
  card: { officeName?:string; managerName?:string; phone?:string; address?:string; blog?:string },
  includeCard: boolean
): string {
  if (!sel.length) return '';
  const lines = sel.map((v, i) => {
    const price  = getPriceText(v);
    const isH    = v.category === 'house';
    const dongHo = [v.dong && `${v.dong}동`, v.ho && `${v.ho}호`].filter(Boolean).join(' ');
    const areaLabel = v.area ? (v.area.endsWith('평') ? v.area : `${v.area}평`) : '';
    const typeLabel = v.type ? (v.type.endsWith('타입') ? v.type : `${v.type}타입`) : '';
    const area   = isH
      ? [v.rooms && `방${v.rooms}`, v.bathrooms && `욕실${v.bathrooms}`].filter(Boolean).join('/')
      : [areaLabel, typeLabel].filter(Boolean).join(' / ');
    const loc    = isH
      ? [v.address, dongHo].filter(Boolean).join(' ')
      : dongHo;
    const mi     = v.immediateMove  ? '\n   📅 즉시 입주 가능'
                 : v.negotiateMove  ? '\n   📅 입주 협의 가능'
                 : v.moveInDate     ? `\n   📅 입주 가능 ${v.moveInDate.replace(/-/g,'.')}`
                 : '';
    return `${i+1}. ${v.apartmentName}${area ? ` (${area})` : ''}\n   ${price}${mi}${loc ? `\n   ${loc}` : ''}`;
  }).join('\n\n');

  const name = card.managerName || '소장';
  let msg = `안녕하세요, ${name} 소장입니다.\n오늘 안내해 드린 매물 정보입니다.\n\n${lines}\n\n더 궁금하신 점은 편하게 연락 주세요 :)`;
  if (includeCard) {
    const parts: string[] = [];
    if (card.officeName)  parts.push(`🏢 ${card.officeName}`);
    if (card.managerName) parts.push(`👤 ${card.managerName} 소장`);
    if (card.phone)       parts.push(`📞 ${card.phone}`);
    if (card.address)     parts.push(`📍 ${card.address}`);
    if (card.blog)        parts.push(`🔗 ${card.blog}`);
    if (parts.length) msg += `\n\n──────────────\n${parts.join('\n')}`;
  } else {
    msg += '\n📝 sojangnote.com';
  }
  return msg;
}
