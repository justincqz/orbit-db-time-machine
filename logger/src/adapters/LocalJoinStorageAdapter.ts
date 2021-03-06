import JoinStorageProvider from '../providers/JoinStorageProvider';
import JoinEvent from '../model/JoinEvent';

export default class LocalStorageJoinProvider implements JoinStorageProvider {
  currentDatabase = null;

  setDatabase(id: string): void {
    this.currentDatabase = id;
  }

  constructor() {
    if (!window.localStorage) {
      throw new Error("Local Storage not supported by browser.");
    }
    this.currentDatabase = null;
  }

  getStorageAddress(): string {
    return "LOCAL";
  }

  connectToStorage(): void {
  }

  setUser(id: string): void {
  }

  getUserIds(): string[] {
    return [];
  }

  getUserJoins(id: string): JoinEvent[] {
    return [];
  }

  getJoins(): string[] {
    // You forgot to set the current database
    if (this.currentDatabase === null) {
      throw new Error("Current database has not been initialised")
    }
    // This is the first time we are debugging this database - no object exists
    // in local storage
    if (window.localStorage.getItem(this.currentDatabase) === null) {
      console.log("Intitialising local storage...");
      window.localStorage.setItem(this.currentDatabase, JSON.stringify([]));
    }
    let vals: string[] = [];
    for (let i = 0; i < JSON.parse(window.localStorage.getItem(this.currentDatabase)).length; i++) {
      vals.push(`${i}`);
    }
    return vals;
  }

  getJoinEvent(id: string): JoinEvent {
    // You forgot to set the current database
    if (this.currentDatabase === null) {
      throw new Error("Current database has not been initialised")
    }
    return new JoinEvent(JSON.parse(window.localStorage.getItem(this.currentDatabase))[id]);
  }

  addJoinEvent(event: JoinEvent) {
    // You forgot to set the current database
    if (this.currentDatabase === null) {
      throw new Error("Current database has not been initialised")
    }
    let cur = JSON.parse(window.localStorage[this.currentDatabase]);
    cur.push(event.root);
    window.localStorage.setItem(this.currentDatabase, JSON.stringify(cur));
  }
}
