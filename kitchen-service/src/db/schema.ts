import {pgTable, uuid, varchar, timestamp} from "drizzle-orm/pg-core"

export const tickets = pgTable('tickets', {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id").notNull(),
    customName : varchar("customer_name", {length : 100}).notNull(),
    item: varchar("item", { length : 100}).notNull(),    
    status: varchar("status", { length : 50 }).notNull().default('received'), 
    createdAt: timestamp("created_at").defaultNow()
})

export type Ticket = typeof tickets.$inferSelect;
export type NewTicket = typeof tickets.$inferInsert;