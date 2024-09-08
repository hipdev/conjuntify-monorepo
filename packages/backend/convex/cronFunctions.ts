import { internalMutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Función para procesar reservas (será llamada por el cron job)
export const processReservations = internalMutation({
  handler: async (ctx) => {
    const now = Date.now();
    const oneHourFromNow = now + 60 * 60 * 1000;

    const upcomingReservations = await ctx.db
      .query("reservations")
      .filter((q) =>
        q.and(
          q.gt(q.field("startTime"), now),
          q.lte(q.field("startTime"), oneHourFromNow),
          q.eq(q.field("status"), "pending"),
          q.eq(q.field("notificationSent"), false)
        )
      )
      .collect();

    for (const reservation of upcomingReservations) {
      if (
        reservation.startTime - now <= 60 * 60 * 1000 &&
        reservation.startTime - now > 59 * 60 * 1000
      ) {
        const areaName = await getAreaName(ctx, reservation);

        await createNotificationAndUpdateCounter(
          ctx,
          reservation.userId,
          "reservationReminder",
          `Tu reserva de ${areaName} es en 1 hora. Por favor confirma.`,
          reservation._id
        );
        // Marcar la notificación como enviada
        await ctx.db.patch(reservation._id, { notificationSent: true });
      }
    }
  },
});

// Función auxiliar para crear notificaciones
async function createNotificationAndUpdateCounter(
  ctx: any,
  userId: Id<"users">,
  type:
    | "reservationReminder"
    | "reservationConfirmation"
    | "reservationInvalidation",
  message: string,
  reservationId: Id<"reservations">
) {
  await ctx.db.insert("notifications", {
    userId,
    type,
    message,
    reservationId,
    createdAt: Date.now(),
  });

  // Incrementar el contador de notificaciones no leídas del usuario
  const user = await ctx.db.get(userId);
  await ctx.db.patch(userId, {
    unreadNotificationsCount: (user || 0) + 1,
  });
}

async function getAreaName(ctx: any, reservation: any) {
  if (reservation.commonAreaId) {
    const commonArea = await ctx.db.get(reservation.commonAreaId);
    return commonArea.name;
  } else if (reservation.socialRoomId) {
    const socialRoom = await ctx.db.get(reservation.socialRoomId);
    return socialRoom.name;
  }
  return "área común";
}

// Mutación para invalidar reservas no confirmadas en menos de 30 minutos (será llamada por el cron job)
export const invalidateUnconfirmedReservations = internalMutation({
  handler: async (ctx) => {
    const now = Date.now();
    const thirtyMinutesFromNow = now + 30 * 60 * 1000;

    const unconfirmedReservations = await ctx.db
      .query("reservations")
      .filter((q) =>
        q.and(
          q.gt(q.field("startTime"), now),
          q.lte(q.field("startTime"), thirtyMinutesFromNow),
          q.eq(q.field("status"), "pending")
        )
      )
      .collect();

    for (const reservation of unconfirmedReservations) {
      await ctx.db.patch(reservation._id, { status: "noShow" });
      const areaName = await getAreaName(ctx, reservation);
      await createNotificationAndUpdateCounter(
        ctx,
        reservation.userId,
        "reservationInvalidation",
        `Tu reserva de ${areaName} ha sido invalidada por falta de confirmación.`,
        reservation._id
      );
    }
  },
});
