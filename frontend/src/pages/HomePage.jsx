import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [bgImage, setBgImage] = useState('/main_woman.png');

    // 다른 페이지에서 해시태그(#)를 달고 넘어왔을 때를 위한 처리
    useEffect(() => {
        if (location.hash) {
            const id = location.hash.replace('#', '');
            setTimeout(() => {
                const element = document.getElementById(id);
                if (element) {
                    const y = element.getBoundingClientRect().top + window.scrollY - 60;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                }
            }, 100);
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [location]);

    // 5초마다 배경 이미지 전환
    useEffect(() => {
        const interval = setInterval(() => {
            setBgImage((prev) => 
                prev === '/main_woman.png' ? '/main_man.png' : '/main_woman.png'
            );
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="home-container">
            <section className="hero-section">
                <div className="hero-bg" style={{ backgroundImage: `url(${bgImage})` }}></div>
                <div className="hero-overlay"></div>
                
                <div className="cta-wrapper">
                    <h1 className="hero-title">내 피부에 맞는<br/>선크림만 <span>안전하게</span></h1>
                    
                    <div className="blob-button-container">
                        <div className="blob-button" onClick={() => navigate('/profile')}>
                            맞춤 추천<br/>받기
                        </div>
                        <div className="blob-button" onClick={() => navigate('/scan')}>
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
                    <button className="section-btn" onClick={() => navigate('/profile')}>추천 받기 →</button>
                </section>

                {/* 2. 분석 구역 */}
                <section id="analysis" className="content-section">
                    <span className="section-tag">AI ANALYSIS</span>
                    <h2 className="section-title">기존 제품 분석</h2>
                    <p className="section-desc">쓰고 계신 제품의 성분이 궁금한가요?<br/>카메라로 찍어서 바로 확인해보세요.</p>
                    <button className="section-btn" style={{backgroundColor: '#333'}} onClick={() => navigate('/scan')}>분석하기 →</button>
                </section>

                {/* 3. 쇼핑 구역 */}
                <section id="info" className="content-section">
                    <span className="section-tag">MAGAZINE & SHOP</span>
                    <h2 className="section-title">선케어 정보와 쇼핑</h2>
                    <p className="section-desc">최신 선케어 트렌드 블로그와<br/>검증된 쇼핑몰을 만나보세요.</p>
                    <button className="section-btn" style={{backgroundColor: '#fff', color: '#ff8c00', border: '1px solid #ff8c00'}} onClick={() => navigate('/ShoppingPage')}>보러가기 →</button>
                </section>

                {/* 🌟 4. 새로 추가된 세안 가이드 구역! */}
                <section id="guide" className="content-section" style={{ marginBottom: '40px' }}>
                    <span className="section-tag">WASHING GUIDE</span>
                    <h2 className="section-title">맞춤 세안 가이드</h2>
                    <p className="section-desc">선크림 잔여물 없는 완벽한 세안법!<br/>내 피부에 맞는 세안 가이드를 확인하세요.</p>
                    {/*  /guide 페이지로 연결됩니다 */}
                    <button className="section-btn" style={{backgroundColor: '#ffb347'}} onClick={() => navigate('/guide')}>가이드 보기 →</button>
                </section>

            </div>
        </div>
    );
};

export default HomePage;