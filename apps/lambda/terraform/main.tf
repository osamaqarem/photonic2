terraform {
  backend "s3" {
    bucket = "photonic-tfstate"
    key    = "state/terraform.tfstate"
    region = "eu-central-1"
    shared_credentials_files = ["$HOME/.aws/credentials"]
    profile                  = "photonic"
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.16"
    }
  }

  required_version = ">= 1.2.0"
}

provider "aws" {
  shared_credentials_files = ["$HOME/.aws/credentials"]
  profile                  = "photonic"
  region                   = var.region
}