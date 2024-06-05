import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "@aws-amplify/ui-react/styles.css";
import { Amplify } from "aws-amplify";
import { Authenticator } from "@aws-amplify/ui-react";
import environ from "./aws.json";

Amplify.configure({
  Auth: {
    region: "ap-northeast-1",
    userPoolId: environ["idp-stack"].idpuserpoolid,
    userPoolWebClientId: environ["idp-stack"].idpuserpoolclientid,
    authenticationFlowType: "USER_PASSWORD_AUTH",
    identityPoolId: "",
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Authenticator.Provider>
      <App />
    </Authenticator.Provider>
  </React.StrictMode>,
);
