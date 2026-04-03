/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // --- utilities ---
  const utilities = new Collection({
    name: "utilities",
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
      { name: "name", type: "text", required: true },
      { name: "unit", type: "text", required: true },
      { name: "icon", type: "text", required: true },
      { name: "color", type: "text", required: true },
    ],
    indexes: [],
    listRule: 'ownerId = @request.auth.id',
    viewRule: 'ownerId = @request.auth.id',
    createRule: '@request.auth.id != "" && @request.data.ownerId = @request.auth.id',
    updateRule: 'ownerId = @request.auth.id',
    deleteRule: 'ownerId = @request.auth.id',
  });

  app.save(utilities);

  // --- meter_readings ---
  const meterReadings = new Collection({
    name: "meter_readings",
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
        name: "utilityId",
        type: "relation",
        required: true,
        options: {
          collectionId: utilities.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
      },
      { name: "value", type: "number", required: true },
      { name: "timestamp", type: "date", required: true },
      { name: "note", type: "text" },
      {
        name: "attachment",
        type: "file",
        options: {
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ["image/jpeg", "image/png", "image/webp"],
        },
      },
    ],
    indexes: [
      "CREATE INDEX idx_meter_readings_owner_utility_ts ON meter_readings (ownerId, utilityId, timestamp)",
    ],
    listRule: 'ownerId = @request.auth.id',
    viewRule: 'ownerId = @request.auth.id',
    createRule: '@request.auth.id != "" && @request.data.ownerId = @request.auth.id',
    updateRule: 'ownerId = @request.auth.id',
    deleteRule: 'ownerId = @request.auth.id',
  });

  app.save(meterReadings);

  // --- utility_bills ---
  const utilityBills = new Collection({
    name: "utility_bills",
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
        name: "utilityId",
        type: "relation",
        required: true,
        options: {
          collectionId: utilities.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
      },
      { name: "amount", type: "number", required: true },
      { name: "periodStart", type: "date", required: true },
      { name: "periodEnd", type: "date", required: true },
      { name: "timestamp", type: "date" },
      { name: "note", type: "text" },
      {
        name: "attachment",
        type: "file",
        options: {
          maxSelect: 1,
          maxSize: 10485760,
          mimeTypes: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
        },
      },
    ],
    indexes: [
      "CREATE INDEX idx_utility_bills_owner_utility_start ON utility_bills (ownerId, utilityId, periodStart)",
    ],
    listRule: 'ownerId = @request.auth.id',
    viewRule: 'ownerId = @request.auth.id',
    createRule: '@request.auth.id != "" && @request.data.ownerId = @request.auth.id',
    updateRule: 'ownerId = @request.auth.id',
    deleteRule: 'ownerId = @request.auth.id',
  });

  app.save(utilityBills);
}, (app) => {
  const utilityBills = app.findCollectionByNameOrId("utility_bills");
  app.delete(utilityBills);

  const meterReadings = app.findCollectionByNameOrId("meter_readings");
  app.delete(meterReadings);

  const utilities = app.findCollectionByNameOrId("utilities");
  app.delete(utilities);
});
