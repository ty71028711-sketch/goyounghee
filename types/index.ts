export type ReceiptType      = '없음' | '현금영수증' | '세금계산서';
export type ApplicationStatus = '신청완료' | '처리완료';
export type Category         = 'apt' | 'sale' | 'house';
export type DealType         = 'sale' | 'rental' | 'saleRight' | 'saleRightRental';
export type RentalType       = 'jeonse' | 'monthly';
export type AppointmentStatus = '가능' | '확인중' | '방문완료' | '불가';
export type UserStatus       = 'pending' | 'approved' | 'rejected';
export type PlanStatus       = '승인대기' | '사용중' | '만료';
export type DeviceType       = 'pc' | 'mobile';

export interface DeviceInfo {
  deviceId:     string;
  deviceType:   DeviceType;
  deviceName:   string;
  lastLogin:    number;
  registeredAt: number;
}

export interface AppUser {
  uid:         string;
  email:       string;
  displayName: string;
  name:        string;
  phone:       string;
  photoURL:    string;
  status:      UserStatus;
  planStatus:  PlanStatus;
  createdAt:   number;
  approvedAt?: number;
  expiryDate?: number | null;
  devices:     DeviceInfo[];
}

export interface Visit {
  id:                    string;
  category:              Category;
  dealType:              DealType;
  rentalType:            RentalType;
  apartmentName:         string;
  dong:                  string;
  ho:                    string;
  area:                  string;
  type:                  string;
  address:               string;
  rooms:                 string;
  bathrooms:             string;
  parking:               string;
  salePrice:             string;
  jeonsePrice:           string;
  deposit:               string;
  monthlyRent:           string;
  basePrice:             string;
  optionPrice:           string;
  premium:               string;
  officetelResidential:  boolean;
  officetelBusiness:     boolean;
  moveInDate:            string;
  immediateMove:         boolean;
  negotiateMove:         boolean;
  coBrokerAgency:        string;
  coBrokerPhone:         string;
  hasPet:                string;
  visitPhone:            string;
  visitTime:             string;
  isVacant:              boolean;
  appointmentStatus:     AppointmentStatus;
  memo:                  string;
  naverUrl?:             string;
  createdAt?:            number;
  updatedAt?:            number;
}

export interface Archive {
  id:         string;
  savedAt:    number;
  visitDate:  string;
  visitCount: number;
  visits:     Visit[];
}

export interface ApplicationForm {
  id:            string;
  name:          string;
  phone:         string;
  depositorName: string;
  googleEmail:   string;
  receiptType:   ReceiptType;
  receiptInfo:   string;
  plan:          string;
  createdAt:     number;
  status:        ApplicationStatus;
}

export interface BusinessCard {
  officeName:  string;
  managerName: string;
  phone:       string;
  address:     string;
  blog:        string;
}

export const EMPTY_VISIT: Omit<Visit, 'id'> = {
  category: 'apt', dealType: 'rental', rentalType: 'jeonse',
  apartmentName: '', dong: '', ho: '', area: '', type: '',
  address: '', rooms: '', bathrooms: '', parking: '가능',
  salePrice: '', jeonsePrice: '', deposit: '', monthlyRent: '',
  basePrice: '', optionPrice: '', premium: '',
  officetelResidential: false, officetelBusiness: false,
  moveInDate: '', immediateMove: false, negotiateMove: false,
  coBrokerAgency: '', coBrokerPhone: '',
  hasPet: '가능', visitPhone: '', visitTime: '', isVacant: false,
  appointmentStatus: '가능', memo: '', naverUrl: '',
};

export const CAT_LABELS: Record<Category, string> = {
  apt: '아파트/오피스텔', sale: '분양권', house: '주택',
};
export const DEAL_LABELS: Record<DealType, string> = {
  sale: '매매', rental: '전월세', saleRight: '매매', saleRightRental: '전월세',
};
export const VALID_DEALS: Record<Category, DealType[]> = {
  apt:   ['sale', 'rental'],
  sale:  ['saleRight', 'saleRightRental'],
  house: ['sale', 'rental'],
};
export const DEFAULT_DEAL: Record<Category, DealType> = {
  apt: 'rental', sale: 'saleRight', house: 'rental',
};
