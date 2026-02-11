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

const main = async () => {
  const cfg = resolveConfig();
  if (!cfg.host || !cfg.user || !cfg.password) {
    throw new Error(
      "Variables MySQL manquantes. Attendu: MYSQL_URL (ou MYSQL_PUBLIC_URL) ou MYSQLHOST/MYSQLUSER/MYSQLPASSWORD."
    );
  }

  const conn = await mysql.createConnection({
    host: cfg.host,
    port: cfg.port || 3306,
    user: cfg.user,
    password: cfg.password,
  });

  try {
    const [dbRows] = await conn.query("SELECT DATABASE() AS currentDb");
    const [verRows] = await conn.query("SELECT VERSION() AS version");
    const [tableRows] = await conn.query(
      "SELECT COUNT(*) AS tableCount FROM information_schema.tables WHERE table_schema = ? AND table_type='BASE TABLE'",
      [cfg.database || ""]
    );

    console.log(
      JSON.stringify(
        {
          host: cfg.host,
          port: cfg.port || 3306,
          user: cfg.user,
          targetDatabase: cfg.database,
          currentDb: dbRows?.[0]?.currentDb ?? null,
          mysqlVersion: verRows?.[0]?.version ?? null,
          tableCount: tableRows?.[0]?.tableCount ?? null,
        },
        null,
        2
      )
    );
  } finally {
    await conn.end();
  }
};

main().catch((err) => {
  console.error("Ping DB échoué:", err?.message || err);
  process.exitCode = 1;
});

