# ==============================================================================
# Módulo de Rede Segura (VPC) - Noite Faminta: Sangue & Prata
# Arquitetura com Subnets Isoladas e Sem Acesso Público Direto ao Banco
# ==============================================================================

resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "noite-faminta-${var.environment}-vpc"
    Environment = var.environment
  }
}

# Subnets Públicas (Apenas para Load Balancer / NAT Gateway)
resource "aws_subnet" "public_1" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = cidrsubnet(var.vpc_cidr, 8, 1)
  availability_zone       = "${var.aws_region}a"
  map_public_ip_on_launch = true

  tags = {
    Name        = "noite-faminta-${var.environment}-public-1"
    Environment = var.environment
    Type        = "public"
  }
}

resource "aws_subnet" "public_2" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = cidrsubnet(var.vpc_cidr, 8, 2)
  availability_zone       = "${var.aws_region}b"
  map_public_ip_on_launch = true

  tags = {
    Name        = "noite-faminta-${var.environment}-public-2"
    Environment = var.environment
    Type        = "public"
  }
}

# Subnets Privadas de Aplicação (API Fastify)
resource "aws_subnet" "app_1" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = cidrsubnet(var.vpc_cidr, 8, 10)
  availability_zone       = "${var.aws_region}a"
  map_public_ip_on_launch = false

  tags = {
    Name        = "noite-faminta-${var.environment}-app-1"
    Environment = var.environment
    Type        = "private-app"
  }
}

resource "aws_subnet" "app_2" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = cidrsubnet(var.vpc_cidr, 8, 11)
  availability_zone       = "${var.aws_region}b"
  map_public_ip_on_launch = false

  tags = {
    Name        = "noite-faminta-${var.environment}-app-2"
    Environment = var.environment
    Type        = "private-app"
  }
}

# Subnets Isoladas de Banco de Dados (PostgreSQL RDS)
resource "aws_subnet" "db_1" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = cidrsubnet(var.vpc_cidr, 8, 20)
  availability_zone       = "${var.aws_region}a"
  map_public_ip_on_launch = false

  tags = {
    Name        = "noite-faminta-${var.environment}-db-1"
    Environment = var.environment
    Type        = "isolated-db"
  }
}

resource "aws_subnet" "db_2" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = cidrsubnet(var.vpc_cidr, 8, 21)
  availability_zone       = "${var.aws_region}b"
  map_public_ip_on_launch = false

  tags = {
    Name        = "noite-faminta-${var.environment}-db-2"
    Environment = var.environment
    Type        = "isolated-db"
  }
}

# Internet Gateway para tráfego de saída controlado
resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name        = "noite-faminta-${var.environment}-igw"
    Environment = var.environment
  }
}

# Tabela de Roteamento Pública
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }

  tags = {
    Name        = "noite-faminta-${var.environment}-rt-public"
    Environment = var.environment
  }
}

resource "aws_route_table_association" "pub_1" {
  subnet_id      = aws_subnet.public_1.id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "pub_2" {
  subnet_id      = aws_subnet.public_2.id
  route_table_id = aws_route_table.public.id
}

# Tabela de Roteamento Isolada para Banco de Dados (Sem rota para a Internet)
resource "aws_route_table" "isolated_db" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name        = "noite-faminta-${var.environment}-rt-isolated-db"
    Environment = var.environment
  }
}

resource "aws_route_table_association" "db_1" {
  subnet_id      = aws_subnet.db_1.id
  route_table_id = aws_route_table.isolated_db.id
}

resource "aws_route_table_association" "db_2" {
  subnet_id      = aws_subnet.db_2.id
  route_table_id = aws_route_table.isolated_db.id
}
