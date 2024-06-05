import { useEffect, useState } from "react";
import { Auth } from "aws-amplify";
import { Heading, useTheme } from "@aws-amplify/ui-react";
import environ from "../aws.json";

export const FlagContent = () => {
  const { tokens } = useTheme();
  const [message, setMessage] = useState(<>FLAG is ...</>);
  useEffect(() => {
    (async () => {
      if (localStorage.getItem("flag") === null) {
        const authenticationToken = (await Auth.currentSession())
          .getIdToken()
          .getJwtToken();
        try {
          const flag = (
            await (
              await fetch(`${environ["api-stack"].apiapiurl}/flag`, {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${authenticationToken}`,
                },
              })
            ).json()
          ).flag as string;
          localStorage.setItem("flag", flag);
          setMessage(
            <>
              FLAG is <b>{localStorage.getItem("flag")}</b> congratulations !
            </>,
          );
        } catch (e) {
          setMessage(<>You are not Admin user.</>);
        }
      } else {
        setMessage(
          <>
            FLAG is <b>{localStorage.getItem("flag")}</b> congratulations !
          </>,
        );
      }
    })();
  }, []);
  return (
    <>
      <Heading level={3} color={tokens.colors.white}>
        {message}
      </Heading>
    </>
  );
};
