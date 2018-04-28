

class ManejadorErrores extends Error {
    constructor(mensaje, nombre, estatus) {
        super(mensaje);
        Error.captureStackTrace(this, this.constructor);
        this.nombre = nombre;
        this.estatus = estatus;
        this.tipo = this.constructor.name;

        return this;
    }
}

module.exports.NoEncontrado = class NoEncontrado extends ManejadorErrores {
    constructor() {
        super('El recurso al que intenta acceder no ha sido localizado dentro del sitio.', 'No Encontrado', 404)
    }
}

module.exports.UsuarioNoAutorizado = class UsuarioNoAutorizado extends ManejadorErrores {
    constructor() {
        super('No está autorizado para acceder a este recurso.', 'Usuario No Autorizado', 401)
    }
}

module.exports.UsuarioNoAutenticado = class UsuarioNoAutenticado extends ManejadorErrores {
    constructor() {
        super('Para poder acceder a este recurso debe enviar sus credenciales (usuario y contraseña).', 'Usuario No Autenticado', 401)
    }
}

module.exports.ErrorInternoServidor = class ErrorInternoServidor extends ManejadorErrores {
    constructor() {
        super('Lo sentimos, estamos prensentando problemas en nuestra plataforma.', 'Error Interno del Servidor', 500)
    }
}
