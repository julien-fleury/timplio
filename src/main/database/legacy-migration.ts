import { backup, DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { BRAND } from '../../shared/branding.js';

export interface LegacyMigrationResult {
  databaseMigrated: boolean;
  backupsMigrated: number;
  source: string | null;
}

function validateDatabase(file: string): void {
  const candidate = new DatabaseSync(file, { readOnly: true });
  try {
    const integrity = candidate.prepare('PRAGMA integrity_check').get() as { integrity_check: string };
    if (integrity.integrity_check !== 'ok') throw new Error(`Base SQLite invalide : ${integrity.integrity_check}`);
    const required = candidate.prepare("SELECT COUNT(*) AS count FROM sqlite_master WHERE type='table' AND name IN ('affaires', 'pointages')").get() as { count: number };
    if (required.count !== 2) throw new Error('La base historique ne contient pas le schéma attendu.');
  } finally {
    candidate.close();
  }
}

export async function migrateLegacyData(appDataDirectory: string, userDataDirectory: string): Promise<LegacyMigrationResult> {
  fs.mkdirSync(userDataDirectory, { recursive: true });
  const destination = path.join(userDataDirectory, BRAND.databaseFile);
  const candidates = [
    path.join(userDataDirectory, BRAND.legacyDatabaseFile),
    ...BRAND.legacyProductNames.map((name) => path.join(appDataDirectory, name, BRAND.legacyDatabaseFile)),
  ].filter((file, index, files) => files.indexOf(file) === index && path.resolve(file) !== path.resolve(destination));

  let source: string | null = null;
  let databaseMigrated = false;
  if (!fs.existsSync(destination)) {
    source = candidates.find((file) => fs.existsSync(file)) ?? null;
    if (source) {
      const temporary = `${destination}.migration-${process.pid}.tmp`;
      const legacyDatabase = new DatabaseSync(source, { readOnly: true });
      try {
        await backup(legacyDatabase, temporary);
        validateDatabase(temporary);
        fs.renameSync(temporary, destination);
        databaseMigrated = true;
      } finally {
        legacyDatabase.close();
        fs.rmSync(temporary, { force: true });
      }
    }
  }

  const backupDestination = path.join(userDataDirectory, 'backups');
  let backupsMigrated = 0;
  for (const directory of new Set(candidates.map((file) => path.join(path.dirname(file), 'backups')))) {
    if (!fs.existsSync(directory)) continue;
    const legacyPattern = new RegExp(`^${BRAND.legacyAutomaticBackupPrefix}-(\\d{4}-\\d{2}-\\d{2})\\.sqlite$`);
    for (const file of fs.readdirSync(directory)) {
      const match = file.match(legacyPattern);
      if (!match) continue;
      fs.mkdirSync(backupDestination, { recursive: true });
      const target = path.join(backupDestination, `${BRAND.automaticBackupPrefix}-${match[1]}.sqlite`);
      if (fs.existsSync(target)) continue;
      fs.copyFileSync(path.join(directory, file), target);
      backupsMigrated += 1;
    }
  }

  return { databaseMigrated, backupsMigrated, source };
}
