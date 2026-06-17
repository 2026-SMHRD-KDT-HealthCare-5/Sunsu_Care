# /backend/Dockerfile
FROM node:20-alpine

# 보안을 위해 컨테이너 내부 사용자 변경
WORKDIR /app

# 패키지 설치
COPY package*.json ./
RUN npm ci --only=production

# 소스 복사
COPY . .

# 권한 설정 (node 사용자에게 소유권 부여)
RUN chown -R node:node /app
USER node

EXPOSE 8000

# 운영 환경 실행 명령어 (package.json의 scripts 참고)
CMD ["node", "app.js"]