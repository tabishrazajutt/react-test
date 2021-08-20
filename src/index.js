import React from "react";
import ReactDOM from "react-dom";
import Index from "./Tax/Index";
import UpdateOrCreate from "./Tax/UpdateOrCreate";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import urls from "./services/urls";
import { TaxesProvider } from "./services/taxes-context";

ReactDOM.render(
  <TaxesProvider>
    <Router>
      <Switch>
        <Route exact path={urls.taxesIndex} component={Index} />
        <Route
          path={[urls.taxesAdd, urls.taxesEdit]}
          component={UpdateOrCreate}
        />
      </Switch>
    </Router>
  </TaxesProvider>,
  document.getElementById("root")
);
