const sqlite3 = require("sqlite3").verbose();

const initializeDatabase = () => {
  const db = new sqlite3.Database("./my-database.db");
  return db;
};

const insertDB = (db, query) => {
  return new Promise((resolve, reject) => {
    db.run(query, [], (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
};

const queryDB = (db, query) => {
  return new Promise((resolve, reject) => {
    db.all(query, [], (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
};


module.exports = { initializeDatabase, queryDB, insertDB };
