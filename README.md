# Photonic

## Server

Import secrets:

```
flyctl --app [app_name] secrets import < ./apps/next/.env
```

To import secrets from a file:

```
flyctl --app [app_name] secrets import < ./apps/next/.env
```

To build Docker image locally:

```
docker build . -o output -f ./apps/next/Dockerfile
```

Scale memory to 512 MB to survive `prisma migrate deploy`:

```
fly scale memory 512 -a [app_name]
```

## DB

Creation:

```
fly pg create
fly pg attach --app [app_name] [database_name]
# Redploying the app with the updated secret is now required.
```

Proxy connection URL will be in the format `postgres://user_name:password@localhost:5432/user_name`

## Cache

Docker image
https://github.com/osamaqarem/redis

The names of the fly app and volume are what's different between production and staging.

Creation:

```
cd /redis
fly apps create
fly volumes create [vol_name] --region ams
fly secrets set REDIS_PASSWORD=****
fly deploy # don't allocate IP addresses
flyctl ips allocate-v6
```

Connection URL will be in the format `redis://default:password=@[ipv6_address]:10000`

## Terraform

- Create a new AWS user (non-root)
- Create an S3 bucket called `photonic-tfstate`. Terraform state will be stored [there](https://developer.hashicorp.com/terraform/language/settings/backends/s3).

The AWS user must have the following permissions:

- `AWSLambda_FullAccess`
- `iam:AttachRolePolicy`
- Inline policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "iam:CreateRole",
        "iam:ListInstanceProfilesForRole",
        "iam:PutRolePolicy",
        "iam:DeleteRole",
        "iam:AttachRolePolicy"
      ],
      // Replace '123' with the actual ARN of the user
      "Resource": "arn:aws:iam::123:role/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:ListTagsLogGroup",
        "logs:DeleteLogGroup"
      ],
      "Resource": "arn:aws:logs:eu-central-1:123:*"
    },
    {
      "Effect": "Allow",
      "Action": "s3:ListBucket",
      "Resource": "arn:aws:s3:::photonic-tfstate"
    },
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::photonic-tfstate/*/state/terraform.tfstate"
    },
    {
      "Effect": "Allow",
      "Action": "s3:ListBucket",
      "Resource": "arn:aws:s3:::mybucket"
    },
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::photonic-tfstate/key"
    }
  ]
}
```

- Create a profile named `photonic` on the current machine with the AWS credentials for the new user:

```shell
# Path $HOME/.aws/credentials
[default]
aws_access_key_id=
aws_secret_access_key=
[photonic]
aws_access_key_id=
aws_secret_access_key=
```

### Usage

```shell
# Workspace
terraform workspace select staging

# Download providers
terraform init

# Create/update Lambda (staging)
terraform plan --var-file=staging.tfvars
terraform apply --var-file=staging.tfvars

# Get Lambda ARN
terraform output
```

## Notes

- CFN template
  - Several parameters are hardcoded e.g. AWS user ARN, Lambda name
  - The template URL has to be set as a secret for the Next app.
  - Should update S3 access policy to match bucket name
