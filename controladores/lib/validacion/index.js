
const JOI = require('joi'),
	DepurarDatos = require('../depurar_datos'),
	Aplicacion = require('../../../aplicacion');

module.exports = class Validacion {

	constructor(){
		this._depurar = new DepurarDatos();
	}

	_ejecutar(datos, esquema_a_validar) {
		return JOI.validate(datos, esquema_a_validar, Aplicacion.configuracion.opciones_joi );
	}

	archivos(lista_imagenes, tipo_entidad, entidad){

		lista_imagenes = this._depurar.archivos(lista_imagenes, tipo_entidad, entidad);

		for(let pos = lista_imagenes.length - 1; pos >= 0; --pos){
			if (lista_imagenes[pos].peso <= 1024 || lista_imagenes[pos].peso >= 3145728)  // entre 1 kib y 3 mib
				return {
					"error": {
						"details": [ {
							"message": "Debe ingresar una imágen con un peso máximo de 3 MiB, o quizás la resolución es muy pequeña",
							"path": "Imágen: " + lista_imagenes[pos]
						} ]
					},
					"value": {}
				}
		}

		return {
			"value": lista_imagenes,
			"error": null
		}
	}

}
