import { TypedData } from "interfaces/typeline";
import { ThemeProps } from "pages/_app";
import { createContext } from "react";
import { cssRootVars } from "styles/globalVars";

interface ContextState {
  theme: string;
  values: ThemeProps;
  typedState: TypedData[];
  addTypedState: (typed: string) => void;
  toggleTheme: () => void;
}

const InitialContextState: ContextState = {
  theme: "light",
  values: cssRootVars,
  typedState: [],
  addTypedState: () => {},
  toggleTheme: () => {}
};

const Context = createContext<ContextState>(InitialContextState);

export default Context;
