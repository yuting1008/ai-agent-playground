FROM node:18-alpine

# 安裝 pnpm 和 serve，並清理 npm 緩存
ARG PNPM_VERSION=10.8.0
RUN npm install -g pnpm@$PNPM_VERSION serve && npm cache clean --force

# 建立工作資料夾
WORKDIR /app

# 複製 package.json 和 pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# 安裝依賴後清理 pnpm 緩存
RUN pnpm install --frozen-lockfile && pnpm store prune

# 複製專案檔案
COPY . .

# 編譯
RUN pnpm build --out-dir build

EXPOSE 3000

# 啟動
CMD ["serve", "-s", "build"]