// frontend/src/pages/ScanPage.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import ImageUploader from '../components/product/ImageUploader';
import { analyze, getTaskStatus } from '../api/analysisApi';
import { fetchProfile } from '../api/profileApi';
import { useImagePreview } from '../hooks/useImagePreview';
import './ScanPage.css';

/* ==========================================================================
   상수 (매직 넘버/문자열 제거)
   ========================================================================== */
const POLLING_INTERVAL_MS = 2000;
const ANALYZING_MESSAGE = 'AI가 성분을 정밀 분석 중이에요... 잠시만 기다려주세요';
const ERROR_NO_IMAGE = '분석할 사진을 먼저 업로드해주세요.';
const ERROR_API = '서버 연결 중 문제가 발생했습니다.';
const STATUS_COMPLETED = 'COMPLETED';
const STATUS_FAILED = 'FAILED';

function ScanPage() {
    const navigate = useNavigate();
    const ingredientImg = useImagePreview();
    const intervalRef = useRef(null);

    const [error, setError] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
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
        setError('');

        try {
            const response = await analyze(ingredientImg.file);
            const { task_id } = response;

            if (intervalRef.current) clearInterval(intervalRef.current);

            intervalRef.current = setInterval(async () => {
                try {
                    const res = await getTaskStatus(task_id);

                    if (res.status === STATUS_COMPLETED) {
                        clearInterval(intervalRef.current);
                        setIsAnalyzing(false);
                        // 분석 결과를 state 로 넘기며 마이페이지 이동 (newAnalysis dedup 흐름)
                        navigate('/mypage', { state: { newAnalysis: res.result || res } });
                    } else if (res.status === STATUS_FAILED) {
                        clearInterval(intervalRef.current);
                        setIsAnalyzing(false);
                        setError(`분석 실패: ${res.error || '알 수 없는 오류'}`);
                    }
                } catch (err) {
                    console.error("폴링 호출 에러:", err);
                }
            }, POLLING_INTERVAL_MS);
        } catch (err) {
            console.error("API 요청 에러:", err);
            setError(ERROR_API);
            setIsAnalyzing(false);
        }
    };

    /* ── 언마운트 시 폴링 정리 ───────────────────────────────────── */
    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    const goToProfile = () => navigate('/profile', { state: { from: '/scan' } });

    if (isAnalyzing) {
        return (
            <div className="page">
                <Loading message={ANALYZING_MESSAGE} />
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
