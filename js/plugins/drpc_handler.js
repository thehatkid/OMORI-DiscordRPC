const asyncDelay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function DRPC_Handler() {
    let scene, leader, chapter;
    let old_scene, old_leader, old_chapter;
    let leaderAssetKey, titleAssetKey;
    let startTimestamp = Date.now();

    // Initial delay for sure
    await asyncDelay(3000);

    while (isEnabledDRPC) {
        await asyncDelay(500); // Update every 0.5 seconds

        if (!SceneManager._scene) continue;
        if ($gameParty === null) continue;

        scene = SceneManager._scene;
        leader = $gameParty.members()[0];
        chapter = $gameVariables.value(23);

        if (
            scene === old_scene &&
            leader.actorId() === old_leader.actorId()
        ) {
            continue;
        }

        old_scene = scene;
        old_leader = leader;

        console.log("Scene:", scene, "| Leader:", leader);

        // Leader sprite for Discord asset
        switch (leader.actorId()) {
            case 1: // DW OMORI
                leaderAssetKey = "char_omori";
                break;
            case 2: // DW AUBREY
                leaderAssetKey = "char_dw_aubrey";
                break;
            case 3: // DW KEL
                leaderAssetKey = "char_dw_kel";
                break;
            case 4: // DW HERO
                leaderAssetKey = "char_dw_hero";
                break;
            case 8: // FA OMORI
                leaderAssetKey = "char_sunny";
                break;
            case 9: // FA AUBREY
                leaderAssetKey = "char_fa_aubrey";
                break;
            case 10: // FA KEL
                leaderAssetKey = "char_fa_kel";
                break;
            case 11: // FA HERO
                leaderAssetKey = "char_fa_hero";
                break;
            default: // fallback
                leaderAssetKey = "char_omori";
                break;
        }

        // Title screen world type for Discord asset
        switch (scene._worldType) {
            case 444: // Black Space
                titleAssetKey = "title_blackspace";
                break;
            case 445: // Red Space
                titleAssetKey = "title_redspace";
                break;
            case 447: // Sunny (good ending)
            case 449:
                titleAssetKey = "title_goodend";
                break;
            case 448: // No Sunny (bad ending)
                titleAssetKey = "title_badend";
                break;
            default: // White Space, also fallback if other value
                titleAssetKey = "title_whitespace";
                break;
        }

        // Update rich presence for each scenes
        switch (scene.constructor.name) {
            case "Scene_Boot":
                startTimestamp = Date.now(); // Sets new start timestamp
                await DRPC.setActivity({
                    state: "About to start game...",
                    largeImageKey: "char_omori",
                    largeImageText: "OMORI",
                    startTimestamp: startTimestamp
                });
                break;

            case "Scene_OmoriTitleScreen":
                await DRPC.setActivity({
                    state: "In title menu",
                    largeImageKey: titleAssetKey,
                    startTimestamp: startTimestamp
                });
                break;

            case "Scene_OmoriFile":
                await DRPC.setActivity({
                    state: "In saves menu",
                    largeImageKey: leaderAssetKey,
                    largeImageText: leader.name(),
                    smallImageKey: "picnic",
                    smallImageText: "MARI's picnic basket",
                    startTimestamp: startTimestamp
                });
                break;

            case "Scene_Map":
                await DRPC.setActivity({
                    details: chapter,
                    state: `Playing as ${leader.name()}`,
                    largeImageKey: leaderAssetKey,
                    largeImageText: leader.name(),
                    startTimestamp: startTimestamp
                });
                break;

            case "Scene_Menu":
                await DRPC.setActivity({
                    details: chapter,
                    state: "Paused",
                    largeImageKey: leaderAssetKey,
                    largeImageText: leader.name(),
                    startTimestamp: startTimestamp
                });
                break;

            case "Scene_OmoMenuEquip":
                await DRPC.setActivity({
                    details: chapter,
                    state: "Paused, in EQUIP menu",
                    largeImageKey: leaderAssetKey,
                    largeImageText: leader.name(),
                    startTimestamp: startTimestamp
                });
                break;

            case "Scene_OmoMenuItem":
                await DRPC.setActivity({
                    details: chapter,
                    state: "Paused, in ITEMS menu",
                    largeImageKey: leaderAssetKey,
                    largeImageText: leader.name(),
                    startTimestamp: startTimestamp
                });
                break;

            case "Scene_OmoMenuSkill":
                await DRPC.setActivity({
                    details: chapter,
                    state: "Paused, in SKILLS menu",
                    largeImageKey: leaderAssetKey,
                    largeImageText: leader.name(),
                    startTimestamp: startTimestamp
                });
                break;

            case "Scene_OmoMenuOptions":
                await DRPC.setActivity({
                    details: chapter,
                    state: "Paused, in OPTIONS menu",
                    largeImageKey: leaderAssetKey,
                    largeImageText: leader.name(),
                    startTimestamp: startTimestamp
                });
                break;

            case "Scene_Battle":
                await DRPC.setActivity({
                    details: $dataTroops[$gameTroop._troopId].name,
                    state: "In the battle",
                    largeImageKey: leaderAssetKey,
                    largeImageText: leader.name(),
                    startTimestamp: startTimestamp
                });
                break;

            case "Scene_OmoriQuest":
                await DRPC.setActivity({
                    details: chapter,
                    state: "Watching QUESTS",
                    largeImageKey: leaderAssetKey,
                    largeImageText: leader.name(),
                    smallImageKey: "face_mari",
                    smallImageText: "MARI",
                    startTimestamp: startTimestamp
                });
                break;

            case "Scene_OmoriBestiary":
                await DRPC.setActivity({
                    details: chapter,
                    state: "Watching FOES FACTS!",
                    largeImageKey: leaderAssetKey,
                    largeImageText: leader.name(),
                    smallImageKey: "foesfacts",
                    smallImageText: "FOES FACTS!",
                    startTimestamp: startTimestamp
                });
                break;

            case "Scene_OmoriBlackLetterMap":
                await DRPC.setActivity({
                    details: chapter,
                    state: "Watching MAP",
                    largeImageKey: leaderAssetKey,
                    largeImageText: leader.name(),
                    smallImageKey: "map",
                    smallImageText: "MAP",
                    startTimestamp: startTimestamp
                });
                break;

            case "Scene_OmoriPhotoAlbum":
                var albumIconAssetKey;

                switch (scene._albumData.group) {
                    case "Dreamworld":
                        albumIconAssetKey = "photoalbum_dw";
                        break;
                    case "Faraway":
                        albumIconAssetKey = "photoalbum_fa";
                        break;
                    default:
                        albumIconAssetKey = "photoalbum_fa";
                        break;
                }

                await DRPC.setActivity({
                    details: chapter,
                    state: "Watching PHOTO ALBUM",
                    largeImageKey: leaderAssetKey,
                    largeImageText: leader.name(),
                    smallImageKey: albumIconAssetKey,
                    smallImageText: "PHOTO ALBUM",
                    startTimestamp: startTimestamp
                });
                break;

            case "Scene_OmoriItemShop":
                await DRPC.setActivity({
                    details: chapter,
                    state: "In the shop",
                    largeImageKey: leaderAssetKey,
                    largeImageText: leader.name(),
                    smallImageKey: "mailbox",
                    smallImageText: "Mailbox (Shop)",
                    startTimestamp: startTimestamp
                });
                break;

            case "Scene_OmoBlackLetterMenu":
                await DRPC.setActivity({
                    details: chapter,
                    state: "In HANGMAN",
                    largeImageKey: leaderAssetKey,
                    largeImageText: leader.name(),
                    smallImageKey: "hangman",
                    smallImageText: "HANGMAN",
                    startTimestamp: startTimestamp
                });
                break;

            case "Scene_SlotMachine":
                await DRPC.setActivity({
                    details: chapter,
                    state: "Playing to Slots",
                    largeImageKey: leaderAssetKey,
                    largeImageText: leader.name(),
                    smallImageKey: "slotmachine",
                    smallImageText: "Slot Machine",
                    startTimestamp: startTimestamp
                });
                break;
        }
    }
}