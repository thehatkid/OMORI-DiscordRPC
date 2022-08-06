const DRPC = new DiscordRPC();

// Discord application client ID
const appClientId = '1000508661979955260';

// Discord RPC states
let isEnabledDRPC = false;
let DRPCloop = true;


// Discord RPC events
DRPC.on('ready', () => {
  isEnabledDRPC = true;
  console.log(`[Discord RPC] Logged in as ${DRPC.user.username}#${DRPC.user.discriminator} (${DRPC.user.id})`);
});

DRPC.transport.on('close', () => {
  isEnabledDRPC = false;
  console.log('[Discord RPC] Disconnected by IPC');
});


// NW.js window events
nw.Window.get().on('close', function() {
  // Close Discord IPC connection on OMORI closure
  DRPC.destroy();
  this.close(true);
});


{
  async function DRPC_Loop() {
    console.log('[Discord RPC] Started autoconnection');

    while (DRPCloop === true) {
      if (isEnabledDRPC === false) {
        await asyncDelay(5000);

        // Check for available Discord IPC pipes
        try {
          await _DiscordRPC_getIPC();
        } catch (e) {
          continue;
        }

        // Try to connect to Discord IPC
        try {
          await DRPC.login({ clientId: appClientId })
            .then(() => {
              DRPC.request('SET_ACTIVITY', { pid: process.pid, activity: {} });
            });
        } catch (e) {
          isEnabledDRPC = false;
          switch (e.message) {
            case "Could not connect to Discord IPC":
            case "Connection Closed":
              // Ignoring due to not opened any Discord clients, 
              // or Discord client is starting up.
              break;
            case "RPC_CONNECTION_TIMEOUT":
              console.warn('[Discord RPC] Connection timeout');
              break;
            default:
              console.error(`[Discord RPC] Could not connect: ${e.message}`);
              alert(`Something bad happend with Discord IPC:\n\n${e.message}`);
              break;
          }
        }
      } else {
        await asyncDelay(15000);
      }
    }

    console.log('[Discord RPC] Ended autoconnection');
  }

  // Start handling
  DRPC_Loop();
  DRPC_Handler();
}
