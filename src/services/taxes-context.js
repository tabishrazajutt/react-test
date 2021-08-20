import * as React from "react";

const TaxesContext = React.createContext();

function taxReducer(state, action) {
  switch (action.type) {
    case "taxes": {
      return { taxes: action.payload };
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

function TaxesProvider({ children }) {
  const [state, dispatch] = React.useReducer(taxReducer, { taxes: [] });
  const value = { state, dispatch };
  return (
    <TaxesContext.Provider value={value}>{children}</TaxesContext.Provider>
  );
}

function useTaxes() {
  const context = React.useContext(TaxesContext);
  if (context === undefined) {
    throw new Error("useTaxes must be used within a TaxesProvider");
  }
  return context;
}

export { TaxesProvider, useTaxes };
