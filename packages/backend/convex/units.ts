import { ConvexError, v } from 'convex/values'
import { mutation } from './_generated/server'
import { getAuthUserId } from '@convex-dev/auth/server'

export const createUnitAndAssign = mutation({
  args: {
    buildingNumber: v.optional(v.string()),
    condoId: v.id('condos'),
    isOwner: v.boolean(),
    phone: v.optional(v.string()),
    propertyType: v.union(v.literal('apartment'), v.literal('house')),
    temporalUnitId: v.id('condoTemporalUnitUsers'),
    unitNumber: v.string(),
    userId: v.id('users')
  },
  handler: async (ctx, args) => {
    // Verificar si el usuario está autenticado y es un administrador del condominio
    const authUserId = await getAuthUserId(ctx)
    if (!authUserId) {
      throw new ConvexError('Usuario no autenticado')
    }

    const condo = await ctx.db.get(args.condoId)
    if (!condo || !condo.admins.includes(authUserId)) {
      throw new ConvexError('No tienes permiso para crear unidades en este condominio')
    }

    // Verificar si ya existe una unidad con el mismo número en este condominio
    const existingUnit = await ctx.db
      .query('condoUnits')
      .filter((q) => q.eq(q.field('condoId'), args.condoId))
      .filter((q) => q.eq(q.field('unitNumber'), args.unitNumber))
      .first()

    if (existingUnit) {
      throw new ConvexError('Ya existe una unidad con este número en el condominio')
    }

    const tenantOrOwner = args.isOwner
      ? {
          owners: [args.userId]
        }
      : {
          tenants: [args.userId],
          isRented: true
        }

    // Crear la nueva unidad
    const unitId = await ctx.db.insert('condoUnits', {
      condoId: args.condoId,
      propertyType: args.propertyType,
      unitNumber: args.unitNumber,
      buildingNumber: args.buildingNumber,
      phone: args.phone || undefined,
      ...tenantOrOwner
    })

    // Actualizar el usuario
    const user = await ctx.db.get(args.userId)
    if (user) {
      await ctx.db.patch(args.userId, {
        ...(args.isOwner ? { isOwner: true } : { isTenant: true })
      })
    }

    // Actualizar el status de condoTemporalUnitUsers
    await ctx.db.patch(args.temporalUnitId, {
      status: 'approved'
    })

    return unitId
  }
})
