import { afterEach, describe, expect, it } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { DatabaseManager } from '../src/main/database/index';
import { migrateLegacyData } from '../src/main/database/legacy-migration';

const directories: string[] = [];
afterEach(() => { for (const directory of directories.splice(0)) fs.rmSync(directory, { force: true, recursive: true }); });

describe('migration des données CMS Temps vers Timplio', () => {
  it('copie la base et les sauvegardes sans supprimer les fichiers historiques', async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'timplio-legacy-')); directories.push(root);
    const appData = path.join(root, 'app-data');
    const legacyDirectory = path.join(appData, 'CMS Temps');
    const userData = path.join(appData, 'Timplio');
    const legacyDatabase = path.join(legacyDirectory, 'cms-temps.sqlite');
    fs.mkdirSync(path.join(legacyDirectory, 'backups'), { recursive: true });

    const manager = new DatabaseManager(legacyDatabase);
    manager.db.prepare("INSERT INTO affaires (nom, client, montant_vendu_ht, taux_horaire_reference, date_creation) VALUES ('Affaire historique', 'Client', 1000, 100, '2026-01-01')").run();
    manager.close();
    const legacyBackup = path.join(legacyDirectory, 'backups', 'cms-temps-auto-2026-11-01.sqlite');
    fs.copyFileSync(legacyDatabase, legacyBackup);

    const result = await migrateLegacyData(appData, userData);

    expect(result).toEqual({ databaseMigrated: true, backupsMigrated: 1, source: legacyDatabase });
    expect(fs.existsSync(legacyDatabase)).toBe(true);
    expect(fs.existsSync(legacyBackup)).toBe(true);
    expect(fs.existsSync(path.join(userData, 'backups', 'timplio-auto-2026-11-01.sqlite'))).toBe(true);
    const migrated = new DatabaseSync(path.join(userData, 'timplio.sqlite'), { readOnly: true });
    expect((migrated.prepare("SELECT COUNT(*) AS count FROM affaires WHERE nom='Affaire historique'").get() as { count: number }).count).toBe(1);
    migrated.close();

    expect((await migrateLegacyData(appData, userData)).databaseMigrated).toBe(false);
  });
});
