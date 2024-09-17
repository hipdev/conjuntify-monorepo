import { mutation, query } from './_generated/server'
import { v } from 'convex/values'
import { ConvexError } from 'convex/values'
import { getAuthUserId } from '@convex-dev/auth/server'

export const getUserReservations = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw new ConvexError('Usuario no autenticado')
    }

    const reservations = await ctx.db
      .query('reservations')
      .withIndex('by_user_and_status', (q) => q.eq('userId', userId))
      .order('desc')
      .collect()

    const reservationsWithDetails = await Promise.all(
      reservations.map(async (reservation) => {
        const commonArea = await ctx.db.get(reservation.commonAreaId)
        return { ...reservation, commonArea }
      })
    )

    return reservationsWithDetails
  }
})

export const createReservation = mutation({
  args: {
    commonAreaId: v.id('commonAreas'),
    condoUnitId: v.id('condoUnits'),
    numberOfPeople: v.number(),
    reservationTime: v.number()
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw new ConvexError('Usuario no autenticado')
    }

    // Verificar disponibilidad del área común
    const commonArea = await ctx.db.get(args.commonAreaId)
    if (!commonArea || !commonArea.isAvailable) {
      throw new ConvexError('El área común no está disponible')
    }

    // Verificar que el número de personas no exceda la capacidad restante
    if (args.numberOfPeople > (commonArea.remainingCapacity || 0)) {
      throw new ConvexError('No hay suficiente capacidad disponible')
    }

    // Calcular la nueva capacidad restante
    const newRemainingCapacity = (commonArea.remainingCapacity || 0) - args.numberOfPeople

    // Crear la reserva
    const reservationId = await ctx.db.insert('reservations', {
      commonAreaId: args.commonAreaId,
      condoUnitId: args.condoUnitId,
      numberOfPeople: args.numberOfPeople,
      reservationTime: args.reservationTime,
      status: 'pending',
      userId
    })

    // Actualizar la capacidad restante del área común
    await ctx.db.patch(args.commonAreaId, {
      remainingCapacity: newRemainingCapacity,
      isAvailable: newRemainingCapacity === 0 ? false : true
    })

    return reservationId
  }
})

export const deleteReservation = mutation({
  args: { reservationId: v.id('reservations') },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw new ConvexError('Usuario no autenticado')
    }

    const reservation = await ctx.db.get(args.reservationId)
    if (!reservation) {
      throw new ConvexError('Reserva no encontrada')
    }

    if (reservation.userId !== userId) {
      throw new ConvexError('No tienes permiso para eliminar esta reserva')
    }

    const now = Date.now()
    if (reservation.reservationTime <= now) {
      throw new ConvexError('No se puede eliminar una reserva pasada o en curso')
    }

    // Actualizar la capacidad del área común
    const commonArea = await ctx.db.get(reservation.commonAreaId)
    if (commonArea) {
      const newRemainingCapacity = (commonArea.remainingCapacity || 0) + reservation.numberOfPeople
      await ctx.db.patch(reservation.commonAreaId, {
        remainingCapacity: newRemainingCapacity,
        isAvailable: true // Siempre se vuelve a true al liberar capacidad
      })
    }

    // Eliminar la reserva
    await ctx.db.delete(args.reservationId)

    return { success: true }
  }
})
