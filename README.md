# Video Recap

繁體中文 YouTube 影片重點筆記網站。Next.js 15 + Azure SQL,部署到 Azure WebApp。

## Pages

| Path | Purpose |
|------|---------|
| `/` | 首頁,列出所有筆記 |
| `/video-recap` | 所有筆記彙整 |
| `/video-recap/{yyyy-mm}-{slug}` | 個別筆記頁 |

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS,Noto Sans/Serif TC 字型
- `mssql` driver 連線 Azure SQL Database
- `output: 'standalone'`,部署到 Azure WebApp Linux Node 20

## Local development

```bash
npm install
cp .env.example .env       # fill in Azure SQL credentials
npm run db:init            # create dbo.recaps table
npm run db:seed            # insert sample recap
npm run dev                # http://localhost:3000
```

## Azure SQL setup

1. Create an Azure SQL Database (Serverless General Purpose is enough for this).
2. Add your local IP and Azure WebApp outbound IPs to the SQL server firewall.
3. Set the `AZURE_SQL_*` variables locally and as App Settings on the WebApp.

Schema lives in [`db/schema.sql`](db/schema.sql). Run `npm run db:init` against any environment to create the table; the script is idempotent.

## Deploy to Azure (App Service + Azure SQL)

Account: `mark.pl.chen@toastmasters.org.tw`

### 1. Provision infra (one-time)

```powershell
az login                                           # pick mark.pl.chen@... in browser
az account set --subscription "<sub-id>"
az group create -n rg-video-recap -l southeastasia

$env:AZURE_SQL_ADMIN_PASSWORD = '<strong-password>'
az deployment group create `
  -g rg-video-recap `
  -f infra/bicep/main.bicep `
  -p infra/bicep/main.bicepparam `
  -p sqlAdminPassword=$env:AZURE_SQL_ADMIN_PASSWORD
```

What gets created:

| Resource | SKU | Purpose |
|---|---|---|
| Log Analytics + App Insights | PerGB2018 | telemetry |
| App Service Plan (Linux) | B1 | hosts the Next.js app |
| App Service (Node 20) | — | the web app itself |
| Azure SQL Server | — | DB host |
| Azure SQL Database | Basic | recap content storage |

App settings (`AZURE_SQL_SERVER`, `AZURE_SQL_DATABASE`, `AZURE_SQL_USER`,
`AZURE_SQL_PASSWORD`, `AZURE_SQL_PORT`, `AZURE_SQL_ENCRYPT`) are wired
automatically from the SQL resource into the App Service — no manual copy needed.

### 2. Initialise DB schema and seed

```bash
# From your local machine, after adding your IP to the SQL server firewall.
# (Or run the same scripts from Azure Cloud Shell.)
cp .env.example .env
# Edit .env with the SQL server FQDN, user, password from the bicep outputs.
npm run db:init
npm run db:seed
```

### 3. Build + deploy the app

```powershell
.\scripts\deploy.ps1 -ResourceGroup rg-video-recap -SiteName app-video-recap
```

(or `./scripts/deploy.sh rg-video-recap app-video-recap` on bash)

The script runs `npm ci`, `next build` (standalone output), zips
`.next/standalone` + `.next/static` + `public`, and pushes via `az webapp deploy`.

### 4. Verify

```bash
curl https://app-video-recap.azurewebsites.net/
# → renders the homepage with the seeded recap stubs
```

### Optional: GitHub Actions CI/CD

A workflow is parked at `docs/deploy/azure-webapp.workflow.yml`. To enable:

```bash
gh auth refresh -h github.com -u aipmtw -s workflow   # one-time, opens browser
mkdir -p .github/workflows
git mv docs/deploy/azure-webapp.workflow.yml .github/workflows/azure-webapp.yml
git commit -m "Enable Azure WebApp deploy workflow"
git push
```

The workflow needs a `AZURE_CREDENTIALS` repo secret (output of
`az ad sp create-for-rbac --sdk-auth ...`).

Required GitHub secrets:

- `AZURE_CREDENTIALS` — output of:
  ```bash
  az ad sp create-for-rbac \
    --name video-recap-deploy \
    --role contributor \
    --scopes /subscriptions/<sub-id>/resourceGroups/<rg> \
    --sdk-auth
  ```

Required App Settings on the WebApp:

- `AZURE_SQL_SERVER`
- `AZURE_SQL_DATABASE`
- `AZURE_SQL_USER`
- `AZURE_SQL_PASSWORD`
- `WEBSITE_NODE_DEFAULT_VERSION=~20`
- Startup command: `node server.js`

## Adding a recap

For now, insert directly into Azure SQL. Either edit `db/seed.json` and re-run `npm run db:seed`, or `INSERT` against `dbo.recaps`. A lightweight admin UI can be added later.

`slug` must follow `{yyyy-mm}-{english-slug}`, e.g. `2026-05-ai-agent-production-showcase`.
