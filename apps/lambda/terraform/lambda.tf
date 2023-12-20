data "external" "build" {
  program = ["npx", "zx", "./scripts/build.mjs"]
}

data "aws_iam_policy_document" "assume_role" {
  statement {
    effect        = "Allow"
    actions       = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "photonic_lambda_iam_role" {
  name               = "photonic_lambda_iam_role_${var.env}"
  assume_role_policy = data.aws_iam_policy_document.assume_role.json
}

resource "aws_lambda_function" "connect_to_photonic" {
  description      = "(${var.env}) Lambda that receives the CFN template creation event"
  filename         = "${path.module}/../${data.external.build.result.path}"
  function_name    =  "connect_to_photonic_${var.env}"
  role             = aws_iam_role.photonic_lambda_iam_role.arn
  handler          = "index.handler"

  source_code_hash = filebase64sha256("${path.module}/../${data.external.build.result.path}")

  environment {
    variables = {
      "DOMAIN" = "${var.domain}"
    }
  }

  runtime          = "nodejs18.x"
  architectures    = ["arm64"]
  memory_size      = 128
  timeout          = 3
  ephemeral_storage {
    size = 512
  }
}

resource "aws_lambda_permission" "allow_public_access" {
  function_name    = aws_lambda_function.connect_to_photonic.function_name
  statement_id     = "PublicAccess"
  principal        = "*"
  action           = "lambda:InvokeFunction"
}