#!/bin/bash

# Configuration - Replace with your project ref if running against remote
PROJECT_REF="antdjephswvrvbyxukqu"

echo "Fetching Schema Audit..."
supabase query "SELECT table_name, column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_schema = 'public' ORDER BY table_name;" --project-ref $PROJECT_REF > supabase_schema_audit.json

echo "Fetching Policies Audit..."
supabase query "SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check FROM pg_policies WHERE schemaname = 'public';" --project-ref $PROJECT_REF > supabase_policies_audit.json

echo "Fetching Indexes Audit..."
supabase query "SELECT indexname, tablename, indexdef FROM pg_indexes WHERE schemaname = 'public' ORDER BY tablename, indexname;" --project-ref $PROJECT_REF > supabase_indexes_audit.json

echo "Fetching Triggers Audit..."
supabase query "SELECT trigger_name, event_object_table, action_statement, action_timing, event_manipulation FROM information_schema.triggers WHERE trigger_schema = 'public' ORDER BY event_object_table, trigger_name;" --project-ref $PROJECT_REF > supabase_triggers_audit.json

echo "Done! All metadata saved to .json files."