// backend/spike.ts
import { Sandbox } from '@e2b/sdk';

async function main() {
  // 1. Put your cloud sandbox ID here
  const sandboxId = "iwdgw08584m74xv79kken"; 
  
  // 2. Put your real E2B API Key here
  const apiKey = "e2b_1070f69b9bbb0c7a7cbc4a1c0edb00c99021d84e"; 
  
  console.log(`Connecting to ${sandboxId}...`);
  
  // We explicitly pass the apiKey so it doesn't need the .env file
  const sandbox = await Sandbox.connect(sandboxId, { apiKey });
  
  console.log("Injecting an infinite loop to max out the CPU...");
  // This runs a Python script in the background that intentionally hogs the CPU
  await sandbox.commands.run(`python3 -c "while True: pass"`, { background: true });
  
  console.log("Done! Check your dashboard. The CPU should shoot to 99-100%.");
  process.exit(0);
}

main();