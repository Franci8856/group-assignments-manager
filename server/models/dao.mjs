// server/dao.mjs
import sqlite from 'sqlite3';
import crypto from 'crypto';

// open the database
const db = new sqlite.Database("compiti.db", (err) => {
  if (err) throw err;
}); 

export const getUser = (email, password) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM users WHERE email = ?';
    db.get(sql, [email], (err, row) => {
      if (err) reject(err);
      else if (row === undefined) resolve(false);
      else {
        const user = { id: row.id, email: row.email, name: row.name, surname: row.surname, role: row.role };
        // Verify password using scrypt        
        crypto.scrypt(password, row.salt, 32, function(err, hashedPassword) {
          if (err) reject(err);
          if (!crypto.timingSafeEqual(Buffer.from(row.password, 'hex'), hashedPassword))
            resolve(false);
          else
            resolve(user);
        });
      }
    });
  });
};

export const getAllStudents = () => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT id, name, surname FROM users WHERE role = 'student'";
    db.all(sql, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

export const createAssignment = (teacherId, question, studentIds) => {
  return new Promise((resolve, reject) => {
    const pairs = [];
    for (let i = 0; i < studentIds.length; i++) {
      for (let j = i + 1; j < studentIds.length; j++) {
        pairs.push([studentIds[i], studentIds[j]]);
      }
    }

    const checkSql = `
      SELECT COUNT(*) as count
      FROM assignment_students s1
      JOIN assignment_students s2 ON s1.assignmentId = s2.assignmentId
      JOIN assignments a ON a.id = s1.assignmentId
      WHERE s1.studentId = ? AND s2.studentId = ? AND a.teacherId = ?;
    `;

    let currentIndex = 0;

    const checkNext = () => {
      if (currentIndex >= pairs.length) {
        // Tutte le coppie verificate, ora si può inserire l'assignment
        db.run('INSERT INTO assignments(teacherId, question) VALUES (?, ?)', [teacherId, question], function (err) {
          if (err) return reject(err);
          const assignmentId = this.lastID;

          const insert = db.prepare('INSERT INTO assignment_students(assignmentId, studentId) VALUES (?, ?)');
          for (const studentId of studentIds) {
            insert.run([assignmentId, studentId]);
          }
          insert.finalize(err => {
            if (err) return reject(err);
            resolve(assignmentId);
          });
        });
        return;
      }

      const [a, b] = pairs[currentIndex];
      db.get(checkSql, [a, b, teacherId], (err, row) => {
        if (err) return reject(err);
        if (row.count >= 2) {
          return reject(new Error(`La coppia (${a}, ${b}) ha già svolto ${row.count} compiti con questo docente.`));
        } else {
          currentIndex++;
          checkNext(); // passa alla prossima coppia
        }
      });
    };

    checkNext();
  });
};

export const getAssignmentsByTeacher = (teacherId) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT * FROM assignments WHERE teacherId = ?`;
    db.all(sql, [teacherId], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

export const addResponse = (assignmentId, responseText) => { //aggiungere studentId
  return new Promise((resolve, reject) => {
    const sql = `UPDATE assignments SET response = ? WHERE id = ? AND status = 'open'`;
    db.run(sql, [responseText, assignmentId], function (err) {
      if (err) reject(err);
      else resolve(this.changes);
    });
  });
};

export const gradeAssignment = (assignmentId, grade) => {
  return new Promise((resolve, reject) => {
    const sql = `UPDATE assignments SET grade = ?, status = 'closed' WHERE id = ? AND response IS NOT NULL`;
    db.run(sql, [grade, assignmentId], function (err) {
      if (err) reject(err);
      else resolve(this.changes);
    });
  });
};

//restituisce gli assignment di uno studente 
export const getStudentAssignments = (studentId) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT a.*, u.name || ' ' || u.surname AS teacher FROM assignments a
                JOIN users u ON a.teacherId = u.id 
                JOIN assignment_students s ON s.assignmentId = a.id 
                WHERE s.studentId = ?`;
    db.all(sql, [studentId], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

export const getStudentsClassState = (teacherId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        u.id AS studentId,
        u.name,
        u.surname,
        SUM(CASE WHEN a.status = 'open' THEN 1 ELSE 0 END) AS openCount,
        SUM(CASE WHEN a.status = 'closed' THEN 1 ELSE 0 END) AS closedCount,
        SUM(CASE WHEN a.status = 'closed' AND a.grade IS NOT NULL THEN a.grade * (1.0 / sub.cnt) ELSE 0 END) AS weightedSum,
        SUM(CASE WHEN a.status = 'closed' AND a.grade IS NOT NULL THEN (1.0 / sub.cnt) ELSE 0 END) AS totalWeight
      FROM users u
      LEFT JOIN assignment_students s ON u.id = s.studentId
      LEFT JOIN assignments a ON s.assignmentId = a.id AND a.teacherId = ?
      LEFT JOIN (
        SELECT assignmentId, COUNT(*) AS cnt
        FROM assignment_students
        GROUP BY assignmentId
      ) AS sub ON sub.assignmentId = a.id
      WHERE u.role = 'student'
      GROUP BY u.id
    `; 

    db.all(sql, [teacherId], (err, rows) => {
      if (err) reject(err);
      else {
        const result = rows.map(row => ({
          studentId: row.studentId,
          name: row.name,
          surname: row.surname,
          openCount: row.openCount,
          closedCount: row.closedCount,
          averageGrade: row.totalWeight > 0 ? (row.weightedSum / row.totalWeight).toFixed(2) : null
        }));
        resolve(result);
      }
    });
  });
};

export const getStudentWeightedAverage = (studentId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        SUM(a.grade * (1.0 / sub.cnt)) AS weightedSum,
        SUM(1.0 / sub.cnt) AS totalWeight
      FROM assignments a
      JOIN assignment_students s ON a.id = s.assignmentId
      JOIN (
        SELECT assignmentId, COUNT(*) AS cnt
        FROM assignment_students
        GROUP BY assignmentId
      ) AS sub ON a.id = sub.assignmentId
      WHERE s.studentId = ? AND a.status = 'closed' AND a.grade IS NOT NULL
    `;
    db.get(sql, [studentId], (err, row) => {
      if (err) reject(err);
      else {
        const average = row.totalWeight > 0 ? (row.weightedSum / row.totalWeight).toFixed(2) : null;
        resolve(average);
      }
    });
  });
};
