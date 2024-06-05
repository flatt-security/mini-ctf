import React from "react";
import ReactDOM from "react-dom/client";

import "@aws-amplify/ui-react/styles.css";
import "./index.css";
import { Amplify } from "aws-amplify";
import { Authenticator } from "@aws-amplify/ui-react";
import aws from "./aws.json";
import App from ".";

const config = {
  Auth: {
    region: "ap-northeast-1",
    userPoolId: aws["missbox-idp-stack"].missboxidpuserpoolid,
    userPoolWebClientId: aws["missbox-idp-stack"].missboxidpuserpoolclientid,
    authenticationFlowType: "USER_PASSWORD_AUTH",
  },
};

Amplify.configure(config);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Authenticator.Provider>
      <App />
    </Authenticator.Provider>
  </React.StrictMode>,
);
