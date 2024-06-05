import { useState, useEffect } from "react";
import "./page.css";
import PageBasicLayout from "../layouts/pageBasicLayout";
import { Auth } from "aws-amplify";
import {
  Card,
  Grid,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  Button,
} from "@aws-amplify/ui-react";
import aws from "../aws.json";
import { PageBaseProps } from "./pageProps";

export interface FilePageProps extends PageBaseProps {}

const apiGwURL = aws["missbox-api-stack"].missboxapiapiurl;

//GET - /v1/box/list テナントに属するS3のオブジェクト一覧を返却する
async function getFiles() {
  try {
    const token = (await Auth.currentSession()).getIdToken().getJwtToken();
    const response = await fetch(`${apiGwURL}box/list`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const files = await response.json();
    return files;
  } catch (error) {
    alert(error);
    return [];
  }
}

// POST - /v1/box/signed-url/get S3へのGET用の署名付きURLを返却する
async function getFileUrl(fileName: string) {
  try {
    const token = (await Auth.currentSession()).getIdToken().getJwtToken();
    const response = await fetch(`${apiGwURL}box/signed-url/get`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: fileName,
      }),
    });
    if (response.status !== 200) {
      throw new Error("Failed to get file url");
    }
    const { signedUrl }: { signedUrl: string } = await response.json();
    return signedUrl;
  } catch (error) {
    alert(error);
    return "Error";
  }
}

// POST - /v1/box/signed-url/put S3へのPUT用の署名付きURLを返却する
async function getFileUploadUrl(file: File) {
  try {
    const token = (await Auth.currentSession()).getIdToken().getJwtToken();
    const response = await fetch(`${apiGwURL}box/signed-url/put`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: file.name,
        contentType: file.type,
        size: file.size,
      }),
    });
    if (response.status !== 200) {
      throw new Error("Failed to get upload url");
    }
    const { url }: { url: string } = await response.json();
    return url;
  } catch (error) {
    alert(error);
    return "Error";
  }
}

// POST - /v1/box/signed-url/delete S3へのDELETE用の署名付きURLを返却する
async function deleteFileUrl(fileName: string) {
  try {
    const token = (await Auth.currentSession()).getIdToken().getJwtToken();
    const response = await fetch(`${apiGwURL}box/signed-url/delete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: fileName,
      }),
    });
    if (response.status !== 200) {
      throw new Error("Failed to get delete url");
    }
    const { signedUrl }: { signedUrl: string } = await response.json();
    return signedUrl;
  } catch (error) {
    alert(error);
    return "Error";
  }
}

async function uploadFile(url: string, file: File) {
  // urlに対してfileをPUTする
  // putの際はExpect: 100-continueでリクエストを送る

  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Expect: "100-continue",
        "Content-Type": file.type,
      },
      body: file,
    });
    if (response.status !== 200) {
      throw new Error("Failed to upload file");
    }
    return true;
  } catch (error) {
    alert(error);
    return false;
  }
}

async function deleteFile(url: string) {
  // urlに対してfileをDELETEする
  try {
    const response = await fetch(url, {
      method: "DELETE",
    });
    if (response.status !== 204) {
      throw new Error("Failed to delete file");
    }
    return true;
  } catch (error) {
    alert(error);
    return false;
  }
}

export default function FilePage(props: FilePageProps) {
  const { isAuth } = props;
  const [fileList, setFileList] = useState([""]);
  const [isUpload, setUploadCondition] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [tableBody, setTableBody] = useState(
    <TableCell colSpan={2}>No files</TableCell>,
  );

  const onChangeFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileItem = event.target.files?.item(0);
    if (fileItem === undefined) {
      alert("Please select file");
      return;
    }
    setFile(fileItem);
  };

  useEffect(() => {
    (async () => {
      const files = await getFiles();
      setFileList(files);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const body = fileList.map((fileName) => {
        return (
          <TableRow key={fileName}>
            <TableCell>{fileName}</TableCell>
            <TableCell>
              <Button
                variation="primary"
                onClick={async () => {
                  const url = await getFileUrl(fileName);
                  window.open(url, "_blank");
                }}
              >
                Download
              </Button>
            </TableCell>
            <TableCell>
              <Button
                variation="primary"
                onClick={async () => {
                  const url = await deleteFileUrl(fileName);
                  await deleteFile(url);
                  const files = await getFiles();
                  setFileList(files);
                }}
              >
                Delete
              </Button>
            </TableCell>
          </TableRow>
        );
      });
      setTableBody(<>{body}</>);
    })();
  }, [fileList]);

  return (
    <PageBasicLayout isAuth={isAuth}>
      <Grid templateColumns="1fr 4fr 1fr">
        <Card columnStart={2} maxHeight="80vh" overflow="scroll">
          <Grid templateColumns="1fr" templateRows="1fr 8fr">
            <Card rowStart={1}>
              <input type="file" hidden={true} onChange={onChangeFile} />
              <Button
                width={"100%"}
                marginBottom={10}
                onClick={() => {
                  (
                    document.querySelector(
                      'input[type="file"]',
                    ) as HTMLInputElement
                  ).click();
                }}
              >
                Select File
              </Button>
              <Button
                isLoading={isUpload}
                isDisabled={file ? false : true}
                width={"100%"}
                loadingText="Loading..."
                onClick={async () => {
                  const file = (
                    document.querySelector(
                      'input[type="file"]',
                    ) as HTMLInputElement
                  ).files?.item(0);
                  setUploadCondition(true);
                  if (file === undefined || file === null) {
                    alert("Please select file");
                    return;
                  }
                  const url = await getFileUploadUrl(file);
                  if (url === "Error") {
                    alert("Failed to get upload url");
                    setUploadCondition(false);
                    return;
                  }

                  if (await uploadFile(url, file)) {
                    const files = await getFiles();
                    setFile(null);
                    setFileList(files);
                  } else {
                    alert("Upload Not Success");
                  }
                  setUploadCondition(false);
                }}
                variation="primary"
              >
                {file ? file.name : ""} Upload
              </Button>
            </Card>
            <Card rowStart={2}>
              <Table
                caption=""
                highlightOnHover={false}
                textAlign={"left"}
                marginTop={30}
                marginBottom={20}
              >
                <TableHead>
                  <TableRow>
                    <TableCell as="th">File Name</TableCell>
                    <TableCell as="th">Link</TableCell>
                    <TableCell as="th">Delete</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>{tableBody}</TableBody>
              </Table>
            </Card>
          </Grid>
        </Card>
      </Grid>
    </PageBasicLayout>
  );
}
