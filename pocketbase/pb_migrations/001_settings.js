/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    name: "settings",
    type: "base",
    fields: [
      {
        name: "userId",
        type: "relation",
        required: true,
        collectionId: "_pb_users_auth_",
        cascadeDelete: true,
        maxSelect: 1,
      },
      {
        name: "dateFormat",
        type: "select",
        required: true,
        values: ["YYYY-MM-DD", "DD/MM/YYYY"],
        maxSelect: 1,
      },
      {
        name: "theme",
        type: "select",
        required: true,
        values: ["light", "dark"],
        maxSelect: 1,
      },
      {
        name: "demoMode",
        type: "bool",
      },
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_settings_userId ON settings (userId)",
    ],
    listRule: 'userId = @request.auth.id',
    viewRule: 'userId = @request.auth.id',
    createRule: '@request.auth.id != ""',
    updateRule: 'userId = @request.auth.id',
    deleteRule: 'userId = @request.auth.id',
  });

  app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("settings");
  app.delete(collection);
});
