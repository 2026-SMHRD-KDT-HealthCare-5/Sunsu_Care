-- =========================================================================
-- 선크림 핵심 효능 성분 skin_warning 컬럼 업데이트
--   - "도움" 또는 "기능성" 키워드 포함 → 프론트가 TOP 3 핵심 성분으로 선정
--   - 매칭되지 않는 ingre_name 은 자동 무시 (영향 없음)
-- =========================================================================

START TRANSACTION;

/* ───── 보습 계열 ───── */
UPDATE tb_ingredient SET skin_warning = '깊은 보습에 도움 (강력한 휴멕턴트)'
  WHERE ingre_name IN ('글리세린', '히알루론산', '소듐히알루로네이트', '하이알루로닉애씨드');

UPDATE tb_ingredient SET skin_warning = '보습 + 항균 보조 기능성'
  WHERE ingre_name IN ('펜틸렌글라이콜', '1,2-펜탄다이올');

UPDATE tb_ingredient SET skin_warning = '수분 공급 및 보습 기능'
  WHERE ingre_name IN ('부틸렌글라이콜', '프로판다이올', '1,2-헥산다이올', '헥실렌글라이콜');

UPDATE tb_ingredient SET skin_warning = '천연 수분 인자(NMF) 보습 효과'
  WHERE ingre_name IN ('베타인', '트레할로스', '소듐피씨에이');

/* ───── 피부 진정 계열 ───── */
UPDATE tb_ingredient SET skin_warning = '피부 진정 및 보습에 도움 (비타민 B5)'
  WHERE ingre_name IN ('판테놀', '디판테놀', '판테노익애씨드');

UPDATE tb_ingredient SET skin_warning = '피부 진정 및 손상 회복에 도움'
  WHERE ingre_name = '알란토인';

UPDATE tb_ingredient SET skin_warning = '피부 진정 및 항염 기능성 (센텔라)'
  WHERE ingre_name IN ('센텔라아시아티카추출물', '병풀추출물', '병풀잎/줄기추출물', '센텔라아시아티카잎추출물');

UPDATE tb_ingredient SET skin_warning = '진정 및 회복 효과 (TECA / 센텔라 활성분)'
  WHERE ingre_name IN ('마데카소사이드', '아시아티코사이드', '아시아틱애씨드', '마데카식애씨드');

UPDATE tb_ingredient SET skin_warning = '항염 및 피부 진정에 도움'
  WHERE ingre_name IN ('알로에베라잎추출물', '알로에베라잎즙', '알로에베라잎가루');

UPDATE tb_ingredient SET skin_warning = '민감 피부 진정 효과'
  WHERE ingre_name IN ('비사보롤', '알파-비사보롤', '카모마일추출물', '캐모마일꽃추출물');

/* ───── 미백 / 항산화 ───── */
UPDATE tb_ingredient SET skin_warning = '미백 및 피부 장벽 강화 기능성'
  WHERE ingre_name = '나이아신아마이드';

UPDATE tb_ingredient SET skin_warning = '미백 및 강력한 항산화 기능성 (비타민 C)'
  WHERE ingre_name IN ('아스코르브산', '아스코르빌글루코사이드', '에칠아스코르빅애씨드', '3-O-에칠아스코르빅애씨드', '아스코르빌테트라이소팔미테이트');

UPDATE tb_ingredient SET skin_warning = '강력한 항산화 효과 (비타민 E)'
  WHERE ingre_name IN ('토코페롤', '토코페릴아세테이트', '토코페릴리놀리에이트');

UPDATE tb_ingredient SET skin_warning = '폴리페놀 항산화 + 피부 진정'
  WHERE ingre_name IN ('녹차추출물', '카멜리아시넨시스잎추출물', '녹차잎추출물', 'EGCG');

UPDATE tb_ingredient SET skin_warning = '항산화 및 활력 부여 (Coenzyme Q10)'
  WHERE ingre_name IN ('유비퀴논', '코엔자임Q10');

UPDATE tb_ingredient SET skin_warning = '항산화 및 미백 보조 기능'
  WHERE ingre_name IN ('레스베라트롤', '페룰릭애씨드');

/* ───── 안티에이징 / 펩타이드 ───── */
UPDATE tb_ingredient SET skin_warning = '주름 개선 기능성'
  WHERE ingre_name IN ('아데노신', '레티닐팔미테이트', '레티놀', '바쿠치올');

UPDATE tb_ingredient SET skin_warning = '주름 개선 및 탄력 강화에 도움 (펩타이드)'
  WHERE ingre_name IN (
    '팔미토일트라이펩타이드-1',
    '팔미토일트라이펩타이드-5',
    '팔미토일테트라펩타이드-7',
    '팔미토일펜타펩타이드-4',
    '구리트라이펩타이드-1',
    '아세틸헥사펩타이드-8'
  );

/* ───── 피부 장벽 ───── */
UPDATE tb_ingredient SET skin_warning = '피부 장벽 강화에 도움 (세라마이드)'
  WHERE ingre_name IN ('세라마이드엔피', '세라마이드NP', '세라마이드', '세라마이드3', '세라마이드AP', '세라마이드EOP');

UPDATE tb_ingredient SET skin_warning = '피부 결 정돈 및 보습 (아미노산)'
  WHERE ingre_name IN ('세린', '글리신', '알라닌', '아르기닌', '글루타민', '프롤린');

UPDATE tb_ingredient SET skin_warning = '피부 장벽 구성 및 수분 보호'
  WHERE ingre_name IN ('스쿠알란', '쉐어버터', '시어버터', '호호바씨오일');

/* ───── 자외선 차단 (무기자차 / 물리적) ───── */
UPDATE tb_ingredient SET skin_warning = 'UVA·UVB 광범위 차단 기능성 (무기자차)'
  WHERE ingre_name IN ('산화아연', '징크옥사이드', '징크옥사이드(나노)', 'ZnO', '나노징크옥사이드');

UPDATE tb_ingredient SET skin_warning = 'UVB 중심 차단 기능성 (무기자차)'
  WHERE ingre_name IN ('이산화티탄', '티타늄디옥사이드', 'TiO2', '나노티타늄디옥사이드');

/* ───── 자외선 차단 (유기차 / 광안정성 신세대) ───── */
UPDATE tb_ingredient SET skin_warning = '광안정성 UVA·UVB 차단 기능성 (Tinosorb M)'
  WHERE ingre_name = '메칠렌비스-벤조트리아졸릴테트라메칠부틸페놀';

UPDATE tb_ingredient SET skin_warning = '광안정성 UVA·UVB 차단 기능성 (Tinosorb S)'
  WHERE ingre_name = '비스-에칠헥실옥시페놀메톡시페닐트리아진';

UPDATE tb_ingredient SET skin_warning = '장파장 UVA 차단 기능성 (Uvinul A Plus)'
  WHERE ingre_name = '디에칠아미노하이드록시벤조일헥실벤조에이트';

UPDATE tb_ingredient SET skin_warning = 'UVB 차단 + 광안정화 기능성'
  WHERE ingre_name = '옥토크릴렌';

UPDATE tb_ingredient SET skin_warning = 'UVB 차단 기능성'
  WHERE ingre_name IN ('에칠헥실메톡시신나메이트', '에칠헥실살리실레이트', '호모살레이트');

UPDATE tb_ingredient SET skin_warning = 'UVA 차단 기능성 (Mexoryl SX)'
  WHERE ingre_name = '테레프탈릴리덴디캠퍼설포닉애씨드';

/* ───── 식물 추출물 ───── */
UPDATE tb_ingredient SET skin_warning = '항산화 및 보습 효과 (자작나무)'
  WHERE ingre_name IN ('자작나무수액', '자작나무수액추출물', '자작나무잎추출물');

UPDATE tb_ingredient SET skin_warning = '수렴 및 피부 진정 효과'
  WHERE ingre_name IN ('위치하젤추출물', '하마멜리스버지니아나잎추출물', '풍년화추출물');

UPDATE tb_ingredient SET skin_warning = '항산화 및 피부 진정 보조'
  WHERE ingre_name IN ('로즈마리잎추출물', '로즈마리추출물', '꿀풀추출물');

UPDATE tb_ingredient SET skin_warning = '면역 활성 및 수분 보유에 도움 (베타글루칸)'
  WHERE ingre_name IN ('베타-글루칸', '베타글루칸');

UPDATE tb_ingredient SET skin_warning = '항산화 + 피부 진정에 도움 (귀리)'
  WHERE ingre_name IN ('귀리커넬추출물', '아베나사티바커넬추출물', '콜로이달오트밀');

COMMIT;

-- =========================================================================
-- 결과 확인용 SELECT (자동 무시됨 — 보고용)
-- =========================================================================
SELECT ingre_name, ewg_grade, skin_warning
  FROM tb_ingredient
 WHERE skin_warning LIKE '%기능성%'
    OR skin_warning LIKE '%도움%'
 ORDER BY ewg_grade ASC, ingre_name ASC
 LIMIT 80;
