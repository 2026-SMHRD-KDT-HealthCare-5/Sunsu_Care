[핵심 DB멘토링] 김광진 - router128@hanmail.net

팀명: SUNSUCARE(선수케어)
팀원:정현우 이응균 도혜선 정아인
주제: YOLO 기반 선케어 제품 이미지 분석 및 맞춤형 추천 서비스


* DB모델링 주소:

URL : https://aquerytool.com/aquerymain/index/?rurl=cbb296ce-d143-4308-923a-077cb724471a&
Password : 7f68s0


* 데이터베이스 설계순서?
요구사항분석 > 개념설계 > 논리설계 > 물리설계 > DB구현 (개.눈.물)

* 업로드 파일 처리하기

  file_folder = 'd:/uploads/';
  file_name = 'image0001.jpg';
  file_path = file_folder + file_name;

  file_basename = 'image0001';
  file_ext = '.jpg';
  file_size = 20234;

  file_basename + '_' + xxxxx + file_ext;
  'image0001_c3018d5f-4e93-11f1-b22c-f83dc6d1e2e1.jpg'

   xxxxxx(?): 현재시간 
              UUID(Universally Unique IDentifier, 우주에서 유일한 식별자)
  'd:/uploads/image0001.jpg'; <-- 폭망!
  
SELECT UUID(); 
# c3018d5f-4e93-11f1-b22c-f83dc6d1e2e1
# ce32e2f1-4e93-11f1-b22c-f83dc6d1e2e1
# 초당 100만번 * 86년 동안 중복회피.


* INT 타입:
  
  INT ... 32 BIT 정수(-2147483648~+2147483647) * 대략: -21억~+21억까지
------------------------------------------------------------------
* MySQL 계정 생성하기

-- DB: sucare_db 
-- USER : sucare_user 
-- PASSWORD : 1234 

# DB 생성
CREATE DATABASE sucare_db;
SHOW DATABASES;

# USER 생성
CREATE USER sucare_user@localhost IDENTIFIED BY '1234';

# USER 권한부여
GRANT SELECT ON sucare_db.* TO sucare_user@localhost;
GRANT ALL PRIVILEGES ON sucare_db.* TO sucare_user@localhost;

# 권한반영
FLUSH PRIVILEGES;

"SELECT user_idx, id, password_hash, name, email, phone, role, created_at, updated_at, deleted_at
FROM tb_user
WHERE user_idx = (?,);"
---------------------------------------------------------
-- 테이블 순서는 관계를 고려하여 한 번에 실행해도 에러가 발생하지 않게 정렬되었습니다.

-- tb_user Table Create SQL
-- 테이블 생성 SQL - tb_user
CREATE TABLE tb_user
(
    `user_idx`       INT             NOT NULL    AUTO_INCREMENT COMMENT '회원 번호', 
    `id`             VARCHAR(50)     NOT NULL    COMMENT '아이디', 
    `password_hash`  VARCHAR(255)    NOT NULL    COMMENT '비밀번호', 
    `name`           VARCHAR(50)     NOT NULL    COMMENT '성명', 
    `email`          VARCHAR(50)     NOT NULL    COMMENT '이메일', 
    `phone`          VARCHAR(20)     NOT NULL    COMMENT '연락처', 
    `role`           VARCHAR(20)     NOT NULL    COMMENT '회원 구분', 
    `created_at`     DATETIME        NOT NULL    COMMENT '가입 일시', 
    `updated_at`     DATETIME        NOT NULL    COMMENT '수정 일시', 
    `deleted_at`     DATETIME        NULL        COMMENT '삭제 일시', 
     PRIMARY KEY (user_idx)
);

-- 테이블 Comment 설정 SQL - tb_user
ALTER TABLE tb_user COMMENT '사용자';

-- Index 설정 SQL - tb_user(created_at, updated_at)
CREATE INDEX IX_tb_user_1
    ON tb_user(created_at, updated_at);

-- Index 설정 SQL - tb_user(name)
CREATE INDEX IX_tb_user_2
    ON tb_user(name);

-- Unique Index 설정 SQL - tb_user(email, phone)
CREATE UNIQUE INDEX UQ_tb_user_1
    ON tb_user(email, phone);


-- tb_product Table Create SQL
-- 테이블 생성 SQL - tb_product
CREATE TABLE tb_product
(
    `prod_idx`    INT            NOT NULL    AUTO_INCREMENT COMMENT '제품 코드', 
    `prod_name`   VARCHAR(50)    NOT NULL    COMMENT '제품 명', 
    `brand_name`  VARCHAR(50)    NOT NULL    COMMENT '브랜드 명', 
    `spf_val`     VARCHAR(50)    NOT NULL    COMMENT 'SPF 지수', 
    `pa_val`      VARCHAR(50)    NOT NULL    COMMENT 'PA 지수', 
    `uv_type`     VARCHAR(50)    NOT NULL    COMMENT 'UV 차단방식', 
    `created_at`  DATETIME       NOT NULL    COMMENT '등록 일자', 
     PRIMARY KEY (prod_idx)
);

-- 테이블 Comment 설정 SQL - tb_product
ALTER TABLE tb_product COMMENT '선케어 제품';


-- tb_ingredient Table Create SQL
-- 테이블 생성 SQL - tb_ingredient
CREATE TABLE tb_ingredient
(
    `ingre_idx`      INT             NOT NULL    AUTO_INCREMENT COMMENT '성분 번호', 
    `ingre_name`     VARCHAR(100)    NOT NULL    COMMENT '성분 명', 
    `mixed_purpose`  VARCHAR(100)    NOT NULL    COMMENT '배합 목적', 
    `ewg_grade`      INT             NOT NULL    COMMENT 'EWG 등급', 
    `skin_warning`   VARCHAR(255)    NOT NULL    COMMENT '피부타입별 주의사항', 
     PRIMARY KEY (ingre_idx)
);

-- 테이블 Comment 설정 SQL - tb_ingredient
ALTER TABLE tb_ingredient COMMENT '성분 정보';


-- tb_upload Table Create SQL
-- 테이블 생성 SQL - tb_upload
CREATE TABLE tb_upload
(
    `file_idx`     INT             NOT NULL    AUTO_INCREMENT COMMENT '파일 번호', 
    `user_idx`     INT             NOT NULL    COMMENT '회원 번호', 
    `file_name`    VARCHAR(255)    NOT NULL    COMMENT '파일 이름', 
    `file_ext`     VARCHAR(10)     NOT NULL    COMMENT '파일 확장자', 
    `file_size`    INT             NOT NULL    COMMENT '파일 사이즈', 
    `uploaded_at`  DATETIME        NOT NULL    COMMENT '업로드 날짜', 
     PRIMARY KEY (file_idx)
);

-- 테이블 Comment 설정 SQL - tb_upload
ALTER TABLE tb_upload COMMENT '업로드 파일';

-- Foreign Key 설정 SQL - tb_upload(user_idx) -> tb_user(user_idx)
ALTER TABLE tb_upload
    ADD CONSTRAINT FK_tb_upload_user_idx_tb_user_user_idx FOREIGN KEY (user_idx)
        REFERENCES tb_user (user_idx) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- Foreign Key 삭제 SQL - tb_upload(user_idx)
-- ALTER TABLE tb_upload
-- DROP FOREIGN KEY FK_tb_upload_user_idx_tb_user_user_idx;


-- tb_profile Table Create SQL
-- 테이블 생성 SQL - tb_profile
CREATE TABLE tb_profile
(
    `profile_idx`       INT            NOT NULL    AUTO_INCREMENT COMMENT '프로필 번호', 
    `user_id`           INT            NOT NULL    COMMENT '회원 번호', 
    `skin_type`         VARCHAR(50)    NOT NULL    COMMENT '피부 타입', 
    `senstive_yn`       VARCHAR(50)    NOT NULL    COMMENT '민감도 여부', 
    `prod_type`         VARCHAR(50)    NOT NULL    COMMENT '선호 제형', 
    `avoid_ingredient`  VARCHAR(50)    NOT NULL    COMMENT '기피 성분', 
    `joined_at`         DATETIME       NOT NULL    COMMENT '등록 일시', 
     PRIMARY KEY (profile_idx)
);

-- 테이블 Comment 설정 SQL - tb_profile
ALTER TABLE tb_profile COMMENT '사용자 정보';

-- Foreign Key 설정 SQL - tb_profile(user_id) -> tb_user(user_idx)
ALTER TABLE tb_profile
    ADD CONSTRAINT FK_tb_profile_user_id_tb_user_user_idx FOREIGN KEY (user_id)
        REFERENCES tb_user (user_idx) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- Foreign Key 삭제 SQL - tb_profile(user_id)
-- ALTER TABLE tb_profile
-- DROP FOREIGN KEY FK_tb_profile_user_id_tb_user_user_idx;


-- tb_analysis Table Create SQL
-- 테이블 생성 SQL - tb_analysis
CREATE TABLE tb_analysis
(
    `analysis_idx`       INT             NOT NULL    AUTO_INCREMENT COMMENT '분석 번호', 
    `file_idx`           INT             NOT NULL    COMMENT '파일 번호', 
    `model_name`         VARCHAR(50)     NOT NULL    COMMENT '모델 명', 
    `prod_code`          VARCHAR(50)     NOT NULL    COMMENT '제품 코드', 
    `prod_name`          VARCHAR(100)    NOT NULL    COMMENT '제품 명', 
    `analysis_result`    TEXT            NOT NULL    COMMENT '분석결과', 
    `suitability_score`  INT             NOT NULL    COMMENT '적합도 점수', 
    `analyzed_at`        DATETIME        NOT NULL    COMMENT '분석 일자', 
     PRIMARY KEY (analysis_idx)
);

-- 테이블 Comment 설정 SQL - tb_analysis
ALTER TABLE tb_analysis COMMENT 'YOLO 분석';

-- Foreign Key 설정 SQL - tb_analysis(file_idx) -> tb_upload(file_idx)
ALTER TABLE tb_analysis
    ADD CONSTRAINT FK_tb_analysis_file_idx_tb_upload_file_idx FOREIGN KEY (file_idx)
        REFERENCES tb_upload (file_idx) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- Foreign Key 삭제 SQL - tb_analysis(file_idx)
-- ALTER TABLE tb_analysis
-- DROP FOREIGN KEY FK_tb_analysis_file_idx_tb_upload_file_idx;


-- tb_product_detail Table Create SQL
-- 테이블 생성 SQL - tb_product_detail
CREATE TABLE tb_product_detail
(
    `mixed_idx`      INT              NOT NULL    AUTO_INCREMENT COMMENT '배합 번호', 
    `prod_idx`       INT              NOT NULL    COMMENT '제품 코드', 
    `ingre_idx`      INT              NOT NULL    COMMENT '성분 번호', 
    `ingre_content`  DECIMAL(12,1)    NOT NULL    COMMENT '성분 함량', 
    `ingre_unit`     VARCHAR(50)      NOT NULL    COMMENT '성분 단위', 
    `created_at`     DATETIME         NOT NULL    COMMENT '등록 일자', 
     PRIMARY KEY (mixed_idx)
);

-- 테이블 Comment 설정 SQL - tb_product_detail
ALTER TABLE tb_product_detail COMMENT '제품 성분 정보';

-- Foreign Key 설정 SQL - tb_product_detail(prod_idx) -> tb_product(prod_idx)
ALTER TABLE tb_product_detail
    ADD CONSTRAINT FK_tb_product_detail_prod_idx_tb_product_prod_idx FOREIGN KEY (prod_idx)
        REFERENCES tb_product (prod_idx) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- Foreign Key 삭제 SQL - tb_product_detail(prod_idx)
-- ALTER TABLE tb_product_detail
-- DROP FOREIGN KEY FK_tb_product_detail_prod_idx_tb_product_prod_idx;

-- Foreign Key 설정 SQL - tb_product_detail(ingre_idx) -> tb_ingredient(ingre_idx)
ALTER TABLE tb_product_detail
    ADD CONSTRAINT FK_tb_product_detail_ingre_idx_tb_ingredient_ingre_idx FOREIGN KEY (ingre_idx)
        REFERENCES tb_ingredient (ingre_idx) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- Foreign Key 삭제 SQL - tb_product_detail(ingre_idx)
-- ALTER TABLE tb_product_detail
-- DROP FOREIGN KEY FK_tb_product_detail_ingre_idx_tb_ingredient_ingre_idx;


-- tb_recommendation Table Create SQL
-- 테이블 생성 SQL - tb_recommendation
CREATE TABLE tb_recommendation
(
    `reco_idx`     INT         NOT NULL    AUTO_INCREMENT COMMENT '추천 번호', 
    `user_idx`     INT         NOT NULL    COMMENT '회원 번호', 
    `prod_idx`     INT         NOT NULL    COMMENT '제품 번호', 
    `reco_reason`  TEXT        NOT NULL    COMMENT '추천 사유', 
    `created_at`   DATETIME    NOT NULL    COMMENT '등록 일자', 
     PRIMARY KEY (reco_idx)
);

-- 테이블 Comment 설정 SQL - tb_recommendation
ALTER TABLE tb_recommendation COMMENT '제품 추천';

-- Foreign Key 설정 SQL - tb_recommendation(user_idx) -> tb_user(user_idx)
ALTER TABLE tb_recommendation
    ADD CONSTRAINT FK_tb_recommendation_user_idx_tb_user_user_idx FOREIGN KEY (user_idx)
        REFERENCES tb_user (user_idx) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- Foreign Key 삭제 SQL - tb_recommendation(user_idx)
-- ALTER TABLE tb_recommendation
-- DROP FOREIGN KEY FK_tb_recommendation_user_idx_tb_user_user_idx;

-- Foreign Key 설정 SQL - tb_recommendation(prod_idx) -> tb_product(prod_idx)
ALTER TABLE tb_recommendation
    ADD CONSTRAINT FK_tb_recommendation_prod_idx_tb_product_prod_idx FOREIGN KEY (prod_idx)
        REFERENCES tb_product (prod_idx) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- Foreign Key 삭제 SQL - tb_recommendation(prod_idx)
-- ALTER TABLE tb_recommendation
-- DROP FOREIGN KEY FK_tb_recommendation_prod_idx_tb_product_prod_idx;


