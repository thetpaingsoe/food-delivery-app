import {
  pgTable,
  uuid,
  varchar,
  integer,
  timestamp,
} from 'drizzle-orm/pg-core';

export const dispatches = pgTable('dispatches', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id').notNull(),
  customerName: varchar('customer_name', { length: 100 }).notNull(),
  itemName: varchar('item_name', { length: 255 }).notNull(),
  quantity: integer('quantity').notNull(),
  street: varchar('street', { length: 255 }).notNull(),
  area: varchar('area', { length: 255 }).notNull(),
  riderStatus: varchar('status', { length: 50 })
    .notNull()
    .default('dispatched'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export type Dispatch = typeof dispatches.$inferSelect;
export type NewDispatch = typeof dispatches.$inferInsert;
