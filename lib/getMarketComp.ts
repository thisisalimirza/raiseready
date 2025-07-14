import { MarketData } from '@/types'

// Mock market data API - in production, integrate with Glassdoor, PayScale, etc.
export async function getMarketComp(jobTitle: string, location: string): Promise<MarketData> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500))

  // Mock data based on common job titles and locations
  const mockData = generateMockSalaryData(jobTitle, location)

  return {
    average: mockData.average,
    p25: mockData.p25,
    p75: mockData.p75,
    source: 'Market Research API (Mock Data)'
  }
}

function generateMockSalaryData(jobTitle: string, location: string) {
  // Base salary multipliers for different roles
  const roleMultipliers: { [key: string]: number } = {
    'software engineer': 1.0,
    'senior software engineer': 1.4,
    'staff engineer': 1.8,
    'principal engineer': 2.2,
    'engineering manager': 1.6,
    'senior engineering manager': 2.0,
    'director of engineering': 2.5,
    'product manager': 1.2,
    'senior product manager': 1.6,
    'data scientist': 1.1,
    'senior data scientist': 1.5,
    'designer': 0.9,
    'senior designer': 1.3,
    'marketing manager': 1.0,
    'sales manager': 1.1,
    'default': 1.0
  }

  // Location multipliers
  const locationMultipliers: { [key: string]: number } = {
    'san francisco': 1.8,
    'new york': 1.6,
    'seattle': 1.4,
    'boston': 1.3,
    'los angeles': 1.2,
    'austin': 1.1,
    'denver': 1.0,
    'chicago': 1.0,
    'atlanta': 0.9,
    'remote': 1.2,
    'default': 1.0
  }

  // Base salary for software engineer
  const baseSalary = 100000

  // Get multipliers
  const roleKey = jobTitle.toLowerCase()
  const locationKey = location.toLowerCase()
  
  const roleMultiplier = roleMultipliers[roleKey] || roleMultipliers['default']
  const locationMultiplier = locationMultipliers[locationKey] || locationMultipliers['default']

  // Calculate average salary
  const average = Math.round(baseSalary * roleMultiplier * locationMultiplier)

  // Calculate percentiles (p25 is 15% below average, p75 is 20% above average)
  const p25 = Math.round(average * 0.85)
  const p75 = Math.round(average * 1.20)

  return { average, p25, p75 }
}