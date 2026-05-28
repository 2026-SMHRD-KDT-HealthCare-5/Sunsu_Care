// backend/src/utils/compatibilityScore.js
// 프로필 + 검출 성분 → 적합도 점수 계산 (Node.js 버전)
// 🔥 까다로운 채점 로직 (100점은 거의 불가능, 평균 60~70점대)

/**
 * 적합도 점수 계산
 * @param {Array}  detectedIngredients - 검출된 성분 배열 [{ingre_name, ewg_grade, skin_warning, ...}]
 * @param {object} profile - 사용자 프로필 { skin_type, activity_env, prod_type, avoid_ingredient }
 * @returns {{ score: number, status: string, breakdown: object }}
 */
function calculateCompatibility(detectedIngredients = [], profile = {}) {
    const BASE_SCORE = 70;  // 80 → 70 (점수 천장 낮춤)

    const breakdown = {
        base: BASE_SCORE,
        warnDeduction: 0,        // 위험 성분 감점
        avoidDeduction: 0,       // 기피 성분 매칭 감점
        keyBonus: 0,             // 핵심 성분 가점
        skinTypeBonus: 0,        // 피부 타입 보정
        envBonus: 0              // 활동 환경 보정
    };

    // ===== 1. 위험 등급 성분 감점 (대폭 강화) =====
    detectedIngredients.forEach(ing => {
        const grade = Number(ing.ewg_grade) || 0;
        if (grade >= 7)        breakdown.warnDeduction -= 20;  // 고위험: -20 (was -10)
        else if (grade >= 5)   breakdown.warnDeduction -= 10;  // 중위험: -10 (신설)
        else if (grade >= 3)   breakdown.warnDeduction -= 5;   // 저위험: -5
    });

    // ===== 2. 핵심 성분 가점 ('도움' 또는 '기능성' 포함) =====
    let keyCount = 0;
    detectedIngredients.forEach(ing => {
        const warning = ing.skin_warning || '';
        if (warning.includes('도움') || warning.includes('기능성')) keyCount++;
    });
    breakdown.keyBonus = Math.min(keyCount * 3, 15);  // max +15 (5개 이상 필요)

    // ===== 3. 기피 성분 매칭 감점 (대폭 강화) =====
    let avoidList = [];
    if (Array.isArray(profile.avoid_ingredient)) {
        avoidList = profile.avoid_ingredient;
    } else if (typeof profile.avoid_ingredient === 'string' && profile.avoid_ingredient) {
        avoidList = profile.avoid_ingredient.split(',').map(s => s.trim());
    }
    if (avoidList.length > 0) {
        const detectedNames = detectedIngredients.map(i => (i.ingre_name || '').toLowerCase());
        avoidList.forEach(avoid => {
            const avoidLower = avoid.toLowerCase();
            const hit = detectedNames.some(name => name.includes(avoidLower) || avoidLower.includes(name));
            if (hit) breakdown.avoidDeduction -= 25;  // -15 → -25 (강화)
        });
    }

    // ===== 4. 피부 타입 보정 (개수 기반으로 세분화) =====
    const skinType = profile.skin_type || '';
    if (skinType.includes('민감')) {
        // 민감성: 위험 성분 영향 더 크게 → 추가 -10 (was -5)
        if (breakdown.warnDeduction < 0) breakdown.skinTypeBonus -= 10;
    } else if (skinType.includes('건성')) {
        // 건성: 보습 성분 매칭 개수 * 2 (max +6, 3개 이상 필요)
        const moisturizers = ['글리세린', '히알루론산', '판테놀', '알란토인', '세라마이드'];
        const matchCount = detectedIngredients.filter(ing =>
            moisturizers.some(m => (ing.ingre_name || '').includes(m))
        ).length;
        breakdown.skinTypeBonus += Math.min(matchCount * 2, 6);
    } else if (skinType.includes('지성')) {
        // 지성: 오일/버터 성분 개수 * -3 (max -9, was 단순 -3)
        const oilHeavy = ['오일', '버터'];
        const oilCount = detectedIngredients.filter(ing =>
            oilHeavy.some(o => (ing.ingre_name || '').includes(o))
        ).length;
        breakdown.skinTypeBonus -= Math.min(oilCount * 3, 9);
    }

    // ===== 5. 활동 환경 보정 (개수 기반) =====
    const env = profile.activity_env || '';
    if (env.includes('실외') || env.includes('야외')) {
        const uvCount = detectedIngredients.filter(ing => {
            const w = ing.skin_warning || '';
            return w.includes('자외선') || w.includes('차단');
        }).length;
        // 야외: UV 차단 성분 개수 * 2 (max +5, 3개 이상이어야 풀 보너스)
        breakdown.envBonus += Math.min(uvCount * 2, 5);
    }

    // ===== 최종 점수 계산 =====
    let score = breakdown.base
              + breakdown.warnDeduction
              + breakdown.avoidDeduction
              + breakdown.keyBonus
              + breakdown.skinTypeBonus
              + breakdown.envBonus;

    // 0~100 범위로 클램프
    score = Math.max(0, Math.min(100, score));

    // ===== 상태 라벨 (까다롭게 조정) =====
    let status;
    if (score >= 90)      status = '최적';
    else if (score >= 75) status = '적합';
    else if (score >= 50) status = '주의';
    else                  status = '부적합';

    return { score, status, breakdown };
}

module.exports = { calculateCompatibility };
