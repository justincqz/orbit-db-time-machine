import React, {useEffect, useState, useRef} from 'react';
import {useDependencyInjector} from "../state/DependencyInjector";
import LandingStyles from "./Landing.module.css";
import Popup from "reactjs-popup";
import Logger from 'orbit-db-time-machine-logger'

const Landing = (props) => {
    const injector = useDependencyInjector();
    let dbProvider = useRef(null);
    let chatProvider = useRef(null);
    let userProvider = useRef(null);

    const [chats, setChats] = useState([]);
    const [users, setUsers] = useState([]);
    const [chat, setChat] = useState(null);
    const [chatInfo, setChatInfo] = useState({data: []});
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(true);
    const [userListening, setUserListening] = useState(false);
    const [chatListening, setChatListening] = useState(false);
    const [newChat, setNewChat] = useState({name: "New Chat", members: []});
    const [popupOpen, setPopupOpen] = useState(false);
    const [input, setInput] = useState("");

    const refresh = () => {
      let chatInfo = chatProvider.current.getChat();
      setChatInfo(chatInfo);
    };

    function typeNewInput(e) {
      e.preventDefault();
      let chatInfo = chatProvider.current.getChat();
      let chatData = chatInfo.data;
      chatData.push(input);
      chatInfo.data = chatData;
      chatProvider.current.updateChat(chatInfo);
      setInput("");
    }

    function selectChat(chat) {
      console.log(chat);
      setChat(chat);
      chatProvider.current.setCurrentChat(chat);
      let chatInfo = chatProvider.current.getChat();
      setChatInfo(chatInfo);
    }

    function createNewChat(e) {
      console.log(newChat);
      e.preventDefault();
      newChat.members.forEach((m) => {
        userProvider.current.addUserChat(m, newChat.name);
      });
      chatProvider.current.createNewChat(newChat.name, newChat.members);
      handleClosePopup();
    }

    function refreshUsers() {
      let cs = userProvider.current.getUserChats();
      setChats(cs);
      getAllUsers();
    }

    function getAllUsers() {
      setUsers(userProvider.current.getAllUsers());
    }

    function selectUser(user) {
      let existingMembers = newChat.members;

      if (existingMembers.includes(user)) {
        existingMembers.filter(e => e !== user);
      } else {
        existingMembers.push(user);
      }

      setNewChat({...newChat, members: existingMembers});
    }



    function getChat() {
      console.log("callback");
      console.log(chat);
      if (chat) {
        chatProvider.current.setCurrentChat(chat);
        let chatInfo = chatProvider.current.getChat();
        setChatInfo(chatInfo);
        console.log("here");
      }
    }

    function handleClosePopup() {
      setPopupOpen(false);
      setNewChat({...newChat, members: []});
    }


    function listenForChange(c) {

      if (!userListening) {
        userProvider.current.listenForSync(refreshUsers);
        setUserListening(true);

        // Don't know why but uncommenting this will cause
        // the bottom stuff to not run

        userProvider.current.listenForLocalWrites(refreshUsers);
        setUserListening(true);
      }

      if (!chatListening) {
        console.log("ERE");
        console.log(c);
        console.log(chat);
        chatProvider.current.listenForSync(refresh);
        setChatListening(true);

      //
        chatProvider.current.listenForLocalWrites(refresh);
        setChatListening(true);
      }
    }

    useEffect(() => {
        if (!chatProvider.current) {
            chatProvider.current = injector.createChatStorageProvider();
        }

        if (!userProvider.current) {
            userProvider.current = injector.createUserStorageProvider();
        }

        if (!dbProvider.current) {
            injector.createDBProvider()
              .then(provider => {
                dbProvider.current = provider;
                dbProvider.current.openDatabase(userProvider.current.getStorageAddress())
                  .then(s => {
                    userProvider.current.connectToStorage(s);
                    userProvider.current.setUser(props.user);
                    userProvider.current.addUser();
                    refreshUsers();

                    dbProvider.current.openDatabase(chatProvider.current.getStorageAddress())
                      .then(s => {
                          chatProvider.current.connectToStorage(s);
                          getChat();
                          setLoading(false);
                          listenForChange(chat);
                          (new Logger(s, dbProvider.current.ipfs)).start()
                      })
                      .catch(e => {
                          console.log(e);
                          setErr(e);
                      })
                  })
                  .catch(e => {
                      console.log(e);
                      setErr(e);
                  })
                })
              .catch(e => {
                  console.log(e);
                  setErr(e);
              })

        }

    });

    if (chatProvider.current && userProvider.current && chatProvider.current.connected() && userProvider.current.connected()) {
      console.log("REINITIALIZE!");
      console.log(chat);
      listenForChange(chat);
    }

    return (

      (loading)
        ?
        (!err)
          ?
            <div>
              Loading...
            </div>
          :
            <div>
              Error!
            </div>
        :
          <div className={LandingStyles.container}>
            <Popup
              open={popupOpen}
              onClose={() => handleClosePopup()}>
              <form onSubmit={(e) => createNewChat(e)} noValidate autoComplete="off">
                <div>
                  <input
                    type="text"
                    value={newChat.name}
                    onChange={(e) => {
                      setNewChat({...newChat, name: e.target.value});
                    }}>
                  </input>
                </div>
                <div>
                {
                  users.map(m => (
                      <div>
                        <input type="checkbox" value={m} onChange={(e) => selectUser(e.target.value)} name={m}/>
                        <label>{m}</label>
                      </div>
                    )
                  )
                }
                </div>
                <button type='submit'/>
              </form>
            </Popup>
            <div className={LandingStyles.chatBar}>
              <div className={LandingStyles.userName}>
                User: {props.user}
              </div>
              <div className={LandingStyles.newChat} onClick={() => setPopupOpen(true)}>
                Create new chat
              </div>
              {
                chats.length !== 0
                  ?
                  chats.map(c =>
                    (
                      <div onClick={() => selectChat(c)}>
                        {c}
                      </div>
                    ))
                  :
                  <div className={LandingStyles.noChats}>
                    No chats
                  </div>
              }
            </div>

            <div className={LandingStyles.chatBox}>
              {chat
                ?
                (
                  <div>
                    <p>Reading chat</p>
                    {chatInfo.data.map(d => <div>{d}</div>)}
                    <form onSubmit={(e) => typeNewInput(e)} noValidate autoComplete="off">
                      <div>
                        <input
                          type="text"
                          value={input}
                          onChange={(e) => {
                            setInput(e.target.value);
                          }}>
                        </input>
                      </div>
                      <button type='submit'/>
                    </form>
                  </div>
                )
                :
                <div className={LandingStyles.noChatSelected}>
                  Select a chat on the chat bar
                </div>
              }
            </div>
          </div>

    )
};

export default Landing
