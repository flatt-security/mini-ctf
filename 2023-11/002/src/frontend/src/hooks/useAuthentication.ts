import { Auth } from "aws-amplify";
import aws from "../aws.json";

export async function signUp(username: string, password: string) {
  const signUpResponse = await fetch(
    `${aws["missbox-api-stack"].missboxapiapiurl}signup`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: username,
      }),
    },
  );
  const signUpResponseJson = await signUpResponse.json();
  if (signUpResponse.status !== 200) {
    throw new Error((signUpResponseJson as { message: string }).message);
  }
  const temporaryPassword = (
    signUpResponseJson as {
      temporaryPassword: string;
    }
  ).temporaryPassword;
  const signInResult = await Auth.signIn(username, temporaryPassword);
  if (signInResult.challengeName !== "NEW_PASSWORD_REQUIRED") {
    throw new Error("Unexpected challengeName");
  }
  return await Auth.completeNewPassword(signInResult, password);
}
