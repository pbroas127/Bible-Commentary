param location string = resourceGroup().location
param environment string = 'dev' // dev, staging, prod
param appName string = 'bible-commentary'

var storageAccountName = '${appName}${environment}sa${uniqueString(resourceGroup().id)}'
var functionAppName = '${appName}-${environment}-api'
var cacheName = '${appName}-${environment}-cache'
var cosmosAccountName = '${appName}-${environment}-cosmos'
var appInsightsName = '${appName}-${environment}-insights'

// Storage Account (required for Functions)
resource storageAccount 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: storageAccountName
  location: location
  kind: 'StorageV2'
  sku: {
    name: 'Standard_LRS'
  }
  properties: {
    accessTier: 'Hot'
    supportsHttpsTrafficOnly: true
  }
}

// Application Insights (monitoring)
resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: appInsightsName
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    publicNetworkAccessForIngestion: 'Enabled'
    publicNetworkAccessForQuery: 'Enabled'
  }
}

// App Service Plan (for Functions)
resource appServicePlan 'Microsoft.Web/serverfarms@2023-01-01' = {
  name: '${functionAppName}-plan'
  location: location
  kind: 'functionapp'
  sku: {
    name: 'Y1'
    tier: 'Dynamic'
  }
  properties: {}
}

// Azure Functions App (HTTP API)
resource functionApp 'Microsoft.Web/sites@2023-01-01' = {
  name: functionAppName
  location: location
  kind: 'functionapp'
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      appSettings: [
        {
          name: 'AzureWebJobsStorage'
          value: 'DefaultEndpointsProtocol=https;AccountName=${storageAccount.name};AccountKey=${storageAccount.listKeys().keys[0].value};EndpointSuffix=core.windows.net'
        }
        {
          name: 'FUNCTIONS_EXTENSION_VERSION'
          value: '~4'
        }
        {
          name: 'FUNCTIONS_WORKER_RUNTIME'
          value: 'node'
        }
        {
          name: 'WEBSITE_NODE_DEFAULT_VERSION'
          value: '~20'
        }
        {
          name: 'APPINSIGHTS_INSTRUMENTATIONKEY'
          value: appInsights.properties.InstrumentationKey
        }
        {
          name: 'ApplicationInsightsAgent_EXTENSION_VERSION'
          value: '~3'
        }
        {
          name: 'USE_MOCK_DATA'
          value: 'true' // Set to false when Foundry Agent is ready
        }
        {
          name: 'USE_REDIS'
          value: environment == 'prod' ? 'true' : 'false'
        }
        {
          name: 'REDIS_URL'
          value: environment == 'prod' ? 'redis://${cache.properties.hostName}:${cache.properties.sslPort}?ssl=True&password=${cache.listKeys().primaryKey}' : ''
        }
      ]
      ftpsState: 'Disabled'
      minTlsVersion: '1.2'
      http20Enabled: true
    }
  }
}

// Azure Cache for Redis (production only)
resource cache 'Microsoft.Cache/redis@2023-08-01' = if (environment == 'prod') {
  name: cacheName
  location: location
  properties: {
    sku: {
      name: 'Standard'
      family: 'C'
      capacity: 0 // 250MB, sufficient for moderate volume
    }
    enableNonSslPort: false
    minimumTlsVersion: '1.2'
    publicNetworkAccess: 'Enabled'
  }
}

// Azure Cosmos DB for SQL (user data, highlights, bookmarks)
resource cosmosAccount 'Microsoft.DocumentDB/databaseAccounts@2023-11-15' = if (environment == 'prod') {
  name: cosmosAccountName
  location: location
  kind: 'GlobalDocumentDB'
  properties: {
    databaseAccountOfferType: 'Standard'
    enableFreeTier: false
    enableAutomaticFailover: true // Multi-region failover
    locations: [
      {
        locationName: location
        failoverPriority: 0
        isZoneRedundant: false
      }
    ]
    consistency: {
      defaultConsistencyLevel: 'Session' // Sufficient for user data
    }
    apiProperties: {
      serverVersion: '2016-11-15'
    }
  }
}

// Cosmos DB Database (for Bible Commentary API)
resource cosmosDatabase 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases@2023-11-15' = if (environment == 'prod') {
  parent: cosmosAccount
  name: 'bible-commentary'
  properties: {
    resource: {
      id: 'bible-commentary'
    }
  }
}

// Cosmos DB Container (user highlights and bookmarks)
resource cosmosUserDataContainer 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2023-11-15' = if (environment == 'prod') {
  parent: cosmosDatabase
  name: 'user-data'
  properties: {
    resource: {
      id: 'user-data'
      partitionKey: {
        paths: [
          '/userId'
        ]
      }
      defaultTtl: -1 // No auto-expiration
      indexingPolicy: {
        indexingMode: 'consistent'
        includedPaths: [
          {
            path: '/*'
          }
        ]
        excludedPaths: [
          {
            path: '/"_etag"/?'
          }
        ]
      }
    }
    options: {
      throughput: 400 // RU/s, can scale up
    }
  }
}

// Outputs
output functionAppUrl string = 'https://${functionApp.properties.defaultHostName}/api/v1'
output appInsightsKey string = appInsights.properties.InstrumentationKey
output cacheEndpoint string = environment == 'prod' ? cache.properties.hostName : ''
output cosmosEndpoint string = environment == 'prod' ? cosmosAccount.properties.documentEndpoint : ''
