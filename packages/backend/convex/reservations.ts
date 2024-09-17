import { mutation } from './_generated/server'
import { v } from 'convex/values'
import { ConvexError } from 'convex/values'
import { getAuthUserId } from '@convex-dev/auth/server'

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
      remainingCapacity: (commonArea.remainingCapacity || 0) - args.numberOfPeople
    })

    return reservationId
  }
})
