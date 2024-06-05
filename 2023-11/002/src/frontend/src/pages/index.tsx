import "./page.css";
import { Link } from "react-router-dom";
import { Grid, Card, Heading } from "@aws-amplify/ui-react";
import PageBasicLayout from "../layouts/pageBasicLayout";
import { PageBaseProps } from "./pageProps";

export interface IndexPageProps extends PageBaseProps {}

export default function IndexPage(props: IndexPageProps) {
  const { isAuth } = props;

  return (
    <PageBasicLayout isAuth={isAuth}>
      <Grid
        className="PageContent"
        templateColumns="1fr 4fr 1fr"
        templateRows={"1fr 2fr 1fr"}
      >
        <Card className="PageContentCard" columnStart={2} rowStart={2}>
          <Heading level={3}>ファイル共有サービス ~ File Box ~</Heading>
          <div className="card">
            <p>安全で簡単なファイル共有サービスです。</p>
            <p>
              ひとりひとりのファイルを安全に管理し、必要な人にだけ共有することができます。
            </p>
          </div>
          <Link to="/report">問い合わせはこちら</Link>
        </Card>
      </Grid>
    </PageBasicLayout>
  );
}
