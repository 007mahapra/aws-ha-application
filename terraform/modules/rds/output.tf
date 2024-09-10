output "rds_address" {
  value = aws_db_instance.rds.address # The hostname of the RDS instance
}