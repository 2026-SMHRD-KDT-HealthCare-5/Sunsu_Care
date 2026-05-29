import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { fetchProfile } from '../api/profileApi';
import {
    fetchHistory,
    generateAIReason,
    fetchRecommendations,
    deleteAnalysis,
    saveAnalysis
} from '../api/analysisApi';
import { getProductImageUrl } from '../utils/imageUrl';
import './HistoryDetailPage.css';

// 성분 설명 (정적, MIK 유지)
const KEY_DESC_MAP = {
    '나이아신아마이드': '미백, 피부 장벽 강화',
    '히알루론산': '깊은 보습',
    '산화아연': '자외선 차단(무기자차)',
    '징크옥사이드': '자외선 차단(무기자차)',
    '판테놀': '피부 진정 및 보습',
    '글리세린': '깊은 보습',
    '알란토인': '피부 진정'
};
const WARN_DESC_MAP = {
    '옥시벤존': '민감성 피부에 자극이 될 수 있음',
    '향료': '알레르기 반응 가능성',
    '에탄올': '수분 증발로 인한 건조함 유발'
};

// 점수에 따른 색상 (75+ 초록 / 50~74 노랑 / <50 빨강)
const getScoreColorClass = (score) => {
    if (score >= 75) return 'score-good';
    if (score >= 50) return 'score-warn';
    return 'score-danger';
};

const HistoryDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    // 🌟 MIK 커스텀 모달
    const [modal, setModal] = useState({
        isOpen: false,
        type: 'alert',
        message: '',
        onConfirm: null
    });

    // 분석 히스토리 목록 (DB 실시간)
    const [savedList, setSavedList] = useState([]);
    const [listLoaded, setListLoaded] = useState(false);

    // 현재 항목 데이터
    const raw = location.state?.analysisData;
    const [report, setReport] = useState(() => ({
        id: raw?.id || id,
        name: raw?.name || "분석된 제품",
        date: raw?.date || "",
        score: raw?.score ?? 0,
        status: raw?.status || "알 수 없음",
        keyIng: Array.isArray(raw?.keyIng) ? raw.keyIng : [],
        warnIng: Array.isArray(raw?.warnIng) ? raw.warnIng : []
    }));

    // location.state가 바뀌면 report 갱신 (prev/next 이동 시)
    useEffect(() => {
        if (raw) {
            setReport({
                id: raw.id || id,
                name: raw.name || "분석된 제품",
                date: raw.date || "",
                score: raw.score ?? 0,
                status: raw.status || "알 수 없음",
                keyIng: Array.isArray(raw.keyIng) ? raw.keyIng : [],
                warnIng: Array.isArray(raw.warnIng) ? raw.warnIng : []
            });
        }
    }, [raw, id]);

    // 사용자 프로필 (AI 호출용)
    const [userProfile, setUserProfile] = useState({ basicType: '미설정' });

    // 🤖 Gemini AI 추천 이유
    const [aiReason, setAiReason] = useState('');
    const [reasonLoading, setReasonLoading] = useState(true);
    const [reasonError, setReasonError] = useState('');

    // 🎁 추천 제품 TOP 3 (이미지 포함)
    const [recommendations, setRecommendations] = useState([]);
    const [recoLoading, setRecoLoading] = useState(true);

    // 작업 진행 중 플래그 (저장/삭제 동안 화살표 비활성화)
    const [busy, setBusy] = useState(false);

    // ============================================================
    // 1) 히스토리 목록 + 프로필 로드
    // ============================================================
    useEffect(() => {
        let mounted = true;

        // 히스토리 목록
        fetchHistory()
            .then(data => {
                if (mounted && Array.isArray(data)) {
                    setSavedList(data.map(item => ({
                        id: item.analysis_idx,
                        name: item.prod_name || '분석된 제품',
                        date: new Date(item.joined_at).toLocaleDateString(),
                        score: item.match_score ?? 0,
                        status: item.match_status || (item.match_score >= 75 ? '적합' : '주의'),
                        keyIng: item.key_ingredients ? item.key_ingredients.split(',') : [],
                        warnIng: item.warn_ingredients ? item.warn_ingredients.split(',') : []
                    })));
                    setListLoaded(true);
                }
            })
            .catch(err => {
                console.error('[HistoryDetail] 목록 조회 실패:', err);
                if (mounted) setListLoaded(true);
            });

        // 프로필
        fetchProfile()
            .then(profile => {
                if (mounted && profile) {
                    setUserProfile({
                        basicType: profile.skin_type || '미설정',
                        concern: Array.isArray(profile.avoid_ingredient)
                            ? profile.avoid_ingredient.join(', ')
                            : (profile.avoid_ingredient || '미설정')
                    });
                }
            })
            .catch(() => {});

        return () => { mounted = false; };
    }, []);

    // ============================================================
    // 안정성 #6: URL 직접 접근 시 state 없으면 savedList에서 찾기
    // ============================================================
    useEffect(() => {
        if (!listLoaded) return;
        if (raw) return; // state 있으면 그대로 사용

        const found = savedList.find(item => Number(item.id) === Number(id));
        if (found) {
            setReport(found);
        } else if (savedList.length > 0) {
            // id가 본인 분석이 아니면 첫 번째 분석으로
            navigate(`/history/${savedList[0].id}`, {
                replace: true,
                state: { analysisData: savedList[0] }
            });
        } else {
            // 분석 자체가 없으면 마이페이지로
            navigate('/mypage', { replace: true });
        }
    }, [listLoaded, savedList, id, raw, navigate]);

    // ============================================================
    // 2) 추천 제품 TOP 3
    // ============================================================
    useEffect(() => {
        let mounted = true;
        fetchRecommendations()
            .then(data => {
                if (mounted) {
                    setRecommendations(Array.isArray(data) ? data : []);
                    setRecoLoading(false);
                }
            })
            .catch(err => {
                console.error('[HistoryDetail] 추천 제품 조회 실패:', err);
                if (mounted) setRecoLoading(false);
            });
        return () => { mounted = false; };
    }, []);

    // ============================================================
    // 3) Gemini AI 추천 이유
    // ============================================================
    useEffect(() => {
        let mounted = true;
        const loadAIReason = async () => {
            if (!report?.name || report.name === "분석된 제품") {
                if (mounted) {
                    setAiReason('분석 데이터가 없어 추천 이유를 생성할 수 없습니다.');
                    setReasonLoading(false);
                }
                return;
            }
            setReasonLoading(true);
            setReasonError('');
            try {
                const data = await generateAIReason({
                    analysisIdx: id,
                    prodName: report.name,
                    score: report.score,
                    keyIng: report.keyIng,
                    warnIng: report.warnIng,
                    skinType: userProfile.basicType || '미설정'
                });
                if (mounted) {
                    setAiReason(data.reason || '추천 이유를 받아오지 못했습니다.');
                    setReasonLoading(false);
                }
            } catch (err) {
                const status = err.response?.status;
                const backendData = err.response?.data;
                const userReason = backendData?.reason
                    || `사용자의 ${userProfile.basicType} 피부에 자극을 줄 수 있는 ${report.warnIng[0] || '유해 성분'}이(가) 포함되어 있어, 적합한 다른 제품을 추천합니다.`;
                if (mounted) {
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
        return () => { mounted = false; };
    }, [id, report.name, report.score, userProfile.basicType]);

    // ============================================================
    // prev/next 네비게이션 (안정성 #2, #3, #5)
    // ============================================================
    const currentIndex = savedList.findIndex(item => Number(item.id) === Number(id));
    const hasPrev = currentIndex > 0;
    const hasNext = currentIndex >= 0 && currentIndex < savedList.length - 1;

    // busy 또는 모달 열려있으면 화살표 비활성화 (#2, #3)
    const navDisabled = busy || modal.isOpen;

    const goPrev = () => {
        if (!hasPrev || navDisabled) return;
        const target = savedList[currentIndex - 1];
        // #5: state 함께 전달 → 다음 페이지가 즉시 데이터 표시
        navigate(`/history/${target.id}`, { state: { analysisData: target } });
    };
    const goNext = () => {
        if (!hasNext || navDisabled) return;
        const target = savedList[currentIndex + 1];
        navigate(`/history/${target.id}`, { state: { analysisData: target } });
    };

    // ============================================================
    // 저장 (#1: API 에러 처리, #4: 자동삭제 알림)
    // ============================================================
    const handleSaveClick = async () => {
        if (!id || busy) return;
        try {
            setBusy(true);
            const result = await saveAnalysis(id);
            if (result?.alreadySaved) {
                setModal({
                    isOpen: true, type: 'alert',
                    message: '✅ 이미 분석 히스토리에 저장되어 있습니다.',
                    onConfirm: null
                });
            } else if (result?.removedOldest) {
                // #4: 자동 삭제 알림
                setModal({
                    isOpen: true, type: 'alert',
                    message: '✅ 분석 결과가 저장되었습니다.\n저장 한도(5개) 초과로\n가장 오래된 분석이 자동 삭제되었습니다.',
                    onConfirm: () => {
                        setModal(prev => ({ ...prev, isOpen: false }));
                        // 목록 다시 가져오기
                        fetchHistory().then(data => {
                            if (Array.isArray(data)) {
                                setSavedList(data.map(item => ({
                                    id: item.analysis_idx,
                                    name: item.prod_name || '분석된 제품',
                                    date: new Date(item.joined_at).toLocaleDateString(),
                                    score: item.match_score ?? 0,
                                    status: item.match_status || (item.match_score >= 75 ? '적합' : '주의'),
                                    keyIng: item.key_ingredients ? item.key_ingredients.split(',') : [],
                                    warnIng: item.warn_ingredients ? item.warn_ingredients.split(',') : []
                                })));
                            }
                        });
                    }
                });
            } else {
                setModal({
                    isOpen: true, type: 'alert',
                    message: '✨ 성공적으로 저장되었습니다!',
                    onConfirm: null
                });
            }
        } catch (err) {
            // #1: API 에러 시 모달로 명시
            setModal({
                isOpen: true, type: 'alert',
                message: `❌ 저장 실패\n${err.response?.data?.message || err.message}`,
                onConfirm: null
            });
        } finally {
            setBusy(false);
        }
    };

    // ============================================================
    // 삭제 (#1: API 에러 처리, MIK 2단계 모달 + 다음 항목 이동)
    // ============================================================
    const handleDeleteClick = () => {
        if (busy) return;
        setModal({
            isOpen: true,
            type: 'confirm',
            message: '정말로 이 분석 결과를 삭제하시겠습니까?',
            onConfirm: async () => {
                try {
                    setBusy(true);
                    // #1: 실제 API 호출
                    await deleteAnalysis(id);

                    // 갱신된 목록 가져오기
                    const refreshed = await fetchHistory().catch(() => []);
                    const updatedList = Array.isArray(refreshed)
                        ? refreshed.map(item => ({
                            id: item.analysis_idx,
                            name: item.prod_name || '분석된 제품',
                            date: new Date(item.joined_at).toLocaleDateString(),
                            score: item.match_score ?? 0,
                            status: item.match_status || (item.match_score >= 75 ? '적합' : '주의'),
                            keyIng: item.key_ingredients ? item.key_ingredients.split(',') : [],
                            warnIng: item.warn_ingredients ? item.warn_ingredients.split(',') : []
                        }))
                        : [];
                    setSavedList(updatedList);

                    setModal({
                        isOpen: true,
                        type: 'alert',
                        message: '🗑️ 삭제되었습니다!',
                        onConfirm: () => {
                            setModal(prev => ({ ...prev, isOpen: false }));
                            // 갱신된 list 기준 navigate
                            if (updatedList.length > 0) {
                                const next = updatedList[0];
                                navigate(`/history/${next.id}`, {
                                    replace: true,
                                    state: { analysisData: next }
                                });
                            } else {
                                navigate('/mypage', { replace: true });
                            }
                        }
                    });
                } catch (err) {
                    // #1: 실패 시 페이지 그대로 유지 + 에러 알림
                    setModal({
                        isOpen: true,
                        type: 'alert',
                        message: `❌ 삭제 실패\n${err.response?.data?.message || err.message}`,
                        onConfirm: null
                    });
                } finally {
                    setBusy(false);
                }
            }
        });
    };

    const handleModalConfirm = () => {
        if (modal.onConfirm) {
            modal.onConfirm();
        } else {
            setModal(prev => ({ ...prev, isOpen: false }));
        }
    };

    const handleModalCancel = () => {
        setModal(prev => ({ ...prev, isOpen: false }));
    };

    // 점수 색상 클래스
    const scoreColorClass = getScoreColorClass(report.score);

    return (
        <div className="legacy-detail-container fade-in-up">

            <h1 className="history-detail-title">
                <i className="fa-solid fa-clock-rotate-left"></i>
                분석 히스토리 ({currentIndex >= 0 ? currentIndex + 1 : 1}/{savedList.length || 1})
            </h1>

            {/* prev/next 화살표 (busy/modal 시 비활성화) */}
            <div className="history-nav-arrows">
                <button
                    className="history-nav-btn"
                    onClick={goPrev}
                    disabled={!hasPrev || navDisabled}
                >
                    <i className="fa-solid fa-chevron-left"></i>
                </button>
                <button
                    className="history-nav-btn"
                    onClick={goNext}
                    disabled={!hasNext || navDisabled}
                >
                    <i className="fa-solid fa-chevron-right"></i>
                </button>
            </div>

            {/* 점수카드 — 점수별 동적 컬러 */}
            <div className={`legacy-detail-score-card ${scoreColorClass}`}>
                <h2 className="legacy-detail-title">{report.name}</h2>
                <div className="legacy-detail-score">
                    {report.score}<span> / 100</span>
                </div>
                <span className={`legacy-status-badge ${scoreColorClass}`}>
                    {report.status}
                </span>
            </div>

            {/* 핵심 성분 + 추천 이유 (AI 생성) */}
            <div className="legacy-detail-card">
                <h4 className="legacy-sec-title">
                    <i className="fa-solid fa-heart icon-key"></i> 핵심 성분
                </h4>
                <div className="legacy-ing-list">
                    {report.keyIng.length > 0 ? (
                        report.keyIng.map((ing, idx) => (
                            <div className="legacy-key-row" key={idx}>
                                <span className="legacy-key-name">{ing}</span>
                                <span className="legacy-key-desc">{KEY_DESC_MAP[ing] || '유효 성분'}</span>
                            </div>
                        ))
                    ) : (
                        <div className="legacy-key-row">
                            <span className="legacy-key-desc">매칭된 성분이 없습니다.</span>
                        </div>
                    )}
                </div>

                <div className="legacy-divider"></div>

                <h4 className="legacy-sec-title">
                    <i className="fa-solid fa-book-open icon-reason"></i> 추천 이유
                    <span className="legacy-ai-badge">AI 생성</span>
                </h4>
                {reasonLoading ? (
                    <p className="legacy-reason-text legacy-reason-loading">
                        <i className="fa-solid fa-spinner fa-spin"></i>
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

            {/* 주의 성분 */}
            <div className="legacy-detail-card">
                <h4 className="legacy-sec-title">
                    <i className="fa-solid fa-triangle-exclamation icon-warn"></i> 주의 성분
                </h4>
                <div className="legacy-ing-list">
                    {report.warnIng.length > 0 ? (
                        report.warnIng.map((ing, idx) => (
                            <div className="legacy-warn-row" key={idx}>
                                <span className="legacy-warn-name">{ing}</span>
                                <span className="legacy-warn-desc">{WARN_DESC_MAP[ing] || '주의가 필요한 성분입니다.'}</span>
                            </div>
                        ))
                    ) : (
                        <p className="legacy-reason-text">발견된 주의 성분이 없습니다.</p>
                    )}
                </div>
            </div>

            {/* 추천 제품 TOP 3 (DB + 이미지) */}
            <div className="legacy-detail-card">
                <h4 className="legacy-sec-title">
                    <i className="fa-solid fa-wand-magic-sparkles icon-wand"></i> 추천 제품 TOP 3
                </h4>
                {recoLoading ? (
                    <p className="legacy-reason-text legacy-reason-loading">
                        <i className="fa-solid fa-spinner fa-spin"></i> 추천 제품을 찾는 중...
                    </p>
                ) : recommendations.length === 0 ? (
                    <p className="legacy-reason-text">아직 추천 가능한 제품이 없습니다.</p>
                ) : (
                    recommendations.map((rec) => {
                        const imgUrl = getProductImageUrl(rec.image_filename);
                        const recScoreClass = getScoreColorClass(rec.score);
                        return (
                            <div className="legacy-recom-card" key={rec.prod_idx}>
                                <div className="legacy-recom-thumb">
                                    {imgUrl ? (
                                        <img
                                            src={imgUrl}
                                            alt={rec.prod_name}
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                                e.currentTarget.parentElement.classList.add('no-image');
                                            }}
                                        />
                                    ) : (
                                        <i className="fa-solid fa-image legacy-recom-thumb-placeholder"></i>
                                    )}
                                </div>
                                <div className="legacy-recom-info">
                                    <div className="legacy-recom-head">
                                        <span className="legacy-recom-brand">{rec.brand_name}</span>
                                        <span className={`legacy-recom-score ${recScoreClass}`}>
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

            {/* 하단 버튼 (삭제 / 저장) */}
            <div className="legacy-btn-group">
                <button className="legacy-btn-outline" onClick={handleDeleteClick} disabled={busy}>
                    <i className="fa-solid fa-trash"></i> 삭제하기
                </button>
                <button className="legacy-btn-solid" onClick={handleSaveClick} disabled={busy}>
                    <i className="fa-solid fa-bookmark"></i> 저장하기
                </button>
            </div>

            <p className="legacy-storage-note">
                💡 분석 결과 히스토리는 최대 5개까지 저장 가능합니다.
            </p>

            {/* 🌟 MIK 커스텀 모달 */}
            {modal.isOpen && (
                <div className="legacy-modal-backdrop">
                    <div className="legacy-modal fade-in-up">
                        <p className="legacy-modal-message">{modal.message}</p>
                        <div className="legacy-modal-actions">
                            {modal.type === 'confirm' && (
                                <button
                                    className="legacy-modal-btn cancel"
                                    onClick={handleModalCancel}
                                >
                                    취소
                                </button>
                            )}
                            <button
                                className="legacy-modal-btn confirm"
                                onClick={handleModalConfirm}
                            >
                                확인
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HistoryDetailPage;
