# 各種環境の構築
## 認証情報の入力(AWS)

IAM User やAWS SSOなどで取得した認証情報を、`/credentials/aws`に、下記のように記述する。

```toml
[default]
aws_access_key_id = <AWS_ACCESS_KEY_ID>
aws_secret_access_key = <AWS_SECRET_ACCESS_KEY>
```
# 環境の構築

```sh
$ docker compose build base --no-cache && docker compose build cdk --no-cache
$ mkdir -p credentials
$ touch credentials/aws
# AWSの認証情報をcredentials/awsに記述する
$ docker compose run -it --rm cdk cdk deploy \
  api-stack idp-stack web-stack -O /app/frontend/src/aws.json
$ docker compose run -it --rm frontend vite build
$ docker compose run -it --rm cdk cdk deploy \
  web-deploy-stack
```
