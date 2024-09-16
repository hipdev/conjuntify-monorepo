import { v } from 'convex/values'
import { authTables } from '@convex-dev/auth/server'
import { defineSchema, defineTable } from 'convex/server'

const schema = defineSchema({
  ...authTables,
  // Tabla para almacenar información de los usuarios
  users: defineTable({
    condos: v.optional(v.array(v.id('condos'))),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    image: v.optional(v.string()),
    isAdmin: v.optional(v.boolean()),
    isAnonymous: v.optional(v.boolean()),
    isAuthorized: v.optional(v.boolean()),
    isSuperAdmin: v.optional(v.boolean()),
    isTenant: v.optional(v.boolean()),
    isOwner: v.optional(v.boolean()),
    lastName: v.optional(v.string()),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    unreadNotifications: v.optional(v.number())
  }).index('email', ['email']),

  // Tabla para almacenar información de los condominios
  condos: defineTable({
    address: v.string(),
    admins: v.array(v.id('users')),
    amenities: v.array(v.string()),
    city: v.string(),
    country: v.string(),
    isActive: v.boolean(),
    name: v.string(),
    numberUnits: v.optional(v.number()),
    phone: v.optional(v.string()),
    state: v.string(),
    type: v.union(v.literal('houses'), v.literal('apartments')),
    uniqueCode: v.string(),
    zipCode: v.string()
  }).index('by_uniqueCode', ['uniqueCode']),

  // Tabla de referencia de usuarios admins de un condominio
  condoAdmins: defineTable({
    condoId: v.id('condos'),
    userId: v.id('users')
  })
    .index('by_condo', ['condoId'])
    .index('by_user', ['userId']),

  // Tabla para definir los apartamentos de cada condominio
  condoUnits: defineTable({
    area: v.optional(v.number()),
    buildingNumber: v.optional(v.string()),
    condoId: v.id('condos'),
    hoa: v.optional(v.number()),
    isRented: v.optional(v.boolean()),
    owners: v.optional(v.array(v.id('users'))),
    phone: v.optional(v.string()),
    propertyType: v.union(v.literal('apartment'), v.literal('house')),
    tenants: v.optional(v.array(v.id('users'))),
    unitNumber: v.string()
  })
    .index('by_condo', ['condoId'])
    .index('by_owners', ['owners']),

  // Tabla de referencia de usuarios que viven en un apartamento
  condoUnitUsers: defineTable({
    condoUnitId: v.id('condoUnits'),
    userId: v.id('users'),
    isOwner: v.optional(v.boolean()),
    isTenant: v.optional(v.boolean())
  })
    .index('by_condoUnit', ['condoUnitId'])
    .index('by_user', ['userId']),

  // Tabla temporal con información de apartamentos y usuarios que dicen que viven en el
  condoTemporalUnitUsers: defineTable({
    name: v.string(),
    buildingNumber: v.string(),
    condoId: v.id('condos'),
    isOwner: v.optional(v.boolean()),
    isTenant: v.optional(v.boolean()),
    phone: v.string(),
    unitNumber: v.string(),
    userId: v.id('users'),
    withWhatsapp: v.optional(v.boolean()),
    idn: v.optional(v.string()),
    propertyRegistration: v.optional(v.string()),
    status: v.optional(v.union(v.literal('pending'), v.literal('approved'), v.literal('rejected')))
  })
    .index('by_condo', ['condoId'])
    .index('by_user', ['userId']),

  // Tabla para definir las áreas comunes del condominio
  commonAreas: defineTable({
    condoId: v.id('condos'),
    name: v.string(),
    description: v.string(),
    images: v.optional(v.array(v.string())),
    type: v.union(
      v.literal('gym'),
      v.literal('pool'),
      v.literal('sauna'),
      v.literal('steamRoom'),
      v.literal('soccerField'),
      v.literal('socialRoom')
    ),
    maxCapacity: v.number(),
    isAvailable: v.boolean()
  })
    .index('by_condo', ['condoId'])
    .index('by_type', ['type']),

  // Tabla para almacenar las reservas de las áreas comunes
  reservations: defineTable({
    commonAreaId: v.id('commonAreas'),
    condoUnitId: v.id('condoUnits'),
    notificationSent: v.optional(v.boolean()),
    numberOfPeople: v.number(),
    reservationTime: v.number(),
    status: v.union(
      v.literal('pending'),
      v.literal('confirmed'),
      v.literal('inUse'),
      v.literal('completed'),
      v.literal('cancelled'),
      v.literal('noShow')
    ),
    userId: v.id('users')
  })
    .index('by_user_and_status', ['userId', 'status'])
    .index('by_condoUnit_and_status', ['condoUnitId', 'status'])
    .index('by_commonArea_and_status', ['commonAreaId', 'status']),

  // Tabla para almacenar las notificaciones de los usuarios
  notifications: defineTable({
    isRead: v.boolean(),
    message: v.string(),
    reservationId: v.optional(v.id('reservations')),
    type: v.union(
      v.literal('reservationReminder'),
      v.literal('reservationConfirmation'),
      v.literal('reservationInvalidation')
    ),
    userId: v.id('users')
  }).index('by_user_and_read', ['userId', 'isRead'])
})

export default schema
