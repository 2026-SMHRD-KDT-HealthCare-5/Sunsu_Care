import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { fetchProfile } from '../api/profileApi';
import { fetchHistory } from '../api/analysisApi';
import { calculateCompatibility } from '../utils/compatibilityScore';
import './MyPage.css';

/* ==========================================================================
   상수 (매직 넘버/문자열 제거)
   ========================================================================== */
const DEFAULT_INITIAL = 'S';
const TOP_INGREDIENTS_COUNT = 3;
const WARN_EWG_GRADE = 3;
const SCORE_PASS_THRESHOLD = 75;
const KEY_INGREDIENT_KEYWORDS = ['도움', '기능성'];

const GREETING_LOGGED_IN = '오늘도 좋은 하루 보내세요';
const GREETING_GUEST = 'Sun手Care에 오신 걸 환영해요';

const FALLBACK_PRODUCT_NAME = '분석된 제품';
const FALLBACK_NEW_PRODUCT_NAME = '방금 분석한 제품';
const FALLBACK_USER_NAME = '사용자';
const GUEST_NAME = '게스트';

const DEFAULT_SKIN_INFO = {
    type: "미설정",
    activity_env: "미설정",
    texture: "미설정",
    avoid: "미설정"
};

/* ==========================================================================
   유틸 함수 (테스트/재사용 가능 단위로 분리)
   ========================================================================== */

// 점수 기반 status 클래스 판정 (배지/색상)
const getStatusClass = (score) =>
    score >= SCORE_PASS_THRESHOLD ? 'safe' : 'warn';

// DB 응답 → UI 모델 매핑
// 🌟 백엔드의 key_ingredients_data ({name, warning} 배열) 우선 사용,
//    없으면 기존 콤마 문자열 fallback (구 데이터 호환)
const mapDbHistoryItem = (item) => ({
    id: item.analysis_idx,
    name: item.prod_name || FALLBACK_PRODUCT_NAME,
    date: new Date(item.joined_at).toLocaleDateString(),
    score: item.match_score || 0,
    status: item.match_status
        || (item.match_score >= SCORE_PASS_THRESHOLD ? '적합' : '주의'),
    keyIng: normalizeIngredientList(item.key_ingredients_data, item.key_ingredients),
    warnIng: normalizeIngredientList(item.warn_ingredients_data, item.warn_ingredients)
});

// 프로필 응답 → mySkinInfo 매핑
const mapProfileToSkinInfo = (profile) => ({
    type: profile.skin_type || "미설정",
    activity_env: profile.activity_env || "미설정",
    texture: profile.prod_type || "미설정",
    avoid: (Array.isArray(profile.avoid_ingredient) && profile.avoid_ingredient.length > 0)
        ? profile.avoid_ingredient.join(', ')
        : (profile.avoid_ingredient || "없음")
});

// 중복 제거 헬퍼 (OCR 영/한 동시 추출로 같은 성분이 두 번 들어오는 케이스 방지)
const uniqueNames = (arr) => [...new Set(arr.filter(Boolean))];

// 객체 배열 ({name, warning}) dedup (name 기준)
const uniqueByName = (arr) => {
    const seen = new Set();
    const out = [];
    for (const item of arr) {
        if (!item?.name || seen.has(item.name)) continue;
        seen.add(item.name);
        out.push(item);
    }
    return out;
};

// 콤마 문자열 fallback → 객체 배열 형태 정규화
const normalizeIngredientList = (data, fallbackCsv) => {
    if (Array.isArray(data) && data.length > 0) {
        return uniqueByName(
            data
                .filter(Boolean)
                .map(it => typeof it === 'string'
                    ? { name: it.trim(), warning: '' }
                    : { name: String(it.name || '').trim(), warning: it.warning || '' }
                )
                .filter(it => it.name)
        );
    }
    if (typeof fallbackCsv === 'string' && fallbackCsv.trim()) {
        return uniqueByName(
            fallbackCsv.split(',').map(s => ({ name: s.trim(), warning: '' })).filter(it => it.name)
        );
    }
    return [];
};

// 새 분석 결과 → UI 모델 빌드 — 객체 배열 {name, warning} 형태로 통일
const buildNewAnalysisItem = (data, userProfile) => {
    const detected = data.ingredients?.detected_ingredients || [];

    const toBrief = (i) => ({
        name: i.ingre_name,
        warning: i.skin_warning || ''
    });

    // 핵심: ewg_grade 낮은 순(=안전순) + 이름 사전순
    const keyCandidates = detected.filter(i =>
        i.skin_warning && KEY_INGREDIENT_KEYWORDS.some(k => i.skin_warning.includes(k))
    );
    keyCandidates.sort((a, b) =>
        (a.ewg_grade ?? 99) - (b.ewg_grade ?? 99)
        || String(a.ingre_name).localeCompare(String(b.ingre_name))
    );
    const keyIng = uniqueByName(keyCandidates.map(toBrief)).slice(0, TOP_INGREDIENTS_COUNT);

    // 주의: ewg_grade 높은 순(=위험순) + 이름 사전순
    const warnCandidates = detected.filter(i => i.ewg_grade >= WARN_EWG_GRADE);
    warnCandidates.sort((a, b) =>
        (b.ewg_grade ?? 0) - (a.ewg_grade ?? 0)
        || String(a.ingre_name).localeCompare(String(b.ingre_name))
    );
    const warnIng = uniqueByName(warnCandidates.map(toBrief)).slice(0, TOP_INGREDIENTS_COUNT);

    const { score, status } = calculateCompatibility(detected, userProfile || {});

    return {
        id: data.analysis_idx || `new-${Date.now()}`,
        name: data.prod_name || FALLBACK_NEW_PRODUCT_NAME,
        date: new Date().toLocaleDateString(),
        score,
        status,
        keyIng,
        warnIng
    };
};

// 성분 핑거프린트 (중복 검사용) — 객체 배열에서 name 만 추출 후 정렬
const computeFingerprint = (item) => {
    const names = [...(item.keyIng || []), ...(item.warnIng || [])]
        .map(it => typeof it === 'string' ? it : (it?.name || ''))
        .filter(Boolean);
    return names.sort().join('|');
};

// id 또는 핑거프린트로 중복 판정
const isDuplicateItem = (newItem, existingItems) => {
    if (existingItems.some(it => it.id === newItem.id)) return true;
    const newFp = computeFingerprint(newItem);
    if (!newFp) return false;
    return existingItems.some(it => computeFingerprint(it) === newFp);
};

/* ==========================================================================
   컴포넌트
   ========================================================================== */
const MyPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const sliderRef = useRef(null);

    const { isLoggedIn, userNickname, userEmail } = useAuth();
    const displayName = isLoggedIn
        ? (userNickname || userEmail || FALLBACK_USER_NAME)
        : GUEST_NAME;
    const userInitial = isLoggedIn && userNickname
        ? userNickname.charAt(0)
        : DEFAULT_INITIAL;
    const greeting = isLoggedIn ? GREETING_LOGGED_IN : GREETING_GUEST;

    const [historyData, setHistoryData] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(1);
    const [mySkinInfo, setMySkinInfo] = useState(DEFAULT_SKIN_INFO);

    // location.state.newAnalysis 의 stable trigger (객체 참조 변경 방지)
    const newAnalysisTrigger = JSON.stringify(location.state?.newAnalysis);

    useEffect(() => {
        // 🌟 로그아웃 시 이전 데이터 초기화
        if (!isLoggedIn) {
            setHistoryData([]);
            setMySkinInfo(DEFAULT_SKIN_INFO);
            setCurrentIndex(1);
            return;
        }

        const loadPageData = async () => {
            // 1. 프로필 (점수 계산에 필요)
            let userProfile = null;
            try {
                userProfile = await fetchProfile();
                if (userProfile) {
                    setMySkinInfo(mapProfileToSkinInfo(userProfile));
                }
            } catch (err) {
                console.error("프로필 로드 실패:", err);
            }

            // 2. DB 히스토리
            let finalHistory = [];
            try {
                const dbData = await fetchHistory();
                if (Array.isArray(dbData)) {
                    finalHistory = dbData.map(mapDbHistoryItem);
                }
            } catch (err) {
                console.error("히스토리 로드 실패:", err);
            }

            // 3. ScanPage 에서 넘어온 신규 분석 합치기 (핑거프린트 dedup)
            if (location.state?.newAnalysis) {
                const newItem = buildNewAnalysisItem(location.state.newAnalysis, userProfile);
                if (!isDuplicateItem(newItem, finalHistory)) {
                    finalHistory = [newItem, ...finalHistory];
                }
            }

            setHistoryData(finalHistory);
            setCurrentIndex(1);
        };

        loadPageData();
    }, [isLoggedIn, newAnalysisTrigger]);

    const scrollSlider = (direction) => {
        if (!sliderRef.current) return;
        const scrollAmount = sliderRef.current.offsetWidth;
        sliderRef.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth'
        });
    };

    const handleSliderScroll = () => {
        if (!sliderRef.current) return;
        const scrollLeft = sliderRef.current.scrollLeft;
        const cardWidth = sliderRef.current.offsetWidth;
        const newIndex = Math.round(scrollLeft / cardWidth) + 1;

        if (newIndex !== currentIndex && newIndex >= 1 && newIndex <= historyData.length) {
            setCurrentIndex(newIndex);
        }
    };

    const goToAccountSettings = () => navigate('/account-settings');

    return (
        <div className="mypage-container">
            <h1 className="mypage-title">
                <i className="fa-solid fa-user-check"></i>
                나의 피부정보
            </h1>

            {/* ── 사용자 카드 (로그인 시 클릭 → /account-settings) ── */}
            <div
                className={`mypage-card mypage-user-card ${isLoggedIn ? 'is-clickable' : ''}`}
                onClick={isLoggedIn ? goToAccountSettings : undefined}
                role={isLoggedIn ? 'button' : undefined}
                tabIndex={isLoggedIn ? 0 : undefined}
            >
                <div className="mypage-user-row">
                    {/* 좌: 아바타 */}
                    <div className="mypage-user-avatar">{userInitial}</div>

                    {/* 중: 이름 + 인사말 */}
                    <div className="mypage-user-text">
                        <h2 className="mypage-user-name">{displayName}</h2>
                        <div className="mypage-user-greeting">{greeting}</div>
                    </div>

                    {/* 우: 회원정보 관리 (연필 아이콘) */}
                    {isLoggedIn && (
                        <div className="mypage-user-action" aria-label="회원정보 관리">
                            <i className="fa-solid fa-pen"></i>
                        </div>
                    )}
                </div>
            </div>

            {/* ── 내 피부 정보 ── */}
            <div className="mypage-card">
                <div className="mypage-card-header">
                    <h3 className="mypage-card-title">
                        <i className="fa-solid fa-droplet icon-droplet"></i> 내 피부 정보
                    </h3>
                    <span
                        className="mypage-card-link"
                        onClick={() => navigate('/profile', { state: { from: '/mypage' } })}
                    >
                        수정하기 <i className="fa-solid fa-angle-right"></i>
                    </span>
                </div>

                <div className="skin-info-grid">
                    <div className="skin-info-item">
                        <span className="info-label">피부 타입</span>
                        <span className="info-value tag">{mySkinInfo.type}</span>
                    </div>
                    <div className="skin-info-item">
                        <span className="info-label">활동 환경</span>
                        <span className="info-value tag">{mySkinInfo.activity_env}</span>
                    </div>
                    <div className="skin-info-item">
                        <span className="info-label">선호 제형</span>
                        <span className="info-value tag">{mySkinInfo.texture}</span>
                    </div>
                    <div className="skin-info-item">
                        <span className="info-label">기피 성분</span>
                        <span className="info-value tag">{mySkinInfo.avoid}</span>
                    </div>
                </div>
            </div>

            {/* ── 분석 히스토리 ── */}
            <div className="mypage-card history-section">
                <div className="history-header">
                    <h3 className="history-title">
                        📊 분석 히스토리 ({historyData.length > 0 ? currentIndex : 0}/{historyData.length})
                    </h3>
                    <div className="slider-controls">
                        <button
                            type="button"
                            onClick={() => scrollSlider('left')}
                            className="slider-arrow"
                            disabled={currentIndex <= 1}
                            aria-label="이전 분석 보기"
                        >
                            <i className="fa-solid fa-chevron-left"></i>
                        </button>

                        <button
                            type="button"
                            onClick={() => scrollSlider('right')}
                            className="slider-arrow"
                            disabled={currentIndex >= historyData.length}
                            aria-label="다음 분석 보기"
                        >
                            <i className="fa-solid fa-chevron-right"></i>
                        </button>
                    </div>
                </div>

                {historyData.length === 0 ? (
                    <div className="history-empty">
                        아직 분석한 제품이 없어요.<br />
                        <button
                            type="button"
                            className="history-empty-btn"
                            onClick={() => navigate('/scan')}
                        >
                            첫 제품 분석하러 가기 →
                        </button>
                    </div>
                ) : (
                    <div className="history-slider" ref={sliderRef} onScroll={handleSliderScroll}>
                        {historyData.map((item) => (
                            <div key={item.id} className="history-slide-card">
                                <div className="slide-card-header">
                                    <div className="slide-card-head-text">
                                        <h4 className="slide-card-title">{item.name}</h4>
                                        <span className="slide-card-date">{item.date}</span>
                                    </div>
                                    <div className="slide-card-score-box">
                                        <span className="score-num">
                                            {item.score}<span className="score-total"> / 100</span>
                                        </span>
                                        <span className={`status-badge ${getStatusClass(item.score)}`}>
                                            {item.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="slide-card-body">
                                    <div className="mini-ing-section key">
                                        <div className="mini-ing-title">
                                            <i className="fa-solid fa-gem"></i> 매칭된 핵심 성분
                                        </div>
                                        <div className="mini-ing-tags">
                                            {item.keyIng.length > 0 ? (
                                                item.keyIng.map((ing, idx) => (
                                                    <span key={idx} className="mini-tag mini-tag--key">{typeof ing === 'string' ? ing : ing.name}</span>
                                                ))
                                            ) : (
                                                <span className="mini-tag mini-tag--empty">매칭된 핵심 성분 없음</span>
                                            )}
                                        </div>
                                    </div>

                                    {item.warnIng && item.warnIng.length > 0 ? (
                                        <div className="mini-ing-section warn">
                                            <div className="mini-ing-title">
                                                <i className="fa-solid fa-triangle-exclamation"></i> 주의 성분 발견
                                            </div>
                                            <div className="mini-ing-tags">
                                                {item.warnIng.map((ing, idx) => (
                                                    <span key={idx} className="mini-tag mini-tag--warn">{typeof ing === 'string' ? ing : ing.name}</span>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="mini-ing-section safe-clean">
                                            <div className="mini-ing-title">
                                                <i className="fa-solid fa-shield-heart"></i> 주의 필요 성분 없음
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div
                                    className="slide-card-footer"
                                    onClick={() => navigate(`/history/${item.id}`, { state: { analysisData: item } })}
                                    role="button"
                                    tabIndex={0}
                                >
                                    상세 리포트 확인하기 <i className="fa-solid fa-arrow-right"></i>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── 하단 단축 제어 버튼 ── */}
            <div className="action-btn-container">
                <button type="button" className="re-analyze-btn" onClick={() => navigate('/scan')}>
                    <i className="fa-solid fa-rotate-right"></i> 다시 분석
                </button>
                {isLoggedIn ? (
                    <button type="button" className="logout-btn-half" onClick={() => navigate('/logout')}>
                        <i className="fa-solid fa-arrow-right-from-bracket"></i> 로그아웃
                    </button>
                ) : (
                    <button type="button" className="logout-btn-half" onClick={() => navigate('/login')}>
                        <i className="fa-solid fa-arrow-right-to-bracket"></i> 로그인
                    </button>
                )}
            </div>
        </div>
    );
};

export default MyPage;
