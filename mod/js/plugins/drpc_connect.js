const DRPC = new DiscordRPC();

let isEnabledDRPC = null;

DRPC.login({ clientId: '1000508661979955260' })
    .then(function() {
        isEnabledDRPC = true;
        DRPC.request('SET_ACTIVITY', { pid: process.pid, activity: {} });
        DRPC_Handler();
    })
    .catch(function(error) {
        isEnabledDRPC = false;
        if (error.message === "Could not connect to Discord IPC") {
            console.log("Discord was not detected; Disabled Discord RPC");
        } else {
            alert(`Something bad happend with Discord IPC:\n\n${error}`);
        }
    });
