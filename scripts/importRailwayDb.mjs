import fs from "fs/promises";
import path from "path";
import process from "process";
import mysql from "mysql2/promise";

const resolveConfigFromUrl = (rawUrl) => {
  const u = new URL(rawUrl);
  return {
    host: u.hostname,
    port: u.port ? Number(u.port) : 3306,
    user: decodeURIComponent(u.username || ""),
    password: decodeURIComponent(u.password || ""),
    database: (u.pathname || "").replace(/^\//, ""),
  };
};

const resolveConfig = () => {
  const rawUrl = process.env.MYSQL_URL || process.env.MYSQL_PUBLIC_URL || process.env.DATABASE_URL;
  if (rawUrl) return resolveConfigFromUrl(rawUrl);

  const host = process.env.MYSQLHOST || process.env.MYSQL_HOST;
  const portStr = process.env.MYSQLPORT || process.env.MYSQL_PORT || "3306";
  const user = process.env.MYSQLUSER || process.env.MYSQL_USER;
  const password = process.env.MYSQLPASSWORD || process.env.MYSQL_PASSWORD;
  const database =
    process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE || process.env.DB_NAME || "railway";

  return { host, port: Number(portStr), user, password, database };
};

const dropAllObjects = async (conn, database) => {
  await conn.query("SET FOREIGN_KEY_CHECKS=0");

  const [rows] = await conn.query(
    "SELECT TABLE_NAME, TABLE_TYPE FROM information_schema.tables WHERE TABLE_SCHEMA = ?",
    [database]
  );

  const views = rows.filter((r) => r.TABLE_TYPE === "VIEW").map((r) => r.TABLE_NAME);
  const tables = rows.filter((r) => r.TABLE_TYPE === "BASE TABLE").map((r) => r.TABLE_NAME);

  for (const v of views) {
    await conn.query(`DROP VIEW IF EXISTS \`${v}\``);
  }

  for (const t of tables) {
    await conn.query(`DROP TABLE IF EXISTS \`${t}\``);
  }

  await conn.query("SET FOREIGN_KEY_CHECKS=1");
};

const main = async () => {
  const cfg = resolveConfig();
  if (!cfg.host || !cfg.user || !cfg.password || !cfg.database) {
    throw new Error(
      "Variables MySQL manquantes. Attendu: MYSQL_URL (ou MYSQL_PUBLIC_URL) ou MYSQLHOST/MYSQLUSER/MYSQLPASSWORD/MYSQLDATABASE."
    );
  }

  const sqlPath =
    process.argv[2] ||
    path.resolve(process.cwd(), "db", "funquiz.sql");

  const sql = await fs.readFile(sqlPath, "utf8");

  const conn = await mysql.createConnection({
    host: cfg.host,
    port: cfg.port || 3306,
    user: cfg.user,
    password: cfg.password,
    multipleStatements: true,
  });

  try {
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${cfg.database}\``);
    await conn.query(`USE \`${cfg.database}\``);
    await dropAllObjects(conn, cfg.database);
    await conn.query(sql);
  } finally {
    await conn.end();
  }
};

main().catch((err) => {
  console.error("Import DB échoué:", err?.message || err);
  process.exitCode = 1;
});

