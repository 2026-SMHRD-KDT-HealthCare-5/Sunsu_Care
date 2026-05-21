import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './HomePage.css';

const HomePage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isLoggedIn } = useAuth();

    // 로그인 필요한 경로 이동 (안 됐으면 /login?redirect=경로 로)
    const goWithAuth = (path) => {
        if (isLoggedIn) {
            navigate(path);
        } else {
            navigate(`/login?redirect=${encodeURIComponent(path)}`);
        }
    };

    // 해시태그(#) 대신 React Router의 state를 활용한 안전한 스크롤링
    useEffect(() => {
        if (location.state && location.state.targetId) {
            setTimeout(() => {
                const element = document.getElementById(location.state.targetId);
                if (element) {
                    const y = element.getBoundingClientRect().top + window.scrollY - 60;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                }
            }, 100);
        } else {
            // 🌟 수정됨: 'smooth' 대신 'auto'를 사용하여 페이지 접속 시 스크롤 애니메이션 없이 즉시 맨 위를 보여줌
            window.scrollTo({ top: 0, behavior: 'auto' });
        }
    }, [location]);

    return (
        <div className="home-container">
            <section className="hero-section">
                
                {/* 🌟 수정된 배경 영역: CSS 애니메이션으로 2장이 스무스하게 전환됨 */}
                <div className="hero-bg">
                    <div className="bg-image woman"></div>
                    <div className="bg-image man"></div>
                </div>
                
                <div className="hero-overlay"></div>
                
                <div className="cta-wrapper">
                    <h1 className="hero-title">내 피부에 맞는<br/>선크림만 <span>안전하게</span></h1>
                    
                    <div className="blob-button-container">
                        <div className="blob-button" onClick={() => goWithAuth('/profile')}>
                            맞춤 추천<br/>받기
                        </div>
                        <div className="blob-button" onClick={() => goWithAuth('/scan')}>
                            기존 제품<br/>분석
                        </div>
                    </div>
                </div>
            </section>

            <div className="home-content">
                
                {/* 1. 추천 구역 */}
                <section id="recommend" className="content-section">
                    <span className="section-tag">AI RECOMMEND</span>
                    <h2 className="section-title">맞춤 추천 받기</h2>
                    <p className="section-desc">내 피부 정보를 정밀 분석하여<br/>최적의 선케어 제품을 골라드려요.</p>
                    <button className="section-btn" onClick={() => goWithAuth('/profile')}>추천 받기 →</button>
                </section>

                {/* 2. 분석 구역 */}
                <section id="analysis" className="content-section">
                    <span className="section-tag">AI ANALYSIS</span>
                    <h2 className="section-title">기존 제품 분석</h2>
                    <p className="section-desc">쓰고 계신 제품의 성분이 궁금한가요?<br/>카메라로 찍어서 바로 확인해보세요.</p>
                    <button className="section-btn" style={{backgroundColor: '#333'}} onClick={() => goWithAuth('/scan')}>분석하기 →</button>
                </section>

                {/* 3. 정보 공유 & 쇼핑 구역 (반반 분할) */}
                <section id="info" className="split-banner-container">
                    {/* 왼쪽 배너: 정보 공유 (GuidePage 이동) */}
                    <div className="split-banner-card" onClick={() => navigate('/guide')}>
                        <span className="split-subtitle">INFORMATION</span>
                        <h3 className="split-title">정보 공유</h3>
                        <p className="split-desc">유용한 선케어 꿀팁</p>
                        <button className="split-btn">보러가기 &rarr;</button>
                    </div>

                    {/* 오른쪽 배너: 스마트 쇼핑 (ShoppingPage 이동) */}
                    <div className="split-banner-card" onClick={() => navigate('/ShoppingPage')}>
                        <span className="split-subtitle">SHOPPING</span>
                        <h3 className="split-title">스마트 쇼핑</h3>
                        <p className="split-desc">검증된 추천 제품</p>
                        <button className="split-btn">보러가기 &rarr;</button>
                    </div>
                </section>

            </div>
        </div>
    );
};

export default HomePage;