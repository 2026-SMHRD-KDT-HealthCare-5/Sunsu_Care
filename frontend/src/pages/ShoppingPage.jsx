import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ShoppingPage.css';

const ShoppingPage = () => {
    const navigate = useNavigate();

    // 🌟 페이지 진입 시 맨 위로 스크롤
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const openMobileShop = (url) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const shopData = [
        {
            id: 1,
            name: '화해 (Hwahae)',
            desc: '꼼꼼한 성분 분석과 솔직한 리뷰 확인',
            benefit: '🎁 성분 점수 확인 및 가성비 템 득템',
            logoUrl: 'https://play-lh.googleusercontent.com/TV-LVbnwpHOrdtIir2-SisR8171Us1NE_YfYW1yLFB3jhfbG_lnBvd3o1Vm_jf6q1w', // 화해 로고
            mobileUrl: 'https://www.hwahae.co.kr/'
        },
        {
            id: 2,
            name: '올리브영 (Olive Young)',
            desc: '트렌디한 선케어 제품을 가장 빠르게',
            benefit: '🚀 오늘드림 배송 & 실시간 랭킹 특가',
            logoUrl: 'https://cdn.smarttimes.co.kr/news/photo/202511/39905_38252_2218.jpeg', // 올리브영 로고
            mobileUrl: 'https://m.oliveyoung.co.kr'
        },
        {
            id: 3,
            name: '쿠팡 (Coupang)',
            desc: '매일 쓰는 선크림, 압도적인 가격경쟁력',
            benefit: '🛸 로켓배송으로 내일 당장 사용 가능',
            logoUrl: 'https://play-lh.googleusercontent.com/X5-X2S0t7G9dTGrPftk-5hXijqRDhwWKxGDs2gBm_kNPcAlO3re4exC_8nekvDhz-H0=w480-h960-rw', // 쿠팡 로고
            mobileUrl: 'https://m.coupang.com'
        }
    ];

    return (
        <div className="shopping-container fade-in-up">
            <header className="shopping-header">
                <div className="shopping-header__side" aria-hidden="true"></div>
                <div className="logo">SHOP</div>
                <button
                    type="button"
                    className="close-btn"
                    onClick={() => navigate(-1)}
                    aria-label="닫기"
                >
                    <i className="fa-solid fa-xmark"></i>
                </button>
            </header>

            <main className="shop-list-main">
                {shopData.map((shop) => (
                    <div 
                        key={shop.id} 
                        className="shop-card" 
                        onClick={() => openMobileShop(shop.mobileUrl)}
                    >
                        <div className="shop-logo-wrap">
                            {}
                            <img src={shop.logoUrl} alt={shop.name} className="shop-logo-img" />
                        </div>
                        
                        <div className="shop-info-wrap">
                            <div className="shop-name">{shop.name}</div>
                            <div className="shop-desc">{shop.desc}</div>
                            <div className="shop-benefit">{shop.benefit}</div>
                        </div>
                    </div>
                ))}
            </main>
        </div>
    );
};

export default ShoppingPage;