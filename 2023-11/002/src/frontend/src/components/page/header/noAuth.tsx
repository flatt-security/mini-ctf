import PageHeaderBase from ".";
import { Link } from "react-router-dom";
import { Heading } from "@aws-amplify/ui-react";

export default function PageNoAuthHeader(props: { isAuth: boolean }) {
  return (
    <PageHeaderBase title="File Box Advance" isAuth={props.isAuth}>
      <Link className="AppPageHeaderRightContent" to="/auth">
        <Heading level={4} color={"white"}>
          Signin / Signup
        </Heading>
      </Link>
    </PageHeaderBase>
  );
}
