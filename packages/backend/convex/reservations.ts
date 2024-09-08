import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";

// Función auxiliar para verificar si la reserva está dentro del horario permitido
function isWithinAllowedSchedule(
  schedule: any,
  startTime: number,
  endTime: number
): boolean {
  const startDate = new Date(startTime);
  const endDate = new Date(endTime);
  const dayOfWeek = startDate.getDay();
  const daySchedule = schedule[dayOfWeek];

  const [scheduleStartHour, scheduleStartMinute] = daySchedule.startTime
    .split(":")
    .map(Number);
  const [scheduleEndHour, scheduleEndMinute] = daySchedule.endTime
    .split(":")
    .map(Number);

  const scheduleStart = new Date(startDate).setHours(
    scheduleStartHour,
    scheduleStartMinute,
    0,
    0
  );
  const scheduleEnd = new Date(startDate).setHours(
    scheduleEndHour,
    scheduleEndMinute,
    0,
    0
  );

  return startTime >= scheduleStart && endTime <= scheduleEnd;
}

// Funciones auxiliares para obtener el inicio y fin del día
function startOfDay(timestamp: number): number {
  const date = new Date(timestamp);
  return date.setHours(0, 0, 0, 0);
}

function endOfDay(timestamp: number): number {
  const date = new Date(timestamp);
  return date.setHours(23, 59, 59, 999);
}

// Mutación para crear una reserva
export const createReservation = mutation({
  args: {
    userId: v.id("users"),
    condoUnitId: v.id("condoUnits"),
    commonAreaId: v.id("commonAreas"),
    startTime: v.number(),
    endTime: v.number(),
    numberOfPeople: v.number(),
  },
  handler: async (ctx, args) => {
    // 1. Obtener el área comunitaria
    const communityArea = await ctx.db.get(args.commonAreaId);
    if (!communityArea) {
      throw new ConvexError("Área comunitaria no encontrada");
    }

    // 2. Verificar si la reserva está dentro del horario permitido
    if (
      !isWithinAllowedSchedule(
        communityArea.schedule,
        args.startTime,
        args.endTime
      )
    ) {
      throw new ConvexError("La reserva está fuera del horario permitido");
    }

    // 3. Verificar la cuota de reserva de la unidad
    const unitQuota = await ctx.db
      .query("unitReservationQuotas")
      .filter((q) =>
        q.and(
          q.eq(q.field("condoUnitId"), args.condoUnitId),
          q.eq(q.field("commonAreaId"), args.commonAreaId)
        )
      )
      .first();

    if (!unitQuota) {
      throw new ConvexError(
        "No se encontró la cuota de reserva para esta unidad y área"
      );
    }

    // 4. Verificar si el número de personas excede la cuota máxima por reserva de la unidad
    if (args.numberOfPeople > unitQuota.maxQuotaPerReservation) {
      throw new ConvexError(
        `El número de personas excede la cuota máxima por reserva de ${unitQuota.maxQuotaPerReservation}`
      );
    }

    // 5. Verificar la capacidad disponible del área común
    const overlappingReservations = await ctx.db
      .query("reservations")
      .filter((q) =>
        q.and(
          q.eq(q.field("commonAreaId"), args.commonAreaId),
          q.lt(q.field("startTime"), args.endTime),
          q.gt(q.field("endTime"), args.startTime)
        )
      )
      .collect();

    const totalPeopleInOverlappingReservations = overlappingReservations.reduce(
      (sum, reservation) => sum + reservation.numberOfPeople,
      0
    );

    if (
      totalPeopleInOverlappingReservations + args.numberOfPeople >
      communityArea.maxCapacity
    ) {
      throw new ConvexError(
        "No hay suficiente capacidad disponible en el área común para esta reserva"
      );
    }

    // 6. Verificar si la unidad ha excedido su cuota diaria
    const existingReservations = await ctx.db
      .query("reservations")
      .filter((q) =>
        q.and(
          q.eq(q.field("condoUnitId"), args.condoUnitId),
          q.eq(q.field("commonAreaId"), args.commonAreaId),
          q.gte(q.field("startTime"), startOfDay(args.startTime)),
          q.lt(q.field("startTime"), endOfDay(args.startTime))
        )
      )
      .collect();

    const totalPeopleInExistingReservations = existingReservations.reduce(
      (sum, reservation) => sum + reservation.numberOfPeople,
      0
    );

    if (
      totalPeopleInExistingReservations + args.numberOfPeople >
      unitQuota.maxQuotaPerReservation
    ) {
      throw new ConvexError(
        "La unidad ha alcanzado su cuota máxima de reservas para este día"
      );
    }

    // 7. Crear la reserva si todas las validaciones pasan
    const reservationId = await ctx.db.insert("reservations", {
      userId: args.userId,
      condoUnitId: args.condoUnitId,
      commonAreaId: args.commonAreaId,
      startTime: args.startTime,
      endTime: args.endTime,
      numberOfPeople: args.numberOfPeople,
      status: "pending",
      notificationSent: false,
    });

    return reservationId;
  },
});

// Mutación para actualizar el estado de una reserva
export const updateReservationStatus = mutation({
  args: {
    reservationId: v.id("reservations"),
    status: v.union(v.literal("confirmed"), v.literal("cancelled")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.reservationId, { status: args.status });
  },
});

// Query para obtener reservas próximas
export const getUpcomingReservations = query({
  handler: async (ctx) => {
    const now = Date.now();
    const oneHourFromNow = now + 60 * 60 * 1000;
    return await ctx.db
      .query("reservations")
      .filter((q) =>
        q.and(
          q.gt(q.field("startTime"), now),
          q.lte(q.field("startTime"), oneHourFromNow),
          q.eq(q.field("status"), "pending")
        )
      )
      .collect();
  },
});
