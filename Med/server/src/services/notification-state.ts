/**
 * Estado compartido en memoria para las notificaciones del cron.
 *
 * Guarda los IDs de recordatorios que ya fueron notificados en la sesión
 * actual del servidor, para evitar reenviar la misma notificación dentro de
 * la ventana de 5 minutos del cron.
 *
 * Se exporta desde un módulo aparte para que otros controladores (por ejemplo
 * "posponer recordatorio") puedan eliminar un ID y forzar que el cron lo
 * vuelva a notificar a la nueva hora programada.
 */
export const notifiedReminderIds = new Set<string>();
