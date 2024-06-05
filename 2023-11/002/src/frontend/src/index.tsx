import { BrowserRouter, Route, Routes } from "react-router-dom";
import IndexPage from "./pages/index";
import AuthPage from "./pages/auth";
import FilePage from "./pages/file";
import ContactPage from "./pages/report";
import SignOut from "./pages/signout";
import { useState } from "react";
import { Auth } from "aws-amplify";

export default function App() {
  const [isAuth, setAuth] = useState(false);
  (async () => {
    try {
      await Auth.currentAuthenticatedUser();
      setAuth(true);
    } catch (error) {
      setAuth(false);
    }
  })();
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/auth"
          element={<AuthPage isAuth={isAuth} setAuth={setAuth} />}
        />
        <Route path="/signout" element={<SignOut />} />
        <Route
          path="/file"
          element={<FilePage isAuth={isAuth} setAuth={setAuth} />}
        />
        <Route
          path="/report"
          element={<ContactPage isAuth={isAuth} setAuth={setAuth} />}
        />
        <Route
          path="/*"
          element={<IndexPage isAuth={isAuth} setAuth={setAuth} />}
        />
      </Routes>
    </BrowserRouter>
  );
}
