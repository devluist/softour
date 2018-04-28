
module.exports = class Respuesta {
	/*
		Esta clase elige, en base al tipo de contenido (Content-type) de una peticion, el metodo de respuesta (json o html), envía los datos a retornar o los renderiza en la vista y si el caso se encarga de retornar errores de validacion
	*/

	_enviar(req, res, estatus, ruta){
		if( req.header("content-type") &&  ( req.header("content-type") === "application/json" || req.header("content-type").match(/multipart\/form-data/g) ) || req.xhr )
			res.status(estatus).json(res.locals.datos);
		else
			if(res.locals.datos && res.locals.datos.error)
				res.status(estatus).render(ruta);
			else
				if(req.method === "GET")
					res.status(estatus).render(ruta);
				else
					res.redirect(ruta);
	}

}
