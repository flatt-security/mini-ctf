import { useEffect, useState } from "react";
import { Auth } from "aws-amplify";
import "./App.css";
import { IndexContent } from "./content";
import { FlagContent } from "./content/flag";

function App() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  useEffect(() => {
    (async () => {
      try {
        await Auth.currentAuthenticatedUser();
        setIsSignedIn(true);
      } catch (e) {
        setIsSignedIn(false);
      }
    })();
  }, []);
  return <>{isSignedIn ? <FlagContent /> : <IndexContent />}</>;
}

export default App;
