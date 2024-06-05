import { Card, Grid } from "@aws-amplify/ui-react";
import PageAuthHeader from "../../components/page/header/auth";
import PageNoAuthHeader from "../../components/page/header/noAuth";
import { Link } from "react-router-dom";
import "./index.css";

interface PageBasicLayoutProps {
  children: React.ReactNode;
  isAuth: boolean;
}

export default function PageBasicLayout(props: PageBasicLayoutProps) {
  return (
    <div className="App">
      <Grid className="AppGrid" templateRows="1fr 10fr 1fr">
        <Card className="AppHeader" rowStart={1}>
          {props.isAuth ? (
            <PageAuthHeader isAuth={props.isAuth} />
          ) : (
            <PageNoAuthHeader isAuth={props.isAuth} />
          )}
        </Card>
        <Card className="AppBody" rowStart={2}>
          {props.children}
        </Card>
        <Card className="AppFooter" rowStart={3}>
          <Link id="footerLink" to="/report">
            問い合わせはこちら
          </Link>
        </Card>
      </Grid>
    </div>
  );
}
