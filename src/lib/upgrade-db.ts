import { IDBPDatabase, IDBPTransaction } from "idb";
import {isSameDay} from "date-fns"

const versions = [
  { version: 1, upgrader: () => {} },
  {
    version: 2,
    upgrader: async (db: IDBPDatabase) => {
      db.createObjectStore("tasks", { keyPath: "id" });
    },
  },
  {
    version: 3,
    upgrader: async (
      db: IDBPDatabase,
      trx: IDBPTransaction<unknown, string, "versionchange">
    ) => {
      const store = trx.objectStore("tasks");
      const tasks = await store.getAll();
      await store.clear();
      const lastReset = new Date();
      for (const task of tasks) {
        db.add("tasks", { ...task, lastReset });
      }
    },
  },
];

export default async function upgradeDb(
  db: IDBPDatabase,
  oldVersion: number,
  newVersion: number | null,
  transaction: IDBPTransaction<unknown, string, "versionchange">
) {
  if (newVersion === null) {
    return;
  }
  const versionsToUpgrade = versions.filter(
    (version) => version.version <= newVersion && version.version > oldVersion
  );
  for (const version of versionsToUpgrade) {
    await version.upgrader(db, transaction);
  }
}

export async function resetChecks(db: IDBPDatabase) {
  const trx = db.transaction("tasks", "readwrite");
  const store = trx.store;
  const tasks = await store.getAll();
  store.clear();
  const lastReset = new Date();
  for (const task of tasks) {
    if (task.done && !isSameDay(lastReset, task.lastReset)) {
      task.done = false;
      console.log(task.done)
    }
    db.add("tasks", { ...task, lastReset });
  }
}