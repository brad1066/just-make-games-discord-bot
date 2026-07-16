import sqlite3 from 'sqlite3'
import queries from './db/queries.js'
import migrations from './db/migrations.js'

const db = new sqlite3.Database('./data.db', sqlite3.OPEN_READWRITE, (err) => {
  if (err) return console.error('Error opening database:', err.message)
})

db.exec(queries.CREATE_MIGRATIONS_TABLE_QUERY, (err) => {
  if (err) return console.error('Error creating migrations table:', err.message)
})

db.all(queries.GET_ALL_MIGRATIONS_QUERY, [], (err, rows) => {
  if (err) return console.error('Error fetching migrations:', err.message)
  runMigrations(rows)
})

let runMigrations = (rows) => {
  migrations.forEach((m) => {
    if (rows.some((r) => r.name === m.name))
      return console.log(`Migration '${m.name}' has already been ran`)

    console.log(m)
    console.log(`Running migration '${m.name}': ${m.sql}`)

    db.run(m.sql, (err) => {
      if (err)
        return console.log(`Error when running migration ('${m.name}): ${err}`)
      db.run(queries.INSERT_MIGRATION_QUERY, [m.name], (err) => {
        if (err)
          return console.log(
            `Error adding '${m.name} to the 'migrations' table: ${err?.message}`
          )
      })
    })
  })
}