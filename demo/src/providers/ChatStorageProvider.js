
export default class ChatStorageProvider {

  storageAddress = "/orbitdb/zdpuAyR71qFrcfKkZ3x8Zn6Lzq66s9Rd2T4iTm25KtfS1odBx/ChatStore";
  currentChat = "";
  orbitDBStorage;

  getStorageAddress() {
    return this.storageAddress;
  }

  connected() {
    return this.orbitDBStorage !== undefined;
  }

  connectToStorage(s) {
    this.orbitDBStorage = s;
  }

  setCurrentChat(chat) {
    this.currentChat = chat;
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

  getChat() {
    let chat = this.orbitDBStorage.get(this.currentChat);
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
      cb(this.currentChat);
    })
  }

  listenForLocalWrites(cb) {
    console.log("listening for writes");
    this.orbitDBStorage.events.on('write', () => {
      console.log("update!");
      cb();
    })
  }

};
