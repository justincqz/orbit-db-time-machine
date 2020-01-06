
export default class UserStorageProvider {

  storageAddress = "/orbitdb/zdpuAvcRgSmRrWXTAE8jHd43soqNhQotzTfA82tX3UaMfGwii/UserStore";
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

  getAllUsers() {
    return this.orbitDBStorage.get('').map(
      c => c._id
    );
  }

  connected() {
    return this.orbitDBStorage !== undefined;
  }


  addUserChat(user, chat) {
    let userInfo = this.orbitDBStorage.get(user)[0];
    let userChats = userInfo.chats;
    userChats.push(chat);
    this.orbitDBStorage.put({"_id": user, "chats": userChats});
    console.log(this.orbitDBStorage.get(""));
  }

  addUser() {
    let matches = this.orbitDBStorage.get(this.currentUser);
    console.log(matches);
    if (matches.length === 0) {
      console.log("here");
      this.orbitDBStorage.put({"_id": this.currentUser, chats: []});
    }
  }

  async getUserChats() {
    let userChats = this.orbitDBStorage.get(this.currentUser);
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
    this.orbitDBStorage.events.on('write', () => {
      console.log("update!");
      cb();
    })
  }

};
