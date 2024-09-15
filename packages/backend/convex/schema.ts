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

  // Tabla para definir los apartamentos de cada condominio
  condoUnits: defineTable({
    buildingNumber: v.optional(v.string()),
    condoId: v.id('condos'),
    floorNumber: v.string(),
    hoa: v.optional(v.number()),
    isRented: v.boolean(),
    owners: v.optional(v.array(v.id('users'))),
    phone: v.optional(v.number()),
    tenants: v.optional(v.array(v.id('users'))),
    unitNumber: v.string()
  })
    .index('by_condo', ['condoId'])
    .index('by_owners', ['owners']),

  // Tabla temporal con información de apartamentos y usuarios que dicen que viven en el
  condoTemporalUnitUsers: defineTable({
    name: v.string(),
    buildingNumber: v.string(),
    condoId: v.id('condos'),
    floorNumber: v.string(),
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
    images: v.array(v.string()),
    type: v.union(
      v.literal('gym'),
      v.literal('pool'),
      v.literal('sauna'),
      v.literal('steamRoom'),
      v.literal('soccerField'),
      v.literal('socialRoom')
    ),
    maxCapacity: v.number(),
    isAvailable: v.boolean(),
    latitude: v.number(),
    longitude: v.number(),
    radius: v.number(), // radio en metros para definir el perímetro
    schedule: v.object({
      monday: v.object({ startTime: v.string(), endTime: v.string() }), // startTime y endTime en formato "HH:MM"
      tuesday: v.object({ startTime: v.string(), endTime: v.string() }),
      wednesday: v.object({ startTime: v.string(), endTime: v.string() }),
      thursday: v.object({ startTime: v.string(), endTime: v.string() }),
      friday: v.object({ startTime: v.string(), endTime: v.string() }),
      saturday: v.object({ startTime: v.string(), endTime: v.string() }),
      sunday: v.object({ startTime: v.string(), endTime: v.string() })
    }),
    // Campos específicos para áreas comunes
    reservationTime: v.optional(v.number()), // tiempo en minutos por cada reserva
    // Campos específicos para salones sociales
    minReservationTime: v.optional(v.number()), // en horas
    maxReservationTime: v.optional(v.number()), // en horas
    pricePerHour: v.optional(v.number()),
    amenities: v.optional(v.array(v.string())) // lista de comodidades disponibles
  })
    .index('by_condo', ['condoId'])
    .index('by_type', ['type']),

  // Tabla para definir las cuotas máximas de reserva por apartamento y área común
  unitReservationQuotas: defineTable({
    condoUnitId: v.id('condoUnits'),
    commonAreaId: v.id('commonAreas'),
    maxQuotaPerReservation: v.number() // cuota máxima de reserva por área común por apartamento
  }).index('by_condoUnit_and_commonArea', ['condoUnitId', 'commonAreaId']),

  // Tabla para almacenar las reservas de las áreas comunes
  reservations: defineTable({
    commonAreaId: v.id('commonAreas'),
    condoUnitId: v.id('condoUnits'),
    endTime: v.optional(v.number()), // formato "milisegundos", opcional
    notificationSent: v.optional(v.boolean()),
    numberOfPeople: v.number(),
    startTime: v.number(), // formato "milisegundos"
    status: v.union(
      v.literal('pending'),
      v.literal('confirmed'),
      v.literal('inUse'),
      v.literal('completed'),
      v.literal('cancelled'),
      v.literal('noShow')
    ),
    userId: v.id('users'),
    totalPrice: v.optional(v.number()), // para reservas de salón social
    paymentStatus: v.optional(v.union(v.literal('pending'), v.literal('paid'), v.literal('failed')))
  })
    .index('by_user_and_status', ['userId', 'status'])
    .index('by_condoUnit_and_status', ['condoUnitId', 'status'])
    .index('by_commonArea_and_startTime', ['commonAreaId', 'startTime']),

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
