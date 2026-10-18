-- Sprint 4 (HU 05 y HU 08): zonas, proveedor_zonas e índices de búsqueda.
-- Requiere que existan perfiles_proveedor y servicios (tablas del equipo).

CREATE TABLE IF NOT EXISTS zonas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo_postal VARCHAR(5) NOT NULL,
  colonia VARCHAR(150) NOT NULL,
  ciudad VARCHAR(100) NOT NULL,
  estado_republica VARCHAR(100) NOT NULL,
  UNIQUE KEY uq_zona (codigo_postal, colonia),
  INDEX idx_zona_ubicacion (estado_republica, ciudad)
);

CREATE TABLE IF NOT EXISTS proveedor_zonas (
  proveedor_id INT NOT NULL,
  zona_id INT NOT NULL,
  PRIMARY KEY (proveedor_id, zona_id),
  INDEX idx_zona_proveedor (zona_id, proveedor_id),
  FOREIGN KEY (proveedor_id) REFERENCES perfiles_proveedor(usuario_id) ON DELETE CASCADE,
  FOREIGN KEY (zona_id) REFERENCES zonas(id) ON DELETE CASCADE
);

ALTER TABLE perfiles_proveedor ADD INDEX idx_perfiles_cp (codigo_postal);
ALTER TABLE servicios ADD INDEX idx_servicio_proveedor (proveedor_id);