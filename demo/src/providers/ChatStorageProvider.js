
export default class ChatStorageProvider {

  storageAddress = "/orbitdb/zdpuAyR71qFrcfKkZ3x8Zn6Lzq66s9Rd2T4iTm25KtfS1odBx/ChatStore";
  currentChat = "";
  orbitDBStorage;

  getStorageAddress() {
    return this.storageAddress;
  }

  connectToStorage(s) {
    this.orbitDBStorage = s;
  }

  createNewChat(name, members) {
    this.orbitDBStorage.put({
      "_id": name,
      "members": members,
      "data": []
    });
  }

  updateChat(chat) {
    this.orbitDBStorage.put(chat);
  }

  getChat(c) {
    let chat = this.orbitDBStorage.get(c);
    console.log(this.orbitDBStorage._oplog);
    console.log(chat);
    if (chat.length === 0) {
      return [];
    }

    return chat[0];
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
