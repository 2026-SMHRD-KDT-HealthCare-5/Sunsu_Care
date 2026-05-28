[핵심 DB멘토링] 김광진 - router128@hanmail.net

팀명: SUNSUCARE(선수케어)
팀원:정현우 이응균 도혜선 정아인
주제: YOLO 기반 선케어 제품 이미지 분석 및 맞춤형 추천 서비스


* DB모델링 주소:

URL : https://aquerytool.com/aquerymain/index/?rurl=cbb296ce-d143-4308-923a-077cb724471a&
Password : 7f68s0

-- ============================================================
-- 1) tb_user (사용자) — 멘토링 대비 변경 있음
-- ============================================================
CREATE TABLE `tb_user` (
  `user_idx`       int NOT NULL AUTO_INCREMENT COMMENT '회원 번호',
  `password_hash`  varchar(255) NOT NULL COMMENT '비밀번호',
  `nickname`       varchar(50)  NOT NULL COMMENT '닉네임',
  `email`          varchar(50)  NOT NULL COMMENT '이메일',
  `role`           varchar(20)  NOT NULL COMMENT '회원 구분',
  `created_at`     datetime     NOT NULL COMMENT '가입 일시',
  `updated_at`     datetime     NOT NULL COMMENT '수정 일시',
  `deleted_at`     datetime DEFAULT NULL COMMENT '삭제 일시',
  PRIMARY KEY (`user_idx`),
  UNIQUE KEY `UQ_tb_user_1` (`email`),
  KEY `IX_tb_user_2` (`nickname`),
  KEY `IX_tb_user_1` (`created_at`,`updated_at`)
) ENGINE=InnoDB COMMENT='사용자';

-- ============================================================
-- 2) tb_profile (사용자 정보) — 멘토링 대비 변경 있음
-- ============================================================
CREATE TABLE `tb_profile` (
  `profile_idx`       int NOT NULL AUTO_INCREMENT COMMENT '프로필 번호',
  `user_id`           int NOT NULL COMMENT '회원 번호',
  `skin_type`         varchar(50) NOT NULL COMMENT '피부 타입',
  `activity_env`      varchar(50) DEFAULT NULL COMMENT '주 활동 환경',
  `prod_type`         varchar(50) NOT NULL COMMENT '선호 제형',
  `avoid_ingredient`  varchar(50) NOT NULL COMMENT '기피 성분',
  `joined_at`         datetime NOT NULL COMMENT '등록 일시',
  `updated_at`        datetime DEFAULT NULL,
  PRIMARY KEY (`profile_idx`),
  KEY `FK_tb_profile_user_id_tb_user_user_idx` (`user_id`),
  CONSTRAINT `FK_tb_profile_user_id_tb_user_user_idx`
    FOREIGN KEY (`user_id`) REFERENCES `tb_user` (`user_idx`)
    ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB COMMENT='사용자 정보';

-- ============================================================
-- 3) tb_product (선케어 제품) — 멘토링과 동일
-- ============================================================
CREATE TABLE `tb_product` (
  `prod_idx`        int NOT NULL AUTO_INCREMENT COMMENT '제품 코드',
  `prod_name`       varchar(50) NOT NULL COMMENT '제품 명',
  `brand_name`      varchar(50) NOT NULL COMMENT '브랜드 명',
  `spf_val`         varchar(50) NOT NULL COMMENT 'SPF 지수',
  `pa_val`          varchar(50) NOT NULL COMMENT 'PA 지수',
  `uv_type`         varchar(50) NOT NULL COMMENT 'UV 차단방식',
  `created_at`      datetime NOT NULL COMMENT '등록 일자',
  `image_filename`  varchar(255) DEFAULT NULL COMMENT '제품 대표 이미지 파일명',  -- ← 추가됨
  PRIMARY KEY (`prod_idx`)
) ENGINE=InnoDB AUTO_INCREMENT=101 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='선케어 제품';

-- ============================================================
-- 4) tb_product_detail (제품 성분 정보) — 멘토링 대비 변경 있음
-- ============================================================
CREATE TABLE `tb_product_detail` (
  `mixed_idx`   int NOT NULL AUTO_INCREMENT COMMENT '배합 번호',
  `prod_idx`    int NOT NULL COMMENT '제품 코드',
  `ingre_idx`   int NOT NULL COMMENT '성분 번호',
  `created_at`  datetime NOT NULL COMMENT '등록 일자',
  PRIMARY KEY (`mixed_idx`),
  UNIQUE KEY `UQ_product_ingredient` (`prod_idx`,`ingre_idx`),
  KEY `FK_tb_product_detail_ingre_idx_tb_ingredient_ingre_idx` (`ingre_idx`),
  CONSTRAINT `FK_tb_product_detail_ingre_idx_tb_ingredient_ingre_idx`
    FOREIGN KEY (`ingre_idx`) REFERENCES `tb_ingredient` (`ingre_idx`)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `FK_tb_product_detail_prod_idx_tb_product_prod_idx`
    FOREIGN KEY (`prod_idx`) REFERENCES `tb_product` (`prod_idx`)
    ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB COMMENT='제품 성분 정보';

-- ============================================================
-- 5) tb_ingredient (성분 정보) — 멘토링 대비 변경 있음
-- ============================================================
CREATE TABLE `tb_ingredient` (
  `ingre_idx`         int NOT NULL AUTO_INCREMENT COMMENT '성분 번호',
  `ingre_name`        varchar(768) NOT NULL COMMENT '성분명',
  `ewg_grade`         int NOT NULL COMMENT 'EWG 등급',
  `skin_warning`      varchar(255) NOT NULL COMMENT '피부타입별 주의사항',
  `warning_category`  varchar(100) DEFAULT NULL COMMENT '성분 효능/주의 카테고리',
  `analysis_type`     varchar(30)  DEFAULT NULL COMMENT '분석 분류: KEY, CAUTION, NORMAL',
  PRIMARY KEY (`ingre_idx`),
  UNIQUE KEY `UQ_tb_ingredient_name` (`ingre_name`)
) ENGINE=InnoDB COMMENT='성분 정보';

-- ============================================================
-- 6) tb_upload (업로드 파일) — 멘토링과 동일
-- ============================================================
CREATE TABLE `tb_upload` (
  `file_idx`     int NOT NULL AUTO_INCREMENT COMMENT '파일 번호',
  `user_idx`     int NOT NULL COMMENT '회원 번호',
  `file_name`    varchar(255) NOT NULL COMMENT '파일 이름',
  `file_ext`     varchar(10)  NOT NULL COMMENT '파일 확장자',
  `file_size`    int NOT NULL COMMENT '파일 사이즈',
  `uploaded_at`  datetime NOT NULL COMMENT '업로드 날짜',
  PRIMARY KEY (`file_idx`),
  KEY `FK_tb_upload_user_idx_tb_user_user_idx` (`user_idx`),
  CONSTRAINT `FK_tb_upload_user_idx_tb_user_user_idx`
    FOREIGN KEY (`user_idx`) REFERENCES `tb_user` (`user_idx`)
    ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB COMMENT='업로드 파일';

-- ============================================================
-- 7) tb_analysis (YOLO 분석) — 멘토링과 동일
-- ============================================================
CREATE TABLE `tb_analysis` (
  `analysis_idx`       int NOT NULL AUTO_INCREMENT COMMENT '분석 번호',
  `file_idx`           int NOT NULL COMMENT '파일 번호',
  `model_name`         varchar(50)  NOT NULL COMMENT '모델 명',
  `prod_code`          varchar(50)  NOT NULL COMMENT '제품 코드',
  `prod_name`          varchar(100) NOT NULL COMMENT '제품 명',
  `analysis_result`    text NOT NULL COMMENT '분석결과',
  `suitability_score`  int NOT NULL COMMENT '적합도 점수',
  `analyzed_at`        datetime NOT NULL COMMENT '분석 일자',
  PRIMARY KEY (`analysis_idx`),
  KEY `FK_tb_analysis_file_idx_tb_upload_file_idx` (`file_idx`),
  CONSTRAINT `FK_tb_analysis_file_idx_tb_upload_file_idx`
    FOREIGN KEY (`file_idx`) REFERENCES `tb_upload` (`file_idx`)
    ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB COMMENT='YOLO 분석';

-- ============================================================
-- 8) tb_recommendation (제품 추천) — 멘토링과 동일
-- ============================================================
CREATE TABLE `tb_recommendation` (
  `reco_idx`     int NOT NULL AUTO_INCREMENT COMMENT '추천 번호',
  `user_idx`     int NOT NULL COMMENT '회원 번호',
  `prod_idx`     int NOT NULL COMMENT '제품 번호',
  `reco_reason`  text NOT NULL COMMENT '추천 사유',
  `created_at`   datetime NOT NULL COMMENT '등록 일자',
  PRIMARY KEY (`reco_idx`),
  KEY `FK_tb_recommendation_user_idx_tb_user_user_idx` (`user_idx`),
  KEY `FK_tb_recommendation_prod_idx_tb_product_prod_idx` (`prod_idx`),
  CONSTRAINT `FK_tb_recommendation_user_idx_tb_user_user_idx`
    FOREIGN KEY (`user_idx`) REFERENCES `tb_user` (`user_idx`)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `FK_tb_recommendation_prod_idx_tb_product_prod_idx`
    FOREIGN KEY (`prod_idx`) REFERENCES `tb_product` (`prod_idx`)
    ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB COMMENT='제품 추천';

-- ============================================================
-- 9) tb_analysis_log (FastAPI 작업 로그) — 멘토링에 없던 신규
-- ============================================================
CREATE TABLE `tb_analysis_log` (
  `log_idx`          int NOT NULL AUTO_INCREMENT COMMENT '이력 번호',
  `task_id`          varchar(100) NOT NULL COMMENT 'FastAPI 작업 ID',
  `analysis_result`  json NOT NULL COMMENT '분석 결과 JSON',
  `created_at`       datetime DEFAULT CURRENT_TIMESTAMP COMMENT '분석 일시',
  PRIMARY KEY (`log_idx`)
) ENGINE=InnoDB;

-- ============================================================
-- 10) ocr_tasks (OCR 작업 큐) — 멘토링에 없던 신규
-- ============================================================
CREATE TABLE `ocr_tasks` (
  `task_id`     varchar(36) NOT NULL,
  `request_id`  varchar(36) DEFAULT NULL,
  `status`      varchar(20) NOT NULL,
  `result`      json DEFAULT NULL,
  `updated_at`  datetime DEFAULT NULL,
  PRIMARY KEY (`task_id`),
  KEY `ix_ocr_tasks_request_id` (`request_id`)
) ENGINE=InnoDB;

-- ============================================================
-- 11) tmp_crawled_main_ingredient (크롤링 주요성분 스테이징) — 신규
-- ============================================================
CREATE TABLE `tmp_crawled_main_ingredient` (
  `row_no`             int DEFAULT NULL COMMENT '원본 번호',
  `ingre_name`         varchar(1000) NOT NULL COMMENT '성분명',
  `mixed_purpose`      varchar(100)  DEFAULT NULL COMMENT '배합 목적',
  `ewg_grade`          int DEFAULT NULL COMMENT 'EWG 등급',
  `skin_warning`       varchar(255) DEFAULT NULL COMMENT '피부 주의사항',
  `match_status`       varchar(20) NOT NULL DEFAULT 'PENDING' COMMENT '매칭 상태',
  `matched_ingre_idx`  int DEFAULT NULL COMMENT '매칭된 API 성분 번호',
  KEY `IX_tmp_crawled_row_no` (`row_no`)
) ENGINE=InnoDB;

-- ============================================================
-- 12) tmp_product_ingredient (제품-성분 매칭 스테이징) — 신규
-- ============================================================
CREATE TABLE `tmp_product_ingredient` (
  `row_no`             int NOT NULL AUTO_INCREMENT COMMENT '행 번호',
  `prod_idx`           int NOT NULL COMMENT '제품 번호',
  `ingre_name`         varchar(1000) NOT NULL COMMENT '크롤링 성분명',
  `mixed_purpose`      varchar(100) DEFAULT NULL COMMENT '배합 목적',
  `ewg_grade`          int DEFAULT NULL COMMENT 'EWG 등급',
  `skin_warning`       varchar(255) DEFAULT NULL COMMENT '피부 주의사항',
  `match_status`       varchar(20) NOT NULL DEFAULT 'PENDING' COMMENT '매칭 상태',
  `matched_ingre_idx`  int DEFAULT NULL COMMENT '매칭된 성분 번호',
  PRIMARY KEY (`row_no`)
) ENGINE=InnoDB;