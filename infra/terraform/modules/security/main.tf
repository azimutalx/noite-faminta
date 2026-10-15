# ==============================================================================
# Módulo de Segurança (Security Groups) - Noite Faminta: Sangue & Prata
# Arquitetura Zero-Trust: Menor privilégio e isolamento de banco de dados
# ==============================================================================

# Security Group para o Application Load Balancer (ALB)
resource "aws_security_group" "alb" {
  name        = "noite-faminta-${var.environment}-alb-sg"
  description = "Controle de acesso perimetral para o Load Balancer"
  vpc_id      = var.vpc_id

  ingress {
    description = "HTTPS seguro para clientes do jogo"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = var.public_ingress_cidrs
  }

  ingress {
    description = "HTTP com redirecionamento obrigatorio para HTTPS"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = var.public_ingress_cidrs
  }

  egress {
    description = "Saida controlada para subnets de aplicacao"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = var.egress_cidr_blocks
  }

  tags = {
    Name        = "noite-faminta-${var.environment}-alb-sg"
    Environment = var.environment
  }
}

# Security Group para a Camada de Aplicação (API Fastify Node.js)
resource "aws_security_group" "app" {
  name        = "noite-faminta-${var.environment}-app-sg"
  description = "Acesso restrito a API Fastify a partir do ALB"
  vpc_id      = var.vpc_id

  ingress {
    description     = "Trafego recebido exclusivamente do Load Balancer"
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    description = "Saida para comunicacao controlada"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = var.egress_cidr_blocks
  }

  tags = {
    Name        = "noite-faminta-${var.environment}-app-sg"
    Environment = var.environment
  }
}

# Security Group para a Camada de Dados (PostgreSQL RDS)
# Proibido qualquer acesso irrestrito
resource "aws_security_group" "database" {
  name        = "noite-faminta-${var.environment}-db-sg"
  description = "Isolamento estrito: aceita conexao PostgreSQL exclusivamente da API"
  vpc_id      = var.vpc_id

  ingress {
    description     = "PostgreSQL transacional aceito somente dos pods/containers da aplicacao"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.app.id]
  }

  egress {
    description = "Sem saida livre para internet a partir do banco"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["10.0.0.0/16"]
  }

  tags = {
    Name        = "noite-faminta-${var.environment}-db-sg"
    Environment = var.environment
  }
}
