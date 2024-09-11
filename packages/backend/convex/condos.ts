import { getAuthUserId } from '@convex-dev/auth/server'
import { mutation } from './_generated/server'
import { v } from 'convex/values'
import { ConvexError } from 'convex/values'

export const createCondo = mutation({
  args: {
    name: v.string(),
    address: v.string(),
    city: v.string(),
    state: v.string(),
    country: v.string(),
    zipCode: v.string(),
    type: v.union(v.literal('houses'), v.literal('apartments')),
    numberUnits: v.optional(v.number()),
    amenities: v.array(v.string()),
    uniqueCode: v.string()
  },
  handler: async (ctx, args) => {
    // Check if the user exists and is an admin
    const userId = await getAuthUserId(ctx)

    if (!userId) {
      throw new ConvexError('User not found or not authorized as admin')
    }

    const user = await ctx.db.get(userId)

    if (!user) {
      throw new ConvexError('User not found or not authorized as admin')
    }

    // Check if a condo with the same uniqueCode already exists
    const existingCondo = await ctx.db
      .query('condos')
      .filter((q) => q.eq(q.field('uniqueCode'), args.uniqueCode))
      .first()

    if (existingCondo) {
      throw new ConvexError('Ya existe un condominio con este código único')
    }

    // Create the new condo
    const condoId = await ctx.db.insert('condos', {
      name: args.name,
      address: args.address,
      city: args.city,
      state: args.state,
      country: args.country,
      zipCode: args.zipCode,
      type: args.type,
      numberUnits: args.numberUnits,
      amenities: args.amenities,
      uniqueCode: args.uniqueCode,
      admins: [userId],
      isActive: true
    })

    console.log('condoId  response', condoId)

    // Update the user's condos array
    const condos = user?.condos || []

    await ctx.db.patch(userId, {
      condos: [...condos, condoId]
    })

    return condoId
  }
})
