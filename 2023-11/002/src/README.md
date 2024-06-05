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
PREFIX=missbox # にランダムな文字列を含んだ任意のプレフィックスを指定する
docker compose run -it --rm cdk cdk deploy $PREFIX-container-stack
docker compose run -it --rm cdk cdk deploy $PREFIX-web-stack
docker compose run -it --rm cdk cdk deploy $PREFIX-api-stack $PREFIX-idp-stack -O /app/frontend/src/aws.json
docker compose run -it --rm frontend vite build
docker compose run -it --rm cdk cdk deploy $PREFIX-web-deploy-stack
```