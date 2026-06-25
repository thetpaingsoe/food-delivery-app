import {pgTable, uuid, varchar, timestamp} from "drizzle-orm/pg-core"

export const dispatches = pgTable('dispatches', {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id").notNull(),
    customerName : varchar("customer_name", {length : 100}).notNull(),
    item: varchar("item", { length : 100}).notNull(),    
    riderStatus: varchar("status", { length : 50 }).notNull().default('dispatched'), 
    createdAt: timestamp("created_at").defaultNow()
})

export type Dispatch = typeof dispatches.$inferSelect;
export type NewDispatch = typeof dispatches.$inferInsert;