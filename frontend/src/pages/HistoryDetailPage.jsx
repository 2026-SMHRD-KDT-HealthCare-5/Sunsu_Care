import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { generateAIReason, fetchRecommendations } from '../api/analysisApi';
import { fetchProfile } from '../api/profileApi';
import { getProductImageUrl } from '../utils/imageUrl';
import './HistoryDetailPage.css';

const HistoryDetailPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { id: paramId } = useParams();

    // 🌟 MyPage에서 넘어온 item 데이터 구조에 맞추기
    // item = { id, name, date, score, status, keyIng: [string], warnIng: [string] }
    const raw = location.state?.analysisData;
    const report = {
        name: raw?.name || "분석된 제품",
        date: raw?.date || "",
        score: raw?.score ?? 0,
        status: raw?.status || "알 수 없음",
        keyIng: Array.isArray(raw?.keyIng) ? raw.keyIng : [],
        warnIng: Array.isArray(raw?.warnIng) ? raw.warnIng : []
    };

    // 🤖 Gemini AI 추천 이유 상태
    const [aiReason, setAiReason] = useState('');
    const [reasonLoading, setReasonLoading] = useState(true);
    const [reasonError, setReasonError] = useState('');

    // 🎁 추천 제품 TOP 3 상태
    const [recommendations, setRecommendations] = useState([]);
    const [recoLoading, setRecoLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        const loadRecs = async () => {
            try {
                const data = await fetchRecommendations();
                if (mounted) {
                    setRecommendations(Array.isArray(data) ? data : []);
                    setRecoLoading(false);
                }
            } catch (err) {
                console.error('[HistoryDetail] 추천 제품 조회 실패:', err);
                if (mounted) setRecoLoading(false);
            }
        };
        loadRecs();
        return () => { mounted = false; };
    }, []);

    useEffect(() => {
        let isMounted = true;

        const loadAIReason = async () => {
            // 데이터가 없으면 호출하지 않음
            if (!raw?.name) {
                if (isMounted) {
                    setAiReason('분석 데이터가 없어 추천 이유를 생성할 수 없습니다.');
                    setReasonLoading(false);
                }
                return;
            }

            try {
                // 사용자 피부 타입 가져오기 (있으면)
                let skinType = '미설정';
                try {
                    const profile = await fetchProfile();
                    if (profile?.skin_type) skinType = profile.skin_type;
                } catch (e) {
                    console.warn('[HistoryDetail] 프로필 조회 실패, 미설정으로 진행');
                }

                if (!isMounted) return;

                const data = await generateAIReason({
                    analysisIdx: paramId,   // 캐시 키
                    prodName: report.name,
                    score: report.score,
                    keyIng: report.keyIng,
                    warnIng: report.warnIng,
                    skinType
                });

                if (isMounted) {
                    setAiReason(data.reason || '추천 이유를 받아오지 못했습니다.');
                    setReasonLoading(false);
                    if (data.cached) {
                        console.log('💾 [HistoryDetail] 캐시된 AI 응답 사용');
                    }
                }
            } catch (err) {
                const status = err.response?.status;
                const backendData = err.response?.data;
                const userReason = backendData?.reason || '사용자 피부 타입과 분석된 성분을 종합하여 적합도를 평가했습니다.';

                console.error('[HistoryDetail] AI 추천 이유 생성 실패:', backendData?.message || err.message);

                if (isMounted) {
                    // 429 (한도 초과)는 친절한 메시지로 표시
                    if (status === 429) {
                        setReasonError('AI 요청 한도 초과 — 1분 후 새로고침해보세요');
                    } else {
                        setReasonError(`AI 호출 실패: ${backendData?.message || err.message}`);
                    }
                    setAiReason(userReason);
                    setReasonLoading(false);
                }
            }
        };

        loadAIReason();
        return () => { isMounted = false; };
    }, [raw?.name, report.score]);

    return (
        <div className="legacy-detail-container fade-in-up">
            <div className="legacy-detail-close-wrap">
                <button onClick={() => navigate(-1)} className="legacy-detail-close-btn">
                    <i className="fa-solid fa-xmark"></i>
                </button>
            </div>

            {/* 1. 최상단 점수판 (제품명 표시 없음) */}
            <div className="legacy-detail-score-card">
                <div className="legacy-detail-score">
                    {report.score}<span> / 100</span>
                </div>
                <span className={`legacy-status-badge ${report.status === '적합' || report.status === '최적' ? 'safe' : 'warn'}`}>
                    {report.status}
                </span>
            </div>

            {/* 2. 핵심 성분 */}
            <div className="legacy-detail-card">
                <h4 className="legacy-sec-title">
                    <i className="fa-solid fa-heart icon-heart"></i> 핵심 성분
                </h4>
                <div className="legacy-ing-list">
                    {report.keyIng.length > 0 ? (
                        report.keyIng.map((ingName, idx) => (
                            <div className="legacy-key-row" key={idx}>
                                <span className="legacy-key-name">{ingName}</span>
                                <span className="legacy-key-desc">주요 성분</span>
                            </div>
                        ))
                    ) : (
                        <p className="legacy-empty-msg">매칭된 핵심 성분이 없습니다.</p>
                    )}
                </div>
            </div>

            {/* 3. 주의 성분 */}
            <div className="legacy-detail-card">
                <h4 className="legacy-sec-title">
                    <i className="fa-solid fa-triangle-exclamation icon-warn"></i> 주의 성분
                </h4>
                <div className="legacy-ing-list">
                    {report.warnIng.length > 0 ? (
                        report.warnIng.map((ingName, idx) => (
                            <div className="legacy-warn-row" key={idx}>
                                <span className="legacy-warn-name">{ingName}</span>
                                <span className="legacy-warn-desc">주의 필요</span>
                            </div>
                        ))
                    ) : (
                        <p className="legacy-empty-msg">주의가 필요한 성분이 없습니다.</p>
                    )}
                </div>
            </div>

            {/* 4. 추천 이유 (Gemini AI 생성) */}
            <div className="legacy-detail-card">
                <h4 className="legacy-sec-title">
                    <i className="fa-solid fa-book-open icon-book"></i> 적합도 분석
                    <span className="legacy-ai-badge">Google Gemini</span>
                </h4>
                {reasonLoading ? (
                    <p className="legacy-reason-text legacy-reason-loading">
                        <i className="fa-solid fa-spinner fa-spin icon-spinner"></i>
                        AI가 맞춤형 추천 이유를 작성하고 있어요...
                    </p>
                ) : (
                    <>
                        <p className="legacy-reason-text">{aiReason}</p>
                        {reasonError && (
                            <p className="legacy-reason-error">⚠️ {reasonError}</p>
                        )}
                    </>
                )}
            </div>

            {/* 5. 추천 제품 (대안 제시) - 사용자 프로필 기반 TOP 3 */}
            <div className="legacy-detail-card">
                <h4 className="legacy-sec-title">
                    <i className="fa-solid fa-wand-magic-sparkles icon-wand"></i> 사용자 적합도 기반 추천 제품 TOP 3
                </h4>
                {recoLoading ? (
                    <p className="legacy-empty-msg">
                        <i className="fa-solid fa-spinner fa-spin"></i> 추천 제품을 찾는 중...
                    </p>
                ) : recommendations.length === 0 ? (
                    <p className="legacy-empty-msg">아직 추천 가능한 제품이 없습니다.</p>
                ) : (
                    recommendations.map((rec) => {
                        const imgUrl = getProductImageUrl(rec.image_filename);
                        return (
                            <div className="legacy-recom-card" key={rec.prod_idx}>
                                <div className="legacy-recom-thumb">
                                    {imgUrl ? (
                                        <img
                                            src={imgUrl}
                                            alt={rec.prod_name}
                                            onError={(e) => {
                                                e.currentTarget.onerror = null;
                                                e.currentTarget.style.display = 'none';
                                                e.currentTarget.parentElement.classList.add('no-image');
                                            }}
                                        />
                                    ) : (
                                        <div className="legacy-recom-thumb-placeholder">
                                            <i className="fa-solid fa-image"></i>
                                        </div>
                                    )}
                                </div>
                                <div className="legacy-recom-info">
                                    <div className="legacy-recom-head">
                                        <span className="legacy-recom-brand">{rec.brand_name}</span>
                                        <span className={`legacy-recom-score ${rec.status === '적합' || rec.status === '최적' ? 'safe' : 'warn'}`}>
                                            {rec.score}점
                                        </span>
                                    </div>
                                    <h5 className="legacy-recom-name">{rec.prod_name}</h5>
                                    <div className="legacy-recom-tags">
                                        {rec.spf_val && <span className="legacy-recom-tag">{rec.spf_val}</span>}
                                        {rec.pa_val && <span className="legacy-recom-tag">{rec.pa_val}</span>}
                                        {rec.uv_type && <span className="legacy-recom-tag solid">{rec.uv_type}</span>}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* 6. 하단 버튼 영역 */}
            <div className="legacy-btn-group">
                <button className="legacy-btn-outline" onClick={() => navigate('/scan')}>
                    <i className="fa-solid fa-rotate icon-rotate"></i> 재분석
                </button>
                <button className="legacy-btn-solid" onClick={() => navigate('/guide')}>
                    <i className="fa-solid fa-book icon-book-white"></i> 세안 가이드
                </button>
            </div>
        </div>
    );
};

export default HistoryDetailPage;