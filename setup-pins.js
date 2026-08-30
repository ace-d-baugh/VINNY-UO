// setup-pins.js
// Run this script ONCE before starting the bot for the first time.
// It creates and pins the placeholder messages in all park channels and
// the all-parks overview channel, then saves the message IDs so
// update-env.js can write them into your .env file automatically.
//
// Usage:
//   node setup-pins.js
//   node update-env.js   (run immediately after to write IDs to .env)

const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs').promises;
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
});

const PARKS = {
  UO: {
    name: 'Universal Studios Florida',
    shortName: 'UO',
    channelId: process.env.UO_CHANNEL_ID,
    envKey: 'UO_PINNED_MSG_ID'
  },
  IA: {
    name: 'Islands of Adventure',
    shortName: 'IA',
    channelId: process.env.IA_CHANNEL_ID,
    envKey: 'IA_PINNED_MSG_ID'
  },
  EU: {
    name: 'Epic Universe',
    shortName: 'EU',
    channelId: process.env.EU_CHANNEL_ID,
    envKey: 'EU_PINNED_MSG_ID'
  },
  HHN: {
    name: 'Halloween Horror Nights',
    shortName: 'HHN',
    channelId: process.env.HHN_CHANNEL_ID,
    envKey: 'HHN_PINNED_MSG_ID'
  }
};

function validateEnv() {
  const required = [
    'DISCORD_TOKEN',
    'UO_CHANNEL_ID', 'IA_CHANNEL_ID', 'EU_CHANNEL_ID',
    'ALL_PARKS_STATUS_CHANNEL_ID'
  ];
  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    console.error('❌ Missing required .env variables:');
    missing.forEach(key => console.error(`   ${key}`));
    console.error('\nPlease fill these in before running setup-pins.js.');
    process.exit(1);
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

client.once('ready', async () => {
  console.log(`\nLogged in as ${client.user.tag}`);
  console.log('=== CREATING PINNED MESSAGES ===\n');

  const newMessageIds = {};

  for (const [parkKey, park] of Object.entries(PARKS)) {
    if (!park.channelId) {
      console.log(`⚠️  Skipping ${parkKey} — no channel ID set in .env`);
      continue;
    }

    try {
      console.log(`Creating pinned message for ${park.name}...`);
      const channel = await client.channels.fetch(park.channelId);

      if (!channel) {
        console.log(`  ❌ Channel not found (ID: ${park.channelId})`);
        continue;
      }

      const message = await channel.send(
        `${park.shortName} | Loading hours... | 🚫\n\`\`\`\nWaiting for VINNY...\n\`\`\``
      );
      await message.pin();

      newMessageIds[park.envKey] = message.id;
      console.log(`  ✅ Created & pinned  →  ${park.envKey}=${message.id}`);

      await delay(1000);
    } catch (error) {
      console.error(`  ❌ Error for ${parkKey}: ${error.message}`);
    }
  }

  const allParksChannelId = process.env.ALL_PARKS_STATUS_CHANNEL_ID;
  if (allParksChannelId) {
    try {
      console.log('\nCreating pinned message for All Parks overview...');
      const channel = await client.channels.fetch(allParksChannelId);

      if (!channel) {
        console.log(`  ❌ Channel not found (ID: ${allParksChannelId})`);
      } else {
        const message = await channel.send(
          `All Parks | Loading... | 🚫\n\`\`\`\nWaiting for VINNY...\n\`\`\``
        );
        await message.pin();

        newMessageIds['ALL_PARKS_PINNED_MSG_ID'] = message.id;
        console.log(`  ✅ Created & pinned  →  ALL_PARKS_PINNED_MSG_ID=${message.id}`);
      }
    } catch (error) {
      console.error(`  ❌ Error for All Parks: ${error.message}`);
    }
  } else {
    console.log('\n⚠️  Skipping All Parks — ALL_PARKS_STATUS_CHANNEL_ID not set in .env');
  }

  console.log('\n=== SETUP COMPLETE ===\n');

  const expectedCount = Object.values(PARKS).filter(p => p.channelId).length + (allParksChannelId ? 1 : 0);
  const allSucceeded = Object.keys(newMessageIds).length === expectedCount;
  if (!allSucceeded) {
    console.log('⚠️  Some messages could not be created. Check the errors above.');
    console.log('   Fix the issues, delete any messages created this run, and try again.\n');
  }

  console.log('New pinned message IDs:');
  const envKeys = [
    'UO_PINNED_MSG_ID', 'IA_PINNED_MSG_ID',
    'EU_PINNED_MSG_ID', 'HHN_PINNED_MSG_ID', 'ALL_PARKS_PINNED_MSG_ID'
  ];
  envKeys.forEach(key => {
    console.log(`  ${key}=${newMessageIds[key] || 'FAILED'}`);
  });

  await fs.writeFile('new-message-ids.json', JSON.stringify(newMessageIds, null, 2));

  console.log('\n📝 Next step: run the following command to write these IDs into your .env file:');
  console.log('   node update-env.js\n');
  console.log('   Or copy the IDs above and update your .env file manually.\n');

  process.exit(0);
});

validateEnv();
client.login(process.env.DISCORD_TOKEN);
