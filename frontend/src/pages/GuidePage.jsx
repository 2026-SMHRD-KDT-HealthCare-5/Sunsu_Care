import {
    GUIDE_RELATED_SITES,
    GUIDE_VIDEOS,
    getYouTubeThumbnailUrl,
} from '../constants/externalLinks';
import './GuidePage.css';

function GuidePage() {
    return (
        <div className="page guide">
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
                <h2 className="guide__section-title">
                    <span role="img" aria-label="링크">🔗</span> 관련 사이트
                </h2>
                <div className="guide__links">
                    {GUIDE_RELATED_SITES.map((site) => (
                        <a
                            key={site.href}
                            className="guide__link"
                            href={site.href}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <div className="guide__link-icon" aria-hidden="true">{site.icon}</div>
                            <div className="guide__link-body">
                                <div className="guide__link-title">{site.title}</div>
                                <div className="guide__link-desc">{site.desc}</div>
                                <div className="guide__link-domain">{site.domain}</div>
                            </div>
                            <div className="guide__link-arrow" aria-hidden="true">↗</div>
                        </a>
                    ))}
                </div>
            </section>

            {/* 추천 영상 */}
            <section className="guide__section">
                <h2 className="guide__section-title">
                    <span role="img" aria-label="영상">🎥</span> 추천 영상
                </h2>
                <div className="guide__videos">
                    {GUIDE_VIDEOS.map((video) => (
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
                                    src={getYouTubeThumbnailUrl(video.id)}
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
