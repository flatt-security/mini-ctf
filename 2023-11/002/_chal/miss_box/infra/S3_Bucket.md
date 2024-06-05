# missbox-web-web-host-bucket

`missbox-web-web-host-bucket`はFile BoxのWebホスト用S3バケットです。
前段にCloudFrontを配置しており、CloudFrontのOrigin Access Identityからと、署名済みURLからのみアクセス可能です。

## Bucket policy

ユーザーのアップロードしたファイルは、`tenant:*`ディレクトリ以下に保存されます。
`tenant:*`ディレクトリ以下のファイルは、XSSが発生した際に被害を最小限にするために、CloudFrontのOrigin Access Identityからはアクセスできないようになっています。

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::726319149498:role/missbox-web-stack-CustomS3AutoDeleteObjectsCustomRe-c4JUL3m2XCN2"
            },
            "Action": [
                "s3:DeleteObject*",
                "s3:GetBucket*",
                "s3:List*",
                "s3:PutBucketPolicy"
            ],
            "Resource": [
                "arn:aws:s3:::missbox-web-web-host-bucket",
                "arn:aws:s3:::missbox-web-web-host-bucket/*"
            ]
        },
        {
            "Effect": "Deny",
            "Principal": {
                "AWS": "arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity E3L334UU9D1DRW"
            },
            "Action": "s3:GetObject",
            "Resource": [
                "arn:aws:s3:::missbox-web-web-host-bucket/tenant:*",
                "arn:aws:s3:::missbox-web-web-host-bucket/tenant:*/*"
            ]
        },
        {
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity E3L334UU9D1DRW"
            },
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::missbox-web-web-host-bucket/*"
        }
    ]
}
```
