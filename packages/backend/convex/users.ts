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
    const user = await ctx.db.get(userId)

    return await ctx.db.get(userId)
  }
})

export const updateUserName = mutation({
  args: {
    name: v.string()
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)

    if (userId === null) {
      return null
    }
    return await ctx.db.patch(userId, { name: args.name })
  }
})

export const createCondoApplication = mutation({
  args: {
    name: v.string(),
    floorNumber: v.string(),
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
        error: 'Condo not found'
      }
    }

    // create temporal application

    const applicationId = await ctx.db.insert('condoTemporalUnitUsers', {
      name: args.name,
      floorNumber: args.floorNumber,
      condoId: condoId._id,
      userId: userId,
      unitNumber: args.unitNumber,
      buildingNumber: args.buildingNumber,
      phone: args.phone,
      withWhatsapp: args.withWhatsapp,
      isOwner: args.isOwner,
      idn: args.idn,
      propertyRegistration: args.propertyRegistration
    })
  }
})
