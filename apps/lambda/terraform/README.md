# @photonic/lambda Terraform

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
          "logs:CreateLogGroup"
          "logs:ListTagsLogGroup"
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
			"Action": [
				"s3:GetObject",
				"s3:PutObject",
				"s3:DeleteObject"
			],
			"Resource": "arn:aws:s3:::photonic-tfstate/*/state/terraform.tfstate"
		}
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

The Lambda name and user ARN are considered in the CFN template. If the patterns change, the template will need a manual patch.
