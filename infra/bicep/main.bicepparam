using 'main.bicep'

param prefix = 'video-recap'
param location = 'southeastasia'
param sqlAdminLogin = 'sqladmin'
param sqlDatabaseName = 'video_recap'
param sqlDatabaseSku = 'Basic'

// SECRET: do not commit. Pass via CLI override or env var:
//   $env:AZURE_SQL_ADMIN_PASSWORD = '<strong-password>'
//   az deployment group create ... --parameters sqlAdminPassword=$env:AZURE_SQL_ADMIN_PASSWORD
param sqlAdminPassword = readEnvironmentVariable('AZURE_SQL_ADMIN_PASSWORD', '')
