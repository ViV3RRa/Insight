/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // --- vehicles ---
  const vehicles = new Collection({
    name: "vehicles",
    type: "base",
    fields: [
      {
        name: "ownerId",
        type: "relation",
        required: true,
        collectionId: "_pb_users_auth_",
        cascadeDelete: false,
        maxSelect: 1,
      },
      { name: "name", type: "text", required: true },
      { name: "type", type: "text" },
      { name: "make", type: "text" },
      { name: "model", type: "text" },
      { name: "year", type: "number" },
      { name: "licensePlate", type: "text" },
      {
        name: "fuelType",
        type: "select",
        required: true,
        values: ["Petrol", "Diesel", "Electric", "Hybrid"],
        maxSelect: 1,
      },
      {
        name: "status",
        type: "select",
        required: true,
        values: ["active", "sold"],
        maxSelect: 1,
      },
      { name: "purchaseDate", type: "date" },
      { name: "purchasePrice", type: "number" },
      { name: "saleDate", type: "date" },
      { name: "salePrice", type: "number" },
      { name: "saleNote", type: "text" },
      {
        name: "photo",
        type: "file",
        maxSelect: 1,
        maxSize: 5242880,
        mimeTypes: ["image/jpeg", "image/png", "image/webp"],
      },
      { name: "created", type: "autodate", onCreate: true, onUpdate: false },
      { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
    ],
    indexes: [],
    listRule: 'ownerId = @request.auth.id',
    viewRule: 'ownerId = @request.auth.id',
    createRule: '@request.auth.id != ""',
    updateRule: 'ownerId = @request.auth.id',
    deleteRule: 'ownerId = @request.auth.id',
  });

  app.save(vehicles);

  // --- refuelings ---
  const refuelings = new Collection({
    name: "refuelings",
    type: "base",
    fields: [
      {
        name: "ownerId",
        type: "relation",
        required: true,
        collectionId: "_pb_users_auth_",
        cascadeDelete: false,
        maxSelect: 1,
      },
      {
        name: "vehicleId",
        type: "relation",
        required: true,
        collectionId: vehicles.id,
        cascadeDelete: true,
        maxSelect: 1,
      },
      { name: "date", type: "date", required: true },
      { name: "fuelAmount", type: "number", required: true },
      { name: "costPerUnit", type: "number", required: true },
      { name: "totalCost", type: "number", required: true },
      { name: "odometerReading", type: "number", required: true },
      { name: "station", type: "text" },
      { name: "chargedAtHome", type: "bool" },
      { name: "note", type: "text" },
      {
        name: "receipt",
        type: "file",
        maxSelect: 1,
        maxSize: 5242880,
        mimeTypes: ["image/jpeg", "image/png", "image/webp"],
      },
      {
        name: "tripCounterPhoto",
        type: "file",
        maxSelect: 1,
        maxSize: 5242880,
        mimeTypes: ["image/jpeg", "image/png", "image/webp"],
      },
      { name: "created", type: "autodate", onCreate: true, onUpdate: false },
      { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
    ],
    indexes: [
      "CREATE INDEX idx_refuelings_owner_vehicle_date ON refuelings (ownerId, vehicleId, date)",
    ],
    listRule: 'ownerId = @request.auth.id',
    viewRule: 'ownerId = @request.auth.id',
    createRule: '@request.auth.id != ""',
    updateRule: 'ownerId = @request.auth.id',
    deleteRule: 'ownerId = @request.auth.id',
  });

  app.save(refuelings);

  // --- maintenance_events ---
  const maintenanceEvents = new Collection({
    name: "maintenance_events",
    type: "base",
    fields: [
      {
        name: "ownerId",
        type: "relation",
        required: true,
        collectionId: "_pb_users_auth_",
        cascadeDelete: false,
        maxSelect: 1,
      },
      {
        name: "vehicleId",
        type: "relation",
        required: true,
        collectionId: vehicles.id,
        cascadeDelete: true,
        maxSelect: 1,
      },
      { name: "date", type: "date", required: true },
      { name: "description", type: "text", required: true },
      { name: "cost", type: "number", required: true },
      { name: "note", type: "text" },
      {
        name: "receipt",
        type: "file",
        maxSelect: 1,
        maxSize: 5242880,
        mimeTypes: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
      },
      { name: "created", type: "autodate", onCreate: true, onUpdate: false },
      { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
    ],
    indexes: [
      "CREATE INDEX idx_maintenance_owner_vehicle_date ON maintenance_events (ownerId, vehicleId, date)",
    ],
    listRule: 'ownerId = @request.auth.id',
    viewRule: 'ownerId = @request.auth.id',
    createRule: '@request.auth.id != ""',
    updateRule: 'ownerId = @request.auth.id',
    deleteRule: 'ownerId = @request.auth.id',
  });

  app.save(maintenanceEvents);
}, (app) => {
  const maintenanceEvents = app.findCollectionByNameOrId("maintenance_events");
  app.delete(maintenanceEvents);

  const refuelings = app.findCollectionByNameOrId("refuelings");
  app.delete(refuelings);

  const vehicles = app.findCollectionByNameOrId("vehicles");
  app.delete(vehicles);
});
