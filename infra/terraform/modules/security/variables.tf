variable "vpc_id" {
  description = "ID da VPC para associar os Security Groups"
  type        = string
}

variable "environment" {
  description = "Ambiente de implantação (dev, staging, prod)"
  type        = string
}

variable "public_ingress_cidrs" {
  description = "Blocos CIDR autorizados para o balanceador perimetral"
  type        = list(string)
  default     = ["10.0.0.0/8"]
}

variable "egress_cidr_blocks" {
  description = "Blocos CIDR autorizados para saída da aplicação"
  type        = list(string)
  default     = ["10.0.0.0/8"]
}
