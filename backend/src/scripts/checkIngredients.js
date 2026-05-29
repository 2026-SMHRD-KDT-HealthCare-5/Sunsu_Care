// backend/src/scripts/checkIngredients.js
// DB에 실제 저장된 ingre_name 과 skin_warning 확인용 진단 스크립트
//
// 실행: node backend/src/scripts/checkIngredients.js

require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });
const pool = require('../db');

const NAMES_TO_CHECK = [
    '글리세린', '알란토인', '에틸헥실글리세린', '나이아신아마이드',
    '히알루론산', '판테놀', '산화아연', '징크옥사이드',
    '디에칠아미노하이드록시벤조일헥실벤조에이트',
    '메칠렌비스-벤조트리아졸릴테트라메칠부틸페놀',
    '펜틸렌글라이콜', '세린', '센텔라아시아티카추출물'
];

async function main() {
    console.log('═══════════════════════════════════════════════════');
    console.log(' DB tb_ingredient 진단');
    console.log('═══════════════════════════════════════════════════\n');

    // 1) 전체 행 수
    const [[totalRow]] = await pool.query('SELECT COUNT(*) AS cnt FROM tb_ingredient');
    console.log(`📊 전체 성분 수: ${totalRow.cnt}\n`);

    // 2) 효능 좋은 키워드 매칭 수
    const [helpRows] = await pool.query(
        "SELECT COUNT(*) AS cnt FROM tb_ingredient WHERE skin_warning LIKE '%도움%' OR skin_warning LIKE '%기능성%'"
    );
    console.log(`✨ "도움" 또는 "기능성" 포함 행 수: ${helpRows[0].cnt}\n`);

    // 3) 확인 대상 성분 직접 조회
    console.log('🔍 주요 성분 현재 상태:\n');
    for (const name of NAMES_TO_CHECK) {
        const [rows] = await pool.query(
            'SELECT ingre_name, ewg_grade, skin_warning FROM tb_ingredient WHERE ingre_name = ?',
            [name]
        );
        if (rows.length === 0) {
            console.log(`   ❌ '${name}' → DB에 없음`);
        } else {
            const r = rows[0];
            const w = r.skin_warning || '(빈 값)';
            const hit = w.includes('도움') || w.includes('기능성') ? '🟢' : '⚪';
            console.log(`   ${hit} '${name}' (EWG ${r.ewg_grade}): ${w}`);
        }
    }

    // 4) 유사 이름 검색 (LIKE) — 사용자가 본 성분이 다른 표기로 저장돼 있는지
    console.log('\n🔎 유사 이름 검색 (LIKE 매칭):\n');
    for (const name of ['글리세린', '알란토인', '에틸헥실', '나이아신']) {
        const [rows] = await pool.query(
            'SELECT ingre_name, skin_warning FROM tb_ingredient WHERE ingre_name LIKE ? LIMIT 10',
            [`%${name}%`]
        );
        console.log(`   '${name}' 포함 (${rows.length}개):`);
        rows.forEach(r => console.log(`      • "${r.ingre_name}" → ${r.skin_warning || '(빈 값)'}`));
        if (rows.length === 0) console.log('      (없음)');
    }

    console.log('\n═══════════════════════════════════════════════════');
    await pool.end();
    process.exit(0);
}

main().catch(err => {
    console.error('진단 실패:', err);
    process.exit(1);
});
