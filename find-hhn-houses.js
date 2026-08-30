// find-hhn-houses.js
// Run this locally (it needs real network access to api.themeparks.wiki,
// which is not reachable from every environment) to look up the entity ids
// for this year's Halloween Horror Nights houses and match them against the
// ATTRACTIONS.HHN list in index.js.
//
// Usage:
//   node find-hhn-houses.js
//
// It fetches the same destination-wide live-data endpoint index.js polls
// every 10 seconds (CONFIG.API_URL) and searches every entity name in it for
// a match against the house names below. Paste the ids it finds into the
// `id: "REPLACE_ME_..."` fields in ATTRACTIONS.HHN in index.js.

const API_URL = 'https://api.themeparks.wiki/v1/entity/89db5d43-c434-4097-b71f-f6869f495a22/live';

// Keep this list in sync with ATTRACTIONS.HHN in index.js.
const HOUSES = [
  { shortName: 'Jack & Oddfellow', keywords: ['jack and oddfellow', 'oddfellow'] },
  { shortName: 'Stranger Things', keywords: ['stranger things'] },
  { shortName: 'Hellraiser', keywords: ['hellraiser'] },
  { shortName: 'Sinners', keywords: ['sinners'] },
  { shortName: 'Madlands', keywords: ['madlands', 'caged cannibals'] },
  { shortName: 'Bloodengutz', keywords: ['bloodengutz', 'fright-tacular', 'fright tacular'] },
  { shortName: 'Cybergoria', keywords: ['cybergoria'] },
  { shortName: 'Invasion', keywords: ['invasion', 'alien abduction'] },
  { shortName: 'Evil Dead Burn', keywords: ['evil dead'] },
  { shortName: 'Ozzy Osbourne', keywords: ['ozzy osbourne', 'prince of darkness'] }
];

function normalize(str) {
  return (str || '')
    .toLowerCase()
    .replace(/[™®©'']/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function main() {
  console.log(`Fetching ${API_URL} ...\n`);

  let data;
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    data = await response.json();
  } catch (error) {
    console.error(`Could not reach the themeparks.wiki API: ${error.message}`);
    console.error('Run this script from a machine/network that can reach api.themeparks.wiki.');
    process.exit(1);
  }

  const entities = data.liveData || [];
  console.log(`Got ${entities.length} live entities.\n`);

  const matches = {};
  const unmatchedHouseKeywords = new Set();

  for (const house of HOUSES) {
    const found = entities.filter(e => {
      const name = normalize(e.name);
      return house.keywords.some(kw => name.includes(normalize(kw)));
    });

    if (found.length === 0) {
      unmatchedHouseKeywords.add(house.shortName);
    } else {
      matches[house.shortName] = found;
    }
  }

  console.log('=== MATCHES ===\n');
  for (const house of HOUSES) {
    const found = matches[house.shortName];
    if (!found) {
      console.log(`❌ ${house.shortName} — no match found`);
      continue;
    }
    for (const e of found) {
      console.log(`✅ ${house.shortName} → "${e.name}"  id=${e.id}  status=${e.status}  entityType=${e.entityType}`);
    }
  }

  if (unmatchedHouseKeywords.size > 0) {
    console.log('\n=== NOT FOUND ===');
    console.log('These houses had no matching entity name in the live-data feed.');
    console.log('This can mean HHN entities are not published as separate attraction');
    console.log('entities on themeparks.wiki, or the name differs from what\'s expected below.');
    console.log([...unmatchedHouseKeywords].map(n => `  - ${n}`).join('\n'));

    console.log('\nAll entity names containing "house", "maze", "scare", or "horror" (for manual matching):');
    const hints = entities.filter(e => /house|maze|scare|horror/i.test(e.name || ''));
    if (hints.length === 0) {
      console.log('  (none found)');
    } else {
      hints.forEach(e => console.log(`  "${e.name}"  id=${e.id}  entityType=${e.entityType}`));
    }
  }

  console.log('\n=== NEXT STEP ===');
  console.log('Copy the ids above into the matching `id: "REPLACE_ME_..."` fields');
  console.log('in ATTRACTIONS.HHN inside index.js, then set each house\'s *_CHANNEL_ID');
  console.log('env var (and HHN_CHANNEL_ID / HHN_PINNED_MSG_ID for the group channel)');
  console.log('in your .env file.');
}

main();
