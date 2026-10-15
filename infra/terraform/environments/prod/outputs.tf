output "vpc_id" {
  description = "ID da VPC de produção"
  value       = module.vpc.vpc_id
}

output "db_endpoint" {
  description = "Endpoint do PostgreSQL RDS de produção"
  value       = module.database.db_endpoint
}

output "secrets_manager_arn" {
  description = "ARN do segredo com as credenciais do banco no Secrets Manager"
  value       = aws_secretsmanager_secret.db_secret.arn
}
