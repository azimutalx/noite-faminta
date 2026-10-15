variable "environment" {
  description = "Ambiente de implantação (dev, staging, prod)"
  type        = string
}

variable "db_name" {
  description = "Nome do banco de dados relacional"
  type        = string
  default     = "noite_faminta_db"
}

variable "db_username" {
  description = "Nome do usuário administrador do PostgreSQL"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "Senha mestre do banco de dados (injetada via Secrets Manager)"
  type        = string
  sensitive   = true
}

variable "database_subnet_ids" {
  description = "Lista de IDs de subnets isoladas para o DB Subnet Group"
  type        = list(string)
}

variable "db_security_group_id" {
  description = "ID do Security Group restritivo para o PostgreSQL"
  type        = string
}

variable "instance_class" {
  description = "Classe da instância RDS PostgreSQL"
  type        = string
  default     = "db.t4g.micro"
}

variable "allocated_storage" {
  description = "Capacidade de armazenamento alocada em GiB"
  type        = number
  default     = 20
}

variable "multi_az" {
  description = "Habilitar redundância Multi-AZ para alta disponibilidade"
  type        = bool
  default     = false
}

variable "deletion_protection" {
  description = "Proteção contra destruição acidental da base de dados"
  type        = bool
  default     = false
}

variable "backup_retention_period" {
  description = "Período de retenção de backups diários automatizados (dias)"
  type        = number
  default     = 7
}
