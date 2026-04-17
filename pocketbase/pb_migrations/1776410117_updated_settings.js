/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2769025244")

  // update field
  collection.fields.addAt(2, new Field({
    "hidden": false,
    "id": "select3923670009",
    "maxSelect": 1,
    "name": "dateFormat",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "select",
    "values": [
      "yyyy-MM-dd",
      "dd/MM/yyyy"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2769025244")

  // update field
  collection.fields.addAt(2, new Field({
    "hidden": false,
    "id": "select3923670009",
    "maxSelect": 1,
    "name": "dateFormat",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "select",
    "values": [
      "YYYY-MM-DD",
      "DD/MM/YYYY"
    ]
  }))

  return app.save(collection)
})
