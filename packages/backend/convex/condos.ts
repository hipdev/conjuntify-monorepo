import { getAuthUserId } from '@convex-dev/auth/server'
import { mutation, query } from './_generated/server'
import { v } from 'convex/values'
import { ConvexError } from 'convex/values'

import { filter } from 'convex-helpers/server/filter'
import { Id } from './_generated/dataModel'

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
    uniqueCode: v.string(),
    phone: v.optional(v.string())
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
      isActive: true,
      phone: args.phone
    })

    // Update the user's condos array
    const condos = user?.condos || []

    await ctx.db.patch(userId, {
      condos: [...condos, condoId]
    })

    return condoId
  }
})

export const updateCondo = mutation({
  args: {
    id: v.id('condos'),
    name: v.string(),
    address: v.string(),
    city: v.string(),
    state: v.string(),
    country: v.string(),
    zipCode: v.string(),
    type: v.union(v.literal('houses'), v.literal('apartments')),
    numberUnits: v.optional(v.number()),
    amenities: v.array(v.string()),
    uniqueCode: v.string(),
    phone: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    // Verificar si el usuario está autenticado y es un administrador
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw new ConvexError('Usuario no autenticado')
    }

    // Obtener el condominio existente
    const existingCondo = await ctx.db.get(args.id)
    if (!existingCondo) {
      throw new ConvexError('Condominio no encontrado')
    }

    // Verificar si el usuario es un administrador del condominio
    if (!existingCondo.admins.includes(userId)) {
      throw new ConvexError('No tienes permiso para actualizar este condominio')
    }

    // Verificar si el código único ha cambiado y si ya existe
    if (args.uniqueCode !== existingCondo.uniqueCode) {
      const condoWithSameCode = await ctx.db
        .query('condos')
        .filter((q) => q.eq(q.field('uniqueCode'), args.uniqueCode))
        .first()
      if (condoWithSameCode) {
        throw new ConvexError('Ya existe un condominio con este código único')
      }
    }

    // Actualizar el condominio
    await ctx.db.patch(args.id, {
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
      phone: args.phone
    })

    return args.id
  }
})

export const getCondo = query({
  args: { id: v.id('condos') },
  handler: async (ctx, args) => {
    // Check if the user exists, later it will be checked if the user is an admin
    const userId = await getAuthUserId(ctx)

    if (!userId) {
      console.error('User not found')

      return null
    }

    const condo = await ctx.db.get(args.id)

    if (!condo) {
      console.error('Condo not found')
      return null
    }

    return condo
  }
})

export const getCondosByUserId = query({
  handler: async (ctx, args) => {
    // Check if the user exists
    const userId = await getAuthUserId(ctx)

    if (!userId) {
      console.error('User not found')

      return null
    }

    const user = await ctx.db.get(userId)

    if (!user) {
      console.error('User not found')

      return null
    }

    // Get the condos of the user
    const condos = await filter(
      ctx.db.query('condos'),
      (condo) => condo.admins.includes(userId) ?? false
    ).collect()

    return condos
  }
})

// Get condo temporal users

export const getCondoTemporalUsers = query({
  args: { condoId: v.id('condos') },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)

    if (!userId) {
      console.error('User not found')

      return null
    }

    const user = await ctx.db.get(userId)

    if (!user) {
      console.error('User not found')

      return null
    }

    const temporalUsers = await ctx.db
      .query('condoTemporalUnitUsers')
      .filter((q) => q.eq(q.field('condoId'), args.condoId))
      .collect()
    return temporalUsers
  }
})

// getUsersByCondoId
export const getUsersByCondoId = query({
  args: { condoId: v.id('condos') },
  handler: async (ctx, args) => {
    const authUserId = await getAuthUserId(ctx)

    if (!authUserId) {
      throw new ConvexError('Usuario no autenticado')
    }

    const condo = await ctx.db.get(args.condoId)
    if (!condo || !condo.admins.includes(authUserId)) {
      throw new ConvexError('No tienes permiso para ver los usuarios de este condominio')
    }

    console.log('args.condoId', args.condoId)

    // Buscar usuarios que tengan este condominio en su array de condos
    const users = await ctx.db
      .query('users')
      .filter((q) => q.eq(q.field('condos'), [args.condoId]))
      .collect()

    console.log('users', users)

    const usersWithUnits = await Promise.all(
      users.map(async (user) => {
        // Buscar unidades asociadas a este usuario
        const units = await ctx.db
          .query('condoUnits')
          .filter((q) => q.eq(q.field('condoId'), args.condoId))
          .filter((q) =>
            q.or(q.eq(q.field('owners'), [user._id]), q.eq(q.field('tenants'), [user._id]))
          )
          .collect()

        const userUnits = units.map((unit) => ({
          _id: unit._id,
          unitNumber: unit.unitNumber,
          buildingNumber: unit.buildingNumber,
          propertyType: unit.propertyType,
          isOwner: unit.owners?.includes(user._id) || false,
          isTenant: unit.tenants?.includes(user._id) || false
        }))

        return {
          _id: user._id,
          name: user.name,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          isOwner: user.isOwner,
          isTenant: user.isTenant,
          units: userUnits
        }
      })
    )

    return usersWithUnits
  }
})
