/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // --- portfolios ---
  const portfolios = new Collection({
    name: "portfolios",
    type: "base",
    fields: [
      {
        name: "ownerId",
        type: "relation",
        required: true,
        options: {
          collectionId: "_pb_users_auth_",
          cascadeDelete: true,
          maxSelect: 1,
        },
      },
      { name: "name", type: "text", required: true },
      { name: "ownerName", type: "text", required: true },
      { name: "isDefault", type: "bool" },
    ],
    indexes: [],
    listRule: 'ownerId = @request.auth.id',
    viewRule: 'ownerId = @request.auth.id',
    createRule: '@request.auth.id != "" && @request.data.ownerId = @request.auth.id',
    updateRule: 'ownerId = @request.auth.id',
    deleteRule: 'ownerId = @request.auth.id',
  });

  app.save(portfolios);

  // --- platforms ---
  const platforms = new Collection({
    name: "platforms",
    type: "base",
    fields: [
      {
        name: "ownerId",
        type: "relation",
        required: true,
        options: {
          collectionId: "_pb_users_auth_",
          cascadeDelete: false,
          maxSelect: 1,
        },
      },
      {
        name: "portfolioId",
        type: "relation",
        required: true,
        options: {
          collectionId: portfolios.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
      },
      { name: "name", type: "text", required: true },
      {
        name: "icon",
        type: "file",
        required: true,
        options: {
          maxSelect: 1,
          maxSize: 2097152,
          mimeTypes: ["image/jpeg", "image/png", "image/webp"],
        },
      },
      {
        name: "type",
        type: "select",
        required: true,
        options: { values: ["investment", "cash"] },
      },
      { name: "currency", type: "text", required: true },
      {
        name: "status",
        type: "select",
        required: true,
        options: { values: ["active", "closed"] },
      },
      { name: "closedDate", type: "date" },
      { name: "closureNote", type: "text" },
    ],
    indexes: [
      "CREATE INDEX idx_platforms_owner_portfolio ON platforms (ownerId, portfolioId)",
    ],
    listRule: 'ownerId = @request.auth.id',
    viewRule: 'ownerId = @request.auth.id',
    createRule: '@request.auth.id != "" && @request.data.ownerId = @request.auth.id',
    updateRule: 'ownerId = @request.auth.id',
    deleteRule: 'ownerId = @request.auth.id',
  });

  app.save(platforms);

  // --- data_points ---
  const dataPoints = new Collection({
    name: "data_points",
    type: "base",
    fields: [
      {
        name: "ownerId",
        type: "relation",
        required: true,
        options: {
          collectionId: "_pb_users_auth_",
          cascadeDelete: false,
          maxSelect: 1,
        },
      },
      {
        name: "platformId",
        type: "relation",
        required: true,
        options: {
          collectionId: platforms.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
      },
      { name: "value", type: "number", required: true },
      { name: "timestamp", type: "date", required: true },
      { name: "isInterpolated", type: "bool" },
      { name: "note", type: "text" },
    ],
    indexes: [
      "CREATE INDEX idx_data_points_owner_platform_ts ON data_points (ownerId, platformId, timestamp)",
    ],
    listRule: 'ownerId = @request.auth.id',
    viewRule: 'ownerId = @request.auth.id',
    createRule: '@request.auth.id != "" && @request.data.ownerId = @request.auth.id',
    updateRule: 'ownerId = @request.auth.id',
    deleteRule: 'ownerId = @request.auth.id',
  });

  app.save(dataPoints);

  // --- transactions ---
  const transactions = new Collection({
    name: "transactions",
    type: "base",
    fields: [
      {
        name: "ownerId",
        type: "relation",
        required: true,
        options: {
          collectionId: "_pb_users_auth_",
          cascadeDelete: false,
          maxSelect: 1,
        },
      },
      {
        name: "platformId",
        type: "relation",
        required: true,
        options: {
          collectionId: platforms.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
      },
      {
        name: "type",
        type: "select",
        required: true,
        options: { values: ["deposit", "withdrawal"] },
      },
      { name: "amount", type: "number", required: true },
      { name: "exchangeRate", type: "number" },
      { name: "timestamp", type: "date", required: true },
      { name: "note", type: "text" },
      {
        name: "attachment",
        type: "file",
        options: {
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
        },
      },
    ],
    indexes: [
      "CREATE INDEX idx_transactions_owner_platform_ts ON transactions (ownerId, platformId, timestamp)",
    ],
    listRule: 'ownerId = @request.auth.id',
    viewRule: 'ownerId = @request.auth.id',
    createRule: '@request.auth.id != "" && @request.data.ownerId = @request.auth.id',
    updateRule: 'ownerId = @request.auth.id',
    deleteRule: 'ownerId = @request.auth.id',
  });

  app.save(transactions);

  // --- exchange_rates ---
  const exchangeRates = new Collection({
    name: "exchange_rates",
    type: "base",
    fields: [
      {
        name: "ownerId",
        type: "relation",
        required: true,
        options: {
          collectionId: "_pb_users_auth_",
          cascadeDelete: false,
          maxSelect: 1,
        },
      },
      { name: "fromCurrency", type: "text", required: true },
      { name: "toCurrency", type: "text", required: true },
      { name: "rate", type: "number", required: true },
      { name: "date", type: "date", required: true },
      {
        name: "source",
        type: "select",
        required: true,
        options: { values: ["auto", "manual"] },
      },
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_exchange_rates_unique ON exchange_rates (ownerId, fromCurrency, toCurrency, date)",
    ],
    listRule: 'ownerId = @request.auth.id',
    viewRule: 'ownerId = @request.auth.id',
    createRule: '@request.auth.id != "" && @request.data.ownerId = @request.auth.id',
    updateRule: 'ownerId = @request.auth.id',
    deleteRule: 'ownerId = @request.auth.id',
  });

  app.save(exchangeRates);
}, (app) => {
  // Reverse order: delete children before parents
  const exchangeRates = app.findCollectionByNameOrId("exchange_rates");
  app.delete(exchangeRates);

  const transactions = app.findCollectionByNameOrId("transactions");
  app.delete(transactions);

  const dataPoints = app.findCollectionByNameOrId("data_points");
  app.delete(dataPoints);

  const platforms = app.findCollectionByNameOrId("platforms");
  app.delete(platforms);

  const portfolios = app.findCollectionByNameOrId("portfolios");
  app.delete(portfolios);
});
