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

  // ===== Datatest (punya API get/put/reset) =====
  static datatest = {
    getAll: () => {
      const wid = Store.getWorkerId()
      return { ...Store.datatestStore[wid] }
    },
    put: (data: KeyValue) => {
      const wid = Store.getWorkerId()
      if (!Store.datatestStore[wid]) Store.datatestStore[wid] = {}
      Object.assign(Store.datatestStore[wid], data)
    },
    get: (key: string) => {
      const wid = Store.getWorkerId()
      return Store.datatestStore[wid]?.[key]
    },
    reset: () => {
      const wid = Store.getWorkerId()
      Store.datatestStore[wid] = {}
    },
  }

  // ===== Carryover (tetap konsep awal) =====
  static putCarryover(data: KeyValue) {
    const wid = Store.getWorkerId()
    if (!Store.carryoverStore[wid]) Store.carryoverStore[wid] = {}
    Object.assign(Store.carryoverStore[wid], data)
  }

  static getCarryover(key: string) {
    const wid = Store.getWorkerId()
    return Store.carryoverStore[wid]?.[key]
  }

  static getAllCarryover() {
    const wid = Store.getWorkerId()
    return { ...Store.carryoverStore[wid] }
  }

  static resetCarryover() {
    const wid = Store.getWorkerId()
    Store.carryoverStore[wid] = {}
  }

  // ===== Helper methods untuk debugging =====
  static getAllAvailableFields() {
    return {
      datatest: Object.keys(Store.datatest.getAll() || {}),
      carryover: Object.keys(Store.getAllCarryover() || {})
    }
  }

  // ===== Expose carryoverStore untuk utility function =====
  static getCarryoverStore() {
    return Store.carryoverStore
  }
}

export default Store