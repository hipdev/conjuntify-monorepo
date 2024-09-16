import { ConvexError, v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { getAuthUserId } from '@convex-dev/auth/server'
import { Id } from './_generated/dataModel'

export const createUnitAndAssign = mutation({
  args: {
    buildingNumber: v.optional(v.string()),
    condoId: v.id('condos'),
    isOwner: v.boolean(),
    phone: v.optional(v.string()),
    propertyType: v.union(v.literal('apartment'), v.literal('house')),
    temporalUnitId: v.id('condoTemporalUnitUsers'),
    unitNumber: v.string(),
    userId: v.id('users') // The user that wants to be the owner or tenant of the unit
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
      // Ensure the condo is not already in the user's condos array
      const userCondos = user.condos || []
      const updatedCondos = userCondos.includes(args.condoId)
        ? userCondos
        : [...userCondos, args.condoId]

      await ctx.db.patch(args.userId, {
        ...(args.isOwner ? { isOwner: true } : { isTenant: true }),
        condos: updatedCondos
      })
    }

    // Add the reference table
    await ctx.db.insert('condoUnitUsers', {
      condoUnitId: unitId,
      userId: args.userId,
      isOwner: args.isOwner,
      isTenant: !args.isOwner
    })

    // Actualizar el status de condoTemporalUnitUsers
    await ctx.db.patch(args.temporalUnitId, {
      status: 'approved'
    })

    return unitId
  }
})

export const getCondoUnits = query({
  args: { condoId: v.id('condos') },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)

    if (!userId) {
      throw new ConvexError('Usuario no autenticado')
    }

    const condo = await ctx.db.get(args.condoId)
    if (!condo) {
      throw new ConvexError('Condominio no encontrado')
    }

    if (!condo.admins.includes(userId)) {
      throw new ConvexError('No tienes permiso para ver las unidades de este condominio')
    }

    const units = await ctx.db
      .query('condoUnits')
      .filter((q) => q.eq(q.field('condoId'), args.condoId))
      .collect()

    const unitsWithUsers = await Promise.all(
      units.map(async (unit) => {
        const owners = await Promise.all(
          (unit.owners || []).map(async (ownerId: Id<'users'>) => {
            const owner = await ctx.db.get(ownerId)
            return owner ? { id: ownerId, name: owner.name, phone: owner.phone } : null
          })
        )

        const tenants = await Promise.all(
          (unit.tenants || []).map(async (tenantId: Id<'users'>) => {
            const tenant = await ctx.db.get(tenantId)
            return tenant ? { id: tenantId, name: tenant.name, phone: tenant.phone } : null
          })
        )

        return {
          ...unit,
          owners: owners.filter((owner) => owner !== null),
          tenants: tenants.filter((tenant) => tenant !== null)
        }
      })
    )

    return unitsWithUsers
  }
})
