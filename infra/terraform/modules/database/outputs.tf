output "db_endpoint" {
  description = "Endpoint de conexão do banco de dados PostgreSQL"
  value       = aws_db_instance.postgres.endpoint
}

output "db_address" {
  description = "Hostname de conexão do PostgreSQL"
  value       = aws_db_instance.postgres.address
}

output "db_port" {
  description = "Porta do PostgreSQL"
  value       = aws_db_instance.postgres.port
}

output "db_arn" {
  description = "ARN da instância RDS"
  value       = aws_db_instance.postgres.arn
}
