FROM node:18-alpine

# 安裝 pnpm
RUN npm install -g pnpm

# 建立工作資料夾
WORKDIR /app

# 複製 package.json 和 pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# 安裝依賴
RUN pnpm install --frozen-lockfile

# 複製專案檔案
COPY . .

# 編譯
RUN pnpm build

# 安裝 serve
RUN npm install -g serve

EXPOSE 3000 2222

# 啟動
CMD ["serve", "-s", "build"]