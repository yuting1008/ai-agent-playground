# AI Agent Playground

AI Agent Playground 是一個多模態、多代理人的 AI 系統，使用者可以透過文字、語音、影像及圖像式介面等多種方式與 AI 互動，讓 AI 能夠在各種情境中準確地完成任務。

[Online Demo](https://playground.azuretsp.com/)

![screenshot](screenshot.png)
<!-- TODO: Demo Video -->

### Table of Contents
<!-- TODO: Update table -->
1. 前置條件
1. 建立本地開發環境
1. 模擬正式部署
1. 在本地環境建置與測試映像
1. 建立 Azure Container Registry 並推送映像
1. 授權登錄的受控識別
1. 建立並部署 Web 應用程式
1. 使用應用程式
1. 修改應用程式碼並重新部署

# Step 1. 前置條件

1. [pnpm](https://pnpm.io/zh-TW/installation)
1. [Docker Desktop](https://www.docker.com/products/docker-desktop/)
1. [Azure CLI](https://learn.microsoft.com/zh-tw/cli/azure/install-azure-cli)

# Step 2. 建立本地開發環境
在此步驟中，我們會建立本地開發環境，讓開發者可以即時撰寫、測試與調整應用程式功能。在這個模式下，程式碼修改後會自動重新載入（Hot Module Replacement, HMR）。這有助於幫助開發者大幅提升開發與除錯效率。

1. 安裝專案相依套件

```bash
pnpm install
```

2. 啟動伺服器

```bash
pnpm start
```

3. 開啟瀏覽器預覽

http://localhost:3000/



# Step 3. 模擬正式部署

在此步驟中，我們將會把專案程式碼編譯成最佳化的靜態資源，並且透過啟動靜態伺服器，我們可以在本地環境中預覽網站，模擬實際部署網站後的成果。這有助於測試部署成果是否符合預期，並提早發現潛在的相容性或路徑問題。

1. 安裝靜態伺服器工具
```bash
npm install -g serve
```

2. 編譯 TypeScript 成正式版本
```bash
pnpm build
```

3. 啟動伺服器
```bash
serve -s build
```


# Step 4. 在本地環境建置與測試映像
在此步驟中，我們將把應用程式包裝成 Docker 映像，並在本地環境中進行測試，以確保應用程式在容器化環境下依然可以順利運行，為後續上傳至 Azure 做準備。

1. 建立映像
```bash
docker build -t ai-agent-playground .
```

2. 除錯時，啟動容器並進入其檔案系統
```bash
docker run -it --rm ai-agent-playground sh
```

3. 在本地執行 Docker 容器
測試組建是否能正常運作
```bash
docker run -p 3000:3000 ai-agent-playground
```

4. 開啟 Docker Desktop 檢查容器是否順利運行


# Step 5. 建立 Azure Container Registry 並推送映像 
在此步驟中，我們將會建立一個 [Azure Container Registry（ACR）](https://azure.microsoft.com/zh-tw/products/container-registry)容器登錄，作為應用程式映像的雲端儲存空間。ACR 可用來集中管理容器映像，並支援後續的自動化部署。完成登錄建立後，我們會將剛才建立的 Docker 映像標記並推送至 ACR，供後續 Azure App Service 使用。

### 建立 Azure Container Registry

1. 登入 Azure CLI
```bash
az login
```
2. 建立資源群組
<!-- ai-agent-playground -->
```bash
az group create --name <resource-group-name> --location westeurope
```
3. 建立受控識別
<!-- ai-agent-identity -->
```bash
az identity create --name <identity-name> --resource-group <resource-group-name>
```
4. 建立 Azure Container Registry
<!-- sallyaiagentregistry -->
<!-- Registry name cannot contain dashes. -->
```bash
az acr create --name <registry-name> --resource-group <resource-group-name> --sku Basic --admin-enabled true
```
5. 擷取系統管理認證
```bash
az acr credential show --resource-group <resource-group-name> --name <registry-name>
```
<!-- az acr credential show --resource-group ai-agent-playground --name sallyaiagentregistry -->

### 將映像推送至 Azure Container Registry
將映像推送至 Azure Container Registry，以供 App Service 稍後使用。
1. 登入您的登錄
```bash
az acr login --name <registry-name>
```
<!-- az acr login --name sallyaiagentregistry -->


2. 將本機 Docker 映像標記至登錄
```bash
TAGVERSION=v1.4
docker tag ai-agent-playground <registry-name>.azurecr.io/ai-agent-playground:$TAGVERSION
docker tag ai-agent-playground <registry-name>.azurecr.io/ai-agent-playground:latest
```
<!-- TAGVERSION=v1.4
docker tag ai-agent-playground sallyaiagentregistry.azurecr.io/ai-agent-playground:$TAGVERSION
docker tag ai-agent-playground sallyaiagentregistry.azurecr.io/ai-agent-playground:latest -->


3. 使用 docker push 將映像推送至登錄
```bash
docker push <registry-name>.azurecr.io/ai-agent-playground:$TAGVERSION
docker push <registry-name>.azurecr.io/ai-agent-playground:latest
```
<!-- docker push sallyaiagentregistry.azurecr.io/ai-agent-playground:$TAGVERSION
docker push sallyaiagentregistry.azurecr.io/ai-agent-playground:latest -->


# Step 6. 授權登錄的受控識別
在此步驟中，我們將會為受控識別授與 AcrPull 權限，讓 Azure App Service 可以安全地從 ACR 存取映像。

1. 前往 [Azure Portal](https://ms.portal.azure.com)，開啟剛才建立的容器登錄。

1. 在左側導覽功能表中選取**存取控制 (IAM)**，選擇**新增**
![screenshot](image/iam.png)

1. 在角色清單中選取 **AcrPull**。
![screenshot](image/acrpull.png)

1. 選擇**受控識別**與**選取成員** > 選擇**您的訂用帳戶**、**使用者指派的受控識別**，以及您剛才建立的受控識別。
![screenshot](image/add-iam.png)

1. 完成**檢覽 + 指派**。



# Step 7. 建立並部署 Web 應用程式
在此步驟中，我們將透過 Azure Portal 建立一個 Web 應用程式（App Service），並部署先前上傳至 ACR 的映像。這個服務會作為容器映像的執行環境，並提供一個公開的 URL 供使用者存取應用程式。

1. 在 [Azure Portal](https://ms.portal.azure.com) 頂端的搜尋列中輸入「Web App」，選擇**應用程式服務**並點選**建立**。
![screenshot](image/search-web-app.png)

2. 按照以下敘述完成 Web 應用程式基礎設定。
- 選取您稍早使用的訂用帳戶與資源群組
- 輸入唯一的應用程式名稱，其會用於您應用程式的預設主機名稱 ``<app-name>.azurewebsites.net``
- 在發佈中，選取 **容器**
- 在作業系統中，選取 **Linux**
- 在地區中，選取 West Europe 或您附近的區域
- 在 Linux 方案中，選取**新建**，輸入方案名稱，然後選取**確定**
- 在價格方案中，選取 **B1**
![screenshot](image/set-web-app.png)

3. 瀏覽**容器**索引標籤，依照以下設定建立容器設定。
- 在映像來源中，選取 **Azure Container Registry**
- 在登錄中，選取您稍早建立的容器登錄
- 在 Authentication 中，選取 **Managed identity**
- 在 Identity 中，選取您剛才建立的受控識別
- 在映像中，輸入 **ai-agent-playground**
- 在標籤中，輸入 **latest**
- 在連接埠中，輸入 **3000**
- 完成**檢閱 + 建立**
![screenshot](image/set-docker.png)

4. 前往剛才建立的**應用程式服務**，瀏覽**設定 > 環境變數 > 應用程式設定**，選取**新增**。
![screenshot](image/set-port.png)

5. 輸入名稱 **WEBSITES_PORT** 與值 **3000**，完成套用。
![screenshot](image/edit-port.png)

6. 前往剛才建立的**應用程式服務**中的**概觀**，在預設網域中選取連結，即可存取應用程式。
![screenshot](image/website.png)
> 第一次嘗試存取應用程式時，應用程式可能需要一些時間才能回應，因為 App Service 必須從登錄提取整個映像。 如果瀏覽器逾時，只需重新整理頁面即可。

> 更多與部署 Web App 相關的說明請參考：https://learn.microsoft.com/zh-tw/azure/app-service/tutorial-custom-container?tabs=azure-portal&pivots=container-linux

# Step 8. 使用應用程式
1. 開啟應用程式後，選擇 **Settings**。
![screenshot](image/settings.png)

1. Connect
![screenshot](image/connect.png)


# Step 9. 修改應用程式碼並重新部署
部署完成後，開發者可能會根據實際使用情況或新需求對應用程式進行修改。當程式碼完成修改後，需要重新建置 Docker 映像，並推送至 ACR，以讓 App Service 自動拉取最新版本的映像並更新部署內容。

1. 重建映像。
```bash
docker build -t ai-agent-playground .
```

2. 將映像的標籤更新為 latest。
```bash
docker tag ai-agent-playground <registry-name>.azurecr.io/ai-agent-playground:latest
```
<!-- docker tag ai-agent-playground sallyaiagentregistry.azurecr.io/ai-agent-playground:latest -->

3. 將映像推送至登錄。
```bash
docker push <registry-name>.azurecr.io/ai-agent-playground:latest
```
<!-- docker push sallyaiagentregistry.azurecr.io/ai-agent-playground:latest -->


# Debugging
- In Container registry
  - Make sure the image is pushed to ACR
- In Web App
  - Deployment Center / Logs
    For Setup log
  - Log Stream
    For console log


# Note
- Must use production build for deployment

