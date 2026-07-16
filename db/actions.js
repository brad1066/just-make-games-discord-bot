export const checkUserExists = async (db, username) => {
  return fetchAll(db, `SELECT * from users WHERE users.username = ? LIMIT 1`, [username])
}

export const registerUser = async (db, username) => {
  return await db
    .prepare(`INSERT INTO users(username) VALUES (?)`)
    .get(username)
}

export const unregisterUser = async (db, username) => {
  return await db
    .prepare(`DELETE FROM users WHERE username = ?`)
    .get(username)
}



export const fetchAll = async (db, sql, params) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      resolve(rows);
    });
  });
};

export const fetchFirst = async (db, sql, params) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      resolve(row);
    });
  });
};
