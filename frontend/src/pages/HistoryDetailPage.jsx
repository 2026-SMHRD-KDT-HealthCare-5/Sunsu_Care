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

const KEY_DEFAULT_DESC = '유효 성분';
const WARN_DEFAULT_DESC = '주의가 필요한 성분입니다.';

const getIngName = (it) => typeof it === 'string' ? it : (it?.name || '');
const getIngWarning = (it, fallback) =>
    (typeof it === 'object' && it?.warning) ? it.warning : fallback;

const getScoreColorClass = (score) => {
    if (score >= 75) return 'score-good';
    if (score >= 50) return 'score-warn';
    return 'score-danger';
};

// 🌟 핵심 해결 1: 정규화 로직을 밖으로 빼서 초기화 시점에도 적극적으로 사용합니다.
const normalizeIng = (data, csv) => {
    if (Array.isArray(data) && data.length > 0) {
        const seen = new Set();
        return data.filter(Boolean).map(it =>
            typeof it === 'string'
                ? { name: it.trim(), warning: '' }
                : { name: String(it.name || '').trim(), warning: it.warning || '' }
        ).filter(it => {
            if (!it.name || seen.has(it.name)) return false;
            seen.add(it.name);
            return true;
        });
    }
    if (typeof csv === 'string' && csv.trim()) {
        return [...new Set(csv.split(',').map(s => s.trim()).filter(Boolean))]
            .map(name => ({ name, warning: '' }));
    }
    return [];
};

const HistoryDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [modal, setModal] = useState({
        isOpen: false,
        type: 'alert',
        message: '',
        onConfirm: null
    });

    const [savedList, setSavedList] = useState([]);
    const [listLoaded, setListLoaded] = useState(false);

    const raw = location.state?.analysisData;

    // 🌟 핵심 해결 2: 다른 페이지에서 백엔드 변수명(key_ingredients_data) 그대로 넘겨도 다 잡아냅니다.
    const [report, setReport] = useState(() => ({
        id: raw?.id || raw?.analysis_idx || id,
        name: raw?.name || raw?.prod_name || "분석된 제품",
        date: raw?.date || raw?.joined_at || "",
        score: raw?.score ?? raw?.match_score ?? 0,
        status: raw?.status || raw?.match_status || "알 수 없음",
        keyIng: normalizeIng(raw?.keyIng || raw?.key_ingredients_data, raw?.key_ingredients),
        warnIng: normalizeIng(raw?.warnIng || raw?.warn_ingredients_data, raw?.warn_ingredients)
    }));

    useEffect(() => {
        if (raw) {
            setReport({
                id: raw.id || raw.analysis_idx || id,
                name: raw.name || raw.prod_name || "분석된 제품",
                date: raw.date || raw.joined_at || "",
                score: raw.score ?? raw.match_score ?? 0,
                status: raw.status || raw.match_status || "알 수 없음",
                keyIng: normalizeIng(raw.keyIng || raw.key_ingredients_data, raw.key_ingredients),
                warnIng: normalizeIng(raw.warnIng || raw.warn_ingredients_data, raw.warn_ingredients)
            });
        }
    }, [raw, id]);

    const [userProfile, setUserProfile] = useState({ basicType: '미설정' });
    const [aiReason, setAiReason] = useState('');
    const [reasonLoading, setReasonLoading] = useState(true);
    const [reasonError, setReasonError] = useState('');

    const [recommendations, setRecommendations] = useState([]);
    const [recoLoading, setRecoLoading] = useState(true);
    const [busy, setBusy] = useState(false);

    // ============================================================
    // 1) 히스토리 목록 + 프로필 로드
    // ============================================================
    useEffect(() => {
        let mounted = true;

        fetchHistory()
            .then(data => {
                if (mounted && Array.isArray(data)) {
                    setSavedList(data.map(item => ({
                        id: item.analysis_idx,
                        name: item.prod_name || '분석된 제품',
                        date: new Date(item.joined_at).toLocaleDateString(),
                        score: item.match_score ?? 0,
                        status: item.match_status || (item.match_score >= 75 ? '적합' : '주의'),
                        keyIng: normalizeIng(item.key_ingredients_data, item.key_ingredients),
                        warnIng: normalizeIng(item.warn_ingredients_data, item.warn_ingredients)
                    })));
                    setListLoaded(true);
                }
            })
            .catch(err => {
                console.error('[HistoryDetail] 목록 조회 실패:', err);
                if (mounted) setListLoaded(true);
            });

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
    // 안정성 #6: 다른 페이지에서 불완전하게 넘어온 경우 DB 데이터로 덮어쓰기
    // ============================================================
    useEffect(() => {
        if (!listLoaded) return;

        const found = savedList.find(item => Number(item.id) === Number(id));
        
        if (found) {
            // 🌟 핵심 해결 3: raw 데이터가 불완전해도(문자열), DB에서 완벽한 객체를 찾아 덮어씌웁니다.
            setReport(found);
        } else if (!raw && savedList.length > 0) {
            navigate(`/history/${savedList[0].id}`, {
                replace: true,
                state: { analysisData: savedList[0] }
            });
        } else if (!raw) {
            navigate('/mypage', { replace: true });
        }
    }, [listLoaded, id, savedList, raw, navigate]);

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
        let retryTimerId = null;
        let retryAttempted = false;

        const loadAIReason = async () => {
            const hasIngredients = (report?.keyIng?.length || 0) > 0 || (report?.warnIng?.length || 0) > 0;
            if (!hasIngredients) {
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
                    keyIng: (report.keyIng || []).map(getIngName).filter(Boolean),
                    warnIng: (report.warnIng || []).map(getIngName).filter(Boolean),
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
                        if (!retryAttempted) {
                            retryAttempted = true;
                            setReasonError('AI 요청 한도 초과 — 60초 후 자동 재시도합니다');
                            retryTimerId = setTimeout(() => {
                                if (mounted) {
                                    setReasonLoading(true);
                                    setReasonError('');
                                    loadAIReason();
                                }
                            }, 60_000);
                        } else {
                            setReasonError('AI 요청 한도 초과 — 잠시 후 페이지를 새로고침해주세요');
                        }
                    } else {
                        setReasonError(`AI 호출 실패: ${backendData?.message || err.message}`);
                    }
                    setAiReason(userReason);
                    setReasonLoading(false);
                }
            }
        };
        loadAIReason();
        return () => {
            mounted = false;
            if (retryTimerId) clearTimeout(retryTimerId);
        };
    }, [id, report.name, report.score, userProfile.basicType]);

    // ============================================================
    // prev/next 네비게이션
    // ============================================================
    const currentIndex = savedList.findIndex(item => Number(item.id) === Number(id));
    const hasPrev = currentIndex > 0;
    const hasNext = currentIndex >= 0 && currentIndex < savedList.length - 1;
    const navDisabled = busy || modal.isOpen;

    const goPrev = () => {
        if (!hasPrev || navDisabled) return;
        const target = savedList[currentIndex - 1];
        navigate(`/history/${target.id}`, { state: { analysisData: target } });
    };
    const goNext = () => {
        if (!hasNext || navDisabled) return;
        const target = savedList[currentIndex + 1];
        navigate(`/history/${target.id}`, { state: { analysisData: target } });
    };

    // ============================================================
    // 저장 및 삭제 로직
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
                setModal({
                    isOpen: true, type: 'alert',
                    message: '✅ 분석 결과가 저장되었습니다.\n저장 한도(5개) 초과로\n가장 오래된 분석이 자동 삭제되었습니다.',
                    onConfirm: () => {
                        setModal(prev => ({ ...prev, isOpen: false }));
                        fetchHistory().then(data => {
                            if (Array.isArray(data)) {
                                setSavedList(data.map(item => ({
                                    id: item.analysis_idx,
                                    name: item.prod_name || '분석된 제품',
                                    date: new Date(item.joined_at).toLocaleDateString(),
                                    score: item.match_score ?? 0,
                                    status: item.match_status || (item.match_score >= 75 ? '적합' : '주의'),
                                    keyIng: normalizeIng(item.key_ingredients_data, item.key_ingredients),
                                    warnIng: normalizeIng(item.warn_ingredients_data, item.warn_ingredients)
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
            setModal({
                isOpen: true, type: 'alert',
                message: `❌ 저장 실패\n${err.response?.data?.message || err.message}`,
                onConfirm: null
            });
        } finally {
            setBusy(false);
        }
    };

    const handleDeleteClick = () => {
        if (busy) return;
        setModal({
            isOpen: true,
            type: 'confirm',
            message: '정말로 이 분석 결과를 삭제하시겠습니까?',
            onConfirm: async () => {
                try {
                    setBusy(true);
                    await deleteAnalysis(id);

                    const refreshed = await fetchHistory().catch(() => []);
                    const updatedList = Array.isArray(refreshed)
                        ? refreshed.map(item => ({
                            id: item.analysis_idx,
                            name: item.prod_name || '분석된 제품',
                            date: new Date(item.joined_at).toLocaleDateString(),
                            score: item.match_score ?? 0,
                            status: item.match_status || (item.match_score >= 75 ? '적합' : '주의'),
                            keyIng: normalizeIng(item.key_ingredients_data, item.key_ingredients),
                            warnIng: normalizeIng(item.warn_ingredients_data, item.warn_ingredients)
                        }))
                        : [];
                    setSavedList(updatedList);

                    setModal({
                        isOpen: true,
                        type: 'alert',
                        message: '🗑️ 삭제되었습니다!',
                        onConfirm: () => {
                            setModal(prev => ({ ...prev, isOpen: false }));
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

    const scoreColorClass = getScoreColorClass(report.score);

    return (
        <div className="legacy-detail-container fade-in-up">

            <h1 className="history-detail-title">
                <i className="fa-solid fa-clock-rotate-left"></i>
                분석 히스토리 ({currentIndex >= 0 ? currentIndex + 1 : 1}/{savedList.length || 1})
            </h1>

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

            <div className={`legacy-detail-score-card ${scoreColorClass}`}>
                <h2 className="legacy-detail-title">{report.name}</h2>
                <div className="legacy-detail-score">
                    {report.score}<span> / 100</span>
                </div>
                <span className={`legacy-status-badge ${scoreColorClass}`}>
                    {report.status}
                </span>
            </div>

            <div className="legacy-detail-card">
                <h4 className="legacy-sec-title">
                    <i className="fa-solid fa-gem icon-key"></i> 매칭된 핵심 성분
                </h4>
                <div className="legacy-ing-list">
                    {report.keyIng.length > 0 ? (
                        report.keyIng.map((ing, idx) => (
                            <div className="legacy-key-row" key={idx}>
                                <span className="legacy-key-name">{getIngName(ing)}</span>
                                <span className="legacy-key-desc">{getIngWarning(ing, KEY_DEFAULT_DESC)}</span>
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
                    <i className="fa-solid fa-triangle-exclamation icon-warn"></i> 주의 필요 성분
                </h4>
                <div className="legacy-ing-list">
                    {report.warnIng.length > 0 ? (
                        report.warnIng.map((ing, idx) => (
                            <div className="legacy-warn-row" key={idx}>
                                <span className="legacy-warn-name">{getIngName(ing)}</span>
                                <span className="legacy-warn-desc">{getIngWarning(ing, WARN_DEFAULT_DESC)}</span>
                            </div>
                        ))
                    ) : (
                        <p className="legacy-reason-text">발견된 주의 성분이 없습니다.</p>
                    )}
                </div>

                <div className="legacy-divider"></div>

                <h4 className="legacy-sec-title">
                    <i className="fa-solid fa-book-open icon-reason"></i> 분석 결과
                    <span className="legacy-ai-badge">Google Gemini</span>
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