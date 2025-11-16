import { log } from "../logger/logger";
type KeyValue = { [key: string]: any }

class Store {
  private static datatestStore: { [workerId: string]: KeyValue } = {}
  private static carryoverStore: { [workerId: string]: KeyValue } = {}

  private static getWorkerId(): string {
    return (
      process.env.CUCUMBER_WORKER_ID ||
      process.env.JEST_WORKER_ID ||
      "default"
    )
  }

  static datatest = {
    getAll: () => {
      const wid = Store.getWorkerId()
      return { ...Store.datatestStore[wid] }
    },
    put: (data: KeyValue) => {
      const wid = Store.getWorkerId()
      if (!Store.datatestStore[wid]) Store.datatestStore[wid] = {}
      Object.assign(Store.datatestStore[wid], data)
      log.debug(`Updated datatest data for workerId=${wid}: ${JSON.stringify(data, null, 2)}`);
    },
    get: (key: string) => {
      const wid = Store.getWorkerId()
      log.debug(`Retrieving datatest data for workerId=${wid} - ${key}: ${JSON.stringify(Store.datatestStore[wid]?.[key], null, 2)}`);
      return Store.datatestStore[wid]?.[key]
    },
    reset: () => {
      const wid = Store.getWorkerId()
      Store.datatestStore[wid] = {}
    },
  }

  static carryover = {
    put: (data: KeyValue) => {
      const wid = Store.getWorkerId()
      if (!Store.carryoverStore[wid]) Store.carryoverStore[wid] = {}
      // Logika Object.assign sudah sempurna untuk 'map' or 'json'
      Object.assign(Store.carryoverStore[wid], data)
      log.debug(`Updated carryover data for workerId=${wid}: ${JSON.stringify(data, null, 2)}`);
    },

    get: (key: string) => {
      const wid = Store.getWorkerId()
      const dataSnapshot = Store.carryoverStore[wid]?.[key];
      log.debug(`Retrieving carryover data for workerId=${wid} - ${key}: ${JSON.stringify(dataSnapshot, null, 2)}`);
      return dataSnapshot
    },

    getAll: () => {
      const wid = Store.getWorkerId()
      return { ...Store.carryoverStore[wid] }
    },

    reset: () => {
      const wid = Store.getWorkerId()
      Store.carryoverStore[wid] = {}
    },
  }

  /* * METODE LAMA (sekarang bisa dihapus)
   * static putCarryover(data: KeyValue) { ... }
   * static getCarryover(key: string) { ... }
   * static getAllCarryover() { ... }
   * static resetCarryover() { ... }
   */

  // ===== Helper methods untuk debugging (Perlu di-update) =====
  static getAllAvailableFields() {
    return {
      datatest: Object.keys(Store.datatest.getAll() || {}),
      // DI-UPDATE untuk menggunakan API baru
      carryover: Object.keys(Store.carryover.getAll() || {}),
    }
  }

  // ===== Expose carryoverStore untuk utility function =====
  // Ini mungkin masih diperlukan, jadi bisa tetap dipertahankan
  static getCarryoverStore() {
    return Store.carryoverStore
  }
}

export default Store