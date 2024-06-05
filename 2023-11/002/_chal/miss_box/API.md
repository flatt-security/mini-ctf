# API

- [API](#api)
  - [POST - /v1/signup](#post---v1signup)
    - [疎通確認](#疎通確認)
  - [POST - /v1/box/signed-url/put](#post---v1boxsigned-urlput)
    - [Request](#request)
    - [疎通確認](#疎通確認-1)
  - [POST - /v1/box/signed-url/get](#post---v1boxsigned-urlget)
    - [Request](#request-1)
    - [疎通確認](#疎通確認-2)
  - [POST - /v1/box/signed-url/delete](#post---v1boxsigned-urldelete)
    - [Request](#request-2)
    - [疎通確認](#疎通確認-3)
  - [GET - /v1/box/list](#get---v1boxlist)
  - [POST - /v1/report](#post---v1report)

**疎通確認時に使用する環境変数**
変数に必要な値を設定してください。

```sh
USERNAME=""
PASSWORD=""
CLIENT_ID=""
URL=""
```

## POST - /v1/signup

Cognitoのユーザーを作成するためのエンドポイント。
ユーザー作成時にテナントを作成し、Cogntioの属性にテナントIDを設定します。
passwordは、Cognitoの初回ログイン時に使用するためのもので、このAPIのレスポンスで返却されるtemporaryPasswordを使用して、Cognitoの初回ログインを行います。

### 疎通確認

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"${USERNAME}\"}" \
  $URL/signup
```

レスポンスで temporaryPassword が返却されるので、Cognitoの初回ログイン時に使用する。

```bash
TEMPORARY_PASSWORD=$(curl -X POST \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"${USERNAME}\"}"\
  $URL/signup | jq -r '.temporaryPassword')

SESSION=$(aws cognito-idp initiate-auth \
  --auth-flow USER_PASSWORD_AUTH \
  --client-id $CLIENT_ID \
  --auth-parameters USERNAME=$USERNAME,PASSWORD=$TEMPORARY_PASSWORD \
  --region ap-northeast-1 \
  --no-sign-request | jq -r '.Session')


# NEW_PASSWORD_REQUIRED
aws cognito-idp respond-to-auth-challenge \
  --client-id $CLIENT_ID \
  --challenge-name NEW_PASSWORD_REQUIRED \
  --challenge-responses USERNAME=$USERNAME,NEW_PASSWORD=$PASSWORD \
  --session $SESSION \
  --region ap-northeast-1 \
  --no-sign-request
```

ログインの際は、Cognitoのinitiate-authを用いて以下のようにします。

```bash
aws cognito-idp initiate-auth \
  --auth-flow USER_PASSWORD_AUTH \
  --client-id $CLIENT_ID \
  --auth-parameters USERNAME=$USERNAME,PASSWORD=$PASSWORD \
  --region ap-northeast-1 \
  --no-sign-request
```

## POST - /v1/box/signed-url/put

S3へのPUT用の署名付きURLを返却する。

### Request

- name - ファイル名
  - 画像系のファイルのみ対応
- contentType - ファイルのコンテンツタイプ
  - 画像のみ対応
- size - ファイルサイズ

```json
{
  "name": "test.png",
  "contentType": "image/png",
  "size": 0
}
```

### 疎通確認

```bash
mkdir -p tmp
echo -n iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAAAAAA6fptVAAAACklEQVQIHWP4DwABAQEANl9ngAAAAABJRU5ErkJggg== > tmp/test.jpg
SIZE=$(wc -c tmp/test.jpg | awk '{print $1}')
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ID_TOKEN" \
  -d "{\"name\": \"test.png\", \"contentType\": \"image/jpeg\", \"size\": ${SIZE}}" \
  $URL/box/signed-url/put
```

**sample**

```bash
ID_TOKEN=$(aws cognito-idp initiate-auth \
  --auth-flow USER_PASSWORD_AUTH \
  --client-id $CLIENT_ID \
  --auth-parameters USERNAME=$USERNAME,PASSWORD=$PASSWORD \
  --region ap-northeast-1 \
  --no-sign-request | jq -r '.AuthenticationResult.IdToken')
mkdir -p tmp
echo -n iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAAAAAA6fptVAAAACklEQVQIHWP4DwABAQEANl9ngAAAAABJRU5ErkJggg== > tmp/test.jpg
SIZE=$(wc -c tmp/test.jpg | awk '{print $1}')
UPLOAD_URL=$(curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ID_TOKEN" \
  -d "{\"name\": \"test.png\", \"contentType\": \"image/jpeg\", \"size\": ${SIZE}}" \
  $URL/box/signed-url/put | jq -r '.url' )

curl -X PUT \
  -H "Content-Type: image/jpeg" \
  --upload-file tmp/test.png \
  $UPLOAD_URL
```

## POST - /v1/box/signed-url/get

S3へのGET用の署名付きURLを返却する

### Request

- name - アップロードされたファイル名

```json
{
  "name": "test.png"
}
```

### 疎通確認
```sh
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ID_TOKEN" \
  -d "{\"name\": \"177065de-17ff-42a4-acf3-aa651dbb14d8.png\"}" \
  $URL/box/signed-url/get | jq -r '.url'
```

## POST - /v1/box/signed-url/delete

S3へのDELETE用の署名付きURLを返却する
### Request

- name - アップロードされたファイル名

```json
{
  "name": "test.png"
}
```

### 疎通確認
```sh
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ID_TOKEN" \
  -d "{\"name\": \"$FILE_ID\"}" \
  $URL/box/signed-url/delete
```

## GET - /v1/box/list

テナントに属するS3のオブジェクト一覧を返却する。

```bash
curl $URL/box/list \
  -H "Authorization: Bearer $ID_TOKEN"
```

## POST - /v1/report

URLを管理者に通知するためのエンドポイント。

```bash
URL="https://rp065n90h5.execute-api.ap-northeast-1.amazonaws.com/v1"
curl -XPOST \
  -H "Content-Type: application/json" \
  -d "{\"url\": \"https://d1vkt6984bn7xr.cloudfront.net/\"}" \
  $URL/report
```


