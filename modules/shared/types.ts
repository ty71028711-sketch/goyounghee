/**
 * modules/shared/types.ts
 *
 * 모든 모듈이 참고할 수 있는 공통 인터페이스입니다.
 * core / auth 영역을 직접 import하지 않습니다.
 * 모듈별 세부 타입은 각 모듈 내부에서 정의합니다.
 */

/**
 * 탭 기반 모듈 페이지의 최소 공통 인터페이스.
 * 새 모듈 페이지를 만들 때 이 타입을 참고합니다.
 *
 * 예:
 *   export default function MyModulePage(props: ModulePageProps) { ... }
 */
export interface ModulePageProps {
  /** 다른 탭으로 이동이 필요한 경우 선택적으로 사용 */
  onGoToList?: () => void;
}
