output "alb_security_group_id" {
  description = "ID do Security Group do ALB"
  value       = aws_security_group.alb.id
}

output "app_security_group_id" {
  description = "ID do Security Group da aplicação"
  value       = aws_security_group.app.id
}

output "db_security_group_id" {
  description = "ID do Security Group do banco PostgreSQL"
  value       = aws_security_group.database.id
}
