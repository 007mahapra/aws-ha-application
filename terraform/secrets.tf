# Store secret for DB in SM
resource "aws_secretsmanager_secret" "db_credentials" {
  name = var.db_secret_name
}

# Create a new secret version containing the database credentials
resource "aws_secretsmanager_secret_version" "db_credentials_version" {
  secret_id = aws_secretsmanager_secret.db_credentials.id
  secret_string = jsonencode({
    host     = module.rds.rds_address
    username = var.rds_db_admin
    password = var.rds_db_password
    
  })
}