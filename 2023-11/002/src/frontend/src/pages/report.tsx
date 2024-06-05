import "./page.css";
import {
  Grid,
  Card,
  Heading,
  Button,
  Flex,
  Input,
  Text,
} from "@aws-amplify/ui-react";
import { PageBaseProps } from "./pageProps";

import PageBasicLayout from "../layouts/pageBasicLayout";
import { Label } from "aws-amplify-react";

export interface ContactPageProps extends PageBaseProps {}

export default function ContactPage(props: ContactPageProps) {
  const { isAuth } = props;
  return (
    <PageBasicLayout isAuth={isAuth}>
      <Grid
        className="PageContent"
        templateColumns="1fr 4fr 1fr"
        templateRows={"1fr 2fr 1fr"}
      >
        <Card
          className="PageContentCard"
          id="reportCard"
          columnStart={2}
          rowStart={2}
        >
          <Heading level={3}>Report</Heading>
          <Label>管理者の確認が必要なページはこちらまで</Label>
          <Flex as="form" direction="column" width="100%">
            <Flex direction="column" gap="small">
              <Label htmlFor="url">
                URL
                <Text as="span" fontSize="small" color="font.error">
                  {" "}
                  (required)
                </Text>
              </Label>
              <Input
                id="url"
                name="url"
                type="url"
                isRequired={true}
                placeholder={`https://${document.domain}`}
              />
            </Flex>
            <Button type="submit">Submit</Button>
          </Flex>
        </Card>
      </Grid>
    </PageBasicLayout>
  );
}
