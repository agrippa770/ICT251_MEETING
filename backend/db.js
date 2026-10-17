require('dotenv').config();
const Database = require('better-sqlite3');

const db = new Database(process.env.DB_FILE || 'meetings.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS meetings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_title TEXT NOT NULL,
    author TEXT,
    meeting_date TEXT,
    meeting_time TEXT,
    location TEXT,
    host_name TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

const count = db.prepare('SELECT COUNT(*) AS c FROM meetings').get().c;

if (count === 0) {
  const insert = db.prepare(`
    INSERT INTO meetings (book_title, author, meeting_date, meeting_time, location, host_name)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const samples = [
    ['Things Fall Apart', 'Chinua Achebe', '2026-11-05', '16:00', 'Library Room 2', 'Mary Banda'],
    ['Half of a Yellow Sun', 'Chimamanda Ngozi Adichie', '2026-11-12', '15:30', 'Student Centre', 'John Phiri'],
    ['Purple Hibiscus', 'Chimamanda Ngozi Adichie', '2026-11-19', '16:00', 'Library Room 1', 'Grace Mwila'],
    ['Weep Not, Child', 'Ngugi wa Thiong\'o', '2026-11-26', '17:00', 'Cafeteria Hall', 'Peter Zulu'],
    ['So Long a Letter', 'Mariama Ba', '2026-12-03', '16:30', 'Library Room 2', 'Ruth Tembo'],
    ['Americanah', 'Chimamanda Ngozi Adichie', '2026-12-10', '15:00', 'Lecture Room 4', 'David Chanda'],
    ['The Alchemist', 'Paulo Coelho', '2026-12-17', '16:00', 'Garden Area', 'Esther Lungu'],
    ['Animal Farm', 'George Orwell', '2027-01-07', '14:00', 'Library Room 3', 'Joseph Mulenga'],
    ['The Great Gatsby', 'F. Scott Fitzgerald', '2027-01-14', '16:00', 'Student Centre', 'Natasha Sakala'],
    ['To Kill a Mockingbird', 'Harper Lee', '2027-01-21', '17:30', 'Library Room 1', 'Brian Kapota']
  ];

  const insertAll = db.transaction((rows) => {
    for (const r of rows) insert.run(...r);
  });
  insertAll(samples);
  console.log('Inserted 10 sample meetings.');
}

module.exports = db;