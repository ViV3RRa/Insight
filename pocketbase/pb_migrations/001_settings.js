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
        options: {
          collectionId: "_pb_users_auth_",
          cascadeDelete: true,
          maxSelect: 1,
        },
      },
      {
        name: "dateFormat",
        type: "select",
        required: true,
        options: {
          values: ["YYYY-MM-DD", "DD/MM/YYYY"],
        },
      },
      {
        name: "theme",
        type: "select",
        required: true,
        options: {
          values: ["light", "dark"],
        },
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
    createRule: '@request.auth.id != "" && @request.data.userId = @request.auth.id',
    updateRule: 'userId = @request.auth.id',
    deleteRule: 'userId = @request.auth.id',
  });

  app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("settings");
  app.delete(collection);
});
