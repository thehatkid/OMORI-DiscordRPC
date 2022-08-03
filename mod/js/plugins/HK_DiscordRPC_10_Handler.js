const asyncDelay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function DRPC_Handler() {
    let handlerLoop = true;
    let scene, leader, chapter;
    let old_scene, old_leader, old_chapter;
    let leaderAssetKey, titleAssetKey;
    let startTimestamp = Date.now();

    const langTexts = LanguageManager._data["en"]["text"]["HK_DiscordRPC"]["RichPresence"];

    while (handlerLoop === true) {
        await asyncDelay(250); // Update every 0.25 seconds

        if (!isEnabledDRPC === true) continue;
        if (!SceneManager._scene) continue;
        if ($gameParty === null) continue;

        scene = SceneManager._scene;
        leader = $gameParty.members()[0];
        chapter = $gameVariables.value(23) ? $gameVariables.value(23) : "PROLOGUE";

        if (
            scene === old_scene &&
            leader.actorId() === old_leader.actorId()
        ) continue;

        old_scene = scene;
        old_leader = leader;

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
                    state: langTexts.states.in_boot,
                    largeImageKey: "char_omori",
                    largeImageText: langTexts.texts.omori,
                    startTimestamp: startTimestamp
                });
                break;

            case "Scene_OmoriTitleScreen":
                await DRPC.setActivity({
                    state: langTexts.states.in_title,
                    largeImageKey: titleAssetKey,
                    startTimestamp: startTimestamp
                });
                break;

            case "Scene_OmoriFile":
                await DRPC.setActivity({
                    state: langTexts.states.in_saves,
                    largeImageKey: leaderAssetKey,
                    largeImageText: leader.name(),
                    smallImageKey: "picnic",
                    smallImageText: langTexts.texts.picnic_basket,
                    startTimestamp: startTimestamp
                });
                break;

            case "Scene_Map":
                await DRPC.setActivity({
                    details: chapter,
                    state: `${langTexts.states.in_map} ${leader.name()}`,
                    largeImageKey: leaderAssetKey,
                    largeImageText: leader.name(),
                    startTimestamp: startTimestamp
                });
                break;

            case "Scene_Menu":
                await DRPC.setActivity({
                    details: chapter,
                    state: langTexts.states.in_menu,
                    largeImageKey: leaderAssetKey,
                    largeImageText: leader.name(),
                    startTimestamp: startTimestamp
                });
                break;

            case "Scene_OmoMenuEquip":
                await DRPC.setActivity({
                    details: chapter,
                    state: langTexts.states.in_menu_equip,
                    largeImageKey: leaderAssetKey,
                    largeImageText: leader.name(),
                    startTimestamp: startTimestamp
                });
                break;

            case "Scene_OmoMenuItem":
                await DRPC.setActivity({
                    details: chapter,
                    state: langTexts.states.in_menu_items,
                    largeImageKey: leaderAssetKey,
                    largeImageText: leader.name(),
                    startTimestamp: startTimestamp
                });
                break;

            case "Scene_OmoMenuSkill":
                await DRPC.setActivity({
                    details: chapter,
                    state: langTexts.states.in_menu_skills,
                    largeImageKey: leaderAssetKey,
                    largeImageText: leader.name(),
                    startTimestamp: startTimestamp
                });
                break;

            case "Scene_OmoMenuOptions":
                await DRPC.setActivity({
                    details: chapter,
                    state: langTexts.states.in_menu_options,
                    largeImageKey: leaderAssetKey,
                    largeImageText: leader.name(),
                    startTimestamp: startTimestamp
                });
                break;

            case "Scene_Battle":
                await DRPC.setActivity({
                    details: $dataTroops[$gameTroop._troopId].name,
                    state: langTexts.states.in_battle,
                    largeImageKey: leaderAssetKey,
                    largeImageText: leader.name(),
                    startTimestamp: startTimestamp
                });
                break;

            case "Scene_OmoriQuest":
                await DRPC.setActivity({
                    details: chapter,
                    state: langTexts.states.in_quests,
                    largeImageKey: leaderAssetKey,
                    largeImageText: leader.name(),
                    smallImageKey: "face_mari",
                    smallImageText: langTexts.texts.mari,
                    startTimestamp: startTimestamp
                });
                break;

            case "Scene_OmoriBestiary":
                await DRPC.setActivity({
                    details: chapter,
                    state: langTexts.states.in_foes_facts,
                    largeImageKey: leaderAssetKey,
                    largeImageText: leader.name(),
                    smallImageKey: "foesfacts",
                    smallImageText: langTexts.texts.foes_facts,
                    startTimestamp: startTimestamp
                });
                break;

            case "Scene_OmoriBlackLetterMap":
                await DRPC.setActivity({
                    details: chapter,
                    state: langTexts.states.in_blackletter_map,
                    largeImageKey: leaderAssetKey,
                    largeImageText: leader.name(),
                    smallImageKey: "map",
                    smallImageText: langTexts.texts.blackletter_map,
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
                    state: langTexts.states.in_photoalbum,
                    largeImageKey: leaderAssetKey,
                    largeImageText: leader.name(),
                    smallImageKey: albumIconAssetKey,
                    smallImageText: langTexts.texts.photoalbum,
                    startTimestamp: startTimestamp
                });
                break;

            case "Scene_OmoriItemShop":
                await DRPC.setActivity({
                    details: chapter,
                    state: langTexts.states.in_shop,
                    largeImageKey: leaderAssetKey,
                    largeImageText: leader.name(),
                    smallImageKey: "mailbox",
                    smallImageText: langTexts.texts.shop,
                    startTimestamp: startTimestamp
                });
                break;

            case "Scene_OmoBlackLetterMenu":
                await DRPC.setActivity({
                    details: chapter,
                    state: langTexts.states.in_hangman,
                    largeImageKey: leaderAssetKey,
                    largeImageText: leader.name(),
                    smallImageKey: "hangman",
                    smallImageText: langTexts.texts.hangman,
                    startTimestamp: startTimestamp
                });
                break;

            case "Scene_SlotMachine":
                await DRPC.setActivity({
                    details: chapter,
                    state: langTexts.states.in_slots,
                    largeImageKey: leaderAssetKey,
                    largeImageText: leader.name(),
                    smallImageKey: "slotmachine",
                    smallImageText: langTexts.texts.slotmachine,
                    startTimestamp: startTimestamp
                });
                break;
        }
    }
}
