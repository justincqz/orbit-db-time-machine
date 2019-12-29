import React, {useState} from 'react';
import './App.css';
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import {InjectorProvider, DefaultInjector} from "./state/DependencyInjector";

const userContext = React.createContext("");

const App = () => {
  const [user, setUser] = useState(null);

  return user
        ?
          <InjectorProvider injector={new DefaultInjector()}>
              <userContext.Provider value = {user}>
                  <userContext.Consumer>
                      {user => {
                          return <Landing user = {user} />
                      }}
                  </userContext.Consumer>
              </userContext.Provider>
          </InjectorProvider>
        :
          <Login setUser={setUser} />
      ;
};

export default App;
