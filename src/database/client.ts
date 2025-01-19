import { Client, createClient } from '@libsql/client';
import { initialize_database } from './schema.js';

export class DatabaseClient {
  private static instance: DatabaseClient;
  private client: Client;

  private constructor(url: string, auth_token?: string) {
    this.client = createClient({
      url,
      authToken: auth_token
    });
  }

  public static async initialize(url: string, auth_token?: string): Promise<DatabaseClient> {
    if (!DatabaseClient.instance) {
      DatabaseClient.instance = new DatabaseClient(url, auth_token);
      await initialize_database(DatabaseClient.instance.get_client());
    }
    return DatabaseClient.instance;
  }

  public get_client(): Client {
    return this.client;
  }

  public async close(): Promise<void> {
    await this.client.close();
  }
}

// Helper function to get database configuration from environment
export function get_database_config(): { url: string; auth_token?: string } {
  const url = process.env.LIBSQL_URL || 'file:local.db';
  const auth_token = process.env.LIBSQL_AUTH_TOKEN;

  return { url, auth_token };
}
