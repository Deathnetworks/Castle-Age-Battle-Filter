// ==UserScript==
// @name           Castle Age - Battle Filter
// @namespace      http://www.facebook.com/
// @description    This script assists with filtering battles.
// @include        https://apps.facebook.com/castle_age/*
// @include        https://web4.castleagegame.com/castle_ws/*
// @downloadURL    https://raw.githubusercontent.com/Deathnetworks/Castle-Age-Battle-Filter/master/Castle%20Age%20-%20Battle%20Filter.js
// @require        http://code.jquery.com/jquery-1.9.1.js
// @require        http://code.jquery.com/ui/1.10.3/jquery-ui.js
// @require     https://raw.githubusercontent.com/magowiz/Castle-Age-Autoplayer/master/Chrome/unpacked/extern/utility.js
// @require        http://fgnass.github.io/spin.js/spin.js
// @resource       jqueryUiCss http://code.jquery.com/ui/1.10.3/themes/smoothness/jquery-ui.css
// @resource       ca_cabfCss https://raw.github.com/unknowner/CAGE/master/css/ca_cabf.css
// @resource       cabfCss https://raw.githubusercontent.com/Deathnetworks/Castle-Age-Battle-Filter/master/Castle%20Age%20-%20Battle%20Filter.css
// @resource       arenaBoard https://raw.githubusercontent.com/Deathnetworks/Castle-Age-Battle-Filter/master/ArenaBoard.html
// @resource       syncDialog https://raw.githubusercontent.com/Deathnetworks/Castle-Age-Battle-Filter/master/SyncDialog.html
// @resource       param https://raw.githubusercontent.com/Deathnetworks/Castle-Age-Battle-Filter/master/param.txt
// @version        1.2.10
// @copyright      2013+, Jigoku
// @grant  GM_addStyle
// @grant  GM_getResourceText
// @grant  GM_registerMenuCommand
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_listValues
// ==/UserScript==
/*jshint browser: true, devel: true, loopfunc: true, jquery: true */
/*global document, setInterval, Spinner, localStorage, console, $, window, GM_getResourceText, GM_addStyle, GM_registerMenuCommand, MutationObserver */

var version = '1.1.56', clickUrl = '', updated = false;

var defaultStats = {
    "targets" : [{
        "target_id" : "0",
        "victory" : 0,
        "defeat" : 0
    }
                ]
};
var defaultEssences = [{
    "name" : "LES BRANQUES",
    "level" : "13",
    "lastCheck" : 1432865723408,
    "attack" : -1,
    "defense" : -1,
    "damage" : -1,
    "health" : -1,
    "guildId" : "1796388608_1285087750"
}
                      ];

var opts = {
    lines : 17, // The number of lines to draw
    length : 0, // The length of each line
    width : 30, // The line thickness
    radius : 23, // The radius of the inner circle
    corners : 0.5, // Corner roundness (0..1)
    rotate : 42, // The rotation offset
    direction : 1, // 1: clockwise, -1: counterclockwise
    color : '#41f', // #rgb or #rrggbb or array of colors
    speed : 1.6, // Rounds per second
    trail : 25, // Afterglow percentage
    shadow : true, // Whether to render a shadow
    hwaccel : false, // Whether to use hardware acceleration
    className : 'spinner', // The CSS class to assign to the spinner
    zIndex : 2e9, // The z-index (defaults to 2000000000)
    top : '50%', // Top position relative to parent
    left : '50%' // Left position relative to parent
};
var spinContainer;
var spinner;
function addLoadingImg(id) {
    spot = document.getElementById(id);
    spinner = new Spinner(opts).spin(spot);
}

var SyncDataTimer;

function syncData() {
    window.clearTimeout(SyncDataTimer);
    SyncDataTimer = window.setTimeout(syncRemoteAjax, 5000);
}

function mergeRemoteAndLocal(remoteStorage, property) {
    try {
        var nbMerge = 0;
        console.log('mergeRemoteAndLocal ' + property);
        if (!remoteStorage.hasOwnProperty(property)) {
            remoteStorage[property] = [];
            console.log('New remote storage',remoteStorage);
        } else {
            if (remoteStorage[property].length>0) {
                var tempLostArenaIds = JSON.parse(localStorage[property]);
                $.each(JSON.parse(remoteStorage[property]),function(_i, _e) {
                    try {
                        if (tempLostArenaIds.lastIndexOf(_e) < 0) {
                            tempLostArenaIds.push(_e);
                            nbMerge++;
                        }
                    } catch(e) {
                        console.error('Error in mergeRemoteAndLocal ' + property + ' index='+_i+' with: ',e);
                    }
                });
                localStorage[property] = JSON.stringify(tempLostArenaIds);
            }
        }
        remoteStorage[property] = localStorage[property];
        console.log('Merge remote storage succeed. Total of ' + nbMerge + ' remote storage',remoteStorage);
    } catch (e) {
        console.error('Error in mergeRemoteAndLocal ' + property + ' : ',e);
    }
}

function syncRemoteAjax() {
    if (!localStorage.hasOwnProperty('cabf_syncRemoteKey')) {
        item.set('syncRemoteKey','https://api.myjson.com/bins/xxxxx');
    }
    window.clearTimeout(SyncDataTimer);
    SyncDataTimer = window.setTimeout(syncDataAjax, 2000);
    var key = JSON.parse(localStorage.cabf_syncRemoteKey);
    if (!key || key === null || key === "") {
        console.log('Sync key not set.');
    } else {
        var requestGET = $.ajax({
            url : key,
            type : "GET",
            contentType : "application/json; charset=utf-8",
            dataType : "json",
            beforeSend : function () {
                addLoadingImg('globalContainer');
                $('div[class="spinner"]').html($('div[class="spinner"]').html() + 'Synchronizing');
            },
            success : function (remoteStorage, textStatus, jqXHR) {
                mergeRemoteAndLocal(remoteStorage, 'cabf_LostArenaIds');
                mergeRemoteAndLocal(remoteStorage, 'cabf_FarmArenaIds');
                mergeRemoteAndLocal(remoteStorage, 'cabf_LostIds');
                mergeRemoteAndLocal(remoteStorage, 'cabf_farmids');
                mergeRemoteAndLocal(remoteStorage, 'cabf_guildIDs');					
                try {
                    var requestPUT = $.ajax({
                        url : key,
                        type : "PUT",
                        data : JSON.stringify(remoteStorage),
                        contentType : "application/json; charset=utf-8",
                        dataType : "json",
                        success : function (data, textStatus, jqXHR) {
                            console.log('Sync success in saving remote storage : ', textStatus, data);
                            spinner.stop();
                        },
                        error : function (jqXHR, textStatus, errorThrown) {
                            console.log('Sync remote storage PUT: ' + textStatus, errorThrown);
                            spinner.stop();
                        }
                    });
                    requestPUT.onreadystatechange = null;
                    requestPUT.abort = null;
                    requestPUT = null;
                } catch (ePUT) {
                    console.error(ePUT);
                    spinner.stop();
                }
                nbMerge = null;
                tempLostArenaIds = null;
            },
            error : function (jqXHR, textStatus, errorThrown) {
                console.log('Sync remote storage GET: ' + textStatus, errorThrown);
                spinner.stop();
            }
        });
        requestGET.onreadystatechange = null;
        requestGET.abort = null;
        requestGET = null;
    }
}

function syncDataAjax() {
    //item.set('syncKey','https://api.myjson.com/bins/xxxxx');
    /*if (!localStorage.hasOwnProperty('cabf_syncKey') {
    item.set('syncKey','https://api.myjson.com/bins/xxxxx');
    }*/
    /*if (!localStorage.hasOwnProperty('cabf_stats') {
    item.set('stats',defaultStats);
    }*/
    window.clearTimeout(SyncDataTimer);
    var key = JSON.parse(localStorage.cabf_syncKey);
    if (!key || key === null || key === "") {
        console.log('Sync key not set.');
    } else {
        var requestGET = $.ajax({
            url : key,
            type : "GET",
            contentType : "application/json; charset=utf-8",
            dataType : "json",
            beforeSend : function () {
                addLoadingImg('globalContainer');
                //console.log('spinner', spinner);
                $('div[class="spinner"]').html($('div[class="spinner"]').html() + 'Synchronizing');
            },
            success : function (statsToMerge, textStatus, jqXHR) {
                if (statsToMerge.targets) {
                    var statsLocal = JSON.parse(localStorage.cabf_stats);
                    var arrayTargets = statsLocal.targets;
                    var nbMerge = 0;
                    for (var i = 0; i < statsToMerge.targets.length; i++) {
                        var target_id = statsToMerge.targets[i].target_id;
                        var indexTarget = getTargetIndex(arrayTargets, target_id);
                        if (indexTarget < 0) {
                            var newTarget = {
                                "target_id" : target_id,
                                "victory" : statsToMerge.targets[i].victory,
                                "defeat" : statsToMerge.targets[i].defeat
                            };
                            statsLocal.targets.push(newTarget);
                            nbMerge++;
                            newTarget = null;
                        } else {
                            if ((statsLocal.targets[indexTarget].victor + statsLocal.targets[indexTarget].defeat) < (statsToMerge.targets[i].victory + statsToMerge.targets[i].defeat)) {
                                statsLocal.targets[indexTarget].victory = statsToMerge.targets[i].victory;
                                statsLocal.targets[indexTarget].defeat = statsToMerge.targets[i].defeat;
                                nbMerge++;
                            }
                        }
                    }
                    localStorage.cabf_stats = JSON.stringify(statsLocal);
                    console.log('Merge Sync Data succeed. Total of ' + nbMerge + ' Data');
                    try {
                        var requestPUT = $.ajax({
                            url : key,
                            type : "PUT",
                            data : JSON.stringify(statsLocal),
                            contentType : "application/json; charset=utf-8",
                            dataType : "json",
                            success : function (data, textStatus, jqXHR) {
                                console.log('Sync success in saving data : ', textStatus, data);
                                spinner.stop();
                            },
                            error : function (jqXHR, textStatus, errorThrown) {
                                console.log('Sync PUT: ' + textStatus, errorThrown);
                                spinner.stop();
                            }
                        });
                        requestPUT.onreadystatechange = null;
                        requestPUT.abort = null;
                        requestPUT = null;
                    } catch (ePUT) {
                        console.error(ePUT);
                        spinner.stop();
                    }
                    statsToMerge = null;
                    statsLocal = null;
                    arrayTargets = null;
                }
            },
            error : function (jqXHR, textStatus, errorThrown) {
                console.log('Sync GET: ' + textStatus, errorThrown);
                spinner.stop();
            }
        });
        requestGET.onreadystatechange = null;
        requestGET.abort = null;
        requestGET = null;
    }
}

var item = {
    get : function (_name, _default) {
        if (localStorage['cabf_' + _name] !== undefined && localStorage['cabf_' + _name] !== null) {
            return JSON.parse(localStorage['cabf_' + _name]);
        } else {
            return _default;
        }
    },
    set : function (_name, _value) {
        localStorage['cabf_' + _name] = JSON.stringify(_value);
        if (_name.match('stats'))
            syncData();
    },
    del : function (_name) {
        localStorage.remove('cabf_' + _name);
    }
};

var _dialogConnect = '<div id="dialogConnect" title="Connect to CAAP">  <form><fieldset><label for="player_email">E-Mail : </label><input type="text" name="player_email" id="player_email" value="" style="width: 420px;"></fieldset><div><br></div><fieldset><label for="player_password">Password : </label><input type="password" name="player_password" id="player_password" value="" style="width: 420px;"></fieldset></form></div>';
var _dialogCraft = '<div id="dialogCraft" title="Craft Alchemy"><form><fieldset><label for="name">Select alchemy</label><select name="selectAlchemy" id="selectAlchemy"></select></fieldset></form></div>';
var _dialogIO = '<div id="dialogIO" title="Import/Export">  <textarea id="statsDg" style="margin: 2px; height: 250px; width: 600px;"></textarea></div>';
var _dialogSync = GM_getResourceText("syncDialog");
var _statBlock = '<div id="cabfHealthStatBlock"><div id="cabfStatType">Enemy</div><div><br></div><div id="cabfStatTower"><span>-</span><span>Stat</span></div><div id="cabfToggleTower"><div id="cabfTotalHealth">Total Health: 0</div><div id="cabfAverageHealth">Average Health: 0</div><div id="cabfHealthLeft">Health Left: 0</div><div id="cabfAverageHealthLeft">Average Health Left: 0</div><div id="cabfPercentageHealthLeft">Percentage Health Left: 0%</div></div><div><br></div><div id="cabfStatCleric"><span>-</span><span>Cleric Stat</span></div><div id="cabfToggleCleric"><div id="cabfClericTotalHealth">Total Health: 0</div><div id="cabfClericAverageHealth">Average Health: 0</div><div id="cabfClericHealthLeft">Health Left: 0</div><div id="cabfClericAverageHealthLeft">Average Health Left: 0</div><div id="cabfClericPercentageHealthLeft">Percentage Health Left: 0%</div></div><div><br></div><div id="cabfStatMage"><span>-</span><span>Mage Stat</span></div><div id="cabfToggleMage"><div id="cabfMageTotalHealth">Total Health: 0</div><div id="cabfMageAverageHealth">Average Health: 0</div><div id="cabfMageHealthLeft">Health Left: 0</div><div id="cabfMageAverageHealthLeft">Average Health Left: 0</div><div id="cabfMagePercentageHealthLeft">Percentage Health Left: 0%</div></div><div><br></div><div id="cabfStatRogue"><span>-</span><span>Rogue Stat</span></div><div id="cabfToggleRogue"><div id="cabfRogueTotalHealth">Total Health: 0</div><div id="cabfRogueAverageHealth">Average Health: 0</div><div id="cabfRogueHealthLeft">Health Left: 0</div><div id="cabfRogueAverageHealthLeft">Average Health Left: 0</div><div id="cabfRoguePercentageHealthLeft">Percentage Health Left: 0%</div></div><div><br></div><div id="cabfStatWarrior"><span>-</span><span>Warrior Stat</span></div><div id="cabfToggleWarrior"><div id="cabfWarriorTotalHealth">Total Health: 0</div><div id="cabfWarriorAverageHealth">Average Health: 0</div><div id="cabfWarriorHealthLeft">Health Left: 0</div><div id="cabfWarriorAverageHealthLeft">Average Health Left: 0</div><div id="cabfWarriorPercentageHealthLeft">Percentage Health Left: 0%</div></div><div><br></div><div id="cabfStatActive"><span>-</span><span>Active Stat</span></div><div id="cabfToggleActive"><div id="cabfActiveTotalHealth">Total Health: 0</div><div id="cabfActiveAverageHealth">Average Health: 0</div><div id="cabfActiveHealthLeft">Health Left: 0</div><div id="cabfActiveAverageHealthLeft">Average Health Left: 0</div><div id="cabfActivePercentageHealthLeft">Percentage Health Left: 0%</div></div><div><br></div></div>';
var _FestivalDuelBlock = '<div id="cabfFestivalDuelBlock"><div id="cabfFestivalDuelType">Festival Battle</div><div><br></div><div id="cabfFarmTarget"><span>-</span><span>Farm Targets</span></div><div><br></div><div id="cabfToggleFarm"><span class="cabfFarmTargetTitle ui-state-default"><a id="farmKeep" href="keep.php" target="_blank">Target</a> </span><select id="cabfTargetSelect" class="cabffarmfargettitle"></select></div><div><br></div></div>';
var _ArenaDuelBlock = GM_getResourceText("arenaBoard");
var _NormalDuelBlock = '<div id="cabfNormalDuelBlock"><div id="cabfNormalDuelType">Battle</div><div><br></div><div id="cabfCollapseNormal"><span>-</span><span>Farm Targets</span></div><div><br></div><div id="cabfToggleNormal"></div><div><br></div></div>';
var _QuestDuelBlock = '<div id="cabfQuestBlock"><div id="cabfQuestDuelType">Quests</div><div><br></div><div id="cabfCollapseQuest"><span>-</span><span>Farm Quest</span></div><div><br></div><div id="cabfToggleQuest"></div><div><br></div></div>';
var _essenceBlock = '<div id="cabfEssenceBlock"><div id="cabfEssenceTilte">Essences</div><div><br></div><div id="cabfDamageStorage"><span>-</span><span>Damage Storage</span></div><div id="cabfToggleDamageStorage"></div><div><br></div><div id="cabfAttackStorage"><span>-</span><span>Attack Storage</span></div><div id="cabfToggleAttackStorage"></div><div><br></div><div id="cabfDefenseStorage"><span>-</span><span>Defense Storage</span></div><div id="cabfToggleDefenseStorage"></div><div><br></div><div id="cabfHealthStorage"><span>-</span><span>Health Storage</span></div><div id="cabfToggleHealthStorage"></div><div><br></div></div>';
var _rightBoard = '<div id="cabfRigthBoard"></div>';
var _leftBoard = '<div id="cabfLeftBoard"></div>';

function runEffect(idButton, idToggle) {
    var options = {},
        state;
    $(idToggle).toggle('clip', options, 500);
    state = item.get(idToggle, 'false');
    if (state === 'false') {
        item.set(idToggle, 'true');
        $(idButton + ' span:first').html('-');
    } else {
        item.set(idToggle, 'false');
        $(idButton + ' span:first').html('+');
    }
    options = null;
}

function addFestivalDuelBoard(id) {

    if ($('#cabfLeftBoard').length <= 0) {
        $(id).after(_leftBoard);
    }

    if ($('#cabfFestivalDuelBlock').length <= 0) {
        $('#cabfLeftBoard').append(_FestivalDuelBlock);
    }

    $('#cabfFarmTarget').click(function () {
        runEffect('#cabfFarmTarget', '#cabfToggleFarm');
    });

    if (item.get('#cabfToggleFarm', 'false') === 'false') {
        $('#cabfToggleFarm').css("display", "none");
        $('#cabfFarmTarget span:first').html('+');
    }
}

function addArenaDuelBoard(id) {

    if ($('#cabfLeftBoard').length <= 0) {
        $(id).after(_leftBoard);
    }

    if ($('#cabfArenaDuelBlock').length <= 0) {
        $('#cabfLeftBoard').append(_ArenaDuelBlock);
    }

    $('#cabfFarmTarget').click(function () {
        runEffect('#cabfFarmTarget', '#cabfToggleFarm');
    });

    if (item.get('#cabfToggleFarm', 'false') === 'false') {
        $('#cabfToggleFarm').css("display", "none");
        $('#cabfFarmTarget span:first').html('+');
    }

    $('#cabfLoopConfig').click(function () {
        runEffect('#cabfLoopConfig', '#cabfToggleLoop');
    });

    if (item.get('#cabfToggleLoop', 'false') === 'false') {
        $('#cabfToggleLoop').css("display", "none");
        $('#cabfLoopConfig span:first').html('+');
    }
}

function addNormalDuelBoard(id) {

    if ($('#cabfLeftBoard').length <= 0) {
        $(id).after(_leftBoard);
    }

    if ($('#cabfNormalDuelBlock').length <= 0) {
        $('#cabfLeftBoard').append(_NormalDuelBlock);
    }

    $('#cabfCollapseNormal').click(function () {
        runEffect('#cabfCollapseNormal', '#cabfToggleNormal');
    });
    if (item.get('#cabfToggleNormal', 'false') === 'false') {
        $('#cabfToggleNormal').css("display", "none");
        $('#cabfCollapseNormal span:first').html('+');
    }
}

function addQuestDuelBoard(id) {

    if ($('#cabfLeftBoard').length <= 0) {
        $(id).after(_leftBoard);
    }

    if ($('#cabfQuestBlock').length <= 0) {
        $('#cabfLeftBoard').append(_QuestDuelBlock);
    }

    $('#cabfCollapseQuest').click(function () {
        runEffect('#cabfCollapseQuest', '#cabfToggleQuest');
    });
    if (item.get('#cabfToggleQuest', 'false') === 'false') {
        $('#cabfToggleQuest').css("display", "none");
        $('#cabfCollapseQuest span:first').html('+');
    }
}

function addStatBoard(id) {

    if ($('#cabfLeftBoard').length <= 0) {
        $(id).after(_leftBoard);
    }

    if ($('#cabfHealthStatBlock').length <= 0) {
        $('#cabfLeftBoard').append(_statBlock);
    }

    $('#cabfStatTower').click(function () {
        runEffect('#cabfStatTower', '#cabfToggleTower');
    });
    $('#cabfStatCleric').click(function () {
        runEffect('#cabfStatCleric', '#cabfToggleCleric');
    });
    $('#cabfStatMage').click(function () {
        runEffect('#cabfStatMage', '#cabfToggleMage');
    });
    $('#cabfStatRogue').click(function () {
        runEffect('#cabfStatRogue', '#cabfToggleRogue');
    });
    $('#cabfStatWarrior').click(function () {
        runEffect('#cabfStatWarrior', '#cabfToggleWarrior');
    });
    $('#cabfStatActive').click(function () {
        runEffect('#cabfStatActive', '#cabfToggleActive');
    });
    if (item.get('#cabfToggleTower', 'false') === 'false') {
        $('#cabfToggleTower').css("display", "none");
        $('#cabfStatTower span:first').html('+');
    }
    if (item.get('#cabfToggleCleric', 'false') === 'false') {
        $('#cabfToggleCleric').css("display", "none");
        $('#cabfStatCleric span:first').html('+');
    }
    if (item.get('#cabfToggleMage', 'false') === 'false') {
        $('#cabfToggleMage').css("display", "none");
        $('#cabfStatMage span:first').html('+');
    }
    if (item.get('#cabfToggleRogue', 'false') === 'false') {
        $('#cabfToggleRogue').css("display", "none");
        $('#cabfStatRogue span:first').html('+');
    }
    if (item.get('#cabfToggleWarrior', 'false') === 'false') {
        $('#cabfToggleWarrior').css("display", "none");
        $('#cabfStatWarrior span:first').html('+');
    }
    if (item.get('#cabfToggleActive', 'false') === 'false') {
        $('#cabfToggleActive').css("display", "none");
        $('#cabfStatActive span:first').html('+');
    }
}

function addEssenceBoard(id) {

    if ($('#cabfRigthBoard').length <= 0) {
        $(id).append(_rightBoard);
    }

    if ($('#cabfEssenceBlock').length <= 0) {
        $('#cabfRigthBoard').append(_essenceBlock);

        $('#cabfDamageStorage').click(function () {
            runEffect('#cabfDamageStorage', '#cabfToggleDamageStorage');
        });
        $('#cabfAttackStorage').click(function () {
            runEffect('#cabfAttackStorage', '#cabfToggleAttackStorage');
        });
        $('#cabfDefenseStorage').click(function () {
            runEffect('#cabfDefenseStorage', '#cabfToggleDefenseStorage');
        });
        $('#cabfHealthStorage').click(function () {
            runEffect('#cabfHealthStorage', '#cabfToggleHealthStorage');
        });
    }

    $('#cabfToggleDamageStorage').html(item.get('listDamageStorage', ''));
    $('#cabfToggleAttackStorage').html(item.get('listAttackStorage', ''));
    $('#cabfToggleDefenseStorage').html(item.get('listDefenseStorage', ''));
    $('#cabfToggleHealthStorage').html(item.get('listHealthStorage', ''));

    if (item.get('#cabfToggleDamageStorage', 'false') === 'false') {
        $('#cabfToggleDamageStorage').css("display", "none");
        $('#cabfDamageStorage span:first').html('+');
    }
    if (item.get('#cabfToggleAttackStorage', 'false') === 'false') {
        $('#cabfToggleAttackStorage').css("display", "none");
        $('#cabfAttackStorage span:first').html('+');
    }
    if (item.get('#cabfToggleDefenseStorage', 'false') === 'false') {
        $('#cabfToggleDefenseStorage').css("display", "none");
        $('#cabfDefenseStorage span:first').html('+');
    }
    if (item.get('#cabfToggleHealthStorage', 'false') === 'false') {
        $('#cabfToggleHealthStorage').css("display", "none");
        $('#cabfHealthStorage span:first').html('+');
    }
}

function addCss(cssString) {
    try {
        var head = document.getElementsByTagName('head')[0];
        //return unless head;
        if (head) {
            var newCss = document.createElement('style');
            newCss.type = "text/css";
            newCss.innerHTML = cssString;
            head.appendChild(newCss);
            newCss = null;
        }
        head = null;
    } catch (e) {
        console.error("Error in addCss", e);
    }
}

function cabf_error(event) {
    console.log("cabf_error");
}

function cabf_success(event) {
    console.log("cabf_success");
}

var filterGate = function () {};

/*******************************************************************************************************************************************************************************
 ********************************************************************************************************************************************************************************
 *************    MIST BATTLE ***************************************************************************************************************************************************
 ********************************************************************************************************************************************************************************
 *******************************************************************************************************************************************************************************/
function cabf_conquestmistfilter() {

    try {
        var _defenderHealth = 0,
            _actions = parseInt(/\d+/.exec($('#app_body div:contains("ACTIONS LEFT:"):last').text()), 10);
        // Saved filter settings
        var _storedClass = item.get('cabfPageConquestBattleClass', 'All');
        var _storedStatus = item.get('cabfPageConquestBattleStatus', 'All');
        var _storedPoints = item.get('cabfPageConquestBattlePoints', 'All');

        $('#your_guild_member_list_1 > div[style!="clear:both;"]').each(function (_i, _e) {
            var _text = $(_e).text().trim(),
                _health,
                _maxHealth,
                _fullhealth,
                winStat = '';

            // enemy full health
            _health = /(\d+)\//.exec(_text)[1];
            _maxHealth = /\/(\d+)/.exec(_text)[1];
            if ((_maxHealth - _health) === 0) {
                _fullhealth = true;
            } else {
                _fullhealth = false;
            }
            _defenderHealth += parseInt(/(\d+)(?:\/)/.exec($(this).text())[1], 10);
            $(_e, 'div > div').append('<div style="clear:both;"></div>');
            if ($('input[name="target_id"]', _e).length > 0) {
                var target_id = $('input[name="target_id"]', _e).attr("value");
                winStat = getTargetStat(target_id);
                addTargetTip(_e);
            }
            if (_fullhealth) {
                $(_e, 'div > div').append('<span class="GuildNumG">' + (_i + 1) + '</span>' + '<br>' + winStat);
            } else {
                $(_e, 'div > div').append('<span class="GuildNumR">' + (_i + 1) + '</span>' + '<br>' + winStat);
            }

        });
        if (_defenderHealth > 0) {
            $('#app_body div[style*="/graphics/war_art"]:last').prepend('<div id="cabfHealthAction">Health/Action: ' + (_defenderHealth / _actions).toFixed(0) + '</div>');
        }
        // gate filter
        filterGate = function () {
            var _count = 0;
            var _myLevel = $('a[href*="keep.php"] > div[style="color:#ffffff"]').text().match(/\d+/);
            var myLevel = Number(_myLevel[0]);
            $('#your_guild_member_list_1 > div[style!="clear:both;"]').each(function (_i, _e) {
                var _class = new RegExp($('#cabfGateClassFilter').val());
                var _state = new RegExp($('#cabfGateStatusFilter').val());
                var _points = $('#cabfGatePointsFilter').val();
                var _text = $(_e).text().trim(),
                    _health,
                    _maxHealth,
                    _fullhealth,
                    _eClass;

                // enemy class
                _eClass = $(_e).find('img[title="Cleric"], img[title="Mage"], img[title="Warrior"], img[title="Rogue"]').attr("title");

                // enemy full health
                _health = /(\d+)\//.exec(_text)[1];
                _maxHealth = /\/(\d+)/.exec(_text)[1];
                if ((_maxHealth - _health) === 0) {
                    _fullhealth = true;
                } else {
                    _fullhealth = false;
                }

                if (_class.test(_eClass) && (_state.test(_text) || (_state.test('FullHealth') && _fullhealth))) {
                    if (_points !== 'All') {
                        if (/Level:\ \d+/.test(_text)) {
                            var targetLevel = parseInt(/(?:Level:\ )(\d+)/g.exec(_text)[1]);
                            var _showTarget = false;
                            switch (_points) {
                                case '50':
                                    if (targetLevel > 900) {
                                        _showTarget = true;
                                    }
                                    break;
                                case '40':
                                    if ((targetLevel > 600) && (targetLevel <= 900)) {
                                        _showTarget = true;
                                    }
                                    break;
                                case '30':
                                    if ((targetLevel > 300) && (targetLevel <= 600)) {
                                        _showTarget = true;
                                    }
                                    break;
                                case '20':
                                    if ((targetLevel > 100) && (targetLevel <= 300)) {
                                        _showTarget = true;
                                    }
                                    break;
                                case '10':
                                    if (targetLevel <= 100) {
                                        _showTarget = true;
                                    }
                                    break;
                                default:
                                    _showTarget = true;
                            }
                            if (_showTarget) {
                                $(_e).show();
                                _count += 1;
                            } else {
                                $(_e).hide();
                            }
                        } else {
                            console.log('Error in points filter!');
                            $(_e).show();
                            _count += 1;
                        }
                    } else {
                        $(_e).show();
                        _count += 1;
                    }
                } else {
                    $(_e).hide();
                }
            });
            $('#app_body div[id="cabfHealthAction"]:last').html($('#app_body div[id="cabfHealthAction"]:last').html().replace(/.*Health\/Action:/, 'Health/Action:').replace('Health/Action:', 'Filtered: ' + _count + '<br/>Health/Action:'));
        };

        // class filter
        var filterClass = {
            'All' : '\.',
            'Cleric' : 'Cleric',
            'Mage' : 'Mage',
            'Rogue' : 'Rogue',
            'Warrior' : 'Warrior'
        },
            filterStatus = {
                'All' : '\.',
                'Full health' : 'FullHealth',
                'Got health' : '[^0]\/',
                'Healthy' : 'Healthy',
                'Good' : 'Good',
                'Fair' : 'Fair',
                'Weakened' : 'Weakened',
                'Stunned' : 'Stunned'
            },
            filterPoints = {
                'All' : 'All',
                '50' : '50',
                '40' : '40',
                '30' : '30',
                '20' : '20',
                '10' : '10'
            };
        $('body > ul.ui-selectmenu-menu').remove();

        $('div[style*="/graphics/conq2_insideland_battle_mid.jpg"]').after('<div id="cabfConquestBattleFilterContainer"><div id="cabfConquestBattleFilter" class="ui-state-default"></div></div>');
        var _cCBF = $('#cabfConquestBattleFilter');
        // Battle activity points filter
        _cCBF.prepend('<span class="cabfGateFilterTitle ui-state-default"> Points </span><select id="cabfGatePointsFilter" class="cabfgatefiltertitle">');
        _sel = $('#cabfGatePointsFilter');
        $.each(filterPoints, function (_i, _e) {
            _sel.append('<option value="' + _e + '" ' + (_storedPoints == _i ? 'selected = "selected"' : '') + ' >' + _i + '</option>');
        });
        _sel.change(function () {
            _storedPoints = $(this).find("option:selected").text();
            item.set('cabfPageConquestBattlePoints', _storedPoints);
            filterGate();
        });
        // status filter
        _cCBF.prepend('<span class="cabfGateFilterTitle ui-state-default"> Status </span><select id="cabfGateStatusFilter" class="cabfgatefiltertitle">');
        _sel = $('#cabfGateStatusFilter');
        $.each(filterStatus, function (_i, _e) {
            _sel.append('<option value="' + _e + '" ' + (_storedStatus == _i ? 'selected = "selected"' : '') + ' >' + _i + '</option>');
        });
        _sel.change(function () {
            _storedStatus = $(this).find("option:selected").text();
            item.set('cabfPageConquestBattleStatus', _storedStatus);
            filterGate();
        });
        // Class filter
        _cCBF.prepend('<span class="cabfGateFilterTitle ui-state-default"> Class </span><select id="cabfGateClassFilter" class="cabfgatefiltertitle">');
        _sel = $('#cabfGateClassFilter');
        $.each(filterClass, function (_i, _e) {
            _sel.append('<option value="' + _e + '" ' + (_storedClass == _i ? 'selected = "selected"' : '') + ' >' + _i + '</option>');
        });
        _sel.change(function () {
            _storedClass = $(this).find("option:selected").text();
            item.set('cabfPageConquestBattleClass', _storedClass);
            filterGate();
        });
        // Clear filters
        _cCBF.prepend($('<button>Clear filters</button>').button().css({
            'position' : 'relative !important',
            'left' : 9,
            'top' : 3,
            'fontSize' : 12,
            'height' : 25,
            'borderRadius' : 0,
            'float' : 'left'
        }).click(function () {
            $('span.ui-selectmenu-status').text('All');
            $('#cabfGateClassFilter, #cabfGateStatusFilter, #cabfGatePointsFilter').val('All');
            _storedClass = _storedStatus = _storedPoints = 'All';
            item.set('cabfPageConquestBattleClass', 'All');
            item.set('cabfPageConquestBattleStatus', 'All');
            item.set('cabfPageConquestBattlePoints', 'All');
            filterGate();
        }));
        window.setTimeout(function () {
            filterGate();
        }, 10);
    } catch (e) {
        console.error("Error in cabf_conquestmistfilter", e);
    }

}

/*******************************************************************************************************************************************************************************
 ********************************************************************************************************************************************************************************
 *************    EARTH BATTLE **************************************************************************************************************************************************
 ********************************************************************************************************************************************************************************
 *******************************************************************************************************************************************************************************/
function cabf_conquestearthfilter() {

    try {
        window.setTimeout(function () {
            // Saved filter settings
            var _storedClass = item.get('cabfPageConquestBattleClass', 'All');
            var _storedStatus = item.get('cabfPageConquestBattleStatus', 'All');
            var _storedPoints = item.get('cabfPageConquestBattlePoints', 'All');

            //var     _tower = parseInt(/\d+/.exec($('div[class="tower_tab"][style*="display:block"]').attr("id")), 10);
            var _towers = {
                1 : "Attack Tower",
                2 : "Defense Tower",
                3 : "Damage Tower",
                4 : "Health Tower"
            };
            var _tower = 1;
            var _burnEarthToken = item.get('cabfBurnEarthToken', false);
            if ($("#cabfHealthActionEarth").length > 0) {
                $("#cabfHealthActionEarth").show();
            } else {
                $('#conquest_report').after('<div id="cabfHealthActionEarth"><div>Attack Tower</div><div id="cabfEarthFiltered1">Filtered: 0</div><div id="cabfEarthAction1">Health/Action: 0</div><div><br></div><div>Defense Tower</div><div id="cabfEarthFiltered2">Filtered: 0</div><div id="cabfEarthAction2">Health/Action: 0</div><div><br></div><div>Damage Tower</div><div id="cabfEarthFiltered3">Filtered: 0</div><div id="cabfEarthAction3">Health/Action: 0</div><div><br></div><div>Health Tower</div><div id="cabfEarthFiltered4">Filtered: 0</div><div id="cabfEarthAction4">Health/Action: 0</div><div>__________</div><div>Burn Token : <input type="checkbox" id="burnearthtoken" ></div></div>');
            }
            $('#burnearthtoken').on('change', function () {
                item.set('cabfBurnEarthToken', $(this).is(":checked"));
                _burnEarthToken = $(this).is(":checked");
            });
            $('#burnearthtoken').prop('checked', _burnEarthToken);

            // update Stat Gate
            function updateStatGate() {
                for (var _x in _towers) {
                    console.log("_tower", _x);

                    var _defenderHealth = 0,
                        _actions = parseInt(/\d+/.exec($('#app_body div[id="actions_left_' + _x + '"]:contains("ACTIONS LEFT:"):last').text()), 10);

                    console.log("_actions", _actions);
                    if ($('#tower_' + _x + ' > #crystal_' + _x).length > 0) {
                        _defenderHealth = 0;
                    } else if (_actions <= 0) {
                        _defenderHealth = 0;
                    } else {
                        var _nb = 0;
                        $('#tower_' + _x + ' > div > div').each(function (_i, _e) {
                            var _text = $(_e).text().trim(),
                                _health,
                                _maxHealth,
                                _fullhealth,
                                winStat = '';
                            if (_text) {
                                _nb++;
                                // enemy full health
                                _health = /(\d+)\//.exec(_text)[1];
                                _maxHealth = /\/(\d+)/.exec(_text)[1];
                                if ((_maxHealth - _health) === 0) {
                                    _fullhealth = true;
                                } else {
                                    _fullhealth = false;
                                }
                                _defenderHealth += parseInt(/(\d+)(?:\/)/.exec($(this).text())[1], 10);
                                $(_e, 'div > div').append('<div style="clear:both;"></div>');
                                if ($('input[name="target_id"]', _e).length > 0) {
                                    var target_id = $('input[name="target_id"]', _e).attr("value");
                                    winStat = getTargetStat(target_id);
                                    addTargetTip(_e);
                                    target_id = null;
                                }
                                if (_fullhealth) {
                                    $(_e, 'div > div').append('<span class="GuildNumG">' + _nb + '</span>' + '<br>' + winStat);
                                } else {
                                    $(_e, 'div > div').append('<span class="GuildNumR">' + _nb + '</span>' + '<br>' + winStat);
                                }
                            }
                            _text = null;
                            _health = null;
                            _maxHealth = null;
                            winStat = null;
                        });
                    }
                    if (_actions > 0) {
                        $('#cabfEarthAction' + _x).html('Health/Action: ' + (_defenderHealth / _actions).toFixed(0));
                    } else {
                        $('#cabfEarthAction' + _x).html('Health/Action: #');
                    }
                    _actions = null;
                }
            }
            // gate filter
            filterGate = function () {
                var _myLevel = $('a[href*="keep.php"] > div[style="color:#ffffff"]').text().match(/\d+/);
                var myLevel = Number(_myLevel[0]);
                for (var _x in _towers) {
                    console.log("filterGate _tower", _x);
                    var _count = 0;
                    if ($('#tower_' + _x + ' > #crystal_' + _x).length > 0) {
                        _count = 0;
                    } else {
                        $('#tower_' + _x + ' > div > div').each(function (_i, _e) {
                            var _class = new RegExp($('#cabfGateClassFilter').val());
                            var _state = new RegExp($('#cabfGateStatusFilter').val());
                            var _points = $('#cabfGatePointsFilter').val();
                            var _text = $(_e).text().trim(),
                                _health,
                                _maxHealth,
                                _fullhealth,
                                _eClass;

                            // enemy class
                            _eClass = $(_e).find('img[title="Cleric"], img[title="Mage"], img[title="Warrior"], img[title="Rogue"]').attr("title");
                            if (!_eClass)
                                return;
                            // enemy full health
                            _health = /(\d+)\//.exec(_text)[1];
                            _maxHealth = /\/(\d+)/.exec(_text)[1];
                            if ((_maxHealth - _health) === 0) {
                                _fullhealth = true;
                            } else {
                                _fullhealth = false;
                            }

                            if (_class.test(_eClass) && (_state.test(_text) || (_state.test('FullHealth') && _fullhealth))) {
                                if (_points !== 'All') {
                                    if (/Level:\ \d+/.test(_text)) {
                                        var targetLevel = parseInt(/(?:Level:\ )(\d+)/g.exec(_text)[1]);
                                        var _showTarget = false;
                                        switch (_points) {
                                            case '50':
                                                if (targetLevel > 900) {
                                                    _showTarget = true;
                                                }
                                                break;
                                            case '40':
                                                if ((targetLevel > 600) && (targetLevel <= 900)) {
                                                    _showTarget = true;
                                                }
                                                break;
                                            case '30':
                                                if ((targetLevel > 300) && (targetLevel <= 600)) {
                                                    _showTarget = true;
                                                }
                                                break;
                                            case '20':
                                                if ((targetLevel > 100) && (targetLevel <= 300)) {
                                                    _showTarget = true;
                                                }
                                                break;
                                            case '10':
                                                if (targetLevel <= 100) {
                                                    _showTarget = true;
                                                }
                                                break;
                                            default:
                                                _showTarget = true;
                                        }
                                        if (_showTarget) {
                                            $(_e).show();
                                            _count += 1;
                                        } else {
                                            $(_e).hide();
                                        }
                                        targetLevel = null;
                                    } else {
                                        console.log('Error in points filter!');
                                        $(_e).show();
                                        _count += 1;
                                    }
                                } else {
                                    $(_e).show();
                                    _count += 1;
                                }
                            } else {
                                $(_e).hide();
                            }
                            _class = null;
                            _state = null;
                            _points = null;
                            _text = null;
                            _eClass = null;
                            _health = null;
                            _maxHealth = null;
                        });
                    }
                    $('#cabfEarthFiltered' + _x).html('Filtered: ' + _count);
                    //$('#app_body div[id="cabfHealthActionEarth"]:last').html($('#app_body div[id="cabfHealthActionEarth"]:last').html().replace(/.*Health\/Action:/, 'Health/Action:').replace('Health/Action:', 'Filtered: ' + _count + '<br/>Health/Action:'));
                }
                _myLevel = null;
                myLevel = null;
            };

            // class filter
            var filterClass = {
                'All' : '\.',
                'Cleric' : 'Cleric',
                'Mage' : 'Mage',
                'Rogue' : 'Rogue',
                'Warrior' : 'Warrior'
            },
                filterStatus = {
                    'All' : '\.',
                    'Full health' : 'FullHealth',
                    'Got health' : '[^0]\/',
                    'Healthy' : 'Healthy',
                    'Good' : 'Good',
                    'Fair' : 'Fair',
                    'Weakened' : 'Weakened',
                    'Stunned' : 'Stunned'
                },
                filterPoints = {
                    'All' : 'All',
                    '50' : '50',
                    '40' : '40',
                    '30' : '30',
                    '20' : '20',
                    '10' : '10'
                };
            $('body > ul.ui-selectmenu-menu').remove();

            if ($("#cabfConquestEarthFilterContainer").length > 0) {
                $("#cabfConquestEarthFilterContainer").show();
            } else {
                $('#conquest_report').after('<div id="cabfConquestEarthFilterContainer"><div id="cabfConquestEarthFilter" class="ui-state-default"></div></div>');
                var _cCBF = $('#cabfConquestEarthFilter');
                // Battle activity points filter
                _cCBF.prepend('<span class="cabfGateFilterTitle ui-state-default"> Points </span><select id="cabfGatePointsFilter" class="cabfgatefiltertitle">');
                _sel = $('#cabfGatePointsFilter');
                $.each(filterPoints, function (_i, _e) {
                    _sel.append('<option value="' + _e + '" ' + (_storedPoints == _i ? 'selected = "selected"' : '') + ' >' + _i + '</option>');
                });
                _sel.change(function () {
                    _storedPoints = $(this).find("option:selected").text();
                    item.set('cabfPageConquestBattlePoints', _storedPoints);
                    filterGate();
                });
                // status filter
                _cCBF.prepend('<span class="cabfGateFilterTitle ui-state-default"> Status </span><select id="cabfGateStatusFilter" class="cabfgatefiltertitle">');
                _sel = $('#cabfGateStatusFilter');
                $.each(filterStatus, function (_i, _e) {
                    _sel.append('<option value="' + _e + '" ' + (_storedStatus == _i ? 'selected = "selected"' : '') + ' >' + _i + '</option>');
                });
                _sel.change(function () {
                    _storedStatus = $(this).find("option:selected").text();
                    item.set('cabfPageConquestBattleStatus', _storedStatus);
                    filterGate();
                });
                // Class filter
                _cCBF.prepend('<span class="cabfGateFilterTitle ui-state-default"> Class </span><select id="cabfGateClassFilter" class="cabfgatefiltertitle">');
                _sel = $('#cabfGateClassFilter');
                $.each(filterClass, function (_i, _e) {
                    _sel.append('<option value="' + _e + '" ' + (_storedClass == _i ? 'selected = "selected"' : '') + ' >' + _i + '</option>');
                });
                _sel.change(function () {
                    _storedClass = $(this).find("option:selected").text();
                    item.set('cabfPageConquestBattleClass', _storedClass);
                    filterGate();
                });
                // Clear filters
                _cCBF.prepend($('<button>Clear filters</button>').button().css({
                    'position' : 'relative !important',
                    'left' : 9,
                    'top' : 3,
                    'fontSize' : 12,
                    'height' : 25,
                    'borderRadius' : 0,
                    'float' : 'left'
                }).click(function () {
                    $('span.ui-selectmenu-status').text('All');
                    $('#cabfGateClassFilter, #cabfGateStatusFilter, #cabfGatePointsFilter').val('All');
                    _storedClass = _storedStatus = _storedPoints = 'All';
                    item.set('cabfPageConquestBattleClass', 'All');
                    item.set('cabfPageConquestBattleStatus', 'All');
                    item.set('cabfPageConquestBattlePoints', 'All');
                    filterGate();
                }));
            }
            if (_burnEarthToken) {
                var _e = $('#results_main_wrapper');
                if (_e.length > 0) {
                    var _credits = /GUARDIAN\ PATH\ CREDIT:\ YES/.exec(_e.text());
                    if (_credits !== null) {
                        var _eButton = $(_e).find('input[src*="war_healagainbtn"], input[src*="war_duelagainbtn2"]');
                        if (_eButton.length > 0) {
                            window.setTimeout(function () {
                                _eButton.click();
                            }, 1000);
                        } else {
                            updateStatGate();
                            filterGate();
                        }
                    } else {
                        updateStatGate();
                        filterGate();
                    }
                } else {
                    updateStatGate();
                    filterGate();
                }
            } else {
                updateStatGate();
                filterGate();
            }
        }, 10);
    } catch (e) {
        console.error("Error in cabf_conquestearthfilter", e);
    }
}

/*******************************************************************************************************************************************************************************
 ********************************************************************************************************************************************************************************
 *************    GUILD BATTLE **************************************************************************************************************************************************
 ********************************************************************************************************************************************************************************
 *******************************************************************************************************************************************************************************/
function cabf_guildbattlefilter() {
    // fix gate reseting when attacking with duel button
    var _gate = /\d/.exec($('#enemy_guild_battle_section_battle_list, #your_guild_battle_section_battle_list').attr('class'));
    $('#results_main_wrapper form, #enemy_new_guild_member_list form, #your_new_guild_member_list form').append('<input type="hidden" name="sel_pos" value="' + _gate + '">');

    // add percentage to health bars
    var _your = (1 - ($('div[style*="/guild_battle_bar_you.gif"]').width() / $('div[style*="/guild_battle_bar_you.gif"]').parent().width())) * 100;
    var _enemy = (1 - ($('div[style*="/guild_battle_bar_enemy.gif"]').width() / $('div[style*="/guild_battle_bar_enemy.gif"]').parent().width())) * 100;
    var $_your = $('span:contains("YOUR GUILD")');
    var $_enemy = $('span:contains("ENEMY\'S GUILD")');
    $_your.html($_your.html() + ' (' + _your.toFixed(1) + '%)');
    $_enemy.html($_enemy.html() + ' (' + _enemy.toFixed(1) + '%)');

    // enemys health added to its name in results
    $_enemy = $('span.result_body div[style*="width: 285px;"]:last');
    if ($_enemy.length > 0) {
        var _target = $('span.result_body input[name="target_id"]').attr('value');
        var _health = /Health:\s*(\d+)\/\d+/.exec($('#enemy_new_guild_member_list > div > div:has(a[uid="' + _target + '"]):first').text());
        if (_health !== null) {
            $_enemy.html($_enemy.html() + ' (' + _health[1] + ')');
        }
        // Clear var
        _target = '';
        _health = '';
    }

    // resize top image
    $('input[value="enter_battle"]').parents('form:first').css({
        'position' : 'relative'
    });
    $('#guild_battle_banner_section').find('div:contains("VICTOR")').next().next().css('marginTop', 10).end();
    $('#guild_battle_banner_section > div:eq(2)').css('marginTop', 0);
    $('div:contains("The Battle Between"):last').parent().css('marginTop', 20);
    $('input[src*="collect_reward_button2.jpg"]').parents('div:eq(2)').css('marginTop', 0);
    normalDuelStats('#guild_battle_guild_tabs');
    addStatBoard('#guild_battle_guild_tabs');

    // add current tokens to result
    var _tokens = $('div.result div:contains("-1 Battle Tokens"):last');
    _tokens.text(_tokens.text() + ' (' + $('#guild_token_current_value').text() + ' left)');

    // reduce gate size and add number
    if ($('#your_new_guild_member_list:contains("No Soldiers Posted In This Position!"), #enemy_new_guild_member_list:contains("No Soldiers Posted In This Position!")').length === 0) {
        var _guildnum = 1,
            _count = 0,
            _totalhealth = 0,
            _totalhealthleft = 0,
            _clericcount = 0,
            _clericlivecount = 0,
            _clerictotalhealth = 0,
            _clerictotalhealthleft = 0,
            _magecount = 0,
            _magelivecount = 0,
            _magetotalhealth = 0,
            _magetotalhealthleft = 0,
            _roguecount = 0,
            _roguelivecount = 0,
            _roguetotalhealth = 0,
            _roguetotalhealthleft = 0,
            _warriorcount = 0,
            _warriorlivecount = 0,
            _warriortotalhealth = 0,
            _warriortotalhealthleft = 0,
            _activecount = 0,
            _activelivecount = 0,
            _activetotalhealth = 0,
            _activetotalhealthleft = 0;
        var _gateNum = $('#enemy_guild_battle_section_battle_list, #your_guild_battle_section_battle_list').attr('class').match(/\d/)[0];
        var _gateName = '';
        if ($('#enemy_guild_battle_section_battle_list').length > 0) {
            $('#cabfStatType').html('Enemy');
        } else {
            $('#cabfStatType').html('Ally');
        }
        switch (_gateNum) {
            case '1':
                _gateName = 'North';
                break;
            case '2':
                _gateName = 'West';
                break;
            case '3':
                _gateName = 'East';
                break;
            case '4':
                _gateName = 'South';
                break;
            default:
                _gateName = ' ';
        }
        $('#cabfStatTower span:last').html(_gateName + ' Tower Stat');
        $('#cabfStatCleric span:last').html(_gateName + ' Cleric Stat');
        $('#cabfStatMage span:last').html(_gateName + ' Mage Stat');
        $('#cabfStatRogue span:last').html(_gateName + ' Rogue Stat');
        $('#cabfStatWarrior span:last').html(_gateName + ' Warrior Stat');
        $('#cabfStatActive span:last').html(_gateName + ' Active Stat');

        $('#enemy_new_guild_member_list > div > div, #your_new_guild_member_list > div > div').each(function (_i, _e) {
            var _text = $(_e).text().trim(),
                _FullHealth = true;
            if (_text && $(_e).text().trim().length > 0) {
                var _test = /(\d+)\/(\d+)/g.exec(_text);
                var _active = /Battle\ Points:\ [1-9]/g.exec(_text);
                var winStat = '';
                if ($('input[name="target_id"]', _e).length > 0) {
                    var target_id = $('input[name="target_id"]', _e).attr("value");
                    winStat = getTargetStat(target_id);
                    addTargetTip(_e);

                }
                if (_test) {
                    _FullHealth = (_test.length === 3 && _test[1] === _test[2]) ? true : false;
                    if (_FullHealth)
                        $(_e).append('<span class="GuildNumG">' + (_guildnum) + '</span>' + '<br>' + winStat);
                    else
                        $(_e).append('<span class="GuildNumR">' + (_guildnum) + '</span>' + '<br>' + winStat);
                } else {
                    $(_e).append('<span class="GuildNum">' + (_guildnum) + '</span>' + '<br>' + winStat);
                }
                _guildnum += 1;
                _count += 1;
                _totalhealth += parseInt(_test[2]);
                _totalhealthleft += parseInt(_test[1]);
                if ($(_e).find('img[src*="/graphics/class_cleric.gif"]').length > 0) {
                    _clericcount += 1;
                    _clerictotalhealth += parseInt(_test[2]);
                    if (_test[1] > 0)
                        _clericlivecount += 1;
                    _clerictotalhealthleft += parseInt(_test[1]);
                }
                if ($(_e).find('img[src*="/graphics/class_mage.gif"]').length > 0) {
                    _magecount += 1;
                    _magetotalhealth += parseInt(_test[2]);
                    if (_test[1] > 0)
                        _magelivecount += 1;
                    _magetotalhealthleft += parseInt(_test[1]);
                }
                if ($(_e).find('img[src*="/graphics/class_rogue.gif"]').length > 0) {
                    _roguecount += 1;
                    _roguetotalhealth += parseInt(_test[2]);
                    if (_test[1] > 0)
                        _roguelivecount += 1;
                    _roguetotalhealthleft += parseInt(_test[1]);
                }
                if ($(_e).find('img[src*="/graphics/class_warrior.gif"]').length > 0) {
                    _warriorcount += 1;
                    _warriortotalhealth += parseInt(_test[2]);
                    if (_test[1] > 0)
                        _warriorlivecount += 1;
                    _warriortotalhealthleft += parseInt(_test[1]);
                }
                if (_active) {
                    _activecount += 1;
                    _activetotalhealth += parseInt(_test[2]);
                    if (_test[1] > 0)
                        _activelivecount += 1;
                    _activetotalhealthleft += parseInt(_test[1]);
                }
            } else {
                $(_e).remove();
            }
            _text = '';
            //_test = null;
        });
        if (_count > 0) {
            $('#cabfTotalHealth').html('Total Health: ' + _totalhealth);
            $('#cabfAverageHealth').html('Average Health: ' + (_totalhealth / _count).toFixed());
            $('#cabfHealthLeft').html('Health Left: ' + _totalhealthleft);
            $('#cabfAverageHealthLeft').html('Average Health Left: ' + (_totalhealthleft / (_clericlivecount + _magelivecount + _roguelivecount + _warriorlivecount)).toFixed());
            $('#cabfPercentageHealthLeft').html('Percentage Health Left: ' + (_totalhealthleft * 100 / _totalhealth).toFixed(1) + '%');

            if (_clericcount > 0) {
                $('#cabfClericTotalHealth').html('Total Health: ' + _clerictotalhealth);
                $('#cabfClericAverageHealth').html('Average Health: ' + (_clerictotalhealth / _clericcount).toFixed());
                $('#cabfClericHealthLeft').html('Health Left: ' + _clerictotalhealthleft);
                if (_clericlivecount > 0) {
                    $('#cabfClericAverageHealthLeft').html('Average Health Left: ' + (_clerictotalhealthleft / _clericlivecount).toFixed());
                }
                $('#cabfClericPercentageHealthLeft').html('Percentage Health Left: ' + (_clerictotalhealthleft * 100 / _clerictotalhealth).toFixed(1) + '%');
            }

            if (_magecount > 0) {
                $('#cabfMageTotalHealth').html('Total Health: ' + _magetotalhealth);
                $('#cabfMageAverageHealth').html('Average Health: ' + (_magetotalhealth / _magecount).toFixed());
                $('#cabfMageHealthLeft').html('Health Left: ' + _magetotalhealthleft);
                if (_magelivecount > 0) {
                    $('#cabfMageAverageHealthLeft').html('Average Health Left: ' + (_magetotalhealthleft / _magelivecount).toFixed());
                }
                $('#cabfMagePercentageHealthLeft').html('Percentage Health Left: ' + (_magetotalhealthleft * 100 / _magetotalhealth).toFixed(1) + '%');
            }

            if (_roguecount > 0) {
                $('#cabfRogueTotalHealth').html('Total Health: ' + _roguetotalhealth);
                $('#cabfRogueAverageHealth').html('Average Health: ' + (_roguetotalhealth / _roguecount).toFixed());
                $('#cabfRogueHealthLeft').html('Health Left: ' + _roguetotalhealthleft);
                if (_roguelivecount > 0) {
                    $('#cabfRogueAverageHealthLeft').html('Average Health Left: ' + (_roguetotalhealthleft / _roguelivecount).toFixed());
                }
                $('#cabfRoguePercentageHealthLeft').html('Percentage Health Left: ' + (_roguetotalhealthleft * 100 / _roguetotalhealth).toFixed(1) + '%');
            }

            if (_warriorcount > 0) {
                $('#cabfWarriorTotalHealth').html('Total Health: ' + _warriortotalhealth);
                $('#cabfWarriorAverageHealth').html('Average Health: ' + (_warriortotalhealth / _warriorcount).toFixed());
                $('#cabfWarriorHealthLeft').html('Health Left: ' + _warriortotalhealthleft);
                if (_warriorlivecount > 0) {
                    $('#cabfWarriorAverageHealthLeft').html('Average Health Left: ' + (_warriortotalhealthleft / _warriorlivecount).toFixed());
                }
                $('#cabfWarriorPercentageHealthLeft').html('Percentage Health Left: ' + (_warriortotalhealthleft * 100 / _warriortotalhealth).toFixed(1) + '%');
            }

            if (_activecount > 0) {
                $('#cabfActiveTotalHealth').html('Total Health: ' + _activetotalhealth);
                $('#cabfActiveAverageHealth').html('Average Health: ' + (_activetotalhealth / _activecount).toFixed());
                $('#cabfActiveHealthLeft').html('Health Left: ' + _activetotalhealthleft);
                if (_activelivecount > 0) {
                    $('#cabfActiveAverageHealthLeft').html('Average Health Left: ' + (_activetotalhealthleft / _activelivecount).toFixed());
                }
                $('#cabfActivePercentageHealthLeft').html('Percentage Health Left: ' + (_activetotalhealthleft * 100 / _activetotalhealth).toFixed(1) + '%');
            }
        }
        // Clear var
        _gateNum = '';
    } else {
        var _gateNumNull = $('#enemy_guild_battle_section_battle_list, #your_guild_battle_section_battle_list').attr('class').match(/\d/)[0];
        if ($('#enemy_guild_battle_section_battle_list').length > 0) {
            $('#cabfStatType').html('Enemy');
        } else {
            $('#cabfStatType').html('Ally');
        }
        switch (_gateNumNull) {
            case '1':
                $('#cabfStatTower span:last').html('North Tower Stat');
                break;
            case '2':
                $('#cabfStatTower span:last').html('West Tower Stat');
                break;
            case '3':
                $('#cabfStatTower span:last').html('East Tower Stat');
                break;
            case '4':
                $('#cabfStatTower span:last').html('South Tower Stat');
                break;
            default:
                $('#cabfStatTower span:last').html('Stat (Tower not Found)');
        }
        // Clear var
        _gateNumNull = '';
    }

    // Saved filter settings
    var _storedClass = item.get('cabfPageGuildBattleClass', 'All');
    var _storedActivity = item.get('cabfPageGuildBattleActivity', 'All');
    var _storedStatus = item.get('cabfPageGuildBattleStatus', 'All');
    var _storedPoints = item.get('cabfPageGuildBattlePoints', 'All');

    // gate filter
    filterGate = function () {
        var _count = 0;
        var _gateNum = $('#enemy_guild_battle_section_battle_list, #your_guild_battle_section_battle_list').attr('class').match(/\d/)[0];
        var _gate = $('#enemy_new_guild_tab_' + _gateNum + ' > div, #your_new_guild_tab_' + _gateNum + ' > div');
        var _myLevel = $('a[href*="keep.php"] > div[style="color:#ffffff"]').text().match(/\d+/);
        var myLevel = Number(_myLevel[0]);
        $('#your_new_guild_member_list > div > div, #enemy_new_guild_member_list > div > div').each(function (_i, _e) {
            var _class = $('#cabfGateClassFilter').val();
            var _activ = new RegExp($('#cabfGateActivityFilter').val(), "g");
            var _state = $('#cabfGateStatusFilter').val();
            var _points = $('#cabfGatePointsFilter').val();
            var _text = $(_e).text().trim(),
                _stateTest = true;
            var _test = false;
            switch (_state) {
                case 'FullHealth':
                    _test = /(\d+)\/(\d+)/g.exec(_text);
                    _stateTest = (_test.length === 3 && _test[1] === _test[2]) ? true : false;
                    break;
                case 'GotHealth':
                    _test = /(\d+)\/(\d+)/g.exec(_text);
                    _stateTest = (_test.length === 3 && parseInt(_test[1]) !== 0) ? true : false;
                    break;
                case 'NoHealth':
                    _test = /(\d+)\/(\d+)/g.exec(_text);
                    _stateTest = (_test.length === 3 && parseInt(_test[1]) === 0) ? true : false;
                    break;
                default:
                    _test = new RegExp(_state, "g");
                    _stateTest = _test.test(_text);
            }

            var _classTest = _class === 'all' ? 1 : $(_e).find('img[src*="/graphics/class_' + _class + '.gif"]').length;
            var _pointTest = _points === 'all' ? 1 : $(_e).find('img[title="Battle Points for Victory: ' + _points + '"]').length;
            if (_classTest > 0 && _activ.test(_text) && /*_pointTest > 0 &&*/
                _stateTest === true) {
                if (_points !== 'All') {
                    if (/Level:\ \d+/.test(_text)) {
                        var targetLevel = parseInt(/(?:Level:\ )(\d+)/g.exec(_text)[1]);
                        var _showTarget = false;
                        switch (_points) {
                            case '160':
                                if (targetLevel <= myLevel * 80 / 100) {
                                    _showTarget = true;
                                }
                                break;
                            case '200':
                                if ((targetLevel > myLevel * 80 / 100) && (targetLevel <= myLevel * 120 / 100)) {
                                    _showTarget = true;
                                }
                                break;
                            case '240':
                                if (targetLevel > myLevel * 120 / 100) {
                                    _showTarget = true;
                                }
                                break;
                            default:
                                _showTarget = true;
                        }
                        if (_showTarget) {
                            $(_e).show();
                            _count += 1;
                        } else {
                            $(_e).hide();
                        }
                    } else {
                        console.log('Error in points filter!');
                        $(_e).show();
                        _count += 1;
                    }
                } else {
                    $(_e).show();
                    _count += 1;
                }
            } else {
                $(_e).hide();
            }

            // Clear var
            _class = '';
            _activ = '';
            _state = '';
            _points = '';
            _text = '';
            _classTest = '';
            _pointTest = '';
        });
        _gate.html(_gate.html().replace(/\).*/, ')').replace(')', ')<br/><span style="font-size:14px;font-weight:bold;">Filtered: ' + _count + '</span>'));
        // Clear var
        _gateNum = '';
        _gate = '';
        _myLevel = '';
        myLevel = 0;
    };

    // class filter
    var filterClass = {
        'All' : 'all',
        'Cleric' : 'cleric',
        'Mage' : 'mage',
        'Rogue' : 'rogue',
        'Warrior' : 'warrior'
    },
        filterActivity = {
            'All' : '\.',
            'Active' : 'Battle Points: [1-9]',
            'Inactive' : 'Battle Points: 0'
        },
        filterStatus = {
            'All' : '\.',
            'Full health' : 'FullHealth',
            'Got health' : 'GotHealth',
            'No health' : 'NoHealth',
            'Healthy' : 'Healthy',
            'Good' : 'Good',
            'Fair' : 'Fair',
            'Weakened' : 'Weakened',
            'Stunned' : 'Stunned'
        },
        filterPoints = {
            'All' : 'all',
            '240' : '240',
            '200' : '200',
            '160' : '160'
        };
    // Class filter
    $('body > ul.ui-selectmenu-menu').remove();
    $('#enemy_guild_battle_section_battle_list, #your_guild_battle_section_battle_list').prepend('<div id="cabf_menu" style="padding: 0 0 30px 0;" >');
    $('#cabf_menu').append($('<button>Clear filters</button>').button().css({
        'position' : 'relative !important',
        'left' : 9,
        'top' : 3,
        'float' : 'left',
        'fontSize' : 12,
        'height' : 25,
        'borderRadius' : 0
    }).click(function () {
        $('span.ui-selectmenu-status').text('All');
        $('#cabfGateClassFilter, #cabfGateActivityFilter, #cabfGateStatusFilter, #cabfGatePointsFilter').val('All');
        _storedClass = _storedActivity = _storedStatus = _storedPoints = 'All';
        item.set('cabfPageGuildBattleClass', 'All');
        item.set('cabfPageGuildBattleActivity', 'All');
        item.set('cabfPageGuildBattleStatus', 'All');
        item.set('cabfPageGuildBattlePoints', 'All');
        filterGate();
    }));
    $('#cabf_menu').append('<span class="cabfGateFilterTitle ui-state-default"> Class </span><select id="cabfGateClassFilter" class="cabfgatefiltertitle">');
    _sel = $('#cabfGateClassFilter');
    $.each(filterClass, function (_i, _e) {
        _sel.append('<option value="' + _e + '" ' + (_storedClass == _i ? 'selected = "selected"' : '') + ' >' + _i + '</option>');
    });
    _sel.change(function () {
        _storedClass = $(this).find("option:selected").text();
        item.set('cabfPageGuildBattleClass', _storedClass);
        filterGate();
    });
    // Activity filter
    $('#cabf_menu').append('<span class="cabfGateFilterTitle ui-state-default"> Activity </span><select id="cabfGateActivityFilter" class="cabfgatefiltertitle">');
    _sel = $('#cabfGateActivityFilter');
    $.each(filterActivity, function (_i, _e) {
        _sel.append('<option value="' + _e + '" ' + (_storedActivity == _i ? 'selected = "selected"' : '') + ' >' + _i + '</option>');
    });
    _sel.change(function () {
        _storedActivity = $(this).find("option:selected").text();
        item.set('cabfPageGuildBattleActivity', _storedActivity);
        filterGate();
    });
    // status filter
    $('#cabf_menu').append('<span class="cabfGateFilterTitle ui-state-default"> Status </span><select id="cabfGateStatusFilter" class="cabfgatefiltertitle">');
    _sel = $('#cabfGateStatusFilter');
    $.each(filterStatus, function (_i, _e) {
        _sel.append('<option value="' + _e + '" ' + (_storedStatus == _i ? 'selected = "selected"' : '') + ' >' + _i + '</option>');
    });
    _sel.change(function () {
        _storedStatus = $(this).find("option:selected").text();
        item.set('cabfPageGuildBattleStatus', _storedStatus);
        filterGate();
    });
    $('#cabfGateStatusFilter, #cabfGateClassFilter, #cabfGateActivityFilter').css({
        'float' : 'left',
        'color' : '#fff',
        'height' : 25,
        'border' : '1 solid #444444',
        'backgroundColor' : '#222',
        'position' : 'relative',
        'left' : 9,
        'top' : 3
    });
    // Battle activity points filter
    $('#cabf_menu').append('<span class="cabfGateFilterTitle ui-state-default"> Points </span><select id="cabfGatePointsFilter" class="cabfgatefiltertitle">');
    _sel = $('#cabfGatePointsFilter');
    $.each(filterPoints, function (_i, _e) {
        _sel.prepend('<option value="' + _e + '" ' + (_storedPoints == _i ? 'selected = "selected"' : '') + ' >' + _i + '</option>');
    });
    _sel.change(function () {
        _storedPoints = $(this).find("option:selected").text();
        item.set('cabfPageGuildBattlePoints', _storedPoints);
        filterGate();
    });

    $('#cabfGatePointsFilter, #cabfGateStatusFilter, #cabfGateClassFilter, #cabfGateActivityFilter').css({
        'float' : 'left',
        'color' : '#fff',
        'height' : 25,
        'border' : '1 solid #444444',
        'backgroundColor' : '#222',
        'position' : 'relative',
        'left' : 9,
        'top' : 3
    });
    window.setTimeout(function () {
        filterGate();
    }, 10);

    // Clear Var
    _gate = '';
    _your = '';
    _enemy = '';
    $_your = '';
    $_enemy = '';
    _tokens = '';
}

/*******************************************************************************************************************************************************************************
 ********************************************************************************************************************************************************************************
 *************    10VS10 BATTLE *************************************************************************************************************************************************
 ********************************************************************************************************************************************************************************
 *******************************************************************************************************************************************************************************/
function cabf_tenbattlefilter() {
    // fix gate reseting when attacking with duel button
    var _gate = /\d/.exec($('#enemy_guild_battle_section_battle_list, #your_guild_battle_section_battle_list').attr('class'));
    $('#results_main_wrapper form, #enemy_new_guild_member_list form, #your_new_guild_member_list form').append('<input type="hidden" name="sel_pos" value="' + _gate + '">');

    // add percentage to health bars
    var _your = (1 - ($('div[style*="/guild_battle_bar_you.gif"]').width() / $('div[style*="/guild_battle_bar_you.gif"]').parent().width())) * 100;
    var _enemy = (1 - ($('div[style*="/guild_battle_bar_enemy.gif"]').width() / $('div[style*="/guild_battle_bar_enemy.gif"]').parent().width())) * 100;
    var $_your = $('span:contains("YOUR GUILD")');
    var $_enemy = $('span:contains("ENEMY\'S GUILD")');
    $_your.html($_your.html() + ' (' + _your.toFixed(1) + '%)');
    $_enemy.html($_enemy.html() + ' (' + _enemy.toFixed(1) + '%)');

    // enemys health added to its name in results
    $_enemy = $('span.result_body div[style*="width: 285px;"]:last');
    if ($_enemy.length > 0) {
        var _target = $('span.result_body input[name="target_id"]').attr('value');
        var _health = /Health:\s*(\d+)\/\d+/.exec($('#enemy_new_guild_member_list > div > div:has(a[uid="' + _target + '"]):first').text());
        if (_health !== null) {
            $_enemy.html($_enemy.html() + ' (' + _health[1] + ')');
        }
    }

    // resize top image
    $('input[value="enter_battle"]').parents('form:first').css({
        'position' : 'relative'
    });
    $('#guild_battle_banner_section').find('div:contains("VICTOR")').next().next().css('marginTop', 10).end();
    $('#guild_battle_banner_section > div:eq(2)').css('marginTop', 0);
    $('div:contains("The Battle Between"):last').parent().css('marginTop', 20);
    $('input[src*="collect_reward_button2.jpg"]').parents('div:eq(2)').css('marginTop', 0);
    normalDuelStats('#guild_battle_guild_tabs');
    addStatBoard('#guild_battle_guild_tabs');

    // add current tokens to result
    var _tokens = $('div.result div:contains("-1 Battle Tokens"):last');
    _tokens.text(_tokens.text() + ' (' + $('#guild_token_current_value').text() + ' left)');

    // reduce gate size and add number
    if ($('#your_new_guild_member_list:contains("No Soldiers Posted In This Position!"), #enemy_new_guild_member_list:contains("No Soldiers Posted In This Position!")').length === 0) {
        var _guildnum = 1,
            _count = 0,
            _totalhealth = 0,
            _totalhealthleft = 0,
            _clericcount = 0,
            _clerictotalhealth = 0,
            _clerictotalhealthleft = 0,
            _magecount = 0,
            _magetotalhealth = 0,
            _magetotalhealthleft = 0,
            _roguecount = 0,
            _roguetotalhealth = 0,
            _roguetotalhealthleft = 0,
            _warriorcount = 0,
            _warriortotalhealth = 0,
            _warriortotalhealthleft = 0,
            _activecount = 0,
            _activelivecount = 0,
            _activetotalhealth = 0,
            _activetotalhealthleft = 0;
        if ($('#enemy_guild_battle_section_battle_list').length > 0) {
            $('#cabfStatType').html('Enemy Stat');
        } else {
            $('#cabfStatType').html('Ally Stat');
        }
        $('#cabfStatTower span:last').html('All Class Stat');
        $('#cabfStatCleric span:last').html(' Cleric Stat');
        $('#cabfStatMage span:last').html(' Mage Stat');
        $('#cabfStatRogue span:last').html(' Rogue Stat');
        $('#cabfStatWarrior span:last').html(' Warrior Stat');
        $('#cabfStatActive span:last').html(' Active Stat');

        $('#enemy_new_guild_member_list > div > div, #your_new_guild_member_list > div > div').each(function (_i, _e) {
            var _text = $(_e).text().trim(),
                _FullHealth = true;
            if (_text && $(_e).text().trim().length > 0) {
                var _test = /(\d+)\/(\d+)/g.exec(_text);
                var _active = /Battle\ Points:\ [1-9]/g.exec(_text);
                var winStat = '';
                if ($('input[name="target_id"]', _e).length > 0) {
                    var target_id = $('input[name="target_id"]', _e).attr("value");
                    winStat = getTargetStat(target_id);
                    addTargetTip(_e);
                }
                if (_test) {
                    _FullHealth = (_test.length === 3 && _test[1] === _test[2]) ? true : false;
                    if (_FullHealth)
                        $(_e).append('<span class="GuildNumG">' + (_guildnum) + '</span>' + '<br>' + winStat);
                    else
                        $(_e).append('<span class="GuildNumR">' + (_guildnum) + '</span>' + '<br>' + winStat);
                } else {
                    $(_e).append('<span class="GuildNum">' + (_guildnum) + '</span>' + '<br>' + winStat);
                }
                _guildnum += 1;
                _count += 1;
                _totalhealth += parseInt(_test[2]);
                _totalhealthleft += parseInt(_test[1]);
                if ($(_e).find('img[src*="/graphics/class_cleric.gif"]').length > 0) {
                    _clericcount += 1;
                    _clerictotalhealth += parseInt(_test[2]);
                    _clerictotalhealthleft += parseInt(_test[1]);
                }
                if ($(_e).find('img[src*="/graphics/class_mage.gif"]').length > 0) {
                    _magecount += 1;
                    _magetotalhealth += parseInt(_test[2]);
                    _magetotalhealthleft += parseInt(_test[1]);
                }
                if ($(_e).find('img[src*="/graphics/class_rogue.gif"]').length > 0) {
                    _roguecount += 1;
                    _roguetotalhealth += parseInt(_test[2]);
                    _roguetotalhealthleft += parseInt(_test[1]);
                }
                if ($(_e).find('img[src*="/graphics/class_warrior.gif"]').length > 0) {
                    _warriorcount += 1;
                    _warriortotalhealth += parseInt(_test[2]);
                    _warriortotalhealthleft += parseInt(_test[1]);
                }
                if (_active) {
                    _activecount += 1;
                    _activetotalhealth += parseInt(_test[2]);
                    if (_test[1] > 0)
                        _activelivecount += 1;
                    _activetotalhealthleft += parseInt(_test[1]);
                }
            } else {
                $(_e).remove();
            }
            _text = '';
            //_test = null;
        });
        if (_count > 0) {
            $('#cabfTotalHealth').html('Total Health: ' + _totalhealth);
            $('#cabfAverageHealth').html('Average Health: ' + (_totalhealth / _count).toFixed());
            $('#cabfHealthLeft').html('Health Left: ' + _totalhealthleft);
            $('#cabfAverageHealthLeft').html('Average Health Left: ' + (_totalhealthleft / _count).toFixed());
            $('#cabfPercentageHealthLeft').html('Percentage Health Left: ' + (_totalhealthleft * 100 / _totalhealth).toFixed(1) + '%');

            if (_clericcount > 0) {
                $('#cabfClericTotalHealth').html('Total Health: ' + _clerictotalhealth);
                $('#cabfClericAverageHealth').html('Average Health: ' + (_clerictotalhealth / _clericcount).toFixed());
                $('#cabfClericHealthLeft').html('Health Left: ' + _clerictotalhealthleft);
                $('#cabfClericAverageHealthLeft').html('Average Health Left: ' + (_clerictotalhealthleft / _clericcount).toFixed());
                $('#cabfClericPercentageHealthLeft').html('Percentage Health Left: ' + (_clerictotalhealthleft * 100 / _clerictotalhealth).toFixed(1) + '%');
            }

            if (_magecount > 0) {
                $('#cabfMageTotalHealth').html('Total Health: ' + _magetotalhealth);
                $('#cabfMageAverageHealth').html('Average Health: ' + (_magetotalhealth / _magecount).toFixed());
                $('#cabfMageHealthLeft').html('Health Left: ' + _magetotalhealthleft);
                $('#cabfMageAverageHealthLeft').html('Average Health Left: ' + (_magetotalhealthleft / _magecount).toFixed());
                $('#cabfMagePercentageHealthLeft').html('Percentage Health Left: ' + (_magetotalhealthleft * 100 / _magetotalhealth).toFixed(1) + '%');
            }

            if (_roguecount > 0) {
                $('#cabfRogueTotalHealth').html('Total Health: ' + _roguetotalhealth);
                $('#cabfRogueAverageHealth').html('Average Health: ' + (_roguetotalhealth / _roguecount).toFixed());
                $('#cabfRogueHealthLeft').html('Health Left: ' + _roguetotalhealthleft);
                $('#cabfRogueAverageHealthLeft').html('Average Health Left: ' + (_roguetotalhealthleft / _roguecount).toFixed());
                $('#cabfRoguePercentageHealthLeft').html('Percentage Health Left: ' + (_roguetotalhealthleft * 100 / _roguetotalhealth).toFixed(1) + '%');
            }

            if (_warriorcount > 0) {
                $('#cabfWarriorTotalHealth').html('Total Health: ' + _warriortotalhealth);
                $('#cabfWarriorAverageHealth').html('Average Health: ' + (_warriortotalhealth / _warriorcount).toFixed());
                $('#cabfWarriorHealthLeft').html('Health Left: ' + _warriortotalhealthleft);
                $('#cabfWarriorAverageHealthLeft').html('Average Health Left: ' + (_warriortotalhealthleft / _warriorcount).toFixed());
                $('#cabfWarriorPercentageHealthLeft').html('Percentage Health Left: ' + (_warriortotalhealthleft * 100 / _warriortotalhealth).toFixed(1) + '%');
            }

            if (_activecount > 0) {
                $('#cabfActiveTotalHealth').html('Total Health: ' + _activetotalhealth);
                $('#cabfActiveAverageHealth').html('Average Health: ' + (_activetotalhealth / _activecount).toFixed());
                $('#cabfActiveHealthLeft').html('Health Left: ' + _activetotalhealthleft);
                if (_activelivecount > 0) {
                    $('#cabfActiveAverageHealthLeft').html('Average Health Left: ' + (_activetotalhealthleft / _activelivecount).toFixed());
                }
                $('#cabfActivePercentageHealthLeft').html('Percentage Health Left: ' + (_activetotalhealthleft * 100 / _activetotalhealth).toFixed(1) + '%');
            }
        }
    }

    // Add refresh on enemy_guild_tab and your_guild_tab for 10vs10 battle
    if ($('a[href*="ten_battle.php?battle_id="]').length > 0) {
        var _battleid = $('input[name="battle_id"]').attr('value');
        console.log('_battleid=' + _battleid);
        if ($('#enemy_guild_tab').length > 0) {
            $('#enemy_guild_tab').css({
                "font-size" : "15px",
                "padding-top" : "0px",
                "text-align" : "center"
            });
            $('#enemy_guild_tab').wrap('<a href="ten_battle.php?battle_id=' + _battleid + '&view_allies=false" onclick="ajaxLinkSend(\'globalContainer\', \'ten_battle.php?battle_id=' + _battleid + '&view_allies=false\'); return false;"></a>');
        }
        if ($('#your_guild_tab').length > 0) {
            $('#your_guild_tab').css({
                "font-size" : "15px",
                "padding-top" : "0px",
                "text-align" : "center"
            });
            $('#your_guild_tab').wrap('<a href="ten_battle.php?battle_id=' + _battleid + '&view_allies=true" onclick="ajaxLinkSend(\'globalContainer\', \'ten_battle.php?battle_id=' + _battleid + '&view_allies=true\'); return false;"></a>');
        }
    }

    // Saved filter settings
    var _storedClass = item.get('cabfPageTenBattleClass', 'All');
    var _storedActivity = item.get('cabfPageTenBattleActivity', 'All');
    var _storedStatus = item.get('cabfPageTenBattleStatus', 'All');
    var _storedPoints = item.get('cabfPageTenBattlePoints', 'All');

    // gate filter
    filterGate = function () {
        var _count = 0;
        var _myLevel = $('a[href*="keep.php"] > div[style="color:#ffffff"]').text().match(/\d+/);
        var myLevel = Number(_myLevel[0]);
        $('#your_new_guild_member_list > div > div, #enemy_new_guild_member_list > div > div').each(function (_i, _e) {
            var _class = $('#cabfGateClassFilter').val();
            var _activ = new RegExp($('#cabfGateActivityFilter').val(), "g");
            var _state = $('#cabfGateStatusFilter').val();
            var _points = $('#cabfGatePointsFilter').val();
            var _text = $(_e).text().trim(),
                _stateTest = true;
            var _test = false;
            switch (_state) {
                case 'FullHealth':
                    _test = /(\d+)\/(\d+)/g.exec(_text);
                    _stateTest = (_test.length === 3 && _test[1] === _test[2]) ? true : false;
                    break;
                case 'GotHealth':
                    _test = /(\d+)\/(\d+)/g.exec(_text);
                    _stateTest = (_test.length === 3 && parseInt(_test[1]) !== 0) ? true : false;
                    break;
                case 'NoHealth':
                    _test = /(\d+)\/(\d+)/g.exec(_text);
                    _stateTest = (_test.length === 3 && parseInt(_test[1]) === 0) ? true : false;
                    break;
                default:
                    _test = new RegExp(_state, "g");
                    _stateTest = _test.test(_text);
            }

            var _classTest = _class === 'all' ? 1 : $(_e).find('img[src*="/graphics/class_' + _class + '.gif"]').length;
            var _pointTest = _points === 'all' ? 1 : $(_e).find('img[title="Battle Points for Victory: ' + _points + '"]').length;
            if (_classTest > 0 && _activ.test(_text) && /*_pointTest > 0 &&*/
                _stateTest === true) {
                if (_points !== 'All') {
                    if (/Level:\ \d+/.test(_text)) {
                        var targetLevel = parseInt(/(?:Level:\ )(\d+)/g.exec(_text)[1]);
                        var _showTarget = false;
                        switch (_points) {
                            case '160':
                                if (targetLevel <= myLevel * 80 / 100) {
                                    _showTarget = true;
                                }
                                break;
                            case '200':
                                if ((targetLevel > myLevel * 80 / 100) && (targetLevel <= myLevel * 120 / 100)) {
                                    _showTarget = true;
                                }
                                break;
                            case '240':
                                if (targetLevel > myLevel * 120 / 100) {
                                    _showTarget = true;
                                }
                                break;
                            default:
                                _showTarget = true;
                        }
                        if (_showTarget) {
                            $(_e).show();
                            _count += 1;
                        } else {
                            $(_e).hide();
                        }
                    } else {
                        console.log('Error in points filter!');
                        $(_e).show();
                        _count += 1;
                    }
                } else {
                    $(_e).show();
                    _count += 1;
                }
            } else {
                $(_e).hide();
            }

        });
        $('#enemy_guild_tab,#your_guild_tab').append('<br><br><span style="font-size:14px;font-weight:bold;">Filtered: ' + _count + '</span>');
    };

    // class filter
    var filterClass = {
        'All' : 'all',
        'Cleric' : 'cleric',
        'Mage' : 'mage',
        'Rogue' : 'rogue',
        'Warrior' : 'warrior'
    },
        filterActivity = {
            'All' : '\.',
            'Active' : 'Battle Points: [1-9]',
            'Inactive' : 'Battle Points: 0'
        },
        filterStatus = {
            'All' : '\.',
            'Full health' : 'FullHealth',
            'Got health' : 'GotHealth',
            'No health' : 'NoHealth',
            'Healthy' : 'Healthy',
            'Good' : 'Good',
            'Fair' : 'Fair',
            'Weakened' : 'Weakened',
            'Stunned' : 'Stunned'
        },
        filterPoints = {
            'All' : 'all',
            '240' : '240',
            '200' : '200',
            '160' : '160'
        };
    // Class filter
    $('body > ul.ui-selectmenu-menu').remove();
    $('#enemy_guild_battle_section_battle_list, #your_guild_battle_section_battle_list').prepend('<div id="cabf_menu" style="padding: 0 0 30px 0;" >');
    $('#cabf_menu').append($('<button>Clear filters</button>').button().css({
        'position' : 'relative !important',
        'left' : 9,
        'top' : 3,
        'float' : 'left',
        'fontSize' : 12,
        'height' : 25,
        'borderRadius' : 0
    }).click(function () {
        $('span.ui-selectmenu-status').text('All');
        $('#cabfGateClassFilter, #cabfGateActivityFilter, #cabfGateStatusFilter, #cabfGatePointsFilter').val('All');
        _storedClass = _storedActivity = _storedStatus = _storedPoints = 'All';
        item.set('cabfPageTenBattleClass', 'All');
        item.set('cabfPageTenBattleActivity', 'All');
        item.set('cabfPageTenBattleStatus', 'All');
        item.set('cabfPageTenBattlePoints', 'All');
        filterGate();
    }));
    $('#cabf_menu').append('<span class="cabfGateFilterTitle ui-state-default"> Class </span><select id="cabfGateClassFilter" class="cabfgatefiltertitle">');
    _sel = $('#cabfGateClassFilter');
    $.each(filterClass, function (_i, _e) {
        _sel.append('<option value="' + _e + '" ' + (_storedClass == _i ? 'selected = "selected"' : '') + ' >' + _i + '</option>');
    });
    _sel.change(function () {
        _storedClass = $(this).find("option:selected").text();
        item.set('cabfPageTenBattleClass', _storedClass);
        filterGate();
    });
    // Activity filter
    $('#cabf_menu').append('<span class="cabfGateFilterTitle ui-state-default"> Activity </span><select id="cabfGateActivityFilter" class="cabfgatefiltertitle">');
    _sel = $('#cabfGateActivityFilter');
    $.each(filterActivity, function (_i, _e) {
        _sel.append('<option value="' + _e + '" ' + (_storedActivity == _i ? 'selected = "selected"' : '') + ' >' + _i + '</option>');
    });
    _sel.change(function () {
        _storedActivity = $(this).find("option:selected").text();
        item.set('cabfPageTenBattleActivity', _storedActivity);
        filterGate();
    });
    // status filter
    $('#cabf_menu').append('<span class="cabfGateFilterTitle ui-state-default"> Status </span><select id="cabfGateStatusFilter" class="cabfgatefiltertitle">');
    _sel = $('#cabfGateStatusFilter');
    $.each(filterStatus, function (_i, _e) {
        _sel.append('<option value="' + _e + '" ' + (_storedStatus == _i ? 'selected = "selected"' : '') + ' >' + _i + '</option>');
    });
    _sel.change(function () {
        _storedStatus = $(this).find("option:selected").text();
        item.set('cabfPageTenBattleStatus', _storedStatus);
        filterGate();
    });
    $('#cabfGateStatusFilter, #cabfGateClassFilter, #cabfGateActivityFilter').css({
        'float' : 'left',
        'color' : '#fff',
        'height' : 25,
        'border' : '1 solid #444444',
        'backgroundColor' : '#222',
        'position' : 'relative',
        'left' : 9,
        'top' : 3
    });
    // Battle activity points filter
    $('#cabf_menu').append('<span class="cabfGateFilterTitle ui-state-default"> Points </span><select id="cabfGatePointsFilter" class="cabfgatefiltertitle">');
    _sel = $('#cabfGatePointsFilter');
    $.each(filterPoints, function (_i, _e) {
        _sel.prepend('<option value="' + _e + '" ' + (_storedPoints == _i ? 'selected = "selected"' : '') + ' >' + _i + '</option>');
    });
    _sel.change(function () {
        _storedPoints = $(this).find("option:selected").text();
        item.set('cabfPageTenBattlePoints', _storedPoints);
        filterGate();
    });

    $('#cabfGatePointsFilter, #cabfGateStatusFilter, #cabfGateClassFilter, #cabfGateActivityFilter').css({
        'float' : 'left',
        'color' : '#fff',
        'height' : 25,
        'border' : '1 solid #444444',
        'backgroundColor' : '#222',
        'position' : 'relative',
        'left' : 9,
        'top' : 3
    });
    window.setTimeout(function () {
        filterGate();
    }, 10);
}

/******************************************************************************************************************************************************************************
 *******************************************************************************************************************************************************************************
 *************    FESTIVAL BATTLE **********************************************************************************************************************************************
 *******************************************************************************************************************************************************************************
 ******************************************************************************************************************************************************************************/
function cabf_festivalbattlefilter() {
    // fix gate reseting when attacking with duel button
    var _gate = /\d/.exec($('#enemy_guild_battle_section_battle_list, #your_guild_battle_section_battle_list').attr('class'));
    $('#results_main_wrapper form, #enemy_guild_member_list form, #your_guild_member_list form').append('<input type="hidden" name="sel_pos" value="' + _gate + '">');
    $('#results_main_wrapper form, #enemy_guild_member_list form, #your_guild_member_list form').append('<input type="hidden" name="attacking_position" value="' + _gate + '">');

    // add percentage to health bars
    var _your = (1 - ($('div[style*="/guild_battle_bar_you.gif"]').width() / $('div[style*="/guild_battle_bar_you.gif"]').parent().width())) * 100;
    var _enemy = (1 - ($('div[style*="/guild_battle_bar_enemy.gif"]').width() / $('div[style*="/guild_battle_bar_enemy.gif"]').parent().width())) * 100;
    var $_your = $('#guild_battle_health span:contains("/"):first');
    var $_enemy = $('#guild_battle_health span:contains("/"):last');
    $_your.html($_your.html() + ' (' + _your.toFixed(1) + '%)');
    $_enemy.html($_enemy.html() + ' (' + _enemy.toFixed(1) + '%)');

    // enemys health added to its name in results
    $_enemy = $('span.result_body div[style*="width: 285px;"]:last');
    if ($_enemy.length > 0) {
        var _target = $('span.result_body input[name="target_id"]').attr('value');
        var _health = /Health:\s*(\d+)\/\d+/.exec($('#enemy_guild_member_list > div > div:has(a[uid="' + _target + '"]):first').text());
        if (_health !== null) {
            $_enemy.html($_enemy.html() + ' (' + _health[1] + ')');
        }
    }

    // resize top image
    $('input[value="enter_battle"]').parents('form:first').css({
        'position' : 'relative'
    });
    $('#guild_battle_banner_section').find('div:contains("VICTOR")').next().next().css('marginTop', 10).end();
    $('#guild_battle_banner_section > div:eq(2)').css('marginTop', 0);
    $('div:contains("The Battle Between"):last').parent().css('marginTop', 20);
    $('input[src*="collect_reward_button2.jpg"]').parents('div:eq(2)').css('marginTop', 0);
    normalDuelStats('#guild_battle_guild_tabs');
    addStatBoard('#guild_battle_guild_tabs');

    // add current tokens to result
    var _tokens = $('div.result div:contains("-1 Battle Tokens"):last');
    _tokens.text(_tokens.text() + ' (' + $('#guild_token_current_value').text() + ' left)');

    // reduce gate size and add number
    var _guildnum = 1,
        _count = 0,
        _totalhealth = 0,
        _totalhealthleft = 0,
        _clericcount = 0,
        _clerictotalhealth = 0,
        _clerictotalhealthleft = 0,
        _magecount = 0,
        _magetotalhealth = 0,
        _magetotalhealthleft = 0,
        _roguecount = 0,
        _roguetotalhealth = 0,
        _roguetotalhealthleft = 0,
        _warriorcount = 0,
        _warriortotalhealth = 0,
        _warriortotalhealthleft = 0,
        _activecount = 0,
        _activelivecount = 0,
        _activetotalhealth = 0,
        _activetotalhealthleft = 0;
    var _gateNum = $('#enemy_guild_battle_section_battle_list, #your_guild_battle_section_battle_list').attr('class').match(/\d/)[0];
    var _gateName = '';
    if ($('#enemy_guild_battle_section_battle_list').length > 0) {
        $('#cabfStatType').html('Enemy');
    } else {
        $('#cabfStatType').html('Ally');
    }
    switch (_gateNum) {
        case '1':
            _gateName = 'North';
            break;
        case '2':
            _gateName = 'West';
            break;
        case '3':
            _gateName = 'East';
            break;
        case '4':
            _gateName = 'South';
            break;
        default:
            _gateName = ' ';
    }
    $('#cabfStatTower span:last').html(_gateName + ' Tower Stat');
    $('#cabfStatCleric span:last').html(_gateName + ' Cleric Stat');
    $('#cabfStatMage span:last').html(_gateName + ' Mage Stat');
    $('#cabfStatRogue span:last').html(_gateName + ' Rogue Stat');
    $('#cabfStatWarrior span:last').html(_gateName + ' Warrior Stat');
    $('#cabfStatActive span:last').html(_gateName + ' Active Stat');
    $('#enemy_guild_member_list > div > div, #your_guild_member_list > div > div').each(function (_i, _e) {
        var _text = $(_e).text().trim(),
            _FullHealth = true;
        if (_text && $(_e).text().trim().length > 0) {
            var _test = /(\d+)\/(\d+)/g.exec(_text);
            var _active = /Battle\ Points:\ [1-9]/g.exec(_text);
            var winStat = '';
            if ($('input[name="target_id"]', _e).length > 0) {
                var target_id = $('input[name="target_id"]', _e).attr("value");
                winStat = getTargetStat(target_id);
                addTargetTip(_e);
            }
            if (_test) {
                _FullHealth = (_test.length === 3 && _test[1] === _test[2]) ? true : false;
                if (_FullHealth)
                    $(_e).append('<span class="GuildNumG">' + (_guildnum) + '</span>' + '<br>' + winStat);
                else
                    $(_e).append('<span class="GuildNumR">' + (_guildnum) + '</span>' + '<br>' + winStat);
            } else {
                $(_e).append('<span class="GuildNum">' + (_guildnum) + '</span>' + '<br>' + winStat);
            }
            _guildnum += 1;
            _count += 1;
            _totalhealth += parseInt(_test[2]);
            _totalhealthleft += parseInt(_test[1]);
            if ($(_e).find('img[src*="/graphics/class_cleric.gif"]').length > 0) {
                _clericcount += 1;
                _clerictotalhealth += parseInt(_test[2]);
                _clerictotalhealthleft += parseInt(_test[1]);
            }
            if ($(_e).find('img[src*="/graphics/class_mage.gif"]').length > 0) {
                _magecount += 1;
                _magetotalhealth += parseInt(_test[2]);
                _magetotalhealthleft += parseInt(_test[1]);
            }
            if ($(_e).find('img[src*="/graphics/class_rogue.gif"]').length > 0) {
                _roguecount += 1;
                _roguetotalhealth += parseInt(_test[2]);
                _roguetotalhealthleft += parseInt(_test[1]);
            }
            if ($(_e).find('img[src*="/graphics/class_warrior.gif"]').length > 0) {
                _warriorcount += 1;
                _warriortotalhealth += parseInt(_test[2]);
                _warriortotalhealthleft += parseInt(_test[1]);
            }
            if (_active) {
                _activecount += 1;
                _activetotalhealth += parseInt(_test[2]);
                if (_test[1] > 0)
                    _activelivecount += 1;
                _activetotalhealthleft += parseInt(_test[1]);
            }
        } else {
            $(_e).remove();
        }
        _text = '';
        //_test = null;
    });
    if (_count > 0) {
        $('#cabfTotalHealth').html('Total Health: ' + _totalhealth);
        $('#cabfAverageHealth').html('Average Health: ' + (_totalhealth / _count).toFixed());
        $('#cabfHealthLeft').html('Health Left: ' + _totalhealthleft);
        $('#cabfAverageHealthLeft').html('Average Health Left: ' + (_totalhealthleft / _count).toFixed());
        $('#cabfPercentageHealthLeft').html('Percentage Health Left: ' + (_totalhealthleft * 100 / _totalhealth).toFixed(1) + '%');

        if (_clericcount > 0) {
            $('#cabfClericTotalHealth').html('Total Health: ' + _clerictotalhealth);
            $('#cabfClericAverageHealth').html('Average Health: ' + (_clerictotalhealth / _clericcount).toFixed());
            $('#cabfClericHealthLeft').html('Health Left: ' + _clerictotalhealthleft);
            $('#cabfClericAverageHealthLeft').html('Average Health Left: ' + (_clerictotalhealthleft / _clericcount).toFixed());
            $('#cabfClericPercentageHealthLeft').html('Percentage Health Left: ' + (_clerictotalhealthleft * 100 / _clerictotalhealth).toFixed(1) + '%');
        }

        if (_magecount > 0) {
            $('#cabfMageTotalHealth').html('Total Health: ' + _magetotalhealth);
            $('#cabfMageAverageHealth').html('Average Health: ' + (_magetotalhealth / _magecount).toFixed());
            $('#cabfMageHealthLeft').html('Health Left: ' + _magetotalhealthleft);
            $('#cabfMageAverageHealthLeft').html('Average Health Left: ' + (_magetotalhealthleft / _magecount).toFixed());
            $('#cabfMagePercentageHealthLeft').html('Percentage Health Left: ' + (_magetotalhealthleft * 100 / _magetotalhealth).toFixed(1) + '%');
        }

        if (_roguecount > 0) {
            $('#cabfRogueTotalHealth').html('Total Health: ' + _roguetotalhealth);
            $('#cabfRogueAverageHealth').html('Average Health: ' + (_roguetotalhealth / _roguecount).toFixed());
            $('#cabfRogueHealthLeft').html('Health Left: ' + _roguetotalhealthleft);
            $('#cabfRogueAverageHealthLeft').html('Average Health Left: ' + (_roguetotalhealthleft / _roguecount).toFixed());
            $('#cabfRoguePercentageHealthLeft').html('Percentage Health Left: ' + (_roguetotalhealthleft * 100 / _roguetotalhealth).toFixed(1) + '%');
        }

        if (_warriorcount > 0) {
            $('#cabfWarriorTotalHealth').html('Total Health: ' + _warriortotalhealth);
            $('#cabfWarriorAverageHealth').html('Average Health: ' + (_warriortotalhealth / _warriorcount).toFixed());
            $('#cabfWarriorHealthLeft').html('Health Left: ' + _warriortotalhealthleft);
            $('#cabfWarriorAverageHealthLeft').html('Average Health Left: ' + (_warriortotalhealthleft / _warriorcount).toFixed());
            $('#cabfWarriorPercentageHealthLeft').html('Percentage Health Left: ' + (_warriortotalhealthleft * 100 / _warriortotalhealth).toFixed(1) + '%');
        }

        if (_activecount > 0) {
            $('#cabfActiveTotalHealth').html('Total Health: ' + _activetotalhealth);
            $('#cabfActiveAverageHealth').html('Average Health: ' + (_activetotalhealth / _activecount).toFixed());
            $('#cabfActiveHealthLeft').html('Health Left: ' + _activetotalhealthleft);
            if (_activelivecount > 0) {
                $('#cabfActiveAverageHealthLeft').html('Average Health Left: ' + (_activetotalhealthleft / _activelivecount).toFixed());
            }
            $('#cabfActivePercentageHealthLeft').html('Percentage Health Left: ' + (_activetotalhealthleft * 100 / _activetotalhealth).toFixed(1) + '%');
        }
    }

    // Saved filter settings
    var _storedClass = item.get('cabfPageFestGuildBattleClass', 'All');
    var _storedActivity = item.get('cabfPageFestGuildBattleActivity', 'All');
    var _storedStatus = item.get('cabfPageFestGuildBattleStatus', 'All');
    var _storedPoints = item.get('cabfPageFestGuildBattlePoints', 'All');

    // gate filter
    filterGate = function () {
        var _count = 0;
        var _gateNum = $('#enemy_guild_battle_section_battle_list, #your_guild_battle_section_battle_list').attr('class').match(/\d/)[0];
        var _gate = $('#enemy_arena_tab_' + _gateNum + ' > div, #your_arena_tab_' + _gateNum + ' > div');
        var _myLevel = $('a[href*="keep.php"] > div[style="color:#ffffff"]').text().match(/\d+/);
        var myLevel = Number(_myLevel[0]);
        $('#your_guild_member_list > div > div, #enemy_guild_member_list > div > div').each(function (_i, _e) {

            var _class = $('#cabfGateClassFilter').val();
            var _activ = new RegExp($('#cabfGateActivityFilter').val());
            var _state = $('#cabfGateStatusFilter').val();
            var _points = $('#cabfGatePointsFilter').val();
            var _text = $(_e).text().trim(),
                _stateTest = true;
            var _test = false;
            switch (_state) {
                case 'FullHealth':
                    _test = /(\d+)\/(\d+)/g.exec(_text);
                    _stateTest = (_test.length === 3 && _test[1] === _test[2]) ? true : false;
                    break;
                case 'GotHealth':
                    _test = /(\d+)\/(\d+)/g.exec(_text);
                    _stateTest = (_test.length === 3 && parseInt(_test[1]) !== 0) ? true : false;
                    break;
                case 'NoHealth':
                    _test = /(\d+)\/(\d+)/g.exec(_text);
                    _stateTest = (_test.length === 3 && parseInt(_test[1]) === 0) ? true : false;
                    break;
                default:
                    _test = new RegExp(_state, "g");
                    _stateTest = _test.test(_text);
            }

            var _classTest = _class === 'all' ? 1 : $(_e).find('img[src*="/graphics/class_' + _class + '.gif"]').length;
            var _pointTest = _points === 'all' ? 1 : $(_e).find('img[title="Battle Points for Victory: ' + _points + '"]').length;
            if (_classTest > 0 && _activ.test(_text) && /*_pointTest > 0 &&*/
                _stateTest === true) {
                if (_points !== 'All') {
                    if (/Level:\ \d+/.test(_text)) {
                        var targetLevel = parseInt(/(?:Level:\ )(\d+)/g.exec(_text)[1]);
                        var _showTarget = false;
                        switch (_points) {
                            case '160':
                                if (targetLevel <= myLevel * 80 / 100) {
                                    _showTarget = true;
                                }
                                break;
                            case '200':
                                if ((targetLevel > myLevel * 80 / 100) && (targetLevel <= myLevel * 120 / 100)) {
                                    _showTarget = true;
                                }
                                break;
                            case '240':
                                if (targetLevel > myLevel * 120 / 100) {
                                    _showTarget = true;
                                }
                                break;
                            default:
                                _showTarget = true;
                        }
                        if (_showTarget) {
                            $(_e).show();
                            _count += 1;
                        } else {
                            $(_e).hide();
                        }
                    } else {
                        console.log('Error in points filter!');
                        $(_e).show();
                        _count += 1;
                    }
                } else {
                    $(_e).show();
                    _count += 1;
                }
            } else {
                $(_e).hide();
            }
        });
        _gate.html(_gate.html().replace(/\).*/, ')').replace(')', ')<br/><span style="font-size:11px;font-weight:bold;">Filtered: ' + _count + '</span>'));
    };

    // class filter
    var filterClass = {
        'All' : 'all',
        'Cleric' : 'cleric',
        'Mage' : 'mage',
        'Rogue' : 'rogue',
        'Warrior' : 'warrior'
    },
        filterActivity = {
            'All' : '\.*',
            'Active' : 'Battle Points: [1-9]',
            'Inactive' : 'Battle Points: 0'
        },
        filterStatus = {
            'All' : '\.*',
            'Full health' : 'FullHealth',
            'Got health' : 'GotHealth',
            'No health' : 'NoHealth',
            'Healthy' : 'Healthy',
            'Good' : 'Good',
            'Fair' : 'Fair',
            'Weakened' : 'Weakened',
            'Stunned' : 'Stunned'
        },
        filterPoints = {
            'All' : 'all',
            '240' : '240',
            '200' : '200',
            '160' : '160'
        };
    // Add Filter Bar
    $('body > ul.ui-selectmenu-menu').remove();
    $('#enemy_guild_battle_section_battle_list, #your_guild_battle_section_battle_list').prepend('<div id="cabf_menu" style="padding: 0 0 30px 0;" >');
    // Clear Filter
    $('#cabf_menu').append($('<button>Clear filters</button>').button().css({
        'position' : 'relative !important',
        'left' : 9,
        'top' : 3,
        'float' : 'left',
        'fontSize' : 12,
        'height' : 25,
        'borderRadius' : 0
    }).click(function () {
        $('span.ui-selectmenu-status').text('All');
        $('#cabfGateClassFilter, #cabfGateActivityFilter, #cabfGateStatusFilter, #cabfGatePointsFilter').val('All');
        _storedClass = _storedActivity = _storedStatus = _storedPoints = 'All';
        item.set('cabfPageFestGuildBattleClass', 'All');
        item.set('cabfPageFestGuildBattleActivity', 'All');
        item.set('cabfPageFestGuildBattleStatus', 'All');
        item.set('cabfPageFestGuildBattlePoints', 'All');
        filterGate();
    }));
    // Class filter
    $('#cabf_menu').append('<span class="cabfGateFilterTitle ui-state-default"> Class </span><select id="cabfGateClassFilter" class="cabfgatefiltertitle">');
    _sel = $('#cabfGateClassFilter');
    $.each(filterClass, function (_i, _e) {
        _sel.append('<option value="' + _e + '" ' + (_storedClass == _i ? 'selected = "selected"' : '') + ' >' + _i + '</option>');
    });
    _sel.change(function () {
        _storedClass = $(this).find("option:selected").text();
        item.set('cabfPageFestGuildBattleClass', _storedClass);
        filterGate();
    });
    // Activity filter
    $('#cabf_menu').append('<span class="cabfGateFilterTitle ui-state-default"> Activity </span><select id="cabfGateActivityFilter" class="cabfgatefiltertitle">');
    _sel = $('#cabfGateActivityFilter');
    $.each(filterActivity, function (_i, _e) {
        _sel.append('<option value="' + _e + '" ' + (_storedActivity == _i ? 'selected = "selected"' : '') + ' >' + _i + '</option>');
    });
    _sel.change(function () {
        _storedActivity = $(this).find("option:selected").text();
        item.set('cabfPageFestGuildBattleActivity', _storedActivity);
        filterGate();
    });
    // status filter
    $('#cabf_menu').append('<span class="cabfGateFilterTitle ui-state-default"> Status </span><select id="cabfGateStatusFilter" class="cabfgatefiltertitle">');
    _sel = $('#cabfGateStatusFilter');
    $.each(filterStatus, function (_i, _e) {
        _sel.append('<option value="' + _e + '" ' + (_storedStatus == _i ? 'selected = "selected"' : '') + ' >' + _i + '</option>');
    });
    _sel.change(function () {
        _storedStatus = $(this).find("option:selected").text();
        item.set('cabfPageFestGuildBattleStatus', _storedStatus);
        filterGate();
    });
    // Battle activity points filter
    $('#cabf_menu').append('<span class="cabfGateFilterTitle ui-state-default"> Points </span><select id="cabfGatePointsFilter" class="cabfgatefiltertitle">');
    _sel = $('#cabfGatePointsFilter');
    $.each(filterPoints, function (_i, _e) {
        _sel.append('<option value="' + _e + '" ' + (_storedPoints == _i ? 'selected = "selected"' : '') + ' >' + _i + '</option>');
    });
    _sel.change(function () {
        _storedPoints = $(this).find("option:selected").text();
        item.set('cabfPageFestGuildBattlePoints', _storedPoints);
        filterGate();
    });

    $('#cabfGatePointsFilter, #cabfGateStatusFilter, #cabfGateClassFilter, #cabfGateActivityFilter').css({
        'float' : 'left',
        'color' : '#fff',
        'height' : 25,
        'border' : '1 solid #444444',
        'backgroundColor' : '#222',
        'position' : 'relative',
        'left' : 9,
        'top' : 3
    });
    window.setTimeout(function () {
        filterGate();
    }, 10);
}

/******************************************************************************************************************************************************************************
 *******************************************************************************************************************************************************************************
 *************    MONSTERS *****************************************************************************************************************************************************
 *******************************************************************************************************************************************************************************
 ******************************************************************************************************************************************************************************/
function monsterBars() {
    var _monstername = null,
        _ret = null;
    // add percentage to top bars
    if ($('#app_body div[style*="nm_bars.jpg"], #app_body div[style*="nm_bars_cross.jpg"]').length > 0) {
        $('img[src*="monster_health_background.jpg"], [src*="nm_red.jpg"], [src*="nm_orange.jpg"]').each(function (_i, _e) {
            _monstername = $(_e).parent().parent().find('div:contains("\'s Life"):last, #app_body div:contains("\'s life"):last');
            var _health = $(_e).parent()[0];
            if (_health.style && _health.style.width !== "" && _monstername && _monstername.text()) {
                var _percentage = _health.style.width.substr(0, 5);
                _monstername.text(_monstername.text().trim() + ' (' + _percentage + (_percentage.indexOf('%') > -1 ? ')' : '%)'));
                _ret.push(_monstername.text());
            }
        });
    } else {
        $('img[src*="monster_health_background.jpg"], [src*="nm_red.jpg"]').each(function (_i, _e) {
            _monstername = $(_e).parent().parent().parent().parent().find('div:contains("\'s Life"):last, div:contains("\'s life"):last');
            var _health = $(_e).parent()[0];
            if (_health.style && _health.style.width !== "" && _monstername && _monstername.text()) {
                var _percentage = _health.style.width.substr(0, 5);
                _monstername.text(_monstername.text().trim() + ' (' + _percentage + (_percentage.indexOf('%') > -1 ? ')' : '%)'));
                _ret.push(_monstername.text());
            }
        });
    }
    return _ret;
}

function defenseBar() {
    // add percentage to defense/forcefield/..
    var _defense = $('img[src*="bar_dispel.gif"],[src*="nm_green.jpg"],[src*="seamonster_ship_health.jpg"]').parent()[0],
        _defRegs = [
            '^Castle Defense$', '^Ragnarok\'s Glacial Armor$', '^Your Ship\'s Defense$', '^Illvasa, Plateau City\'s Defense$', '^Skaar\'s Mana Forcefield$', '^Party Health\\/Strength$'
        ],
        _defReg = new RegExp(_defRegs.join('|'));
    _defText = $('#app_body').find('div').filter(function () {
        return $(this).text().match(_defReg);
    });
    // _defText = $('#app_body').find('div:containsRegex(/' + _defRegs.join('|') + '/):first');
    if (_defense && _defense.style && _defense.style.width !== "" && _defText && _defText.text()) {
        var _percentage = _defense.style.width.substr(0, 5);
        var _maxHealth = false;
        if (/^Party\ Health\/Strength$/.test(_defText.text())) {
            _maxHealth = _defText.parent().prev().find('div:first')[0].style.width.substr(0, 5);
            _defText.css('left', 51).text('Party Health ' + _percentage + (_percentage.indexOf('%') > -1 ? '' : '%') + ' / Strength ' + _maxHealth + (_maxHealth.indexOf('%') > -1 ? '' : '%'));
        } else {
            _defText.css('left', 51).text(_defText.text() + '(' + _percentage + (_percentage.indexOf('%') > -1 ? ')' : '%)'));
        }
        return _defText.text();
    }
    return '';
}

function stunBar() {
    // add percentage to Cripple...
    var _stun = $('#app_body div > img[src$="nm_stun_bar.gif"]:first');
    if (_stun.length > 0) {
        var _text = _stun.parent().next().children('div:first'),
            _ret;
        _stun = _stun[0].style.width.substr(0, 5);
        _ret = _text.text() + ': ' + _stun + (_stun.indexOf('%') > -1 ? '' : '%').replace('Need ', '').replace('Fill to ', '').toLowerCase();
        _text.text(_text.text() + ' ' + _stun + (_stun.indexOf('%') > -1 ? '' : '%'));
        return _ret;
    }
    return '';
}

function linkMonsters() {
    console.log('linkMonsters');
    // link facebook to web4...
    $('div[id*="link_copy_"]').each(function (_i, _e) {
        var linkText = $('input', _e).val();
        linkText = linkText.replace('apps.facebook.com', 'web4.castleagegame.com');
        linkText = linkText.replace('castle_age', 'castle_ws');
        $('input', _e).val(linkText);
    });
}

function storeLinkMonsters() {
    var linkList = [];
    $('input[value*="battle_monster.php"]').each(function(x,y){	
        var match = y.value.match(/(casuser=\d*)/g);
        if (match.length > 0)
            linkList.push(match[0]);
    });

    item.set('cabfBossActive', linkList.join(","));
}

function addMonsterFilter() {
    var _bossActivity = item.get('cabfBossActivity', 'All'),
        _hideBoss = item.get('cabfBossHideActivity', 'Yes'),
        _bossActive = item.get('cabfBossActive', "").split(",");

 var BossTypeLow = {
        'All' : ''
    }, BossTypeMedium = {
        'All' : '',
        "Aurelius, Lion's Rebellion" : "Aurelius, Lion's Reb",
        'Ambrosia' : 'Ambrosia',
        'Bahamut, Volcanic Dragon'  : 'Bahamut',
        'Corvintheus' : 'Corvintheus',
        'Gehenna, The Fire Elemental' : 'Gehenna, The Fire El',
        'Genesis, Earth Elemental' : 'Genesis',
        'Glacius' : 'Glacius',
        'Jahanna, Priestess of Aurora' : 'Jahanna',
        'Ragnarok, The Ice Elemental' : 'Ragnarok, The Ice El',
        'Shardros' : 'Shardros',
        'Skaar Deathrune' : 'Skaar Deathrune',
        'Thanatos' : 'Thanatos',
        'War of the Red Plains' : 'War of the Red Plain'
    }, BossTypeHigh = {
        'All' : '',
        'Azriel, the Angel of Wrath' : 'Azriel, the Angel of',
        'Kessaran' : 'Kessaran',
        'Magmos' : 'Magmos',
        'Malekus' : 'Malekus',
        'Typhonus' : 'Typhonus',
        'Agamemnon the Overseer' : 'Agamemnon the Overse',
        'Thanatos Reborn' : 'Thanatos Reborn',
        'Vermilion' : 'Vermilion'
    }, HideBossOptions = {
        'Yes' : 'true',
        'No' : 'false'
    };

    $("a[href*='monster_tier=2']").parent().parent().parent().append('</br><div id="cabf_menu" style="padding: 0 0 30px 140px;margin-top: -35px;" >');

    $('#cabf_menu').append($('<button>Clear filters</button>').button().css({
        'position' : 'relative !important',
        'left' : 9,
        'top' : 3,
        'float' : 'left',
        'fontSize' : 12,
        'height' : 25,
        'borderRadius' : 0
    }).click(function () {
        $('span.ui-selectmenu-status').text('All');
        $('#cabfBossFilter').val('All');
        _bossActivity = 'All';
        item.set('cabfBossActivity', 'All');
        _hideBoss = 'No';
        item.set('cabfBossHideActivity', 'No');
        filterBoss();
    }));


    $('#cabf_menu').append('<span class="cabfGateFilterTitle ui-state-default"> Boss </span><select id="cabfBossFilter" class="cabfgatefiltertitle" style="height:100%">');
    _sel = $('#cabfBossFilter');

    if ($("img[src*='list_btn_hightier_on.gif']").length > 0) {
        $.each(BossTypeHigh, function (_i, _e) {
            _sel.append('<option value="' + _e + '" ' + (_bossActivity == _i ? 'selected = "selected"' : '') + ' >' + _i + '</option>');
        });
    } else if ($("img[src*='list_btn_medtier_on.gif']").length > 0) {
        $.each(BossTypeMedium, function (_i, _e) {
            _sel.append('<option value="' + _e + '" ' + (_bossActivity == _i ? 'selected = "selected"' : '') + ' >' + _i + '</option>');
        });
    } else {
        $.each(BossTypeLow, function (_i, _e) {
            _sel.append('<option value="' + _e + '" ' + (_bossActivity == _i ? 'selected = "selected"' : '') + ' >' + _i + '</option>');
        });
    }

    _sel.change(function () {
        _storedActivity = $(this).find("option:selected").text();
        item.set('cabfBossActivity', _storedActivity);
        filterBoss();
    });

    $('#cabf_menu').append('<span class="cabfGateFilterTitle ui-state-default"> Hide Inprogress </span><select id="cabfHideBossOption" class="cabfgatefiltertitle" style="height:100%">');
    _selFilter = $('#cabfHideBossOption');
    $.each(HideBossOptions, function (_i, _e) {
        _selFilter.append('<option value="' + _e + '" ' + (_hideBoss == _i ? 'selected = "selected"' : '') + ' >' + _i + '</option>');
    });

    _selFilter.change(function () {
        _storedActivity = $(this).find("option:selected").text();
        item.set('cabfBossHideActivity', _storedActivity);
        filterBoss();
    });

    filterBoss = function () {
        var bossActivity = $('#cabfBossFilter').val(),
            bossHideActivity = $('#cabfHideBossOption').val();

        if (bossActivity === "") {
            $("div[style*='pubmonster_middlef.gif']").parent().show();
        }
        else {
            $("div[style*='pubmonster_middlef.gif']").parent().hide();
            $("div[style*='pubmonster_middlef.gif']:contains('" + bossActivity + "')").parent().show();
        }

        if (bossHideActivity == "true") {
            $.each(_bossActive, function (_i, _e) {
                $("div[style*='pubmonster_middlef.gif']:visible").parent().each(function(x, y) {
                    if ($(y).find("input[value*='" + _e + "']").length > 0)
                        $(y).hide();
                });
            });
        }

        bossActivity = null;
        bossHideActivity = null;
    };
    
    filterBoss();

}
/******************************************************************************************************************************************************************************
 *******************************************************************************************************************************************************************************
 *************    ARENA BATTLE *************************************************************************************************************************************************
 *******************************************************************************************************************************************************************************
 ******************************************************************************************************************************************************************************/
var LostArenaIds = item.get('LostArenaIds', []);
var FarmArenaIds = eliminateDuplicates(item.get('FarmArenaIds', ['100000433761803']));
item.set('FarmArenaIds', FarmArenaIds);
var DeadArenaIds = [];
var chainArenaId = 0;
var chainArenaRankMin = item.get('chainArenaRankMin', 2);
var chainArenaPointMin = parseInt(item.get('chainArenaPointMin', 100));
var maxArenaTokens = parseInt(item.get('MaxArenaTokens', 45));
var ArenaTimer;
var arenaStarted = item.get('ArenaStarted', false);
function cabf_arenabattlefilter() {
    var _storedFarm = item.get('cabfPageArenaDuelPoints', '100000433761803');
    var _sel = $('#cabfTargetSelect');
    addArenaDuelBoard('#arena_mid');
    _sel = $('#cabfTargetSelect');
    $.each(FarmArenaIds, function (_i, _e) {
        try {
            if (item.get('cabfCleanCheck', 'false') == 'false') {
                _sel.append('<option value="' + _e + '" ' + (_storedFarm == _e ? 'selected = "selected"' : '') + ' >' + _e + '</option>');
            } else {
                if (LostArenaIds.lastIndexOf(_e) < 0 && guildIDs.lastIndexOf(_e) < 0) {
                    _sel.append('<option value="' + _e + '" ' + (_storedFarm == _e ? 'selected = "selected"' : '') + ' >' + _e + '</option>');
                } else {
                    var _list = (LostArenaIds.lastIndexOf(_e) >= 0 ? "LostArenaIds" : (guildIDs.lastIndexOf(_e) >= 0 ? "guildIDs" : "LostArenaIds or guildIDs"));
                    console.log("FarmArenaIds " + _e + " is in " + _list + "! So, don't add it to farm list.");
                }
            }
        } catch (err) {
            console.log("Error: FarmArenaIds " + _e, err);
        }
    });
    _sel.change(function () {
        _storedFarm = $(this).find("option:selected").text();
        item.set('cabfPageArenaDuelPoints', _storedFarm);
        console.log("ToDo set revenge button");
        arenaDuelFarmButton(_storedFarm);
        $('#farmKeep').attr('href', "keep.php?casuser=" + _storedFarm);
    });
    $('#farmKeep').attr('href', "keep.php?casuser=" + _storedFarm);
    arenaDuelFarmButton(_storedFarm);
    $('#autocompleteRemove').autocomplete({
        source : FarmArenaIds
    });
    $('#RemoveButton').button();
    $('#RemoveButton').click(function () {
        var valId = $("#autocompleteRemove").val();
        if (confirm('Are you sure to retreive ' + valId + ' from farm targets?')) {
            var index = FarmArenaIds.indexOf(valId);
            FarmArenaIds.splice(index, 1);
            $("#cabfTargetSelect option[value='" + valId + "']").remove();
        }
    });
    try {
        if (item.get('cabfRefillTokens', 'false') == 'true') {
            $('#refillTokens')[0].checked = true;
        } else {
            $('#refillTokens')[0].checked = false;
        }
        $('#refillTokens').change(function () {
            if (this.checked) {
                item.set('cabfRefillTokens', 'true');
            } else {
                item.set('cabfRefillTokens', 'false');
            }
            console.log("cabfRefillTokens", item.get('cabfRefillTokens', 'false'));
        });
    } catch (e) {
        item.set('cabfRefillTokens', 'false');
        console.error(e);
    }
    $('#cleanCheck').attr('title', 'Always don\'t list all lost, dead, and my guild.');
    $('#CleanButton').button();
    $('#CleanButton').attr('title', 'Don\'t list all lost, dead, and my guild.');
    $('#CleanButton').click(function () {
        console.log("Clean");
        var _select = $('#cabfTargetSelect'),
            _selectedFarm = item.get('cabfPageArenaDuelPoints', '100000433761803');

        _select.html(' ');
        $.each(FarmArenaIds, function (_i, _e) {
            try {
                if (LostArenaIds.lastIndexOf(_e) < 0 && guildIDs.lastIndexOf(_e) < 0 && DeadArenaIds.lastIndexOf(_e) < 0) {
                    _select.append('<option value="' + _e + '" ' + (_selectedFarm == _e ? 'selected = "selected"' : '') + ' >' + _e + '</option>');
                } else {
                    var _list = (LostArenaIds.lastIndexOf(_e) >= 0 ? "LostArenaIds" : (guildIDs.lastIndexOf(_e) >= 0 ? "guildIDs" : "LostArenaIds or guildIDs"));
                    console.log("FarmArenaIds " + _e + " is in " + _list + "! So, don't add it to farm list!");
                }
            } catch (err) {
                console.log("Error: FarmArenaIds " + _e, err);
            }
        });
        item.set('cabfCleanCheck', 'true');
        $('#cleanCheck')[0].checked = true;
    });
    $('#ClearButton').button();
    $('#ClearButton').click(function () {
        console.log("Clear");
        if (confirm('Are you sure to clear target from looses definitively?')) {
            var _select = $('#cabfTargetSelect'),
                _selectedFarm = item.get('cabfPageArenaDuelPoints', '100000433761803'),
                _delArray = [];

            _select.html(' ');
            $.each(FarmArenaIds, function (_i, _e) {
                try {
                    if (LostArenaIds.lastIndexOf(_e) < 0 && guildIDs.lastIndexOf(_e) < 0) {
                        _select.append('<option value="' + _e + '" ' + (_selectedFarm == _e ? 'selected = "selected"' : '') + ' >' + _e + '</option>');
                    } else {
                        var _list = (LostArenaIds.lastIndexOf(_e) >= 0 ? "LostArenaIds" : (guildIDs.lastIndexOf(_e) >= 0 ? "guildIDs" : "LostArenaIds or guildIDs"));
                        _delArray.push(FarmArenaIds.indexOf(_e));
                        console.log("FarmArenaIds " + _e + " is in " + _list + "! So, cleared it.");
                    }
                } catch (err) {
                    console.log("Error: FarmArenaIds " + _e, err);
                }
            });
            console.log("Before clear FarmArenaIds: length=" + FarmArenaIds.length);
            for (var i = 0; i < _delArray.length; i++) {
                FarmArenaIds.splice(_delArray[i], 1);
            }
            console.log("After clear FarmArenaIds: length=" + FarmArenaIds.length);
            item.set('FarmArenaIds', FarmArenaIds);
        }
    });
    $('#BlackList').resizable({
        handles : "se, e, s",
        maxWidth : "260px",
        minWidth : "75px"
    });
    $('#BlackList')[0].value = JSON.stringify(guildIDs);
    $('#BlackList').change(function () {
        item.set('guildIDs', JSON.parse(this.value));
        guildIDs = JSON.parse(this.value);
    });
    $('#UpdateMyGuild').button();
    $('#UpdateMyGuild').click(function () {
        checkMyGuildIds(reloadArena);
    });
    try {
        if (item.get('cabfRefillTokens', 'false') == 'true') {
            $('#cleanCheck')[0].checked = true;
        } else {
            $('#cleanCheck')[0].checked = false;
        }
        $('#cleanCheck').change(function () {
            if (this.checked) {
                item.set('cabfCleanCheck', 'true');
            } else {
                item.set('cabfCleanCheck', 'false');
            }
            console.log("cabfCleanCheck", item.get('cabfCleanCheck', 'false'));
        });
    } catch (e) {
        item.set('cabfCleanCheck', 'false');
        console.error(e);
    }
    $('#targetMinRank')[0].value = chainArenaRankMin;
    $('#targetMinRank').change(function () {
        item.set('chainArenaRankMin', this.value);
        chainArenaRankMin = this.value;
    });
    $('#targetMinPoint')[0].value = chainArenaPointMin;
    $('#targetMinPoint').change(function () {
        item.set('chainArenaPointMin', this.value);
        chainArenaPointMin = parseInt(this.value);
    });
    $('#MaxArenaTokens')[0].value = maxArenaTokens;
    $('#MaxArenaTokens').change(function () {
        item.set('MaxArenaTokens', this.value);
        maxArenaTokens = parseInt(this.value);
    });
    $('#StopButton').button();
    $('#StopButton').click(function () {
        console.log("Stop");
        arenaStarted = false;
        item.set('ArenaStarted', arenaStarted);
        window.clearTimeout(ArenaTimer);
        item.set('ArenaTimer', false);
    });
    $('#StartButton').button();
    $('#StartButton').click(function () {
        console.log("Start");
        arenaStarted = true;
        item.set('ArenaStarted', arenaStarted);
        item.set('ArenaTimer', true);
        window.clearTimeout(ArenaTimer);
        ArenaTimer = window.setTimeout(chainArena, 5000);
    });
}

function arenaRefill() {
    try {
        if (item.get('cabfRefillTokens', 'false') == 'true') {
            var button = $("input[src*='arena_10_token_refill_btn.jpg']");
            console.log (1, "Refill to burn Arena Health");
            button.click();
        }
        window.clearTimeout(ArenaTimer);
        ArenaTimer = window.setTimeout(chainArena, 1000);
    } catch (err) {
        console.error("ERROR in Refill to burn Arena Health: " + err);
        window.clearTimeout(ArenaTimer);
        ArenaTimer = window.setTimeout(chainArena, 1000);
    }
}

function arenaControlHealthAndTokens() {
    var arenaHealth = $("div img[src*='graphics/orange_healthbar.jpg']"),
        arenaHealthWidth = "",
        currentTokens = parseInt($('#guild_token_current_value').text());
    if (arenaHealth.length===0) {
        return true;
    }
    arenaHealthWidth=/width:\d+/i.exec(arenaHealth[0].outerHTML)[0];
    if (!arenaHealthWidth.match("width:0")) {
        if (currentTokens>0) {
            return true;
        } else {
            arenaRefill();
            return false;
        }
    }
    return currentTokens>=maxArenaTokens;
}

function chainArena() {
    console.log("chainArena");
    if (arenaControlHealthAndTokens()) {
        try {
            var _button = $("input[src*='war_duelagainbtn2.gif']");
            if (_button.length > 0) {
                var target = $('#arena_duel input[name="target_id"]');
                chainArenaId = target.attr("value");
                if (LostArenaIds.lastIndexOf(chainArenaId) < 0 && guildIDs.lastIndexOf(chainArenaId) < 0 && DeadArenaIds.lastIndexOf(chainArenaId) < 0) {
                    _button.click();
                } else {
                    var _list = (LostArenaIds.lastIndexOf(chainArenaId) >= 0 ? "LostArenaIds" : (guildIDs.lastIndexOf(chainArenaId) >= 0 ? "guildIDs" : "LostArenaIds or guildIDs"));
                    console.log("FarmArenaIds " + chainArenaId + " is in " + _list + "! So, don't chain it.");
                    window.clearTimeout(ArenaTimer);
                    ArenaTimer = window.setTimeout(chainArenaNext, 1000, chainArenaId);
                }
            } else {
                window.clearTimeout(ArenaTimer);
                ArenaTimer = window.setTimeout(chainArenaById, 1000, chainArenaId);
            }
        } catch (e) {
            console.log("chainArena", e);
            window.clearTimeout(ArenaTimer);
            ArenaTimer = window.setTimeout(chainArenaById, 1000, chainArenaId);
        }
    } else {
        reloadArena();
    }
}

function sortArenaTarget(a, b) {
    var rankA = /Rank\ (\d+)/.exec($('div>div:contains("Rank")', a).text().trim())[1],
        rankB = /Rank\ (\d+)/.exec($('div>div:contains("Rank")', b).text().trim())[1];
    if (rankB===rankA) {
        var levelA = /level\: (\d+)/.exec($('div>div:contains("level\:")', a).text().trim())[1],
            levelB = /level\: (\d+)/.exec($('div>div:contains("level\:")', b).text().trim())[1];
        return levelA-levelB;
    }
    return rankB-rankA;
}

function chainArenaById(id) {
    console.log("chainArenaId", id);
    if (arenaControlHealthAndTokens()) {
        try {
            var _button,
                ready = false;
            if (id>0) {
                if (LostArenaIds.lastIndexOf(id) < 0 && guildIDs.lastIndexOf(id) < 0 && DeadArenaIds.lastIndexOf(id) < 0) {
                    $('#arena_mid #battle_person').sort(sortArenaTarget).each(function (_i, _e) {
                        if (!ready) {
                            var temp_id = $("input[name='target_id']", _e).attr("value");
                            if (id == temp_id) {
                                var _text = $('div>div:contains("Rank")', _e).text().trim();
                                var _rank = /Rank\ (\d+)/.exec(_text)[1];
                                if (parseInt(_rank) >= chainArenaRankMin) {
                                    _button = $("input[src*='arena_btn_duel.gif']", _e);
                                    if (_button.length > 0) {
                                        chainArenaId = temp_id;
                                        ready = true;
                                    }
                                }
                            }
                        }
                    });
                } else {
                    var _list = (LostArenaIds.lastIndexOf(id) >= 0 ? "LostArenaIds" : (guildIDs.lastIndexOf(id) >= 0 ? "guildIDs" : "LostArenaIds or guildIDs"));
                    console.log("FarmArenaIds " + id + " is in " + _list + "! So, don't chain it.");
                }
            }
            if (ready) {
                _button.click();
            } else {
                window.clearTimeout(ArenaTimer);
                ArenaTimer = window.setTimeout(chainArenaNext, 1000, id);
            }
        } catch (e) {
            console.log("Error: chainArenaId", e);
            reloadArena();
        }
    } else {
        reloadArena();
    }
}

function chainArenaNext(id) {
    console.log("chainArenaNext", id);
    if (arenaControlHealthAndTokens()) {
        try {
            var _button,
                ready = false;
            $('#arena_mid #battle_person').sort(sortArenaTarget).each(function (_i, _e) {
                if (!ready) {
                    var temp_id = $("input[name='target_id']", _e).attr("value");
                    if (id != temp_id && LostArenaIds.lastIndexOf(temp_id) < 0 && guildIDs.lastIndexOf(temp_id) < 0 && DeadArenaIds.lastIndexOf(temp_id) < 0) {
                        var _text = $('div>div:contains("Rank")', _e).text().trim();
                        var _rank = /Rank\ (\d+)/.exec(_text)[1];
                        if (parseInt(_rank) >= chainArenaRankMin) {
                            _button = $("input[src*='arena_btn_duel.gif']", _e);
                            chainArenaId = temp_id;
                            ready = true;
                        }
                    } else {
                        var _list = (LostArenaIds.lastIndexOf(temp_id) >= 0 ? "LostArenaIds" : (guildIDs.lastIndexOf(temp_id) >= 0 ? "guildIDs" : "LostArenaIds or guildIDs"));
                        console.log("FarmArenaIds " + temp_id + " is in " + _list + "! So, don't chain it.");
                    }
                }
            });
            if (ready) {
                _button.click();
            } else {
                reloadArena();
            }
        } catch (e) {
            console.log("Error: chainArenaNext", e);
            reloadArena();
        }
    } else {
        reloadArena();
    }
}

function arenaDuelFarmButton(id) {
    var _buttonDIV = $('#cabfFarmTargetButton');
    if (_buttonDIV.length > 0) {
        var _button = $("input[src*='arena_btn_duel.gif']:first");
        if (_button.length > 0) {
            _buttonDIV.html(_button.parent().parent().parent().html());
            $("input[name='target_id']", _buttonDIV).attr("value", id);
        } else {
            console.log("_button not found");
        }
    } else {
        console.log("_buttonDIV not found");
    }
}

function reloadArena() {
    // var _button;
    // var myHealth = parseInt($('#health_current_value').text().trim()),
    // xDelayHealth = 1;
    var xDelayHealth = 1;
    // console.log('at reloadArena, Health:', myHealth);
    // if (myHealth < 10) {
    // xDelayHealth = 6;
    // }
    chainArenaId = 0;
    window.clearTimeout(ArenaTimer);
    ArenaTimer = window.setTimeout(clickReloadArena, xDelayHealth * 5000);
}
function clickReloadArena() {
    var _button;
    window.clearTimeout(ArenaTimer);
    _button = $("a[href='arena.php']");
    _button.click();
    ArenaTimer = window.setTimeout(chainArena, 5000);
}

/******************************************************************************************************************************************************************************
 *******************************************************************************************************************************************************************************
 *************    STATS BATTLE *************************************************************************************************************************************************
 *******************************************************************************************************************************************************************************
 ******************************************************************************************************************************************************************************/
function addTargetTip(_e) {
    $(_e).mouseover(function (e) {
        var stats = item.get('stats', defaultStats),
            target_id = $('input[name="target_id"]', this).attr("value"),
            indexTarget = 0,
            victory = 0,
            defeat = 0;
        indexTarget = getTargetIndex(stats.targets, target_id);
        if (indexTarget >= 0) {
            victory = stats.targets[indexTarget].victory;
            defeat = stats.targets[indexTarget].defeat;
        }
        var tip = $(this).attr('title');
        $(this).attr('title', '');
        $(this).append('<div id="tooltip"><div class="tipHeader"></div><div class="tipBody">' + 'Hits Numbers : ' + parseInt(victory + defeat) + '<br>' + 'Victories : ' + victory + '<br>' + 'Defeats : ' + defeat + '<br>' + '</div><div class="tipFooter"></div></div>');
        $('#tooltip').css('top', e.pageY + 10);
        $('#tooltip').css('left', e.pageX + 20);
        $('#tooltip').fadeIn('500');
        $('#tooltip').fadeTo('10', 0.8);
        stats = null;
    }).mousemove(function (e) {
        $('#tooltip').css('top', e.pageY + 10);
        $('#tooltip').css('left', e.pageX + 20);
    }).mouseout(function () {
        $(this).attr('title', $('.tipBody').html());
        $(this).children('div#tooltip').remove();
    });
}
function getTargetIndex(array, target_id) {
    for (var i = 0; i < array.length; i++) {
        if (array[i].target_id === target_id) {
            return i;
        }
    }
    return -1;
}
function getTargetStat(target_id) {
    var stats = item.get('stats', defaultStats);
    var indexTarget = getTargetIndex(stats.targets, target_id);
    if (indexTarget >= 0) {
        var victory = parseInt(stats.targets[indexTarget].victory),
            defeat = parseInt(stats.targets[indexTarget].defeat);
        if ((victory + defeat) > 0) {
            if ((victory - defeat) > 0) {
                stats = null;
                indexTarget = null;
                return '<span class="GuildNumG">' + Math.round(((victory - defeat) * 100 / (victory + defeat))) + '%</span><br><span class="KeepLink"><a href="keep.php?casuser=' + target_id + '" target="_blank">Keep</a></span>';
            } else {
                stats = null;
                indexTarget = null;
                return '<span class="GuildNumR">' + Math.round(((victory - defeat) * 100 / (victory + defeat))) + '%</span><br><span class="KeepLink"><a href="keep.php?casuser=' + target_id + '" target="_blank">Keep</a></span>';
            }
        }
    }
    stats = null;
    indexTarget = null;
    return '<span class="GuildNum">0%</span><br><span class="KeepLink"><a href="keep.php?casuser=' + target_id + '" target="_blank">Keep</a></span>';
}
function battleStats() {
    var stats = item.get('stats', defaultStats),
        new_data = false;
    if (($('#results_main_wrapper>div').length > 0) || ($('div[class="result_body"]>div').length > 0)) {
        console.log("Battle Stats");
        var target = $('#results_main_wrapper input[name="target_id"]'),
            target_id = 0;
        if (target.length <= 0) {
            target = $('div[class="result_body"] input[name="target_id"]');
            target_id = 0;
        }
        /*console.log("target=",target);
        console.log("target.length=",target.length);
        console.log('target.attr("value")=',target.attr("value"));*/
        if (target.length > 0) {
            target_id = target.attr("value");
            indexTarget = getTargetIndex(stats.targets, target_id);
            if (indexTarget < 0) {
                var newTarget = {
                    "target_id" : target_id,
                    "victory" : 0,
                    "defeat" : 0
                };
                stats.targets.push(newTarget);
                indexTarget = getTargetIndex(stats.targets, target_id);
                new_data = true;
                newTarget = null;
            }
            if ($('#results_main_wrapper>div:contains("VICTORY")').length > 0 || $('#results_main_wrapper>div[style*="conqduel_victory2.jpg"]').length > 0) {
                console.log("VICTORY");
                stats.targets[indexTarget].victory++;
                new_data = true;
                window.clearTimeout(NormalTimer);
                NormalTimer = window.setTimeout(farmNormalBattle, 1000, target_id);
            } else if ($('#results_main_wrapper>div:contains("DEFEAT")').length > 0 || $('#results_main_wrapper>div[style*="conqduel_defeat2.jpg"]').length > 0) {
                console.log("DEFEAT");
                stats.targets[indexTarget].defeat++;
                new_data = true;
            } else if ($('#arena_duel').length > 0) {
                console.log("ARENA RESULT");
                if ($('div[style*="guild_battle_result_top"]>div>div:contains("VICTORY")').length > 0) {
                    console.log("ARENA VICTORY");
                    stats.targets[indexTarget].victory++;
                    new_data = true;
                    try {
                        var _text = $('div[style*="war_fort_battlemidrepeat.jpg"]').text().trim();
                        var _points = /(\d+)\ Arena\ Points\ and/.exec(_text)[1];
                        console.log("_points=", _points);
                        if (_points === 0) {
                            chainArenaId = 0;
                            if (DeadArenaIds.lastIndexOf(target_id) < 0) {
                                DeadArenaIds.push(target_id);
                                console.log("DeadArenaIds", DeadArenaIds);
                            }
                            window.clearTimeout(ArenaTimer);
                            ArenaTimer = window.setTimeout(chainArenaNext, 1000, target_id);
                        } else if (target_id == 100000433761803) {
                            console.log("100000433761803");
                            chainArenaId = target_id;
                            window.clearTimeout(ArenaTimer);
                            ArenaTimer = window.setTimeout(chainArena, 1000);
                        } else if (_points > chainArenaPointMin) {
                            console.log("_points>" + chainArenaPointMin);
                            if (_points > 130) {
                                console.log("_points>130");
                                try {
                                    if (FarmArenaIds.lastIndexOf(target_id) < 0) {
                                        FarmArenaIds.push(target_id);
                                        item.set('FarmArenaIds', FarmArenaIds);
                                        console.log("FarmArenaIds = ", FarmArenaIds);
                                        $('#cabfTargetSelect').append('<option value="' + target_id + '" >' + target_id + '</option>');
                                    }
                                } catch (err) {
                                    console.log("FarmArenaIds ERROR", err);
                                }
                            }
                            chainArenaId = target_id;
                            window.clearTimeout(ArenaTimer);
                            ArenaTimer = window.setTimeout(chainArena, 1000);
                        } else {
                            console.log("else chainArenaNext");
                            chainArenaId = 0;
                            window.clearTimeout(ArenaTimer);
                            ArenaTimer = window.setTimeout(chainArenaNext, 2000, target_id);
                        }
                    } catch (e) {
                        console.log("UNKNOWN ERROR", e);
                    }
                }
                if ($('div[style*="guild_battle_result_top"]>div>div:contains("DEFEAT")').length > 0) {
                    console.log("ARENA DEFEAT");
                    stats.targets[indexTarget].defeat++;
                    new_data = true;
                    chainArenaId = 0;
                    if (LostArenaIds.lastIndexOf(target_id) < 0) {
                        LostArenaIds.push(target_id);
                        item.set('LostArenaIds', LostArenaIds);
                    }
                    window.clearTimeout(ArenaTimer);
                    ArenaTimer = window.setTimeout(chainArenaNext, 1000, target_id);
                }
            } else if ($('#results_main_wrapper>div:contains("HEAL")').length > 0) {
                console.log("HEAL");
                var _e = $('#results_main_wrapper');
                if (_e.length > 0) {
                    var _credits = /GUARDIAN\ PATH\ CREDIT:\ YES/.exec(_e.text());
                    if (_credits !== null) {
                        window.clearTimeout(NormalTimer);
                        NormalTimer = window.setTimeout(farmNormalBattle, 1000, target_id);
                    }
                }
            } else if ($('#results_main_wrapper>div:contains("DISPEL")').length > 0) {
                console.log("DISPEL");
            } else if ($('#results_main_wrapper>div:contains("ILLUSION")').length > 0) {
                console.log("ILLUSION");
            } else if ($('#results_main_wrapper>div>div>span>div>img[src*="battle_defeat.gif"]').length > 0) {
                console.log("DEFEAT (battle_defeat.gif)");
                stats.targets[indexTarget].defeat++;
                new_data = true;
            } else if ($('#results_main_wrapper>div>div>span>div>img[src*="battle_victory.gif"]').length > 0) {
                console.log("VICTORY (battle_victory.gif)");
                stats.targets[indexTarget].victory++;
                new_data = true;
            } else if ($('#results_main_wrapper>div[style*="festival_duelchamp_defeat.jpg"]').length > 0) {
                console.log("DEFEAT (festival_duelchamp_defeat.jpg)");
                stats.targets[indexTarget].defeat++;
                new_data = false;
                chainId = 0;
                if (LostIds.lastIndexOf(target_id) < 0) {
                    LostIds.push(target_id);
                    item.set('lostids', LostIds);
                }
                window.clearTimeout(FestTimer);
                FestTimer = window.setTimeout(chainFestNext, 1000, target_id);
            } else if ($('#results_main_wrapper>div[style*="festival_duelchamp_victory.jpg"]').length > 0) {
                console.log("VICTORY (festival_duelchamp_victory.jpg)");
                stats.targets[indexTarget].victory++;
                new_data = false;
                try {
                    var _textVictory = $('#results_main_wrapper>div[style*="festival_duelchamp_victory.jpg"]').text().trim();
                    var _pointsVictory = /(\d+)\ Champion\ Points!/.exec(_textVictory)[1];
                    console.log("_points=", _pointsVictory);
                    if (_pointsVictory === 0) {
                        chainId = 0;
                        if (DeadIds.lastIndexOf(target_id) < 0) {
                            DeadIds.push(target_id);
                            console.log("DeadIds", DeadIds);
                        }
                        window.clearTimeout(FestTimer);
                        FestTimer = window.setTimeout(chainFestNext, 1000, target_id);
                    } else if (target_id == 100000433761803) {
                        console.log("100000433761803");
                        chainId = target_id;
                        window.clearTimeout(FestTimer);
                        FestTimer = window.setTimeout(chainFest, 1000);
                    } else if (_pointsVictory > chainPointMin) {
                        console.log("_points>" + chainPointMin);
                        if (_pointsVictory > 11) {
                            console.log("_points>11");
                            try {
                                if (FarmIds.lastIndexOf(target_id) < 0) {
                                    FarmIds.push(target_id);
                                    item.set('farmids', FarmIds);
                                    console.log("FarmIds = ", FarmIds);
                                    $('#cabfTargetSelect').append('<option value="' + target_id + '" >' + target_id + '</option>');
                                }
                            } catch (err) {
                                console.log("farmids ERROR", err);
                            }
                        }
                        chainId = target_id;
                        window.clearTimeout(FestTimer);
                        FestTimer = window.setTimeout(chainFest, 1000);
                    } else {
                        console.log("else chainFestNext");
                        chainId = 0;
                        window.clearTimeout(FestTimer);
                        FestTimer = window.setTimeout(chainFestNext, (10 - _pointsVictory) * 1000, target_id);
                    }
                } catch (e) {
                    console.log("UNKNOWN ERROR", e);
                }
            } else {
                console.log("UNKNOWN RESULT");
                new_data = false;
            }
            target_id = null;
        } else {
            var myHealth = parseInt($('#health_current_value').text().trim()),
                xDelayHealth = 1,
                xDelayArenaHealth = 10,
                _textRes ;
            console.log('at battleStats, Health:', myHealth);
            if (myHealth < 10) {
                xDelayHealth = 30;
            }
            if ($('#arena_mid').length > 0) {
                if (chainArenaId > 0) {
                    _textRes = $('#results_main_wrapper>div[class="results"]>div[class="result"]>span[class="result_body"]').text().trim();
                    console.log(_textRes);
                    /*var _coins= /You need more Stamina to undertake this action/.exec($('#results_main_wrapper>div>div>div>div').text().trim());*/
                    if (_textRes.match('Your opponent is dead or too weak to battle.')) {
                        if (DeadIds.lastIndexOf(chainArenaId) < 0) {
                            DeadIds.push(chainArenaId);
                        }
                        console.log("DeadIds", DeadIds);
                        window.clearTimeout(ArenaTimer);
                        ArenaTimer = window.setTimeout(chainArenaNext, xDelayArenaHealth * 1000, chainArenaId);
                    }
                    if (_textRes.match('Patience Warrior. You cannot initiate battle again so soon.')) {
                        window.clearTimeout(ArenaTimer);
                        ArenaTimer = window.setTimeout(chainArenaById, xDelayArenaHealth * 1000, chainArenaId);
                    }
                    if (_textRes.match('You are too weak to battle. You need at least 10 health.')) {
                        window.clearTimeout(ArenaTimer);
                        ArenaTimer = window.setTimeout(chainArena, xDelayArenaHealth * 1000);
                    }
                    if (_textRes.match('Out Of Tokens: You do not have enough arena tokens to engage in more battles, wait for a recharge or purchase a refill!')) {
                        var arenaHealth = $("div img[src*='graphics/orange_healthbar.jpg']"), arenaHealthWidth = "";
                        arenaHealthWidth=/width:\d+/i.exec(arenaHealth[0].outerHTML)[0];
                        if (!arenaHealthWidth.match("width:0")) {
                            arenaRefill();
                        } else {
                            window.clearTimeout(ArenaTimer);
                            ArenaTimer = window.setTimeout(chainArena, xDelayArenaHealth * 1000);
                        }
                    }
                    /*console.log('#############################################',_coins); */
                    chainArenaId = 0;
                    window.clearTimeout(ArenaTimer);
                    ArenaTimer = window.setTimeout(chainArena, xDelayArenaHealth * 1000);
                } else {
                    window.clearTimeout(ArenaTimer);
                    ArenaTimer = window.setTimeout(chainArena, xDelayArenaHealth * 1000);
                }
            } else {
                if (chainId > 0) {
                    _textRes = $('#results_main_wrapper>div[class="results"]>div[class="result"]>span[class="result_body"]').text().trim();
                    console.log(_textRes);
                    /*var _coins= /You need more Stamina to undertake this action/.exec($('#results_main_wrapper>div>div>div>div').text().trim());*/
                    if (_textRes.match('Your opponent is dead or too weak to battle.')) {
                        if (DeadIds.lastIndexOf(chainId) < 0) {
                            DeadIds.push(chainId);
                        }
                        console.log("DeadIds", DeadIds);
                        window.clearTimeout(ArenaTimer);
                        ArenaTimer = window.setTimeout(chainFestNext, xDelayHealth * 1000, chainId);
                    }
                    if (_textRes.match('Patience Warrior. You cannot initiate battle again so soon.')) {
                        window.clearTimeout(ArenaTimer);
                        ArenaTimer = window.setTimeout(chainFestId, xDelayHealth * 1000, chainId);
                    }
                    if (_textRes.match('You are too weak to battle. You need at least 10 health.')) {
                        window.clearTimeout(ArenaTimer);
                        ArenaTimer = window.setTimeout(chainFest, xDelayHealth * 1000);
                    }
                    /*console.log('#############################################',_coins); */
                    chainId = 0;
                    window.clearTimeout(ArenaTimer);
                    ArenaTimer = window.setTimeout(chainFest, xDelayHealth * 1000);
                } else {
                    window.clearTimeout(ArenaTimer);
                    ArenaTimer = window.setTimeout(chainFest, xDelayHealth * 1000);
                }
            }
        }
        target = null;
    }
    if (new_data)
        item.set('stats', stats);
    stats = null;
}
var LostIds = item.get('lostids', []);
var FarmIds = eliminateDuplicates(item.get('farmids', ['100000433761803']));
item.set('farmids', FarmIds);
var DeadIds = [];
var defaultGuildIDs = [];
var guildIDs = item.get('guildIDs', defaultGuildIDs);
var chainId = 0;
var chainRankMin = item.get('chainRankMin', 12);
var chainPointMin = parseInt(item.get('chainPointMin', 10));
var FestTimer;
function chainFest() {
    console.log("chainFest");
    try {
        var _button = $("input[src*='festival_duelchamp_duelagain_btn.gif']");
        if (_button.length > 0) {
            var target = $('#results_main_wrapper input[name="target_id"]');
            chainId = target.attr("value");
            if (LostIds.lastIndexOf(chainId) < 0 && guildIDs.lastIndexOf(chainId) < 0 && DeadIds.lastIndexOf(chainId) < 0) {
                _button.click();
            } else {
                var _list = (LostIds.lastIndexOf(chainId) >= 0 ? "LostIds" : (guildIDs.lastIndexOf(chainId) >= 0 ? "guildIDs" : "LostIds or guildIDs"));
                console.log("FarmIds " + chainId + " is in " + _list + "! So, don't chain it.");
                window.clearTimeout(FestTimer);
                FestTimer = window.setTimeout(chainFestNext, 1000, chainId);
            }
        } else {
            window.clearTimeout(FestTimer);
            FestTimer = window.setTimeout(chainFestId, 1000, chainId);
        }
    } catch (e) {
        console.log("chainFest", e);
        window.clearTimeout(FestTimer);
        FestTimer = window.setTimeout(chainFestId, 1000, chainId);
    }
}

function chainFestId(id) {
    try {
        console.log("chainFestId", id);
        var _button,
            ready = false;
        if (id) {
            if (LostIds.lastIndexOf(id) < 0 && guildIDs.lastIndexOf(id) < 0 && DeadIds.lastIndexOf(id) < 0) {
                $('#battleList>div').each(function (_i, _e) {
                    if (!ready) {
                        var temp_id = $("input[name='target_id']", _e).attr("value");
                        if (id == temp_id) {
                            var _text = $('div>div[style*="padding: 33px 0 0 0px;"]', _e).text().trim();
                            var _rank = /Rank\ (\d+)/.exec(_text)[1];
                            if (parseInt(_rank) >= chainRankMin) {
                                _button = $("input[src*='festival_duelchamp_challenge_btn.gif']", _e);
                                if (_button.length > 0) {
                                    chainId = temp_id;
                                    ready = true;
                                }
                            }
                        }
                    }
                });
            } else {
                var _list = (LostIds.lastIndexOf(id) >= 0 ? "LostIds" : (guildIDs.lastIndexOf(id) >= 0 ? "guildIDs" : "LostIds or guildIDs"));
                console.log("FarmIds " + id + " is in " + _list + "! So, don't chain it.");
            }
        }
        if (ready) {
            _button.click();
        } else {
            window.clearTimeout(FestTimer);
            FestTimer = window.setTimeout(chainFestNext, 1000, id);
        }
    } catch (e) {
        console.log("Error: chainFestId", e);
        reloadFest();
    }
}

function chainFestNext(id) {
    try {
        console.log("chainFestNext", id);
        var _button,
            ready = false;
        if (id) {
            $('#battleList>div').each(function (_i, _e) {
                if (!ready) {
                    var temp_id = $("input[name='target_id']", _e).attr("value");
                    if (id != temp_id && LostIds.lastIndexOf(temp_id) < 0 && guildIDs.lastIndexOf(temp_id) < 0 && DeadIds.lastIndexOf(temp_id) < 0) {
                        var _text = $('div>div[style*="padding: 33px 0 0 0px;"]', _e).text().trim();
                        var _rank = /Rank\ (\d+)/.exec(_text)[1];
                        if (parseInt(_rank) >= chainRankMin) {
                            _button = $("input[src*='festival_duelchamp_challenge_btn.gif']", _e);
                            chainId = temp_id;
                            ready = true;
                        }
                    } else {
                        var _list = (LostIds.lastIndexOf(temp_id) >= 0 ? "LostIds" : (guildIDs.lastIndexOf(temp_id) >= 0 ? "guildIDs" : "LostIds or guildIDs"));
                        console.log("FarmIds " + temp_id + " is in " + _list + "! So, don't chain it.");
                    }
                }
            });
        }
        if (ready) {
            _button.click();
        } else {
            reloadFest();
        }
    } catch (e) {
        console.log("Error: chainFestNext", e);
        reloadFest();
    }
}
function reloadFest() {
    var _button;
    var myHealth = parseInt($('#health_current_value').text().trim()),
        xDelayHealth = 1;
    console.log('at reloadFest, Health:', myHealth);
    if (myHealth < 10) {
        xDelayHealth = 6;
    }
    chainId = 0;
    window.clearTimeout(FestTimer);
    if (item.get('FestTimer', false)) {
        _button = $("img[src*='festival_duelchamp_question.gif']");
        _button.parent().attr("href", "festival_duel_battle.php");
        _button.parent().attr("onclick", "ajaxLinkSend('globalContainer', 'festival_duel_battle.php'); return false;");
        _button.parent().html('<img height="41" width="157" src="https://castleagegame1-a.akamaihd.net/graphics/festival_duelchampion/festival_duelchamp_enter.gif" class="imgButton">');
        FestTimer = window.setTimeout(clickReloadFest, xDelayHealth * 5000);
    }
}
function clickReloadFest() {
    var _button;
    window.clearTimeout(FestTimer);
    _button = $("img[src*='festival_duelchamp_enter.gif']");
    _button.click();
    FestTimer = window.setTimeout(chainFest, 5000);
}

function festivalDuelStats() {
    var _storedFarm = item.get('cabfPageFestivalDuelPoints', '100000433761803');
    var _sel = $('#cabfTargetSelect');
    addFestivalDuelBoard('#battleList');
    _sel = $('#cabfTargetSelect');
    $.each(FarmIds, function (_i, _e) {
        try {
            if (item.get('cabfCleanCheck', 'false') == 'false') {
                _sel.append('<option value="' + _e + '" ' + (_storedFarm == _e ? 'selected = "selected"' : '') + ' >' + _e + '</option>');
            } else {
                if (LostIds.lastIndexOf(_e) < 0 && guildIDs.lastIndexOf(_e) < 0) {
                    _sel.append('<option value="' + _e + '" ' + (_storedFarm == _e ? 'selected = "selected"' : '') + ' >' + _e + '</option>');
                } else {
                    var _list = (LostIds.lastIndexOf(_e) >= 0 ? "LostIds" : (guildIDs.lastIndexOf(_e) >= 0 ? "guildIDs" : "LostIds or guildIDs"));
                    console.log("FarmIds " + _e + " is in " + _list + "! So, don't add it to farm list.");
                }
            }
        } catch (err) {
            console.log("Error: FarmIds " + _e, err);
        }
    });
    _sel.change(function () {
        _storedFarm = $(this).find("option:selected").text();
        item.set('cabfPageFestivalDuelPoints', _storedFarm);
        console.log("ToDo set revenge button");
        festivalDuelFarmButton(_storedFarm);
        $('#farmKeep').attr('href', "keep.php?casuser=" + _storedFarm);
    });
    _sel.after('<div><br></div><div id="cabfFarmTargetButton"><span>BUTTON</span></div><div><br></div><div>Min Rank : <input id="targetMinRank" type="number" min="0" max="18"></input></div><div><br></div><div>Min Points : <input id="targetMinPoint" type="number" min="0" max="18"></input></div><div><br></div><div><input id="autocompleteRemove"></input><button id="RemoveButton">Remove</button></div><div><br></div><div id="cabfFarmStopStartButton"><button id="StopButton">Stop</button><span> - </span><button id="StartButton">Start</button></div><div><br></div><div><input type="checkbox" id="cleanCheck"></input><button id="CleanButton">Clean</button></div><div><br></div><div><button id="ClearButton">Clear</button></div><div><br></div><div><span>Black List : </span><span><textarea id="BlackList" rows="5" cols="35" ></textarea></span></div></div>');
    $('#farmKeep').attr('href', "keep.php?casuser=" + _storedFarm);
    $('#targetMinRank')[0].value = chainRankMin;
    $('#targetMinRank').change(function () {
        item.set('chainRankMin', this.value);
        chainRankMin = this.value;
    });
    $('#targetMinPoint')[0].value = chainPointMin;
    $('#targetMinPoint').change(function () {
        item.set('chainPointMin', this.value);
        chainPointMin = parseInt(this.value);
    });
    try {
        if (item.get('cabfCleanCheck', 'false') == 'true') {
            $('#cleanCheck')[0].checked = true;
        } else {
            $('#cleanCheck')[0].checked = false;
        }
        $('#cleanCheck').change(function () {
            if (this.checked) {
                item.set('cabfCleanCheck', 'true');
            } else {
                item.set('cabfCleanCheck', 'false');
            }
            console.log("cabfCleanCheck", item.get('cabfCleanCheck', 'false'));
        });
    } catch (e) {
        item.set('cabfCleanCheck', 'false');
        console.error(e);
    }
    festivalDuelFarmButton(_storedFarm);
    $('#autocompleteRemove').autocomplete({
        source : FarmIds
    });
    $('#RemoveButton').button();
    $('#RemoveButton').click(function () {
        var valId = $("#autocompleteRemove").val();
        if (confirm('Are you sure to retreive ' + valId + ' from farm targets?')) {
            var index = FarmIds.indexOf(valId);
            FarmIds.splice(index, 1);
            $("#cabfTargetSelect option[value='" + valId + "']").remove();
        }
    });
    $('#StopButton').button();
    $('#StopButton').click(function () {
        window.clearTimeout(FestTimer);
        item.set('FestTimer', false);
    });
    $('#StartButton').button();
    $('#StartButton').click(function () {
        item.set('FestTimer', true);
        window.clearTimeout(FestTimer);
        FestTimer = window.setTimeout(chainFest, 5000);
    });
    $('#CleanButton').button();
    $('#CleanButton').click(function () {
        var _select = $('#cabfTargetSelect'),
            _selectedFarm = item.get('cabfPageFestivalDuelPoints', '100000433761803');

        _select.html(' ');
        $.each(FarmIds, function (_i, _e) {
            try {
                if (LostIds.lastIndexOf(_e) < 0 && guildIDs.lastIndexOf(_e) < 0 && DeadIds.lastIndexOf(_e) < 0) {
                    _select.append('<option value="' + _e + '" ' + (_selectedFarm == _e ? 'selected = "selected"' : '') + ' >' + _e + '</option>');
                } else {
                    var _list = (LostIds.lastIndexOf(_e) >= 0 ? "LostIds" : (guildIDs.lastIndexOf(_e) >= 0 ? "guildIDs" : "LostIds or guildIDs"));
                    console.log("FarmIds " + _e + " is in " + _list + "! So, don't add it to farm list!");
                }
            } catch (err) {
                console.log("Error: FarmIds " + _e, err);
            }
        });
        item.set('cabfCleanCheck', 'true');
        $('#cleanCheck')[0].checked = true;
    });
    $('#ClearButton').button();
    $('#ClearButton').click(function () {
        if (confirm('Are you sure to clear target from looses definitively?')) {
            var _select = $('#cabfTargetSelect'),
                _selectedFarm = item.get('cabfPageFestivalDuelPoints', '100000433761803'),
                _delArray = [];

            _select.html(' ');
            $.each(FarmIds, function (_i, _e) {
                try {
                    if (LostIds.lastIndexOf(_e) < 0 && guildIDs.lastIndexOf(_e) < 0) {
                        _select.append('<option value="' + _e + '" ' + (_selectedFarm == _e ? 'selected = "selected"' : '') + ' >' + _e + '</option>');
                    } else {
                        var _list = (LostIds.lastIndexOf(_e) >= 0 ? "LostIds" : (guildIDs.lastIndexOf(_e) >= 0 ? "guildIDs" : "LostIds or guildIDs"));
                        _delArray.push(FarmIds.indexOf(_e));
                        console.log("FarmIds " + _e + " is in " + _list + "! So, cleared it.");
                    }
                } catch (err) {
                    console.log("Error: FarmIds " + _e, err);
                }
            });
            console.log("Before clear FarmIds: length=" + FarmIds.length);
            for (var i = 0; i < _delArray.length; i++) {
                FarmIds.splice(_delArray[i], 1);
            }
            console.log("After clear FarmIds: length=" + FarmIds.length);
            item.set('farmids', FarmIds);
        }
    });

    $('#BlackList').resizable({
        handles : "se, e, s",
        maxWidth : "260px",
        minWidth : "75px"
    });
    $('#BlackList')[0].value = JSON.stringify(guildIDs);
    $('#BlackList').change(function () {
        item.set('guildIDs', JSON.parse(this.value));
        guildIDs = JSON.parse(this.value);
    });
}

function festivalDuelFarmButton(id) {
    var _buttonDIV = $('#cabfFarmTargetButton');
    if (_buttonDIV.length > 0) {
        var _button = $("input[src*='festival_duelchamp_challenge_btn.gif']:first");
        if (_button.length > 0) {
            _buttonDIV.html(_button.parent().parent().parent().html());
            $("input[name='target_id']", _buttonDIV).attr("value", id);
        } else {
            console.log("_button not found");
        }
    } else {
        console.log("_buttonDIV not found");
    }
}

function eliminateDuplicates(arr) {
    var i,
        len = arr.length,
        out = [],
        obj = {};

    for (i = 0; i < len; i++) {
        obj[arr[i]] = 0;
    }
    for (i in obj) {
        out.push(i);
    }
    return out;
}

/******************************************************************************************************************************************************************************
 *******************************************************************************************************************************************************************************
 *************    NORMAL DUEL ***********************************************************************************************************************************************
 *******************************************************************************************************************************************************************************
 ******************************************************************************************************************************************************************************/
var NormalTimer;

function farmNormalBattle(id) {
    try {
        if (item.get('#normalFarmCheck', 'false') == 'true') {
            console.log("farmNormalBattle", id);
            var _button;
            _button = $("input[src*='war_duelagainbtn2.gif'],input[src*='war_invadeagainbtn.gif'],input[src*='war_healagainbtn.gif']");
            if (_button.length > 0) {
                if ($("div[style*='battle_top1.jpg']").length > 0) {
                    item.set('LASTfarmNormalBattle', $('#results_main_wrapper').html());
                }
                _button.click();
            } else {
                window.clearTimeout(NormalTimer);
            }
        } else {
            window.clearTimeout(NormalTimer);
        }
    } catch (e) {
        console.log("Error: farmNormalBattle", e);
        window.clearTimeout(NormalTimer);
    }
}

function normalDuelStats(id) {
    var _sel = $(id);
    addNormalDuelBoard(id);
    _sel = $('#cabfToggleNormal');
    _sel.html('<div>Farm: <input type="checkbox" id="normalFarmCheck"></input></div><div id="lastfarmnormalbattle"><button  id="btlastfarm">Last</button></div>');
    try {
        if (item.get('#normalFarmCheck', 'false') == 'true') {
            $('#normalFarmCheck')[0].checked = true;
        } else {
            $('#normalFarmCheck')[0].checked = false;
        }
        $('#normalFarmCheck').change(function () {
            if (this.checked) {
                item.set('#normalFarmCheck', 'true');
            } else {
                item.set('#normalFarmCheck', 'false');
            }
            console.log("#normalFarmCheck", item.get('#normalFarmCheck', 'false'));
        });
    } catch (e) {
        item.set('#normalFarmCheck', 'false');
        console.error(e);
    }
    $('#btlastfarm').click(function () {
        if ($("div[style*='battle_top1.jpg']").length > 0) {
            $('#results_main_wrapper').html(item.get('LASTfarmNormalBattle', ' '));
        }
    });
}

/******************************************************************************************************************************************************************************
 *******************************************************************************************************************************************************************************
 *************    QUEST ***********************************************************************************************************************************************
 *******************************************************************************************************************************************************************************
 ******************************************************************************************************************************************************************************/
var QuestTimer;

function farmQuestClick() {
    try {
        if (item.get('#questFarmCheck', 'false') == 'true') {
            console.log("farmQuestClick");
            var _button;
            _button = $("input[src*='quest_questagain2_btn.gif']");
            if (_button.length > 0) {
                _button.click();
            } else {
                _button = $("input[src*='quest_questagain_btn.gif']");
                if (_button.length > 0) {
                    var _levelDiv = $('div[style*="nt_topbar2"]');
                    if (_levelDiv.length > 0) {
                        var _levelText = _levelDiv.text().trim();
                        var _level = parseInt(/(?:Level\ )(\d+)/g.exec(_levelText)[1]);
                        console.log("farmQuestClick Level=", _level);
                        if (_level < 4) {
                            _button.click();
                        } else {
                            window.clearTimeout(QuestTimer);
                        }
                    } else {
                        window.clearTimeout(QuestTimer);
                    }
                } else {
                    var _required = parseInt(item.get('#questFarmEnergyMin', '0'));
                    var _current = parseInt($("#energy_current_value").text());
                    _button = $("div:contains('Do Quest Again!'):last input[src*='quest_quest_btn.gif']");
                    if (_button.length > 0) {

                        if (_current >= _required) {
                            _button.click();
                        }
                        else {
                            console.log("Current Energy: " + _current + ", needed " + _required + ". Retrying in 30 seconds.");
                            setTimeout(farmQuestClick, 30000);
                        }
                    } else {
                        window.clearTimeout(QuestTimer);
                    }
                }
            }
        } else {
            window.clearTimeout(QuestTimer);
        }
    } catch (e) {
        console.log("Error: farmQuestClick", e);
        window.clearTimeout(QuestTimer);
    }
}

function questFarm() {
    try {
        var _sel = $('#results_main_wrapper');
        addQuestDuelBoard('#results_main_wrapper');
        _sel = $('#cabfToggleQuest');
        _sel.html('<div>Farm: <input type="checkbox" id="questFarmCheck"></input>  </br> <input type="text" id="questFarmEnergyMin"></input>');
        if (item.get('#questFarmCheck', 'false') == 'true') {
            $('#questFarmCheck')[0].checked = true;
        } else {
            $('#questFarmCheck')[0].checked = false;
        }
        $('#questFarmCheck').change(function () {
            if (this.checked) {
                item.set('#questFarmCheck', 'true');
            } else {
                item.set('#questFarmCheck', 'false');
            }
            console.log("#questFarmCheck", item.get('#questFarmCheck', 'false'));
        });

        if ($.isNumeric(item.get('#questFarmEnergyMin', '0'))) {
            $('#questFarmEnergyMin').val(item.get('#questFarmEnergyMin', '0'));
        } else {
            $('#questFarmEnergyMin').val("0");
        }
        $('#questFarmEnergyMin').keyup(function () {
            if ($.isNumeric($("#questFarmEnergyMin").val()))
                item.set('#questFarmEnergyMin', $("#questFarmEnergyMin").val());
            else {
                $("#questFarmEnergyMin").val(item.get('#questFarmEnergyMin', '0'));
            }
        });
    } catch (e) {
        item.set('#questFarmCheck', 'false');
        console.error(e);
    }
}

/******************************************************************************************************************************************************************************
 *******************************************************************************************************************************************************************************
 *************    GUILD MEMBERS ***********************************************************************************************************************************************
 *******************************************************************************************************************************************************************************
 ******************************************************************************************************************************************************************************/
function checkMyGuildIds(callback) {

    function onError() {
        $().alert("Unable to use ajax");
    }
    function onSuccess(data) {
        try {
            var guildDiv = $("#guildv2_formation_middle", data),
                tempArray=[], i;
            if ($u.hasContent(guildDiv)) {
                var membersKeys=$("script:contains('initTowerSlots()')",data).text().match(/key=\\"(\d+)\\/gm);
                $.each(membersKeys, function (_i, _e) {
                    var res = /(\d+)/gm.exec(_e);
                    tempArray.push(parseInt(res[0]));
                });
                item.set('guildIDs', tempArray);
                guildIDs = item.get('guildIDs', []);
                console.log("my guild is updated with success");
                window.clearTimeout(ArenaTimer);
                ArenaTimer = window.setTimeout(callback, 1000);
            }
            return true;
        } catch (err) {
            console.error("ERROR in checkMyGuildIds: " + err.stack);
            return false;
        }
    }

    try {
        var params = {};
        myAjax('hundred_battle.php', params, onError, onSuccess);
        params = null;
        return true;
    } catch (err) {
        console.error("ERROR in testAjax : " + err);
        return false;
    }
}

/******************************************************************************************************************************************************************************
 *******************************************************************************************************************************************************************************
 *************    GUILD ESSENCES ***********************************************************************************************************************************************
 *******************************************************************************************************************************************************************************
 ******************************************************************************************************************************************************************************/
function myAjax(page, params, cbError, cbSuccess) {
    try {

        params = $u.hasContent(params) && $u.isPlainObject(params) && !$u.isEmptyObject(params) ? params : {};
        params.ajax = 1;

        if (!$u.hasContent(page) || !$u.isString(page)) {
            page = "index.php";
            params.adkx = 2;
        }

        if (!$u.hasContent(cbError) || !$u.isFunction(cbError)) {
            cbError = function (XMLHttpRequest, textStatus, errorThrown) {
                console.error("ajax: ", [XMLHttpRequest, textStatus, errorThrown]);
            };
        }

        if (!$u.hasContent(cbSuccess) || !$u.isFunction(cbSuccess)) {
            cbSuccess = function (data, textStatus, XMLHttpRequest) {
                console.log(2, "ajax:", [data, textStatus, XMLHttpRequest]);
            };
        }

        $.ajax({
            url : page,
            type : 'POST',
            data : params,
            error : function (XMLHttpRequest, textStatus, errorThrown) {
                cbError(XMLHttpRequest, textStatus, errorThrown);
            },

            success : function (data, textStatus, XMLHttpRequest) {
                data = "<div>" + data + "</div>";
                //console.log(2, "ajax", [data, textStatus, XMLHttpRequest]);
                cbSuccess(data, textStatus, XMLHttpRequest);
            }
        });

        return true;
    } catch (err) {
        console.error("ERROR in myAjax: " + err.stack);
        return false;
    }
}

function addToStorage(type, guild_id, guild_name, number) {
    var toggle = type[0].toUpperCase() + type.slice(1);
    var html = item.get('list' + toggle + 'Storage', '');

    if ($('#' + toggle + guild_id).length > 0) {
        $('#' + toggle + guild_id).html(number);
    } else {
        $('#cabfToggle' + toggle + 'Storage').html(html);
        $('#cabfToggle' + toggle + 'Storage').append('<div id="cabfGuildLink"><a href="guild_conquest_market.php?guild_id=' + guild_id + '" onclick="ajaxLinkSend(\'globalContainer\', \'guild_conquest_market.php?guild_id=' + guild_id + '\'); return false;">' + guild_name + '</a> : <span id="' + toggle + guild_id + '">' + number + '</span></div>');
    }
    item.set('list' + toggle + 'Storage', $('#cabfToggle' + toggle + 'Storage').html());
    toggle = null;
    html = null;
}

function removeFromStorage(type, guild_id) {
    var toggle = type[0].toUpperCase() + type.slice(1);
    if ($('#' + toggle + guild_id).length > 0) {
        $('#' + toggle + guild_id).parent().remove();
        item.set('list' + toggle + 'Storage', $('#cabfToggle' + toggle + 'Storage').html());
    }
    toggle = null;
}

function setEssence(storageDivs, guild_id, guild_name) {
    try {
        var essences = item.get('essences', defaultEssences);
        var guild_index = getEssenceIndex(essences, guild_id);
        if (guild_index < 0) {
            console.log("New guild");
        } else {
            delete essences[guild_index].guild_name;
            essences[guild_index].name = guild_name;
            storageDivs.each(function () {
                var essenceText = $(this).children().eq(0).text().split(/\W+/);
                essences[guild_index][essenceText[1].toLowerCase()] = essenceText[6] - essenceText[5];
                essenceText = null;
            });
            if (essences[guild_index].damage > 0) {
                addToStorage('damage', guild_id, guild_name, essences[guild_index].damage);
            } else {
                removeFromStorage('damage', guild_id);
            }
            if (essences[guild_index].attack > 0) {
                addToStorage('attack', guild_id, guild_name, essences[guild_index].attack);
            } else {
                removeFromStorage('attack', guild_id);
            }
            if (essences[guild_index].defense > 0) {
                addToStorage('defense', guild_id, guild_name, essences[guild_index].defense);
            } else {
                removeFromStorage('defense', guild_id);
            }
            if (essences[guild_index].health > 0) {
                addToStorage('health', guild_id, guild_name, essences[guild_index].health);
            } else {
                removeFromStorage('health', guild_id);
            }
            console.log("essences de " + guild_name + " : ", essences[guild_index]);
        }
        item.set('essences', essences);
        essence = null;
        guild_index = null;
        return true;
    } catch (err) {
        console.error("ERROR in setEssence for " + guild_name + " : " + err);
        return false;
    }
}

function searchEssence() {
    window.clearTimeout(FestTimer);
    var index = 0,
        nb = 0;

    function onError() {
        $().alert("Unable to use ajax");
    }

    function onSuccess(data) {
        var storageDivs = $("[id^='storage_']", data);
        var guild_id = $("[id^='guild_name_header']", data).children().eq(0).attr('href').split('=')[1];
        var guild_name = $("[id^='guild_name_header']", data).children().eq(0).text();
        setEssence(storageDivs, guild_id, guild_name);
        index++;
        $('#cabfEssenceTilte').html('Essences<br>scan at ' + Math.ceil(index * 100 / nb) + '%');
        essence = null;
        guild_id = null;
        guild_name = null;
    }

    try {
        var essencesArray = item.get('essences', defaultEssences);
        var params = {};

        $('#cabfToggleDamageStorage').html('');
        $('#cabfToggleAttackStorage').html('');
        $('#cabfToggleDefenseStorage').html('');
        $('#cabfToggleHealthStorage').html('');

        item.set('listDamageStorage', '');
        item.set('listAttackStorage', '');
        item.set('listDefenseStorage', '');
        item.set('listHealthStorage', '');
        nb = essencesArray.length;
        for (var i = 0; i < essencesArray.length; i++) {
            params.guild_id = essencesArray[i].guildId;
            myAjax('guild_conquest_market.php', params, onError, onSuccess);
        }
        essencesArray = null;
        params = null;
        return true;
    } catch (err) {
        console.error("ERROR in testAjax : " + err);
        return false;
    }
}

function getEssence(type) {
    try {
        var essencesArray = item.get('essences', defaultEssences);
        var MaxVal = -1;
        var MaxGuild = '';
        for (var i = 0; i < essencesArray.length; i++) {
            if (MaxVal < parseInt(essencesArray[i][type])) {
                MaxVal = parseInt(essencesArray[i][type]);
                MaxGuild = essencesArray[i].guildId;
            }
        }
        ajaxLinkSend('globalContainer', 'guild_conquest_market.php?guild_id=' + MaxGuild);
        essencesArray = null;
        MaxVal = null;
        MaxGuild = null;
    } catch (err) {
        console.error("ERROR in getEssence : " + err);
    }
}

function getEssenceIndex(array, guild_id) {
    for (var i = 0; i < array.length; i++) {
        if (array[i].guildId === guild_id) {
            return i;
        }
    }
    return -1;
}
function diagIOE() {
    if ($('#main_bntp').length > 0) {
        var defaultData = {};
        $('#main_bntp').append(_dialogIO);
        $("#dialogIO").dialog({
            modal : true,
            height : 410,
            width : 660,
            buttons : {
                "Export" : function () {
                    try {
                        $(this).children('#statsDg')[0].value = JSON.stringify(item.get('essences', defaultEssences), null, '\t');
                        $(this).children('#statsDg')[0].select();
                        console.log('Export succeed.');
                    } catch (e) {
                        console.log('Export failed : ', e);
                    }
                },
                "Import" : function () {
                    if (!$(this).children('#statsDg')[0].value || $(this).children('#statsDg')[0].value === null || $(this).children('#statsDg')[0].value === "") {
                        console.log('Error null value.');
                        return;
                    }
                    try {
                        item.set('essences', JSON.parse($(this).children('#statsDg')[0].value));
                        $(this).dialog("close");
                        console.log('Import succeed.');
                    } catch (e) {
                        console.log('Import failed : ', e);
                    }
                },
                "Insert non-existent" : function () {
                    if (!$(this).children('#statsDg')[0].value || $(this).children('#statsDg')[0].value === null || $(this).children('#statsDg')[0].value === "") {
                        console.log('Error null value.');
                        return;
                    }
                    try {
                        var essencesToMerge = JSON.parse($(this).children('#statsDg')[0].value),
                            essencesLocal = item.get('essences', defaultEssences),
                            newInserted = 0;

                        for (var i = 0; i < essencesToMerge.length; i++) {
                            var guildId = essencesToMerge[i].guildId;
                            var indexEssence = getEssenceIndex(essencesLocal, guildId);
                            if (indexEssence < 0) {
                                var newEssence = {
                                    "name" : essencesToMerge[i].guildId,
                                    "level" : essencesToMerge[i].level,
                                    "lastCheck" : essencesToMerge[i].lastCheck,
                                    "attack" : essencesToMerge[i].attack,
                                    "defense" : essencesToMerge[i].defense,
                                    "damage" : essencesToMerge[i].damage,
                                    "health" : essencesToMerge[i].health,
                                    "guildId" : essencesToMerge[i].guildId
                                };
                                essencesLocal.push(newEssence);
                                newInserted++;
                                newEssence = null;
                            }
                        }
                        item.set('essences', essencesLocal);
                        $(this).dialog("close");
                        console.log('Insert succeed. Total inserted: ' + newInserted);
                        essencesToMerge = null;
                        essencesLocal = null;
                        newInserted = null;
                    } catch (e) {
                        console.log('Insert failed : ', e);
                    }
                },
                Cancel : function () {
                    $(this).dialog("close");
                }
            },
            open : function (event, ui) {
                console.log('Import/Export Dialog opened.');
            }
        });
    }
}

/******************************************************************************************************************************************************************************
 *******************************************************************************************************************************************************************************
 *************    FILTERS BATTLE ***********************************************************************************************************************************************
 *******************************************************************************************************************************************************************************
 ******************************************************************************************************************************************************************************/
function cabf_filters() {

    cabf_connect();
    console.log("cabf_filters");

    $("#cabfHealthActionEarth").hide();
    $("#cabfConquestEarthFilterContainer").hide();

    /* Selection par dÃ©faut de la derniÃ¨re valeur d'options */
    $("select[name='amount']").each(function (_i, _e) {
        value = $('option:last-child', _e).text();
        $(_e).val(value);
    });

    /* Guild battle or 10vs10 battle*/
    if ($('#enemy_guild_tab,#your_guild_tab').length > 0) {

        // Switch between 10vs10 battle and Guild battle
        if ($('#enemy_new_guild_tab_1,#your_new_guild_tab_1').length > 0) {
            console.log('Guild battle');
            battleStats();
            cabf_guildbattlefilter();
        } else {
            console.log('10vs10 battle');
            battleStats();
            cabf_tenbattlefilter();
        }
    } else {
        /* Festival battle */
        if ($('#enemy_team_tab').length > 0 || $('#your_team_tab').length > 0) {
            console.log('Festival battle');
            battleStats();
            cabf_festivalbattlefilter();
        } else {
            /* Earth land conquest battle */
            if ($('#tower_1,#tower_2,#tower_3,#tower_4').length > 0) {
                console.log('Earth land conquest battle');
                /*battleStats();*/
                cabf_conquestearthfilter();
            } else {
                /* Mist land conquest battle */
                if ($('#your_guild_member_list_1').length > 0) {
                    console.log('Mist land conquest battle');
                    battleStats();
                    cabf_conquestmistfilter();
                    normalDuelStats('#guild_battle_section');
                } else {
                    /* Arena battle */
                    if ($('#arena_mid').length > 0) {
                        console.log('Arena battle');
                        battleStats();
                        cabf_arenabattlefilter();
                    } else {
                        /* Normal battle */
                        if ($('#blist_pulldown_select').length > 0) {
                            console.log('Normal battle');
                            if ($('div[style*="festival_duelchamp_top.jpg"]').length > 0) {
                                console.log('Festival Duel Battle');
                                festivalDuelStats();
                            }
                            if ($('div[style*="battle_top1.jpg"]').length > 0) {
                                console.log('Normal Duel Battle');
                                normalDuelStats('#battleList');
                            }
                            if ($('div[style*="war_conquest_header2.jpg"]').length > 0) {
                                console.log('Conquest Duel Battle');
                                normalDuelStats('#battleList');
                            }
                            battleStats();
                        }
                    }
                }
            }
        }
    }

    /* Alchemy */
    if ($('div[style*="alchfb_top.jpg"]').length > 0) {
        if (item.get('crafting', false)) {
            Craft(item.get('craftChoosen', craftList.LAVA_ORB));
        }
    }

    /* Quest */
    if ($('div[class*="quests_background"]').length > 0) {
        console.log('Quest');
        questFarm();

        window.clearTimeout(QuestTimer);
        if (item.get('#questFarmCheck', 'false') == 'true') {
            QuestTimer = window.setTimeout(farmQuestClick, 1000);
        }
    }

    /* Guild Essence */
    addEssenceBoard('#main_bntp');
    if ($('#storage_1').length > 0) {
        console.log('Guild Essence');
        var storageDivs = $("[id^='storage_']");
        var guild_id = $("[id^='guild_name_header']").children().eq(0).attr('href').split('=')[1];
        var guild_name = $("[id^='guild_name_header']").children().eq(0).text();
        setEssence(storageDivs, guild_id, guild_name);
        essence = null;
        guild_id = null;
        guild_name = null;
    }

    /* monsters */
    if ($('img[src*="monster_health_background.jpg"], [src*="nm_red.jpg"], [src*="nm_orange.jpg"],[src*="bar_dispel.gif"],[src*="nm_green.jpg"],[src*="seamonster_ship_health.jpg"],[src$="nm_stun_bar.gif"]').length > 0) {
        monsterBars();
        defenseBar();
        stunBar();
    }
    if ($('div[id="player_monster_list"]').length > 0) {
        linkMonsters();
        storeLinkMonsters();
    }

    if ($('img[src*="list_btn_tabpublic_on.gif"]').length > 0) {
        linkMonsters();
        addMonsterFilter();
    }
}

function diagIO() {
    if ($('#main_bntp').length > 0) {
        var defaultData = {};
        $('#main_bntp').append(_dialogIO);
        $("#dialogIO").dialog({
            modal : true,
            height : 410,
            width : 660,
            buttons : {
                "Export" : function () {
                    try {
                        $(this).children('#statsDg')[0].value = JSON.stringify(item.get('stats', defaultStats), null, '\t');
                        $(this).children('#statsDg')[0].select();
                        console.log('Export succeed.');
                    } catch (e) {
                        console.log('Export failed : ', e);
                    }
                },
                "Import" : function () {
                    if (!$(this).children('#statsDg')[0].value || $(this).children('#statsDg')[0].value === null || $(this).children('#statsDg')[0].value === "") {
                        console.log('Error null value.');
                        return;
                    }
                    try {
                        item.set('stats', JSON.parse($(this).children('#statsDg')[0].value));
                        $(this).dialog("close");
                        console.log('Import succeed.');
                    } catch (e) {
                        console.log('Import failed : ', e);
                    }
                },
                "Merge" : function () {
                    if (!$(this).children('#statsDg')[0].value || $(this).children('#statsDg')[0].value === null || $(this).children('#statsDg')[0].value === "") {
                        console.log('Error null value.');
                        return;
                    }
                    try {
                        var statsToMerge = JSON.parse($(this).children('#statsDg')[0].value),
                            statsLocal = item.get('stats', defaultStats);

                        for (var i = 0; i < statsToMerge.targets.length; i++) {
                            var target_id = statsToMerge.targets[i].target_id;
                            var indexTarget = getTargetIndex(statsLocal.targets, target_id);
                            if (indexTarget < 0) {
                                var newTarget = defaultData;
                                statsLocal.targets.push(newTarget);
                                indexTarget = getTargetIndex(statsLocal.targets, target_id);
                                newTarget = null;
                            }
                            statsLocal.targets[indexTarget].victory += statsToMerge.targets[i].victory;
                            statsLocal.targets[indexTarget].defeat += statsToMerge.targets[i].defeat;
                        }
                        item.set('stats', statsLocal);
                        $(this).dialog("close");
                        console.log('Merge succeed.');
                        statsToMerge = null;
                        statsLocal = null;
                    } catch (e) {
                        console.log('Merge failed : ', e);
                    }
                },
                "Insert non-existent" : function () {
                    if (!$(this).children('#statsDg')[0].value || $(this).children('#statsDg')[0].value === null || $(this).children('#statsDg')[0].value === "") {
                        console.log('Error null value.');
                        return;
                    }
                    try {
                        var statsToMerge = JSON.parse($(this).children('#statsDg')[0].value),
                            statsLocal = item.get('stats', defaultStats);

                        for (var i = 0; i < statsToMerge.targets.length; i++) {
                            var target_id = statsToMerge.targets[i].target_id;
                            var indexTarget = getTargetIndex(statsLocal.targets, target_id);
                            if (indexTarget < 0) {
                                var newTarget = {
                                    "target_id" : target_id,
                                    "victory" : statsToMerge.targets[i].victory,
                                    "defeat" : statsToMerge.targets[i].defeat
                                };
                                statsLocal.targets.push(newTarget);
                                newTarget = null;
                            }
                        }
                        item.set('stats', statsLocal);
                        $(this).dialog("close");
                        console.log('Insert succeed.');
                        statsToMerge = null;
                        statsLocal = null;
                    } catch (e) {
                        console.log('Insert failed : ', e);
                    }
                },
                Cancel : function () {
                    $(this).dialog("close");
                }
            },
            open : function (event, ui) {
                console.log('Import/Export Dialog opened.');
            }
        });
    }
}

function Generate_key() {
    try {
        var ret = "",
            length = 32;
        while (ret.length < length) {
            ret += Math.random().toString(16).substring(2);
        }
        return ret.substring(0, length);
    } catch (e) {
        console.log('Generate_key error : ', e);
        return "undefined";
    }
}

function sync() {
    if ($('#main_bntp').length > 0) {
        $('#main_bntp').append(_dialogSync);
        $("#dialogSync").dialog({
            modal : true,
            height : 250,
            width : 720,
            buttons : {
                "Save" : function () {
                    try {
                        var key = $(this).children('form')[0][1].value;
                        item.set('syncKey', key);
                        item.set('syncRemoteKey', $('#syncRemoteKey',this)[0].value);
                        console.log('Save succeed.');
                        $(this).dialog("close");
                    } catch (e) {
                        console.log('Save failed : ', e);
                    }
                },
                "Make new Key" : function () {
                    try {
                        $.ajax({
                            url : "https://api.myjson.com/bins",
                            type : "POST",
                            data : '{"key":"value"}',
                            contentType : "application/json; charset=utf-8",
                            dataType : "json",
                            success : function (data, textStatus, jqXHR) {
                                console.log('data', data);
                                item.set('syncKey', data.uri);
                            }
                        });
                        $(this).dialog("close");
                        /*
                        var key=Generate_key();
                        $(this).children('form')[0][1].value=key;
                        console.log('Make new Key succeed.');*/
                    } catch (e) {
                        console.log('Make new Key failed : ', e);
                    }
                },
                Cancel : function () {
                    $(this).dialog("close");
                }
            },
            open : function (event, ui) {
                console.log($('#syncRemoteKey',this));
                $(this).children('form')[0][1].value = item.get('syncKey', "");
                $('#syncRemoteKey',this)[0].value = item.get('syncRemoteKey', "");
                console.log('Sync Dialog opened.', item.get('syncKey', ""));
            }
        });
    }
}

function diagConnect() {
    if ($('#main_bntp').length > 0) {
        $('#main_bntp').append(_dialogConnect);
        $("#dialogConnect").dialog({
            modal : true,
            height : 260,
            width : 620,
            buttons : {
                "Save" : function () {
                    try {
                        var key = $(this).children('form')[0];
                        console.log('player_email : ', key[1].value);
                        item.set('player_email', key[1].value);
                        console.log('player_password : ', key[3].value);
                        item.set('player_password', key[3].value);
                        console.log('Save succeed.');
                        $(this).dialog("close");
                    } catch (e) {
                        console.log('Save failed : ', e);
                    }
                },
                Cancel : function () {
                    $(this).dialog("close");
                }
            }
        });
    }
}

/******************************************************************************************************************************************************************************
 *******************************************************************************************************************************************************************************
 *************    ALCHEMY ******************************************************************************************************************************************************
 *******************************************************************************************************************************************************************************
 ******************************************************************************************************************************************************************************/
var craftList = {

    AIR_ORB : {
        name : "AIR ORB",
        alchemy_id : 165
    },
    LAVA_ORB : {
        name : "LAVA ORB",
        alchemy_id : 194
    },
    ICE_ORB : {
        name : "ICE ORB",
        alchemy_id : 231
    },
    EARTH_ORB : {
        name : "EARTH ORB",
        alchemy_id : 237
    },
    SERPENTINE_SHIELD : {
        name : "SERPENTINE SHIELD",
        alchemy_id : 273
    },
    SHIELD_OF_DANTE : {
        name : "SHIELD OF DANTE",
        alchemy_id : 221
    },
    HERO_CRYSTAL : {
        name : "HERO CRYSTAL",
        alchemy_id : 12
    },
    AGGRESSIVE_HERO_POTION : {
        name : "AGGRESSIVE HERO POTION",
        alchemy_id : 45
    },
    DEFENSIVE_HERO_POTION : {
        name : "DEFENSIVE HERO POTION",
        alchemy_id : 46
    },
    BALANCED_HERO_POTION : {
        name : "BALANCED HERO POTION",
        alchemy_id : 47
    }
};

function diagCraft() {
    if ($('#main_bntp').length > 0) {
        if ($('#dialogCraft').length === 0) {
            $('#main_bntp').append(_dialogCraft);
        }
        $("#dialogCraft").dialog({
            modal : true,
            height : 260,
            width : 620,
            buttons : {
                "Craft" : function () {
                    try {
                        var alchemy = $("#selectAlchemy");
                        craftChoosen = craftList[alchemy.val()];
                        console.log(craftChoosen.name + " is the alchemy choosen...", craftChoosen);
                        item.set('craftChoosen', craftChoosen);
                        item.set('crafting', true);
                        $(this).dialog("close");
                        Craft(craftChoosen);
                    } catch (e) {
                        console.log('Start Craft failed : ', e);
                    }
                },
                Cancel : function () {
                    item.set('crafting', false);
                    item.set('craftingAll', false);
                    $(this).dialog("close");
                }
            },
            create : function (event, ui) {
                $.each(craftList, function (name, alchemy) {
                    console.log("#selectAlchemy", name, alchemy, $('#selectAlchemy'));
                    $('#selectAlchemy').append($('<option></option>').val(name).html(alchemy.name));
                    if (item.get('craftChoosen', craftList.LAVA_ORB).alchemy_id == alchemy.alchemy_id) {
                        $('#selectAlchemy').val(name);
                    }
                });
            }
        });
    }
}

function Craft(craftChoosen) {
    console.log("Craft:", craftChoosen);
    try {
        var _alchemy = $('#doQst_' + craftChoosen.alchemy_id);
        if (_alchemy.length > 0) {
            console.log("Craft clik:", $('div', _alchemy));
            $('input[src*="alchfb__btn_createon.gif"]', _alchemy).click();
        } else {
            console.log("No more " + craftChoosen.name + " to Craft");
            item.set('crafting', false);
            var back = confirm("No more " + craftChoosen.name + " to Craft. Do you want craft another?");
            if (back) {
                diagCraft();
            }
        }
    } catch (e) {
        console.error("Error checkCompleteCrew", e);
    }

}


/******************************************************************************************************************************************************************************
 *******************************************************************************************************************************************************************************
 *************    INIT *********************************************************************************************************************************************************
 *******************************************************************************************************************************************************************************
 ******************************************************************************************************************************************************************************/
function init() {
    var globalContainer = document.querySelector('#globalContainer');
    var clicked = false;

    if (!globalContainer) {
        if ($("input[src*='crusader2_btn_submit.gif']").length > 0) {

            setInterval(function () {
                var button = $("input[src*='crusader2_btn_submit.gif']");
                console.log('Try Connection');
                button.click();
            }, 30000);
        }
    }

    fcEventClick = function (event) {
        try {
            if (updated)
                window.location.href = clickUrl;

            var obj = event.target;
            while (obj && !obj.href)
                obj = obj.parentNode;

            if (obj && obj.href)
                clickUrl = obj.href;
            clicked = true;
        } catch (e) {
            console.error("Error in globalContainer Click", e);
        }
    };
    try {
        if (globalContainer.addEventListener) {
            console.log('Event Click For all major browsers, except IE 8 and earlier');
            globalContainer.addEventListener('click', fcEventClick, true);
        }
    } catch (e) {
        console.error('Error in init when addEventListener click', e);
    }

    // create an observer instance
    var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.addedNodes.length > 0) {
                if (mutation.addedNodes[0].className == "spinner") {
                    console.log('spinner', spinner);
                } else {
                    console.log('mutation', mutation);
                    cabf_filters();
                }
            }
        });
    });

    // configuration of the observer:
    var config = {
        attributes : true,
        childList : true,
        characterData : true
    };

    // pass in the target node, as well as the observer options
    observer.observe(globalContainer, config);

    GM_registerMenuCommand("CABF (Import/Export Stats)", function () {
        diagIO();
    });
    GM_registerMenuCommand("CABF (Import/Export Essences)", function () {
        diagIOE();
    });
    GM_registerMenuCommand("CABF (Sync Param)", function () {
        sync();
    });
    GM_registerMenuCommand("CABF (Sync Data)", function () {
        syncData();
    });
    GM_registerMenuCommand("CABF (Connect)", function () {
        diagConnect();
    });
    GM_registerMenuCommand("CABF (Craft)", function () {
        diagCraft();
    });
    GM_registerMenuCommand("CABF (Search Essence)", function () {
        searchEssence();
    });
    GM_registerMenuCommand("CABF (Damage Essence)", function () {
        getEssence('damage');
    });
    GM_registerMenuCommand("CABF (Attack Essence)", function () {
        getEssence('attack');
    });
    GM_registerMenuCommand("CABF (Defense Essence)", function () {
        getEssence('defense');
    });
    GM_registerMenuCommand("CABF (Health Essence)", function () {
        getEssence('health');
    });

    try {
        addCss(GM_getResourceText("cabfCss"));

    } catch (e) {
        console.error("Error addCss", e);
    }

}

GM_addStyle(GM_getResourceText("jqueryUiCss"));
//GM_addStyle (GM_getResourceText ("ca_cabfCss") );


function updateParam(parameter) {
    var urlParam = GM_getResourceText("param"); 
    try {
        var requestPUT = $.ajax({
            url : urlParam,
            type : "PUT",
            data : JSON.stringify(parameter),
            contentType : "application/json; charset=utf-8",
            dataType : "json",
            success : function (data, textStatus, jqXHR) {
                console.log('Param is updated : ', textStatus, data);
                spinner.stop();
            },
            error : function (jqXHR, textStatus, errorThrown) {
                console.log('Error in update param: ' + textStatus, errorThrown);
                spinner.stop();
            }
        });
        requestPUT.onreadystatechange = null;
        requestPUT.abort = null;
        requestPUT = null;
    } catch (ePUT) {
        console.error(ePUT);
        spinner.stop();
    }	
}

function cabf_connect() {
    console.log('cabf_connect');
    if ($("input[src*='crusader2_btn_submit.gif']").length > 0) {
        var button = $("input[src*='crusader2_btn_submit.gif']");
        var player_email = item.get('player_email', '');
        var player_password = item.get('player_password', '');
        console.log('Connection');
        if (player_email !== '' && player_password !== '') {
            console.log('Saved Connection');
            document.getElementsByName("player_email")[0].value = player_email;
            document.getElementsByName("player_password")[0].value = player_password;
            button.click();
        } else {
            console.log('Normal Connection');
            player_password = item.get('player_password', '');
            if (document.getElementsByName("player_password")[0].value)
                button.click();
        }
    }
    if ($("#main_bntp").length > 0 ) {
        var test = $("#main_bntp").text().trim();
        var res = /Welcome\s(.+)\s\(Logout\)/gm.exec(test);
        if (res.length==2) {
            var urlParam = GM_getResourceText("param"); 
            console.log("update keys param");
            item.set('player_name', res[1]);
            var requestGET = $.ajax({
                url : urlParam,
                type : "GET",
                contentType : "application/json; charset=utf-8",
                dataType : "json",
                beforeSend : function () {
                    addLoadingImg('globalContainer');
                    $('div[class="spinner"]').html($('div[class="spinner"]').html() + 'Synchronizing');
                },
                success : function (parameter, textStatus, jqXHR) {
                    var namePlayer = item.get('player_name', 'xxxxxxx');
                    if ('xxxxxxx'.match(namePlayer)) {
                        console.log("Error on player name");
                        return false;
                    }
                    if (!parameter.hasOwnProperty(namePlayer)) {
                        console.log('New remote storage:',namePlayer,parameter);
                        try {
                            $.ajax({
                                url : "https://api.myjson.com/bins",
                                type : "POST",
                                data : '{}',
                                contentType : "application/json; charset=utf-8",
                                dataType : "json",
                                success : function (data, textStatus, jqXHR) {
                                    parameter[namePlayer] = data.uri;
                                    item.set('syncRemoteKey', data.uri);
                                    console.log('New param entry',namePlayer, data.uri);
                                    updateParam(parameter);
                                },
                                error : function (jqXHR, textStatus, errorThrown) {
                                    console.log('Error making new entry: ' + textStatus, errorThrown);
                                    spinner.stop();
                                }
                            });
                        } catch (e) {
                            console.log('Make new Key failed : ', e);
                        }
                    } else {
                        parameter[namePlayer] = item.get('syncRemoteKey','https://api.myjson.com/bins/xxxxx');
                        updateParam(parameter);
                    }
                },
                error : function (jqXHR, textStatus, errorThrown) {
                    console.log('Sync remote storage GET: ' + textStatus, errorThrown);
                    spinner.stop();
                }
            });
            requestGET.onreadystatechange = null;
            requestGET.abort = null;
            requestGET = null;
        }
    }
}

console.log(GM_listValues());

/*Sync*/
syncData();
/* Connection */
cabf_connect();
console.log('init()');
init();
addEssenceBoard('#main_bntp');
if (arenaStarted) {
    ArenaTimer = window.setTimeout(chainArenaNext, 5000, 0);
} else {
    FestTimer = window.setTimeout(chainFestNext, 5000, 0);
}

    corners : 0.5, // Corner roundness (0..1)
    rotate : 42, // The rotation offset
    direction : 1, // 1: clockwise, -1: counterclockwise
    color : '#41f', // #rgb or #rrggbb or array of colors
    speed : 1.6, // Rounds per second
    trail : 25, // Afterglow percentage
    shadow : true, // Whether to render a shadow
    hwaccel : false, // Whether to use hardware acceleration
    className : 'spinner', // The CSS class to assign to the spinner
    zIndex : 2e9, // The z-index (defaults to 2000000000)
    top : '50%', // Top position relative to parent
    left : '50%' // Left position relative to parent
};
var spinContainer;
var spinner;
function addLoadingImg(id) {
    spot = document.getElementById(id);
    spinner = new Spinner(opts).spin(spot);
}

var SyncDataTimer;

function syncData() {
    window.clearTimeout(SyncDataTimer);
    SyncDataTimer = window.setTimeout(syncRemoteAjax, 5000);
}

function mergeRemoteAndLocal(remoteStorage, property) {
    try {
        var nbMerge = 0;
        console.log('mergeRemoteAndLocal ' + property);
        if (!remoteStorage.hasOwnProperty(property)) {
            remoteStorage[property] = [];
            console.log('New remote storage',remoteStorage);
        } else {
            if (remoteStorage[property].length>0) {
                var tempLostArenaIds = JSON.parse(localStorage[property]);
                $.each(JSON.parse(remoteStorage[property]),function(_i, _e) {
                    try {
                        if (tempLostArenaIds.lastIndexOf(_e) < 0) {
                            tempLostArenaIds.push(_e);
                            nbMerge++;
                        }
                    } catch(e) {
                        console.error('Error in mergeRemoteAndLocal ' + property + ' index='+_i+' with: ',e);
                    }
                });
                localStorage[property] = JSON.stringify(tempLostArenaIds);
            }
        }
        remoteStorage[property] = localStorage[property];
        console.log('Merge remote storage succeed. Total of ' + nbMerge + ' remote storage',remoteStorage);
    } catch (e) {
        console.error('Error in mergeRemoteAndLocal ' + property + ' : ',e);
    }
}

function syncRemoteAjax() {
    if (!localStorage.hasOwnProperty('cabf_syncRemoteKey')) {
        item.set('syncRemoteKey','https://api.myjson.com/bins/xxxxx');
    }
    window.clearTimeout(SyncDataTimer);
    SyncDataTimer = window.setTimeout(syncDataAjax, 2000);
    var key = JSON.parse(localStorage.cabf_syncRemoteKey);
    if (!key || key === null || key === "") {
        console.log('Sync key not set.');
    } else {
        var requestGET = $.ajax({
            url : key,
            type : "GET",
            contentType : "application/json; charset=utf-8",
            dataType : "json",
            beforeSend : function () {
                addLoadingImg('globalContainer');
                $('div[class="spinner"]').html($('div[class="spinner"]').html() + 'Synchronizing');
            },
            success : function (remoteStorage, textStatus, jqXHR) {
                mergeRemoteAndLocal(remoteStorage, 'cabf_LostArenaIds');
                mergeRemoteAndLocal(remoteStorage, 'cabf_FarmArenaIds');
                mergeRemoteAndLocal(remoteStorage, 'cabf_LostIds');
                mergeRemoteAndLocal(remoteStorage, 'cabf_farmids');
                mergeRemoteAndLocal(remoteStorage, 'cabf_guildIDs');					
                try {
                    var requestPUT = $.ajax({
                        url : key,
                        type : "PUT",
                        data : JSON.stringify(remoteStorage),
                        contentType : "application/json; charset=utf-8",
                        dataType : "json",
                        success : function (data, textStatus, jqXHR) {
                            console.log('Sync success in saving remote storage : ', textStatus, data);
                            spinner.stop();
                        },
                        error : function (jqXHR, textStatus, errorThrown) {
                            console.log('Sync remote storage PUT: ' + textStatus, errorThrown);
                            spinner.stop();
                        }
                    });
                    requestPUT.onreadystatechange = null;
                    requestPUT.abort = null;
                    requestPUT = null;
                } catch (ePUT) {
                    console.error(ePUT);
                    spinner.stop();
                }
                nbMerge = null;
                tempLostArenaIds = null;
            },
            error : function (jqXHR, textStatus, errorThrown) {
                console.log('Sync remote storage GET: ' + textStatus, errorThrown);
                spinner.stop();
            }
        });
        requestGET.onreadystatechange = null;
        requestGET.abort = null;
        requestGET = null;
    }
}

function syncDataAjax() {
    //item.set('syncKey','https://api.myjson.com/bins/xxxxx');
    /*if (!localStorage.hasOwnProperty('cabf_syncKey') {
    item.set('syncKey','https://api.myjson.com/bins/xxxxx');
    }*/
    /*if (!localStorage.hasOwnProperty('cabf_stats') {
    item.set('stats',defaultStats);
    }*/
    window.clearTimeout(SyncDataTimer);
    var key = JSON.parse(localStorage.cabf_syncKey);
    if (!key || key === null || key === "") {
        console.log('Sync key not set.');
    } else {
        var requestGET = $.ajax({
            url : key,
            type : "GET",
            contentType : "application/json; charset=utf-8",
            dataType : "json",
            beforeSend : function () {
                addLoadingImg('globalContainer');
                //console.log('spinner', spinner);
                $('div[class="spinner"]').html($('div[class="spinner"]').html() + 'Synchronizing');
            },
            success : function (statsToMerge, textStatus, jqXHR) {
                if (statsToMerge.targets) {
                    var statsLocal = JSON.parse(localStorage.cabf_stats);
                    var arrayTargets = statsLocal.targets;
                    var nbMerge = 0;
                    for (var i = 0; i < statsToMerge.targets.length; i++) {
                        var target_id = statsToMerge.targets[i].target_id;
                        var indexTarget = getTargetIndex(arrayTargets, target_id);
                        if (indexTarget < 0) {
                            var newTarget = {
                                "target_id" : target_id,
                                "victory" : statsToMerge.targets[i].victory,
                                "defeat" : statsToMerge.targets[i].defeat
                            };
                            statsLocal.targets.push(newTarget);
                            nbMerge++;
                            newTarget = null;
                        } else {
                            if ((statsLocal.targets[indexTarget].victor + statsLocal.targets[indexTarget].defeat) < (statsToMerge.targets[i].victory + statsToMerge.targets[i].defeat)) {
                                statsLocal.targets[indexTarget].victory = statsToMerge.targets[i].victory;
                                statsLocal.targets[indexTarget].defeat = statsToMerge.targets[i].defeat;
                                nbMerge++;
                            }
                        }
                    }
                    localStorage.cabf_stats = JSON.stringify(statsLocal);
                    console.log('Merge Sync Data succeed. Total of ' + nbMerge + ' Data');
                    try {
                        var requestPUT = $.ajax({
                            url : key,
                            type : "PUT",
                            data : JSON.stringify(statsLocal),
                            contentType : "application/json; charset=utf-8",
                            dataType : "json",
                            success : function (data, textStatus, jqXHR) {
                                console.log('Sync success in saving data : ', textStatus, data);
                                spinner.stop();
                            },
                            error : function (jqXHR, textStatus, errorThrown) {
                                console.log('Sync PUT: ' + textStatus, errorThrown);
                                spinner.stop();
                            }
                        });
                        requestPUT.onreadystatechange = null;
                        requestPUT.abort = null;
                        requestPUT = null;
                    } catch (ePUT) {
                        console.error(ePUT);
                        spinner.stop();
                    }
                    statsToMerge = null;
                    statsLocal = null;
                    arrayTargets = null;
                }
            },
            error : function (jqXHR, textStatus, errorThrown) {
                console.log('Sync GET: ' + textStatus, errorThrown);
                spinner.stop();
            }
        });
        requestGET.onreadystatechange = null;
        requestGET.abort = null;
        requestGET = null;
    }
}

var item = {
    get : function (_name, _default) {
        if (localStorage['cabf_' + _name] !== undefined && localStorage['cabf_' + _name] !== null) {
            return JSON.parse(localStorage['cabf_' + _name]);
        } else {
            return _default;
        }
    },
    set : function (_name, _value) {
        localStorage['cabf_' + _name] = JSON.stringify(_value);
        if (_name.match('stats'))
            syncData();
    },
    del : function (_name) {
        localStorage.remove('cabf_' + _name);
    }
};

var _dialogConnect = '<div id="dialogConnect" title="Connect to CAAP">  <form><fieldset><label for="player_email">E-Mail : </label><input type="text" name="player_email" id="player_email" value="" style="width: 420px;"></fieldset><div><br></div><fieldset><label for="player_password">Password : </label><input type="password" name="player_password" id="player_password" value="" style="width: 420px;"></fieldset></form></div>';
var _dialogCraft = '<div id="dialogCraft" title="Craft Alchemy"><form><fieldset><label for="name">Select alchemy</label><select name="selectAlchemy" id="selectAlchemy"></select></fieldset></form></div>';
var _dialogIO = '<div id="dialogIO" title="Import/Export">  <textarea id="statsDg" style="margin: 2px; height: 250px; width: 600px;"></textarea></div>';
var _dialogSync = GM_getResourceText("syncDialog");
var _statBlock = '<div id="cabfHealthStatBlock"><div id="cabfStatType">Enemy</div><div><br></div><div id="cabfStatTower"><span>-</span><span>Stat</span></div><div id="cabfToggleTower"><div id="cabfTotalHealth">Total Health: 0</div><div id="cabfAverageHealth">Average Health: 0</div><div id="cabfHealthLeft">Health Left: 0</div><div id="cabfAverageHealthLeft">Average Health Left: 0</div><div id="cabfPercentageHealthLeft">Percentage Health Left: 0%</div></div><div><br></div><div id="cabfStatCleric"><span>-</span><span>Cleric Stat</span></div><div id="cabfToggleCleric"><div id="cabfClericTotalHealth">Total Health: 0</div><div id="cabfClericAverageHealth">Average Health: 0</div><div id="cabfClericHealthLeft">Health Left: 0</div><div id="cabfClericAverageHealthLeft">Average Health Left: 0</div><div id="cabfClericPercentageHealthLeft">Percentage Health Left: 0%</div></div><div><br></div><div id="cabfStatMage"><span>-</span><span>Mage Stat</span></div><div id="cabfToggleMage"><div id="cabfMageTotalHealth">Total Health: 0</div><div id="cabfMageAverageHealth">Average Health: 0</div><div id="cabfMageHealthLeft">Health Left: 0</div><div id="cabfMageAverageHealthLeft">Average Health Left: 0</div><div id="cabfMagePercentageHealthLeft">Percentage Health Left: 0%</div></div><div><br></div><div id="cabfStatRogue"><span>-</span><span>Rogue Stat</span></div><div id="cabfToggleRogue"><div id="cabfRogueTotalHealth">Total Health: 0</div><div id="cabfRogueAverageHealth">Average Health: 0</div><div id="cabfRogueHealthLeft">Health Left: 0</div><div id="cabfRogueAverageHealthLeft">Average Health Left: 0</div><div id="cabfRoguePercentageHealthLeft">Percentage Health Left: 0%</div></div><div><br></div><div id="cabfStatWarrior"><span>-</span><span>Warrior Stat</span></div><div id="cabfToggleWarrior"><div id="cabfWarriorTotalHealth">Total Health: 0</div><div id="cabfWarriorAverageHealth">Average Health: 0</div><div id="cabfWarriorHealthLeft">Health Left: 0</div><div id="cabfWarriorAverageHealthLeft">Average Health Left: 0</div><div id="cabfWarriorPercentageHealthLeft">Percentage Health Left: 0%</div></div><div><br></div><div id="cabfStatActive"><span>-</span><span>Active Stat</span></div><div id="cabfToggleActive"><div id="cabfActiveTotalHealth">Total Health: 0</div><div id="cabfActiveAverageHealth">Average Health: 0</div><div id="cabfActiveHealthLeft">Health Left: 0</div><div id="cabfActiveAverageHealthLeft">Average Health Left: 0</div><div id="cabfActivePercentageHealthLeft">Percentage Health Left: 0%</div></div><div><br></div></div>';
var _FestivalDuelBlock = '<div id="cabfFestivalDuelBlock"><div id="cabfFestivalDuelType">Festival Battle</div><div><br></div><div id="cabfFarmTarget"><span>-</span><span>Farm Targets</span></div><div><br></div><div id="cabfToggleFarm"><span class="cabfFarmTargetTitle ui-state-default"><a id="farmKeep" href="keep.php" target="_blank">Target</a> </span><select id="cabfTargetSelect" class="cabffarmfargettitle"></select></div><div><br></div></div>';
var _ArenaDuelBlock = GM_getResourceText("arenaBoard");
var _NormalDuelBlock = '<div id="cabfNormalDuelBlock"><div id="cabfNormalDuelType">Battle</div><div><br></div><div id="cabfCollapseNormal"><span>-</span><span>Farm Targets</span></div><div><br></div><div id="cabfToggleNormal"></div><div><br></div></div>';
var _QuestDuelBlock = '<div id="cabfQuestBlock"><div id="cabfQuestDuelType">Quests</div><div><br></div><div id="cabfCollapseQuest"><span>-</span><span>Farm Quest</span></div><div><br></div><div id="cabfToggleQuest"></div><div><br></div></div>';
var _essenceBlock = '<div id="cabfEssenceBlock"><div id="cabfEssenceTilte">Essences</div><div><br></div><div id="cabfDamageStorage"><span>-</span><span>Damage Storage</span></div><div id="cabfToggleDamageStorage"></div><div><br></div><div id="cabfAttackStorage"><span>-</span><span>Attack Storage</span></div><div id="cabfToggleAttackStorage"></div><div><br></div><div id="cabfDefenseStorage"><span>-</span><span>Defense Storage</span></div><div id="cabfToggleDefenseStorage"></div><div><br></div><div id="cabfHealthStorage"><span>-</span><span>Health Storage</span></div><div id="cabfToggleHealthStorage"></div><div><br></div></div>';
var _rightBoard = '<div id="cabfRigthBoard"></div>';
var _leftBoard = '<div id="cabfLeftBoard"></div>';

function runEffect(idButton, idToggle) {
    var options = {},
        state;
    $(idToggle).toggle('clip', options, 500);
    state = item.get(idToggle, 'false');
    if (state === 'false') {
        item.set(idToggle, 'true');
        $(idButton + ' span:first').html('-');
    } else {
        item.set(idToggle, 'false');
        $(idButton + ' span:first').html('+');
    }
    options = null;
}

function addFestivalDuelBoard(id) {

    if ($('#cabfLeftBoard').length <= 0) {
        $(id).after(_leftBoard);
    }

    if ($('#cabfFestivalDuelBlock').length <= 0) {
        $('#cabfLeftBoard').append(_FestivalDuelBlock);
    }

    $('#cabfFarmTarget').click(function () {
        runEffect('#cabfFarmTarget', '#cabfToggleFarm');
    });

    if (item.get('#cabfToggleFarm', 'false') === 'false') {
        $('#cabfToggleFarm').css("display", "none");
        $('#cabfFarmTarget span:first').html('+');
    }
}

function addArenaDuelBoard(id) {

    if ($('#cabfLeftBoard').length <= 0) {
        $(id).after(_leftBoard);
    }

    if ($('#cabfArenaDuelBlock').length <= 0) {
        $('#cabfLeftBoard').append(_ArenaDuelBlock);
    }

    $('#cabfFarmTarget').click(function () {
        runEffect('#cabfFarmTarget', '#cabfToggleFarm');
    });

    if (item.get('#cabfToggleFarm', 'false') === 'false') {
        $('#cabfToggleFarm').css("display", "none");
        $('#cabfFarmTarget span:first').html('+');
    }

    $('#cabfLoopConfig').click(function () {
        runEffect('#cabfLoopConfig', '#cabfToggleLoop');
    });

    if (item.get('#cabfToggleLoop', 'false') === 'false') {
        $('#cabfToggleLoop').css("display", "none");
        $('#cabfLoopConfig span:first').html('+');
    }
}

function addNormalDuelBoard(id) {

    if ($('#cabfLeftBoard').length <= 0) {
        $(id).after(_leftBoard);
    }

    if ($('#cabfNormalDuelBlock').length <= 0) {
        $('#cabfLeftBoard').append(_NormalDuelBlock);
    }

    $('#cabfCollapseNormal').click(function () {
        runEffect('#cabfCollapseNormal', '#cabfToggleNormal');
    });
    if (item.get('#cabfToggleNormal', 'false') === 'false') {
        $('#cabfToggleNormal').css("display", "none");
        $('#cabfCollapseNormal span:first').html('+');
    }
}

function addQuestDuelBoard(id) {

    if ($('#cabfLeftBoard').length <= 0) {
        $(id).after(_leftBoard);
    }

    if ($('#cabfQuestBlock').length <= 0) {
        $('#cabfLeftBoard').append(_QuestDuelBlock);
    }

    $('#cabfCollapseQuest').click(function () {
        runEffect('#cabfCollapseQuest', '#cabfToggleQuest');
    });
    if (item.get('#cabfToggleQuest', 'false') === 'false') {
        $('#cabfToggleQuest').css("display", "none");
        $('#cabfCollapseQuest span:first').html('+');
    }
}

function addStatBoard(id) {

    if ($('#cabfLeftBoard').length <= 0) {
        $(id).after(_leftBoard);
    }

    if ($('#cabfHealthStatBlock').length <= 0) {
        $('#cabfLeftBoard').append(_statBlock);
    }

    $('#cabfStatTower').click(function () {
        runEffect('#cabfStatTower', '#cabfToggleTower');
    });
    $('#cabfStatCleric').click(function () {
        runEffect('#cabfStatCleric', '#cabfToggleCleric');
    });
    $('#cabfStatMage').click(function () {
        runEffect('#cabfStatMage', '#cabfToggleMage');
    });
    $('#cabfStatRogue').click(function () {
        runEffect('#cabfStatRogue', '#cabfToggleRogue');
    });
    $('#cabfStatWarrior').click(function () {
        runEffect('#cabfStatWarrior', '#cabfToggleWarrior');
    });
    $('#cabfStatActive').click(function () {
        runEffect('#cabfStatActive', '#cabfToggleActive');
    });
    if (item.get('#cabfToggleTower', 'false') === 'false') {
        $('#cabfToggleTower').css("display", "none");
        $('#cabfStatTower span:first').html('+');
    }
    if (item.get('#cabfToggleCleric', 'false') === 'false') {
        $('#cabfToggleCleric').css("display", "none");
        $('#cabfStatCleric span:first').html('+');
    }
    if (item.get('#cabfToggleMage', 'false') === 'false') {
        $('#cabfToggleMage').css("display", "none");
        $('#cabfStatMage span:first').html('+');
    }
    if (item.get('#cabfToggleRogue', 'false') === 'false') {
        $('#cabfToggleRogue').css("display", "none");
        $('#cabfStatRogue span:first').html('+');
    }
    if (item.get('#cabfToggleWarrior', 'false') === 'false') {
        $('#cabfToggleWarrior').css("display", "none");
        $('#cabfStatWarrior span:first').html('+');
    }
    if (item.get('#cabfToggleActive', 'false') === 'false') {
        $('#cabfToggleActive').css("display", "none");
        $('#cabfStatActive span:first').html('+');
    }
}

function addEssenceBoard(id) {

    if ($('#cabfRigthBoard').length <= 0) {
        $(id).append(_rightBoard);
    }

    if ($('#cabfEssenceBlock').length <= 0) {
        $('#cabfRigthBoard').append(_essenceBlock);

        $('#cabfDamageStorage').click(function () {
            runEffect('#cabfDamageStorage', '#cabfToggleDamageStorage');
        });
        $('#cabfAttackStorage').click(function () {
            runEffect('#cabfAttackStorage', '#cabfToggleAttackStorage');
        });
        $('#cabfDefenseStorage').click(function () {
            runEffect('#cabfDefenseStorage', '#cabfToggleDefenseStorage');
        });
        $('#cabfHealthStorage').click(function () {
            runEffect('#cabfHealthStorage', '#cabfToggleHealthStorage');
        });
    }

    $('#cabfToggleDamageStorage').html(item.get('listDamageStorage', ''));
    $('#cabfToggleAttackStorage').html(item.get('listAttackStorage', ''));
    $('#cabfToggleDefenseStorage').html(item.get('listDefenseStorage', ''));
    $('#cabfToggleHealthStorage').html(item.get('listHealthStorage', ''));

    if (item.get('#cabfToggleDamageStorage', 'false') === 'false') {
        $('#cabfToggleDamageStorage').css("display", "none");
        $('#cabfDamageStorage span:first').html('+');
    }
    if (item.get('#cabfToggleAttackStorage', 'false') === 'false') {
        $('#cabfToggleAttackStorage').css("display", "none");
        $('#cabfAttackStorage span:first').html('+');
    }
    if (item.get('#cabfToggleDefenseStorage', 'false') === 'false') {
        $('#cabfToggleDefenseStorage').css("display", "none");
        $('#cabfDefenseStorage span:first').html('+');
    }
    if (item.get('#cabfToggleHealthStorage', 'false') === 'false') {
        $('#cabfToggleHealthStorage').css("display", "none");
        $('#cabfHealthStorage span:first').html('+');
    }
}

function addCss(cssString) {
    try {
        var head = document.getElementsByTagName('head')[0];
        //return unless head;
        if (head) {
            var newCss = document.createElement('style');
            newCss.type = "text/css";
            newCss.innerHTML = cssString;
            head.appendChild(newCss);
            newCss = null;
        }
        head = null;
    } catch (e) {
        console.error("Error in addCss", e);
    }
}

function cabf_error(event) {
    console.log("cabf_error");
}

function cabf_success(event) {
    console.log("cabf_success");
}

var filterGate = function () {};

/*******************************************************************************************************************************************************************************
 ********************************************************************************************************************************************************************************
 *************    MIST BATTLE ***************************************************************************************************************************************************
 ********************************************************************************************************************************************************************************
 *******************************************************************************************************************************************************************************/
function cabf_conquestmistfilter() {

    try {
        var _defenderHealth = 0,
            _actions = parseInt(/\d+/.exec($('#app_body div:contains("ACTIONS LEFT:"):last').text()), 10);
        // Saved filter settings
        var _storedClass = item.get('cabfPageConquestBattleClass', 'All');
        var _storedStatus = item.get('cabfPageConquestBattleStatus', 'All');
        var _storedPoints = item.get('cabfPageConquestBattlePoints', 'All');

        $('#your_guild_member_list_1 > div[style!="clear:both;"]').each(function (_i, _e) {
            var _text = $(_e).text().trim(),
                _health,
                _maxHealth,
                _fullhealth,
                winStat = '';

            // enemy full health
            _health = /(\d+)\//.exec(_text)[1];
            _maxHealth = /\/(\d+)/.exec(_text)[1];
            if ((_maxHealth - _health) === 0) {
                _fullhealth = true;
            } else {
                _fullhealth = false;
            }
            _defenderHealth += parseInt(/(\d+)(?:\/)/.exec($(this).text())[1], 10);
            $(_e, 'div > div').append('<div style="clear:both;"></div>');
            if ($('input[name="target_id"]', _e).length > 0) {
                var target_id = $('input[name="target_id"]', _e).attr("value");
                winStat = getTargetStat(target_id);
                addTargetTip(_e);
            }
            if (_fullhealth) {
                $(_e, 'div > div').append('<span class="GuildNumG">' + (_i + 1) + '</span>' + '<br>' + winStat);
            } else {
                $(_e, 'div > div').append('<span class="GuildNumR">' + (_i + 1) + '</span>' + '<br>' + winStat);
            }

        });
        if (_defenderHealth > 0) {
            $('#app_body div[style*="/graphics/war_art"]:last').prepend('<div id="cabfHealthAction">Health/Action: ' + (_defenderHealth / _actions).toFixed(0) + '</div>');
        }
        // gate filter
        filterGate = function () {
            var _count = 0;
            var _myLevel = $('a[href*="keep.php"] > div[style="color:#ffffff"]').text().match(/\d+/);
            var myLevel = Number(_myLevel[0]);
            $('#your_guild_member_list_1 > div[style!="clear:both;"]').each(function (_i, _e) {
                var _class = new RegExp($('#cabfGateClassFilter').val());
                var _state = new RegExp($('#cabfGateStatusFilter').val());
                var _points = $('#cabfGatePointsFilter').val();
                var _text = $(_e).text().trim(),
                    _health,
                    _maxHealth,
                    _fullhealth,
                    _eClass;

                // enemy class
                _eClass = $(_e).find('img[title="Cleric"], img[title="Mage"], img[title="Warrior"], img[title="Rogue"]').attr("title");

                // enemy full health
                _health = /(\d+)\//.exec(_text)[1];
                _maxHealth = /\/(\d+)/.exec(_text)[1];
                if ((_maxHealth - _health) === 0) {
                    _fullhealth = true;
                } else {
                    _fullhealth = false;
                }

                if (_class.test(_eClass) && (_state.test(_text) || (_state.test('FullHealth') && _fullhealth))) {
                    if (_points !== 'All') {
                        if (/Level:\ \d+/.test(_text)) {
                            var targetLevel = parseInt(/(?:Level:\ )(\d+)/g.exec(_text)[1]);
                            var _showTarget = false;
                            switch (_points) {
                                case '50':
                                    if (targetLevel > 900) {
                                        _showTarget = true;
                                    }
                                    break;
                                case '40':
                                    if ((targetLevel > 600) && (targetLevel <= 900)) {
                                        _showTarget = true;
                                    }
                                    break;
                                case '30':
                                    if ((targetLevel > 300) && (targetLevel <= 600)) {
                                        _showTarget = true;
                                    }
                                    break;
                                case '20':
                                    if ((targetLevel > 100) && (targetLevel <= 300)) {
                                        _showTarget = true;
                                    }
                                    break;
                                case '10':
                                    if (targetLevel <= 100) {
                                        _showTarget = true;
                                    }
                                    break;
                                default:
                                    _showTarget = true;
                            }
                            if (_showTarget) {
                                $(_e).show();
                                _count += 1;
                            } else {
                                $(_e).hide();
                            }
                        } else {
                            console.log('Error in points filter!');
                            $(_e).show();
                            _count += 1;
                        }
                    } else {
                        $(_e).show();
                        _count += 1;
                    }
                } else {
                    $(_e).hide();
                }
            });
            $('#app_body div[id="cabfHealthAction"]:last').html($('#app_body div[id="cabfHealthAction"]:last').html().replace(/.*Health\/Action:/, 'Health/Action:').replace('Health/Action:', 'Filtered: ' + _count + '<br/>Health/Action:'));
        };

        // class filter
        var filterClass = {
            'All' : '\.',
            'Cleric' : 'Cleric',
            'Mage' : 'Mage',
            'Rogue' : 'Rogue',
            'Warrior' : 'Warrior'
        },
            filterStatus = {
                'All' : '\.',
                'Full health' : 'FullHealth',
                'Got health' : '[^0]\/',
                'Healthy' : 'Healthy',
                'Good' : 'Good',
                'Fair' : 'Fair',
                'Weakened' : 'Weakened',
                'Stunned' : 'Stunned'
            },
            filterPoints = {
                'All' : 'All',
                '50' : '50',
                '40' : '40',
                '30' : '30',
                '20' : '20',
                '10' : '10'
            };
        $('body > ul.ui-selectmenu-menu').remove();

        $('div[style*="/graphics/conq2_insideland_battle_mid.jpg"]').after('<div id="cabfConquestBattleFilterContainer"><div id="cabfConquestBattleFilter" class="ui-state-default"></div></div>');
        var _cCBF = $('#cabfConquestBattleFilter');
        // Battle activity points filter
        _cCBF.prepend('<span class="cabfGateFilterTitle ui-state-default"> Points </span><select id="cabfGatePointsFilter" class="cabfgatefiltertitle">');
        _sel = $('#cabfGatePointsFilter');
        $.each(filterPoints, function (_i, _e) {
            _sel.append('<option value="' + _e + '" ' + (_storedPoints == _i ? 'selected = "selected"' : '') + ' >' + _i + '</option>');
        });
        _sel.change(function () {
            _storedPoints = $(this).find("option:selected").text();
            item.set('cabfPageConquestBattlePoints', _storedPoints);
            filterGate();
        });
        // status filter
        _cCBF.prepend('<span class="cabfGateFilterTitle ui-state-default"> Status </span><select id="cabfGateStatusFilter" class="cabfgatefiltertitle">');
        _sel = $('#cabfGateStatusFilter');
        $.each(filterStatus, function (_i, _e) {
            _sel.append('<option value="' + _e + '" ' + (_storedStatus == _i ? 'selected = "selected"' : '') + ' >' + _i + '</option>');
        });
        _sel.change(function () {
            _storedStatus = $(this).find("option:selected").text();
            item.set('cabfPageConquestBattleStatus', _storedStatus);
            filterGate();
        });
        // Class filter
        _cCBF.prepend('<span class="cabfGateFilterTitle ui-state-default"> Class </span><select id="cabfGateClassFilter" class="cabfgatefiltertitle">');
        _sel = $('#cabfGateClassFilter');
        $.each(filterClass, function (_i, _e) {
            _sel.append('<option value="' + _e + '" ' + (_storedClass == _i ? 'selected = "selected"' : '') + ' >' + _i + '</option>');
        });
        _sel.change(function () {
            _storedClass = $(this).find("option:selected").text();
            item.set('cabfPageConquestBattleClass', _storedClass);
            filterGate();
        });
        // Clear filters
        _cCBF.prepend($('<button>Clear filters</button>').button().css({
            'position' : 'relative !important',
            'left' : 9,
            'top' : 3,
            'fontSize' : 12,
            'height' : 25,
            'borderRadius' : 0,
            'float' : 'left'
        }).click(function () {
            $('span.ui-selectmenu-status').text('All');
            $('#cabfGateClassFilter, #cabfGateStatusFilter, #cabfGatePointsFilter').val('All');
            _storedClass = _storedStatus = _storedPoints = 'All';
            item.set('cabfPageConquestBattleClass', 'All');
            item.set('cabfPageConquestBattleStatus', 'All');
            item.set('cabfPageConquestBattlePoints', 'All');
            filterGate();
        }));
        window.setTimeout(function () {
            filterGate();
        }, 10);
    } catch (e) {
        console.error("Error in cabf_conquestmistfilter", e);
    }

}

/*******************************************************************************************************************************************************************************
 ********************************************************************************************************************************************************************************
 *************    EARTH BATTLE **************************************************************************************************************************************************
 ********************************************************************************************************************************************************************************
 *******************************************************************************************************************************************************************************/
function cabf_conquestearthfilter() {

    try {
        window.setTimeout(function () {
            // Saved filter settings
            var _storedClass = item.get('cabfPageConquestBattleClass', 'All');
            var _storedStatus = item.get('cabfPageConquestBattleStatus', 'All');
            var _storedPoints = item.get('cabfPageConquestBattlePoints', 'All');

            //var     _tower = parseInt(/\d+/.exec($('div[class="tower_tab"][style*="display:block"]').attr("id")), 10);
            var _towers = {
                1 : "Attack Tower",
                2 : "Defense Tower",
                3 : "Damage Tower",
                4 : "Health Tower"
            };
            var _tower = 1;
            var _burnEarthToken = item.get('cabfBurnEarthToken', false);
            if ($("#cabfHealthActionEarth").length > 0) {
                $("#cabfHealthActionEarth").show();
            } else {
                $('#conquest_report').after('<div id="cabfHealthActionEarth"><div>Attack Tower</div><div id="cabfEarthFiltered1">Filtered: 0</div><div id="cabfEarthAction1">Health/Action: 0</div><div><br></div><div>Defense Tower</div><div id="cabfEarthFiltered2">Filtered: 0</div><div id="cabfEarthAction2">Health/Action: 0</div><div><br></div><div>Damage Tower</div><div id="cabfEarthFiltered3">Filtered: 0</div><div id="cabfEarthAction3">Health/Action: 0</div><div><br></div><div>Health Tower</div><div id="cabfEarthFiltered4">Filtered: 0</div><div id="cabfEarthAction4">Health/Action: 0</div><div>__________</div><div>Burn Token : <input type="checkbox" id="burnearthtoken" ></div></div>');
            }
            $('#burnearthtoken').on('change', function () {
                item.set('cabfBurnEarthToken', $(this).is(":checked"));
                _burnEarthToken = $(this).is(":checked");
            });
            $('#burnearthtoken').prop('checked', _burnEarthToken);

            // update Stat Gate
            function updateStatGate() {
                for (var _x in _towers) {
                    console.log("_tower", _x);

                    var _defenderHealth = 0,
                        _actions = parseInt(/\d+/.exec($('#app_body div[id="actions_left_' + _x + '"]:contains("ACTIONS LEFT:"):last').text()), 10);

                    console.log("_actions", _actions);
                    if ($('#tower_' + _x + ' > #crystal_' + _x).length > 0) {
                        _defenderHealth = 0;
                    } else if (_actions <= 0) {
                        _defenderHealth = 0;
                    } else {
                        var _nb = 0;
                        $('#tower_' + _x + ' > div > div').each(function (_i, _e) {
                            var _text = $(_e).text().trim(),
                                _health,
                                _maxHealth,
                                _fullhealth,
                                winStat = '';
                            if (_text) {
                                _nb++;
                                // enemy full health
                                _health = /(\d+)\//.exec(_text)[1];
                                _maxHealth = /\/(\d+)/.exec(_text)[1];
                                if ((_maxHealth - _health) === 0) {
                                    _fullhealth = true;
                                } else {
                                    _fullhealth = false;
                                }
                                _defenderHealth += parseInt(/(\d+)(?:\/)/.exec($(this).text())[1], 10);
                                $(_e, 'div > div').append('<div style="clear:both;"></div>');
                                if ($('input[name="target_id"]', _e).length > 0) {
                                    var target_id = $('input[name="target_id"]', _e).attr("value");
                                    winStat = getTargetStat(target_id);
                                    addTargetTip(_e);
                                    target_id = null;
                                }
                                if (_fullhealth) {
                                    $(_e, 'div > div').append('<span class="GuildNumG">' + _nb + '</span>' + '<br>' + winStat);
                                } else {
                                    $(_e, 'div > div').append('<span class="GuildNumR">' + _nb + '</span>' + '<br>' + winStat);
                                }
                            }
                            _text = null;
                            _health = null;
                            _maxHealth = null;
                            winStat = null;
                        });
                    }
                    if (_actions > 0) {
                        $('#cabfEarthAction' + _x).html('Health/Action: ' + (_defenderHealth / _actions).toFixed(0));
                    } else {
                        $('#cabfEarthAction' + _x).html('Health/Action: #');
                    }
                    _actions = null;
                }
            }
            // gate filter
            filterGate = function () {
                var _myLevel = $('a[href*="keep.php"] > div[style="color:#ffffff"]').text().match(/\d+/);
                var myLevel = Number(_myLevel[0]);
                for (var _x in _towers) {
                    console.log("filterGate _tower", _x);
                    var _count = 0;
                    if ($('#tower_' + _x + ' > #crystal_' + _x).length > 0) {
                        _count = 0;
                    } else {
                        $('#tower_' + _x + ' > div > div').each(function (_i, _e) {
                            var _class = new RegExp($('#cabfGateClassFilter').val());
                            var _state = new RegExp($('#cabfGateStatusFilter').val());
                            var _points = $('#cabfGatePointsFilter').val();
                            var _text = $(_e).text().trim(),
                                _health,
                                _maxHealth,
                                _fullhealth,
                                _eClass;

                            // enemy class
                            _eClass = $(_e).find('img[title="Cleric"], img[title="Mage"], img[title="Warrior"], img[title="Rogue"]').attr("title");
                            if (!_eClass)
                                return;
                            // enemy full health
                            _health = /(\d+)\//.exec(_text)[1];
                            _maxHealth = /\/(\d+)/.exec(_text)[1];
                            if ((_maxHealth - _health) === 0) {
                                _fullhealth = true;
                            } else {
                                _fullhealth = false;
                            }

                            if (_class.test(_eClass) && (_state.test(_text) || (_state.test('FullHealth') && _fullhealth))) {
                                if (_points !== 'All') {
                                    if (/Level:\ \d+/.test(_text)) {
                                        var targetLevel = parseInt(/(?:Level:\ )(\d+)/g.exec(_text)[1]);
                                        var _showTarget = false;
                                        switch (_points) {
                                            case '50':
                                                if (targetLevel > 900) {
                                                    _showTarget = true;
                                                }
                                                break;
                                            case '40':
                                                if ((targetLevel > 600) && (targetLevel <= 900)) {
                                                    _showTarget = true;
                                                }
                                                break;
                                            case '30':
                                                if ((targetLevel > 300) && (targetLevel <= 600)) {
                                                    _showTarget = true;
                                                }
                                                break;
                                            case '20':
                                                if ((targetLevel > 100) && (targetLevel <= 300)) {
                                                    _showTarget = true;
                                                }
                                                break;
                                            case '10':
                                                if (targetLevel <= 100) {
                                                    _showTarget = true;
                                                }
                                                break;
                                            default:
                                                _showTarget = true;
                                        }
                                        if (_showTarget) {
                                            $(_e).show();
                                            _count += 1;
                                        } else {
                                            $(_e).hide();
                                        }
                                        targetLevel = null;
                                    } else {
                                        console.log('Error in points filter!');
                                        $(_e).show();
                                        _count += 1;
                                    }
                                } else {
                                    $(_e).show();
                                    _count += 1;
                                }
                            } else {
                                $(_e).hide();
                            }
                            _class = null;
                            _state = null;
                            _points = null;
                            _text = null;
                            _eClass = null;
                            _health = null;
                            _maxHealth = null;
                        });
                    }
                    $('#cabfEarthFiltered' + _x).html('Filtered: ' + _count);
                    //$('#app_body div[id="cabfHealthActionEarth"]:last').html($('#app_body div[id="cabfHealthActionEarth"]:last').html().replace(/.*Health\/Action:/, 'Health/Action:').replace('Health/Action:', 'Filtered: ' + _count + '<br/>Health/Action:'));
                }
                _myLevel = null;
                myLevel = null;
            };

            // class filter
            var filterClass = {
                'All' : '\.',
                'Cleric' : 'Cleric',
                'Mage' : 'Mage',
                'Rogue' : 'Rogue',
                'Warrior' : 'Warrior'
            },
                filterStatus = {
                    'All' : '\.',
                    'Full health' : 'FullHealth',
                    'Got health' : '[^0]\/',
                    'Healthy' : 'Healthy',
                    'Good' : 'Good',
                    'Fair' : 'Fair',
                    'Weakened' : 'Weakened',
                    'Stunned' : 'Stunned'
                },
                filterPoints = {
                    'All' : 'All',
                    '50' : '50',
                    '40' : '40',
                    '30' : '30',
                    '20' : '20',
                    '10' : '10'
                };
            $('body > ul.ui-selectmenu-menu').remove();

            if ($("#cabfConquestEarthFilterContainer").length > 0) {
                $("#cabfConquestEarthFilterContainer").show();
            } else {
                $('#conquest_report').after('<div id="cabfConquestEarthFilterContainer"><div id="cabfConquestEarthFilter" class="ui-state-default"></div></div>');
                var _cCBF = $('#cabfConquestEarthFilter');
                // Battle activity points filter
                _cCBF.prepend('<span class="cabfGateFilterTitle ui-state-default"> Points </span><select id="cabfGatePointsFilter" class="cabfgatefiltertitle">');
                _sel = $('#cabfGatePointsFilter');
                $.each(filterPoints, function (_i, _e) {
                    _sel.append('<option value="' + _e + '" ' + (_storedPoints == _i ? 'selected = "selected"' : '') + ' >' + _i + '</option>');
                });
                _sel.change(function () {
                    _storedPoints = $(this).find("option:selected").text();
                    item.set('cabfPageConquestBattlePoints', _storedPoints);
                    filterGate();
                });
                // status filter
                _cCBF.prepend('<span class="cabfGateFilterTitle ui-state-default"> Status </span><select id="cabfGateStatusFilter" class="cabfgatefiltertitle">');
                _sel = $('#cabfGateStatusFilter');
                $.each(filterStatus, function (_i, _e) {
                    _sel.append('<option value="' + _e + '" ' + (_storedStatus == _i ? 'selected = "selected"' : '') + ' >' + _i + '</option>');
                });
                _sel.change(function () {
                    _storedStatus = $(this).find("option:selected").text();
                    item.set('cabfPageConquestBattleStatus', _storedStatus);
                    filterGate();
                });
                // Class filter
                _cCBF.prepend('<span class="cabfGateFilterTitle ui-state-default"> Class </span><select id="cabfGateClassFilter" class="cabfgatefiltertitle">');
                _sel = $('#cabfGateClassFilter');
                $.each(filterClass, function (_i, _e) {
                    _sel.append('<option value="' + _e + '" ' + (_storedClass == _i ? 'selected = "selected"' : '') + ' >' + _i + '</option>');
                });
                _sel.change(function () {
                    _storedClass = $(this).find("option:selected").text();
                    item.set('cabfPageConquestBattleClass', _storedClass);
                    filterGate();
                });
                // Clear filters
                _cCBF.prepend($('<button>Clear filters</button>').button().css({
                    'position' : 'relative !important',
                    'left' : 9,
                    'top' : 3,
                    'fontSize' : 12,
                    'height' : 25,
                    'borderRadius' : 0,
                    'float' : 'left'
                }).click(function () {
                    $('span.ui-selectmenu-status').text('All');
                    $('#cabfGateClassFilter, #cabfGateStatusFilter, #cabfGatePointsFilter').val('All');
                    _storedClass = _storedStatus = _storedPoints = 'All';
                    item.set('cabfPageConquestBattleClass', 'All');
                    item.set('cabfPageConquestBattleStatus', 'All');
                    item.set('cabfPageConquestBattlePoints', 'All');
                    filterGate();
                }));
            }
            if (_burnEarthToken) {
                var _e = $('#results_main_wrapper');
                if (_e.length > 0) {
                    var _credits = /GUARDIAN\ PATH\ CREDIT:\ YES/.exec(_e.text());
                    if (_credits !== null) {
                        var _eButton = $(_e).find('input[src*="war_healagainbtn"], input[src*="war_duelagainbtn2"]');
                        if (_eButton.length > 0) {
                            window.setTimeout(function () {
                                _eButton.click();
                            }, 1000);
                        } else {
                            updateStatGate();
                            filterGate();
                        }
                    } else {
                        updateStatGate();
                        filterGate();
                    }
                } else {
                    updateStatGate();
                    filterGate();
                }
            } else {
                updateStatGate();
                filterGate();
            }
        }, 10);
    } catch (e) {
        console.error("Error in cabf_conquestearthfilter", e);
    }
}

/*******************************************************************************************************************************************************************************
 ********************************************************************************************************************************************************************************
 *************    GUILD BATTLE **************************************************************************************************************************************************
 ********************************************************************************************************************************************************************************
 *******************************************************************************************************************************************************************************/
function cabf_guildbattlefilter() {
    // fix gate reseting when attacking with duel button
    var _gate = /\d/.exec($('#enemy_guild_battle_section_battle_list, #your_guild_battle_section_battle_list').attr('class'));
    $('#results_main_wrapper form, #enemy_new_guild_member_list form, #your_new_guild_member_list form').append('<input type="hidden" name="sel_pos" value="' + _gate + '">');

    // add percentage to health bars
    var _your = (1 - ($('div[style*="/guild_battle_bar_you.gif"]').width() / $('div[style*="/guild_battle_bar_you.gif"]').parent().width())) * 100;
    var _enemy = (1 - ($('div[style*="/guild_battle_bar_enemy.gif"]').width() / $('div[style*="/guild_battle_bar_enemy.gif"]').parent().width())) * 100;
    var $_your = $('span:contains("YOUR GUILD")');
    var $_enemy = $('span:contains("ENEMY\'S GUILD")');
    $_your.html($_your.html() + ' (' + _your.toFixed(1) + '%)');
    $_enemy.html($_enemy.html() + ' (' + _enemy.toFixed(1) + '%)');

    // enemys health added to its name in results
    $_enemy = $('span.result_body div[style*="width: 285px;"]:last');
    if ($_enemy.length > 0) {
        var _target = $('span.result_body input[name="target_id"]').attr('value');
        var _health = /Health:\s*(\d+)\/\d+/.exec($('#enemy_new_guild_member_list > div > div:has(a[uid="' + _target + '"]):first').text());
        if (_health !== null) {
            $_enemy.html($_enemy.html() + ' (' + _health[1] + ')');
        }
        // Clear var
        _target = '';
        _health = '';
    }

    // resize top image
    $('input[value="enter_battle"]').parents('form:first').css({
        'position' : 'relative'
    });
    $('#guild_battle_banner_section').find('div:contains("VICTOR")').next().next().css('marginTop', 10).end();
    $('#guild_battle_banner_section > div:eq(2)').css('marginTop', 0);
    $('div:contains("The Battle Between"):last').parent().css('marginTop', 20);
    $('input[src*="collect_reward_button2.jpg"]').parents('div:eq(2)').css('marginTop', 0);
    normalDuelStats('#guild_battle_guild_tabs');
    addStatBoard('#guild_battle_guild_tabs');

    // add current tokens to result
    var _tokens = $('div.result div:contains("-1 Battle Tokens"):last');
    _tokens.text(_tokens.text() + ' (' + $('#guild_token_current_value').text() + ' left)');

    // reduce gate size and add number
    if ($('#your_new_guild_member_list:contains("No Soldiers Posted In This Position!"), #enemy_new_guild_member_list:contains("No Soldiers Posted In This Position!")').length === 0) {
        var _guildnum = 1,
            _count = 0,
            _totalhealth = 0,
            _totalhealthleft = 0,
            _clericcount = 0,
            _clericlivecount = 0,
            _clerictotalhealth = 0,
            _clerictotalhealthleft = 0,
            _magecount = 0,
            _magelivecount = 0,
            _magetotalhealth = 0,
            _magetotalhealthleft = 0,
            _roguecount = 0,
            _roguelivecount = 0,
            _roguetotalhealth = 0,
            _roguetotalhealthleft = 0,
            _warriorcount = 0,
            _warriorlivecount = 0,
            _warriortotalhealth = 0,
            _warriortotalhealthleft = 0,
            _activecount = 0,
            _activelivecount = 0,
            _activetotalhealth = 0,
            _activetotalhealthleft = 0;
        var _gateNum = $('#enemy_guild_battle_section_battle_list, #your_guild_battle_section_battle_list').attr('class').match(/\d/)[0];
        var _gateName = '';
        if ($('#enemy_guild_battle_section_battle_list').length > 0) {
            $('#cabfStatType').html('Enemy');
        } else {
            $('#cabfStatType').html('Ally');
        }
        switch (_gateNum) {
            case '1':
                _gateName = 'North';
                break;
            case '2':
                _gateName = 'West';
                break;
            case '3':
                _gateName = 'East';
                break;
            case '4':
                _gateName = 'South';
                break;
            default:
                _gateName = ' ';
        }
        $('#cabfStatTower span:last').html(_gateName + ' Tower Stat');
        $('#cabfStatCleric span:last').html(_gateName + ' Cleric Stat');
        $('#cabfStatMage span:last').html(_gateName + ' Mage Stat');
        $('#cabfStatRogue span:last').html(_gateName + ' Rogue Stat');
        $('#cabfStatWarrior span:last').html(_gateName + ' Warrior Stat');
        $('#cabfStatActive span:last').html(_gateName + ' Active Stat');

        $('#enemy_new_guild_member_list > div > div, #your_new_guild_member_list > div > div').each(function (_i, _e) {
            var _text = $(_e).text().trim(),
                _FullHealth = true;
            if (_text && $(_e).text().trim().length > 0) {
                var _test = /(\d+)\/(\d+)/g.exec(_text);
                var _active = /Battle\ Points:\ [1-9]/g.exec(_text);
                var winStat = '';
                if ($('input[name="target_id"]', _e).length > 0) {
                    var target_id = $('input[name="target_id"]', _e).attr("value");
                    winStat = getTargetStat(target_id);
                    addTargetTip(_e);

                }
                if (_test) {
                    _FullHealth = (_test.length === 3 && _test[1] === _test[2]) ? true : false;
                    if (_FullHealth)
                        $(_e).append('<span class="GuildNumG">' + (_guildnum) + '</span>' + '<br>' + winStat);
                    else
                        $(_e).append('<span class="GuildNumR">' + (_guildnum) + '</span>' + '<br>' + winStat);
                } else {
                    $(_e).append('<span class="GuildNum">' + (_guildnum) + '</span>' + '<br>' + winStat);
                }
                _guildnum += 1;
                _count += 1;
                _totalhealth += parseInt(_test[2]);
                _totalhealthleft += parseInt(_test[1]);
                if ($(_e).find('img[src*="/graphics/class_cleric.gif"]').length > 0) {
                    _clericcount += 1;
                    _clerictotalhealth += parseInt(_test[2]);
                    if (_test[1] > 0)
                        _clericlivecount += 1;
                    _clerictotalhealthleft += parseInt(_test[1]);
                }
                if ($(_e).find('img[src*="/graphics/class_mage.gif"]').length > 0) {
                    _magecount += 1;
                    _magetotalhealth += parseInt(_test[2]);
                    if (_test[1] > 0)
                        _magelivecount += 1;
                    _magetotalhealthleft += parseInt(_test[1]);
                }
                if ($(_e).find('img[src*="/graphics/class_rogue.gif"]').length > 0) {
                    _roguecount += 1;
                    _roguetotalhealth += parseInt(_test[2]);
                    if (_test[1] > 0)
                        _roguelivecount += 1;
                    _roguetotalhealthleft += parseInt(_test[1]);
                }
                if ($(_e).find('img[src*="/graphics/class_warrior.gif"]').length > 0) {
                    _warriorcount += 1;
                    _warriortotalhealth += parseInt(_test[2]);
                    if (_test[1] > 0)
                        _warriorlivecount += 1;
                    _warriortotalhealthleft += parseInt(_test[1]);
                }
                if (_active) {
                    _activecount += 1;
                    _activetotalhealth += parseInt(_test[2]);
                    if (_test[1] > 0)
                        _activelivecount += 1;
                    _activetotalhealthleft += parseInt(_test[1]);
                }
            } else {
                $(_e).remove();
            }
            _text = '';
            //_test = null;
        });
        if (_count > 0) {
            $('#cabfTotalHealth').html('Total Health: ' + _totalhealth);
            $('#cabfAverageHealth').html('Average Health: ' + (_totalhealth / _count).toFixed());
            $('#cabfHealthLeft').html('Health Left: ' + _totalhealthleft);
            $('#cabfAverageHealthLeft').html('Average Health Left: ' + (_totalhealthleft / (_clericlivecount + _magelivecount + _roguelivecount + _warriorlivecount)).toFixed());
            $('#cabfPercentageHealthLeft').html('Percentage Health Left: ' + (_totalhealthleft * 100 / _totalhealth).toFixed(1) + '%');

            if (_clericcount > 0) {
                $('#cabfClericTotalHealth').html('Total Health: ' + _clerictotalhealth);
                $('#cabfClericAverageHealth').html('Average Health: ' + (_clerictotalhealth / _clericcount).toFixed());
                $('#cabfClericHealthLeft').html('Health Left: ' + _clerictotalhealthleft);
                if (_clericlivecount > 0) {
                    $('#cabfClericAverageHealthLeft').html('Average Health Left: ' + (_clerictotalhealthleft / _clericlivecount).toFixed());
                }
                $('#cabfClericPercentageHealthLeft').html('Percentage Health Left: ' + (_clerictotalhealthleft * 100 / _clerictotalhealth).toFixed(1) + '%');
            }

            if (_magecount > 0) {
                $('#cabfMageTotalHealth').html('Total Health: ' + _magetotalhealth);
                $('#cabfMageAverageHealth').html('Average Health: ' + (_magetotalhealth / _magecount).toFixed());
                $('#cabfMageHealthLeft').html('Health Left: ' + _magetotalhealthleft);
                if (_magelivecount > 0) {
                    $('#cabfMageAverageHealthLeft').html('Average Health Left: ' + (_magetotalhealthleft / _magelivecount).toFixed());
                }
                $('#cabfMagePercentageHealthLeft').html('Percentage Health Left: ' + (_magetotalhealthleft * 100 / _magetotalhealth).toFixed(1) + '%');
            }

            if (_roguecount > 0) {
                $('#cabfRogueTotalHealth').html('Total Health: ' + _roguetotalhealth);
                $('#cabfRogueAverageHealth').html('Average Health: ' + (_roguetotalhealth / _roguecount).toFixed());
                $('#cabfRogueHealthLeft').html('Health Left: ' + _roguetotalhealthleft);
                if (_roguelivecount > 0) {
                    $('#cabfRogueAverageHealthLeft').html('Average Health Left: ' + (_roguetotalhealthleft / _roguelivecount).toFixed());
                }
                $('#cabfRoguePercentageHealthLeft').html('Percentage Health Left: ' + (_roguetotalhealthleft * 100 / _roguetotalhealth).toFixed(1) + '%');
            }

            if (_warriorcount > 0) {
                $('#cabfWarriorTotalHealth').html('Total Health: ' + _warriortotalhealth);
                $('#cabfWarriorAverageHealth').html('Average Health: ' + (_warriortotalhealth / _warriorcount).toFixed());
                $('#cabfWarriorHealthLeft').html('Health Left: ' + _warriortotalhealthleft);
                if (_warriorlivecount > 0) {
                    $('#cabfWarriorAverageHealthLeft').html('Average Health Left: ' + (_warriortotalhealthleft / _warriorlivecount).toFixed());
                }
                $('#cabfWarriorPercentageHealthLeft').html('Percentage Health Left: ' + (_warriortotalhealthleft * 100 / _warriortotalhealth).toFixed(1) + '%');
            }

            if (_activecount > 0) {
                $('#cabfActiveTotalHealth').html('Total Health: ' + _activetotalhealth);
                $('#cabfActiveAverageHealth').html('Average Health: ' + (_activetotalhealth / _activecount).toFixed());
                $('#cabfActiveHealthLeft').html('Health Left: ' + _activetotalhealthleft);
                if (_activelivecount > 0) {
                    $('#cabfActiveAverageHealthLeft').html('Average Health Left: ' + (_activetotalhealthleft / _activelivecount).toFixed());
                }
                $('#cabfActivePercentageHealthLeft').html('Percentage Health Left: ' + (_activetotalhealthleft * 100 / _activetotalhealth).toFixed(1) + '%');
            }
        }
        // Clear var
        _gateNum = '';
    } else {
        var _gateNumNull = $('#enemy_guild_battle_section_battle_list, #your_guild_battle_section_battle_list').attr('class').match(/\d/)[0];
        if ($('#enemy_guild_battle_section_battle_list').length > 0) {
            $('#cabfStatType').html('Enemy');
        } else {
            $('#cabfStatType').html('Ally');
        }
        switch (_gateNumNull) {
            case '1':
                $('#cabfStatTower span:last').html('North Tower Stat');
                break;
            case '2':
                $('#cabfStatTower span:last').html('West Tower Stat');
                break;
            case '3':
                $('#cabfStatTower span:last').html('East Tower Stat');
                break;
            case '4':
                $('#cabfStatTower span:last').html('South Tower Stat');
                break;
            default:
                $('#cabfStatTower span:last').html('Stat (Tower not Found)');
        }
        // Clear var
        _gateNumNull = '';
    }

    // Saved filter settings
    var _storedClass = item.get('cabfPageGuildBattleClass', 'All');
    var _storedActivity = item.get('cabfPageGuildBattleActivity', 'All');
    var _storedStatus = item.get('cabfPageGuildBattleStatus', 'All');
    var _storedPoints = item.get('cabfPageGuildBattlePoints', 'All');

    // gate filter
    filterGate = function () {
        var _count = 0;
        var _gateNum = $('#enemy_guild_battle_section_battle_list, #your_guild_battle_section_battle_list').attr('class').match(/\d/)[0];
        var _gate = $('#enemy_new_guild_tab_' + _gateNum + ' > div, #your_new_guild_tab_' + _gateNum + ' > div');
        var _myLevel = $('a[href*="keep.php"] > div[style="color:#ffffff"]').text().match(/\d+/);
        var myLevel = Number(_myLevel[0]);
        $('#your_new_guild_member_list > div > div, #enemy_new_guild_member_list > div > div').each(function (_i, _e) {
            var _class = $('#cabfGateClassFilter').val();
            var _activ = new RegExp($('#cabfGateActivityFilter').val(), "g");
            var _state = $('#cabfGateStatusFilter').val();
            var _points = $('#cabfGatePointsFilter').val();
            var _text = $(_e).text().trim(),
                _stateTest = true;
            var _test = false;
            switch (_state) {
                case 'FullHealth':
                    _test = /(\d+)\/(\d+)/g.exec(_text);
                    _stateTest = (_test.length === 3 && _test[1] === _test[2]) ? true : false;
                    break;
                case 'GotHealth':
                    _test = /(\d+)\/(\d+)/g.exec(_text);
                    _stateTest = (_test.length === 3 && parseInt(_test[1]) !== 0) ? true : false;
                    break;
                case 'NoHealth':
                    _test = /(\d+)\/(\d+)/g.exec(_text);
                    _stateTest = (_test.length === 3 && parseInt(_test[1]) === 0) ? true : false;
                    break;
                default:
                    _test = new RegExp(_state, "g");
                    _stateTest = _test.test(_text);
            }

            var _classTest = _class === 'all' ? 1 : $(_e).find('img[src*="/graphics/class_' + _class + '.gif"]').length;
            var _pointTest = _points === 'all' ? 1 : $(_e).find('img[title="Battle Points for Victory: ' + _points + '"]').length;
            if (_classTest > 0 && _activ.test(_text) && /*_pointTest > 0 &&*/
                _stateTest === true) {
                if (_points !== 'All') {
                    if (/Level:\ \d+/.test(_text)) {
                        var targetLevel = parseInt(/(?:Level:\ )(\d+)/g.exec(_text)[1]);
                        var _showTarget = false;
                        switch (_points) {
                            case '160':
                                if (targetLevel <= myLevel * 80 / 100) {
                                    _showTarget = true;
                                }
                                break;
                            case '200':
                                if ((targetLevel > myLevel * 80 / 100) && (targetLevel <= myLevel * 120 / 100)) {
                                    _showTarget = true;
                                }
                                break;
                            case '240':
                                if (targetLevel > myLevel * 120 / 100) {
                                    _showTarget = true;
                                }
                                break;
                            default:
                                _showTarget = true;
                        }
                        if (_showTarget) {
                            $(_e).show();
                            _count += 1;
                        } else {
                            $(_e).hide();
                        }
                    } else {
                        console.log('Error in points filter!');
                        $(_e).show();
                        _count += 1;
                    }
                } else {
                    $(_e).show();
                    _count += 1;
                }
            } else {
                $(_e).hide();
            }

            // Clear var
            _class = '';
            _activ = '';
            _state = '';
            _points = '';
            _text = '';
            _classTest = '';
            _pointTest = '';
        });
        _gate.html(_gate.html().replace(/\).*/, ')').replace(')', ')<br/><span style="font-size:14px;font-weight:bold;">Filtered: ' + _count + '</span>'));
        // Clear var
        _gateNum = '';
        _gate = '';
        _myLevel = '';
        myLevel = 0;
    };

    // class filter
    var filterClass = {
        'All' : 'all',
        'Cleric' : 'cleric',
        'Mage' : 'mage',
        'Rogue' : 'rogue',
        'Warrior' : 'warrior'
    },
        filterActivity = {
            'All' : '\.',
            'Active' : 'Battle Points: [1-9]',
            'Inactive' : 'Battle Points: 0'
        },
        filterStatus = {
            'All' : '\.',
            'Full health' : 'FullHealth',
            'Got health' : 'GotHealth',
            'No health' : 'NoHealth',
            'Healthy' : 'Healthy',
            'Good' : 'Good',
            'Fair' : 'Fair',
            'Weakened' : 'Weakened',
            'Stunned' : 'Stunned'
        },
        filterPoints = {
            'All' : 'all',
            '240' : '240',
            '200' : '200',
            '160' : '160'
        };
    // Class filter
    $('body > ul.ui-selectmenu-menu').remove();
    $('#enemy_guild_battle_section_battle_list, #your_guild_battle_section_battle_list').prepend('<div id="cabf_menu" style="padding: 0 0 30px 0;" >');
    $('#cabf_menu').append($('<button>Clear filters</button>').button().css({
        'position' : 'relative !important',
        'left' : 9,
        'top' : 3,
        'float' : 'left',
        'fontSize' : 12,
        'height' : 25,
        'borderRadius' : 0
    }).click(function () {
        $('span.ui-selectmenu-status').text('All');
        $('#cabfGateClassFilter, #cabfGateActivityFilter, #cabfGateStatusFilter, #cabfGatePointsFilter').val('All');
        _storedClass = _storedActivity = _storedStatus = _storedPoints = 'All';
        item.set('cabfPageGuildBattleClass', 'All');
        item.set('cabfPageGuildBattleActivity', 'All');
        item.set('cabfPageGuildBattleStatus', 'All');
        item.set('cabfPageGuildBattlePoints', 'All');
        filterGate();
    }));
    $('#cabf_menu').append('<span class="cabfGateFilterTitle ui-state-default"> Class </span><select id="cabfGateClassFilter" class="cabfgatefiltertitle">');
    _sel = $('#cabfGateClassFilter');
    $.each(filterClass, function (_i, _e) {
        _sel.append('<option value="' + _e + '" ' + (_storedClass == _i ? 'selected = "selected"' : '') + ' >' + _i + '</option>');
    });
    _sel.change(function () {
        _storedClass = $(this).find("option:selected").text();
        item.set('cabfPageGuildBattleClass', _storedClass);
        filterGate();
    });
    // Activity filter
    $('#cabf_menu').append('<span class="cabfGateFilterTitle ui-state-default"> Activity </span><select id="cabfGateActivityFilter" class="cabfgatefiltertitle">');
    _sel = $('#cabfGateActivityFilter');
    $.each(filterActivity, function (_i, _e) {
        _sel.append('<option value="' + _e + '" ' + (_storedActivity == _i ? 'selected = "selected"' : '') + ' >' + _i + '</option>');
    });
    _sel.change(function () {
        _storedActivity = $(this).find("option:selected").text();
        item.set('cabfPageGuildBattleActivity', _storedActivity);
        filterGate();
    });
    // status filter
    $('#cabf_menu').append('<span class="cabfGateFilterTitle ui-state-default"> Status </span><select id="cabfGateStatusFilter" class="cabfgatefiltertitle">');
    _sel = $('#cabfGateStatusFilter');
    $.each(filterStatus, function (_i, _e) {
        _sel.append('<option value="' + _e + '" ' + (_storedStatus == _i ? 'selected = "selected"' : '') + ' >' + _i + '</option>');
    });
    _sel.change(function () {
        _storedStatus = $(this).find("option:selected").text();
        item.set('cabfPageGuildBattleStatus', _storedStatus);
        filterGate();
    });
    $('#cabfGateStatusFilter, #cabfGateClassFilter, #cabfGateActivityFilter').css({
        'float' : 'left',
        'color' : '#fff',
        'height' : 25,
        'border' : '1 solid #444444',
        'backgroundColor' : '#222',
        'position' : 'relative',
        'left' : 9,
        'top' : 3
    });
    // Battle activity points filter
    $('#cabf_menu').append('<span class="cabfGateFilterTitle ui-state-default"> Points </span><select id="cabfGatePointsFilter" class="cabfgatefiltertitle">');
    _sel = $('#cabfGatePointsFilter');
    $.each(filterPoints, function (_i, _e) {
        _sel.prepend('<option value="' + _e + '" ' + (_storedPoints == _i ? 'selected = "selected"' : '') + ' >' + _i + '</option>');
    });
    _sel.change(function () {
        _storedPoints = $(this).find("option:selected").text();
        item.set('cabfPageGuildBattlePoints', _storedPoints);
        filterGate();
    });

    $('#cabfGatePointsFilter, #cabfGateStatusFilter, #cabfGateClassFilter, #cabfGateActivityFilter').css({
        'float' : 'left',
        'color' : '#fff',
        'height' : 25,
        'border' : '1 solid #444444',
        'backgroundColor' : '#222',
        'position' : 'relative',
        'left' : 9,
        'top' : 3
    });
    window.setTimeout(function () {
        filterGate();
    }, 10);

    // Clear Var
    _gate = '';
    _your = '';
    _enemy = '';
    $_your = '';
    $_enemy = '';
    _tokens = '';
}

/*******************************************************************************************************************************************************************************
 ********************************************************************************************************************************************************************************
 *************    10VS10 BATTLE *************************************************************************************************************************************************
 ********************************************************************************************************************************************************************************
 *******************************************************************************************************************************************************************************/
function cabf_tenbattlefilter() {
    // fix gate reseting when attacking with duel button
    var _gate = /\d/.exec($('#enemy_guild_battle_section_battle_list, #your_guild_battle_section_battle_list').attr('class'));
    $('#results_main_wrapper form, #enemy_new_guild_member_list form, #your_new_guild_member_list form').append('<input type="hidden" name="sel_pos" value="' + _gate + '">');

    // add percentage to health bars
    var _your = (1 - ($('div[style*="/guild_battle_bar_you.gif"]').width() / $('div[style*="/guild_battle_bar_you.gif"]').parent().width())) * 100;
    var _enemy = (1 - ($('div[style*="/guild_battle_bar_enemy.gif"]').width() / $('div[style*="/guild_battle_bar_enemy.gif"]').parent().width())) * 100;
    var $_your = $('span:contains("YOUR GUILD")');
    var $_enemy = $('span:contains("ENEMY\'S GUILD")');
    $_your.html($_your.html() + ' (' + _your.toFixed(1) + '%)');
    $_enemy.html($_enemy.html() + ' (' + _enemy.toFixed(1) + '%)');

    // enemys health added to its name in results
    $_enemy = $('span.result_body div[style*="width: 285px;"]:last');
    if ($_enemy.length > 0) {
        var _target = $('span.result_body input[name="target_id"]').attr('value');
        var _health = /Health:\s*(\d+)\/\d+/.exec($('#enemy_new_guild_member_list > div > div:has(a[uid="' + _target + '"]):first').text());
        if (_health !== null) {
            $_enemy.html($_enemy.html() + ' (' + _health[1] + ')');
        }
    }

    // resize top image
    $('input[value="enter_battle"]').parents('form:first').css({
        'position' : 'relative'
    });
    $('#guild_battle_banner_section').find('div:contains("VICTOR")').next().next().css('marginTop', 10).end();
    $('#guild_battle_banner_section > div:eq(2)').css('marginTop', 0);
    $('div:contains("The Battle Between"):last').parent().css('marginTop', 20);
    $('input[src*="collect_reward_button2.jpg"]').parents('div:eq(2)').css('marginTop', 0);
    normalDuelStats('#guild_battle_guild_tabs');
    addStatBoard('#guild_battle_guild_tabs');

    // add current tokens to result
    var _tokens = $('div.result div:contains("-1 Battle Tokens"):last');
    _tokens.text(_tokens.text() + ' (' + $('#guild_token_current_value').text() + ' left)');

    // reduce gate size and add number
    if ($('#your_new_guild_member_list:contains("No Soldiers Posted In This Position!"), #enemy_new_guild_member_list:contains("No Soldiers Posted In This Position!")').length === 0) {
        var _guildnum = 1,
            _count = 0,
            _totalhealth = 0,
            _totalhealthleft = 0,
            _clericcount = 0,
            _clerictotalhealth = 0,
            _clerictotalhealthleft = 0,
            _magecount = 0,
            _magetotalhealth = 0,
            _magetotalhealthleft = 0,
            _roguecount = 0,
            _roguetotalhealth = 0,
            _roguetotalhealthleft = 0,
            _warriorcount = 0,
            _warriortotalhealth = 0,
            _warriortotalhealthleft = 0,
            _activecount = 0,
            _activelivecount = 0,
            _activetotalhealth = 0,
            _activetotalhealthleft = 0;
        if ($('#enemy_guild_battle_section_battle_list').length > 0) {
            $('#cabfStatType').html('Enemy Stat');
        } else {
            $('#cabfStatType').html('Ally Stat');
        }
        $('#cabfStatTower span:last').html('All Class Stat');
        $('#cabfStatCleric span:last').html(' Cleric Stat');
        $('#cabfStatMage span:last').html(' Mage Stat');
        $('#cabfStatRogue span:last').html(' Rogue Stat');
        $('#cabfStatWarrior span:last').html(' Warrior Stat');
        $('#cabfStatActive span:last').html(' Active Stat');

        $('#enemy_new_guild_member_list > div > div, #your_new_guild_member_list > div > div').each(function (_i, _e) {
            var _text = $(_e).text().trim(),
                _FullHealth = true;
            if (_text && $(_e).text().trim().length > 0) {
                var _test = /(\d+)\/(\d+)/g.exec(_text);
                var _active = /Battle\ Points:\ [1-9]/g.exec(_text);
                var winStat = '';
                if ($('input[name="target_id"]', _e).length > 0) {
                    var target_id = $('input[name="target_id"]', _e).attr("value");
                    winStat = getTargetStat(target_id);
                    addTargetTip(_e);
                }
                if (_test) {
                    _FullHealth = (_test.length === 3 && _test[1] === _test[2]) ? true : false;
                    if (_FullHealth)
                        $(_e).append('<span class="GuildNumG">' + (_guildnum) + '</span>' + '<br>' + winStat);
                    else
                        $(_e).append('<span class="GuildNumR">' + (_guildnum) + '</span>' + '<br>' + winStat);
                } else {
                    $(_e).append('<span class="GuildNum">' + (_guildnum) + '</span>' + '<br>' + winStat);
                }
                _guildnum += 1;
                _count += 1;
                _totalhealth += parseInt(_test[2]);
                _totalhealthleft += parseInt(_test[1]);
                if ($(_e).find('img[src*="/graphics/class_cleric.gif"]').length > 0) {
                    _clericcount += 1;
                    _clerictotalhealth += parseInt(_test[2]);
                    _clerictotalhealthleft += parseInt(_test[1]);
                }
                if ($(_e).find('img[src*="/graphics/class_mage.gif"]').length > 0) {
                    _magecount += 1;
                    _magetotalhealth += parseInt(_test[2]);
                    _magetotalhealthleft += parseInt(_test[1]);
                }
                if ($(_e).find('img[src*="/graphics/class_rogue.gif"]').length > 0) {
                    _roguecount += 1;
                    _roguetotalhealth += parseInt(_test[2]);
                    _roguetotalhealthleft += parseInt(_test[1]);
                }
                if ($(_e).find('img[src*="/graphics/class_warrior.gif"]').length > 0) {
                    _warriorcount += 1;
                    _warriortotalhealth += parseInt(_test[2]);
                    _warriortotalhealthleft += parseInt(_test[1]);
                }
                if (_active) {
                    _activecount += 1;
                    _activetotalhealth += parseInt(_test[2]);
                    if (_test[1] > 0)
                        _activelivecount += 1;
                    _activetotalhealthleft += parseInt(_test[1]);
                }
            } else {
                $(_e).remove();
            }
            _text = '';
            //_test = null;
        });
        if (_count > 0) {
            $('#cabfTotalHealth').html('Total Health: ' + _totalhealth);
            $('#cabfAverageHealth').html('Average Health: ' + (_totalhealth / _count).toFixed());
            $('#cabfHealthLeft').html('Health Left: ' + _totalhealthleft);
            $('#cabfAverageHealthLeft').html('Average Health Left: ' + (_totalhealthleft / _count).toFixed());
            $('#cabfPercentageHealthLeft').html('Percentage Health Left: ' + (_totalhealthleft * 100 / _totalhealth).toFixed(1) + '%');

            if (_clericcount > 0) {
                $('#cabfClericTotalHealth').html('Total Health: ' + _clerictotalhealth);
                $('#cabfClericAverageHealth').html('Average Health: ' + (_clerictotalhealth / _clericcount).toFixed());
                $('#cabfClericHealthLeft').html('Health Left: ' + _clerictotalhealthleft);
                $('#cabfClericAverageHealthLeft').html('Average Health Left: ' + (_clerictotalhealthleft / _clericcount).toFixed());
                $('#cabfClericPercentageHealthLeft').html('Percentage Health Left: ' + (_clerictotalhealthleft * 100 / _clerictotalhealth).toFixed(1) + '%');
            }

            if (_magecount > 0) {
                $('#cabfMageTotalHealth').html('Total Health: ' + _magetotalhealth);
                $('#cabfMageAverageHealth').html('Average Health: ' + (_magetotalhealth / _magecount).toFixed());
                $('#cabfMageHealthLeft').html('Health Left: ' + _magetotalhealthleft);
                $('#cabfMageAverageHealthLeft').html('Average Health Left: ' + (_magetotalhealthleft / _magecount).toFixed());
                $('#cabfMagePercentageHealthLeft').html('Percentage Health Left: ' + (_magetotalhealthleft * 100 / _magetotalhealth).toFixed(1) + '%');
            }

            if (_roguecount > 0) {
                $('#cabfRogueTotalHealth').html('Total Health: ' + _roguetotalhealth);
                $('#cabfRogueAverageHealth').html('Average Health: ' + (_roguetotalhealth / _roguecount).toFixed());
                $('#cabfRogueHealthLeft').html('Health Left: ' + _roguetotalhealthleft);
                $('#cabfRogueAverageHealthLeft').html('Average Health Left: ' + (_roguetotalhealthleft / _roguecount).toFixed());
                $('#cabfRoguePercentageHealthLeft').html('Percentage Health Left: ' + (_roguetotalhealthleft * 100 / _roguetotalhealth).toFixed(1) + '%');
            }

            if (_warriorcount > 0) {
                $('#cabfWarriorTotalHealth').html('Total Health: ' + _warriortotalhealth);
                $('#cabfWarriorAverageHealth').html('Average Health: ' + (_warriortotalhealth / _warriorcount).toFixed());
                $('#cabfWarriorHealthLeft').html('Health Left: ' + _warriortotalhealthleft);
                $('#cabfWarriorAverageHealthLeft').html('Average Health Left: ' + (_warriortotalhealthleft / _warriorcount).toFixed());
                $('#cabfWarriorPercentageHealthLeft').html('Percentage Health Left: ' + (_warriortotalhealthleft * 100 / _warriortotalhealth).toFixed(1) + '%');
            }

            if (_activecount > 0) {
                $('#cabfActiveTotalHealth').html('Total Health: ' + _activetotalhealth);
                $('#cabfActiveAverageHealth').html('Average Health: ' + (_activetotalhealth / _activecount).toFixed());
                $('#cabfActiveHealthLeft').html('Health Left: ' + _activetotalhealthleft);
                if (_activelivecount > 0) {
                    $('#cabfActiveAverageHealthLeft').html('Average Health Left: ' + (_activetotalhealthleft / _activelivecount).toFixed());
                }
                $('#cabfActivePercentageHealthLeft').html('Percentage Health Left: ' + (_activetotalhealthleft * 100 / _activetotalhealth).toFixed(1) + '%');
            }
        }
    }

    // Add refresh on enemy_guild_tab and your_guild_tab for 10vs10 battle
    if ($('a[href*="ten_battle.php?battle_id="]').length > 0) {
        var _battleid = $('input[name="battle_id"]').attr('value');
        console.log('_battleid=' + _battleid);
        if ($('#enemy_guild_tab').length > 0) {
            $('#enemy_guild_tab').css({
                "font-size" : "15px",
                "padding-top" : "0px",
                "text-align" : "center"
            });
            $('#enemy_guild_tab').wrap('<a href="ten_battle.php?battle_id=' + _battleid + '&view_allies=false" onclick="ajaxLinkSend(\'globalContainer\', \'ten_battle.php?battle_id=' + _battleid + '&view_allies=false\'); return false;"></a>');
        }
        if ($('#your_guild_tab').length > 0) {
            $('#your_guild_tab').css({
                "font-size" : "15px",
                "padding-top" : "0px",
                "text-align" : "center"
            });
            $('#your_guild_tab').wrap('<a href="ten_battle.php?battle_id=' + _battleid + '&view_allies=true" onclick="ajaxLinkSend(\'globalContainer\', \'ten_battle.php?battle_id=' + _battleid + '&view_allies=true\'); return false;"></a>');
        }
    }

    // Saved filter settings
    var _storedClass = item.get('cabfPageTenBattleClass', 'All');
    var _storedActivity = item.get('cabfPageTenBattleActivity', 'All');
    var _storedStatus = item.get('cabfPageTenBattleStatus', 'All');
    var _storedPoints = item.get('cabfPageTenBattlePoints', 'All');

    // gate filter
    filterGate = function () {
        var _count = 0;
        var _myLevel = $('a[href*="keep.php"] > div[style="color:#ffffff"]').text().match(/\d+/);
        var myLevel = Number(_myLevel[0]);
        $('#your_new_guild_member_list > div > div, #enemy_new_guild_member_list > div > div').each(function (_i, _e) {
            var _class = $('#cabfGateClassFilter').val();
            var _activ = new RegExp($('#cabfGateActivityFilter').val(), "g");
            var _state = $('#cabfGateStatusFilter').val();
            var _points = $('#cabfGatePointsFilter').val();
            var _text = $(_e).text().trim(),
                _stateTest = true;
            var _test = false;
            switch (_state) {
                case 'FullHealth':
                    _test = /(\d+)\/(\d+)/g.exec(_text);
                    _stateTest = (_test.length === 3 && _test[1] === _test[2]) ? true : false;
                    break;
                case 'GotHealth':
                    _test = /(\d+)\/(\d+)/g.exec(_text);
                    _stateTest = (_test.length === 3 && parseInt(_test[1]) !== 0) ? true : false;
                    break;
                case 'NoHealth':
                    _test = /(\d+)\/(\d+)/g.exec(_text);
                    _stateTest = (_test.length === 3 && parseInt(_test[1]) === 0) ? true : false;
                    break;
                default:
                    _test = new RegExp(_state, "g");
                    _stateTest = _test.test(_text);
            }

            var _classTest = _class === 'all' ? 1 : $(_e).find('img[src*="/graphics/class_' + _class + '.gif"]').length;
            var _pointTest = _points === 'all' ? 1 : $(_e).find('img[title="Battle Points for Victory: ' + _points + '"]').length;
            if (_classTest > 0 && _activ.test(_text) && /*_pointTest > 0 &&*/
                _stateTest === true) {
                if (_points !== 'All') {
                    if (/Level:\ \d+/.test(_text)) {
                        var targetLevel = parseInt(/(?:Level:\ )(\d+)/g.exec(_text)[1]);
                        var _showTarget = false;
                        switch (_points) {
                            case '160':
                                if (targetLevel <= myLevel * 80 / 100) {
                                    _showTarget = true;
                                }
                                break;
                            case '200':
                                if ((targetLevel > myLevel * 80 / 100) && (targetLevel <= myLevel * 120 / 100)) {
                                    _showTarget = true;
                                }
                                break;
                            case '240':
                                if (targetLevel > myLevel * 120 / 100) {
                                    _showTarget = true;
                                }
                                break;
                            default:
                                _showTarget = true;
                        }
                        if (_showTarget) {
                            $(_e).show();
                            _count += 1;
                        } else {
                            $(_e).hide();
                        }
                    } else {
                        console.log('Error in points filter!');
                        $(_e).show();
                        _count += 1;
                    }
                } else {
                    $(_e).show();
                    _count += 1;
                }
            } else {
                $(_e).hide();
            }

        });
        $('#enemy_guild_tab,#your_guild_tab').append('<br><br><span style="font-size:14px;font-weight:bold;">Filtered: ' + _count + '</span>');
    };

    // class filter
    var filterClass = {
        'All' : 'all',
        'Cleric' : 'cleric',
        'Mage' : 'mage',
        'Rogue' : 'rogue',
        'Warrior' : 'warrior'
    },
        filterActivity = {
            'All' : '\.',
            'Active' : 'Battle Points: [1-9]',
            'Inactive' : 'Battle Points: 0'
        },
        filterStatus = {
            'All' : '\.',
            'Full health' : 'FullHealth',
            'Got health' : 'GotHealth',
            'No health' : 'NoHealth',
            'Healthy' : 'Healthy',
            'Good' : 'Good',
            'Fair' : 'Fair',
            'Weakened' : 'Weakened',
            'Stunned' : 'Stunned'
        },
        filterPoints = {
            'All' : 'all',
            '240' : '240',
            '200' : '200',
            '160' : '160'
        };
    // Class filter
    $('body > ul.ui-selectmenu-menu').remove();
    $('#enemy_guild_battle_section_battle_list, #your_guild_battle_section_battle_list').prepend('<div id="cabf_menu" style="padding: 0 0 30px 0;" >');
    $('#cabf_menu').append($('<button>Clear filters</button>').button().css({
        'position' : 'relative !important',
        'left' : 9,
        'top' : 3,
        'float' : 'left',
        'fontSize' : 12,
        'height' : 25,
        'borderRadius' : 0
    }).click(function () {
        $('span.ui-selectmenu-status').text('All');
        $('#cabfGateClassFilter, #cabfGateActivityFilter, #cabfGateStatusFilter, #cabfGatePointsFilter').val('All');
        _storedClass = _storedActivity = _storedStatus = _storedPoints = 'All';
        item.set('cabfPageTenBattleClass', 'All');
        item.set('cabfPageTenBattleActivity', 'All');
        item.set('cabfPageTenBattleStatus', 'All');
        item.set('cabfPageTenBattlePoints', 'All');
        filterGate();
    }));
    $('#cabf_menu').append('<span class="cabfGateFilterTitle ui-state-default"> Class </span><select id="cabfGateClassFilter" class="cabfgatefiltertitle">');
    _sel = $('#cabfGateClassFilter');
    $.each(filterClass, function (_i, _e) {
        _sel.append('<option value="' + _e + '" ' + (_storedClass == _i ? 'selected = "selected"' : '') + ' >' + _i + '</option>');
    });
    _sel.change(function () {
        _storedClass = $(this).find("option:selected").text();
        item.set('cabfPageTenBattleClass', _storedClass);
        filterGate();
    });
    // Activity filter
    $('#cabf_menu').append('<span class="cabfGateFilterTitle ui-state-default"> Activity </span><select id="cabfGateActivityFilter" class="cabfgatefiltertitle">');
    _sel = $('#cabfGateActivityFilter');
    $.each(filterActivity, function (_i, _e) {
        _sel.append('<option value="' + _e + '" ' + (_storedActivity == _i ? 'selected = "selected"' : '') + ' >' + _i + '</option>');
    });
    _sel.change(function () {
        _storedActivity = $(this).find("option:selected").text();
        item.set('cabfPageTenBattleActivity', _storedActivity);
        filterGate();
    });
    // status filter
    $('#cabf_menu').append('<span class="cabfGateFilterTitle ui-state-default"> Status </span><select id="cabfGateStatusFilter" class="cabfgatefiltertitle">');
    _sel = $('#cabfGateStatusFilter');
    $.each(filterStatus, function (_i, _e) {
        _sel.append('<option value="' + _e + '" ' + (_storedStatus == _i ? 'selected = "selected"' : '') + ' >' + _i + '</option>');
    });
    _sel.change(function () {
        _storedStatus = $(this).find("option:selected").text();
        item.set('cabfPageTenBattleStatus', _storedStatus);
        filterGate();
    });
    $('#cabfGateStatusFilter, #cabfGateClassFilter, #cabfGateActivityFilter').css({
        'float' : 'left',
        'color' : '#fff',
        'height' : 25,
        'border' : '1 solid #444444',
        'backgroundColor' : '#222',
        'position' : 'relative',
        'left' : 9,
        'top' : 3
    });
    // Battle activity points filter
    $('#cabf_menu').append('<span class="cabfGateFilterTitle ui-state-default"> Points </span><select id="cabfGatePointsFilter" class="cabfgatefiltertitle">');
    _sel = $('#cabfGatePointsFilter');
    $.each(filterPoints, function (_i, _e) {
        _sel.prepend('<option value="' + _e + '" ' + (_storedPoints == _i ? 'selected = "selected"' : '') + ' >' + _i + '</option>');
    });
    _sel.change(function () {
        _storedPoints = $(this).find("option:selected").text();
        item.set('cabfPageTenBattlePoints', _storedPoints);
        filterGate();
    });

    $('#cabfGatePointsFilter, #cabfGateStatusFilter, #cabfGateClassFilter, #cabfGateActivityFilter').css({
        'float' : 'left',
        'color' : '#fff',
        'height' : 25,
        'border' : '1 solid #444444',
        'backgroundColor' : '#222',
        'position' : 'relative',
        'left' : 9,
        'top' : 3
    });
    window.setTimeout(function () {
        filterGate();
    }, 10);
}

/******************************************************************************************************************************************************************************
 *******************************************************************************************************************************************************************************
 *************    FESTIVAL BATTLE **********************************************************************************************************************************************
 *******************************************************************************************************************************************************************************
 ******************************************************************************************************************************************************************************/
function cabf_festivalbattlefilter() {
    // fix gate reseting when attacking with duel button
    var _gate = /\d/.exec($('#enemy_guild_battle_section_battle_list, #your_guild_battle_section_battle_list').attr('class'));
    $('#results_main_wrapper form, #enemy_guild_member_list form, #your_guild_member_list form').append('<input type="hidden" name="sel_pos" value="' + _gate + '">');
    $('#results_main_wrapper form, #enemy_guild_member_list form, #your_guild_member_list form').append('<input type="hidden" name="attacking_position" value="' + _gate + '">');

    // add percentage to health bars
    var _your = (1 - ($('div[style*="/guild_battle_bar_you.gif"]').width() / $('div[style*="/guild_battle_bar_you.gif"]').parent().width())) * 100;
    var _enemy = (1 - ($('div[style*="/guild_battle_bar_enemy.gif"]').width() / $('div[style*="/guild_battle_bar_enemy.gif"]').parent().width())) * 100;
    var $_your = $('#guild_battle_health span:contains("/"):first');
    var $_enemy = $('#guild_battle_health span:contains("/"):last');
    $_your.html($_your.html() + ' (' + _your.toFixed(1) + '%)');
    $_enemy.html($_enemy.html() + ' (' + _enemy.toFixed(1) + '%)');

    // enemys health added to its name in results
    $_enemy = $('span.result_body div[style*="width: 285px;"]:last');
    if ($_enemy.length > 0) {
        var _target = $('span.result_body input[name="target_id"]').attr('value');
        var _health = /Health:\s*(\d+)\/\d+/.exec($('#enemy_guild_member_list > div > div:has(a[uid="' + _target + '"]):first').text());
        if (_health !== null) {
            $_enemy.html($_enemy.html() + ' (' + _health[1] + ')');
        }
    }

    // resize top image
    $('input[value="enter_battle"]').parents('form:first').css({
        'position' : 'relative'
    });
    $('#guild_battle_banner_section').find('div:contains("VICTOR")').next().next().css('marginTop', 10).end();
    $('#guild_battle_banner_section > div:eq(2)').css('marginTop', 0);
    $('div:contains("The Battle Between"):last').parent().css('marginTop', 20);
    $('input[src*="collect_reward_button2.jpg"]').parents('div:eq(2)').css('marginTop', 0);
    normalDuelStats('#guild_battle_guild_tabs');
    addStatBoard('#guild_battle_guild_tabs');

    // add current tokens to result
    var _tokens = $('div.result div:contains("-1 Battle Tokens"):last');
    _tokens.text(_tokens.text() + ' (' + $('#guild_token_current_value').text() + ' left)');

    // reduce gate size and add number
    var _guildnum = 1,
        _count = 0,
        _totalhealth = 0,
        _totalhealthleft = 0,
        _clericcount = 0,
        _clerictotalhealth = 0,
        _clerictotalhealthleft = 0,
        _magecount = 0,
        _magetotalhealth = 0,
        _magetotalhealthleft = 0,
        _roguecount = 0,
        _roguetotalhealth = 0,
        _roguetotalhealthleft = 0,
        _warriorcount = 0,
        _warriortotalhealth = 0,
        _warriortotalhealthleft = 0,
        _activecount = 0,
        _activelivecount = 0,
        _activetotalhealth = 0,
        _activetotalhealthleft = 0;
    var _gateNum = $('#enemy_guild_battle_section_battle_list, #your_guild_battle_section_battle_list').attr('class').match(/\d/)[0];
    var _gateName = '';
    if ($('#enemy_guild_battle_section_battle_list').length > 0) {
        $('#cabfStatType').html('Enemy');
    } else {
        $('#cabfStatType').html('Ally');
    }
    switch (_gateNum) {
        case '1':
            _gateName = 'North';
            break;
        case '2':
            _gateName = 'West';
            break;
        case '3':
            _gateName = 'East';
            break;
        case '4':
            _gateName = 'South';
            break;
        default:
            _gateName = ' ';
    }
    $('#cabfStatTower span:last').html(_gateName + ' Tower Stat');
    $('#cabfStatCleric span:last').html(_gateName + ' Cleric Stat');
    $('#cabfStatMage span:last').html(_gateName + ' Mage Stat');
    $('#cabfStatRogue span:last').html(_gateName + ' Rogue Stat');
    $('#cabfStatWarrior span:last').html(_gateName + ' Warrior Stat');
    $('#cabfStatActive span:last').html(_gateName + ' Active Stat');
    $('#enemy_guild_member_list > div > div, #your_guild_member_list > div > div').each(function (_i, _e) {
        var _text = $(_e).text().trim(),
            _FullHealth = true;
        if (_text && $(_e).text().trim().length > 0) {
            var _test = /(\d+)\/(\d+)/g.exec(_text);
            var _active = /Battle\ Points:\ [1-9]/g.exec(_text);
            var winStat = '';
            if ($('input[name="target_id"]', _e).length > 0) {
                var target_id = $('input[name="target_id"]', _e).attr("value");
                winStat = getTargetStat(target_id);
                addTargetTip(_e);
            }
            if (_test) {
                _FullHealth = (_test.length === 3 && _test[1] === _test[2]) ? true : false;
                if (_FullHealth)
                    $(_e).append('<span class="GuildNumG">' + (_guildnum) + '</span>' + '<br>' + winStat);
                else
                    $(_e).append('<span class="GuildNumR">' + (_guildnum) + '</span>' + '<br>' + winStat);
            } else {
                $(_e).append('<span class="GuildNum">' + (_guildnum) + '</span>' + '<br>' + winStat);
            }
            _guildnum += 1;
            _count += 1;
            _totalhealth += parseInt(_test[2]);
            _totalhealthleft += parseInt(_test[1]);
            if ($(_e).find('img[src*="/graphics/class_cleric.gif"]').length > 0) {
                _clericcount += 1;
                _clerictotalhealth += parseInt(_test[2]);
                _clerictotalhealthleft += parseInt(_test[1]);
            }
            if ($(_e).find('img[src*="/graphics/class_mage.gif"]').length > 0) {
                _magecount += 1;
                _magetotalhealth += parseInt(_test[2]);
                _magetotalhealthleft += parseInt(_test[1]);
            }
            if ($(_e).find('img[src*="/graphics/class_rogue.gif"]').length > 0) {
                _roguecount += 1;
                _roguetotalhealth += parseInt(_test[2]);
                _roguetotalhealthleft += parseInt(_test[1]);
            }
            if ($(_e).find('img[src*="/graphics/class_warrior.gif"]').length > 0) {
                _warriorcount += 1;
                _warriortotalhealth += parseInt(_test[2]);
                _warriortotalhealthleft += parseInt(_test[1]);
            }
            if (_active) {
                _activecount += 1;
                _activetotalhealth += parseInt(_test[2]);
                if (_test[1] > 0)
                    _activelivecount += 1;
                _activetotalhealthleft += parseInt(_test[1]);
            }
        } else {
            $(_e).remove();
        }
        _text = '';
        //_test = null;
    });
    if (_count > 0) {
        $('#cabfTotalHealth').html('Total Health: ' + _totalhealth);
        $('#cabfAverageHealth').html('Average Health: ' + (_totalhealth / _count).toFixed());
        $('#cabfHealthLeft').html('Health Left: ' + _totalhealthleft);
        $('#cabfAverageHealthLeft').html('Average Health Left: ' + (_totalhealthleft / _count).toFixed());
        $('#cabfPercentageHealthLeft').html('Percentage Health Left: ' + (_totalhealthleft * 100 / _totalhealth).toFixed(1) + '%');

        if (_clericcount > 0) {
            $('#cabfClericTotalHealth').html('Total Health: ' + _clerictotalhealth);
            $('#cabfClericAverageHealth').html('Average Health: ' + (_clerictotalhealth / _clericcount).toFixed());
            $('#cabfClericHealthLeft').html('Health Left: ' + _clerictotalhealthleft);
            $('#cabfClericAverageHealthLeft').html('Average Health Left: ' + (_clerictotalhealthleft / _clericcount).toFixed());
            $('#cabfClericPercentageHealthLeft').html('Percentage Health Left: ' + (_clerictotalhealthleft * 100 / _clerictotalhealth).toFixed(1) + '%');
        }

        if (_magecount > 0) {
            $('#cabfMageTotalHealth').html('Total Health: ' + _magetotalhealth);
            $('#cabfMageAverageHealth').html('Average Health: ' + (_magetotalhealth / _magecount).toFixed());
            $('#cabfMageHealthLeft').html('Health Left: ' + _magetotalhealthleft);
            $('#cabfMageAverageHealthLeft').html('Average Health Left: ' + (_magetotalhealthleft / _magecount).toFixed());
            $('#cabfMagePercentageHealthLeft').html('Percentage Health Left: ' + (_magetotalhealthleft * 100 / _magetotalhealth).toFixed(1) + '%');
        }

        if (_roguecount > 0) {
            $('#cabfRogueTotalHealth').html('Total Health: ' + _roguetotalhealth);
            $('#cabfRogueAverageHealth').html('Average Health: ' + (_roguetotalhealth / _roguecount).toFixed());
            $('#cabfRogueHealthLeft').html('Health Left: ' + _roguetotalhealthleft);
            $('#cabfRogueAverageHealthLeft').html('Average Health Left: ' + (_roguetotalhealthleft / _roguecount).toFixed());
            $('#cabfRoguePercentageHealthLeft').html('Percentage Health Left: ' + (_roguetotalhealthleft * 100 / _roguetotalhealth).toFixed(1) + '%');
        }

        if (_warriorcount > 0) {
            $('#cabfWarriorTotalHealth').html('Total Health: ' + _warriortotalhealth);
            $('#cabfWarriorAverageHealth').html('Average Health: ' + (_warriortotalhealth / _warriorcount).toFixed());
            $('#cabfWarriorHealthLeft').html('Health Left: ' + _warriortotalhealthleft);
            $('#cabfWarriorAverageHealthLeft').html('Average Health Left: ' + (_warriortotalhealthleft / _warriorcount).toFixed());
            $('#cabfWarriorPercentageHealthLeft').html('Percentage Health Left: ' + (_warriortotalhealthleft * 100 / _warriortotalhealth).toFixed(1) + '%');
        }

        if (_activecount > 0) {
            $('#cabfActiveTotalHealth').html('Total Health: ' + _activetotalhealth);
            $('#cabfActiveAverageHealth').html('Average Health: ' + (_activetotalhealth / _activecount).toFixed());
            $('#cabfActiveHealthLeft').html('Health Left: ' + _activetotalhealthleft);
            if (_activelivecount > 0) {
                $('#cabfActiveAverageHealthLeft').html('Average Health Left: ' + (_activetotalhealthleft / _activelivecount).toFixed());
            }
            $('#cabfActivePercentageHealthLeft').html('Percentage Health Left: ' + (_activetotalhealthleft * 100 / _activetotalhealth).toFixed(1) + '%');
        }
    }

    // Saved filter settings
    var _storedClass = item.get('cabfPageFestGuildBattleClass', 'All');
    var _storedActivity = item.get('cabfPageFestGuildBattleActivity', 'All');
    var _storedStatus = item.get('cabfPageFestGuildBattleStatus', 'All');
    var _storedPoints = item.get('cabfPageFestGuildBattlePoints', 'All');

    // gate filter
    filterGate = function () {
        var _count = 0;
        var _gateNum = $('#enemy_guild_battle_section_battle_list, #your_guild_battle_section_battle_list').attr('class').match(/\d/)[0];
        var _gate = $('#enemy_arena_tab_' + _gateNum + ' > div, #your_arena_tab_' + _gateNum + ' > div');
        var _myLevel = $('a[href*="keep.php"] > div[style="color:#ffffff"]').text().match(/\d+/);
        var myLevel = Number(_myLevel[0]);
        $('#your_guild_member_list > div > div, #enemy_guild_member_list > div > div').each(function (_i, _e) {

            var _class = $('#cabfGateClassFilter').val();
            var _activ = new RegExp($('#cabfGateActivityFilter').val());
            var _state = $('#cabfGateStatusFilter').val();
            var _points = $('#cabfGatePointsFilter').val();
            var _text = $(_e).text().trim(),
                _stateTest = true;
            var _test = false;
            switch (_state) {
                case 'FullHealth':
                    _test = /(\d+)\/(\d+)/g.exec(_text);
                    _stateTest = (_test.length === 3 && _test[1] === _test[2]) ? true : false;
                    break;
                case 'GotHealth':
                    _test = /(\d+)\/(\d+)/g.exec(_text);
                    _stateTest = (_test.length === 3 && parseInt(_test[1]) !== 0) ? true : false;
                    break;
                case 'NoHealth':
                    _test = /(\d+)\/(\d+)/g.exec(_text);
                    _stateTest = (_test.length === 3 && parseInt(_test[1]) === 0) ? true : false;
                    break;
                default:
                    _test = new RegExp(_state, "g");
                    _stateTest = _test.test(_text);
            }

            var _classTest = _class === 'all' ? 1 : $(_e).find('img[src*="/graphics/class_' + _class + '.gif"]').length;
            var _pointTest = _points === 'all' ? 1 : $(_e).find('img[title="Battle Points for Victory: ' + _points + '"]').length;
            if (_classTest > 0 && _activ.test(_text) && /*_pointTest > 0 &&*/
                _stateTest === true) {
                if (_points !== 'All') {
                    if (/Level:\ \d+/.test(_text)) {
                        var targetLevel = parseInt(/(?:Level:\ )(\d+)/g.exec(_text)[1]);
                        var _showTarget = false;
                        switch (_points) {
                            case '160':
                                if (targetLevel <= myLevel * 80 / 100) {
                                    _showTarget = true;
                                }
                                break;
                            case '200':
                                if ((targetLevel > myLevel * 80 / 100) && (targetLevel <= myLevel * 120 / 100)) {
                                    _showTarget = true;
                                }
                                break;
                            case '240':
                                if (targetLevel > myLevel * 120 / 100) {
                                    _showTarget = true;
                                }
                                break;
                            default:
                                _showTarget = true;
                        }
                        if (_showTarget) {
                            $(_e).show();
                            _count += 1;
                        } else {
                            $(_e).hide();
                        }
                    } else {
                        console.log('Error in points filter!');
                        $(_e).show();
                        _count += 1;
                    }
                } else {
                    $(_e).show();
                    _count += 1;
                }
            } else {
                $(_e).hide();
            }
        });
        _gate.html(_gate.html().replace(/\).*/, ')').replace(')', ')<br/><span style="font-size:11px;font-weight:bold;">Filtered: ' + _count + '</span>'));
    };

    // class filter
    var filterClass = {
        'All' : 'all',
        'Cleric' : 'cleric',
        'Mage' : 'mage',
        'Rogue' : 'rogue',
        'Warrior' : 'warrior'
    },
        filterActivity = {
            'All' : '\.*',
            'Active' : 'Battle Points: [1-9]',
            'Inactive' : 'Battle Points: 0'
        },
        filterStatus = {
            'All' : '\.*',
            'Full health' : 'FullHealth',
            'Got health' : 'GotHealth',
            'No health' : 'NoHealth',
            'Healthy' : 'Healthy',
            'Good' : 'Good',
            'Fair' : 'Fair',
            'Weakened' : 'Weakened',
            'Stunned' : 'Stunned'
        },
        filterPoints = {
            'All' : 'all',
            '240' : '240',
            '200' : '200',
            '160' : '160'
        };
    // Add Filter Bar
    $('body > ul.ui-selectmenu-menu').remove();
    $('#enemy_guild_battle_section_battle_list, #your_guild_battle_section_battle_list').prepend('<div id="cabf_menu" style="padding: 0 0 30px 0;" >');
    // Clear Filter
    $('#cabf_menu').append($('<button>Clear filters</button>').button().css({
        'position' : 'relative !important',
        'left' : 9,
        'top' : 3,
        'float' : 'left',
        'fontSize' : 12,
        'height' : 25,
        'borderRadius' : 0
    }).click(function () {
        $('span.ui-selectmenu-status').text('All');
        $('#cabfGateClassFilter, #cabfGateActivityFilter, #cabfGateStatusFilter, #cabfGatePointsFilter').val('All');
        _storedClass = _storedActivity = _storedStatus = _storedPoints = 'All';
        item.set('cabfPageFestGuildBattleClass', 'All');
        item.set('cabfPageFestGuildBattleActivity', 'All');
        item.set('cabfPageFestGuildBattleStatus', 'All');
        item.set('cabfPageFestGuildBattlePoints', 'All');
        filterGate();
    }));
    // Class filter
    $('#cabf_menu').append('<span class="cabfGateFilterTitle ui-state-default"> Class </span><select id="cabfGateClassFilter" class="cabfgatefiltertitle">');
    _sel = $('#cabfGateClassFilter');
    $.each(filterClass, function (_i, _e) {
        _sel.append('<option value="' + _e + '" ' + (_storedClass == _i ? 'selected = "selected"' : '') + ' >' + _i + '</option>');
    });
    _sel.change(function () {
        _storedClass = $(this).find("option:selected").text();
        item.set('cabfPageFestGuildBattleClass', _storedClass);
        filterGate();
    });
    // Activity filter
    $('#cabf_menu').append('<span class="cabfGateFilterTitle ui-state-default"> Activity </span><select id="cabfGateActivityFilter" class="cabfgatefiltertitle">');
    _sel = $('#cabfGateActivityFilter');
    $.each(filterActivity, function (_i, _e) {
        _sel.append('<option value="' + _e + '" ' + (_storedActivity == _i ? 'selected = "selected"' : '') + ' >' + _i + '</option>');
    });
    _sel.change(function () {
        _storedActivity = $(this).find("option:selected").text();
        item.set('cabfPageFestGuildBattleActivity', _storedActivity);
        filterGate();
    });
    // status filter
    $('#cabf_menu').append('<span class="cabfGateFilterTitle ui-state-default"> Status </span><select id="cabfGateStatusFilter" class="cabfgatefiltertitle">');
    _sel = $('#cabfGateStatusFilter');
    $.each(filterStatus, function (_i, _e) {
        _sel.append('<option value="' + _e + '" ' + (_storedStatus == _i ? 'selected = "selected"' : '') + ' >' + _i + '</option>');
    });
    _sel.change(function () {
        _storedStatus = $(this).find("option:selected").text();
        item.set('cabfPageFestGuildBattleStatus', _storedStatus);
        filterGate();
    });
    // Battle activity points filter
    $('#cabf_menu').append('<span class="cabfGateFilterTitle ui-state-default"> Points </span><select id="cabfGatePointsFilter" class="cabfgatefiltertitle">');
    _sel = $('#cabfGatePointsFilter');
    $.each(filterPoints, function (_i, _e) {
        _sel.append('<option value="' + _e + '" ' + (_storedPoints == _i ? 'selected = "selected"' : '') + ' >' + _i + '</option>');
    });
    _sel.change(function () {
        _storedPoints = $(this).find("option:selected").text();
        item.set('cabfPageFestGuildBattlePoints', _storedPoints);
        filterGate();
    });

    $('#cabfGatePointsFilter, #cabfGateStatusFilter, #cabfGateClassFilter, #cabfGateActivityFilter').css({
        'float' : 'left',
        'color' : '#fff',
        'height' : 25,
        'border' : '1 solid #444444',
        'backgroundColor' : '#222',
        'position' : 'relative',
        'left' : 9,
        'top' : 3
    });
    window.setTimeout(function () {
        filterGate();
    }, 10);
}

/******************************************************************************************************************************************************************************
 *******************************************************************************************************************************************************************************
 *************    MONSTERS *****************************************************************************************************************************************************
 *******************************************************************************************************************************************************************************
 ******************************************************************************************************************************************************************************/
function monsterBars() {
    var _monstername = null,
        _ret = null;
    // add percentage to top bars
    if ($('#app_body div[style*="nm_bars.jpg"], #app_body div[style*="nm_bars_cross.jpg"]').length > 0) {
        $('img[src*="monster_health_background.jpg"], [src*="nm_red.jpg"], [src*="nm_orange.jpg"]').each(function (_i, _e) {
            _monstername = $(_e).parent().parent().find('div:contains("\'s Life"):last, #app_body div:contains("\'s life"):last');
            var _health = $(_e).parent()[0];
            if (_health.style && _health.style.width !== "" && _monstername && _monstername.text()) {
                var _percentage = _health.style.width.substr(0, 5);
                _monstername.text(_monstername.text().trim() + ' (' + _percentage + (_percentage.indexOf('%') > -1 ? ')' : '%)'));
                _ret.push(_monstername.text());
            }
        });
    } else {
        $('img[src*="monster_health_background.jpg"], [src*="nm_red.jpg"]').each(function (_i, _e) {
            _monstername = $(_e).parent().parent().parent().parent().find('div:contains("\'s Life"):last, div:contains("\'s life"):last');
            var _health = $(_e).parent()[0];
            if (_health.style && _health.style.width !== "" && _monstername && _monstername.text()) {
                var _percentage = _health.style.width.substr(0, 5);
                _monstername.text(_monstername.text().trim() + ' (' + _percentage + (_percentage.indexOf('%') > -1 ? ')' : '%)'));
                _ret.push(_monstername.text());
            }
        });
    }
    return _ret;
}

function defenseBar() {
    // add percentage to defense/forcefield/..
    var _defense = $('img[src*="bar_dispel.gif"],[src*="nm_green.jpg"],[src*="seamonster_ship_health.jpg"]').parent()[0],
        _defRegs = [
            '^Castle Defense$', '^Ragnarok\'s Glacial Armor$', '^Your Ship\'s Defense$', '^Illvasa, Plateau City\'s Defense$', '^Skaar\'s Mana Forcefield$', '^Party Health\\/Strength$'
        ],
        _defReg = new RegExp(_defRegs.join('|'));
    _defText = $('#app_body').find('div').filter(function () {
        return $(this).text().match(_defReg);
    });
    // _defText = $('#app_body').find('div:containsRegex(/' + _defRegs.join('|') + '/):first');
    if (_defense && _defense.style && _defense.style.width !== "" && _defText && _defText.text()) {
        var _percentage = _defense.style.width.substr(0, 5);
        var _maxHealth = false;
        if (/^Party\ Health\/Strength$/.test(_defText.text())) {
            _maxHealth = _defText.parent().prev().find('div:first')[0].style.width.substr(0, 5);
            _defText.css('left', 51).text('Party Health ' + _percentage + (_percentage.indexOf('%') > -1 ? '' : '%') + ' / Strength ' + _maxHealth + (_maxHealth.indexOf('%') > -1 ? '' : '%'));
        } else {
            _defText.css('left', 51).text(_defText.text() + '(' + _percentage + (_percentage.indexOf('%') > -1 ? ')' : '%)'));
        }
        return _defText.text();
    }
    return '';
}

function stunBar() {
    // add percentage to Cripple...
    var _stun = $('#app_body div > img[src$="nm_stun_bar.gif"]:first');
    if (_stun.length > 0) {
        var _text = _stun.parent().next().children('div:first'),
            _ret;
        _stun = _stun[0].style.width.substr(0, 5);
        _ret = _text.text() + ': ' + _stun + (_stun.indexOf('%') > -1 ? '' : '%').replace('Need ', '').replace('Fill to ', '').toLowerCase();
        _text.text(_text.text() + ' ' + _stun + (_stun.indexOf('%') > -1 ? '' : '%'));
        return _ret;
    }
    return '';
}

function linkMonsters() {
    console.log('linkMonsters');
    // link facebook to web4...
    $('div[id*="link_copy_"]').each(function (_i, _e) {
        var linkText = $('input', _e).val();
        linkText = linkText.replace('apps.facebook.com', 'web4.castleagegame.com');
        linkText = linkText.replace('castle_age', 'castle_ws');
        $('input', _e).val(linkText);
    });
}

/******************************************************************************************************************************************************************************
 *******************************************************************************************************************************************************************************
 *************    ARENA BATTLE *************************************************************************************************************************************************
 *******************************************************************************************************************************************************************************
 ******************************************************************************************************************************************************************************/
var LostArenaIds = item.get('LostArenaIds', []);
var FarmArenaIds = eliminateDuplicates(item.get('FarmArenaIds', ['100000433761803']));
item.set('FarmArenaIds', FarmArenaIds);
var DeadArenaIds = [];
var chainArenaId = 0;
var chainArenaRankMin = item.get('chainArenaRankMin', 2);
var chainArenaPointMin = parseInt(item.get('chainArenaPointMin', 100));
var maxArenaTokens = parseInt(item.get('MaxArenaTokens', 45));
var ArenaTimer;
var arenaStarted = item.get('ArenaStarted', false);
function cabf_arenabattlefilter() {
    var _storedFarm = item.get('cabfPageArenaDuelPoints', '100000433761803');
    var _sel = $('#cabfTargetSelect');
    addArenaDuelBoard('#arena_mid');
    _sel = $('#cabfTargetSelect');
    $.each(FarmArenaIds, function (_i, _e) {
        try {
            if (item.get('cabfCleanCheck', 'false') == 'false') {
                _sel.append('<option value="' + _e + '" ' + (_storedFarm == _e ? 'selected = "selected"' : '') + ' >' + _e + '</option>');
            } else {
                if (LostArenaIds.lastIndexOf(_e) < 0 && guildIDs.lastIndexOf(_e) < 0) {
                    _sel.append('<option value="' + _e + '" ' + (_storedFarm == _e ? 'selected = "selected"' : '') + ' >' + _e + '</option>');
                } else {
                    var _list = (LostArenaIds.lastIndexOf(_e) >= 0 ? "LostArenaIds" : (guildIDs.lastIndexOf(_e) >= 0 ? "guildIDs" : "LostArenaIds or guildIDs"));
                    console.log("FarmArenaIds " + _e + " is in " + _list + "! So, don't add it to farm list.");
                }
            }
        } catch (err) {
            console.log("Error: FarmArenaIds " + _e, err);
        }
    });
    _sel.change(function () {
        _storedFarm = $(this).find("option:selected").text();
        item.set('cabfPageArenaDuelPoints', _storedFarm);
        console.log("ToDo set revenge button");
        arenaDuelFarmButton(_storedFarm);
        $('#farmKeep').attr('href', "keep.php?casuser=" + _storedFarm);
    });
    $('#farmKeep').attr('href', "keep.php?casuser=" + _storedFarm);
    arenaDuelFarmButton(_storedFarm);
    $('#autocompleteRemove').autocomplete({
        source : FarmArenaIds
    });
    $('#RemoveButton').button();
    $('#RemoveButton').click(function () {
        var valId = $("#autocompleteRemove").val();
        if (confirm('Are you sure to retreive ' + valId + ' from farm targets?')) {
            var index = FarmArenaIds.indexOf(valId);
            FarmArenaIds.splice(index, 1);
            $("#cabfTargetSelect option[value='" + valId + "']").remove();
        }
    });
    try {
        if (item.get('cabfRefillTokens', 'false') == 'true') {
            $('#refillTokens')[0].checked = true;
        } else {
            $('#refillTokens')[0].checked = false;
        }
        $('#refillTokens').change(function () {
            if (this.checked) {
                item.set('cabfRefillTokens', 'true');
            } else {
                item.set('cabfRefillTokens', 'false');
            }
            console.log("cabfRefillTokens", item.get('cabfRefillTokens', 'false'));
        });
    } catch (e) {
        item.set('cabfRefillTokens', 'false');
        console.error(e);
    }
    $('#cleanCheck').attr('title', 'Always don\'t list all lost, dead, and my guild.');
    $('#CleanButton').button();
    $('#CleanButton').attr('title', 'Don\'t list all lost, dead, and my guild.');
    $('#CleanButton').click(function () {
        console.log("Clean");
        var _select = $('#cabfTargetSelect'),
            _selectedFarm = item.get('cabfPageArenaDuelPoints', '100000433761803');

        _select.html(' ');
        $.each(FarmArenaIds, function (_i, _e) {
            try {
                if (LostArenaIds.lastIndexOf(_e) < 0 && guildIDs.lastIndexOf(_e) < 0 && DeadArenaIds.lastIndexOf(_e) < 0) {
                    _select.append('<option value="' + _e + '" ' + (_selectedFarm == _e ? 'selected = "selected"' : '') + ' >' + _e + '</option>');
                } else {
                    var _list = (LostArenaIds.lastIndexOf(_e) >= 0 ? "LostArenaIds" : (guildIDs.lastIndexOf(_e) >= 0 ? "guildIDs" : "LostArenaIds or guildIDs"));
                    console.log("FarmArenaIds " + _e + " is in " + _list + "! So, don't add it to farm list!");
                }
            } catch (err) {
                console.log("Error: FarmArenaIds " + _e, err);
            }
        });
        item.set('cabfCleanCheck', 'true');
        $('#cleanCheck')[0].checked = true;
    });
    $('#ClearButton').button();
    $('#ClearButton').click(function () {
        console.log("Clear");
        if (confirm('Are you sure to clear target from looses definitively?')) {
            var _select = $('#cabfTargetSelect'),
                _selectedFarm = item.get('cabfPageArenaDuelPoints', '100000433761803'),
                _delArray = [];

            _select.html(' ');
            $.each(FarmArenaIds, function (_i, _e) {
                try {
                    if (LostArenaIds.lastIndexOf(_e) < 0 && guildIDs.lastIndexOf(_e) < 0) {
                        _select.append('<option value="' + _e + '" ' + (_selectedFarm == _e ? 'selected = "selected"' : '') + ' >' + _e + '</option>');
                    } else {
                        var _list = (LostArenaIds.lastIndexOf(_e) >= 0 ? "LostArenaIds" : (guildIDs.lastIndexOf(_e) >= 0 ? "guildIDs" : "LostArenaIds or guildIDs"));
                        _delArray.push(FarmArenaIds.indexOf(_e));
                        console.log("FarmArenaIds " + _e + " is in " + _list + "! So, cleared it.");
                    }
                } catch (err) {
                    console.log("Error: FarmArenaIds " + _e, err);
                }
            });
            console.log("Before clear FarmArenaIds: length=" + FarmArenaIds.length);
            for (var i = 0; i < _delArray.length; i++) {
                FarmArenaIds.splice(_delArray[i], 1);
            }
            console.log("After clear FarmArenaIds: length=" + FarmArenaIds.length);
            item.set('FarmArenaIds', FarmArenaIds);
        }
    });
    $('#BlackList').resizable({
        handles : "se, e, s",
        maxWidth : "260px",
        minWidth : "75px"
    });
    $('#BlackList')[0].value = JSON.stringify(guildIDs);
    $('#BlackList').change(function () {
        item.set('guildIDs', JSON.parse(this.value));
        guildIDs = JSON.parse(this.value);
    });
    $('#UpdateMyGuild').button();
    $('#UpdateMyGuild').click(function () {
        checkMyGuildIds(reloadArena);
    });
    try {
        if (item.get('cabfRefillTokens', 'false') == 'true') {
            $('#cleanCheck')[0].checked = true;
        } else {
            $('#cleanCheck')[0].checked = false;
        }
        $('#cleanCheck').change(function () {
            if (this.checked) {
                item.set('cabfCleanCheck', 'true');
            } else {
                item.set('cabfCleanCheck', 'false');
            }
            console.log("cabfCleanCheck", item.get('cabfCleanCheck', 'false'));
        });
    } catch (e) {
        item.set('cabfCleanCheck', 'false');
        console.error(e);
    }
    $('#targetMinRank')[0].value = chainArenaRankMin;
    $('#targetMinRank').change(function () {
        item.set('chainArenaRankMin', this.value);
        chainArenaRankMin = this.value;
    });
    $('#targetMinPoint')[0].value = chainArenaPointMin;
    $('#targetMinPoint').change(function () {
        item.set('chainArenaPointMin', this.value);
        chainArenaPointMin = parseInt(this.value);
    });
    $('#MaxArenaTokens')[0].value = maxArenaTokens;
    $('#MaxArenaTokens').change(function () {
        item.set('MaxArenaTokens', this.value);
        maxArenaTokens = parseInt(this.value);
    });
    $('#StopButton').button();
    $('#StopButton').click(function () {
        console.log("Stop");
        arenaStarted = false;
        item.set('ArenaStarted', arenaStarted);
        window.clearTimeout(ArenaTimer);
        item.set('ArenaTimer', false);
    });
    $('#StartButton').button();
    $('#StartButton').click(function () {
        console.log("Start");
        arenaStarted = true;
        item.set('ArenaStarted', arenaStarted);
        item.set('ArenaTimer', true);
        window.clearTimeout(ArenaTimer);
        ArenaTimer = window.setTimeout(chainArena, 5000);
    });
}

function arenaRefill() {
    try {
        if (item.get('cabfRefillTokens', 'false') == 'true') {
            var button = $("input[src*='arena_10_token_refill_btn.jpg']");
            console.log (1, "Refill to burn Arena Health");
            button.click();
        }
        window.clearTimeout(ArenaTimer);
        ArenaTimer = window.setTimeout(chainArena, 1000);
    } catch (err) {
        console.error("ERROR in Refill to burn Arena Health: " + err);
        window.clearTimeout(ArenaTimer);
        ArenaTimer = window.setTimeout(chainArena, 1000);
    }
}

function arenaControlHealthAndTokens() {
    var arenaHealth = $("div img[src*='graphics/orange_healthbar.jpg']"),
        arenaHealthWidth = "",
        currentTokens = parseInt($('#guild_token_current_value').text());
    if (arenaHealth.length===0) {
        return true;
    }
    arenaHealthWidth=/width:\d+/i.exec(arenaHealth[0].outerHTML)[0];
    if (!arenaHealthWidth.match("width:0")) {
        if (currentTokens>0) {
            return true;
        } else {
            arenaRefill();
            return false;
        }
    }
    return currentTokens>=maxArenaTokens;
}

function chainArena() {
    console.log("chainArena");
    if (arenaControlHealthAndTokens()) {
        try {
            var _button = $("input[src*='war_duelagainbtn2.gif']");
            if (_button.length > 0) {
                var target = $('#arena_duel input[name="target_id"]');
                chainArenaId = target.attr("value");
                if (LostArenaIds.lastIndexOf(chainArenaId) < 0 && guildIDs.lastIndexOf(chainArenaId) < 0 && DeadArenaIds.lastIndexOf(chainArenaId) < 0) {
                    _button.click();
                } else {
                    var _list = (LostArenaIds.lastIndexOf(chainArenaId) >= 0 ? "LostArenaIds" : (guildIDs.lastIndexOf(chainArenaId) >= 0 ? "guildIDs" : "LostArenaIds or guildIDs"));
                    console.log("FarmArenaIds " + chainArenaId + " is in " + _list + "! So, don't chain it.");
                    window.clearTimeout(ArenaTimer);
                    ArenaTimer = window.setTimeout(chainArenaNext, 1000, chainArenaId);
                }
            } else {
                window.clearTimeout(ArenaTimer);
                ArenaTimer = window.setTimeout(chainArenaById, 1000, chainArenaId);
            }
        } catch (e) {
            console.log("chainArena", e);
            window.clearTimeout(ArenaTimer);
            ArenaTimer = window.setTimeout(chainArenaById, 1000, chainArenaId);
        }
    } else {
        reloadArena();
    }
}

function sortArenaTarget(a, b) {
    var rankA = /Rank\ (\d+)/.exec($('div>div:contains("Rank")', a).text().trim())[1],
        rankB = /Rank\ (\d+)/.exec($('div>div:contains("Rank")', b).text().trim())[1];
    if (rankB===rankA) {
        var levelA = /level\: (\d+)/.exec($('div>div:contains("level\:")', a).text().trim())[1],
            levelB = /level\: (\d+)/.exec($('div>div:contains("level\:")', b).text().trim())[1];
        return levelA-levelB;
    }
    return rankB-rankA;
}

function chainArenaById(id) {
    console.log("chainArenaId", id);
    if (arenaControlHealthAndTokens()) {
        try {
            var _button,
                ready = false;
            if (id>0) {
                if (LostArenaIds.lastIndexOf(id) < 0 && guildIDs.lastIndexOf(id) < 0 && DeadArenaIds.lastIndexOf(id) < 0) {
                    $('#arena_mid #battle_person').sort(sortArenaTarget).each(function (_i, _e) {
                        if (!ready) {
                            var temp_id = $("input[name='target_id']", _e).attr("value");
                            if (id == temp_id) {
                                var _text = $('div>div:contains("Rank")', _e).text().trim();
                                var _rank = /Rank\ (\d+)/.exec(_text)[1];
                                if (parseInt(_rank) >= chainArenaRankMin) {
                                    _button = $("input[src*='arena_btn_duel.gif']", _e);
                                    if (_button.length > 0) {
                                        chainArenaId = temp_id;
                                        ready = true;
                                    }
                                }
                            }
                        }
                    });
                } else {
                    var _list = (LostArenaIds.lastIndexOf(id) >= 0 ? "LostArenaIds" : (guildIDs.lastIndexOf(id) >= 0 ? "guildIDs" : "LostArenaIds or guildIDs"));
                    console.log("FarmArenaIds " + id + " is in " + _list + "! So, don't chain it.");
                }
            }
            if (ready) {
                _button.click();
            } else {
                window.clearTimeout(ArenaTimer);
                ArenaTimer = window.setTimeout(chainArenaNext, 1000, id);
            }
        } catch (e) {
            console.log("Error: chainArenaId", e);
            reloadArena();
        }
    } else {
        reloadArena();
    }
}

function chainArenaNext(id) {
    console.log("chainArenaNext", id);
    if (arenaControlHealthAndTokens()) {
        try {
            var _button,
                ready = false;
            $('#arena_mid #battle_person').sort(sortArenaTarget).each(function (_i, _e) {
                if (!ready) {
                    var temp_id = $("input[name='target_id']", _e).attr("value");
                    if (id != temp_id && LostArenaIds.lastIndexOf(temp_id) < 0 && guildIDs.lastIndexOf(temp_id) < 0 && DeadArenaIds.lastIndexOf(temp_id) < 0) {
                        var _text = $('div>div:contains("Rank")', _e).text().trim();
                        var _rank = /Rank\ (\d+)/.exec(_text)[1];
                        if (parseInt(_rank) >= chainArenaRankMin) {
                            _button = $("input[src*='arena_btn_duel.gif']", _e);
                            chainArenaId = temp_id;
                            ready = true;
                        }
                    } else {
                        var _list = (LostArenaIds.lastIndexOf(temp_id) >= 0 ? "LostArenaIds" : (guildIDs.lastIndexOf(temp_id) >= 0 ? "guildIDs" : "LostArenaIds or guildIDs"));
                        console.log("FarmArenaIds " + temp_id + " is in " + _list + "! So, don't chain it.");
                    }
                }
            });
            if (ready) {
                _button.click();
            } else {
                reloadArena();
            }
        } catch (e) {
            console.log("Error: chainArenaNext", e);
            reloadArena();
        }
    } else {
        reloadArena();
    }
}

function arenaDuelFarmButton(id) {
    var _buttonDIV = $('#cabfFarmTargetButton');
    if (_buttonDIV.length > 0) {
        var _button = $("input[src*='arena_btn_duel.gif']:first");
        if (_button.length > 0) {
            _buttonDIV.html(_button.parent().parent().parent().html());
            $("input[name='target_id']", _buttonDIV).attr("value", id);
        } else {
            console.log("_button not found");
        }
    } else {
        console.log("_buttonDIV not found");
    }
}

function reloadArena() {
    // var _button;
    // var myHealth = parseInt($('#health_current_value').text().trim()),
    // xDelayHealth = 1;
    var xDelayHealth = 1;
    // console.log('at reloadArena, Health:', myHealth);
    // if (myHealth < 10) {
    // xDelayHealth = 6;
    // }
    chainArenaId = 0;
    window.clearTimeout(ArenaTimer);
    ArenaTimer = window.setTimeout(clickReloadArena, xDelayHealth * 5000);
}
function clickReloadArena() {
    var _button;
    window.clearTimeout(ArenaTimer);
    _button = $("a[href='arena.php']");
    _button.click();
    ArenaTimer = window.setTimeout(chainArena, 5000);
}

/******************************************************************************************************************************************************************************
 *******************************************************************************************************************************************************************************
 *************    STATS BATTLE *************************************************************************************************************************************************
 *******************************************************************************************************************************************************************************
 ******************************************************************************************************************************************************************************/
function addTargetTip(_e) {
    $(_e).mouseover(function (e) {
        var stats = item.get('stats', defaultStats),
            target_id = $('input[name="target_id"]', this).attr("value"),
            indexTarget = 0,
            victory = 0,
            defeat = 0;
        indexTarget = getTargetIndex(stats.targets, target_id);
        if (indexTarget >= 0) {
            victory = stats.targets[indexTarget].victory;
            defeat = stats.targets[indexTarget].defeat;
        }
        var tip = $(this).attr('title');
        $(this).attr('title', '');
        $(this).append('<div id="tooltip"><div class="tipHeader"></div><div class="tipBody">' + 'Hits Numbers : ' + parseInt(victory + defeat) + '<br>' + 'Victories : ' + victory + '<br>' + 'Defeats : ' + defeat + '<br>' + '</div><div class="tipFooter"></div></div>');
        $('#tooltip').css('top', e.pageY + 10);
        $('#tooltip').css('left', e.pageX + 20);
        $('#tooltip').fadeIn('500');
        $('#tooltip').fadeTo('10', 0.8);
        stats = null;
    }).mousemove(function (e) {
        $('#tooltip').css('top', e.pageY + 10);
        $('#tooltip').css('left', e.pageX + 20);
    }).mouseout(function () {
        $(this).attr('title', $('.tipBody').html());
        $(this).children('div#tooltip').remove();
    });
}
function getTargetIndex(array, target_id) {
    for (var i = 0; i < array.length; i++) {
        if (array[i].target_id === target_id) {
            return i;
        }
    }
    return -1;
}
function getTargetStat(target_id) {
    var stats = item.get('stats', defaultStats);
    var indexTarget = getTargetIndex(stats.targets, target_id);
    if (indexTarget >= 0) {
        var victory = parseInt(stats.targets[indexTarget].victory),
            defeat = parseInt(stats.targets[indexTarget].defeat);
        if ((victory + defeat) > 0) {
            if ((victory - defeat) > 0) {
                stats = null;
                indexTarget = null;
                return '<span class="GuildNumG">' + Math.round(((victory - defeat) * 100 / (victory + defeat))) + '%</span><br><span class="KeepLink"><a href="keep.php?casuser=' + target_id + '" target="_blank">Keep</a></span>';
            } else {
                stats = null;
                indexTarget = null;
                return '<span class="GuildNumR">' + Math.round(((victory - defeat) * 100 / (victory + defeat))) + '%</span><br><span class="KeepLink"><a href="keep.php?casuser=' + target_id + '" target="_blank">Keep</a></span>';
            }
        }
    }
    stats = null;
    indexTarget = null;
    return '<span class="GuildNum">0%</span><br><span class="KeepLink"><a href="keep.php?casuser=' + target_id + '" target="_blank">Keep</a></span>';
}
function battleStats() {
    var stats = item.get('stats', defaultStats),
        new_data = false;
    if (($('#results_main_wrapper>div').length > 0) || ($('div[class="result_body"]>div').length > 0)) {
        console.log("Battle Stats");
        var target = $('#results_main_wrapper input[name="target_id"]'),
            target_id = 0;
        if (target.length <= 0) {
            target = $('div[class="result_body"] input[name="target_id"]');
            target_id = 0;
        }
        /*console.log("target=",target);
        console.log("target.length=",target.length);
        console.log('target.attr("value")=',target.attr("value"));*/
        if (target.length > 0) {
            target_id = target.attr("value");
            indexTarget = getTargetIndex(stats.targets, target_id);
            if (indexTarget < 0) {
                var newTarget = {
                    "target_id" : target_id,
                    "victory" : 0,
                    "defeat" : 0
                };
                stats.targets.push(newTarget);
                indexTarget = getTargetIndex(stats.targets, target_id);
                new_data = true;
                newTarget = null;
            }
            if ($('#results_main_wrapper>div:contains("VICTORY")').length > 0 || $('#results_main_wrapper>div[style*="conqduel_victory2.jpg"]').length > 0) {
                console.log("VICTORY");
                stats.targets[indexTarget].victory++;
                new_data = true;
                window.clearTimeout(NormalTimer);
                NormalTimer = window.setTimeout(farmNormalBattle, 1000, target_id);
            } else if ($('#results_main_wrapper>div:contains("DEFEAT")').length > 0 || $('#results_main_wrapper>div[style*="conqduel_defeat2.jpg"]').length > 0) {
                console.log("DEFEAT");
                stats.targets[indexTarget].defeat++;
                new_data = true;
            } else if ($('#arena_duel').length > 0) {
                console.log("ARENA RESULT");
                if ($('div[style*="guild_battle_result_top"]>div>div:contains("VICTORY")').length > 0) {
                    console.log("ARENA VICTORY");
                    stats.targets[indexTarget].victory++;
                    new_data = true;
                    try {
                        var _text = $('div[style*="war_fort_battlemidrepeat.jpg"]').text().trim();
                        var _points = /(\d+)\ Arena\ Points\ and/.exec(_text)[1];
                        console.log("_points=", _points);
                        if (_points === 0) {
                            chainArenaId = 0;
                            if (DeadArenaIds.lastIndexOf(target_id) < 0) {
                                DeadArenaIds.push(target_id);
                                console.log("DeadArenaIds", DeadArenaIds);
                            }
                            window.clearTimeout(ArenaTimer);
                            ArenaTimer = window.setTimeout(chainArenaNext, 1000, target_id);
                        } else if (target_id == 100000433761803) {
                            console.log("100000433761803");
                            chainArenaId = target_id;
                            window.clearTimeout(ArenaTimer);
                            ArenaTimer = window.setTimeout(chainArena, 1000);
                        } else if (_points > chainArenaPointMin) {
                            console.log("_points>" + chainArenaPointMin);
                            if (_points > 130) {
                                console.log("_points>130");
                                try {
                                    if (FarmArenaIds.lastIndexOf(target_id) < 0) {
                                        FarmArenaIds.push(target_id);
                                        item.set('FarmArenaIds', FarmArenaIds);
                                        console.log("FarmArenaIds = ", FarmArenaIds);
                                        $('#cabfTargetSelect').append('<option value="' + target_id + '" >' + target_id + '</option>');
                                    }
                                } catch (err) {
                                    console.log("FarmArenaIds ERROR", err);
                                }
                            }
                            chainArenaId = target_id;
                            window.clearTimeout(ArenaTimer);
                            ArenaTimer = window.setTimeout(chainArena, 1000);
                        } else {
                            console.log("else chainArenaNext");
                            chainArenaId = 0;
                            window.clearTimeout(ArenaTimer);
                            ArenaTimer = window.setTimeout(chainArenaNext, 2000, target_id);
                        }
                    } catch (e) {
                        console.log("UNKNOWN ERROR", e);
                    }
                }
                if ($('div[style*="guild_battle_result_top"]>div>div:contains("DEFEAT")').length > 0) {
                    console.log("ARENA DEFEAT");
                    stats.targets[indexTarget].defeat++;
                    new_data = true;
                    chainArenaId = 0;
                    if (LostArenaIds.lastIndexOf(target_id) < 0) {
                        LostArenaIds.push(target_id);
                        item.set('LostArenaIds', LostArenaIds);
                    }
                    window.clearTimeout(ArenaTimer);
                    ArenaTimer = window.setTimeout(chainArenaNext, 1000, target_id);
                }
            } else if ($('#results_main_wrapper>div:contains("HEAL")').length > 0) {
                console.log("HEAL");
                var _e = $('#results_main_wrapper');
                if (_e.length > 0) {
                    var _credits = /GUARDIAN\ PATH\ CREDIT:\ YES/.exec(_e.text());
                    if (_credits !== null) {
                        window.clearTimeout(NormalTimer);
                        NormalTimer = window.setTimeout(farmNormalBattle, 1000, target_id);
                    }
                }
            } else if ($('#results_main_wrapper>div:contains("DISPEL")').length > 0) {
                console.log("DISPEL");
            } else if ($('#results_main_wrapper>div:contains("ILLUSION")').length > 0) {
                console.log("ILLUSION");
            } else if ($('#results_main_wrapper>div>div>span>div>img[src*="battle_defeat.gif"]').length > 0) {
                console.log("DEFEAT (battle_defeat.gif)");
                stats.targets[indexTarget].defeat++;
                new_data = true;
            } else if ($('#results_main_wrapper>div>div>span>div>img[src*="battle_victory.gif"]').length > 0) {
                console.log("VICTORY (battle_victory.gif)");
                stats.targets[indexTarget].victory++;
                new_data = true;
            } else if ($('#results_main_wrapper>div[style*="festival_duelchamp_defeat.jpg"]').length > 0) {
                console.log("DEFEAT (festival_duelchamp_defeat.jpg)");
                stats.targets[indexTarget].defeat++;
                new_data = false;
                chainId = 0;
                if (LostIds.lastIndexOf(target_id) < 0) {
                    LostIds.push(target_id);
                    item.set('lostids', LostIds);
                }
                window.clearTimeout(FestTimer);
                FestTimer = window.setTimeout(chainFestNext, 1000, target_id);
            } else if ($('#results_main_wrapper>div[style*="festival_duelchamp_victory.jpg"]').length > 0) {
                console.log("VICTORY (festival_duelchamp_victory.jpg)");
                stats.targets[indexTarget].victory++;
                new_data = false;
                try {
                    var _textVictory = $('#results_main_wrapper>div[style*="festival_duelchamp_victory.jpg"]').text().trim();
                    var _pointsVictory = /(\d+)\ Champion\ Points!/.exec(_textVictory)[1];
                    console.log("_points=", _pointsVictory);
                    if (_pointsVictory === 0) {
                        chainId = 0;
                        if (DeadIds.lastIndexOf(target_id) < 0) {
                            DeadIds.push(target_id);
                            console.log("DeadIds", DeadIds);
                        }
                        window.clearTimeout(FestTimer);
                        FestTimer = window.setTimeout(chainFestNext, 1000, target_id);
                    } else if (target_id == 100000433761803) {
                        console.log("100000433761803");
                        chainId = target_id;
                        window.clearTimeout(FestTimer);
                        FestTimer = window.setTimeout(chainFest, 1000);
                    } else if (_pointsVictory > chainPointMin) {
                        console.log("_points>" + chainPointMin);
                        if (_pointsVictory > 11) {
                            console.log("_points>11");
                            try {
                                if (FarmIds.lastIndexOf(target_id) < 0) {
                                    FarmIds.push(target_id);
                                    item.set('farmids', FarmIds);
                                    console.log("FarmIds = ", FarmIds);
                                    $('#cabfTargetSelect').append('<option value="' + target_id + '" >' + target_id + '</option>');
                                }
                            } catch (err) {
                                console.log("farmids ERROR", err);
                            }
                        }
                        chainId = target_id;
                        window.clearTimeout(FestTimer);
                        FestTimer = window.setTimeout(chainFest, 1000);
                    } else {
                        console.log("else chainFestNext");
                        chainId = 0;
                        window.clearTimeout(FestTimer);
                        FestTimer = window.setTimeout(chainFestNext, (10 - _pointsVictory) * 1000, target_id);
                    }
                } catch (e) {
                    console.log("UNKNOWN ERROR", e);
                }
            } else {
                console.log("UNKNOWN RESULT");
                new_data = false;
            }
            target_id = null;
        } else {
            var myHealth = parseInt($('#health_current_value').text().trim()),
                xDelayHealth = 1,
                xDelayArenaHealth = 10,
                _textRes ;
            console.log('at battleStats, Health:', myHealth);
            if (myHealth < 10) {
                xDelayHealth = 30;
            }
            if ($('#arena_mid').length > 0) {
                if (chainArenaId > 0) {
                    _textRes = $('#results_main_wrapper>div[class="results"]>div[class="result"]>span[class="result_body"]').text().trim();
                    console.log(_textRes);
                    /*var _coins= /You need more Stamina to undertake this action/.exec($('#results_main_wrapper>div>div>div>div').text().trim());*/
                    if (_textRes.match('Your opponent is dead or too weak to battle.')) {
                        if (DeadIds.lastIndexOf(chainArenaId) < 0) {
                            DeadIds.push(chainArenaId);
                        }
                        console.log("DeadIds", DeadIds);
                        window.clearTimeout(ArenaTimer);
                        ArenaTimer = window.setTimeout(chainArenaNext, xDelayArenaHealth * 1000, chainArenaId);
                    }
                    if (_textRes.match('Patience Warrior. You cannot initiate battle again so soon.')) {
                        window.clearTimeout(ArenaTimer);
                        ArenaTimer = window.setTimeout(chainArenaById, xDelayArenaHealth * 1000, chainArenaId);
                    }
                    if (_textRes.match('You are too weak to battle. You need at least 10 health.')) {
                        window.clearTimeout(ArenaTimer);
                        ArenaTimer = window.setTimeout(chainArena, xDelayArenaHealth * 1000);
                    }
                    if (_textRes.match('Out Of Tokens: You do not have enough arena tokens to engage in more battles, wait for a recharge or purchase a refill!')) {
                        var arenaHealth = $("div img[src*='graphics/orange_healthbar.jpg']"), arenaHealthWidth = "";
                        arenaHealthWidth=/width:\d+/i.exec(arenaHealth[0].outerHTML)[0];
                        if (!arenaHealthWidth.match("width:0")) {
                            arenaRefill();
                        } else {
                            window.clearTimeout(ArenaTimer);
                            ArenaTimer = window.setTimeout(chainArena, xDelayArenaHealth * 1000);
                        }
                    }
                    /*console.log('#############################################',_coins); */
                    chainArenaId = 0;
                    window.clearTimeout(ArenaTimer);
                    ArenaTimer = window.setTimeout(chainArena, xDelayArenaHealth * 1000);
                } else {
                    window.clearTimeout(ArenaTimer);
                    ArenaTimer = window.setTimeout(chainArena, xDelayArenaHealth * 1000);
                }
            } else {
                if (chainId > 0) {
                    _textRes = $('#results_main_wrapper>div[class="results"]>div[class="result"]>span[class="result_body"]').text().trim();
                    console.log(_textRes);
                    /*var _coins= /You need more Stamina to undertake this action/.exec($('#results_main_wrapper>div>div>div>div').text().trim());*/
                    if (_textRes.match('Your opponent is dead or too weak to battle.')) {
                        if (DeadIds.lastIndexOf(chainId) < 0) {
                            DeadIds.push(chainId);
                        }
                        console.log("DeadIds", DeadIds);
                        window.clearTimeout(ArenaTimer);
                        ArenaTimer = window.setTimeout(chainFestNext, xDelayHealth * 1000, chainId);
                    }
                    if (_textRes.match('Patience Warrior. You cannot initiate battle again so soon.')) {
                        window.clearTimeout(ArenaTimer);
                        ArenaTimer = window.setTimeout(chainFestId, xDelayHealth * 1000, chainId);
                    }
                    if (_textRes.match('You are too weak to battle. You need at least 10 health.')) {
                        window.clearTimeout(ArenaTimer);
                        ArenaTimer = window.setTimeout(chainFest, xDelayHealth * 1000);
                    }
                    /*console.log('#############################################',_coins); */
                    chainId = 0;
                    window.clearTimeout(ArenaTimer);
                    ArenaTimer = window.setTimeout(chainFest, xDelayHealth * 1000);
                } else {
                    window.clearTimeout(ArenaTimer);
                    ArenaTimer = window.setTimeout(chainFest, xDelayHealth * 1000);
                }
            }
        }
        target = null;
    }
    if (new_data)
        item.set('stats', stats);
    stats = null;
}
var LostIds = item.get('lostids', []);
var FarmIds = eliminateDuplicates(item.get('farmids', ['100000433761803']));
item.set('farmids', FarmIds);
var DeadIds = [];
var defaultGuildIDs = [];
var guildIDs = item.get('guildIDs', defaultGuildIDs);
var chainId = 0;
var chainRankMin = item.get('chainRankMin', 12);
var chainPointMin = parseInt(item.get('chainPointMin', 10));
var FestTimer;
function chainFest() {
    console.log("chainFest");
    try {
        var _button = $("input[src*='festival_duelchamp_duelagain_btn.gif']");
        if (_button.length > 0) {
            var target = $('#results_main_wrapper input[name="target_id"]');
            chainId = target.attr("value");
            if (LostIds.lastIndexOf(chainId) < 0 && guildIDs.lastIndexOf(chainId) < 0 && DeadIds.lastIndexOf(chainId) < 0) {
                _button.click();
            } else {
                var _list = (LostIds.lastIndexOf(chainId) >= 0 ? "LostIds" : (guildIDs.lastIndexOf(chainId) >= 0 ? "guildIDs" : "LostIds or guildIDs"));
                console.log("FarmIds " + chainId + " is in " + _list + "! So, don't chain it.");
                window.clearTimeout(FestTimer);
                FestTimer = window.setTimeout(chainFestNext, 1000, chainId);
            }
        } else {
            window.clearTimeout(FestTimer);
            FestTimer = window.setTimeout(chainFestId, 1000, chainId);
        }
    } catch (e) {
        console.log("chainFest", e);
        window.clearTimeout(FestTimer);
        FestTimer = window.setTimeout(chainFestId, 1000, chainId);
    }
}

function chainFestId(id) {
    try {
        console.log("chainFestId", id);
        var _button,
            ready = false;
        if (id) {
            if (LostIds.lastIndexOf(id) < 0 && guildIDs.lastIndexOf(id) < 0 && DeadIds.lastIndexOf(id) < 0) {
                $('#battleList>div').each(function (_i, _e) {
                    if (!ready) {
                        var temp_id = $("input[name='target_id']", _e).attr("value");
                        if (id == temp_id) {
                            var _text = $('div>div[style*="padding: 33px 0 0 0px;"]', _e).text().trim();
                            var _rank = /Rank\ (\d+)/.exec(_text)[1];
                            if (parseInt(_rank) >= chainRankMin) {
                                _button = $("input[src*='festival_duelchamp_challenge_btn.gif']", _e);
                                if (_button.length > 0) {
                                    chainId = temp_id;
                                    ready = true;
                                }
                            }
                        }
                    }
                });
            } else {
                var _list = (LostIds.lastIndexOf(id) >= 0 ? "LostIds" : (guildIDs.lastIndexOf(id) >= 0 ? "guildIDs" : "LostIds or guildIDs"));
                console.log("FarmIds " + id + " is in " + _list + "! So, don't chain it.");
            }
        }
        if (ready) {
            _button.click();
        } else {
            window.clearTimeout(FestTimer);
            FestTimer = window.setTimeout(chainFestNext, 1000, id);
        }
    } catch (e) {
        console.log("Error: chainFestId", e);
        reloadFest();
    }
}

function chainFestNext(id) {
    try {
        console.log("chainFestNext", id);
        var _button,
            ready = false;
        if (id) {
            $('#battleList>div').each(function (_i, _e) {
                if (!ready) {
                    var temp_id = $("input[name='target_id']", _e).attr("value");
                    if (id != temp_id && LostIds.lastIndexOf(temp_id) < 0 && guildIDs.lastIndexOf(temp_id) < 0 && DeadIds.lastIndexOf(temp_id) < 0) {
                        var _text = $('div>div[style*="padding: 33px 0 0 0px;"]', _e).text().trim();
                        var _rank = /Rank\ (\d+)/.exec(_text)[1];
                        if (parseInt(_rank) >= chainRankMin) {
                            _button = $("input[src*='festival_duelchamp_challenge_btn.gif']", _e);
                            chainId = temp_id;
                            ready = true;
                        }
                    } else {
                        var _list = (LostIds.lastIndexOf(temp_id) >= 0 ? "LostIds" : (guildIDs.lastIndexOf(temp_id) >= 0 ? "guildIDs" : "LostIds or guildIDs"));
                        console.log("FarmIds " + temp_id + " is in " + _list + "! So, don't chain it.");
                    }
                }
            });
        }
        if (ready) {
            _button.click();
        } else {
            reloadFest();
        }
    } catch (e) {
        console.log("Error: chainFestNext", e);
        reloadFest();
    }
}
function reloadFest() {
    var _button;
    var myHealth = parseInt($('#health_current_value').text().trim()),
        xDelayHealth = 1;
    console.log('at reloadFest, Health:', myHealth);
    if (myHealth < 10) {
        xDelayHealth = 6;
    }
    chainId = 0;
    window.clearTimeout(FestTimer);
    if (item.get('FestTimer', false)) {
        _button = $("img[src*='festival_duelchamp_question.gif']");
        _button.parent().attr("href", "festival_duel_battle.php");
        _button.parent().attr("onclick", "ajaxLinkSend('globalContainer', 'festival_duel_battle.php'); return false;");
        _button.parent().html('<img height="41" width="157" src="https://castleagegame1-a.akamaihd.net/graphics/festival_duelchampion/festival_duelchamp_enter.gif" class="imgButton">');
        FestTimer = window.setTimeout(clickReloadFest, xDelayHealth * 5000);
    }
}
function clickReloadFest() {
    var _button;
    window.clearTimeout(FestTimer);
    _button = $("img[src*='festival_duelchamp_enter.gif']");
    _button.click();
    FestTimer = window.setTimeout(chainFest, 5000);
}

function festivalDuelStats() {
    var _storedFarm = item.get('cabfPageFestivalDuelPoints', '100000433761803');
    var _sel = $('#cabfTargetSelect');
    addFestivalDuelBoard('#battleList');
    _sel = $('#cabfTargetSelect');
    $.each(FarmIds, function (_i, _e) {
        try {
            if (item.get('cabfCleanCheck', 'false') == 'false') {
                _sel.append('<option value="' + _e + '" ' + (_storedFarm == _e ? 'selected = "selected"' : '') + ' >' + _e + '</option>');
            } else {
                if (LostIds.lastIndexOf(_e) < 0 && guildIDs.lastIndexOf(_e) < 0) {
                    _sel.append('<option value="' + _e + '" ' + (_storedFarm == _e ? 'selected = "selected"' : '') + ' >' + _e + '</option>');
                } else {
                    var _list = (LostIds.lastIndexOf(_e) >= 0 ? "LostIds" : (guildIDs.lastIndexOf(_e) >= 0 ? "guildIDs" : "LostIds or guildIDs"));
                    console.log("FarmIds " + _e + " is in " + _list + "! So, don't add it to farm list.");
                }
            }
        } catch (err) {
            console.log("Error: FarmIds " + _e, err);
        }
    });
    _sel.change(function () {
        _storedFarm = $(this).find("option:selected").text();
        item.set('cabfPageFestivalDuelPoints', _storedFarm);
        console.log("ToDo set revenge button");
        festivalDuelFarmButton(_storedFarm);
        $('#farmKeep').attr('href', "keep.php?casuser=" + _storedFarm);
    });
    _sel.after('<div><br></div><div id="cabfFarmTargetButton"><span>BUTTON</span></div><div><br></div><div>Min Rank : <input id="targetMinRank" type="number" min="0" max="18"></input></div><div><br></div><div>Min Points : <input id="targetMinPoint" type="number" min="0" max="18"></input></div><div><br></div><div><input id="autocompleteRemove"></input><button id="RemoveButton">Remove</button></div><div><br></div><div id="cabfFarmStopStartButton"><button id="StopButton">Stop</button><span> - </span><button id="StartButton">Start</button></div><div><br></div><div><input type="checkbox" id="cleanCheck"></input><button id="CleanButton">Clean</button></div><div><br></div><div><button id="ClearButton">Clear</button></div><div><br></div><div><span>Black List : </span><span><textarea id="BlackList" rows="5" cols="35" ></textarea></span></div></div>');
    $('#farmKeep').attr('href', "keep.php?casuser=" + _storedFarm);
    $('#targetMinRank')[0].value = chainRankMin;
    $('#targetMinRank').change(function () {
        item.set('chainRankMin', this.value);
        chainRankMin = this.value;
    });
    $('#targetMinPoint')[0].value = chainPointMin;
    $('#targetMinPoint').change(function () {
        item.set('chainPointMin', this.value);
        chainPointMin = parseInt(this.value);
    });
    try {
        if (item.get('cabfCleanCheck', 'false') == 'true') {
            $('#cleanCheck')[0].checked = true;
        } else {
            $('#cleanCheck')[0].checked = false;
        }
        $('#cleanCheck').change(function () {
            if (this.checked) {
                item.set('cabfCleanCheck', 'true');
            } else {
                item.set('cabfCleanCheck', 'false');
            }
            console.log("cabfCleanCheck", item.get('cabfCleanCheck', 'false'));
        });
    } catch (e) {
        item.set('cabfCleanCheck', 'false');
        console.error(e);
    }
    festivalDuelFarmButton(_storedFarm);
    $('#autocompleteRemove').autocomplete({
        source : FarmIds
    });
    $('#RemoveButton').button();
    $('#RemoveButton').click(function () {
        var valId = $("#autocompleteRemove").val();
        if (confirm('Are you sure to retreive ' + valId + ' from farm targets?')) {
            var index = FarmIds.indexOf(valId);
            FarmIds.splice(index, 1);
            $("#cabfTargetSelect option[value='" + valId + "']").remove();
        }
    });
    $('#StopButton').button();
    $('#StopButton').click(function () {
        window.clearTimeout(FestTimer);
        item.set('FestTimer', false);
    });
    $('#StartButton').button();
    $('#StartButton').click(function () {
        item.set('FestTimer', true);
        window.clearTimeout(FestTimer);
        FestTimer = window.setTimeout(chainFest, 5000);
    });
    $('#CleanButton').button();
    $('#CleanButton').click(function () {
        var _select = $('#cabfTargetSelect'),
            _selectedFarm = item.get('cabfPageFestivalDuelPoints', '100000433761803');

        _select.html(' ');
        $.each(FarmIds, function (_i, _e) {
            try {
                if (LostIds.lastIndexOf(_e) < 0 && guildIDs.lastIndexOf(_e) < 0 && DeadIds.lastIndexOf(_e) < 0) {
                    _select.append('<option value="' + _e + '" ' + (_selectedFarm == _e ? 'selected = "selected"' : '') + ' >' + _e + '</option>');
                } else {
                    var _list = (LostIds.lastIndexOf(_e) >= 0 ? "LostIds" : (guildIDs.lastIndexOf(_e) >= 0 ? "guildIDs" : "LostIds or guildIDs"));
                    console.log("FarmIds " + _e + " is in " + _list + "! So, don't add it to farm list!");
                }
            } catch (err) {
                console.log("Error: FarmIds " + _e, err);
            }
        });
        item.set('cabfCleanCheck', 'true');
        $('#cleanCheck')[0].checked = true;
    });
    $('#ClearButton').button();
    $('#ClearButton').click(function () {
        if (confirm('Are you sure to clear target from looses definitively?')) {
            var _select = $('#cabfTargetSelect'),
                _selectedFarm = item.get('cabfPageFestivalDuelPoints', '100000433761803'),
                _delArray = [];

            _select.html(' ');
            $.each(FarmIds, function (_i, _e) {
                try {
                    if (LostIds.lastIndexOf(_e) < 0 && guildIDs.lastIndexOf(_e) < 0) {
                        _select.append('<option value="' + _e + '" ' + (_selectedFarm == _e ? 'selected = "selected"' : '') + ' >' + _e + '</option>');
                    } else {
                        var _list = (LostIds.lastIndexOf(_e) >= 0 ? "LostIds" : (guildIDs.lastIndexOf(_e) >= 0 ? "guildIDs" : "LostIds or guildIDs"));
                        _delArray.push(FarmIds.indexOf(_e));
                        console.log("FarmIds " + _e + " is in " + _list + "! So, cleared it.");
                    }
                } catch (err) {
                    console.log("Error: FarmIds " + _e, err);
                }
            });
            console.log("Before clear FarmIds: length=" + FarmIds.length);
            for (var i = 0; i < _delArray.length; i++) {
                FarmIds.splice(_delArray[i], 1);
            }
            console.log("After clear FarmIds: length=" + FarmIds.length);
            item.set('farmids', FarmIds);
        }
    });

    $('#BlackList').resizable({
        handles : "se, e, s",
        maxWidth : "260px",
        minWidth : "75px"
    });
    $('#BlackList')[0].value = JSON.stringify(guildIDs);
    $('#BlackList').change(function () {
        item.set('guildIDs', JSON.parse(this.value));
        guildIDs = JSON.parse(this.value);
    });
}

function festivalDuelFarmButton(id) {
    var _buttonDIV = $('#cabfFarmTargetButton');
    if (_buttonDIV.length > 0) {
        var _button = $("input[src*='festival_duelchamp_challenge_btn.gif']:first");
        if (_button.length > 0) {
            _buttonDIV.html(_button.parent().parent().parent().html());
            $("input[name='target_id']", _buttonDIV).attr("value", id);
        } else {
            console.log("_button not found");
        }
    } else {
        console.log("_buttonDIV not found");
    }
}

function eliminateDuplicates(arr) {
    var i,
        len = arr.length,
        out = [],
        obj = {};

    for (i = 0; i < len; i++) {
        obj[arr[i]] = 0;
    }
    for (i in obj) {
        out.push(i);
    }
    return out;
}

/******************************************************************************************************************************************************************************
 *******************************************************************************************************************************************************************************
 *************    NORMAL DUEL ***********************************************************************************************************************************************
 *******************************************************************************************************************************************************************************
 ******************************************************************************************************************************************************************************/
var NormalTimer;

function farmNormalBattle(id) {
    try {
        if (item.get('#normalFarmCheck', 'false') == 'true') {
            console.log("farmNormalBattle", id);
            var _button;
            _button = $("input[src*='war_duelagainbtn2.gif'],input[src*='war_invadeagainbtn.gif'],input[src*='war_healagainbtn.gif']");
            if (_button.length > 0) {
                if ($("div[style*='battle_top1.jpg']").length > 0) {
                    item.set('LASTfarmNormalBattle', $('#results_main_wrapper').html());
                }
                _button.click();
            } else {
                window.clearTimeout(NormalTimer);
            }
        } else {
            window.clearTimeout(NormalTimer);
        }
    } catch (e) {
        console.log("Error: farmNormalBattle", e);
        window.clearTimeout(NormalTimer);
    }
}

function normalDuelStats(id) {
    var _sel = $(id);
    addNormalDuelBoard(id);
    _sel = $('#cabfToggleNormal');
    _sel.html('<div>Farm: <input type="checkbox" id="normalFarmCheck"></input></div><div id="lastfarmnormalbattle"><button  id="btlastfarm">Last</button></div>');
    try {
        if (item.get('#normalFarmCheck', 'false') == 'true') {
            $('#normalFarmCheck')[0].checked = true;
        } else {
            $('#normalFarmCheck')[0].checked = false;
        }
        $('#normalFarmCheck').change(function () {
            if (this.checked) {
                item.set('#normalFarmCheck', 'true');
            } else {
                item.set('#normalFarmCheck', 'false');
            }
            console.log("#normalFarmCheck", item.get('#normalFarmCheck', 'false'));
        });
    } catch (e) {
        item.set('#normalFarmCheck', 'false');
        console.error(e);
    }
    $('#btlastfarm').click(function () {
        if ($("div[style*='battle_top1.jpg']").length > 0) {
            $('#results_main_wrapper').html(item.get('LASTfarmNormalBattle', ' '));
        }
    });
}

/******************************************************************************************************************************************************************************
 *******************************************************************************************************************************************************************************
 *************    QUEST ***********************************************************************************************************************************************
 *******************************************************************************************************************************************************************************
 ******************************************************************************************************************************************************************************/
var QuestTimer;

function farmQuestClick() {
    try {
        if (item.get('#questFarmCheck', 'false') == 'true') {
            console.log("farmQuestClick");
            var _button;
            _button = $("input[src*='quest_questagain2_btn.gif']");
            if (_button.length > 0) {
                _button.click();
            } else {
                _button = $("input[src*='quest_questagain_btn.gif']");
                if (_button.length > 0) {
                    var _levelDiv = $('div[style*="nt_topbar2"]');
                    if (_levelDiv.length > 0) {
                        var _levelText = _levelDiv.text().trim();
                        var _level = parseInt(/(?:Level\ )(\d+)/g.exec(_levelText)[1]);
                        console.log("farmQuestClick Level=", _level);
                        if (_level < 4) {
                            _button.click();
                        } else {
                            window.clearTimeout(QuestTimer);
                        }
                    } else {
                        window.clearTimeout(QuestTimer);
                    }
                } else {
                    var _required = parseInt(item.get('#questFarmEnergyMin', '0'));
                    var _current = parseInt($("#energy_current_value").text());
                    _button = $("div:contains('Do Quest Again!'):last input[src*='quest_quest_btn.gif']");
                    if (_button.length > 0) {

                        if (_current >= _required) {
                            _button.click();
                        }
                        else {
                            console.log("Current Energy: " + _current + ", needed " + _required + ". Retrying in 30 seconds.");
                            setTimeout(farmQuestClick, 30000);
                        }
                    } else {
                        window.clearTimeout(QuestTimer);
                    }
                }
            }
        } else {
            window.clearTimeout(QuestTimer);
        }
    } catch (e) {
        console.log("Error: farmQuestClick", e);
        window.clearTimeout(QuestTimer);
    }
}

function questFarm() {
    try {
        var _sel = $('#results_main_wrapper');
        addQuestDuelBoard('#results_main_wrapper');
        _sel = $('#cabfToggleQuest');
        _sel.html('<div>Farm: <input type="checkbox" id="questFarmCheck"></input>  </br> <input type="text" id="questFarmEnergyMin"></input>');
        if (item.get('#questFarmCheck', 'false') == 'true') {
            $('#questFarmCheck')[0].checked = true;
        } else {
            $('#questFarmCheck')[0].checked = false;
        }
        $('#questFarmCheck').change(function () {
            if (this.checked) {
                item.set('#questFarmCheck', 'true');
            } else {
                item.set('#questFarmCheck', 'false');
            }
            console.log("#questFarmCheck", item.get('#questFarmCheck', 'false'));
        });

        if ($.isNumeric(item.get('#questFarmEnergyMin', '0'))) {
            $('#questFarmEnergyMin').val(item.get('#questFarmEnergyMin', '0'));
        } else {
            $('#questFarmEnergyMin').val("0");
        }
        $('#questFarmEnergyMin').keyup(function () {
            if ($.isNumeric($("#questFarmEnergyMin").val()))
                item.set('#questFarmEnergyMin', $("#questFarmEnergyMin").val());
            else {
                $("#questFarmEnergyMin").val(item.get('#questFarmEnergyMin', '0'));
            }
        });
    } catch (e) {
        item.set('#questFarmCheck', 'false');
        console.error(e);
    }
}

/******************************************************************************************************************************************************************************
 *******************************************************************************************************************************************************************************
 *************    GUILD MEMBERS ***********************************************************************************************************************************************
 *******************************************************************************************************************************************************************************
 ******************************************************************************************************************************************************************************/
function checkMyGuildIds(callback) {

    function onError() {
        $().alert("Unable to use ajax");
    }
    function onSuccess(data) {
        try {
            var guildDiv = $("#guildv2_formation_middle", data),
                tempArray=[], i;
            if ($u.hasContent(guildDiv)) {
                var membersKeys=$("script:contains('initTowerSlots()')",data).text().match(/key=\\"(\d+)\\/gm);
                $.each(membersKeys, function (_i, _e) {
                    var res = /(\d+)/gm.exec(_e);
                    tempArray.push(parseInt(res[0]));
                });
                item.set('guildIDs', tempArray);
                guildIDs = item.get('guildIDs', []);
                console.log("my guild is updated with success");
                window.clearTimeout(ArenaTimer);
                ArenaTimer = window.setTimeout(callback, 1000);
            }
            return true;
        } catch (err) {
            console.error("ERROR in checkMyGuildIds: " + err.stack);
            return false;
        }
    }

    try {
        var params = {};
        myAjax('hundred_battle.php', params, onError, onSuccess);
        params = null;
        return true;
    } catch (err) {
        console.error("ERROR in testAjax : " + err);
        return false;
    }
}

/******************************************************************************************************************************************************************************
 *******************************************************************************************************************************************************************************
 *************    GUILD ESSENCES ***********************************************************************************************************************************************
 *******************************************************************************************************************************************************************************
 ******************************************************************************************************************************************************************************/
function myAjax(page, params, cbError, cbSuccess) {
    try {

        params = $u.hasContent(params) && $u.isPlainObject(params) && !$u.isEmptyObject(params) ? params : {};
        params.ajax = 1;

        if (!$u.hasContent(page) || !$u.isString(page)) {
            page = "index.php";
            params.adkx = 2;
        }

        if (!$u.hasContent(cbError) || !$u.isFunction(cbError)) {
            cbError = function (XMLHttpRequest, textStatus, errorThrown) {
                console.error("ajax: ", [XMLHttpRequest, textStatus, errorThrown]);
            };
        }

        if (!$u.hasContent(cbSuccess) || !$u.isFunction(cbSuccess)) {
            cbSuccess = function (data, textStatus, XMLHttpRequest) {
                console.log(2, "ajax:", [data, textStatus, XMLHttpRequest]);
            };
        }

        $.ajax({
            url : page,
            type : 'POST',
            data : params,
            error : function (XMLHttpRequest, textStatus, errorThrown) {
                cbError(XMLHttpRequest, textStatus, errorThrown);
            },

            success : function (data, textStatus, XMLHttpRequest) {
                data = "<div>" + data + "</div>";
                //console.log(2, "ajax", [data, textStatus, XMLHttpRequest]);
                cbSuccess(data, textStatus, XMLHttpRequest);
            }
        });

        return true;
    } catch (err) {
        console.error("ERROR in myAjax: " + err.stack);
        return false;
    }
}

function addToStorage(type, guild_id, guild_name, number) {
    var toggle = type[0].toUpperCase() + type.slice(1);
    var html = item.get('list' + toggle + 'Storage', '');

    if ($('#' + toggle + guild_id).length > 0) {
        $('#' + toggle + guild_id).html(number);
    } else {
        $('#cabfToggle' + toggle + 'Storage').html(html);
        $('#cabfToggle' + toggle + 'Storage').append('<div id="cabfGuildLink"><a href="guild_conquest_market.php?guild_id=' + guild_id + '" onclick="ajaxLinkSend(\'globalContainer\', \'guild_conquest_market.php?guild_id=' + guild_id + '\'); return false;">' + guild_name + '</a> : <span id="' + toggle + guild_id + '">' + number + '</span></div>');
    }
    item.set('list' + toggle + 'Storage', $('#cabfToggle' + toggle + 'Storage').html());
    toggle = null;
    html = null;
}

function removeFromStorage(type, guild_id) {
    var toggle = type[0].toUpperCase() + type.slice(1);
    if ($('#' + toggle + guild_id).length > 0) {
        $('#' + toggle + guild_id).parent().remove();
        item.set('list' + toggle + 'Storage', $('#cabfToggle' + toggle + 'Storage').html());
    }
    toggle = null;
}

function setEssence(storageDivs, guild_id, guild_name) {
    try {
        var essences = item.get('essences', defaultEssences);
        var guild_index = getEssenceIndex(essences, guild_id);
        if (guild_index < 0) {
            console.log("New guild");
        } else {
            delete essences[guild_index].guild_name;
            essences[guild_index].name = guild_name;
            storageDivs.each(function () {
                var essenceText = $(this).children().eq(0).text().split(/\W+/);
                essences[guild_index][essenceText[1].toLowerCase()] = essenceText[6] - essenceText[5];
                essenceText = null;
            });
            if (essences[guild_index].damage > 0) {
                addToStorage('damage', guild_id, guild_name, essences[guild_index].damage);
            } else {
                removeFromStorage('damage', guild_id);
            }
            if (essences[guild_index].attack > 0) {
                addToStorage('attack', guild_id, guild_name, essences[guild_index].attack);
            } else {
                removeFromStorage('attack', guild_id);
            }
            if (essences[guild_index].defense > 0) {
                addToStorage('defense', guild_id, guild_name, essences[guild_index].defense);
            } else {
                removeFromStorage('defense', guild_id);
            }
            if (essences[guild_index].health > 0) {
                addToStorage('health', guild_id, guild_name, essences[guild_index].health);
            } else {
                removeFromStorage('health', guild_id);
            }
            console.log("essences de " + guild_name + " : ", essences[guild_index]);
        }
        item.set('essences', essences);
        essence = null;
        guild_index = null;
        return true;
    } catch (err) {
        console.error("ERROR in setEssence for " + guild_name + " : " + err);
        return false;
    }
}

function searchEssence() {
    window.clearTimeout(FestTimer);
    var index = 0,
        nb = 0;

    function onError() {
        $().alert("Unable to use ajax");
    }

    function onSuccess(data) {
        var storageDivs = $("[id^='storage_']", data);
        var guild_id = $("[id^='guild_name_header']", data).children().eq(0).attr('href').split('=')[1];
        var guild_name = $("[id^='guild_name_header']", data).children().eq(0).text();
        setEssence(storageDivs, guild_id, guild_name);
        index++;
        $('#cabfEssenceTilte').html('Essences<br>scan at ' + Math.ceil(index * 100 / nb) + '%');
        essence = null;
        guild_id = null;
        guild_name = null;
    }

    try {
        var essencesArray = item.get('essences', defaultEssences);
        var params = {};

        $('#cabfToggleDamageStorage').html('');
        $('#cabfToggleAttackStorage').html('');
        $('#cabfToggleDefenseStorage').html('');
        $('#cabfToggleHealthStorage').html('');

        item.set('listDamageStorage', '');
        item.set('listAttackStorage', '');
        item.set('listDefenseStorage', '');
        item.set('listHealthStorage', '');
        nb = essencesArray.length;
        for (var i = 0; i < essencesArray.length; i++) {
            params.guild_id = essencesArray[i].guildId;
            myAjax('guild_conquest_market.php', params, onError, onSuccess);
        }
        essencesArray = null;
        params = null;
        return true;
    } catch (err) {
        console.error("ERROR in testAjax : " + err);
        return false;
    }
}

function getEssence(type) {
    try {
        var essencesArray = item.get('essences', defaultEssences);
        var MaxVal = -1;
        var MaxGuild = '';
        for (var i = 0; i < essencesArray.length; i++) {
            if (MaxVal < parseInt(essencesArray[i][type])) {
                MaxVal = parseInt(essencesArray[i][type]);
                MaxGuild = essencesArray[i].guildId;
            }
        }
        ajaxLinkSend('globalContainer', 'guild_conquest_market.php?guild_id=' + MaxGuild);
        essencesArray = null;
        MaxVal = null;
        MaxGuild = null;
    } catch (err) {
        console.error("ERROR in getEssence : " + err);
    }
}

function getEssenceIndex(array, guild_id) {
    for (var i = 0; i < array.length; i++) {
        if (array[i].guildId === guild_id) {
            return i;
        }
    }
    return -1;
}
function diagIOE() {
    if ($('#main_bntp').length > 0) {
        var defaultData = {};
        $('#main_bntp').append(_dialogIO);
        $("#dialogIO").dialog({
            modal : true,
            height : 410,
            width : 660,
            buttons : {
                "Export" : function () {
                    try {
                        $(this).children('#statsDg')[0].value = JSON.stringify(item.get('essences', defaultEssences), null, '\t');
                        $(this).children('#statsDg')[0].select();
                        console.log('Export succeed.');
                    } catch (e) {
                        console.log('Export failed : ', e);
                    }
                },
                "Import" : function () {
                    if (!$(this).children('#statsDg')[0].value || $(this).children('#statsDg')[0].value === null || $(this).children('#statsDg')[0].value === "") {
                        console.log('Error null value.');
                        return;
                    }
                    try {
                        item.set('essences', JSON.parse($(this).children('#statsDg')[0].value));
                        $(this).dialog("close");
                        console.log('Import succeed.');
                    } catch (e) {
                        console.log('Import failed : ', e);
                    }
                },
                "Insert non-existent" : function () {
                    if (!$(this).children('#statsDg')[0].value || $(this).children('#statsDg')[0].value === null || $(this).children('#statsDg')[0].value === "") {
                        console.log('Error null value.');
                        return;
                    }
                    try {
                        var essencesToMerge = JSON.parse($(this).children('#statsDg')[0].value),
                            essencesLocal = item.get('essences', defaultEssences),
                            newInserted = 0;

                        for (var i = 0; i < essencesToMerge.length; i++) {
                            var guildId = essencesToMerge[i].guildId;
                            var indexEssence = getEssenceIndex(essencesLocal, guildId);
                            if (indexEssence < 0) {
                                var newEssence = {
                                    "name" : essencesToMerge[i].guildId,
                                    "level" : essencesToMerge[i].level,
                                    "lastCheck" : essencesToMerge[i].lastCheck,
                                    "attack" : essencesToMerge[i].attack,
                                    "defense" : essencesToMerge[i].defense,
                                    "damage" : essencesToMerge[i].damage,
                                    "health" : essencesToMerge[i].health,
                                    "guildId" : essencesToMerge[i].guildId
                                };
                                essencesLocal.push(newEssence);
                                newInserted++;
                                newEssence = null;
                            }
                        }
                        item.set('essences', essencesLocal);
                        $(this).dialog("close");
                        console.log('Insert succeed. Total inserted: ' + newInserted);
                        essencesToMerge = null;
                        essencesLocal = null;
                        newInserted = null;
                    } catch (e) {
                        console.log('Insert failed : ', e);
                    }
                },
                Cancel : function () {
                    $(this).dialog("close");
                }
            },
            open : function (event, ui) {
                console.log('Import/Export Dialog opened.');
            }
        });
    }
}

/******************************************************************************************************************************************************************************
 *******************************************************************************************************************************************************************************
 *************    FILTERS BATTLE ***********************************************************************************************************************************************
 *******************************************************************************************************************************************************************************
 ******************************************************************************************************************************************************************************/
function cabf_filters() {

    cabf_connect();
    console.log("cabf_filters");

    $("#cabfHealthActionEarth").hide();
    $("#cabfConquestEarthFilterContainer").hide();

    /* Selection par dÃ©faut de la derniÃ¨re valeur d'options */
    $("select[name='amount']").each(function (_i, _e) {
        value = $('option:last-child', _e).text();
        $(_e).val(value);
    });

    /* Guild battle or 10vs10 battle*/
    if ($('#enemy_guild_tab,#your_guild_tab').length > 0) {

        // Switch between 10vs10 battle and Guild battle
        if ($('#enemy_new_guild_tab_1,#your_new_guild_tab_1').length > 0) {
            console.log('Guild battle');
            battleStats();
            cabf_guildbattlefilter();
        } else {
            console.log('10vs10 battle');
            battleStats();
            cabf_tenbattlefilter();
        }
    } else {
        /* Festival battle */
        if ($('#enemy_team_tab').length > 0 || $('#your_team_tab').length > 0) {
            console.log('Festival battle');
            battleStats();
            cabf_festivalbattlefilter();
        } else {
            /* Earth land conquest battle */
            if ($('#tower_1,#tower_2,#tower_3,#tower_4').length > 0) {
                console.log('Earth land conquest battle');
                /*battleStats();*/
                cabf_conquestearthfilter();
            } else {
                /* Mist land conquest battle */
                if ($('#your_guild_member_list_1').length > 0) {
                    console.log('Mist land conquest battle');
                    battleStats();
                    cabf_conquestmistfilter();
                    normalDuelStats('#guild_battle_section');
                } else {
                    /* Arena battle */
                    if ($('#arena_mid').length > 0) {
                        console.log('Arena battle');
                        battleStats();
                        cabf_arenabattlefilter();
                    } else {
                        /* Normal battle */
                        if ($('#blist_pulldown_select').length > 0) {
                            console.log('Normal battle');
                            if ($('div[style*="festival_duelchamp_top.jpg"]').length > 0) {
                                console.log('Festival Duel Battle');
                                festivalDuelStats();
                            }
                            if ($('div[style*="battle_top1.jpg"]').length > 0) {
                                console.log('Normal Duel Battle');
                                normalDuelStats('#battleList');
                            }
                            if ($('div[style*="war_conquest_header2.jpg"]').length > 0) {
                                console.log('Conquest Duel Battle');
                                normalDuelStats('#battleList');
                            }
                            battleStats();
                        }
                    }
                }
            }
        }
    }

    /* Alchemy */
    if ($('div[style*="alchfb_top.jpg"]').length > 0) {
        if (item.get('crafting', false)) {
            Craft(item.get('craftChoosen', craftList.LAVA_ORB));
        }
    }

    /* Quest */
    if ($('div[class*="quests_background"]').length > 0) {
        console.log('Quest');
        questFarm();

        window.clearTimeout(QuestTimer);
        if (item.get('#questFarmCheck', 'false') == 'true') {
            QuestTimer = window.setTimeout(farmQuestClick, 1000);
        }
    }

    /* Guild Essence */
    addEssenceBoard('#main_bntp');
    if ($('#storage_1').length > 0) {
        console.log('Guild Essence');
        var storageDivs = $("[id^='storage_']");
        var guild_id = $("[id^='guild_name_header']").children().eq(0).attr('href').split('=')[1];
        var guild_name = $("[id^='guild_name_header']").children().eq(0).text();
        setEssence(storageDivs, guild_id, guild_name);
        essence = null;
        guild_id = null;
        guild_name = null;
    }

    /* monsters */
    if ($('img[src*="monster_health_background.jpg"], [src*="nm_red.jpg"], [src*="nm_orange.jpg"],[src*="bar_dispel.gif"],[src*="nm_green.jpg"],[src*="seamonster_ship_health.jpg"],[src$="nm_stun_bar.gif"]').length > 0) {
        monsterBars();
        defenseBar();
        stunBar();
    }
    if ($('img[src*="list_btn_tabpublic_on.gif"]').length > 0) {
        linkMonsters();
    }
}

function diagIO() {
    if ($('#main_bntp').length > 0) {
        var defaultData = {};
        $('#main_bntp').append(_dialogIO);
        $("#dialogIO").dialog({
            modal : true,
            height : 410,
            width : 660,
            buttons : {
                "Export" : function () {
                    try {
                        $(this).children('#statsDg')[0].value = JSON.stringify(item.get('stats', defaultStats), null, '\t');
                        $(this).children('#statsDg')[0].select();
                        console.log('Export succeed.');
                    } catch (e) {
                        console.log('Export failed : ', e);
                    }
                },
                "Import" : function () {
                    if (!$(this).children('#statsDg')[0].value || $(this).children('#statsDg')[0].value === null || $(this).children('#statsDg')[0].value === "") {
                        console.log('Error null value.');
                        return;
                    }
                    try {
                        item.set('stats', JSON.parse($(this).children('#statsDg')[0].value));
                        $(this).dialog("close");
                        console.log('Import succeed.');
                    } catch (e) {
                        console.log('Import failed : ', e);
                    }
                },
                "Merge" : function () {
                    if (!$(this).children('#statsDg')[0].value || $(this).children('#statsDg')[0].value === null || $(this).children('#statsDg')[0].value === "") {
                        console.log('Error null value.');
                        return;
                    }
                    try {
                        var statsToMerge = JSON.parse($(this).children('#statsDg')[0].value),
                            statsLocal = item.get('stats', defaultStats);

                        for (var i = 0; i < statsToMerge.targets.length; i++) {
                            var target_id = statsToMerge.targets[i].target_id;
                            var indexTarget = getTargetIndex(statsLocal.targets, target_id);
                            if (indexTarget < 0) {
                                var newTarget = defaultData;
                                statsLocal.targets.push(newTarget);
                                indexTarget = getTargetIndex(statsLocal.targets, target_id);
                                newTarget = null;
                            }
                            statsLocal.targets[indexTarget].victory += statsToMerge.targets[i].victory;
                            statsLocal.targets[indexTarget].defeat += statsToMerge.targets[i].defeat;
                        }
                        item.set('stats', statsLocal);
                        $(this).dialog("close");
                        console.log('Merge succeed.');
                        statsToMerge = null;
                        statsLocal = null;
                    } catch (e) {
                        console.log('Merge failed : ', e);
                    }
                },
                "Insert non-existent" : function () {
                    if (!$(this).children('#statsDg')[0].value || $(this).children('#statsDg')[0].value === null || $(this).children('#statsDg')[0].value === "") {
                        console.log('Error null value.');
                        return;
                    }
                    try {
                        var statsToMerge = JSON.parse($(this).children('#statsDg')[0].value),
                            statsLocal = item.get('stats', defaultStats);

                        for (var i = 0; i < statsToMerge.targets.length; i++) {
                            var target_id = statsToMerge.targets[i].target_id;
                            var indexTarget = getTargetIndex(statsLocal.targets, target_id);
                            if (indexTarget < 0) {
                                var newTarget = {
                                    "target_id" : target_id,
                                    "victory" : statsToMerge.targets[i].victory,
                                    "defeat" : statsToMerge.targets[i].defeat
                                };
                                statsLocal.targets.push(newTarget);
                                newTarget = null;
                            }
                        }
                        item.set('stats', statsLocal);
                        $(this).dialog("close");
                        console.log('Insert succeed.');
                        statsToMerge = null;
                        statsLocal = null;
                    } catch (e) {
                        console.log('Insert failed : ', e);
                    }
                },
                Cancel : function () {
                    $(this).dialog("close");
                }
            },
            open : function (event, ui) {
                console.log('Import/Export Dialog opened.');
            }
        });
    }
}

function Generate_key() {
    try {
        var ret = "",
            length = 32;
        while (ret.length < length) {
            ret += Math.random().toString(16).substring(2);
        }
        return ret.substring(0, length);
    } catch (e) {
        console.log('Generate_key error : ', e);
        return "undefined";
    }
}

function sync() {
    if ($('#main_bntp').length > 0) {
        $('#main_bntp').append(_dialogSync);
        $("#dialogSync").dialog({
            modal : true,
            height : 250,
            width : 720,
            buttons : {
                "Save" : function () {
                    try {
                        var key = $(this).children('form')[0][1].value;
                        item.set('syncKey', key);
                        item.set('syncRemoteKey', $('#syncRemoteKey',this)[0].value);
                        console.log('Save succeed.');
                        $(this).dialog("close");
                    } catch (e) {
                        console.log('Save failed : ', e);
                    }
                },
                "Make new Key" : function () {
                    try {
                        $.ajax({
                            url : "https://api.myjson.com/bins",
                            type : "POST",
                            data : '{"key":"value"}',
                            contentType : "application/json; charset=utf-8",
                            dataType : "json",
                            success : function (data, textStatus, jqXHR) {
                                console.log('data', data);
                                item.set('syncKey', data.uri);
                            }
                        });
                        $(this).dialog("close");
                        /*
                        var key=Generate_key();
                        $(this).children('form')[0][1].value=key;
                        console.log('Make new Key succeed.');*/
                    } catch (e) {
                        console.log('Make new Key failed : ', e);
                    }
                },
                Cancel : function () {
                    $(this).dialog("close");
                }
            },
            open : function (event, ui) {
                console.log($('#syncRemoteKey',this));
                $(this).children('form')[0][1].value = item.get('syncKey', "");
                $('#syncRemoteKey',this)[0].value = item.get('syncRemoteKey', "");
                console.log('Sync Dialog opened.', item.get('syncKey', ""));
            }
        });
    }
}

function diagConnect() {
    if ($('#main_bntp').length > 0) {
        $('#main_bntp').append(_dialogConnect);
        $("#dialogConnect").dialog({
            modal : true,
            height : 260,
            width : 620,
            buttons : {
                "Save" : function () {
                    try {
                        var key = $(this).children('form')[0];
                        console.log('player_email : ', key[1].value);
                        item.set('player_email', key[1].value);
                        console.log('player_password : ', key[3].value);
                        item.set('player_password', key[3].value);
                        console.log('Save succeed.');
                        $(this).dialog("close");
                    } catch (e) {
                        console.log('Save failed : ', e);
                    }
                },
                Cancel : function () {
                    $(this).dialog("close");
                }
            }
        });
    }
}

/******************************************************************************************************************************************************************************
 *******************************************************************************************************************************************************************************
 *************    ALCHEMY ******************************************************************************************************************************************************
 *******************************************************************************************************************************************************************************
 ******************************************************************************************************************************************************************************/
var craftList = {

    AIR_ORB : {
        name : "AIR ORB",
        alchemy_id : 165
    },
    LAVA_ORB : {
        name : "LAVA ORB",
        alchemy_id : 194
    },
    ICE_ORB : {
        name : "ICE ORB",
        alchemy_id : 231
    },
    EARTH_ORB : {
        name : "EARTH ORB",
        alchemy_id : 237
    },
    SERPENTINE_SHIELD : {
        name : "SERPENTINE SHIELD",
        alchemy_id : 273
    },
    SHIELD_OF_DANTE : {
        name : "SHIELD OF DANTE",
        alchemy_id : 221
    },
    HERO_CRYSTAL : {
        name : "HERO CRYSTAL",
        alchemy_id : 12
    },
    AGGRESSIVE_HERO_POTION : {
        name : "AGGRESSIVE HERO POTION",
        alchemy_id : 45
    },
    DEFENSIVE_HERO_POTION : {
        name : "DEFENSIVE HERO POTION",
        alchemy_id : 46
    },
    BALANCED_HERO_POTION : {
        name : "BALANCED HERO POTION",
        alchemy_id : 47
    }
};

function diagCraft() {
    if ($('#main_bntp').length > 0) {
        if ($('#dialogCraft').length === 0) {
            $('#main_bntp').append(_dialogCraft);
        }
        $("#dialogCraft").dialog({
            modal : true,
            height : 260,
            width : 620,
            buttons : {
                "Craft" : function () {
                    try {
                        var alchemy = $("#selectAlchemy");
                        craftChoosen = craftList[alchemy.val()];
                        console.log(craftChoosen.name + " is the alchemy choosen...", craftChoosen);
                        item.set('craftChoosen', craftChoosen);
                        item.set('crafting', true);
                        $(this).dialog("close");
                        Craft(craftChoosen);
                    } catch (e) {
                        console.log('Start Craft failed : ', e);
                    }
                },
                Cancel : function () {
                    item.set('crafting', false);
                    item.set('craftingAll', false);
                    $(this).dialog("close");
                }
            },
            create : function (event, ui) {
                $.each(craftList, function (name, alchemy) {
                    console.log("#selectAlchemy", name, alchemy, $('#selectAlchemy'));
                    $('#selectAlchemy').append($('<option></option>').val(name).html(alchemy.name));
                    if (item.get('craftChoosen', craftList.LAVA_ORB).alchemy_id == alchemy.alchemy_id) {
                        $('#selectAlchemy').val(name);
                    }
                });
            }
        });
    }
}

function Craft(craftChoosen) {
    console.log("Craft:", craftChoosen);
    try {
        var _alchemy = $('#doQst_' + craftChoosen.alchemy_id);
        if (_alchemy.length > 0) {
            console.log("Craft clik:", $('div', _alchemy));
            $('input[src*="alchfb__btn_createon.gif"]', _alchemy).click();
        } else {
            console.log("No more " + craftChoosen.name + " to Craft");
            item.set('crafting', false);
            var back = confirm("No more " + craftChoosen.name + " to Craft. Do you want craft another?");
            if (back) {
                diagCraft();
            }
        }
    } catch (e) {
        console.error("Error checkCompleteCrew", e);
    }

}


/******************************************************************************************************************************************************************************
 *******************************************************************************************************************************************************************************
 *************    INIT *********************************************************************************************************************************************************
 *******************************************************************************************************************************************************************************
 ******************************************************************************************************************************************************************************/
function init() {
    var globalContainer = document.querySelector('#globalContainer');
    var clicked = false;

    if (!globalContainer) {
        if ($("input[src*='crusader2_btn_submit.gif']").length > 0) {

            setInterval(function () {
                var button = $("input[src*='crusader2_btn_submit.gif']");
                console.log('Try Connection');
                button.click();
            }, 30000);
        }
    }

    fcEventClick = function (event) {
        try {
            if (updated)
                window.location.href = clickUrl;

            var obj = event.target;
            while (obj && !obj.href)
                obj = obj.parentNode;

            if (obj && obj.href)
                clickUrl = obj.href;
            clicked = true;
        } catch (e) {
            console.error("Error in globalContainer Click", e);
        }
    };
    try {
        if (globalContainer.addEventListener) {
            console.log('Event Click For all major browsers, except IE 8 and earlier');
            globalContainer.addEventListener('click', fcEventClick, true);
        }
    } catch (e) {
        console.error('Error in init when addEventListener click', e);
    }

    // create an observer instance
    var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.addedNodes.length > 0) {
                if (mutation.addedNodes[0].className == "spinner") {
                    console.log('spinner', spinner);
                } else {
                    console.log('mutation', mutation);
                    cabf_filters();
                }
            }
        });
    });

    // configuration of the observer:
    var config = {
        attributes : true,
        childList : true,
        characterData : true
    };

    // pass in the target node, as well as the observer options
    observer.observe(globalContainer, config);

    GM_registerMenuCommand("CABF (Import/Export Stats)", function () {
        diagIO();
    });
    GM_registerMenuCommand("CABF (Import/Export Essences)", function () {
        diagIOE();
    });
    GM_registerMenuCommand("CABF (Sync Param)", function () {
        sync();
    });
    GM_registerMenuCommand("CABF (Sync Data)", function () {
        syncData();
    });
    GM_registerMenuCommand("CABF (Connect)", function () {
        diagConnect();
    });
    GM_registerMenuCommand("CABF (Craft)", function () {
        diagCraft();
    });
    GM_registerMenuCommand("CABF (Search Essence)", function () {
        searchEssence();
    });
    GM_registerMenuCommand("CABF (Damage Essence)", function () {
        getEssence('damage');
    });
    GM_registerMenuCommand("CABF (Attack Essence)", function () {
        getEssence('attack');
    });
    GM_registerMenuCommand("CABF (Defense Essence)", function () {
        getEssence('defense');
    });
    GM_registerMenuCommand("CABF (Health Essence)", function () {
        getEssence('health');
    });

    try {
        addCss(GM_getResourceText("cabfCss"));

    } catch (e) {
        console.error("Error addCss", e);
    }

}

GM_addStyle(GM_getResourceText("jqueryUiCss"));
//GM_addStyle (GM_getResourceText ("ca_cabfCss") );


function updateParam(parameter) {
    var urlParam = GM_getResourceText("param"); 
    try {
        var requestPUT = $.ajax({
            url : urlParam,
            type : "PUT",
            data : JSON.stringify(parameter),
            contentType : "application/json; charset=utf-8",
            dataType : "json",
            success : function (data, textStatus, jqXHR) {
                console.log('Param is updated : ', textStatus, data);
                spinner.stop();
            },
            error : function (jqXHR, textStatus, errorThrown) {
                console.log('Error in update param: ' + textStatus, errorThrown);
                spinner.stop();
            }
        });
        requestPUT.onreadystatechange = null;
        requestPUT.abort = null;
        requestPUT = null;
    } catch (ePUT) {
        console.error(ePUT);
        spinner.stop();
    }	
}

function cabf_connect() {
    console.log('cabf_connect');
    if ($("input[src*='crusader2_btn_submit.gif']").length > 0) {
        var button = $("input[src*='crusader2_btn_submit.gif']");
        var player_email = item.get('player_email', '');
        var player_password = item.get('player_password', '');
        console.log('Connection');
        if (player_email !== '' && player_password !== '') {
            console.log('Saved Connection');
            document.getElementsByName("player_email")[0].value = player_email;
            document.getElementsByName("player_password")[0].value = player_password;
            button.click();
        } else {
            console.log('Normal Connection');
            player_password = item.get('player_password', '');
            if (document.getElementsByName("player_password")[0].value)
                button.click();
        }
    }
    if ($("#main_bntp").length > 0 ) {
        var test = $("#main_bntp").text().trim();
        var res = /Welcome\s(.+)\s\(Logout\)/gm.exec(test);
        if (res.length==2) {
            var urlParam = GM_getResourceText("param"); 
            console.log("update keys param");
            item.set('player_name', res[1]);
            var requestGET = $.ajax({
                url : urlParam,
                type : "GET",
                contentType : "application/json; charset=utf-8",
                dataType : "json",
                beforeSend : function () {
                    addLoadingImg('globalContainer');
                    $('div[class="spinner"]').html($('div[class="spinner"]').html() + 'Synchronizing');
                },
                success : function (parameter, textStatus, jqXHR) {
                    var namePlayer = item.get('player_name', 'xxxxxxx');
                    if ('xxxxxxx'.match(namePlayer)) {
                        console.log("Error on player name");
                        return false;
                    }
                    if (!parameter.hasOwnProperty(namePlayer)) {
                        console.log('New remote storage:',namePlayer,parameter);
                        try {
                            $.ajax({
                                url : "https://api.myjson.com/bins",
                                type : "POST",
                                data : '{}',
                                contentType : "application/json; charset=utf-8",
                                dataType : "json",
                                success : function (data, textStatus, jqXHR) {
                                    parameter[namePlayer] = data.uri;
                                    item.set('syncRemoteKey', data.uri);
                                    console.log('New param entry',namePlayer, data.uri);
                                    updateParam(parameter);
                                },
                                error : function (jqXHR, textStatus, errorThrown) {
                                    console.log('Error making new entry: ' + textStatus, errorThrown);
                                    spinner.stop();
                                }
                            });
                        } catch (e) {
                            console.log('Make new Key failed : ', e);
                        }
                    } else {
                        parameter[namePlayer] = item.get('syncRemoteKey','https://api.myjson.com/bins/xxxxx');
                        updateParam(parameter);
                    }
                },
                error : function (jqXHR, textStatus, errorThrown) {
                    console.log('Sync remote storage GET: ' + textStatus, errorThrown);
                    spinner.stop();
                }
            });
            requestGET.onreadystatechange = null;
            requestGET.abort = null;
            requestGET = null;
        }
    }
}

console.log(GM_listValues());

/*Sync*/
syncData();
/* Connection */
cabf_connect();
console.log('init()');
init();
addEssenceBoard('#main_bntp');
if (arenaStarted) {
    ArenaTimer = window.setTimeout(chainArenaNext, 5000, 0);
} else {
    FestTimer = window.setTimeout(chainFestNext, 5000, 0);
}
