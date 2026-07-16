const CREATE_USERS_TABLE_QUERY = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    username TEXT NOT NULL,
    points INTEGER DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`

export default [
  {
    name: 'create_users_table',
    sql: CREATE_USERS_TABLE_QUERY
  }
]
