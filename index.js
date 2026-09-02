const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
});

// Configuration
const CONFIG = {
  API_URL: 'https://api.themeparks.wiki/v1/entity/89db5d43-c434-4097-b71f-f6869f495a22/live',
  SCHEDULE_API_URL: 'https://api.themeparks.wiki/v1/entity/{id}/schedule',
  POLL_INTERVAL: 10000, // 10 seconds
  DATA_FILE: path.join(__dirname, 'parkData.json'),
  MESSAGE_LOG_FILE: path.join(__dirname, 'messageLog.json'),
  PARKS: {
    UO: {
      name: 'Universal Studios Florida',
      shortName: 'UO',
      id: 'eb3f4560-2383-4a36-9152-6b3e5ed6bc57',
      emoji: '<:uo:1496201269856043049>',
      channelId: process.env.UO_CHANNEL_ID,
      pinnedMsgId: process.env.UO_PINNED_MSG_ID
    },
    IA: {
      name: 'Islands of Adventure',
      shortName: 'IA',
      id: '267615cc-8943-4c2a-ae2c-5da728ca591f',
      emoji: '<:ia:1496201311421468724>',
      channelId: process.env.IA_CHANNEL_ID,
      pinnedMsgId: process.env.IA_PINNED_MSG_ID
    },
    EU: {
      name: 'Epic Universe',
      shortName: 'EU',
      id: '12dbb85b-265f-44e6-bccf-f1faa17211fc',
      emoji: '<:eu:1496201338860736715>',
      channelId: process.env.EU_CHANNEL_ID,
      pinnedMsgId: process.env.EU_PINNED_MSG_ID
    }
  },
  ALL_PARKS: {
    channelId: process.env.ALL_PARKS_STATUS_CHANNEL_ID,
    pinnedMsgId: process.env.ALL_PARKS_PINNED_MSG_ID
  },
  WAIT_CHANGE_CHANNEL_ID: process.env.WAIT_CHANGE_CHANNEL_ID,
  WAIT_CHANGE_THRESHOLD: 20  // minutes — alert when wait shifts by this amount or more
};

const ATTRACTIONS = {
  UO: [
    { name: "E.T. Adventure™", shortName: "E.T.", id: "1e16afdd-15e3-4e4a-b3af-8aeebd7534f8", channelId: process.env.E_T_CHANNEL_ID },
    { name: "Fast & Furious - Supercharged™", shortName: "Fast & Furious", id: "6a3ffac7-bef4-4a22-8ba6-f2963aac7f70", channelId: process.env.FAST_FURIOUS_CHANNEL_ID },
    { name: "Harry Potter and the Escape from Gringotts™", shortName: "Gringotts", id: "70ac72a3-9675-4c41-a1b1-e4801072927a", channelId: process.env.GRINGOTTS_CHANNEL_ID },
    { name: "Hogwarts™ Express - King's Cross Station", shortName: "King's Cross", id: "f0750e5e-7629-4c53-99d2-e0924a8afeed", channelId: process.env.H_E_KINGS_CROSS_CHANNEL_ID },
    { name: "Race Through New York Starring Jimmy Fallon™", shortName: "Jimmy Fallon", id: "625a3cc3-7d7e-468b-96fe-1ec00df7b739", channelId: process.env.JIMMY_FALLON_CHANNEL_ID },
    { name: "MEN IN BLACK™ Alien Attack!™", shortName: "MIB", id: "91cae293-64f8-48b6-88ec-02dcfcdd1f91", channelId: process.env.MIB_CHANNEL_ID },
    { name: "Despicable Me Minion Mayhem", shortName: "Minions", id: "7288f24a-396e-4eeb-bb3b-4a90e65269f2", channelId: process.env.MINIONS_CHANNEL_ID },
    { name: "Revenge of the Mummy™", shortName: "Mummy", id: "ec25d9a7-b4d4-4ebf-a6c4-c18389351764", channelId: process.env.MUMMY_CHANNEL_ID },
    { name: "The Simpsons Ride™", shortName: "Simpsons", id: "7e70bc9e-7dce-4dd2-8823-57b8d6ec7570", channelId: process.env.SIMPSONS_CHANNEL_ID },
    { name: "TRANSFORMERS™: The Ride-3D", shortName: "Transformers", id: "750939c5-a69e-408a-8d55-66c272fa265e", channelId: process.env.TRANSFORMERS_CHANNEL_ID },
    { name: "Trolls Trollercoaster", shortName: "Trollercoaster", id: "37989fb7-5576-4247-bd6e-e981bc70cca2", channelId: process.env.TROLLERCOASTER_CHANNEL_ID },
    { name: "Kang & Kodos' Twirl 'n' Hurl", shortName: "Twirl 'n' Hurl", id: "96e71193-49f0-40b2-9bba-644e530d8115", channelId: process.env.TWIRL_HURL_CHANNEL_ID },
    { name: "Illumination's Villain-Con Minion Blast", shortName: "Villain-Con", id: "25d47d04-a917-405a-9904-9be2b499b2dd", channelId: process.env.VILLAIN_CON_CHANNEL_ID },
  ],
  IA: [
    { name: "One Fish, Two Fish, Red Fish, Blue Fish™", shortName: "1 Fish 2 Fish", id: "b1e94e05-b360-4e3f-be8a-2a3744a97f97", channelId: process.env["1_FISH_2_FISH_CHANNEL_ID"] },
    { name: "Caro-Seuss-el™", shortName: "Caro-Seuss-el", id: "3cb52134-e9d6-4212-83c8-3ce1321dcb05", channelId: process.env.CARO_SEUSS_EL_CHANNEL_ID },
    { name: "The Cat in The Hat™", shortName: "Cat in the Hat", id: "2365495a-790b-4a41-831e-65592c8a4359", channelId: process.env.CAT_IN_HAT_CHANNEL_ID },
    { name: "Harry Potter and the Forbidden Journey™", shortName: "Forbidden Journey", id: "6af80308-647d-4d8b-bcf6-37517a93bdbc", channelId: process.env.FORBIDDEN_JOURNEY_CHANNEL_ID },
    { name: "Hogwarts™ Express - Hogsmeade™ Station", shortName: "Hogsmeade", id: "144450b9-4574-46be-abdf-4b1ca8974d9d", channelId: process.env.H_E_HOGSMEADE_CHANNEL_ID },
    { name: "Hagrid's Magical Creatures Motorbike Adventure™", shortName: "Hagrid's", id: "578bbd12-1975-4ec3-9879-ea641c780342", channelId: process.env.HAGRIDS_CHANNEL_ID },
    { name: "Flight of the Hippogriff™", shortName: "Hippogriff", id: "23b613e0-ae83-455b-9163-231bdbd5c427", channelId: process.env.HIPPOGRIFF_CHANNEL_ID },
    { name: "The Incredible Hulk Coaster®", shortName: "Hulk", id: "fa743143-281b-4b5b-b87b-d49fcb006772", channelId: process.env.HULK_CHANNEL_ID },
    { name: "Jurassic Park River Adventure™", shortName: "JP River Adventure", id: "db5b2165-15c2-4e51-8bd1-611e9c351866", channelId: process.env.JP_RIVER_ADVENTURE_CHANNEL_ID },
    { name: "Skull Island: Reign of Kong™", shortName: "Kong", id: "370ba4d1-f199-4dc2-be6d-6bb09b442891", channelId: process.env.KONG_CHANNEL_ID },
    { name: "Popeye & Bluto's Bilge-Rat Barges®", shortName: "Popeye Barges", id: "b4445a1c-4d5c-4fca-a04a-f8867f1b6619", channelId: process.env.POPEYE_CHANNEL_ID },
    { name: "Pteranodon Flyers™", shortName: "Pteranodon Flyers", id: "3daca54f-50f0-44e9-a993-d706ce7520a0", channelId: process.env.PTERANODON_CHANNEL_ID },
    { name: "Dudley Do-Right's Ripsaw Falls®", shortName: "Ripsaw Falls", id: "905d7888-b866-4e74-90d1-07fc6ef6706f", channelId: process.env.RIPSAW_FALLS_CHANNEL_ID },
    { name: "The High in the Sky Seuss Trolley Train Ride!™", shortName: "Seuss Trolley", id: "b73e3256-9ee0-439e-9a3b-ffed287e10bb", channelId: process.env.SEUSS_TROLLY_CHANNEL_ID },
    { name: "The Amazing Adventures of Spider-Man®", shortName: "Spider-Man", id: "6be23178-7d00-4884-9e88-76787da1df86", channelId: process.env.SPIDER_MAN_CHANNEL_ID },
    { name: "Storm Force Accelatron®", shortName: "Storm Force", id: "b694d5a5-155e-4796-af7e-5dbdcf3deba4", channelId: process.env.STORM_FORCE_CHANNEL_ID },
    { name: "Jurassic World VelociCoaster", shortName: "VelociCoaster", id: "61079a31-4165-4fb0-b36f-c01c5971f80a", channelId: process.env.VELOCICOASTER_CHANNEL_ID }
  ],
  EU: [
    { name: "Constellation Carousel", shortName: "Constellation", id: "07143999-bacd-475f-a00b-8cc476204aff", channelId: process.env.CONSTELLATION_CHANNEL_ID },
    { name: "Mine-Cart Madness™", shortName: "Donkey Kong", id: "dd8c015d-511f-47d4-b98b-18ce15735588", channelId: process.env.MINE_CART_CHANNEL_ID },
    { name: "Dragon Racer's Rally", shortName: "Dragon Racers", id: "76caa8d0-f54b-4601-9d57-a7f1ddc02af4", channelId: process.env.DRAGON_RACERS_CHANNEL_ID },
    { name: "Fyre Drill", shortName: "Fyre Drill", id: "281bc9e6-b208-4a70-85d2-0fb749c7658b", channelId: process.env.FYRE_DRILL_CHANNEL_ID },
    { name: "Mario Kart™: Bowser's Challenge", shortName: "Mario Kart", id: "43df71bf-aa7c-46c0-925c-46f69d8bf23f", channelId: process.env.MARIO_KART_CHANNEL_ID },
    { name: "Harry Potter and the Battle at the Ministry™", shortName: "Ministry", id: "dbc4f0d8-fdef-4dfc-a1c2-33917f742f40", channelId: process.env.MINISTRY_CHANNEL_ID },
    { name: "Monsters Unchained: The Frankenstein Experiment", shortName: "Monsters", id: "1fda5e1f-8712-4165-a81d-ad74eef3e8ee", channelId: process.env.MONSTERS_CHANNEL_ID },
    { name: "Stardust Racers", shortName: "Stardust", id: "447033ce-ee1f-4cca-bb12-47d22583ac12", channelId: process.env.STARDUST_CHANNEL_ID },
    { name: "Curse of the Werewolf", shortName: "Werewolf", id: "eaca831d-bcbb-4a1e-9bf0-6ea97ccc88e0", channelId: process.env.WEREWOLF_CHANNEL_ID },
    { name: "Hiccup Wing Glider", shortName: "Wing Glider", id: "c6b1b8cf-55ef-416c-b00d-e469993617b0", channelId: process.env.WING_GLIDERS_CHANNEL_ID },
    { name: "Yoshi's Adventure™", shortName: "Yoshi", id: "00feb57b-4fcc-48bc-9490-c9af71f30c1c", channelId: process.env.YOSHI_CHANNEL_ID }
  ],
  HHN: [
    { name: "INVASION: Alien Abduction", shortName: "Alien", id: "53ac1ddd-51b1-4b5b-a72b-3a7b3e25397a", channelId: process.env.ALIEN_CHANNEL_ID },
    { name: "H.R. Bloodengutz Presents: A Halloween Fright-Tacular", shortName: "Bloodengutz", id: "99accf82-ca8d-425d-abc8-33e69aee75e9", channelId: process.env.BLOODENGUTZ_CHANNEL_ID },
    { name: "Cybergoria", shortName: "Cybergoria", id: "41c4491c-f3d9-41e5-963c-21a10a255b39", channelId: process.env.CYBERGORIA_CHANNEL_ID },
    { name: "Evil Dead Burn", shortName: "Evil Dead", id: "be4bc36e-e2d8-474b-9ea7-74c0e3e6c82d", channelId: process.env.EVIL_DEAD_CHANNEL_ID },
    { name: "Hellraiser", shortName: "Hellraiser", id: "98ac6a78-0320-4949-8824-934d0e73e4e2", channelId: process.env.HELLRAISER_CHANNEL_ID },
    { name: "Jack & Oddfellow: Chaos & Control", shortName: "Jack N' Odd", id: "709e0baf-dd74-4b4e-9d19-7092336c0846", channelId: process.env.JACK_N_ODD_CHANNEL_ID },
    { name: "MADLANDS: Caged Cannibals", shortName: "Madlands", id: "6b57dae1-a6e9-42ba-b59d-8ef4ee8ae11e", channelId: process.env.MADLANDS_CHANNEL_ID },
    { name: "Ozzy Osbourne: Prince of Darkness", shortName: "Ozzy", id: "48f99577-cfc3-40b4-8161-844300c823d4", channelId: process.env.OZZY_CHANNEL_ID },
    { name: "Sinners", shortName: "Sinners", id: "24712410-a3a8-4ee0-b2f7-df889424ae76", channelId: process.env.SINNERS_CHANNEL_ID },
    { name: "Stranger Things", shortName: "Stranger Things", id: "12a4b7d4-3a27-48dd-b355-99fe9f8aab37", channelId: process.env.STRANGER_THINGS_CHANNEL_ID }
  ]
};

// Track last sent status for each attraction to prevent duplicate messages
const lastAttractionStatus = {};

// Track active down messages per attraction for deletion
const activeDownMessages = {};

// Track the last wait time that was used as a baseline for threshold comparisons.
const lastReportedWaitTime = {};

// Flag: true during the initial startup data sync — suppresses most notifications
let isStartup = true;

// Mutex: prevents processData() and fetchAllParkSchedules() from running concurrently
let isProcessing = false;

// Initialize data storage
async function initializeData() {
  const initialData = {
    parks: {},
    attractions: {}
  };

  for (const [key, park] of Object.entries(CONFIG.PARKS)) {
    initialData.parks[park.id] = {
      name: park.name,
      shortName: park.shortName,
      id: park.id,
      status: 'closed',
      code: 107,
      lastChanged: new Date('2000-01-01T00:00:00Z').toISOString(),
      hours: { segments: [] }
    };
  }

  for (const [parkKey, attractions] of Object.entries(ATTRACTIONS)) {
    for (const attr of attractions) {
      initialData.attractions[attr.id] = {
        name: attr.name,
        shortName: attr.shortName,
        id: attr.id,
        park: parkKey,
        status: 'closed',
        code: 107,
        lastChanged: new Date('2000-01-01T00:00:00Z').toISOString()
      };
      lastAttractionStatus[attr.id] = null;
      lastReportedWaitTime[attr.id] = null;
    }
  }

  return initialData;
}

async function loadData() {
  try {
    const fileContent = await fs.readFile(CONFIG.DATA_FILE, 'utf8');
    const data = JSON.parse(fileContent);

    for (const [parkKey, attractions] of Object.entries(ATTRACTIONS)) {
      for (const attr of attractions) {
        if (!data.attractions[attr.id]) {
          data.attractions[attr.id] = {
            name: attr.name,
            shortName: attr.shortName,
            id: attr.id,
            park: parkKey,
            status: 'closed',
            code: 107,
            lastChanged: new Date('2000-01-01T00:00:00Z').toISOString()
          };
        }
        if (lastAttractionStatus[attr.id] === undefined) lastAttractionStatus[attr.id] = null;
        if (lastReportedWaitTime[attr.id] === undefined) lastReportedWaitTime[attr.id] = null;
      }
    }

    return data;
  } catch (error) {
    console.log('Creating new data file...');
    return await initializeData();
  }
}

async function saveData(data) {
  await fs.writeFile(CONFIG.DATA_FILE, JSON.stringify(data, null, 2));
}

// ─── Message Log ─────────────────────────────────────────────────────────────

async function loadMessageLog() {
  try {
    const raw = await fs.readFile(CONFIG.MESSAGE_LOG_FILE, 'utf8');
    const log = JSON.parse(raw);
    if (!log.waitChangeMessages) log.waitChangeMessages = {};
    return log;
  } catch {
    return { parkMessages: {}, attractionMessages: {}, waitChangeMessages: {} };
  }
}

async function saveMessageLog(log) {
  await fs.writeFile(CONFIG.MESSAGE_LOG_FILE, JSON.stringify(log, null, 2));
}

async function logParkMessage(parkKey, attractionId, discordMessageId, code) {
  const log = await loadMessageLog();
  const key = `${parkKey}_${attractionId}_${discordMessageId}`;
  log.parkMessages[key] = { code, discordMessageId, sentAt: new Date().toISOString() };
  await saveMessageLog(log);
}

async function logAttractionMessage(attractionId, discordMessageId, code) {
  const log = await loadMessageLog();
  const key = `${attractionId}_${discordMessageId}`;
  log.attractionMessages[key] = { code, discordMessageId, sentAt: new Date().toISOString() };
  await saveMessageLog(log);
}

async function clearParkMessageLog(parkKey, attractionId = null) {
  const log = await loadMessageLog();
  const prefix = attractionId ? `${parkKey}_${attractionId}_` : `${parkKey}_`;
  for (const key of Object.keys(log.parkMessages)) {
    if (key.startsWith(prefix)) delete log.parkMessages[key];
  }
  await saveMessageLog(log);
}

async function clearAttractionMessageLog(attractionId) {
  const log = await loadMessageLog();
  const prefix = `${attractionId}_`;
  for (const key of Object.keys(log.attractionMessages)) {
    if (key.startsWith(prefix)) delete log.attractionMessages[key];
  }
  await saveMessageLog(log);
}

async function logWaitChangeMessage(attractionId, parkKey, discordMessageId) {
  const log = await loadMessageLog();
  const key = `${attractionId}_${discordMessageId}`;
  log.waitChangeMessages[key] = { attractionId, parkKey, discordMessageId, sentAt: new Date().toISOString() };
  await saveMessageLog(log);
}

async function clearWaitChangeMessages(attractionId) {
  const log = await loadMessageLog();
  const prefix = `${attractionId}_`;
  for (const key of Object.keys(log.waitChangeMessages)) {
    if (key.startsWith(prefix)) delete log.waitChangeMessages[key];
  }
  await saveMessageLog(log);
}

async function processMessageLogOnStartup(storedData) {
  const log = await loadMessageLog();
  const now = new Date();
  const fiveMinMs = 5 * 60 * 1000;

  async function tryDeleteDiscordMessage(channelId, discordMessageId) {
    if (!channelId || !discordMessageId) return;
    try {
      const channel = await client.channels.fetch(channelId);
      if (!channel) return;
      const msg = await channel.messages.fetch(discordMessageId);
      await msg.delete();
    } catch {
      // already deleted or inaccessible
    }
  }

  const parkKeysToRemove = [];

  for (const [key, entry] of Object.entries(log.parkMessages)) {
    const parts = key.split('_');
    const parkKey = parts[0];
    const attractionId = parts.slice(1, -1).join('_');
    const park = CONFIG.PARKS[parkKey];
    if (!park) { parkKeysToRemove.push(key); continue; }

    const sentAt = new Date(entry.sentAt);
    const parkData = storedData.parks[park.id];
    const parkIsClosed = !isWithinParkHours(parkData);

    if (entry.code === 101) {
      if (parkIsClosed) {
        await tryDeleteDiscordMessage(park.channelId, entry.discordMessageId);
        parkKeysToRemove.push(key);
      } else {
        const channelId = park.channelId;
        const discordMsgId = entry.discordMessageId;
        activeDownMessages[attractionId] = {
          delete: async () => {
            await tryDeleteDiscordMessage(channelId, discordMsgId);
          }
        };
      }
    } else if (entry.code === 102 || entry.code === 107 || entry.code === 108) {
      const age = now - sentAt;
      if (age >= fiveMinMs || parkIsClosed) {
        await tryDeleteDiscordMessage(park.channelId, entry.discordMessageId);
        parkKeysToRemove.push(key);
      } else {
        const remaining = fiveMinMs - age;
        const channelId = park.channelId;
        const discordMsgId = entry.discordMessageId;
        setTimeout(async () => {
          await tryDeleteDiscordMessage(channelId, discordMsgId);
          const currentLog = await loadMessageLog();
          delete currentLog.parkMessages[key];
          await saveMessageLog(currentLog);
        }, remaining);
      }
    }
  }

  const attrKeysToRemove = [];

  for (const [key, entry] of Object.entries(log.attractionMessages)) {
    let attrConfig = null;
    let parkKey = null;
    for (const [pk, attrs] of Object.entries(ATTRACTIONS)) {
      const found = attrs.find(a => key.startsWith(a.id + '_'));
      if (found) { attrConfig = found; parkKey = pk; break; }
    }
    if (!attrConfig) { attrKeysToRemove.push(key); continue; }

    const park = CONFIG.PARKS[parkKey];
    const parkData = storedData.parks[park.id];
    const parkIsClosed = !isWithinParkHours(parkData);

    if (parkIsClosed) {
      await tryDeleteDiscordMessage(attrConfig.channelId, entry.discordMessageId);
      attrKeysToRemove.push(key);
    }
  }

  for (const key of parkKeysToRemove) delete log.parkMessages[key];
  for (const key of attrKeysToRemove) delete log.attractionMessages[key];
  await saveMessageLog(log);

  const log2 = await loadMessageLog();
  const waitKeysToRemove = [];

  for (const [key, entry] of Object.entries(log2.waitChangeMessages)) {
    const park = CONFIG.PARKS[entry.parkKey];
    if (!park) { waitKeysToRemove.push(key); continue; }

    const parkData = storedData.parks[park.id];
    const parkIsClosed = !isWithinParkHours(parkData);

    if (parkIsClosed) {
      await tryDeleteDiscordMessage(CONFIG.WAIT_CHANGE_CHANNEL_ID, entry.discordMessageId);
      waitKeysToRemove.push(key);
    }
  }

  for (const key of waitKeysToRemove) delete log2.waitChangeMessages[key];
  await saveMessageLog(log2);

  console.log(`Startup log cleanup: removed ${parkKeysToRemove.length} park message(s), ${attrKeysToRemove.length} attraction message(s), ${waitKeysToRemove.length} wait-change message(s)`);
}

// Fetch live data for the entire Universal Orlando Resort in a single API call
async function fetchAllLiveData() {
  try {
    const response = await fetch(CONFIG.API_URL);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching live data:', error.message);
    return null;
  }
}

async function fetchParkSchedule(parkId) {
  try {
    const url = CONFIG.SCHEDULE_API_URL.replace('{id}', parkId);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Schedule API responded with status: ${response.status}`);
    const data = await response.json();
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });

    const todayEntries = (data.schedule || []).filter(s => {
      return s.date === today && (s.type === 'OPERATING' || s.type === 'TICKETED_EVENT');
    });

    if (todayEntries.length === 0) return [];

    todayEntries.sort((a, b) => new Date(a.openingTime) - new Date(b.openingTime));

    return todayEntries.map(s => ({
      type: s.type,
      description: s.description || s.type,
      open: s.openingTime,
      close: s.closingTime
    }));
  } catch (error) {
    console.error(`Error fetching schedule for park ${parkId}:`, error);
    return [];
  }
}

function scheduleDailyHoursUpdate() {
  function scheduleNext() {
    const now = new Date();
    const nowET = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));

    const next2amET = new Date(nowET);
    next2amET.setHours(2, 0, 0, 0);
    if (next2amET <= nowET) next2amET.setDate(next2amET.getDate() + 1);

    const ms = next2amET - nowET;
    console.log(`Scheduling daily hours fetch at 2:00 AM ET (in ${Math.round(ms / 60000)} minutes)`);

    setTimeout(async () => {
      console.log('Running scheduled hours fetch at 2:00 AM ET');
      await fetchAllParkSchedules();
      scheduleNext();
    }, ms);
  }

  scheduleNext();
}

async function fetchAllParkSchedules() {
  while (isProcessing) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  isProcessing = true;
  try {
    console.log('Fetching park schedules...');
    const storedData = await loadData();
    for (const [parkKey, park] of Object.entries(CONFIG.PARKS)) {
      const segments = await fetchParkSchedule(park.id);
      storedData.parks[park.id].hours = { segments };
      storedData.parks[park.id].status = 'closed';
      storedData.parks[park.id].code = 107;
      console.log(`Fetched schedule for ${parkKey}: ${segments.length} segment(s)`);
    }
    await saveData(storedData);
  } finally {
    isProcessing = false;
  }
}

function isWithinParkHours(parkData) {
  const segments = parkData.hours?.segments;
  if (!segments || segments.length === 0) return false;
  const now = new Date();
  return segments.some(seg => {
    if (!seg.open || !seg.close) return false;
    return now >= new Date(seg.open) && now <= new Date(seg.close);
  });
}

function formatTimeShort(isoString) {
  if (!isoString) return '??:??';
  return new Date(isoString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'America/New_York'
  });
}

function formatHoursFromSegments(segments) {
  if (!segments || segments.length === 0) return 'Closed';
  return segments
    .map(seg => `${formatTimeShort(seg.open)} - ${formatTimeShort(seg.close)}`)
    .join(' | ');
}

function formatTime(date) {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/New_York'
  });
}

function getStatusEmoji(code) {
  const emojiMap = {
    101: '❌',
    102: '🟢',
    103: '🔧',
    107: '⬛️',
    108: '🚀'
  };
  return emojiMap[code] || '❓';
}

function waitTimeToEmoji(minutes) {
  const digitEmojis = ['0️⃣','1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣'];
  const clamped = Math.min(Math.max(Math.floor(minutes), 0), 999);
  const str = clamped.toString().padStart(3, '0');
  return str.split('').map(d => digitEmojis[parseInt(d)]).join('');
}

async function sendNotification(parkKey, message, code, attractionId = null) {
  if (isStartup && code !== 101) return null;

  try {
    const park = CONFIG.PARKS[parkKey];
    if (!park || !park.channelId) return null;

    const channel = await client.channels.fetch(park.channelId);
    if (!channel) return null;

    const sent = await channel.send(message);
    console.log(`Sent notification to ${parkKey}: ${message}`);

    if (attractionId) {
      await logParkMessage(parkKey, attractionId, sent.id, code);
    }

    if (code !== 101) {
      const msgKey = attractionId ? `${parkKey}_${attractionId}_${sent.id}` : null;
      setTimeout(async () => {
        sent.delete().catch(() => {});
        if (msgKey) {
          const log = await loadMessageLog();
          delete log.parkMessages[msgKey];
          await saveMessageLog(log);
        }
      }, 5 * 60 * 1000);
    }

    return sent;
  } catch (error) {
    console.error(`Error sending notification to ${parkKey}:`, error.message);
    return null;
  }
}

async function sendAttractionStatus(attractionId, code, parkKey) {
  if (isStartup) return null;

  try {
    let attraction = null;
    for (const [key, attrs] of Object.entries(ATTRACTIONS)) {
      const found = attrs.find(a => a.id === attractionId);
      if (found) { attraction = found; break; }
    }

    if (!attraction || !attraction.channelId) return null;

    if (lastAttractionStatus[attractionId] === code) return null;

    const channel = await client.channels.fetch(attraction.channelId);
    if (!channel) return null;

    const emoji = getStatusEmoji(code);
    const time = formatTime(new Date());
    const message = `${emoji} ${code} - ${time}`;

    const sentMessage = await channel.send(message);
    await logAttractionMessage(attractionId, sentMessage.id, code);
    lastAttractionStatus[attractionId] = code;

    return sentMessage;
  } catch (error) {
    console.error(`Error sending attraction status for ${attractionId}:`, error.message);
    return null;
  }
}

async function sendWaitChangeNotification(parkKey, attr, newWait, oldWait) {
  if (isStartup) return;
  if (!CONFIG.WAIT_CHANGE_CHANNEL_ID) return;

  try {
    const park = CONFIG.PARKS[parkKey];
    const increased = newWait > oldWait;
    const moodEmoji = increased ? '😡' : '😀';
    const arrowEmoji = increased ? '↗️' : '↘️';
    const newWaitEmoji = waitTimeToEmoji(newWait);
    const oldWaitEmoji = waitTimeToEmoji(oldWait);
    const time = formatTime(new Date());

    const generalChannel = await client.channels.fetch(CONFIG.WAIT_CHANGE_CHANNEL_ID);
    if (generalChannel) {
      const generalMessage = `${moodEmoji}${park.emoji}${park.shortName}-${attr.shortName} wait ${arrowEmoji} from ${oldWaitEmoji} to ${newWaitEmoji} - ${time}`;
      const sent = await generalChannel.send(generalMessage);
      console.log(`Wait change: ${generalMessage}`);
      await logWaitChangeMessage(attr.id, parkKey, sent.id);
    }

    let attrChannelId = null;
    for (const attrs of Object.values(ATTRACTIONS)) {
      const found = attrs.find(a => a.id === attr.id);
      if (found) { attrChannelId = found.channelId; break; }
    }
    if (attrChannelId) {
      const attrChannel = await client.channels.fetch(attrChannelId);
      if (attrChannel) {
        const attrMessage = `${moodEmoji} wait ${arrowEmoji} from ${oldWaitEmoji} to ${newWaitEmoji} - ${time}`;
        const sentAttr = await attrChannel.send(attrMessage);
        console.log(`Wait change attraction: ${attrMessage}`);
        await logAttractionMessage(attr.id, sentAttr.id, 'wait');
      }
    }
  } catch (error) {
    console.error(`Error sending wait change notification for ${attr.shortName}:`, error.message);
  }
}

async function deleteAttractionMessages(attractionId) {
  try {
    let attraction = null;
    for (const [key, attrs] of Object.entries(ATTRACTIONS)) {
      const found = attrs.find(a => a.id === attractionId);
      if (found) { attraction = found; break; }
    }

    if (!attraction || !attraction.channelId) return;

    const channel = await client.channels.fetch(attraction.channelId);
    if (!channel) return;

    let deleted = 0;
    let lastId;

    while (true) {
      const options = { limit: 100 };
      if (lastId) options.before = lastId;

      const messages = await channel.messages.fetch(options);
      if (messages.size === 0) break;

      for (const msg of messages.values()) {
        try {
          await msg.delete();
          deleted++;
        } catch (err) {
          // continue
        }
      }

      lastId = messages.last().id;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    if (deleted > 0) {
      console.log(`  Deleted ${deleted} messages from ${attraction.shortName} channel`);
    }

    await clearAttractionMessageLog(attractionId);
    lastAttractionStatus[attractionId] = null;
  } catch (error) {
    console.error(`Error deleting messages for ${attractionId}:`, error.message);
  }
}

function getAttractionPrefix(attr) {
  if (attr.code === 102 && typeof attr.waitTime === 'number' && attr.waitTime >= 0) {
    return waitTimeToEmoji(attr.waitTime);
  }
  const emoji = getStatusEmoji(attr.code);
  return `${emoji}${emoji}${emoji}`;
}

function formatAttractionColumns(attractions) {
  const halfLength = Math.ceil(attractions.length / 2);
  const column1 = attractions.slice(0, halfLength);
  const column2 = attractions.slice(halfLength);

  const maxNameLength = Math.max(...column1.map(a => a.shortName.length));

  let output = '';
  for (let i = 0; i < halfLength; i++) {
    const attr1 = column1[i];
    const prefix1 = getAttractionPrefix(attr1);
    const name1 = attr1.shortName.padEnd(maxNameLength);

    let line = `${prefix1} ${name1}`;

    if (column2[i]) {
      const attr2 = column2[i];
      const prefix2 = getAttractionPrefix(attr2);
      line += `  ${prefix2} ${attr2.shortName}`;
    }

    output += line + '\n';
  }

  return output;
}

async function updatePinnedMessage(parkKey, park, attractions) {
  const parkConfig = CONFIG.PARKS[parkKey];
  if (!parkConfig || !parkConfig.channelId || !parkConfig.pinnedMsgId) return;

  const hours = formatHoursFromSegments(park.hours?.segments);
  const statusEmoji = getStatusEmoji(park.code);
  const header = `${parkConfig.emoji}${park.shortName} | ${hours} | ${statusEmoji}`;
  const attractionList = formatAttractionColumns(attractions);
  const content = `${header}\n\`\`\`\n${attractionList}\`\`\``;

  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const channel = await client.channels.fetch(parkConfig.channelId);
      if (!channel) return;
      const message = await channel.messages.fetch(parkConfig.pinnedMsgId);
      if (!message) return;
      await message.edit(content);
      return;
    } catch (error) {
      const isTransient = error.status === 503 || error.status === 502 || error.status === 429 || error.code === 'ECONNRESET';
      console.error(`Error updating pinned message for ${parkKey} (attempt ${attempt}/${maxAttempts}): ${error.message}`);
      if (attempt < maxAttempts && isTransient) {
        await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
      } else {
        return;
      }
    }
  }
}

async function updateAllParksPinnedMessage(storedData) {
  try {
    if (!CONFIG.ALL_PARKS.channelId || !CONFIG.ALL_PARKS.pinnedMsgId) return;

    const channel = await client.channels.fetch(CONFIG.ALL_PARKS.channelId);
    if (!channel) return;

    const message = await channel.messages.fetch(CONFIG.ALL_PARKS.pinnedMsgId);
    if (!message) return;

    let content = '';

    for (const [parkKey, parkConfig] of Object.entries(CONFIG.PARKS)) {
      const park = storedData.parks[parkConfig.id];
      const parkAttractions = ATTRACTIONS[parkKey].map(attr => storedData.attractions[attr.id]);

      const hours = formatHoursFromSegments(park.hours?.segments);
      const statusEmoji = getStatusEmoji(park.code);
      const header = `${parkConfig.emoji}${park.shortName} | ${hours} | ${statusEmoji}`;
      const attractionList = formatAttractionColumns(parkAttractions);

      content += `${header}\n\`\`\`\n${attractionList}\`\`\``;
    }

    await message.edit(content.trim());
  } catch (error) {
    console.error('Error updating All Parks pinned message:', error.message);
  }
}

async function processData() {
  if (isProcessing) return;
  isProcessing = true;
  try {
    const liveData = await fetchAllLiveData();
    if (!liveData) {
      console.log('Skipping update due to API fetch failure');
      return;
    }

    const storedData = await loadData();
    const now = new Date().toISOString();
    const currentTime = formatTime(new Date());

    for (const [parkKey, park] of Object.entries(CONFIG.PARKS)) {
      const storedPark = storedData.parks[park.id];
      const parkAttractions = ATTRACTIONS[parkKey].map(attr => {
        const liveAttr = liveData.liveData.find(item => item.id === attr.id);
        return {
          ...storedData.attractions[attr.id],
          liveData: liveAttr
        };
      });

      const withinHours = isWithinParkHours(storedPark);

      // Handle park opening
      if (withinHours && storedPark.status === 'closed') {
        storedPark.status = 'operating';
        storedPark.code = 108;
        storedPark.lastChanged = now;

        await sendNotification(parkKey, `🚀 108 - ${park.emoji}${park.shortName} - ${currentTime}`, 108);

        const openingAttractions = [];
        for (const attr of parkAttractions) {
          const liveAttr = attr.liveData;
          if (liveAttr && liveAttr.status === 'OPERATING') {
            storedData.attractions[attr.id].status = 'operating';
            storedData.attractions[attr.id].code = 102;
            storedData.attractions[attr.id].lastChanged = now;
            openingAttractions.push(attr.shortName);
            await sendAttractionStatus(attr.id, 108, parkKey);
          }
        }

        if (openingAttractions.length > 0) {
          const attrMessage = openingAttractions.join(', ');
          await sendNotification(parkKey, `🟢 102 - ${attrMessage} - ${park.emoji}${park.shortName} - ${currentTime}`, 102);
        }
      }

      // Handle park closing
      if (!withinHours && storedPark.status === 'operating') {
        storedPark.status = 'closed';
        storedPark.code = 107;
        storedPark.lastChanged = now;

        for (const attr of parkAttractions) {
          storedData.attractions[attr.id].status = 'closed';
          storedData.attractions[attr.id].code = 107;
          storedData.attractions[attr.id].lastChanged = now;
          await deleteAttractionMessages(attr.id);
        }

        for (const attr of parkAttractions) {
          if (activeDownMessages[attr.id]) {
            activeDownMessages[attr.id].delete().catch(() => {});
            delete activeDownMessages[attr.id];
          }
          await clearParkMessageLog(parkKey, attr.id);
          if (CONFIG.WAIT_CHANGE_CHANNEL_ID) {
            const wcLog = await loadMessageLog();
            const wcPrefix = `${attr.id}_`;
            try {
              const wcChannel = await client.channels.fetch(CONFIG.WAIT_CHANGE_CHANNEL_ID);
              for (const [key, entry] of Object.entries(wcLog.waitChangeMessages)) {
                if (key.startsWith(wcPrefix)) {
                  try {
                    const wcMsg = await wcChannel.messages.fetch(entry.discordMessageId);
                    await wcMsg.delete();
                  } catch {}
                }
              }
            } catch {}
          }
          await clearWaitChangeMessages(attr.id);
          lastReportedWaitTime[attr.id] = null;
        }

        await sendNotification(parkKey, `🚫 107 - ${park.emoji}${park.shortName} - ${currentTime}`, 107);
      }

      // Update wait times from live data
      for (const attr of parkAttractions) {
        const liveAttr = attr.liveData;
        if (!liveAttr) continue;
        const standbyWait = liveAttr.queue?.STANDBY?.waitTime;
        const newWait = (typeof standbyWait === 'number') ? standbyWait : null;
        storedData.attractions[attr.id].waitTime = newWait;

        const storedAttr = storedData.attractions[attr.id];
        const baseline = lastReportedWaitTime[attr.id];
        const attrIsOperating = storedAttr.status === 'operating';

        if (attrIsOperating && typeof newWait === 'number') {
          if (typeof baseline === 'number') {
            if (Math.abs(newWait - baseline) >= CONFIG.WAIT_CHANGE_THRESHOLD) {
              await sendWaitChangeNotification(parkKey, attr, newWait, baseline);
              lastReportedWaitTime[attr.id] = newWait;
            }
          } else {
            lastReportedWaitTime[attr.id] = newWait;
          }
        } else if (!attrIsOperating || newWait === null) {
          if (storedAttr.status !== 'operating') {
            lastReportedWaitTime[attr.id] = null;
          }
        }
      }

      // Handle individual attraction changes during park hours
      if (withinHours && storedPark.status === 'operating') {
        for (const attr of parkAttractions) {
          const liveAttr = attr.liveData;
          const storedAttr = storedData.attractions[attr.id];

          if (!liveAttr) continue;

          // Attraction breakdown (DOWN = 101)
          if (liveAttr.status === 'DOWN' && storedAttr.status === 'operating') {
            storedAttr.status = 'closed';
            storedAttr.code = 101;
            storedAttr.lastChanged = now;
            lastReportedWaitTime[attr.id] = null;
            const downMsg = await sendNotification(parkKey, `❌ 101 - ${attr.shortName} - ${park.emoji}${park.shortName} - ${currentTime}`, 101, attr.id);
            if (downMsg) activeDownMessages[attr.id] = downMsg;
            await sendAttractionStatus(attr.id, 101, parkKey);
          }

          // Attraction early close (CLOSED = 107)
          if (liveAttr.status === 'CLOSED' && storedAttr.status === 'operating') {
            storedAttr.status = 'closed';
            storedAttr.code = 107;
            storedAttr.lastChanged = now;
            await sendNotification(parkKey, `⬛️ 107 - ${attr.shortName} - ${park.emoji}${park.shortName} - ${currentTime}`, 107, attr.id);
            await sendAttractionStatus(attr.id, 107, parkKey);
            await deleteAttractionMessages(attr.id);
          }

          // Attraction reopened (OPERATING = 102)
          if (liveAttr.status === 'OPERATING' && storedAttr.status === 'closed') {
            storedAttr.status = 'operating';
            storedAttr.code = 102;
            storedAttr.lastChanged = now;
            if (activeDownMessages[attr.id]) {
              activeDownMessages[attr.id].delete().catch(() => {});
              delete activeDownMessages[attr.id];
            }
            await clearParkMessageLog(parkKey, attr.id);
            const recoveryWait = liveAttr.queue?.STANDBY?.waitTime;
            lastReportedWaitTime[attr.id] = (typeof recoveryWait === 'number') ? recoveryWait : null;
            await sendNotification(parkKey, `🟢 102 - ${attr.shortName} - ${park.emoji}${park.shortName} - ${currentTime}`, 102, attr.id);
            await sendAttractionStatus(attr.id, 102, parkKey);
          }

          // Refurbishment
          if (liveAttr.status === 'REFURBISHMENT') {
            storedAttr.status = 'refurbishment';
            if (storedAttr.code !== 103) {
              storedAttr.code = 103;
              storedAttr.lastChanged = now;
            }
          }
        }
      }

      // Update individual park pinned message
      const currentAttractions = parkAttractions.map(attr => storedData.attractions[attr.id]);
      await updatePinnedMessage(parkKey, storedPark, currentAttractions);
    }

    await updateAllParksPinnedMessage(storedData);
    await saveData(storedData);
  } finally {
    isProcessing = false;
  }
}

// Bot ready event
client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);

  await loadData();
  await fetchAllParkSchedules();

  const storedDataForLog = await loadData();
  await processMessageLogOnStartup(storedDataForLog);

  scheduleDailyHoursUpdate();

  console.log('Starting park data polling (startup sync — notifications suppressed except 101)...');
  await processData();
  isStartup = false;
  console.log('Startup sync complete. Notifications now active.');
  setInterval(processData, CONFIG.POLL_INTERVAL);
});

client.login(process.env.DISCORD_TOKEN);
