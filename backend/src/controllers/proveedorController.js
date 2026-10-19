const proveedorRepo = require('../repositories/proveedorRepository');
const { normalizeMexicanPhone } = require('../utils/mexicanPhone');
// backend/src/controllers/proveedorController.js
const profileRepository = require('../repositories/profileRepository');

// Codigos postales mexicanos: 5 digitos.
const CODIGO_POSTAL_REGEX = /^\d{5}$/;

const validImageUrl = (value) => (
  typeof value === 'string' &&
  (value.startsWith('/uploads/') || /^https?:\/\/[^\s]+$/i.test(value))
);

const isGoogleMapsUrl = (value) => {
  if (!value) return true;

  try {
    const url = new URL(value);
    return url.protocol === 'https:' &&
      (url.hostname === 'maps.google.com' ||
        url.hostname === 'maps.app.goo.gl' ||
        url.hostname === 'goo.gl' ||
        url.hostname === 'www.google.com' && url.pathname.startsWith('/maps'));
  } catch {
    return false;
  }
};

const proveedorController = {
    async getMyProfile(req, res) {
        try {
            const userId = req.user.id; // Obtenido del token JWT gracias al middleware
            const profile = await profileRepository.findByUserId(userId);

            if (!profile) {
                return res.status(404).json({ error: 'Perfil no encontrado. Puedes crearlo.' });
            }

            return res.json(profile);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error al obtener el perfil' });
        }
    },

    async saveOrUpdateProfile(req, res) {
        try {
            const userId = req.user.id; // ID del usuario autenticado
            const profile = await profileRepository.createOrUpdate(userId, req.body);

            return res.status(200).json({
                mensaje: 'Perfil guardado con éxito',
                profile
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error al guardar el perfil' });
        }
    }
};

// HU 06: Búsqueda geoespacial de proveedores
const buscarProveedores = async (req, res) => {
  try {
    const { lat, lng, radio, cat } = req.query;
    if (!lat || !lng || !cat) {
      return res.status(400).json({ 
        exito: false, 
        error: 'Faltan parámetros de búsqueda (lat, lng, cat)' 
      });
    }

    const proveedores = await proveedorRepo.buscarProveedores(
      parseFloat(lat),
      parseFloat(lng),
      parseInt(radio) || 5000,
      cat
    );

    res.status(200).json({ exito: true, datos: proveedores });
  } catch (error) {
    console.error('Error en buscarProveedores:', error);
    res.status(500).json({ 
      exito: false, 
      error: 'Error interno del servidor' 
    });
  }
};

const obtenerPerfil = async (req, res) => {
  try {
    const perfil = await proveedorRepo.obtenerPerfil(req.user.id);
    return res.status(200).json(perfil || {});
  } catch (error) {
    console.error('Error al cargar perfil del proveedor:', error);
    return res.status(500).json({ error: 'No fue posible cargar el perfil.' });
  }
};

const actualizarPerfil = async (req, res) => {
  const {
    nombre, nombre_negocio: nombreNegocio, tipo_servicio: tipoServicio,
    formacion, servicio_domicilio: servicioDomicilio, colonia,
    codigo_postal: codigoPostal, foto_perfil_url: fotoPerfilUrl,
    fotos_trabajo: fotosTrabajo, solo_cotizacion: soloCotizacion,
    costo_aproximado: costoAproximado, direccion_maps: direccionMaps,
    descripcion, telefono,
  } = req.body;
  const nombreNormalizado = typeof nombre === 'string' ? nombre.trim() : '';
  const servicioNormalizado = typeof tipoServicio === 'string' ? tipoServicio.trim() : '';
  const coloniaNormalizada = typeof colonia === 'string' ? colonia.trim() : '';
  const codigoPostalNormalizado = typeof codigoPostal === 'string' ? codigoPostal.trim() : '';
  const telefonoIngresado = typeof telefono === 'string' ? telefono : '';
  const telefonoNormalizado = telefonoIngresado.trim() ? normalizeMexicanPhone(telefonoIngresado) : null;
  const fotoPerfil = typeof fotoPerfilUrl === 'string' ? fotoPerfilUrl.trim() : '';
  if (!Array.isArray(fotosTrabajo)) {
    return res.status(400).json({ error: 'Las fotos de trabajo deben enviarse como una lista.' });
  }
  const imagenesTrabajo = fotosTrabajo;
  const mapsUrl = typeof direccionMaps === 'string' ? direccionMaps.trim() : '';
  const descripcionNormalizada = typeof descripcion === 'string' ? descripcion.trim() : '';
  const formacionNormalizada = typeof formacion === 'string' ? formacion.trim() : '';
  const negocioNormalizado = typeof nombreNegocio === 'string' ? nombreNegocio.trim() : '';

  if (!nombreNormalizado || nombreNormalizado.length > 100) {
    return res.status(400).json({ error: 'El nombre de la persona es obligatorio y no debe superar 100 caracteres.' });
  }
  if (!servicioNormalizado || servicioNormalizado.length > 150) {
    return res.status(400).json({ error: 'El tipo de servicio es obligatorio y no debe superar 150 caracteres.' });
  }
  if (typeof servicioDomicilio !== 'boolean') {
    return res.status(400).json({ error: 'Indica si ofreces servicio a domicilio.' });
  }
  if (!coloniaNormalizada || coloniaNormalizada.length > 150) {
    return res.status(400).json({ error: 'La colonia es obligatoria y no debe superar 150 caracteres.' });
  }
  if (!/^\d{5}$/.test(codigoPostalNormalizado)) {
    return res.status(400).json({ error: 'Ingresa un código postal mexicano de cinco dígitos.' });
  }
  if (!validImageUrl(fotoPerfil)) {
    return res.status(400).json({ error: 'Sube una foto de perfil válida para continuar.' });
  }
  if (imagenesTrabajo.length > 5 || !imagenesTrabajo.every(validImageUrl)) {
    return res.status(400).json({ error: 'Puedes agregar hasta cinco fotos de trabajo válidas.' });
  }
  if (typeof soloCotizacion !== 'boolean') {
    return res.status(400).json({ error: 'Indica si trabajas bajo cotización o si mostrarás un costo aproximado.' });
  }
  const costo = costoAproximado === '' || costoAproximado == null ? null : Number(costoAproximado);
  if (soloCotizacion ? costo !== null : !Number.isFinite(costo) || costo <= 0) {
    return res.status(400).json({
      error: soloCotizacion
        ? 'No incluyas un costo cuando el servicio es bajo cotización.'
        : 'Ingresa un costo aproximado mayor que cero.',
    });
  }
  if (!isGoogleMapsUrl(mapsUrl)) {
    return res.status(400).json({ error: 'Ingresa un enlace HTTPS válido de Google Maps.' });
  }
  if (negocioNormalizado.length > 150 || formacionNormalizada.length > 500 ||
      descripcionNormalizada.length > 5000 || telefonoIngresado.length > 20) {
    return res.status(400).json({ error: 'Uno o más campos superan la longitud permitida.' });
  }
  if (telefono != null && typeof telefono !== 'string') {
    return res.status(400).json({ error: 'El teléfono debe enviarse como texto.' });
  }
  if (telefonoIngresado.trim() && !telefonoNormalizado) {
    return res.status(400).json({ error: 'Ingresa un teléfono mexicano válido de 10 dígitos, con o sin el prefijo +52.' });
  }

  try {
    const perfil = await proveedorRepo.guardarPerfil(req.user.id, {
      nombre: nombreNormalizado,
      nombre_negocio: negocioNormalizado || null,
      tipo_servicio: servicioNormalizado,
      formacion: formacionNormalizada || null,
      servicio_domicilio: servicioDomicilio,
      colonia: coloniaNormalizada,
      codigo_postal: codigoPostalNormalizado,
      foto_perfil_url: fotoPerfil,
      fotos_trabajo: imagenesTrabajo,
      solo_cotizacion: soloCotizacion,
      costo_aproximado: soloCotizacion ? null : costo,
      direccion_maps: mapsUrl || null,
      descripcion: descripcionNormalizada || null,
      telefono: telefonoNormalizado,
    });
    return res.status(200).json(perfil);
  } catch (error) {
    if (error.code === '23505' && error.constraint === 'usuarios_telefono_unique_idx') {
      return res.status(409).json({ error: 'Ese teléfono ya está asociado a otra cuenta.' });
    }
    console.error('Error al guardar perfil del proveedor:', error);
    return res.status(500).json({ error: 'No fue posible guardar el perfil.' });
  }
};

const subirImagenesPerfil = (req, res) => {
  const files = req.files || {};
  return res.status(201).json({
    foto_perfil_url: files.foto_perfil?.[0]?.publicUrl || null,
    fotos_trabajo: (files.fotos_trabajo || []).map((file) => file.publicUrl),
  });
};


// HU 05: GET /api/proveedores/buscar?codigo_postal=XXXXX  o  ?zona=Colonia
// const buscarProveedores = async (req, res) => {
//   const codigo_postal =
//   typeof req.query.codigo_postal === 'string' ? req.query.codigo_postal.trim() : '';
//   const zona = typeof req.query.zona === 'string' ? req.query.zona.trim() : '';
  
//   if (!codigo_postal && !zona) {
//     return res.status(400).json({ error: 'Indica un codigo postal o selecciona una zona.' });
//   }
//   if (codigo_postal && !CODIGO_POSTAL_REGEX.test(codigo_postal)) {
//     return res.status(400).json({ error: 'El codigo postal debe tener 5 digitos.' });
//   }
//   if (zona && zona.length > 150) {
//     return res.status(400).json({ error: 'La zona indicada no es valida.' });
//   }

//   try {
//     // Si llegan los dos, el codigo postal tiene prioridad.
//     const proveedores = await proveedorRepo.buscarPorZona({
//       codigo_postal: codigo_postal || null,
//       zona: codigo_postal ? null : zona,
//     });
//     return res.json({ total: proveedores.length, proveedores });
//   } catch (err) {
//     console.error('Error al buscar proveedores:', err);
//     return res.status(500).json({ error: 'No fue posible realizar la busqueda.' });
//   }
// };

// Catalogo de zonas para el selector del buscador (HU 05).
const listarZonas = async (req, res) => {
  try {
    const zonas = await proveedorRepo.listarZonas();
    return res.json({ zonas });
  } catch (err) {
    console.error('Error al listar zonas:', err);
    return res.status(500).json({ error: 'No fue posible cargar las zonas.' });
  }
};

// Catalogo de categorias para el filtro del listado (HU 06).
const listarCategorias = async (req, res) => {
  try {
    const categorias = await proveedorRepo.listarCategorias();
    return res.json({ categorias });
  } catch (err) {
    console.error('Error al listar categorias:', err);
    return res.status(500).json({ error: 'No fue posible cargar las categorias.' });
  }
};

// GET /api/proveedores/:id - perfil detallado (destino de las tarjetas, HU 06).
const obtenerDetalle = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Identificador de proveedor invalido.' });
  }
  
  try {
    const proveedor = await proveedorRepo.obtenerPorId(id);
    if (!proveedor) {
      return res.status(404).json({ error: 'Proveedor no encontrado.' });
    }
    return res.json({ proveedor });
  } catch (err) {
    console.error('Error al obtener proveedor:', err);
    return res.status(500).json({ error: 'No fue posible cargar el perfil del proveedor.' });
  }
};


//module.exports = proveedorController;
const verifyToken = require('../middlewares/authMiddleware');
// HU 07: Perfil público completo y reseñas asociadas
const obtenerDetallePerfil = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({
        exito: false,
        mensaje: 'El ID del proveedor debe ser un número válido'
      });
    }
    
    // Usamos proveedorRepo, que coincide con la importación arriba
    const perfil = await proveedorRepo.obtenerPerfilProveedor(Number(id));
    
    if (!perfil) {
      return res.status(404).json({
        exito: false,
        mensaje: 'Proveedor no encontrado'
      });
    }
    
    res.status(200).json({
      exito: true,
      datos: perfil
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error interno del servidor al obtener el perfil'
    });
  }
};

const obtenerProveedores = async (req, res) => {
  res.status(501).json({
    exito: false,
    mensaje: 'Funcionalidad no implementada'
  });
};

module.exports = { buscarProveedores, listarZonas, listarCategorias, obtenerDetalle, obtenerProveedores, obtenerPerfil, actualizarPerfil, subirImagenesPerfil, obtenerDetallePerfil };
// module.exports = {
//   buscarProveedores,
//   obtenerDetallePerfil
// };
