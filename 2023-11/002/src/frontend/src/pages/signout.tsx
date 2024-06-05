import { Auth } from "aws-amplify";
export default function SignOut() {
  Auth.signOut();
  location.href = "/";
  return <></>;
}
