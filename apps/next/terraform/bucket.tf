resource "aws_s3_bucket" "bucket" {
  bucket = "photonic-cloudformation-templates"
}

locals {
  file_path = "template_${var.env}.json"
}

resource "aws_s3_bucket_ownership_controls" "ownership" {
  bucket = aws_s3_bucket.bucket.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_object" "template" {
  depends_on = [ aws_s3_bucket_public_access_block.public ]
  bucket = aws_s3_bucket.bucket.bucket
  key    = local.file_path
  source = local.file_path
  etag   = filemd5(local.file_path)
  acl    = "public-read"
}

resource "aws_s3_bucket_public_access_block" "public" {
  bucket = aws_s3_bucket.bucket.id
  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

output "template_url" {
  value = "https://${aws_s3_object.template.bucket}.s3.${var.region}.amazonaws.com/${aws_s3_object.template.key}"
}