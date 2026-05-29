// backend/src/scripts/updateIngredientWarnings.js
//
// 효능 좋은 성분의 tb_ingredient.skin_warning 컬럼을 일괄 업데이트한다.
// 매칭되지 않는 ingre_name 은 영향 없음.
//
// 실행:
//   node backend/src/scripts/updateIngredientWarnings.js
//   또는
//   npm run db:seed-warnings   (package.json 에 추가됨)

require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });
const fs = require('fs');
const path = require('path');
const pool = require('../db');

const SQL_PATH = path.join(__dirname, '..', 'db', 'update_ingredient_warnings.sql');

/**
 * SQL 파일 → 실행 가능한 statement 배열로 파싱
 *  - 주석(--) 제거
 *  - 빈 줄 제거
 *  - 세미콜론 기준 분리
 *  - 트랜잭션 키워드(START/COMMIT)는 보존
 */
function parseStatements(sqlText) {
    const cleaned = sqlText
        .split('\n')
        .map(line => {
            // 인라인 -- 주석 제거
            const idx = line.indexOf('--');
            return idx >= 0 ? line.slice(0, idx) : line;
        })
        .join('\n');

    // /* ... */ 블록 주석 제거
    const noBlockComments = cleaned.replace(/\/\*[\s\S]*?\*\//g, '');

    return noBlockComments
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);
}

async function run() {
    console.log('═══════════════════════════════════════════════════');
    console.log(' Sun手Care — 성분 효능 설명 일괄 업데이트');
    console.log('═══════════════════════════════════════════════════');
    console.log(`SQL 파일: ${SQL_PATH}`);

    if (!fs.existsSync(SQL_PATH)) {
        console.error(`❌ SQL 파일을 찾을 수 없습니다: ${SQL_PATH}`);
        process.exit(1);
    }

    const sqlText = fs.readFileSync(SQL_PATH, 'utf-8');
    const statements = parseStatements(sqlText);
    console.log(`총 ${statements.length} 개 statement 발견.\n`);

    let totalUpdated = 0;
    let updateCount = 0;
    let selectCount = 0;
    let skipCount = 0;

    for (const stmt of statements) {
        const upper = stmt.toUpperCase();

        if (upper.startsWith('START') || upper.startsWith('COMMIT') || upper.startsWith('ROLLBACK')) {
            // 트랜잭션 키워드는 mysql2/promise 가 자동 처리 — 명시적으로도 안전
            try {
                await pool.query(stmt);
            } catch (e) {
                // 풀 환경에서는 무시해도 안전
            }
            continue;
        }

        if (upper.startsWith('SELECT')) {
            selectCount++;
            try {
                const [rows] = await pool.query(stmt);
                console.log(`\n📋 확인용 SELECT 결과 (상위 ${Math.min(rows.length, 20)}개):`);
                rows.slice(0, 20).forEach(r => {
                    console.log(`   [EWG ${String(r.ewg_grade ?? '-').padStart(2)}] ${r.ingre_name}: ${r.skin_warning}`);
                });
                if (rows.length > 20) console.log(`   ... 외 ${rows.length - 20}개 더 있음`);
            } catch (e) {
                console.warn(`   ⚠ SELECT 실패: ${e.message}`);
            }
            continue;
        }

        if (upper.startsWith('UPDATE')) {
            updateCount++;
            try {
                const [result] = await pool.query(stmt);
                const affected = result.affectedRows || 0;
                totalUpdated += affected;
                const label = stmt.match(/WHERE[\s\S]*?(IN\s*\([^)]+\)|=\s*'[^']+')/i)?.[0] || '';
                const labelShort = label.length > 80 ? label.slice(0, 80) + '…' : label;
                if (affected > 0) {
                    console.log(`   ✓ ${String(affected).padStart(3)} rows  |  ${labelShort}`);
                } else {
                    skipCount++;
                }
            } catch (e) {
                console.warn(`   ⚠ UPDATE 실패: ${e.message}`);
                console.warn(`     statement: ${stmt.slice(0, 120)}...`);
            }
            continue;
        }

        // 기타 statement
        try {
            await pool.query(stmt);
        } catch (e) {
            console.warn(`   ⚠ 실행 실패: ${e.message}`);
        }
    }

    console.log('\n═══════════════════════════════════════════════════');
    console.log(` 완료: UPDATE ${updateCount}건 실행 → 총 ${totalUpdated} 행 변경`);
    console.log(`        (매칭 0건 UPDATE: ${skipCount}건, SELECT: ${selectCount}건)`);
    console.log('═══════════════════════════════════════════════════');

    await pool.end();
    process.exit(0);
}

run().catch(err => {
    console.error('\n❌ 스크립트 실행 실패:', err);
    process.exit(1);
});
