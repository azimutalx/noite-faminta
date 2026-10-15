terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.5"
    }
  }

  # Backend seguro com encriptação e bloqueio de estado (S3 + DynamoDB)
  # backend "s3" {
  #   bucket         = "noite-faminta-tfstate-dev"
  #   key            = "dev/terraform.tfstate"
  #   region         = "us-east-1"
  #   encrypt        = true
  #   dynamodb_table = "noite-faminta-tflocks"
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "NoiteFaminta"
      Environment = var.environment
      ManagedBy   = "Terraform"
      Security    = "Strict-DevSecOps"
    }
  }
}
