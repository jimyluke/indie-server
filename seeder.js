const seeder = require("mongoose-seed");
require("dotenv/config");

seeder.connect(process.env.MONGO_URI, () => {
  seeder.loadModels([
    "./models/fielddata.js",
  ]);
  seeder.clearModels(["FieldData"], () => {
    seeder.populateModels(data, (err, done) => {
      if (err) return console.log("seed err", err);
      if (done) return console.log("seed done", done);
      seeder.disconnect();
    });
  });
});

const data = [
  {
    model: "FieldData",
    documents: [
      { field: "user_role", value: "Attorney" },
      { field: "user_role", value: "Chief Executive" },
      { field: "user_role", value: "Sales and Marketing" },
      { field: "user_role", value: "Finance and Accounting" },
      { field: "user_role", value: "Operations" },
      { field: "user_role", value: "Research" },
      { field: "user_role", value: "Educator" },
      { field: "user_role", value: "Student" },
      { field: "user_role", value: "Software Developer" },
      { field: "user_role", value: "Designer" },
      { field: "user_role", value: "Other" },
      { field: "user_role", value: "Owner" },
      { field: "sort", value: "A-Z" },
      { field: "sort", value: "Z-A" },
      { field: "sort", value: "Oldest-Newest" },
      { field: "sort", value: "Newest-Oldest" },
    ],
  }
];
