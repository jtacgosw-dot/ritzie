import jwt from 'jsonwebtoken';
import { AuthContext } from '../types/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

export function generateVisitorJWT(payload: AuthContext): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

export function verifyVisitorJWT(token: string): AuthContext {
  return jwt.verify(token, JWT_SECRET) as AuthContext;
}

export function extractSiteFromToken(siteToken: string): { org_id: string; site_id: string } {
  const tokenMap: Record<string, { org_id: string; site_id: string }> = {
    'SITE_demo_site1': {
      org_id: '550e8400-e29b-41d4-a716-446655440001',
      site_id: '550e8400-e29b-41d4-a716-446655440011'
    },
    'SITE_demo_site2': {
      org_id: '550e8400-e29b-41d4-a716-446655440002', 
      site_id: '550e8400-e29b-41d4-a716-446655440012'
    }
  };

  if (tokenMap[siteToken]) {
    return tokenMap[siteToken];
  }

  const parts = siteToken.split('_');
  if (parts.length !== 3 || parts[0] !== 'SITE') {
    throw new Error('Invalid site token format');
  }
  return {
    org_id: parts[1],
    site_id: parts[2]
  };
}
