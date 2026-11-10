const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./compiti.db', (err) => {
  if (err) {
    return console.error('Errore di connessione:', err.message);
  }
  console.log('Connessione al database riuscita.');
});

db.serialize(() => {
  db.run('PRAGMA foreign_keys = OFF');

  db.run('DELETE FROM assignment_students', function (err) {
    if (err) return console.error('Errore pulizia assignment_students:', err.message);
    console.log('Tabella assignment_students pulita.');

    db.run('DELETE FROM assignments', function (err) {
      if (err) return console.error('Errore pulizia assignments:', err.message);
      console.log('Tabella assignments pulita.');

      db.run('PRAGMA foreign_keys = ON', () => {
        db.close((err) => {
          if (err) return console.error('Errore in chiusura DB:', err.message);
          console.log('Connessione al database chiusa.');
        });
      });
    });
  });
});
