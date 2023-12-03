# @photonic/lambda Terraform

## AWS Credentials

- The AWS user must have the following permissions:

- `AWSLambda_FullAccess`
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
        "iam:DeleteRole"
      ],
      // Replace '123' with the actual ARN of the user
      "Resource": "arn:aws:iam::123:role/*"
    }
  ]
}
```

- Create a profile named `photonic` on the current machine with the AWS credentials for that user

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
