
const Respuesta = require('./');

module.exports = class RespuestaBusquedas extends Respuesta {

	para_solicitudes_ps(req, res){
		res.locals.layout = "admin";
		this._enviar(req, res, 200, "usuario/admin/solicitudes-ps");
	}

	para_resultados_sin_categoria(req, res) {
		this._enviar(req, res, 200, "busqueda/general");
	}

	para_buscar_nuevamente(req, res){
		this._enviar(req, res, 200, "busqueda/vacia");
	}

	para_resultados_por_categoria(req, res){
		let ruta;

		if(req.params.atributo)
			switch(res.locals.datos.value.tipo_entidad){
				case "SDI":
					ruta = "busqueda/especifica/lugar-"+req.params.atributo;
					break;
				case "Alojamiento":
					ruta = "busqueda/especifica/alojamiento-"+req.params.atributo;
					break;
				case "Gastronomia":
					ruta = "busqueda/especifica/gastronomia-"+req.params.atributo;
					break;

				case "Evento":
					ruta = "busqueda/especifica/evento-"+req.params.atributo;
					break;
				case "Experiencia":
					ruta = "busqueda/especifica/experiencia-"+req.params.atributo;
					break;
			}
		else
			switch(res.locals.datos.value.tipo_entidad){
				case "SDI":
					ruta = "busqueda/general/lugares";
					break;
				case "Alojamiento":
					ruta = "busqueda/general/alojamientos";
					break;
				case "Evento":
					ruta = "busqueda/general/eventos";
					break;
				case "Experiencia":
					ruta = "busqueda/general/experiencias";
					break;
				case "Gastronomia":
					ruta = "busqueda/general/gastronomicas";
					break;
			}
		this._enviar(req, res, 200, ruta);
	}

	para_busqueda_geocodificada(req, res) {
		this._enviar(req, res, 200, "busqueda/vacia");
	}

	para_retornar_resultados(req, res) {
		this._enviar(req, res, 200, "busqueda/general");
	}

	para_busquedas_autocompletar(req, res) {
		this._enviar(req, res, 200, "busqueda/busqueda");
	}

	para_busquedas_entidades_cercanas(req, res) {
		this._enviar(req, res, 200, "busqueda/busqueda");
	}

}
