-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS prestamo_equipos_escihu;
USE prestamo_equipos_escihu;

-- Tabla: alumnos
CREATE TABLE IF NOT EXISTS alumnos (
  matricula VARCHAR(10) PRIMARY KEY,
  nombre VARCHAR(100),
  carrera VARCHAR(100),
  semestre INT
);

-- Tabla: equipos
CREATE TABLE IF NOT EXISTS equipos (
  codigo_equipo VARCHAR(10) PRIMARY KEY,
  descripcion VARCHAR(100),
  estatus TINYINT(1)
);

-- Tabla: prestamos
CREATE TABLE IF NOT EXISTS prestamos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  matricula VARCHAR(10),
  codigo_equipo VARCHAR(10),
  fecha_prestamo DATETIME DEFAULT CURRENT_TIMESTAMP,
  fecha_devolucion DATETIME,
  FOREIGN KEY (matricula) REFERENCES alumnos(matricula),
  FOREIGN KEY (codigo_equipo) REFERENCES equipos(codigo_equipo)
);
