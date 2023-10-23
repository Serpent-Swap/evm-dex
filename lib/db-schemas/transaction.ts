import { bigint, int, mysqlEnum, mysqlTable, varchar } from 'drizzle-orm/mysql-core';

const txTypes = ['swap', 'mint_liquidity_pool', 'approve'] as const;

export const transactions = mysqlTable('transactions', {
  hash: varchar('hash', { length: 66 }).notNull().primaryKey(),
  blockHash: varchar('block_hash', { length: 66 }).notNull(),
  blockNumber: bigint('block_number', { mode: 'bigint' }).notNull(),
  chainId: int('chain_id').notNull(),
  from: varchar('from', { length: 42 }).notNull(),
  to: varchar('to', { length: 42 }).notNull(),
  gas: bigint('gas', { mode: 'bigint' }).notNull(),
  gasPrice: bigint('gas_price', { mode: 'bigint' }).notNull(),
  maxFeePerGas: bigint('max_fee_per_gas', { mode: 'bigint' }).notNull(),
  maxPriorityFeePerGas: bigint('max_priority_fee_per_gas', { mode: 'bigint' }).notNull(),
  nonce: int('nonce').notNull(),
  type: varchar('type', { length: 12 }).notNull(),
  tx_type: mysqlEnum('tx_type', txTypes).notNull(),
  value: bigint('value', { mode: 'bigint' }).notNull(),
  status: mysqlEnum('status', ['pending', 'success', 'failed', 'other'] as const).notNull(),
});

export type Transaction = typeof transactions.$inferSelect;