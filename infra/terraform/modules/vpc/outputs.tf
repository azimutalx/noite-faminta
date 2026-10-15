output "vpc_id" {
  description = "ID da VPC criada"
  value       = aws_vpc.main.id
}

output "public_subnet_ids" {
  description = "IDs das subnets públicas"
  value       = [aws_subnet.public_1.id, aws_subnet.public_2.id]
}

output "app_subnet_ids" {
  description = "IDs das subnets privadas de aplicação"
  value       = [aws_subnet.app_1.id, aws_subnet.app_2.id]
}

output "database_subnet_ids" {
  description = "IDs das subnets isoladas de banco de dados"
  value       = [aws_subnet.db_1.id, aws_subnet.db_2.id]
}
