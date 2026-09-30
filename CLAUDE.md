# electric — CFBC 보일러 전기설비 유지보수 업무앱 (계전부)

## 작업 환경 원칙
- **도면·설비 자료 작업은 로컬 Claude Code 세션에서만** 한다 (Claude Desktop Code 탭 로컬 환경, 또는 해당 폴더에서 `claude` / `claude remote-control`).
- 클라우드 세션은 PC 폴더에 접근할 수 없으므로 앱 코드(이 저장소) 수정에만 쓴다.
- 앱 안에 입력된 데이터(IndexedDB)는 Claude가 직접 읽을 수 없다. 필요하면 앱의 [전체 백업 내보내기] JSON을 로컬 폴더에 저장해서 읽는다.

## 보안 원칙 (반드시 지킬 것)
- 이 저장소(GitHub)에는 **앱 코드만** 올린다. 도면 PDF·설비마스터·계통트리·고장이력·업무메모·백업 JSON·hwp/xlsx 원본은 커밋 금지.
- Firebase 설정값·API 키·비밀번호를 소스에 하드코딩하지 않는다 (Firebase config는 사용자가 앱 UI에서 입력).
- Firebase 동기화 대상은 `FB_SYNC_STORES`(todos, issues, inspections, checklists, checklogs) 5개뿐. 다른 스토어를 추가하지 않는다.
- 보안 금고(`vault`)는 이 기기 IndexedDB에만 AES-GCM 암호화 저장. 평문 백업·Firebase·Drive·AI API 어디로도 내보내지 않는다.
- 외부 전송은 암호화 백업(`exportEncrypted`, PBKDF2 + AES-GCM)만 허용.

## 구조
- 빌드 없는 단일 파일 PWA: `index.html`(HTML·CSS·JS 전부), `service-worker.js`, `manifest.json`, `icon-192.png`, `icon-512.png`.
- `index.html`의 JS는 `/* ===== PART n : 이름 ===== */` 주석으로 구역이 나뉜다. 수정 전 해당 PART를 grep으로 찾는다.
  - PART 1 IndexedDB(`DB_NAME='pwr_work_v1'`, `DB_VER`, `STORES`) · PART 3 내보내기/가져오기/백업 · PART 3.5 Firebase · PART 6.x 설비·계통·격리계획 · PART 9.9 도면 문서함(`importDocs`, `classifyDoc`) · PART 10 라우팅·초기화
- 외부 라이브러리는 필요할 때 CDN에서 동적 로드: pdf.js 3.11.174, JSZip 3.10.1, SheetJS 0.18.5 (cdnjs), Firebase compat 10.14.1.
- 데이터 저장은 전부 브라우저 IndexedDB. 도면은 PC 폴더를 선택해 기기로 복사(원본 폴더 유지).

## 수정 규칙
- 파일 내용을 바꾸면 **버전 두 곳을 같이 올린다**:
  - `index.html`의 `const APP_VER='vNN'`
  - `service-worker.js`의 `CACHE_NAME='jeonbi-app-vNN'` (안 올리면 PWA가 구버전 캐시를 계속 보여줌)
- IndexedDB 스토어를 추가하면 `STORES` 배열에 넣고 `DB_VER`를 +1 한다 (`onupgradeneeded`가 누락분만 생성하므로 기존 데이터 유지). 기존 스토어 삭제·keyPath 변경 금지.
- 커밋 메시지 형식: `app vNN: 변경 요약` (한국어).
- 코드 스타일은 기존 코드를 따른다: 압축된 한 줄 함수, `esc()`로 HTML 이스케이프, `toast()`/`confirmModal()`/`openModal()` 사용.
