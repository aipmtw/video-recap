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

## Deploy to Azure WebApp

The deploy workflow lives at [`docs/deploy/azure-webapp.workflow.yml`](docs/deploy/azure-webapp.workflow.yml). To enable CI/CD:

```bash
gh auth refresh -h github.com -u aipmtw -s workflow   # one-time, opens browser
mkdir -p .github/workflows
git mv docs/deploy/azure-webapp.workflow.yml .github/workflows/azure-webapp.yml
git commit -m "Enable Azure WebApp deploy workflow"
git push
```

It builds the Next.js standalone bundle and deploys on every push to `main`.

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
