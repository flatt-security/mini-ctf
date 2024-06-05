import { Card, Grid, Heading } from "@aws-amplify/ui-react";
import "./index.css";
import { Link } from "react-router-dom";

interface PageHeaderBaseProps {
  title: string;
  children: React.ReactNode;
  isAuth: boolean;
}

export default function PageHeaderBase(props: PageHeaderBaseProps) {
  return (
    <Grid className="AppPageHeader" templateColumns="3fr 2fr 3fr">
      <Card columnStart={1} rowStart={1} className="AppPageHeaderLeft">
        <Link to={props.isAuth ? "/file" : "/"}>
          <Heading level={4} color={"white"}>
            {props.title}
          </Heading>
        </Link>
      </Card>
      <Card columnStart={3} rowStart={1} className="AppPageHeaderRight">
        {props.children}
      </Card>
    </Grid>
  );
}
