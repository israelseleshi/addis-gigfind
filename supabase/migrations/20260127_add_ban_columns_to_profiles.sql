-- Migration: Add ban columns to profiles table
-- Created: 2026-01-27

-- Add ban columns to profiles table
alter table profiles 
add column if not exists is_banned boolean default false,
add column if not exists ban_reason text;
