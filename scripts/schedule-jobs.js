#!/usr/bin/env node

import { Queue } from 'bullmq';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const ingestQueue = new Queue('ingest', { connection: redis });

async function scheduleJobs() {
  console.log('🔄 Scheduling production jobs...');
  
  await ingestQueue.add('faq-aggregation', {}, {
    repeat: { pattern: '0 2 * * *' },
    removeOnComplete: 10,
    removeOnFail: 5,
    jobId: 'faq-aggregation-daily'
  });
  
  await ingestQueue.add('analytics-rollup', {}, {
    repeat: { pattern: '0 1 * * *' },
    removeOnComplete: 10,
    removeOnFail: 5,
    jobId: 'analytics-rollup-daily'
  });
  
  console.log('✅ Jobs scheduled successfully');
  console.log('   - FAQ aggregation: Daily at 2 AM');
  console.log('   - Analytics rollup: Daily at 1 AM');
  
  await redis.quit();
}

scheduleJobs().catch(console.error);
