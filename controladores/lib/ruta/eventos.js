 const { Router } = require('express'),
     ControladorEventos = require('../../eventos'),
     Autenticar = require('../autenticacion'),
     Autorizar = require('../autorizacion');


 module.exports = class RutasEventos {

     constructor() {
         this._manejador_peticiones = Router();
         this._Autorizar = new Autorizar();
         this._Autenticar = new Autenticar();
         this._ctrlEventos = new ControladorEventos();
     }


     urls() {

         this._manejador_peticiones.all('*', (req, res, next) => this._Autorizar.sin_acceso_API(req, next));

         this._manejador_peticiones.get('/agregar',
             (req, res, next) => this._Autorizar.a_usuarios(["PrestadorServicio", "Administrador"], req, next),
             (req, res, next) => this._ctrlEventos.agregar_GET(req, res, next)
         );
         this._manejador_peticiones.post('/agregar',
             (req, res, next) => this._Autorizar.a_usuarios(["PrestadorServicio", "Administrador"], req, next),
             (req, res, next) => this._ctrlEventos.agregar_POST(req, res, next)
         );


         this._manejador_peticiones.get('/listado',
             (req, res, next) => this._Autorizar.a_usuarios(["PrestadorServicio", "Administrador"], req, next),
             (req, res, next) => this._ctrlEventos.listado(req, res, next)
         );
         this._manejador_peticiones.get('/:url',
             (req, res, next) => this._ctrlEventos.visualizar(req, res, next)
         );


         this._manejador_peticiones.get('/:url/editar',
             (req, res, next) => this._Autorizar.como_admin_o_para_recurso_propio(req, next),
             (req, res, next) => this._ctrlEventos.editar_GET(req, res, next)
         );
         this._manejador_peticiones.post('/:url/editar',
             (req, res, next) => this._Autorizar.como_admin_o_para_recurso_propio(req, next),
             (req, res, next) => this._ctrlEventos.editar(req, res, next)
         );


         this._manejador_peticiones.get('/:url/eliminar',
             (req, res, next) => this._Autorizar.como_admin_o_para_recurso_propio(req, next),
             (req, res, next) => this._ctrlEventos.eliminar_GET(req, res, next)
         );
         this._manejador_peticiones.post('/:url/eliminar',
             (req, res, next) => this._Autorizar.como_admin_o_para_recurso_propio(req, next),
             (req, res, next) => this._ctrlEventos.eliminar(req, res, next)
         );


         return this._manejador_peticiones;
     }


     urls_api() {

         this._manejador_peticiones.post('/agregar',
             (req, res, next) => this._Autenticar.usuario(req, next),
             (req, res, next) => this._Autorizar.a_usuarios(["PrestadorServicio", "Administrador"], req, next),
             (req, res, next) => this._ctrlEventos.agregar_POST(req, res, next)
         );


         this._manejador_peticiones.get('/listado',
             (req, res, next) => this._Autenticar.usuario(req, next),
             (req, res, next) => this._Autorizar.a_usuarios(["PrestadorServicio", "Administrador"], req, next),
             (req, res, next) => this._ctrlEventos.listado(req, res, next)
         );


         this._manejador_peticiones.get('/:url',
             (req, res, next) => this._ctrlEventos.visualizar(req, res, next)
         );

         this._manejador_peticiones.put('/:url/editar',
             (req, res, next) => this._Autenticar.usuario(req, next),
             (req, res, next) => this._Autorizar.como_admin_o_para_recurso_propio(req, next),
             (req, res, next) => this._ctrlEventos.editar(req, res, next)
         );


         this._manejador_peticiones.delete('/:url/eliminar',
             (req, res, next) => this._Autenticar.usuario(req, next),
             (req, res, next) => this._Autorizar.como_admin_o_para_recurso_propio(req, next),
             (req, res, next) => this._ctrlEventos.eliminar(req, res, next)
         );

         this._manejador_peticiones.get('/:url/:respuesta',
             (req, res, next) => this._ctrlEventos.responder_solicitud(req, res, next)
         );


         return this._manejador_peticiones;
     }

 }