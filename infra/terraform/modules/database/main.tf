# ==============================================================================
# Módulo de Banco de Dados PostgreSQL (RDS) - Noite Faminta: Sangue & Prata
# Arquitetura DevSecOps: Criptografia em Repouso, Isolamento e Resiliência
# ==============================================================================

resource "aws_db_subnet_group" "main" {
  name        = "noite-faminta-${var.environment}-db-subnet-group"
  description = "Grupo de subnets isoladas para o cluster PostgreSQL"
  subnet_ids  = var.database_subnet_ids

  tags = {
    Name        = "noite-faminta-${var.environment}-db-subnet-group"
    Environment = var.environment
  }
}

resource "aws_db_instance" "postgres" {
  identifier                 = "noite-faminta-${var.environment}-db"
  allocated_storage          = var.allocated_storage
  max_allocated_storage      = var.allocated_storage * 5
  storage_type               = "gp3"
  engine                     = "postgres"
  engine_version             = "15.4"
  instance_class             = var.instance_class
  db_name                    = var.db_name
  username                   = var.db_username
  password                   = var.db_password
  port                       = 5432
  publicly_accessible        = false
  storage_encrypted          = true
  multi_az                   = var.multi_az
  deletion_protection        = var.deletion_protection
  auto_minor_version_upgrade = true
  backup_retention_period    = var.backup_retention_period
  skip_final_snapshot        = var.environment != "prod"
  final_snapshot_identifier  = var.environment == "prod" ? "noite-faminta-prod-final-${formatdate("YYYYMMDDhhmmss", timestamp())}" : null

  vpc_security_group_ids = [var.db_security_group_id]
  db_subnet_group_name   = aws_db_subnet_group.main.name

  tags = {
    Name        = "noite-faminta-${var.environment}-db"
    Environment = var.environment
    Engine      = "PostgreSQL-ACID"
  }

  lifecycle {
    ignore_changes = [final_snapshot_identifier]
  }
}
