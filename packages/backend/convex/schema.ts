import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const schema = defineSchema({
  ...authTables,
  // Tabla para almacenar información de los usuarios
  users: defineTable({
    name: v.optional(v.string()),
    lastName: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    isAdmin: v.optional(v.boolean()),
    isSuperAdmin: v.optional(v.boolean()),
    isAuthorized: v.optional(v.boolean()),
    isTenant: v.optional(v.boolean()),
    condos: v.optional(v.array(v.id("condos"))),
    unreadNotifications: v.optional(v.number()),
  }).index("email", ["email"]),

  // Tabla para almacenar información de los condominios
  condos: defineTable({
    name: v.string(),
    address: v.string(),
    uniqueCode: v.string(),
    admins: v.array(v.id("users")),
    city: v.string(),
    state: v.string(),
    zipCode: v.string(),
    country: v.string(),
  }),

  // Tabla para definir los apartamentos de cada condominio
  condoUnits: defineTable({
    condoId: v.id("condos"),
    isRented: v.boolean(),
    buildingNumber: v.optional(v.string()),
    floorNumber: v.string(),
    unitNumber: v.string(),
    phone: v.optional(v.number()),
    owners: v.optional(v.array(v.id("users"))),
    hoa: v.optional(v.number()),
    tenants: v.optional(v.array(v.id("users"))),
  })
    .index("by_condo", ["condoId"])
    .index("by_owners", ["owners"]),

  // Tabla temporal con información de apartamentos y usuarios que dicen que viven en el
  condoTemporalUnitUsers: defineTable({
    userId: v.id("users"),
    condoId: v.id("condos"),
    unitNumber: v.string(),
    floorNumber: v.string(),
    buildingNumber: v.string(),
    phone: v.string(),
    isOwner: v.optional(v.boolean()),
    isTenant: v.optional(v.boolean()),
    withWhatsapp: v.optional(v.boolean()),
  }),

  // Tabla para definir las áreas comunes del condominio
  commonAreas: defineTable({
    condoId: v.id("condos"),
    name: v.string(),
    description: v.string(),
    images: v.array(v.string()),
    type: v.union(
      v.literal("gym"),
      v.literal("pool"),
      v.literal("sauna"),
      v.literal("steamRoom"),
      v.literal("soccerField"),
      v.literal("socialRoom")
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
      sunday: v.object({ startTime: v.string(), endTime: v.string() }),
    }),
    // Campos específicos para áreas comunes
    reservationTime: v.optional(v.number()), // tiempo en minutos por cada reserva
    // Campos específicos para salones sociales
    minReservationTime: v.optional(v.number()), // en horas
    maxReservationTime: v.optional(v.number()), // en horas
    pricePerHour: v.optional(v.number()),
    amenities: v.optional(v.array(v.string())), // lista de comodidades disponibles
  })
    .index("by_condo", ["condoId"])
    .index("by_type", ["type"]),

  // Tabla para definir las cuotas máximas de reserva por apartamento y área común
  unitReservationQuotas: defineTable({
    condoUnitId: v.id("condoUnits"),
    commonAreaId: v.id("commonAreas"),
    maxQuotaPerReservation: v.number(), // cuota máxima de reserva por área común por apartamento
  }).index("by_condoUnit_and_commonArea", ["condoUnitId", "commonAreaId"]),

  // Tabla para almacenar las reservas de las áreas comunes
  reservations: defineTable({
    condoUnitId: v.id("condoUnits"),
    commonAreaId: v.id("commonAreas"),
    userId: v.id("users"),
    startTime: v.number(), // formato "milisegundos"
    endTime: v.optional(v.number()), // formato "milisegundos", opcional
    numberOfPeople: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("inUse"),
      v.literal("completed"),
      v.literal("cancelled"),
      v.literal("noShow")
    ),
    totalPrice: v.optional(v.number()), // para reservas de salón social
    notificationSent: v.optional(v.boolean()),
    paymentStatus: v.optional(
      v.union(v.literal("pending"), v.literal("paid"), v.literal("failed"))
    ),
  })
    .index("by_user_and_status", ["userId", "status"])
    .index("by_condoUnit_and_status", ["condoUnitId", "status"])
    .index("by_commonArea_and_startTime", ["commonAreaId", "startTime"]),

  // Tabla para almacenar las notificaciones de los usuarios
  notifications: defineTable({
    userId: v.id("users"),
    type: v.union(
      v.literal("reservationReminder"),
      v.literal("reservationConfirmation"),
      v.literal("reservationInvalidation")
    ),
    message: v.string(),
    reservationId: v.optional(v.id("reservations")),
    isRead: v.boolean(),
  }).index("by_user_and_read", ["userId", "isRead"]),
});

export default schema;
