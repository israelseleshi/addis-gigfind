import { LOCATIONS } from './types/locations';

export const industries = [
  "Technology",
  "Marketing",
  "Design",
  "E-commerce",
  "Healthcare",
  "Education",
  "Finance",
  "Real Estate",
  "Manufacturing",
  "Other",
]

export const experienceLevels = [
  "Beginner (0-1 years)",
  "Intermediate (1-3 years)",
  "Advanced (3-5 years)",
  "Expert (5+ years)",
]

export const locations = [...LOCATIONS] as const;
