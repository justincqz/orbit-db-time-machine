import React, {useEffect, useState, useRef} from 'react';
import {useDependencyInjector} from "../state/DependencyInjector";
import LandingStyles from "./Landing.module.css";

const Landing = (props) => {
    const injector = useDependencyInjector();
    let dbProvider = useRef(null);
    let chatProvider = useRef(null);
    let userProvider = useRef(null);

    const [chats, setChats] = useState([]);
    const [chat, setChat] = useState(null);
    const [err, setErr] = useState("");
    const [userListening, setUserListening] = useState(false);
    const [chatListening, setChatListening] = useState(false);

    function getUserChats() {
      userProvider.current.getUserChats().then(
        cs => {
          setChats(cs);
          console.log(cs);
        }
      );
    }


    function getChat() {
      if (chat) {
        userProvider.current.getChat().then(
          c => {
            setChat(c);
            console.log(c);
          }
        );
      }
    }


    function listenForChange() {

      if (!userListening) {
        userProvider.current.listenForSync(() => {
          getUserChats();
          setUserListening(true);
        });

        // Don't know why but uncommenting this will cause
        // the bottom stuff to not run

        // userProvider.current.listenForLocalWrites(() => {
        //   getUserChats();
        //   setUserListening(true);
        // });
      }

      if (!chatListening) {
        chatProvider.current.listenForSync(() => {
          getChat();
          setChatListening(true);
        });

        chatProvider.current.listenForLocalWrites(() => {
          getChat();
          setChatListening(true);
        });
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
                    getUserChats();

                    dbProvider.current.openDatabase(chatProvider.current.getStorageAddress())
                      .then(s => {
                          chatProvider.current.connectToStorage(s);
                          getChat();
                          listenForChange();
                      })
                      .catch(e => {
                          setErr(e);
                      })
                  })
                  .catch(e => {
                      setErr(e);
                  })
                })
              .catch(e => {
                  setErr(e);
              })

        }
    });


    return (
        <div className={LandingStyles.container}>
            <div className={LandingStyles.chatBar}>
              <div className={LandingStyles.userName}>
                User: {props.user}
              </div>
              {
                chats.length !== 0
                  ?
                    chats.map(c =>
                      (
                          <div onClick={setChat(c)}>
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
                    <p>{chat}</p>
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
