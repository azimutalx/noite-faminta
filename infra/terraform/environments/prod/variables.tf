variable "aws_region" {
  description = "Região da AWS para provisionamento de Produção"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Nome do ambiente"
  type        = string
  default     = "prod"
}

variable "vpc_cidr" {
  description = "Bloco CIDR da VPC de Produção"
  type        = string
  default     = "10.10.0.0/16"
}

variable "db_name" {
  description = "Nome do banco de dados PostgreSQL de Produção"
  type        = string
  default     = "noite_faminta_prod_db"
}

variable "db_username" {
  description = "Usuário mestre do banco de dados"
  type        = string
  default     = "noite_prod_admin"
  sensitive   = true
}

variable "db_instance_class" {
  description = "Classe da instância de banco de dados em produção (Multi-AZ)"
  type        = string
  default     = "db.t4g.medium"
}
