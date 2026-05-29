import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import ImageUploader from '../components/product/ImageUploader';
// 임시 우회를 위해 API import는 잠시 비활성화해도 됩니다 (지우진 마세요)
import { analyze, getTaskStatus } from '../api/analysisApi';
import { fetchProfile } from '../api/profileApi'; 
import { useImagePreview } from '../hooks/useImagePreview';
import './ScanPage.css';

function ScanPage() {
    const navigate = useNavigate();
    const ingredientImg = useImagePreview();
    
    const intervalRef = useRef(null);

    const [error, setError] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    
    const [userSkinType, setUserSkinType] = useState(null);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);

    useEffect(() => {
        const loadUserProfile = async () => {
            try {
                const profileData = await fetchProfile();
                if (profileData && profileData.skin_type) {
                    setUserSkinType(profileData.skin_type); 
                } else {
                    setUserSkinType(null);
                }
            } catch (err) {
                console.warn("프로필 정보를 불러오지 못했습니다.", err);
                setUserSkinType(null);
            } finally {
                setIsLoadingProfile(false);
            }
        };
        loadUserProfile();
    }, []);

    // 🌟 백엔드 통신 대신 UI 테스트를 위한 가짜(Mock) 함수로 교체! 🌟
    const handleAnalyze = async () => {
        if (!ingredientImg.file) {
            setError("성분표 사진을 먼저 업로드해주세요.");
            return;
        }

        setIsAnalyzing(true);
        setError('');

        // 2초 뒤에 무조건 1번 데이터 결과창으로 강제 이동시킵니다.
        setTimeout(() => {
            setIsAnalyzing(false);
            navigate('/history/1'); 
        }, 2000); 
    };

    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    if (isAnalyzing) {
        return (
            <div className="page">
                <Loading message="AI가 성분을 정밀 분석 중이에요... 잠시만 기다려주세요" />
            </div>
        );
    }

    return (
        <div className="page scan">
            <div className="scan__header">
                <h1 className="scan__title">제품 성분 스캔</h1>
                <p className="scan__subtitle">성분표 사진을 올려주세요</p>
            </div>

            {!isLoadingProfile && (
                userSkinType ? (
                    <div style={{
                        backgroundColor: '#eff6ff', 
                        border: '1px solid #bfdbfe',
                        borderRadius: '8px',
                        padding: '12px 16px', 
                        marginBottom: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center', 
                        gap: '8px',
                        color: '#1d4ed8', 
                        fontWeight: '700',
                        fontSize: '0.9rem'
                    }}>
                        <i className="fa-solid fa-circle-check"></i>
                        <span>등록된 피부 정보를 바탕으로 정밀 분석을 시작합니다.</span>
                    </div>
                ) : (
                    <div className="scan__notice" style={{
                        backgroundColor: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', color: '#ea580c', fontWeight: '600', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                    }}>
                        <i className="fa-solid fa-circle-exclamation"></i>
                        <span>
                            아직 피부 정보를 입력하지 않았어요.{' '}
                            <button
                                type="button"
                                className="scan__notice-link"
                                onClick={() => navigate('/profile')}
                                style={{ background: 'none', border: 'none', padding: 0, color: '#3b82f6', fontWeight: '800', cursor: 'pointer', textDecoration: 'underline' }}
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

            {error && <p className="scan__error" style={{ color: '#ef4444', textAlign: 'center', fontWeight: 'bold' }}>{error}</p>}

            <Button size="lg" onClick={handleAnalyze}>
                AI 분석하기 🔍
            </Button>
        </div>
    );
}

export default ScanPage;