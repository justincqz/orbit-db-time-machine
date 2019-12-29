import React, {createContext, useContext} from 'react';
import ChatStorageProvider from "../providers/ChatStorageProvider";
import UserStorageProvider from "../providers/UserStorageProvider";
import OrbitDBProvider from "../providers/DBProvider";


// This injector is used in the main application
export class DefaultInjector {
    createDBProvider() {
        return OrbitDBProvider.build();
    }
    createChatStorageProvider() {
        return new ChatStorageProvider();
    }
    createUserStorageProvider() {
        return new UserStorageProvider();
    }
}

const InjectorContext  = createContext(null);

// This provides the injector
export const InjectorProvider = ({children, injector}) => {
    return (
        <InjectorContext.Provider value={injector}>
            {children}
        </InjectorContext.Provider>
    );
}

export const useDependencyInjector = () => useContext(InjectorContext);
