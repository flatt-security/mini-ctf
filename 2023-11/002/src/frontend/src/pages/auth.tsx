import "./page.css";
import { Authenticator, Card, Grid, Heading } from "@aws-amplify/ui-react";
import PageBasicLayout from "../layouts/pageBasicLayout";
import { PageBaseProps } from "./pageProps";
import { signUp } from "../hooks/useAuthentication";
import {
  ISignUpResult,
  CognitoUser,
  CodeDeliveryDetails,
} from "amazon-cognito-identity-js";
import { Navigate } from "react-router-dom";
import { Auth } from "aws-amplify";

export interface AuthPageProps extends PageBaseProps {}

export default function AuthPage(props: AuthPageProps) {
  const { isAuth } = props;
  if (isAuth) {
    return <Navigate replace to="/" />;
  }
  const components = {
    Header() {
      return (
        <Heading level={3} paddingBottom={20}>
          ファイル共有サービス
          <br /> ~ File Box ~
        </Heading>
      );
    },
    SignUp: {},
  };
  const services = {
    async handleSignUp(formData: {
      username: string;
      password: string;
      confirmPassword: string;
    }) {
      const { username, password } = formData;
      const passwordRegex = new RegExp(
        "^(?=.*[0-9])(?=.*[!-/:-@[-`{-~])(?=.*[A-Z])(?=.*[a-z])[!-~]{8,128}$",
      );
      if (!passwordRegex.test(password)) {
        throw new Error(
          "パスワードは少なくとも 1 つの数字、1 つの特殊文字、1 つの大文字、1 つの小文字を含む必要があります。",
        );
      }

      if (username.length < 4) {
        throw new Error("ユーザー名は 4 文字以上である必要があります。");
      }

      if (password.length < 8) {
        throw new Error("パスワードは 8 文字以上である必要があります。");
      }
      await signUp(username, password);
      const user = (await Auth.currentAuthenticatedUser()) as CognitoUser;
      props.setAuth(true);
      return {
        user: user,
        userConfirmed: true,
      };
    },
    async handleSignIn(formData: { username: string; password: string }) {
      const { username, password } = formData;
      const user = await Auth.signIn(username, password);
      props.setAuth(true);
      return user;
    },
  };

  return (
    <PageBasicLayout isAuth={isAuth}>
      <Grid templateColumns="1fr 4fr 1fr" templateRows="1fr 6fr 1fr">
        <Card columnStart={2} rowStart={2}>
          <Authenticator services={services} components={components}>
            {({ _ }) => {
              return <Navigate replace to="/" />;
            }}
          </Authenticator>
        </Card>
      </Grid>
    </PageBasicLayout>
  );
}
