# 제품 이미지 폴더

`tb_product.image_filename` 컬럼에 저장된 파일명과 일치하는 이미지 파일을 이 폴더에 넣어주세요.

예시:
- DB: `image_filename = "sunsafe_mild.jpg"`
- 파일 위치: `backend/uploads/products/sunsafe_mild.jpg`
- 접근 URL: `http://localhost:4000/uploads/products/sunsafe_mild.jpg`

이 경로는 정적(public)으로 서빙되므로 브라우저에서 바로 접근 가능합니다.
