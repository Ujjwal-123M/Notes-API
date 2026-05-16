import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { NoteShare } from '../notes/note-share.entity';
import { Note } from '../notes/note.entity';
import { User } from '../users/user.entity';

function normalizeDatabaseUrl(raw: string): string {
  let url = raw.trim();
  if (
    (url.startsWith("'") && url.endsWith("'")) ||
    (url.startsWith('"') && url.endsWith('"'))
  ) {
    url = url.slice(1, -1);
  }
  return url;
}

function hostNeedsSsl(hostname: string): boolean {
  const sslHosts = ['render.com', 'neon.tech', 'supabase.co', 'railway.app'];
  return sslHosts.some((host) => hostname.includes(host));
}

export function getDatabaseConfig(
  config: ConfigService,
): TypeOrmModuleOptions {
  const rawUrl = config.get<string>('DATABASE_URL');
  if (!rawUrl?.trim()) {
    throw new Error(
      'DATABASE_URL is missing. Set it in notes-api/.env (not .env.example).',
    );
  }

  const databaseUrl = normalizeDatabaseUrl(rawUrl);
  const parsed = new URL(databaseUrl);
  const sslMode = parsed.searchParams.get('sslmode');
  const isProduction = config.get<string>('NODE_ENV') === 'production';
  const forceSsl = config.get<string>('DATABASE_SSL') === 'true';
  const useSsl =
    forceSsl ||
    isProduction ||
    hostNeedsSsl(parsed.hostname) ||
    sslMode === 'require' ||
    sslMode === 'verify-full';

  const database = parsed.pathname.replace(/^\//, '').split('/')[0];

  return {
    type: 'postgres',
    host: parsed.hostname,
    port: Number(parsed.port || 5432),
    username: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database,
    entities: [User, Note, NoteShare],
    synchronize: true,
    ssl: useSsl ? { rejectUnauthorized: false } : false,
  };
}
