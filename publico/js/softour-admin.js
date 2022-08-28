
function iniciarCalendario( fecha_inicio, fecha_fin  ){
	if(!fecha_inicio && !fecha_fin){
		fecha_inicio = moment();
		fecha_fin = moment();
		fecha_hoy = moment();
	}
	else {
		fecha_inicio = moment(fecha_inicio);
		fecha_fin = moment(fecha_fin);
		fecha_hoy = moment();
	}

	$('#fecha_inicio_fin').daterangepicker({
		"timePicker": true,
		"timePickerIncrement": 30,
		"autoApply": true,
		"autoUpdateInput": true,
		"linkedCalendars": false,
		"startDate": fecha_inicio.format("MM/DD/YYYY HH:MM"),
		"endDate": fecha_fin.format("MM/DD/YYYY HH:MM"),
		"minDate": fecha_hoy.format("MM/DD/YYYY HH:MM"),
		"locale": {
			format: "MM/DD/YYYY HH:MM",
			applyLabel: "Aplicar",
			cancelLabel: "Cancelar",
			daysOfWeek: [
				"Do",
				"Lu",
				"Ma",
				"Mi",
				"Ju",
				"Vi",
				"Sa"
			],
			monthNames: [
				"Enero",
				"Febrero",
				"Marzo",
				"Abril",
				"Mayo",
				"Junio",
				"Julio",
				"Agosto",
				"Septiembre",
				"Octubre",
				"Noviembre",
				"Diciembre"
			]
		}
	 }).change(function(campo){ 
		let fechas = campo.currentTarget.value.split(" - "),
			f1 = moment( new Date(fechas[0]) ),
			f2 = moment( new Date(fechas[1]) );

		$("#fecha_inicio").val( f1.toISOString() );
		$("#fecha_fin").val( f2.toISOString() );
		$("#duracion").val( f2.diff(f1, "hours") + " h" );
	});
	 /* xHACER: al cargar en editar experiencia, no tiene la fecha xq es onchange*/
}

function inicializarContadorSolicitudesPS() {
	$.ajax({
		url: '/api/busqueda/cantidad-solicitudes-ps',
		type: 'GET',
		dataType: "json",
		success: function(datos) {
			if (datos.value > 0){
				if($("#cant-solicitudes").length > 0)
					$("#cant-solicitudes").replaceWith(' <span class="badge bg-red" id="cant-solicitudes">' + datos.value + '</span>')
				else
					$("#solicitudes-ps").append(' <span class="badge bg-red" id="cant-solicitudes">' + datos.value + '</span>')
			}
			else {
				if($("#cant-solicitudes").length > 0)
					$("#cant-solicitudes").remove();
			}
		},
		error: function(error) {
			console.log(error.responseJSON);
		}
	});
}


$(function() {


	/* ---------- INICIALIZAR PLUGINS/VARIABLES --------------- */

	let configuracion = {
		headers: {
			"X-Requested-With": "XMLHttpRequest"
		}
	 },
		$secciones = $('.tab-pane'),
		ha_guardado = false;

	Dropzone.options.formSubirFotosAlbum = {
		url: "/api/album/,/subir-foto",
		dictDefaultMessage: "Arrastra uno o mas archivos aquí o haz click para seleccionar los archivos manualmente y subir las fotos al servidor.",
		init: function() {
			this.on("success", function(archivo, ruta_servidor) {
				 $("#tab_foto_portada").append("<img class='galeria-foto-portada' src='"+ruta_servidor.value[0]+"'>");
			});
			this.on("error", function(archivo_error, resp) {
				$(archivo_error.previewElement).find(".dz-error-message").text(resp.error[0].mensaje);
			});
		}
	};

	function inicializarEtiquetador(objetivo, placeholder) { // el peor nombre que se me pudo ocurrir... pero bueee...
		if(!placeholder)
			placeholder = "Palabras claves que lo describan (esto para el motor de búsqueda)";

		$(objetivo).tagsInput({
			placeholder: placeholder,
			minChars: 2,
			maxChars: 20, // if not provided there is no limit
			validationPattern: new RegExp('^[a-zA-Z0-9 -áéíóúñ]+$'), // a pattern you can use to validate the input
			//autocomplete: { option: value, option: value},
			hide: true,
			delimiter: ',',
			unique: true,
			removeWithBackspace: true
		});
	}
	inicializarEtiquetador("#etiquetas", 'Palabras clave. Ejm: playa, mar, sol...');

	$(".calendar.left").parent().addClass("picker_4");



	/* -------------------- TABS NAVEGACION -------------------- */

	function navegar_a(indice) {
		var ultimo = indice >= $secciones.length - 1,
			entidad_sdi = (indice >= ($secciones.length - 2) && $("#negocio").length > 0);

		$('#barra-navegacion-form li:eq('+indice+') a').tab('show');
		$('.form-navigation .anterior').toggle(indice > 0);
		$('.form-navigation .siguiente').toggle(!ultimo);
		$('.form-navigation a').toggle(ultimo);
		$('#btn-finalizar-sdi').toggle(ultimo);

		if(ultimo || entidad_sdi) enlaceParaFotoPortada();
	}

	function indiceActual() {
		return  $secciones.index($secciones.filter('.active'));
	}

	function inicializarNavegacionFormulario(){

		$('a[data-toggle="tab"]').click((e) => {
			e.preventDefault();
			e.stopPropagation();
		})

		$('.form-navigation .anterior').click(function() {
			navegar_a(indiceActual() - 1);
		});

		$('.form-navigation .siguiente').click(function() {
			$('#form-guardar-entidad').parsley({excluded: 'a, input[type=button], input[type=submit], input[type=reset]', inputs: 'input, textarea, select, input[type=hidden], :hidden'})
				.whenValidate({
					group: 'block-' + indiceActual()
				}).done(function() {
					if(indiceActual()==1 && !ha_guardado)
						guardarEntidad();

					else
						navegar_a(indiceActual() + 1);
				});
		});

		$secciones.each(function(indice, seccion) {
			$(seccion).find(':input').attr('data-parsley-group', 'block-' + indice);
		});
		navegar_a(0);
	}

	inicializarNavegacionFormulario();




	/* ------------------- AGREGAR/EDITAR ENTIDAD ------------------ */


	var url_entidad_agregada, id_entidad_agregada, lista_categorias = [], form_espacio_habitacion = 
			'<label>\
				Nombre:\
				<input class="form-control" required type="text" name="nombre">\
			</label>\
			<label>\
				Descripción:\
				<textarea class="form-control" rows="3" type="text" name="descripcion"></textarea>\
			</label>\
			<label>\
				Servicios incluidos:\
				<input type="text" id="servicios_incluidos" class="form-control input-etiquetas" name="servicios_incluidos" placeholder="Wifi, Piscina, Restaurant...">\
			</label>\
			<label class="input-peq pull-left">\
				Cantidad habitaciones de esta categoría:\
				<input type="number" required name="cantidad_habitaciones" value="" class="form-control" min=0>\
			</label>\
			<label class="input-peq pull-right">\
				Precio por habitación:\
				<input class="form-control" required type="number" min=0 name="precio_unitario_producto">\
			</label>\
			<label class="input-peq pull-left">\
				Cantidad baños:\
				<input class="form-control" type="number" min=0 name="cantidad_baños">\
			</label>\
			<label class="input-peq pull-right">\
				Metros cuadrados:\
				<input class="form-control" type="number" min=0 name="metros_cuadrados">\
			</label>\
			<label class="input-peq pull-left">\
				Límite ocupantes en este espacio:\
				<input class="form-control" type="number" min=0 name="limite_ocupantes">\
			</label>\
			<label class="input-peq pull-right">\
				Cantidad de camas:\
				<input class="form-control" type="number" min=0 name="cantidad_camas">\
			</label>\
			<a href="#" class="btn btn-dark guardar-centrado btn-guardar-categoria">Cargar</a>\
			<input type="hidden" name="tipo_espacio" value="Habitación">',
		form_espacio_completo = 
			'<label>\
				Nombre / Identificador:\
				<input class="form-control" placeholder="Ejm: Apartamento B3 ó Casa #3 ó Posada 3..." required type="text" name="nombre">\
			</label>\
			<label>\
				Espacio incluye:\
				<input type="text" id="servicios_incluidos" class="form-control input-etiquetas" name="servicios_incluidos" placeholder="Wifi, Piscina, Restaurant...">\
			</label>\
			<label class="input-peq pull-left">\
				Precio del espacio:\
				<input class="form-control" required type="number" min=0 name="precio_unitario_producto">\
			</label>\
			<label class="input-peq pull-right">\
				Cantidad baños:\
				<input class="form-control" type="number" min=0 name="cantidad_baños">\
			</label>\
			<label class="input-peq pull-left">\
				Metros cuadrados:\
				<input class="form-control" type="number" min=0 name="metros_cuadrados">\
			</label>\
			<label class="input-peq pull-right">\
				Límite ocupantes en este espacio:\
				<input class="form-control" type="number" min=0 name="limite_ocupantes">\
			</label>\
			<label class="input-peq pull-left">\
				Cantidad de camas:\
				<input class="form-control" type="number" min=0 name="cantidad_camas">\
			</label>\
			<a href="#" class="btn btn-dark guardar-centrado btn-guardar-categoria">Cargar</a>\
			<input type="hidden" name="tipo_espacio" value="Completo">',
		form_menu_gastronomia = 
			'<label>\
				Nombre del Platillo / Bebida:\
				<input class="form-control" required type="text" name="nombre">\
			</label>\
			<label>\
				Descripción:\
				<textarea class="form-control" rows="3" type="text" name="descripcion"></textarea>\
			</label>\
			<label class="input-peq pull-left">\
				Precio del espacio:\
				<input class="form-control" required type="number" min=0 name="precio_unitario_producto">\
			</label>\
			<label class="input-peq pull-right">\
				Tipo de cocina:\
				<input class="form-control" type="text" name="tipo_cocina">\
			</label>\
			<a href="#" class="btn btn-dark guardar-centrado btn-guardar-categoria">Cargar</a>';

	function guardarEntidad() {
		let url_guardar = '/api' + window.location.pathname,
			tipo_peticion = window.location.pathname.split("/").length == 4 ? "put" : "post",
			atributos_entidad = $("#form-guardar-entidad").serialize();

		axios[tipo_peticion](url_guardar, atributos_entidad, configuracion)
			.then(function(datos) {
				let lista, tipo;

				$("#tab_info, #tab_contacto").find("input, textarea, #etiquetas_tag").attr("readonly", "readonly");
				$('.para-habitacion input').removeAttr("readonly");
				$("#etiquetas_tagsinput .tag a").hide();
				$("#form-guardar-entidad").find("#etiquetas_tag, .typeahead, #etiquetas_tagsinput, #etiquetas_addTag").css("background-color", "#eee");

				lista = $("div#formSubirFotosAlbum")[0].dropzone.options.url.split(",");
				if(datos.data.value.__t == null)
					tipo = "lugar";
				else
					tipo = datos.data.value.__t.toLowerCase();

				$("div#formSubirFotosAlbum")[0].dropzone.options.url = lista[0] + tipo + "/" + datos.data.value.url + lista[1];

				ha_guardado = true;
				url_entidad_agregada = datos.data.value.url;
				id_entidad_agregada = datos.data.value._id;
				navegar_a(indiceActual() + 1);
			})
			.catch(function(error) {
				ha_guardado = false;
				let msj = "";
				for (var i = 0; i < error.response.data.error.length; i++) {
					msj += "<b>" + error.response.data.error[i].campo +":</b> " + error.response.data.error[i].mensaje + "<br>";
				};
				new PNotify({
					title: 'Problemas!',
					text: msj,
					styling: "bootstrap3",
					delay: 10000,
					type: "error",
					sticker: false
				});
			});
	}

	function enlaceParaFotoPortada() {
		$("#tab_foto_portada img.galeria-foto-portada").click(function(e){
			let url_imagen = $(this).attr("src").split("/");
			axios.put(
				"/api/album/"+url_imagen[2]+"/"+url_imagen[3]+'/establecer-foto-portada',
				{"imagen": url_imagen.pop().split(".").shift()},
				configuracion)
					.then(function(res) {
						if (res.status == "200"){
							new PNotify({
								title: 'Cambio exitoso',
								text: 'Listo! Su foto de portada se ha cambiado.',
								styling: "bootstrap3",
								delay: 1000,
								type: "success",
								sticker: false
							});
						}
					})
					.catch(function(error) {
						new PNotify({
							title: 'Hubo un problema',
							text: 'No se pudo cambiar su foto, por favor intente nuevamente. Si persiste el error intentelo mas tarde.',
							styling: "bootstrap3",
							delay: 1000,
							type: "error",
							sticker: false
						});
					});
		});
	}

	function guardarCategorias(url_redireccion) {
		let url_guardar = '/api/reservacion/inventario/'+window.location.pathname.split("/")[1]+'/' + url_entidad_agregada + '/agregar-recurso',
			contador = 0;

		for (var i = 0; i < lista_categorias.length; i++) {
			$.ajax({
					url: url_guardar,
					type: 'POST',
					dataType: 'json',
					data: lista_categorias[i]
				})
				.done(function(data) {
					if (contador < lista_categorias.length - 1){
						contador++;
					}
					else
						window.location = url_redireccion;
				})
				.fail(function(error) {
					console.log(error.responseJSON);
					$('.clase-formulario-categorias').find("input, textarea, #servicios_incluidos").removeAttr("readonly");
					$('.clase-formulario-categorias').find(".btn-guardar-categoria").removeAttr("disabled");
					$('.clase-formulario-categorias').find(".tag a").show();
					$('#btn-finalizar-sdi').removeAttr("disabled");
				});
		}
	}

	/* ------------------- ALOJAMIENTO  */

	function constructorVentanas(e) { // una ventana es un form de una categoria de alojamiento
		let ventanas = [],
			forms_categ = [];
		$('#contenedor-categorias').empty();

		$('#categoria-habitaciones').empty();
		for (let i = 1; i <= $('input[name="cantidad_categorias"]').val(); i++) {
			ventanas.push('<a href="#detalles" class="ventana-categoria col-md-5 col-sm-5 col-lg-5" id="' + i + '">C ' + i + '</a>');
			forms_categ.push('<form class="form-horizontal clase-formulario-categorias" id="C' + i + '">' + form_espacio_habitacion + '</form>');
		};
		$('#categoria-habitaciones').append(ventanas);
		$('#contenedor-categorias').append(forms_categ);
		inicializarEtiquetador(".input-etiquetas", "Wifi, Piscina, Restaurant...");

		// mostrar solo el form q quiero ver
		$('.ventana-categoria').click(function(e) {
			$(".clase-formulario-categorias").hide();
			$(".clase-formulario-categorias").filter("[id=C" + $(this).attr("id") + "]").show();
		});

		// cargar datos al pulsar el btn
		$('.btn-guardar-categoria').click(function(e) {
			e.preventDefault();
			let contenedor = $(this).parent(),
				f = $(contenedor).attr("id").slice(1);
			$(contenedor).parsley({excluded: 'a, input[type=button], input[type=submit], input[type=reset]', inputs: 'input, textarea, select, input[type=hidden], :hidden'})
				.whenValidate()
				.done(() => {
					$(contenedor).find("input, textarea, .input-etiquetas").attr("readonly", "readonly");
					let tagsinput = $(contenedor).find("[name='servicios_incluidos']").siblings();

					$(tagsinput).css("background-color", "#eee");
					$(tagsinput).find("div").css("background-color", "#eee");
					$(tagsinput).find(".tag a").hide();
					$(this).attr("disabled", "disabled");

					new PNotify({
						title: 'Cargado',
						text: 'Ingrese siguiente categoría',
						styling: "bootstrap3",
						delay: 10000,
						type: "success",
						sticker: false
					});

					lista_categorias[parseInt(f) - 1] = $(contenedor).serialize() + "&id_entidad_agregada=" + id_entidad_agregada;
				});
		});
	}

	$('select[name="tipo_espacio"]')
		.ready(function(e) {
			lista_categorias = [];

			switch ($('select[name="tipo_espacio"]').val()) {
				case "Habitación":
					$('.para-habitacion').css("display", "inherit");
					break;
				case "Completo":
					$('.para-habitacion').css("display", "");
					$('#contenedor-categorias').append('<form class="form-horizontal clase-formulario-categorias" id="C1">' + form_espacio_completo + '</form>');
					inicializarEtiquetador(".input-etiquetas", "Wifi, Piscina, Restaurant...");
					$("#C1").show();

					// cargar datos al pulsar el btn
					$('.btn-guardar-categoria').click(function(e) {
						e.preventDefault();
						let contenedor = $('select[name="tipo_espacio"]').parent(),
							f = $(contenedor).attr("id").slice(1);
						$(contenedor).parsley({excluded: 'a, input[type=button], input[type=submit], input[type=reset]', inputs: 'input, textarea, select, input[type=hidden], :hidden'})
							.whenValidate()
							.done(() => {
								$(contenedor).find("input, textarea, .input-etiquetas").attr("readonly", "readonly");
								let tagsinput = $(contenedor).find("[name='servicios_incluidos']").siblings();

								$(tagsinput).css("background-color", "#eee");
								$(tagsinput).find("div").css("background-color", "#eee");
								$(tagsinput).find(".tag a").hide();
								$('select[name="tipo_espacio"]').attr("disabled", "disabled");

								lista_categorias[parseInt(f) - 1] = $(contenedor).serialize();
							});
					});
					break; 
			}
		})
		.change(function(e) {
			lista_categorias = [];

			$('#categoria-habitaciones, #contenedor-categorias').empty();
			$('.para-habitacion').css("display", "");

			switch (this.value) {
				case "Habitación":
					$('.para-habitacion').css("display", "inherit");
					break;
				case "Completo":
					$('.para-habitacion').css("display", "");
					$('#contenedor-categorias').append('<form class="form-horizontal clase-formulario-categorias" id="C1">' + form_espacio_completo + '</form>');
					inicializarEtiquetador(".input-etiquetas", "Wifi, Piscina, Restaurant...");
					$("#C1").show();

					// cargar datos al pulsar el btn
					$('.btn-guardar-categoria').click(function(e) {
						e.preventDefault();
						let contenedor = $(this).parent(),
							f = $(contenedor).attr("id").slice(1);
						$(contenedor).parsley({excluded: 'a, input[type=button], input[type=submit], input[type=reset]', inputs: 'input, textarea, select, input[type=hidden], :hidden'})
							.whenValidate()
							.done(() => {
								$(contenedor).find("input, textarea, .input-etiquetas").attr("readonly", "readonly");
								let tagsinput = $(contenedor).find("[name='servicios_incluidos']").siblings();

								$(tagsinput).css("background-color", "#eee");
								$(tagsinput).find("div").css("background-color", "#eee");
								$(tagsinput).find(".tag a").hide();
								$(this).attr("disabled", "disabled");

								lista_categorias[parseInt(f) - 1] = $(contenedor).serialize();
							});
					});
					break; 
			}
		});

	$('input[name="cantidad_categorias"]').ready(constructorVentanas).change(constructorVentanas).keyup(constructorVentanas);
	$('#btn-finalizar-sdi').click(function(e) {
		$(this).attr("disabled", "disabled");
		guardarCategorias( $(this).data("url") );
	});
	$('#btn-guardar-entidad').click(function(e) {
		$(this).attr("disabled", "disabled");
		guardarEntidad();
	});




	/* ------------------ TABLAS ------------------- */


	function formatear_mensaje(d) {
		let url_imagen = d.imagen_portada ? d.imagen_portada.url : '/images/sin_imagen.png';

		return '<div class="row">\
				<img class="col-md-3" src="'+url_imagen+'">\
				<p class="col-md-3"><b>Etiquetas:</b> '+d.etiquetas+'</p>\
				<p class="col-md-6"><b>Ubicación:</b> '+d.ubicacion.pais+", "+d.ubicacion.estado+", "+d.ubicacion.ciudad+", "+d.ubicacion.direccion+'</p>\
			</div>';
	}

	if ($('#solicitudes').length > 0) {
		var tabla = $('#solicitudes').DataTable({

			"ajax": {
				url: '/api/busqueda/solicitudes-ps',
				dataSrc: 'value'
			},
			"columns": [{
					"className": 'details-control',
					"orderable": false,
					"data": null,
					"defaultContent": ''
				},
				{ "data": "nombre" },
				{ "data": "__t"
					/*"render": function (data, type, row){
						switch(row.__t){
							case "Evento":
								return "<i class='fa fa-calendar-o'></i> " + data;
								break;
							case "Experiencia":
								return "<i class='fa fa-camera'></i> " + data;
								break;
							case "Gastronomia":
								return "<i class='fa fa-cutlery'></i> " + data;
								break;
							case "Alojamiento":
								return "<i class='fa fa-bed'></i> " + data;
								break;
						}
					}*/
				},
				{ "data": "prestador_servicio.usuario" },
				{ "data": "descripcion" },
				{
					"orderable": false,
					"render": function(data, type, row) {
						return '<a href="/api/'+row.__t.toLowerCase()+'/'+ row.url + '/aprobar" class="btn-solicitudes btn btn-success btn-xs"> Aprobar</a><a href="/api/'+row.__t.toLowerCase()+'/'+ row.url + '/denegar" class="btn-solicitudes btn btn-danger btn-xs"> Denegar</a>';
					}
				}
			],
			"language": {
				"decimal": ",",
				"emptyTable": "Sin datos disponibles",
				"info": "Se muestran del _START_ al _END_ de _TOTAL_ registros",
				"infoEmpty": "Se muestran 0 registros",
				"infoFiltered": "(filtrados de un total de _MAX_ registros)",
				"infoPostFix": "",
				"thousands": ".",
				"lengthMenu": "Mostrar _MENU_ registros",
				"loadingRecords": "Cargando...",
				"processing": "Procesando...",
				"search": "Buscar:",
				"zeroRecords": "No se encontraron coincidencias",
				"paginate": {
					"first": "Primera",
					"last": "Última",
					"next": "Siguiente",
					"previous": "Anterior"
				},
				"aria": {
					"sortAscending": ": activar para ordenar columnas ascendentemente",
					"sortDescending": ": activar para ordenar columnas descendentemente"
				}
			},
			"order": [
				[1, 'asc']
			]
		});
	}

	$('#solicitudes tbody').on('click', 'td a', function(e) {
		e.preventDefault();
		e.stopPropagation();
		axios.get(this.href, configuracion)
			.then((datos)=>{
				tabla.row( $(this).parents("tr") )
					.remove()
					.draw();
				new PNotify({
					title: 'Cambio exitoso',
					text: 'Listo! La solicitud fue procesada.',
					styling: "bootstrap3",
					delay: 1000,
					type: "success",
					sticker: false
				});
				inicializarContadorSolicitudesPS();
			})
			.catch(function(error){
				new PNotify({
					title: 'Hubo un problema',
					text: 'No se pudo completar el proceso, por favor intente nuevamente. Si persiste el error intentelo mas tarde.',
					styling: "bootstrap3",
					delay: 1000,
					type: "error",
					sticker: false
				});
			})
	});

	$('#solicitudes tbody').on('click', 'td.details-control', function() {
		var tr = $(this).closest('tr'),
			row = tabla.row(tr);

		if (row.child.isShown()) {
			// This row is already open - close it
			row.child.hide();
			tr.removeClass('shown');
		} else {
			// Open this row
			row.child(formatear_mensaje(tabla.row(this).data())).show();
			tr.addClass('shown');
		}
	});

	/*$('#solicitudes tbody').on('click', 'tr', function() {
		if ($(this).hasClass('selected')) {
			$(this).removeClass('selected');
		} else {
			tabla.$('tr.selected').removeClass('selected');
			$(this).addClass('selected');
		}
	});*/


	if ($('#listado-entidad').length > 0) {
		var table = $('#listado-entidad').DataTable({
			"columns": [
				{ "title": "Nombre" },
				{ "title": "Ubicación" },
				{ "title": "Calificación" },
				{ "title": "Operación", "orderable": false }
			],
			"language": {
				"decimal": ",",
				"emptyTable": "Sin datos disponibles",
				"info": "Se muestran del _START_ al _END_ de _TOTAL_ registros",
				"infoEmpty": "Se muestran 0 registros",
				"infoFiltered": "(filtrados de un total de _MAX_ registros)",
				"infoPostFix": "",
				"thousands": ".",
				"lengthMenu": "Mostrar _MENU_ registros",
				"loadingRecords": "Cargando...",
				"processing": "Procesando...",
				"search": "Buscar:",
				"zeroRecords": "No se encontraron coincidencias",
				"paginate": {
					"first": "Primera",
					"last": "Última",
					"next": "Siguiente",
					"previous": "Anterior"
				},
				"aria": {
					"sortAscending": ": activar para ordenar columnas ascendentemente",
					"sortDescending": ": activar para ordenar columnas descendentemente"
				}
			},
			"order": [
				[0, "asc"]
			]
		});
	}

	if ($('#tabla-reservaciones').length > 0) {
		var table = $('#tabla-reservaciones').DataTable({
			"columns": [
				{ "title": "Nombre" },
				{
					"title": "Disponibilidad",
					"render": function(data, type, row) {
						let reservaciones = row[1] ? row[1].match(/([\d- ]+)/g) : null,
							hoy = moment( new Date(Date.now().toJSON().slice(0,10)) ),
							fechas = [],
							disponible = true,
							texto = "<b class='disponible'>Disponible</b>";

						if(reservaciones){
							for (var i = 0; i < reservaciones.length; i++) {
								fechas = reservaciones[i].split(" ");

								if( hoy.isBetween(fechas[0], fechas[1]) )
									disponible = false;
							}
							if(!disponible)
								texto = "<b class='no-disponible'>No Disponible</b>";
						}
						return texto;
					}
				},
				{ "title": "Operación", "orderable": false }
			],
			"language": {
				"decimal": ",",
				"emptyTable": "Sin datos disponibles",
				"info": "Se muestran del _START_ al _END_ de _TOTAL_ registros",
				"infoEmpty": "Se muestran 0 registros",
				"infoFiltered": "(filtrados de un total de _MAX_ registros)",
				"infoPostFix": "",
				"thousands": ".",
				"lengthMenu": "Mostrar _MENU_ registros",
				"loadingRecords": "Cargando...",
				"processing": "Procesando...",
				"search": "Buscar:",
				"zeroRecords": "No se encontraron coincidencias",
				"paginate": {
					"first": "Primera",
					"last": "Última",
					"next": "Siguiente",
					"previous": "Anterior"
				},
				"aria": {
					"sortAscending": ": activar para ordenar columnas ascendentemente",
					"sortDescending": ": activar para ordenar columnas descendentemente"
				}
			},
			"order": [
				[0, "asc"]
			]
		});
	}



	/* ---------------- CALENDARIO --------------- */

	function listarReservaciones(array_reservaciones = null){
		let fechas, listado = [];
		if(array_reservaciones)
			fechas = array_reservaciones.match(/([\d- ]+)/g);
		else
			fechas = 0;

		for (var i = 0; i < fechas.length; i++) {
			listado.push({
				"title": "Reservación",
				"start": fechas[i].split(" ")[0],
				"end": fechas[i].split(" ")[1]
			});
		};
		return listado;
	}

	if("undefined" != typeof $.fn.fullCalendar)
		$('#calendario-reservaciones').fullCalendar({
			"lang": 'es',
			 header: {
			 	left: "prev,next today",
			 	center: "title",
			 	right: "month,agendaWeek,agendaDay,listMonth"
			},
		    "defaultView": "basicWeek",
		    "selectable": true,
		    "eventStartEditable": false,
		    "eventDurationEditable": false,
			"eventOverlap": false,
			"events": listarReservaciones()
		});


	/* -------------- AUTOCOMPLETAR -------------- */


	if ($("#sugerencias-cp").length > 0) {
		let cp = new Bloodhound({
			datumTokenizer: Bloodhound.tokenizers.obj.whitespace('codigo_postal ciudad'),
			queryTokenizer: Bloodhound.tokenizers.whitespace,
			remote: {
				url: "../../api/busqueda/sugerencias/Ubicacion/?pais=Venezuela&cp=%CODIGOPOSTAL",
				wildcard: "%CODIGOPOSTAL"
			}
		});

		$('#codigo_postal').typeahead({
			highlight: true,
			hint: true,
			minLength: 1
		}, {
			name: 'lista-cp',
			source: cp.ttAdapter(),
			display: 'codigo_postal',
			limit: Infinity,
			templates: {
				empty: '<p class="msj-no-sugerencias">No hubo resultados. Por favor, intentalo nuevamente</p>',
				suggestion: Handlebars.compile("<p class='item-sugerencias'>{{codigo_postal}} - {{ciudad}}</p>")
			}
		});

		$("#sugerencias-cp").on("typeahead:select", function(e, sugerencia) {
			e.preventDefault();
			//$("input[name='pais']").val(sugerencia.pais);
			//$("input[name='estado']").val(sugerencia.estado);
			$("input[name='ciudad']").val(sugerencia.ciudad);
			$("input[name='codigo_postal']").val(sugerencia.codigo_postal);
			$("input[name='direccion']").val("Municipio " + sugerencia.municipio + ", ").focus();
			if (sugerencia.lalo_sup_izq)
				mapa.flyToBounds([sugerencia.lalo_sup_izq, sugerencia.lalo_inf_der]);
		});
	}

	if ($("#sugerencias-ciudad").length > 0) {
		let cp = new Bloodhound({
			datumTokenizer: Bloodhound.tokenizers.obj.whitespace('ciudad'),
			queryTokenizer: Bloodhound.tokenizers.whitespace,
			remote: {
				url: "../../api/busqueda/sugerencias/Ubicacion/?pais=Venezuela&c=%CIUDAD",
				wildcard: "%CIUDAD"
			}
		});

		$('#ciudad').typeahead({
			highlight: true,
			hint: true,
			minLength: 1
		}, {
			name: 'lista-ciudades',
			source: cp.ttAdapter(),
			display: 'ciudad',
			limit: Infinity,
			templates: {
				empty: '<p class="msj-no-sugerencias">No hubo resultados. Por favor, intentalo nuevamente</p>',
				suggestion: Handlebars.compile("<p class='item-sugerencias'>{{ciudad}}</p>")
			}
		});

		$("#sugerencias-ciudad").on("typeahead:select", function(e, sugerencia) {
			e.preventDefault();
			//$("input[name='pais']").val(sugerencia.pais);
			//$("input[name='estado']").val(sugerencia.estado);
			$("input[name='ciudad']").val(sugerencia.ciudad);
			$("input[name='codigo_postal']").val(sugerencia.codigo_postal);
			$("input[name='direccion']").val("Municipio " + sugerencia.municipio + ", ").focus();
			if (sugerencia.lalo_sup_izq)
				mapa.flyToBounds([sugerencia.lalo_sup_izq, sugerencia.lalo_inf_der]);
		});
	}

	if ($("#sugerencias-ps").length > 0) {
		let ps = new Bloodhound({
			datumTokenizer: Bloodhound.tokenizers.obj.whitespace('usuario nombre'),
			queryTokenizer: Bloodhound.tokenizers.whitespace,
			remote: {
				url: "../../api/busqueda/sugerencias/PrestadorServicio/?b=%USUARIO",
				wildcard: "%USUARIO"
			}
		});

		$('#prestador_servicio').typeahead({
			highlight: true,
			hint: true,
			minLength: 2
		}, {
			name: 'lista-ps',
			source: ps.ttAdapter(),
			display: 'usuario',
			limit: Infinity,
			templates: {
				empty: '<p class="msj-no-sugerencias">No hubo resultados. Por favor, intentalo nuevamente</p>',
				suggestion: Handlebars.compile("<p class='item-sugerencias'>{{usuario}} - {{nombre}}</p>")
			}
		});

		$("#prestador_servicio").on("typeahead:select", function(e, sugerencia) {
			e.preventDefault();
		});
	}



	/* ------------------ GRAFICAS --------------- */

	if($("#visitas-totales").length>0) {
		axios.get("api/resportes/")
			.then(function(res){
				
			})
			.catch(function(error){

			})
	}

	if($("#dashboard-favoritos").length>0) {
		$("#dashboard-favoritos td[data-url]").each(
			function(a,b,c){
				axios.get("/api/favoritos"+$(b).data("url"), configuracion)
					.then((res) => {
						$(this).html("Es el favorito de " + res.data.value + " persona(s)");
					})
					.catch((error) => {
						console.log(error);
					})
				//$("#dashboard-favoritos td[data-url]")[0].getAttribute("data-url")
			}
		)
	}


	/* xHACER: 

	$('#eliminar-solicitud-ps').click(function() {
		let tipo_entidad_url;
		switch (this) {
			case "Evento":
				tipo_entidad_url = "Evento";
				break;
			case "Experiencia":
				tipo_entidad_url = "Experiencia";
				break;
			case "SDI":
				tipo_entidad_url = "SDI";
				break;
			case "Alojamiento":
				tipo_entidad_url = "Alojamiento";
				break;
			case "Gastronomia":
				tipo_entidad_url = "Gastronomia";
				break;
		}
		axios.delete('../../api/' + tipo_entidad_url + '/' + table.row('.selected').url + '/eliminar', configuracion)
			.then(function(res) {
				if (res.data.status != 204) {

				} else {
					table.row('.selected').remove().draw(false);
				}
			})
			.catch(function(error) {
				console.log(error);
			})
	});*/

	/*
		remove.owl.carousel
		Type: triggerable 
		Parameter: position 
		Removes an item from a given position.
	*/

});