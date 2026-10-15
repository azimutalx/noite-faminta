variable "aws_region" {
  description = "Região da AWS para provisionamento"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Nome do ambiente (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "vpc_cidr" {
  description = "Bloco CIDR da VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "db_name" {
  description = "Nome do banco de dados PostgreSQL"
  type        = string
  default     = "noite_faminta_db"
}

variable "db_username" {
  description = "Usuário mestre do banco de dados (gerenciado via Secret Manager em prod)"
  type        = string
  default     = "noite_admin"
  sensitive   = true
}
