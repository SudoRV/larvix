import { createContext, useContext, useState } from "react";

const GlobalContext = createContext();

export function GlobalProvider({ children }) {
    // Tool states
    const [toolState, setToolState] = useState({
        branch: false,
        voice: false,
        comment: false,
        settingsPanel: false,
    });

    const value = {
        toolState,
        setToolState,
    };

    return (
        <GlobalContext.Provider value={value}>
            {children}
        </GlobalContext.Provider>
    );
}

export function useStates() {
    return useContext(GlobalContext);
}