const express = require('express');
const mysql = require('mysql2');
//const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Configuración de la base de datos
const db = mysql.createConnection({
  host: 'localhost',
  user: 'your_user',
  password: 'your_password',
  database: 'prestamo_equipos_escihu'
});

db.connect((err) => {
  if (err) {
    console.error('Error conectando a la base de datos:', err);
    process.exit(1);
  }
  console.log('Conectado a la base de datos MySQL');
});

// Manejo de errores en consultas
function rollbackAndHandleError(db, res, err) {
  db.rollback(() => {
    console.error('Error en transacción, se hace rollback:', err);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor',
      error: err.message,
    });
  });
}


// Ruta para registrar préstamos
app.post('/prestamos', (req, res) => {
  const { matricula, codigo_equipo } = req.body;

  if (!matricula || !codigo_equipo) {
    return res.status(400).json({
      success: false,
      message: 'La matrícula y el código del equipo son requeridos.',
    });
  }

  db.beginTransaction(err => {
    if (err) return handleError(res, err);

    // 1. Verificar que el equipo existe y está disponible
    const checkEquipoQuery = `
      SELECT estatus FROM equipos 
      WHERE codigo_equipo = ? 
      FOR UPDATE;
    `;

    // 2. Verificar si ya existe un préstamo activo para este equipo
    const checkPrestamoQuery = `
      SELECT id FROM prestamos 
      WHERE codigo_equipo = ? AND fecha_devolucion IS NULL
      LIMIT 1;
    `;

    // Ejecutar ambas verificaciones en paralelo
    db.query(checkEquipoQuery, [codigo_equipo], (err, equipoResults) => {
      if (err) return rollbackAndHandleError(db, res, err);

      db.query(checkPrestamoQuery, [codigo_equipo], (err, prestamoResults) => {
        if (err) return rollbackAndHandleError(db, res, err);

        // Validar equipo
        if (equipoResults.length === 0) {
          return rollbackAndHandleError(db, res, new Error('El equipo no existe.'));
        }

        if (!equipoResults[0].estatus) {
          return rollbackAndHandleError(db, res, new Error('El equipo no está disponible.'));
        }

        // Validar préstamo existente
        if (prestamoResults.length > 0) {
          return rollbackAndHandleError(db, res, 
            new Error('Este equipo ya tiene un préstamo activo.'));
        }

        // Registrar el nuevo préstamo
        const insertPrestamoQuery = `
          INSERT INTO prestamos (matricula, codigo_equipo, fecha_prestamo) 
          VALUES (?, ?, NOW());
        `;

        db.query(insertPrestamoQuery, [matricula, codigo_equipo], (err, result) => {
          if (err) return rollbackAndHandleError(db, res, err);

          // Actualizar estatus del equipo
          const updateEquipoQuery = `
            UPDATE equipos 
            SET estatus = false 
            WHERE codigo_equipo = ?;
          `;

          db.query(updateEquipoQuery, [codigo_equipo], (err, result) => {
            if (err) return rollbackAndHandleError(db, res, err);

            db.commit(err => {
              if (err) return rollbackAndHandleError(db, res, err);

              res.json({
                success: true,
                message: `Préstamo registrado correctamente para el equipo ${codigo_equipo}`,
              });
            });
          });
          
        });
      });
    });
  });
});
app.post('/devoluciones', (req, res) => {
  const { codigo_equipo } = req.body;

  if (!codigo_equipo) {
    return res.status(400).json({
      success: false,
      message: 'El código de equipo es requerido.',
    });
  }

  db.beginTransaction(err => {
    if (err) return handleError(res, err);

    // Verificar que el equipo está prestado
    const checkPrestamoQuery = `
      SELECT id FROM prestamos 
      WHERE codigo_equipo = ? AND fecha_devolucion IS NULL
      LIMIT 1;
    `;

    db.query(checkPrestamoQuery, [codigo_equipo], (err, prestamoResults) => {
      if (err) return rollbackAndHandleError(db, res, err);

      if (prestamoResults.length === 0) {
        return rollbackAndHandleError(db, res, new Error('No hay préstamo activo para este equipo.'));
      }

      // Marcar el préstamo como devuelto
      const updatePrestamoQuery = `
        UPDATE prestamos 
        SET fecha_devolucion = NOW()
        WHERE id = ?;
      `;

      db.query(updatePrestamoQuery, [prestamoResults[0].id], (err, result) => {
        if (err) return rollbackAndHandleError(db, res, err);

        // Hacer que el equipo vuelva a estar disponible
        const updateEquipoQuery = `
          UPDATE equipos 
          SET estatus = 1 
          WHERE codigo_equipo = ?;
        `;

        db.query(updateEquipoQuery, [codigo_equipo], (err, result) => {
          if (err) return rollbackAndHandleError(db, res, err);

          db.commit(err => {
            if (err) return rollbackAndHandleError(db, res, err);

            res.json({
              success: true,
              message: `Devolución registrada correctamente para el equipo ${codigo_equipo}`,
            });
          });
        });
      });
    });
  });
});

// Ruta de verificación
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor funcionando.' });
});

app.get('/equipos-prestados', (req, res) => {
  const query = `
    SELECT codigo_equipo, descripcion, estatus 
    FROM equipos 
    WHERE estatus = false;
  `;
  db.query(query, (err, results) => {
    if (err) return handleError(res, err);
    res.json(results);
  });
});
app.get('/historial-prestamos', (req, res) => {
  const query = `
    SELECT p.id, p.matricula, a.nombre, a.carrera, a.semestre, 
           p.codigo_equipo, e.descripcion, 
           p.fecha_prestamo, p.fecha_devolucion
    FROM prestamos p
    JOIN alumnos a ON p.matricula = a.matricula
    JOIN equipos e ON p.codigo_equipo = e.codigo_equipo
    ORDER BY p.fecha_prestamo DESC;
  `;
  db.query(query, (err, results) => {
    if (err) return handleError(res, err);
    res.json(results);
  });
});


// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error global:', err);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: err.message,
  });
});

// Configurar puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

