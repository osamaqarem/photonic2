# Terraform

This will cover the requirements for using Terraform across different apps.

## Setup

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
      // AWS Lambda
      "Action": [
        "iam:CreateRole",
        "iam:ListInstanceProfilesForRole",
        "iam:PutRolePolicy",
        "iam:DeleteRole",
        "iam:AttachRolePolicy"
      ],
      "Resource": "arn:aws:iam::123:role/*"
    },
    {
      // AWS Lambda logging to CloudWatch
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:ListTagsLogGroup",
        "logs:DeleteLogGroup"
      ],
      "Resource": "arn:aws:logs:eu-central-1:123:*"
    },
    {
      // Cloudformation template bucket & terraform state backend
      "Effect": "Allow",
      "Action": ["s3:*"],
      "Resource": "*"
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

## Usage

```shell
# Workspace
terraform select workspace staging

# Download providers
terraform init

# Create/update Lambda (staging)
terraform plan --var-file=staging.tfvars
terraform apply --var-file=staging.tfvars

# Get Lambda ARN
terraform output
```

## Notes

Several parameters are hardocded in the CFN template such as the user ARN and AWS Lambda name. Could be automated with Terraform outputs and a GitHub action.
