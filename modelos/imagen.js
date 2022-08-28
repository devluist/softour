
const mongoose = require('mongoose'),
	{Schema} = mongoose,
	fs = require('fs'),
	mv = require('mv'),
	path = require('path'),
	Aplicacion = require('../aplicacion');


const AtributosImagen = new Schema({
	url: {type: String, required:true},
	tipo_entidad: {type: String, required:true},
	entidad: {type: String, required:true},
	extension: String,
	peso: Number,
	nombre: String,
	descripcion: String
}, {collection: "imagenes"});




class Imagen {

	_generar_rutas(imagen, id){
		let nombre_img = id + "." + imagen.extension,
			temp = imagen.ruta,
			destino = path.resolve(Aplicacion.configuracion.RUTA_ARCHIVOS_SUBIDOS + '/' + imagen.tipo_entidad + '/' + imagen.entidad + '/' +  nombre_img),
			web = "/subidas/" + imagen.tipo_entidad + '/' + imagen.entidad + '/' + nombre_img;

		return {nombre_img, destino, temp, web};
	}

	static almacenar(imagen, cb) {
		let Img = new this();
		let ruta = Img._generar_rutas(imagen, Img.id);

		mv(ruta.temp, ruta.destino, {mkdirp: true, clobber: false}, (error) => {
            if (error) return cb(error);

            Img.url = ruta.web;
            Img.nombre = ruta.nombre_img;
            Img.extension = imagen.extension;
            Img.entidad = imagen.entidad;
            Img.tipo_entidad = imagen.tipo_entidad;
			Img.peso = imagen.peso;
			Img.save((error) => {
            	if(error) return cb(error);

            	return cb(null, Img);
            });
        });
	}

	static listado(datos, cb) {
		this.find({"entidad": datos.entidad, "tipo_entidad": datos.tipo_entidad}, (error, listado) => {
			if(error) return cb(error);

			return cb(null, listado);
		})
	}

	static buscar(consulta, cb) {
		this.findOne(consulta, (error, buscado) => {
			if(error) return cb(error);

			return cb(null, buscado);
		})
	}

}


AtributosImagen.loadClass(Imagen);

module.exports = mongoose.model('Imagen', AtributosImagen);
