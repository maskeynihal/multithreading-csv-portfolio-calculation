import { Knex } from "knex";
import { createReadStream } from "fs";
import { dirname } from "path";
import csvParser from "csv-parser";
import db from "../lib/db";

const f = (a: WritableStream) => console.log(a);

const importCsv = async (args: any) => {
  const file = "transactions.csv";

  db.transaction(async (trx) => {
    await trx.raw(`.mode csv`);
    console.log("Importing transactions...");

    await trx.raw(
      `.import ${process.cwd() + ["", "data", file].join("/")} transactions`
    );
  });

  // const trx = await db.transaction();
  // const count = 10000;

  // createReadStream(process.cwd() + ["", "data", file].join("/"))
  //   .pipe(csvParser())
  //   .on("ready", () => console.log(`Importing ${file}`))
  //   .on("data", async (data) => {
  //     // try {
  //     //   const a = trx("transactions")
  //     //     .insert({
  //     //       amount: data.amount,
  //     //       token: data.token,
  //     //       transaction_type: data.transaction_type,
  //     //       created_at: data.timestamp,
  //     //     })
  //     //     .then((value) => console.log("Inserted", value))
  //     //     .catch((err) => {
  //     //       trx.rollback();
  //     //     });
  //     // } catch (error) {
  //     //   trx.rollback();
  //     //   console.log(error);
  //     // }
  //     // insertData.push();
  //   })
  //   .on("end", async () => {
  //     // trx.commit();
  //     console.log("DONE");
  //   })
  //   .on("error", async (err) => {
  //     // trx.rollback();
  //     console.log(err);
  //   });
};

export { importCsv };
