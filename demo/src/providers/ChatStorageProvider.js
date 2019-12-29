
export default class ChatStorageProvider {

  storageAddress = "/orbitdb/zdpuB3XCdYdx572JtfnjKS6HidCDL8qDMxdgHdgjWD2yssygV/chat-storage";
  currentChat = "";
  orbitDBStorage;

  getStorageAddress() {
    return this.storageAddress;
  }

  connectToStorage(s) {
    this.orbitDBStorage = s;
  }

  async getChat() {
    let chat = this.orbitDBStorage.get('');
    console.log(this.orbitDBStorage._oplog);
    console.log(chat);
    if (chat.length === 0) {
      return [];
    }

    return chat[0].data;
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
