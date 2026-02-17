#!/bin/bash
# Creates the cms_dev database for local development.
# Run this after PostgreSQL is installed.

psql postgres -c "CREATE DATABASE cms_dev;" 2>/dev/null || psql -U postgres -c "CREATE DATABASE cms_dev;"
echo "Database cms_dev created (or already exists)."
