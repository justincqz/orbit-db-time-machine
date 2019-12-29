
export default class UserStorageProvider {

  storageAddress = "/orbitdb/zdpuAqM319xtPjZaPcBaLLH7ZbEHpU4t3q38fWPgfxqeW2KqU/user-store";
  currentUser = "";
  orbitDBStorage;

  getStorageAddress() {
    return this.storageAddress;
  }

  setUser(id)  {
    this.currentUser = id;
  }

  connectToStorage(s) {
    this.orbitDBStorage = s;
  }

  async getUserChats() {
    let userChats = this.orbitDBStorage.get('');
    console.log(this.orbitDBStorage._oplog);
    console.log(userChats);
    if (userChats.length === 0) {
      return [];
    }

    return userChats[0].chats;
  }

  listenForSync(cb) {
    console.log("listening for joins");
    this.orbitDBStorage.events.on('replicated', () => {
      console.log("update!");
      cb();
    })
  }

  listenForLocalWrites(cb) {
    console.log("listening for writes");
    this.store.events.on('write', () => {
      console.log("update!");
      cb();
    })
  }

};
