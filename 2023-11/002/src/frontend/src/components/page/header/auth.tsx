import PageHeaderBase from ".";
import { Heading } from "@aws-amplify/ui-react";
import { Link } from "react-router-dom";
export default function PageAuthHeader(props: { isAuth: boolean }) {
  return (
    <PageHeaderBase title="File Box Advance" isAuth={props.isAuth}>
      <Link className="AppPageHeaderRightContent" to="/signout">
        <Heading level={4} color={"white"}>
          SignOut
        </Heading>
      </Link>
    </PageHeaderBase>
  );
}
