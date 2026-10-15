# ==============================================================================
# NOITE FAMINTA: SANGUE & PRATA - TERRAFORM DEV ENVIRONMENT
# Arquitetura DevSecOps: Subnets privadas, encriptação em repouso e menor privilégio
# ==============================================================================

# Senha randômica segura para o banco de dados (não commitada)
resource "random_password" "db_password" {
  length           = 24
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

# Armazenamento seguro da senha no AWS Secrets Manager
resource "aws_secretsmanager_secret" "db_secret" {
  name                    = "noite-faminta-${var.environment}-db-credentials"
  recovery_window_in_days = 0 # Para dev; em prod utilizar 30 dias

  tags = {
    Name        = "noite-faminta-${var.environment}-db-credentials"
    Environment = var.environment
  }
}

resource "aws_secretsmanager_secret_version" "db_secret_val" {
  secret_id = aws_secretsmanager_secret.db_secret.id
  secret_string = jsonencode({
    username = var.db_username
    password = random_password.db_password.result
    database = var.db_name
  })
}

# ------------------------------------------------------------------------------
# Módulo de Rede Segura (VPC)
# ------------------------------------------------------------------------------
module "vpc" {
  source = "../../modules/vpc"

  vpc_cidr    = var.vpc_cidr
  environment = var.environment
  aws_region  = var.aws_region
}

# ------------------------------------------------------------------------------
# Módulo de Segurança (Security Groups restritivos)
# ------------------------------------------------------------------------------
module "security" {
  source = "../../modules/security"

  vpc_id      = module.vpc.vpc_id
  environment = var.environment
}

# ------------------------------------------------------------------------------
# Módulo de Banco de Dados PostgreSQL (Isolado em Subnet Privada)
# ------------------------------------------------------------------------------
module "database" {
  source = "../../modules/database"

  environment          = var.environment
  db_name              = var.db_name
  db_username          = var.db_username
  db_password          = random_password.db_password.result
  database_subnet_ids  = module.vpc.database_subnet_ids
  db_security_group_id = module.security.db_security_group_id
}
