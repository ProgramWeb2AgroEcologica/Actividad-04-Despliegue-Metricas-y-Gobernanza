from flask import g, jsonify, request
from flask_smorest import Blueprint
from app.tareas.schemas import (
    CrearTareaSchema,
    ActualizarTareaSchema,
    TareaResponseSchema,
    EliminarTareaResponseSchema
)
from app.auth.schemas import MensajeRespuestaSchema
from app.auth.jwt_utils import token_required
from app.tareas.db import get_task_repository

tareas_bp = Blueprint(
    "tareas",
    __name__,
    url_prefix="/api/tareas",
    description="Gesti?n de tareas y publicaciones (CRUD) protegidas por JWT, Privacidad y Control de Acceso (RBAC)"
)


@tareas_bp.route("", methods=["GET"])
@token_required
@tareas_bp.doc(security=[{"BearerAuth": []}])
@tareas_bp.response(200, TareaResponseSchema(many=True))
def listar_tareas():
    """
    Lista ?nicamente las tareas o publicaciones pertenecientes al usuario autenticado.
    Demuestra la privacidad y aislamiento de datos:
    SELECT * FROM tareas WHERE auth.uid() = user_id;
    """
    user_id = g.current_user["id"]
    token = g.current_user.get("raw_token")
    repo = get_task_repository(user_token=token)

    tareas = repo.listar_del_usuario(user_id)
    return tareas, 200


@tareas_bp.route("", methods=["POST"])
@token_required
@tareas_bp.doc(security=[{"BearerAuth": []}])
@tareas_bp.arguments(CrearTareaSchema)
@tareas_bp.response(201, TareaResponseSchema)
def crear_tarea(datos):
    """
    Crea una nueva tarea vinculada al usuario autenticado.
    El campo user_id se asigna de forma segura a partir del JWT verificado (auth.uid()).
    """
    user_id = g.current_user["id"]
    token = g.current_user.get("raw_token")
    repo = get_task_repository(user_token=token)

    nueva_tarea = repo.crear(
        user_id=user_id,
        titulo=datos["titulo"],
        descripcion=datos.get("descripcion", ""),
        completada=datos.get("completada", False)
    )
    return nueva_tarea, 201


@tareas_bp.route("/<string:tarea_id>", methods=["GET"])
@token_required
@tareas_bp.doc(security=[{"BearerAuth": []}])
@tareas_bp.response(200, TareaResponseSchema)
@tareas_bp.alt_response(403, schema=MensajeRespuestaSchema, description="Acceso denegado: el recurso pertenece a otro usuario")
@tareas_bp.alt_response(404, schema=MensajeRespuestaSchema, description="Tarea no encontrada en el sistema")
def obtener_tarea(tarea_id):
    """
    Obtiene una tarea espec?fica por su ID.
    Seguridad, Privacidad y RBAC:
    - Si la tarea no existe: Retorna 404 (Not Found).
    - Si la tarea pertenece a otro usuario y el usuario no tiene rol administrador:
      Deniega el acceso retornando 403 (Forbidden).
    - Si es el creador/due?o o administrador: Retorna 200 (OK).
    """
    user_id = g.current_user["id"]
    rol = str(g.current_user.get("rol", "")).lower()
    es_admin = (rol == "administrador")
    token = g.current_user.get("raw_token")
    repo = get_task_repository(user_token=token)

    tarea, estado = repo.obtener_por_id_con_autorizacion(tarea_id, user_id, es_admin=es_admin)
    if estado == "NOT_FOUND":
        return jsonify({
            "mensaje": f"Tarea con ID '{tarea_id}' no encontrada en el sistema",
            "error": "Not Found"
        }), 404
    elif estado == "FORBIDDEN":
        return jsonify({
            "mensaje": f"Acceso denegado (403 Forbidden): No tienes permisos para acceder a esta tarea porque pertenece a otro usuario.",
            "error": "Forbidden"
        }), 403

    return tarea, 200


@tareas_bp.route("/<string:tarea_id>", methods=["PATCH"])
@token_required
@tareas_bp.doc(security=[{"BearerAuth": []}])
@tareas_bp.arguments(ActualizarTareaSchema)
@tareas_bp.response(200, TareaResponseSchema)
@tareas_bp.alt_response(403, schema=MensajeRespuestaSchema, description="Acceso denegado: el recurso pertenece a otro usuario")
@tareas_bp.alt_response(404, schema=MensajeRespuestaSchema, description="Tarea no encontrada")
def actualizar_tarea(datos, tarea_id):
    """
    Actualiza parcialmente una tarea (PATCH).
    Solo el propietario o un administrador tienen autorizaci?n para modificarla.
    Si pertenece a otro usuario, responde 403 Forbidden.
    """
    user_id = g.current_user["id"]
    rol = str(g.current_user.get("rol", "")).lower()
    es_admin = (rol == "administrador")
    token = g.current_user.get("raw_token")
    repo = get_task_repository(user_token=token)

    tarea_actualizada, estado = repo.actualizar_con_autorizacion(tarea_id, user_id, datos, es_admin=es_admin)
    if estado == "NOT_FOUND":
        return jsonify({
            "mensaje": f"Tarea con ID '{tarea_id}' no encontrada",
            "error": "Not Found"
        }), 404
    elif estado == "FORBIDDEN":
        return jsonify({
            "mensaje": f"Acceso denegado (403 Forbidden): No tienes permisos para modificar esta tarea ajena.",
            "error": "Forbidden"
        }), 403

    return tarea_actualizada, 200


@tareas_bp.route("/<string:tarea_id>", methods=["DELETE"])
@token_required
@tareas_bp.doc(security=[{"BearerAuth": []}])
@tareas_bp.response(200, EliminarTareaResponseSchema)
@tareas_bp.alt_response(403, schema=MensajeRespuestaSchema, description="Acceso denegado: el recurso pertenece a otro usuario")
@tareas_bp.alt_response(404, schema=MensajeRespuestaSchema, description="Tarea no encontrada")
def eliminar_tarea(tarea_id):
    """
    Elimina una tarea propia. Si un usuario intenta eliminar una tarea ajena, recibe 403 Forbidden.
    """
    user_id = g.current_user["id"]
    rol = str(g.current_user.get("rol", "")).lower()
    es_admin = (rol == "administrador")
    token = g.current_user.get("raw_token")
    repo = get_task_repository(user_token=token)

    exito, estado = repo.eliminar_con_autorizacion(tarea_id, user_id, es_admin=es_admin)
    if estado == "NOT_FOUND":
        return jsonify({
            "mensaje": f"Tarea con ID '{tarea_id}' no encontrada",
            "error": "Not Found"
        }), 404
    elif estado == "FORBIDDEN":
        return jsonify({
            "mensaje": f"Acceso denegado (403 Forbidden): No tienes permisos para eliminar esta tarea ajena.",
            "error": "Forbidden"
        }), 403

    return {
        "mensaje": "Tarea eliminada exitosamente",
        "id": str(tarea_id)
    }, 200
