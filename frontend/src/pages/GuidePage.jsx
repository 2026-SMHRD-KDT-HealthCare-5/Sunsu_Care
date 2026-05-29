import React, { useEffect } from 'react';
import './GuidePage.css';

const RELATED_SITES = [
  {
    icon: '🏥',
    title: '질병관리청 국가건강정보포털',
    desc: '자외선 건강정보 상세 안내',
    domain: 'health.kdca.go.kr',
    href: 'https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=5500',
  },
  {
    icon: '🧴',
    title: 'American Academy of Dermatology',
    desc: '선크림 사용법 · 자가진단 · 피부암 예방',
    domain: 'aad.org',
    href: 'https://www.aad.org/public/diseases/skin-cancer/prevent/how',
  },
];

const VIDEOS = [
  {
    id: 'WEQz_U7uB58',
    title: "선크림 '이렇게' 발랐더니 오히려 피부노화 빨라지는 이유?! ㅣ 자외선차단제의 역설",
    channel: 'YouTube',
    href: 'https://youtu.be/WEQz_U7uB58',
  },
  {
    id: 'Sa8i9Q0fPJk',
    title: '선크림 바르는 법, 선크림의 중요성! [현명한 식약처 탐험생활]',
    channel: '식품의약품안전처',
    href: 'https://youtu.be/Sa8i9Q0fPJk',
  },
  {
    id: '9oAWz7XYQ_k',
    title: '선크림 후 세안, 이건 추천하지 않습니다',
    channel: '더마킹 김동하 피부 연구소',
    href: 'https://www.youtube.com/watch?v=9oAWz7XYQ_k',
  },
];

function GuidePage() {
  // 🌟 화면이 켜지자마자 스크롤을 맨 위(0,0)로 강제 이동!
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="page guide fade-in-up">
      <div className="guide__header">
        <span className="guide__overline">INFORMATION</span>
        <h1 className="guide__title">정보 공유</h1>
        <p className="guide__subtitle">
          자외선과 피부 보호에 대해
          <br />더 알아보고 싶다면 확인해보세요
        </p>
      </div>

      {/* 관련 사이트 */}
      <section className="guide__section">
        <h2 className="guide__section-title">🔗 관련 사이트</h2>
        <div className="guide__links">
          {RELATED_SITES.map((site) => (
            <a
              key={site.href}
              className="guide__link"
              href={site.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="guide__link-icon">{site.icon}</div>
              <div className="guide__link-body">
                <div className="guide__link-title">{site.title}</div>
                <div className="guide__link-desc">{site.desc}</div>
                <div className="guide__link-domain">{site.domain}</div>
              </div>
              <div className="guide__link-arrow">↗</div>
            </a>
          ))}
        </div>
      </section>

      {/* 추천 영상 */}
      <section className="guide__section">
        <h2 className="guide__section-title">🎥 추천 영상</h2>
        <div className="guide__videos">
          {VIDEOS.map((video) => (
            <a
              key={video.id}
              className="guide__video"
              href={video.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="guide__video-thumb-wrap">
                <img
                  className="guide__video-thumb"
                  src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
                  alt={`${video.title} 썸네일`}
                  loading="lazy"
                />
              </div>
              <div className="guide__video-meta">
                <div className="guide__video-title">{video.title}</div>
                <div className="guide__video-channel">{video.channel}</div>
              </div>
            </a>
          ))}
        </div>
      </section>

      <p className="guide__footer-note">
        제공되는 정보는 참고용이며,
        <br />증상이 있을 경우 전문의와 상담하세요.
      </p>
    </div>
  );
}

export default GuidePage;