variable "env" {
  type = string
  description = "The environment to deploy to."
}

variable "region" {
  type = string
  description = "The AWS region to deploy to."
}

variable "domain" {
  type = string
  description = "The server domain to forward the CloudFormation event to."
}