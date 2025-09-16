import { createConnection } from '../apps/gateway/dist/utils/db.js';
import { randomBytes } from 'crypto';

async function rotateSiteToken(siteId) {
  const db = await createConnection();
  
  try {
    // Generate new token
    const newToken = `SITE_${randomBytes(16).toString('hex')}`;
    
    // Update site token
    const result = await db.query(
      'UPDATE sites SET site_token = $1 WHERE id = $2 RETURNING site_token, domain',
      [newToken, siteId]
    );
    
    if (result.rows.length === 0) {
      console.error(`❌ Site not found: ${siteId}`);
      process.exit(1);
    }
    
    const site = result.rows[0];
    console.log(`✅ Site token rotated for ${site.domain}`);
    console.log(`New token: ${site.site_token}`);
    console.log(`⚠️  Update client embed snippets with new token!`);
    
  } catch (error) {
    console.error('❌ Token rotation failed:', error.message);
    process.exit(1);
  } finally {
    await db.end();
  }
}

// Parse command line args
const args = process.argv.slice(2);
const siteArg = args.find(arg => arg.startsWith('--site='));

if (!siteArg) {
  console.error('Usage: node scripts/rotate_site_token.mjs --site=SITE_xxx');
  process.exit(1);
}

const siteId = siteArg.split('=')[1];
rotateSiteToken(siteId);
