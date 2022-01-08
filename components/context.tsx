import { ThemeProps } from "pages/_app";
import { createContext } from "react";
import { cssRootVars } from "styles/globalVars";

interface ContextState {
  theme: string;
  values: ThemeProps;
  toggleTheme: () => void;
}

const InitialContextState: ContextState = {
  theme: "light",
  values: cssRootVars,
  toggleTheme: () => {},
};

const Context = createContext<ContextState>(InitialContextState);

export default Context;
