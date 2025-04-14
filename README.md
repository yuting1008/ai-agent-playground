# AI Agent Playground

AI Agent Playground 是一個多模態、多智能體的 AI 助手，使用者可以透過文字、語音、影像及圖像式介面等多種方式與 AI 互動，讓 AI 能夠在各種情境中準確地完成任務。

[Online Demo](https://playground.azuretsp.com/)

![screenshot](screenshot.png)
<!-- TODO: Demo Video -->

### Table of Contents
1. 前置條件
1. 建立本地開發環境
1. 模擬正式部署
1. 在本地環境建置與測試映像
1. 建立 Azure Container Registry 並推送映像
1. 建立並部署 Web 應用程式
1. 如何使用該應用程式

# Step 1. 前置條件

1. [pnpm](https://pnpm.io/zh-TW/installation)
1. [Docker Desktop](https://www.docker.com/products/docker-desktop/)
1. [Azure CLI](https://learn.microsoft.com/zh-tw/cli/azure/install-azure-cli)

# Step 2. 建立本地開發環境
此步驟將說明如何建立本地開發環境。本地開發環境讓開發者可以即時撰寫、測試與調整應用程式功能。在這個模式下，程式碼修改後會自動重新載入（Hot Module Replacement, HMR）。這有助於幫助開發者大幅提升開發與除錯效率。

##  安裝專案相依套件

```bash
pnpm install
```

## 啟動伺服器

```bash
pnpm start
```

## 開啟瀏覽器預覽

http://localhost:3000/



# Step 3. 模擬正式部署

在此步驟中專案程式碼將會被編譯成最佳化的靜態資源，並且透過靜態伺服器，我們可以在本地環境中預覽網站，模擬實際部署網站後的成果。這有助於測試部署成果是否符合預期，並提早發現潛在的相容性或路徑問題。

## 安裝靜態伺服器工具

```
npm install -g serve
```

## 編譯 TypeScript 成正式版本

```
pnpm build
```

## 啟動伺服器

```
serve -s build
```


# Step 4. 在本地環境建置與測試映像

## 建立映像
```
docker build -t ai-agent-playground .
```

## 除錯時，啟動容器並進入其檔案系統
```
docker run -it --rm ai-agent-playground sh
```

## 在本地執行 Docker 容器
測試組建是否能正常運作
```
docker run -p 3000:3000 ai-agent-playground
```

## 開啟 Docker Desktop 檢查容器是否順利運行


# Step 5. 建立 Azure Container Registry 並推送映像 

## 建立 Azure Container Registry

1. 登入 Azure CLI
```
az login
```
2. 建立資源群組
<!-- ai-agent-playground -->
```
az group create --name <resource-group-name> --location westeurope
```
3. 建立受控識別
<!-- ai-agent-identity -->
```
az identity create --name <myID> --resource-group <resource-group-name>
```
4. 建立 Azure Container Registry
<!-- sallyaiagentregistry -->
<!-- Registry name cannot contain dashes. -->
```
az acr create --name <registry-name> --resource-group <resource-group-name> --sku Basic --admin-enabled true
```
3. 擷取系統管理認證
```
az acr credential show --resource-group <resource-group-name> --name <registry-name>
```
<!-- az acr credential show --resource-group ai-agent-playground --name sallyaiagentregistry -->

## 將映像推送至 Azure Container Registry
<!-- 我做到這裡！！ -->
```
az acr login --name <registry-name>
docker tag ai-agent-playground <registry-name>.azurecr.io/ai-agent-playground:latest
docker push <registry-name>.azurecr.io/ai-agent-playground:latest
```

# Step 6. 建立並部署 Web 應用程式

<!-- ## Deploy to Azure Web App for Containers -->
> 更多詳細說明請參考：https://learn.microsoft.com/zh-tw/azure/app-service/tutorial-custom-container?tabs=azure-portal&pivots=container-linux

## Debugging
- In Container registry
  - Make sure the image is pushed to ACR
- In Web App
  - Deployment Center / Logs
    For Setup log
  - Log Stream
    For console log

# Step 7. 如何使用該應用程式
1. Upload profile
2. Connect

# Note
- Must use production build for deployment

