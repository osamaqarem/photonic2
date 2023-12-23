resource "aws_s3_bucket" "bucket" {
  bucket = "photonic-cloudformation-templates"
}

resource "aws_s3_object" "object" {
  bucket = aws_s3_bucket.bucket.bucket
  key    = "template_${var.env}.json"
  source = "template_${var.env}.json"
}