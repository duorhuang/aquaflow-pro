import { getNeon } from '@/lib/db-pool';
import type { NeonQueryFunction } from '@neondatabase/serverless';
import { NotFoundError } from './errors';

/**
 * Base repository — shared utilities for all entity repos.
 * Handles Neon client access and JSON field serialization/deserialization.
 */
export abstract class BaseRepo {
  protected sql: NeonQueryFunction<false, false>;

  constructor() {
    this.sql = getNeon();
  }

  /** Parse JSON fields from DB string to object. */
  protected parseJsonFields<T extends Record<string, unknown>>(row: T, jsonFields: string[]): T {
    const result = { ...row };
    for (const field of jsonFields) {
      const value = result[field as keyof T];
      if (typeof value === 'string') {
        try {
          (result as any)[field] = JSON.parse(value);
        } catch {
          (result as any)[field] = null;
        }
      }
    }
    return result;
  }

  /** Parse JSON fields on an array of rows. */
  protected parseJsonRows<T extends Record<string, unknown>>(rows: T[], jsonFields: string[]): T[] {
    return rows.map(row => this.parseJsonFields(row, jsonFields));
  }

  /** Stringify a value for JSON column storage. */
  protected toJson(value: unknown): string {
    return JSON.stringify(value ?? {});
  }

  /** Require a single row or throw NotFoundError. */
  protected requireOne<T>(rows: T[], entity: string, id?: string): T {
    if (rows.length === 0) throw new NotFoundError(entity, id);
    return rows[0];
  }
}
