
const mongoose = require('mongoose'),
	{Schema} = mongoose,
	ObjectId = Schema.ObjectId,
	bcrypt = require('bcryptjs');



// PERSONA ==============================

const AtributosPersona = Schema ({
	fecha_registro: { type: Date, default: new Date().toISOString() },
    usuario: { type: String, unique: true, lowercase: true },
	correo: String,
    clave: String,
    nombre: String,
    biografia: String,
	foto_perfil: {type: ObjectId, ref: "Imagen" },
	imagenes: {type: [ObjectId], ref: "Imagen"},
	proveedor: { type: String, default: '' },
	facebook: {},
	twitter: {},
	google: {}
});

class Persona {

	get tipo_usr() {
		return this.__t;
	}

	static registrar (datos, cb) {
		let instanciaPersona = new this(datos);

		instanciaPersona.clave = instanciaPersona._encriptar_clave(datos.clave);
		instanciaPersona.save((error, creado) => {
			if(error) return cb(error);

			return cb(null, creado);
		});
	}

	static buscar (usuario, cb){
		this.findOne({"usuario": usuario})
			.populate("imagenes", "url")
			.populate("foto_perfil", "url")
			.exec((error, buscado) => {
			if(error) return cb(error);

			return cb(null, buscado);
		})
	}

	static listado (parametros, cb) {
		this.find({"__t": parametros.tipo_usr}, null, {limit: parametros.cant_resultados}, (error, lista) => {
			if(error) return cb(error);

			return cb(null, lista);
		})
	}

	static configurar_cuenta (datos, cb) {
		this.findOneAndUpdate( {"usuario": datos.usuario}, {$set: datos}, {new: true} )
			.populate("foto_perfil", "url")
			.exec((error, modificado) => {
				if(error) return cb(error);
				return cb(null, modificado);
			})
	}

	static eliminar_cuenta (usuario, cb) {
		this.findOneAndRemove({"usuario": usuario}, (error, eliminado) => {
			if(error) return cb(error);

			return cb(null, eliminado);
		})
	}

	_encriptar_clave (clave) {
		return bcrypt.hashSync(clave, bcrypt.genSaltSync(10));
	}

	_validar_clave (clave) {
	    return bcrypt.compareSync(clave, this.clave);
	}

	_crear_nombre_usuario (datos) {
		let usuario = "";

		if(datos.username)
			usuario = datos.username;

		else if(datos.email)
			usuario = datos.email.split("@")[0];

		else if (datos.displayName)
			usuario = datos.displayName.replace(/[^\w]*/g, "");

		this.find({"usuario":usuario}, {$exists: true}, (error, usr) => {
			if (error) next(error);

			if (usr)
				usuario = usr.usuario + Math.floor(99 * Math.random()) + 1;

			return usuario;
		});
	}
}

AtributosPersona.loadClass(Persona);




// TURISTA ==============================

const AtributosTurista = new Schema ({
	sexo: {type: String, default: ""},
	edad: {type: Number, default: 0},
	calificaciones: {type: [ObjectId], ref: "Calificacion", default: [ ]}
});




// PRESTADOR SERVICIO ==============================

const AtributosPrestadorServicio  = new Schema ({
	sexo: {type: String, default: ""},
	edad: {type: Number, default: 0},
	telefono: {type: String, default: ""}
});





// ADMINISTRADOR EMPRESA ==============================

const AtributosAdministrador  = new Schema ({});




// ==============================
// HERENCIA ==============================
// ==============================

var Pers = mongoose.model('Persona', AtributosPersona);  
Pers.discriminator('Turista', AtributosTurista);
Pers.discriminator('Administrador', AtributosAdministrador);
Pers.discriminator('PrestadorServicio', AtributosPrestadorServicio);



// ==============================
// EXPORTAR ==============================
// ==============================

module.exports = {
	"PrestadorServicio": mongoose.model('PrestadorServicio'),
	"Administrador": mongoose.model('Administrador'),
	"Turista": mongoose.model('Turista'),
	"Persona": Pers
}
