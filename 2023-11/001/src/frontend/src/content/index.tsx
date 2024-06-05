import { Authenticator, Heading, useTheme } from "@aws-amplify/ui-react";
import "../index.css";
import { FlagContent } from "./flag";

export const IndexContent = () => {
  const components = {
    SignIn: {
      Header() {
        const { tokens } = useTheme();

        return (
          <Heading
            level={3}
            slot="header"
            padding={`${tokens.space.xl} 0 0 ${tokens.space.xl}`}
            color={tokens.colors.neutral[80]}
          >
            Admin Sign In
          </Heading>
        );
      },
      Footer() {
        return <></>;
      },
    },
  };
  return (
    <>
      <Authenticator hideSignUp={true} components={components}>
        {({}) => {
          return <FlagContent />;
        }}
      </Authenticator>
    </>
  );
};
