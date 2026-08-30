// update-env.js
// Run this script immediately after setup-pins.js completes.
// It reads the message IDs saved to new-message-ids.json and writes
// them into your .env file automatically.
//
// Usage:
//   node update-env.js

const fs = require('fs').promises;
const path = require('path');

const IDS_FILE = path.join(__dirname, 'new-message-ids.json');
const ENV_FILE = path.join(__dirname, '.env');

const EXPECTED_KEYS = [
  'UO_PINNED_MSG_ID',
  'IA_PINNED_MSG_ID',
  'EU_PINNED_MSG_ID',
  'HHN_PINNED_MSG_ID',
  'ALL_PARKS_PINNED_MSG_ID'
];

async function updateEnvFile() {
  let newIds;
  try {
    newIds = JSON.parse(await fs.readFile(IDS_FILE, 'utf8'));
  } catch {
    console.error('❌ Could not read new-message-ids.json.');
    console.error('   Make sure you ran setup-pins.js successfully before running this script.');
    process.exit(1);
  }

  let envContent;
  try {
    envContent = await fs.readFile(ENV_FILE, 'utf8');
  } catch {
    console.error('❌ Could not read .env file.');
    console.error('   Make sure a .env file exists in the project root.');
    process.exit(1);
  }

  const updated = [];
  const skipped = [];

  for (const key of EXPECTED_KEYS) {
    const value = newIds[key];

    if (!value) {
      skipped.push(key);
      continue;
    }

    if (envContent.includes(`${key}=`)) {
      envContent = envContent.replace(
        new RegExp(`^${key}=.*$`, 'm'),
        `${key}=${value}`
      );
      updated.push(`${key}=${value}`);
    } else {
      envContent = envContent.trimEnd() + `\n${key}=${value}\n`;
      updated.push(`${key}=${value}  (added)`);
    }
  }

  await fs.writeFile(ENV_FILE, envContent);

  console.log('\n✅ .env file updated successfully!\n');

  if (updated.length > 0) {
    console.log('Updated:');
    updated.forEach(line => console.log(`  ${line}`));
  }

  if (skipped.length > 0) {
    console.log('\n⚠️  Skipped (setup-pins.js reported these as FAILED):');
    skipped.forEach(key => console.log(`  ${key}`));
    console.log('   Re-run setup-pins.js to retry the failed channels.');
  }

  try {
    await fs.unlink(IDS_FILE);
  } catch {
    // not critical
  }

  console.log('\nYou can now start the bot:');
  console.log('  npm start\n');
}

updateEnvFile();
