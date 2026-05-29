// frontend/src/pages/ScanPage.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import ImageUploader from '../components/product/ImageUploader';
import { analyze, getTaskStatus } from '../api/analysisApi';
import { fetchProfile } from '../api/profileApi';
import { useImagePreview } from '../hooks/useImagePreview';
import { resizeImage } from '../utils/imageResize';
import './ScanPage.css';

/* ==========================================================================
   상수 (매직 넘버/문자열 제거)
   ========================================================================== */
const POLLING_INTERVAL_MS = 1000;        // 🌟 2000ms → 1000ms (응답 체감 ↑)
const POLLING_MAX_CONSECUTIVE_ERRORS = 5;  // 5회 연속 실패 시 폴링 중단
const POLLING_MAX_DURATION_MS = 60_000;    // 최대 60초 후 강제 종료
const ERROR_NO_IMAGE = '분석할 사진을 먼저 업로드해주세요.';
const ERROR_API = '서버 연결 중 문제가 발생했습니다.';
const ERROR_AI_SERVER_DOWN = 'AI 분석 서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.';
const ERROR_TIMEOUT = '분석 시간이 너무 오래 걸려 중단됐어요. 다시 시도해주세요.';
const STATUS_COMPLETED = 'COMPLETED';
const STATUS_FAILED = 'FAILED';

// 🌟 분석 단계별 메시지 (체감 대기 시간 감소)
const ANALYZING_STAGES = [
    '사진을 업로드하고 있어요...',
    'AI가 라벨을 인식 중이에요...',
    '성분을 분석하고 있어요...',
    '잠시만 기다려주세요...',
];
const STAGE_INTERVAL_MS = 1800;

function ScanPage() {
    const navigate = useNavigate();
    const ingredientImg = useImagePreview();
    const intervalRef = useRef(null);
    const stageIntervalRef = useRef(null);

    const [error, setError] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analyzingStage, setAnalyzingStage] = useState(0);
    const [userSkinType, setUserSkinType] = useState(null);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);

    /* ── 프로필 로드 (DB 기반) — 안내박스 표시용 ───────────────────── */
    useEffect(() => {
        const loadUserProfile = async () => {
            try {
                const profileData = await fetchProfile();
                setUserSkinType(profileData?.skin_type || null);
            } catch (err) {
                console.warn("프로필 정보를 불러오지 못했습니다.", err);
                setUserSkinType(null);
            } finally {
                setIsLoadingProfile(false);
            }
        };
        loadUserProfile();
    }, []);

    /* ── 실제 분석 (analyze + 폴링) ───────────────────────────────── */
    const handleAnalyze = async () => {
        if (!ingredientImg.file) {
            setError(ERROR_NO_IMAGE);
            return;
        }

        setIsAnalyzing(true);
        setAnalyzingStage(0);
        setError('');

        // 🌟 분석 단계 메시지 자동 회전
        stageIntervalRef.current = setInterval(() => {
            setAnalyzingStage(prev => (prev + 1) % ANALYZING_STAGES.length);
        }, STAGE_INTERVAL_MS);

        try {
            // 🌟 클라이언트 측 이미지 축소 — 업로드 시간 대폭 단축
            const optimized = await resizeImage(ingredientImg.file);
            const response = await analyze(optimized);
            const { task_id } = response;

            if (intervalRef.current) clearInterval(intervalRef.current);

            // 🌟 폴링 안정성:
            //  - isCancelled: stop 이후 진행 중이던 비동기 콜백 즉시 무시
            //  - isFetching: mutex — 이전 호출이 진행 중이면 새 호출 skip (동시 다발 방지)
            //  - consecutiveErrors: 연속 에러 카운터
            //  - startedAt: 최대 시간 가드
            let isCancelled = false;
            let isFetching = false;
            let consecutiveErrors = 0;
            const startedAt = Date.now();

            const stopAllTimers = () => {
                isCancelled = true;
                if (intervalRef.current) clearInterval(intervalRef.current);
                if (stageIntervalRef.current) clearInterval(stageIntervalRef.current);
            };

            const pollOnce = async () => {
                if (isCancelled) return;

                // ① 최대 시간 초과 가드
                if (Date.now() - startedAt > POLLING_MAX_DURATION_MS) {
                    stopAllTimers();
                    setIsAnalyzing(false);
                    setError(ERROR_TIMEOUT);
                    return;
                }

                // ② 이미 진행 중인 fetch 있으면 skip (동시 다발 방지)
                if (isFetching) return;
                isFetching = true;

                try {
                    const res = await getTaskStatus(task_id);
                    if (isCancelled) return;

                    consecutiveErrors = 0;

                    if (res.status === STATUS_COMPLETED) {
                        stopAllTimers();
                        setIsAnalyzing(false);
                        navigate('/mypage', { state: { newAnalysis: res.result || res } });
                    } else if (res.status === STATUS_FAILED) {
                        stopAllTimers();
                        setIsAnalyzing(false);
                        setError(`분석 실패: ${res.error || '알 수 없는 오류'}`);
                    }
                } catch (err) {
                    if (isCancelled) return;

                    consecutiveErrors += 1;
                    console.warn(`[Scan] 폴링 실패 ${consecutiveErrors}/${POLLING_MAX_CONSECUTIVE_ERRORS}:`, err?.message || err);

                    if (consecutiveErrors >= POLLING_MAX_CONSECUTIVE_ERRORS) {
                        stopAllTimers();
                        setIsAnalyzing(false);
                        const isNetworkError = err?.message?.includes('Network') || err?.code === 'ERR_NETWORK';
                        setError(isNetworkError ? ERROR_AI_SERVER_DOWN : ERROR_API);
                    }
                } finally {
                    isFetching = false;
                }
            };

            // 🌟 1차 호출은 즉시 (setInterval 의 1초 지연 절약 — 빠른 task 는 즉시 완료 감지)
            pollOnce();
            intervalRef.current = setInterval(pollOnce, POLLING_INTERVAL_MS);
        } catch (err) {
            console.error("API 요청 에러:", err);
            // 🌟 분석 시작 자체가 실패 — Network Error 면 서버 미기동 가능성 큼
            const isNetworkError = err?.message?.includes('Network') || err?.code === 'ERR_NETWORK';
            setError(isNetworkError ? ERROR_AI_SERVER_DOWN : ERROR_API);
            setIsAnalyzing(false);
            if (stageIntervalRef.current) clearInterval(stageIntervalRef.current);
        }
    };

    /* ── 언마운트 시 폴링 정리 ───────────────────────────────────── */
    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (stageIntervalRef.current) clearInterval(stageIntervalRef.current);
        };
    }, []);

    const goToProfile = () => navigate('/profile', { state: { from: '/scan' } });

    if (isAnalyzing) {
        return (
            <div className="page">
                <Loading message={ANALYZING_STAGES[analyzingStage]} />
            </div>
        );
    }

    return (
        <div className="page scan">
            <div className="scan__header">
                <h1 className="scan__title">제품 성분 스캔</h1>
                <p className="scan__subtitle">성분표 사진을 올려주세요</p>
            </div>

            {/* 🌟 프로필 안내 박스 (로드 완료 후 표시) */}
            {!isLoadingProfile && (
                userSkinType ? (
                    <div className="scan__profile-notice scan__profile-notice--ok">
                        <i className="fa-solid fa-circle-check"></i>
                        <span>등록된 피부 정보를 바탕으로 정밀 분석을 시작합니다.</span>
                    </div>
                ) : (
                    <div className="scan__profile-notice scan__profile-notice--warn">
                        <i className="fa-solid fa-circle-exclamation"></i>
                        <span>
                            아직 피부 정보를 입력하지 않았어요.{' '}
                            <button
                                type="button"
                                className="scan__profile-link"
                                onClick={goToProfile}
                            >
                                지금 입력하러 가기 →
                            </button>
                        </span>
                    </div>
                )
            )}

            <ImageUploader
                label="성분표 사진"
                previewUrl={ingredientImg.preview}
                onFileChange={ingredientImg.setFile}
            />

            {error && <p className="scan__error">{error}</p>}

            <Button size="lg" onClick={handleAnalyze}>
                AI 분석하기 🔍
            </Button>
        </div>
    );
}

export default ScanPage;
