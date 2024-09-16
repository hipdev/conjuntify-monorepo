import { getAuthUserId } from '@convex-dev/auth/server'
import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (userId === null) {
      return null
    }

    return await ctx.db.get(userId)
  }
})

export const updateUserName = mutation({
  args: {
    name: v.string(),
    lastName: v.string()
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)

    if (userId === null) {
      return null
    }
    return await ctx.db.patch(userId, { name: args.name, lastName: args.lastName })
  }
})

export const createCondoApplication = mutation({
  args: {
    name: v.string(),
    uniqueCode: v.string(),
    unitNumber: v.string(),
    buildingNumber: v.string(),
    phone: v.string(),
    withWhatsapp: v.optional(v.boolean()),
    isOwner: v.optional(v.boolean()),
    idn: v.optional(v.string()),
    propertyRegistration: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)

    if (userId === null) {
      return null
    }

    // get condoId from uniqueCode
    const condoId = await ctx.db
      .query('condos')
      .filter((q) => q.eq(q.field('uniqueCode'), args.uniqueCode))
      .first()

    if (!condoId) {
      return {
        error: 'Código no encontrado'
      }
    }

    // Verify if the user already has an application for this condo
    const application = await ctx.db
      .query('condoTemporalUnitUsers')
      .filter((q) => q.eq(q.field('userId'), userId))
      .filter((q) => q.eq(q.field('condoId'), condoId._id))
      .first()

    if (application) {
      return {
        error: 'Ya existe una solicitud pendiente'
      }
    }
    // create temporal application

    const applicationId = await ctx.db.insert('condoTemporalUnitUsers', {
      name: args.name,
      condoId: condoId._id,
      userId: userId,
      unitNumber: args.unitNumber,
      buildingNumber: args.buildingNumber,
      phone: args.phone,
      withWhatsapp: args.withWhatsapp,
      isOwner: args.isOwner,
      isTenant: args.isOwner ? false : true,
      idn: args.idn,
      propertyRegistration: args.propertyRegistration,
      status: 'pending'
    })

    return {
      applicationId,
      error: null
    }
  }
})

export const updateUser = mutation({
  args: {
    name: v.optional(v.string()),
    lastName: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (userId === null) {
      throw new Error('No estás autenticado')
    }

    const updates: { name?: string; lastName?: string } = {}
    if (args.name !== undefined) updates.name = args.name
    if (args.lastName !== undefined) updates.lastName = args.lastName

    return await ctx.db.patch(userId, updates)
  }
})

// Obtener solicitudes pendientes de un usuario para un condominio y una propiedad
export const getPendingRequests = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (userId === null) {
      throw new Error('No estás autenticado')
    }

    const pendingRequests = await ctx.db
      .query('condoTemporalUnitUsers')
      .filter((q) => q.eq(q.field('userId'), userId))
      .filter((q) => q.eq(q.field('status'), 'pending'))
      .collect()

    return pendingRequests
  }
})
