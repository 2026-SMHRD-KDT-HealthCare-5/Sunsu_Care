import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
    const navigate = useNavigate();
    const location = useLocation(); // 🌟 현재 주소(해시태그)를 파악하기 위한 도구
    const [bgImage, setBgImage] = useState('/main_woman.png');

    // 🌟 자동 스크롤 마법: 배너를 클릭해서 넘어오면 해당 위치로 스르륵 내려갑니다.
    useEffect(() => {
        if (location.hash) {
            // #recommend 같은 글자에서 #을 빼고 해당 이름표(id)를 가진 구역을 찾습니다.
            const element = document.getElementById(location.hash.replace('#', ''));
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        } else {
            // 해시태그가 없으면 그냥 맨 위로 부드럽게 올라갑니다.
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
                    <h1 className="hero-title">내 피부에 맞는<br/>선크림만 <span>안전하게.</span></h1>
                    
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
                {/* 🌟 각 구역에 id="이름" 을 달아주어 하단 배너가 찾아올 수 있게 합니다. */}
                
                <section id="recommend" className="content-section">
                    <span className="section-tag">AI RECOMMEND</span>
                    <h2 className="section-title">맞춤 추천 받기</h2>
                    <p className="section-desc">내 피부 정보를 정밀 분석하여<br/>최적의 선케어 제품을 골라드려요.</p>
                    <button className="section-btn" onClick={() => navigate('/profile')}>추천 받기 →</button>
                </section>

                <section id="analysis" className="content-section">
                    <span className="section-tag">AI ANALYSIS</span>
                    <h2 className="section-title">기존 제품 분석</h2>
                    <p className="section-desc">쓰고 계신 제품의 성분이 궁금한가요?<br/>카메라로 찍어서 바로 확인해보세요.</p>
                    <button className="section-btn" style={{backgroundColor: '#333'}} onClick={() => navigate('/scan')}>분석하기 →</button>
                </section>

                <section id="info" className="content-section">
                    <span className="section-tag">MAGAZINE & SHOP</span>
                    <h2 className="section-title">선케어 정보와 쇼핑</h2>
                    <p className="section-desc">최신 선케어 트렌드 블로그와<br/>검증된 쇼핑몰을 만나보세요.</p>
                    <button className="section-btn" style={{backgroundColor: '#fff', color: '#ff8c00', border: '1px solid #ff8c00'}} onClick={() => navigate('/ShoppingPage')}>보러가기 →</button>
                </section>
            </div>
        </div>
    );
};

export default HomePage;