// video-recap — App Service + Azure SQL infra
//
// Deploys:
//   - Log Analytics + App Insights
//   - Linux App Service Plan (B1) + App Service (Node 20)
//   - Azure SQL Server + Database (Basic)
//   - Firewall rule allowing Azure services
//   - App settings wired to the Azure SQL connection
//
// Resource group must already exist:
//   az group create -n rg-video-recap -l southeastasia

@description('Azure region for App Service + telemetry. Default: RG location.')
param location string = resourceGroup().location

@description('Name prefix used for all resources (lowercase, hyphens).')
param prefix string = 'video-recap'

@description('Azure SQL administrator login.')
param sqlAdminLogin string = 'sqladmin'

@description('Azure SQL administrator password. Pass via CLI --parameters; do not commit.')
@secure()
param sqlAdminPassword string

@description('Azure SQL database name.')
param sqlDatabaseName string = 'video_recap'

@description('Azure SQL database SKU. Basic is cheapest; use S0 for slightly more capacity.')
param sqlDatabaseSku string = 'Basic'

var tags = {
  project: 'video-recap'
  owner: 'mark.pl.chen'
  deployedBy: 'claude-code'
}

var logName = 'log-${prefix}'
var appiName = 'appi-${prefix}'
var planName = 'plan-${prefix}'
var siteName = 'app-${prefix}'
var sqlServerName = 'sql-${prefix}-${uniqueString(resourceGroup().id)}'

resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: logName
  location: location
  tags: tags
  properties: {
    sku: { name: 'PerGB2018' }
    retentionInDays: 30
  }
}

resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: appiName
  location: location
  tags: tags
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalytics.id
  }
}

resource sqlServer 'Microsoft.Sql/servers@2023-08-01-preview' = {
  name: sqlServerName
  location: location
  tags: tags
  properties: {
    administratorLogin: sqlAdminLogin
    administratorLoginPassword: sqlAdminPassword
    version: '12.0'
    publicNetworkAccess: 'Enabled'
    minimalTlsVersion: '1.2'
  }
}

// Allow Azure services (App Service) to reach SQL.
resource sqlFirewallAzure 'Microsoft.Sql/servers/firewallRules@2023-08-01-preview' = {
  parent: sqlServer
  name: 'AllowAllAzureIps'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

resource sqlDatabase 'Microsoft.Sql/servers/databases@2023-08-01-preview' = {
  parent: sqlServer
  name: sqlDatabaseName
  location: location
  tags: tags
  sku: {
    name: sqlDatabaseSku
    tier: sqlDatabaseSku == 'Basic' ? 'Basic' : 'Standard'
  }
  properties: {
    collation: 'SQL_Latin1_General_CP1_CI_AS'
    maxSizeBytes: sqlDatabaseSku == 'Basic' ? 2147483648 : 268435456000
  }
}

resource plan 'Microsoft.Web/serverfarms@2023-12-01' = {
  name: planName
  location: location
  tags: tags
  sku: {
    name: 'B1'
    tier: 'Basic'
  }
  kind: 'linux'
  properties: {
    reserved: true
  }
}

resource site 'Microsoft.Web/sites@2023-12-01' = {
  name: siteName
  location: location
  tags: tags
  kind: 'app,linux'
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    serverFarmId: plan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'NODE|20-lts'
      alwaysOn: true
      ftpsState: 'Disabled'
      minTlsVersion: '1.2'
      appCommandLine: 'node server.js'
      appSettings: [
        {
          name: 'WEBSITE_NODE_DEFAULT_VERSION'
          value: '~20'
        }
        {
          name: 'SCM_DO_BUILD_DURING_DEPLOYMENT'
          value: 'false'
        }
        {
          name: 'WEBSITES_PORT'
          value: '3000'
        }
        {
          name: 'NEXT_TELEMETRY_DISABLED'
          value: '1'
        }
        {
          name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
          value: appInsights.properties.ConnectionString
        }
        {
          name: 'AZURE_SQL_SERVER'
          value: sqlServer.properties.fullyQualifiedDomainName
        }
        {
          name: 'AZURE_SQL_DATABASE'
          value: sqlDatabaseName
        }
        {
          name: 'AZURE_SQL_USER'
          value: sqlAdminLogin
        }
        {
          name: 'AZURE_SQL_PASSWORD'
          value: sqlAdminPassword
        }
        {
          name: 'AZURE_SQL_PORT'
          value: '1433'
        }
        {
          name: 'AZURE_SQL_ENCRYPT'
          value: 'true'
        }
      ]
    }
  }
}

output siteName string = site.name
output siteHostname string = site.properties.defaultHostName
output siteUrl string = 'https://${site.properties.defaultHostName}'
output sqlServerFqdn string = sqlServer.properties.fullyQualifiedDomainName
output sqlDatabaseName string = sqlDatabase.name
