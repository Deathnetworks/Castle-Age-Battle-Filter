// ==UserScript==
// @name           Castle Age - Battle Filter
// @namespace      http://www.facebook.com/
// @description    This script assists with filtering battles.
// @include        https://apps.facebook.com/castle_age/*
// @include        https://web3.castleagegame.com/castle_ws/*
// @include        https://web4.castleagegame.com/castle_ws/*
// @downloadURL    https://raw.githubusercontent.com/Bonbons/Castle-Age-Battle-Filter/master/Castle%20Age%20-%20Battle%20Filter.js
// @require        http://code.jquery.com/jquery-1.9.1.js
// @require        http://code.jquery.com/ui/1.10.3/jquery-ui.js
// @resource       jqueryUiCss http://code.jquery.com/ui/1.10.3/themes/smoothness/jquery-ui.css
// @resource       ca_cabfCss https://raw.github.com/unknowner/CAGE/master/css/ca_cabf.css
// @version        1.1.18
// @copyright      2013+, Jigoku
// ==/UserScript==

var version = '1.1.18', clickUrl = '', updated = false;

/* 
to-do:
*/

 
var item = {
    get : function(_name, _default) {
        if (localStorage['cabf_' + _name] !== undefined && localStorage['cabf_' + _name] !== null) {
            return JSON.parse(localStorage['cabf_' + _name]);
        } else {
            return _default;
        }
    },
    set : function(_name, _value) {
        localStorage['cabf_' + _name] = JSON.stringify(_value);
    },
    del : function(_name) {
        localStorage.remove('cabf_' + _name);
    }
};
var _statBoard = '<div id="cabfHealthStatBoard"><div id="cabfStatType">Enemy</div><div><br></div><div id="cabfStatTower"><span>-</span><span>Stat</span></div><div id="cabfToggleTower"><div id="cabfTotalHealth">Total Health: 0</div><div id="cabfAverageHealth">Average Health: 0</div><div id="cabfHealthLeft">Health Left: 0</div><div id="cabfAverageHealthLeft">Average Health Left: 0</div><div id="cabfPercentageHealthLeft">Percentage Health Left: 0%</div></div><div><br></div><div id="cabfStatCleric"><span>-</span><span>Cleric Stat</span></div><div id="cabfToggleCleric"><div id="cabfClericTotalHealth">Total Health: 0</div><div id="cabfClericAverageHealth">Average Health: 0</div><div id="cabfClericHealthLeft">Health Left: 0</div><div id="cabfClericAverageHealthLeft">Average Health Left: 0</div><div id="cabfClericPercentageHealthLeft">Percentage Health Left: 0%</div></div><div><br></div><div id="cabfStatMage"><span>-</span><span>Mage Stat</span></div><div id="cabfToggleMage"><div id="cabfMageTotalHealth">Total Health: 0</div><div id="cabfMageAverageHealth">Average Health: 0</div><div id="cabfMageHealthLeft">Health Left: 0</div><div id="cabfMageAverageHealthLeft">Average Health Left: 0</div><div id="cabfMagePercentageHealthLeft">Percentage Health Left: 0%</div></div><div><br></div><div id="cabfStatRogue"><span>-</span><span>Rogue Stat</span></div><div id="cabfToggleRogue"><div id="cabfRogueTotalHealth">Total Health: 0</div><div id="cabfRogueAverageHealth">Average Health: 0</div><div id="cabfRogueHealthLeft">Health Left: 0</div><div id="cabfRogueAverageHealthLeft">Average Health Left: 0</div><div id="cabfRoguePercentageHealthLeft">Percentage Health Left: 0%</div></div><div><br></div><div id="cabfStatWarrior"><span>-</span><span>Warrior Stat</span></div><div id="cabfToggleWarrior"><div id="cabfWarriorTotalHealth">Total Health: 0</div><div id="cabfWarriorAverageHealth">Average Health: 0</div><div id="cabfWarriorHealthLeft">Health Left: 0</div><div id="cabfWarriorAverageHealthLeft">Average Health Left: 0</div><div id="cabfWarriorPercentageHealthLeft">Percentage Health Left: 0%</div></div><div><br></div><div id="cabfStatActive"><span>-</span><span>Active Stat</span></div><div id="cabfToggleActive"><div id="cabfActiveTotalHealth">Total Health: 0</div><div id="cabfActiveAverageHealth">Average Health: 0</div><div id="cabfActiveHealthLeft">Health Left: 0</div><div id="cabfActiveAverageHealthLeft">Average Health Left: 0</div><div id="cabfActivePercentageHealthLeft">Percentage Health Left: 0%</div></div><div><br></div></div>';

 function runEffect(idButton,idToggle) {
	
	var options = {},state;
	console.log('idButton=',idButton);
	console.log('idToggle=',idToggle);
	$(idToggle).toggle( 'clip', options, 500 );
	state=item.get(idToggle,'false');
	if (state === 'false' ) {
		item.set(idToggle,'true');
		$(idButton+' span:first').html('-');
	} else {
		item.set(idToggle,'false');	
		$(idButton+' span:first').html('+');	
	}
};
	
function addStatBoard(id) { 
	$(id).after(_statBoard);
	$('#cabfStatTower').click(function() {runEffect('#cabfStatTower','#cabfToggleTower');});
	$('#cabfStatCleric').click(function() {runEffect('#cabfStatCleric','#cabfToggleCleric');});
	$('#cabfStatMage').click(function() {runEffect('#cabfStatMage','#cabfToggleMage');});
	$('#cabfStatRogue').click(function() {runEffect('#cabfStatRogue','#cabfToggleRogue');});
	$('#cabfStatWarrior').click(function() {runEffect('#cabfStatWarrior','#cabfToggleWarrior');});
	$('#cabfStatActive').click(function() {runEffect('#cabfStatActive','#cabfToggleActive');});
	if (item.get('#cabfToggleTower','false')==='false') {
		$('#cabfToggleTower').css("display","none");
		$('#cabfStatTower span:first').html('+');
	}
	if (item.get('#cabfToggleCleric','false')==='false') {
		$('#cabfToggleCleric').css("display","none");
		$('#cabfStatCleric span:first').html('+');
	}
	if (item.get('#cabfToggleMage','false')==='false') {
		$('#cabfToggleMage').css("display","none");
		$('#cabfStatMage span:first').html('+');
	}
	if (item.get('#cabfToggleRogue','false')==='false') {
		$('#cabfToggleRogue').css("display","none");
		$('#cabfStatRogue span:first').html('+');
	}
	if (item.get('#cabfToggleWarrior','false')==='false') {
		$('#cabfToggleWarrior').css("display","none");
		$('#cabfStatWarrior span:first').html('+');
	}
	if (item.get('#cabfToggleActive','false')==='false') {
		$('#cabfToggleActive').css("display","none");
		$('#cabfStatActive span:first').html('+');
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
        }
    } catch (e) {
        console.error("Error in addCss",e);
    }
};


function cabf_error(event) {
    console.log("cabf_error");
};

function cabf_success(event) {
    console.log("cabf_success");
};

/*******************************************************************************************************************************************************************************
********************************************************************************************************************************************************************************
*************    MIST BATTLE ***************************************************************************************************************************************************
********************************************************************************************************************************************************************************
*******************************************************************************************************************************************************************************/
function cabf_conquestmistfilter() {
    
    try {
        var _defenderHealth = 0, _actions = parseInt(/\d+/.exec($('#app_body div:contains("ACTIONS LEFT:"):last').text()), 10);
        // Saved filter settings
        var _storedClass = item.get('cabfPageConquestBattleClass', 'All');
        var _storedStatus = item.get('cabfPageConquestBattleStatus', 'All');
        var _storedPoints = item.get('cabfPageConquestBattlePoints', 'All');
        
        $('#your_guild_member_list_1 > div').each(function(_i, _e) {
            var _text = $(_e).text().trim(), _health, _maxHealth, _fullhealth,winStat = '';
            
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
			if ($('input[name="target_id"]',_e).length>0) {
				var target_id=$('input[name="target_id"]',_e).attr("value");
				winStat=getTargetStat(target_id);
				addTargetTip(_e);
			}
            if (_fullhealth) {
                $(_e, 'div > div').append('<span class="GuildNumG">' + (_i + 1) + '</span>'+ '<br>' + winStat);
            } else {
                $(_e, 'div > div').append('<span class="GuildNumR">' + (_i + 1) + '</span>'+ '<br>' + winStat);
            }
            
        });
        if (_defenderHealth > 0) {
            $('#app_body div[style*="/graphics/war_art"]:last').prepend('<div id="cabfHealthAction">Health/Action: ' + (_defenderHealth / _actions).toFixed(0) + '</div>');
        }
        // gate filter
        function filterGate() {
            var _count = 0;
            var _myLevel = $('a[href*="keep.php"] > div[style="color:#ffffff"]').text().match(/\d+/);
            var myLevel = Number(_myLevel[0]);
            $('#your_guild_member_list_1 > div').each(function(_i, _e) {
                var _class = new RegExp($('#cabfGateClassFilter').val());
                var _state = new RegExp($('#cabfGateStatusFilter').val());
                var _points = $('#cabfGatePointsFilter').val();
                var _text = $(_e).text().trim(), _health, _maxHealth, _fullhealth, _eClass;
                
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
                        if (/Level: \d+/.test(_text)) {
                            var targetLevel = parseInt(/(?:Level: )(\d+)/g.exec(_text)[1]);
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
        }
        
        // class filter
        var filterClass = {
            'All' : '\.',
            'Cleric' : 'Cleric',
            'Mage' : 'Mage',
            'Rogue' : 'Rogue',
            'Warrior' : 'Warrior'
        }, filterStatus = {
            'All' : '\.',
            'Full health' : 'FullHealth',
            'Got health' : '[^0]\/',
            'Healthy' : 'Healthy',
            'Good' : 'Good',
            'Fair' : 'Fair',
            'Weakened' : 'Weakened',
            'Stunned' : 'Stunned'
        }, filterPoints = {
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
        $.each(filterPoints, function(_i, _e) {
            _sel.append('<option value="' + _e + '" ' + (_storedPoints == _i ? 'selected = "selected"' : '') + ' >' + _i + '</option>');
        });
        _sel.change(function() {
            _storedPoints = $(this).find("option:selected").text();
            item.set('cabfPageConquestBattlePoints', _storedPoints);
            filterGate();
        });
        // status filter
        _cCBF.prepend('<span class="cabfGateFilterTitle ui-state-default"> Status </span><select id="cabfGateStatusFilter" class="cabfgatefiltertitle">');
        _sel = $('#cabfGateStatusFilter');
        $.each(filterStatus, function(_i, _e) {
            _sel.append('<option value="' + _e + '" ' + (_storedStatus == _i ? 'selected = "selected"' : '') + ' >' + _i + '</option>');
        });
        _sel.change(function() {
            _storedStatus = $(this).find("option:selected").text();
            item.set('cabfPageConquestBattleStatus', _storedStatus);
            filterGate();
        });
        // Class filter
        _cCBF.prepend('<span class="cabfGateFilterTitle ui-state-default"> Class </span><select id="cabfGateClassFilter" class="cabfgatefiltertitle">');
        _sel = $('#cabfGateClassFilter');
        $.each(filterClass, function(_i, _e) {
            _sel.append('<option value="' + _e + '" ' + (_storedClass == _i ? 'selected = "selected"' : '') + ' >' + _i + '</option>');
        });
        _sel.change(function() {
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
        }).click(function() {
            $('span.ui-selectmenu-status').text('All');
            $('#cabfGateClassFilter, #cabfGateStatusFilter, #cabfGatePointsFilter').val('All');
            _storedClass = _storedStatus = _storedPoints = 'All';
            item.set('cabfPageConquestBattleClass', 'All');
            item.set('cabfPageConquestBattleStatus', 'All');
            item.set('cabfPageConquestBattlePoints', 'All');
            filterGate();
        }));
        window.setTimeout(function() {
            filterGate();
        }, 10);
    } catch (e) {
        console.error("Error in cabf_conquestmistfilter",e);
    }
    
};

/*******************************************************************************************************************************************************************************
********************************************************************************************************************************************************************************
*************    EARTH BATTLE **************************************************************************************************************************************************
********************************************************************************************************************************************************************************
*******************************************************************************************************************************************************************************/
function cabf_conquestearthfilter() {
    
    try {
        
        //var     _tower = parseInt(/\d+/.exec($('div[class="tower_tab"][style*="display:block"]').attr("id")), 10);
		var _towers = { 1:"Attack Tower",2:"Defense Tower",3:"Damage Tower",4:"Health Tower"};
		var     _tower = 1;
		if ($("#cabfHealthActionEarth").length>0) {
			$("#cabfHealthActionEarth").show();
		} else {
			$('#conquest_report').after('<div id="cabfHealthActionEarth"><div>Attack Tower</div><div id="cabfEarthFiltered1">Filtered: 0</div><div id="cabfEarthAction1">Health/Action: 0</div><div><br></div><div>Defense Tower</div><div id="cabfEarthFiltered2">Filtered: 0</div><div id="cabfEarthAction2">Health/Action: 0</div><div><br></div><div>Damage Tower</div><div id="cabfEarthFiltered3">Filtered: 0</div><div id="cabfEarthAction3">Health/Action: 0</div><div><br></div><div>Health Tower</div><div id="cabfEarthFiltered4">Filtered: 0</div><div id="cabfEarthAction4">Health/Action: 0</div></div>');
		}
		
		for (var _x in _towers) {
			console.log("_tower",_x);
			
			var _defenderHealth = 0, _actions = parseInt(/\d+/.exec($('#app_body div[id="actions_left_'+_x+'"]:contains("ACTIONS LEFT:"):last').text()), 10);
			// Saved filter settings
			var _storedClass = item.get('cabfPageConquestBattleClass', 'All');
			var _storedStatus = item.get('cabfPageConquestBattleStatus', 'All');
			var _storedPoints = item.get('cabfPageConquestBattlePoints', 'All');
			
			console.log("_actions",_actions);
            if ($('#tower_'+_x+' > #crystal_'+_x).length>0) {
                _defenderHealth = 0;            
            } else if (!(_actions>0)) {
                _defenderHealth = 0;            
            } else {
				var _nb=0;
				console.log("Add numbers");
                $('#tower_'+_x+' > div > div').each(function(_i, _e) {
                    var _text = $(_e).text().trim(), _health, _maxHealth, _fullhealth,winStat = '';
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
						console.log("_defenderHealth = ", _defenderHealth);
						$(_e, 'div > div').append('<div style="clear:both;"></div>');
						if ($('input[name="target_id"]',_e).length>0) {
							var target_id=$('input[name="target_id"]',_e).attr("value");
							winStat=getTargetStat(target_id);
							addTargetTip(_e);
						}
						if (_fullhealth) {
							$(_e, 'div > div').append('<span class="GuildNumG">' + _nb + '</span>'+ '<br>' + winStat);
						} else {
							$(_e, 'div > div').append('<span class="GuildNumR">' + _nb + '</span>'+ '<br>' + winStat);
						}
                    }
                });
            }
            if (_actions > 0) {
                $('#cabfEarthAction'+_x).html('Health/Action: ' + (_defenderHealth / _actions).toFixed(0));
            } else {
                $('#cabfEarthAction'+_x).html('Health/Action: #');
            } 
        }
		// gate filter
		function filterGate() {
			var _myLevel = $('a[href*="keep.php"] > div[style="color:#ffffff"]').text().match(/\d+/);
			var myLevel = Number(_myLevel[0]);
			for (var _x in _towers) {
				var _count = 0;
                if ($('#tower_'+_x+' > #crystal_'+_x).length>0) {
                    _count = 0;            
                } else {
                    $('#tower_'+_x+' > div > div').each(function(_i, _e) {
                        var _class = new RegExp($('#cabfGateClassFilter').val());
                        var _state = new RegExp($('#cabfGateStatusFilter').val());
                        var _points = $('#cabfGatePointsFilter').val();
                        var _text = $(_e).text().trim(), _health, _maxHealth, _fullhealth, _eClass;
                        
                        // enemy class
                        _eClass = $(_e).find('img[title="Cleric"], img[title="Mage"], img[title="Warrior"], img[title="Rogue"]').attr("title");
                        if (!_eClass) return;
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
                                if (/Level: \d+/.test(_text)) {
                                    var targetLevel = parseInt(/(?:Level: )(\d+)/g.exec(_text)[1]);
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
                }
				$('#cabfEarthFiltered'+_x).html('Filtered: ' + _count);
				//$('#app_body div[id="cabfHealthActionEarth"]:last').html($('#app_body div[id="cabfHealthActionEarth"]:last').html().replace(/.*Health\/Action:/, 'Health/Action:').replace('Health/Action:', 'Filtered: ' + _count + '<br/>Health/Action:'));
			}
		}
		
        // class filter
        var filterClass = {
            'All' : '\.',
            'Cleric' : 'Cleric',
            'Mage' : 'Mage',
            'Rogue' : 'Rogue',
            'Warrior' : 'Warrior'
        }, filterStatus = {
            'All' : '\.',
            'Full health' : 'FullHealth',
            'Got health' : '[^0]\/',
            'Healthy' : 'Healthy',
            'Good' : 'Good',
            'Fair' : 'Fair',
            'Weakened' : 'Weakened',
            'Stunned' : 'Stunned'
        }, filterPoints = {
            'All' : 'All',
            '50' : '50',
            '40' : '40',
            '30' : '30',
            '20' : '20',
            '10' : '10'
        };
        $('body > ul.ui-selectmenu-menu').remove();
        
		if ($("#cabfConquestEarthFilterContainer").length>0) {
			$("#cabfConquestEarthFilterContainer").show();
		} else {
			$('#conquest_report').after('<div id="cabfConquestEarthFilterContainer"><div id="cabfConquestEarthFilter" class="ui-state-default"></div></div>');
			var _cCBF = $('#cabfConquestEarthFilter');
			// Battle activity points filter
			_cCBF.prepend('<span class="cabfGateFilterTitle ui-state-default"> Points </span><select id="cabfGatePointsFilter" class="cabfgatefiltertitle">');
			_sel = $('#cabfGatePointsFilter');
			$.each(filterPoints, function(_i, _e) {
				_sel.append('<option value="' + _e + '" ' + (_storedPoints == _i ? 'selected = "selected"' : '') + ' >' + _i + '</option>');
			});
			_sel.change(function() {
				_storedPoints = $(this).find("option:selected").text();
				item.set('cabfPageConquestBattlePoints', _storedPoints);
				filterGate();
			});
			// status filter
			_cCBF.prepend('<span class="cabfGateFilterTitle ui-state-default"> Status </span><select id="cabfGateStatusFilter" class="cabfgatefiltertitle">');
			_sel = $('#cabfGateStatusFilter');
			$.each(filterStatus, function(_i, _e) {
				_sel.append('<option value="' + _e + '" ' + (_storedStatus == _i ? 'selected = "selected"' : '') + ' >' + _i + '</option>');
			});
			_sel.change(function() {
				_storedStatus = $(this).find("option:selected").text();
				item.set('cabfPageConquestBattleStatus', _storedStatus);
				filterGate();
			});
			// Class filter
			_cCBF.prepend('<span class="cabfGateFilterTitle ui-state-default"> Class </span><select id="cabfGateClassFilter" class="cabfgatefiltertitle">');
			_sel = $('#cabfGateClassFilter');
			$.each(filterClass, function(_i, _e) {
				_sel.append('<option value="' + _e + '" ' + (_storedClass == _i ? 'selected = "selected"' : '') + ' >' + _i + '</option>');
			});
			_sel.change(function() {
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
			}).click(function() {
				$('span.ui-selectmenu-status').text('All');
				$('#cabfGateClassFilter, #cabfGateStatusFilter, #cabfGatePointsFilter').val('All');
				_storedClass = _storedStatus = _storedPoints = 'All';
				item.set('cabfPageConquestBattleClass', 'All');
				item.set('cabfPageConquestBattleStatus', 'All');
				item.set('cabfPageConquestBattlePoints', 'All');
				filterGate();
			}));
		}
        window.setTimeout(function() {
            filterGate();
        }, 10);
    } catch (e) {
        console.error("Error in cabf_conquestearthfilter",e);
    }
    
};
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
    }
    
    // resize top image
    $('input[value="enter_battle"]').parents('form:first').css({
        'position' : 'relative'
    });
    $('#guild_battle_banner_section').find('div:contains("VICTOR")').next().next().css('marginTop', 10).end();
    $('#guild_battle_banner_section > div:eq(2)').css('marginTop', 0);
    $('div:contains("The Battle Between"):last').parent().css('marginTop', 20);
    $('input[src*="collect_reward_button2.jpg"]').parents('div:eq(2)').css('marginTop', 0);
	addStatBoard('#guild_battle_guild_tabs');
    
    // add current tokens to result
    var _tokens = $('div.result div:contains("-1 Battle Tokens"):last');
    _tokens.text(_tokens.text() + ' (' + $('#guild_token_current_value').text() + ' left)');
    
    // reduce gate size and add number
    if ($('#your_new_guild_member_list:contains("No Soldiers Posted In This Position!"), #enemy_new_guild_member_list:contains("No Soldiers Posted In This Position!")').length === 0) {
        var _guildnum = 1, 
			_count = 0, 
			_totalhealth = 0, _totalhealthleft = 0, 
			_clericcount = 0, _clericlivecount = 0, 
			_clerictotalhealth = 0, _clerictotalhealthleft = 0, 
			_magecount = 0, _magelivecount = 0, 
			_magetotalhealth = 0, _magetotalhealthleft = 0, 
			_roguecount = 0, _roguelivecount = 0, 
			_roguetotalhealth = 0, _roguetotalhealthleft = 0, 
			_warriorcount = 0, _warriorlivecount = 0, 
			_warriortotalhealth = 0, _warriortotalhealthleft = 0;	
			_activecount = 0, _activelivecount = 0, 
			_activetotalhealth = 0, _activetotalhealthleft = 0;		
        var _gateNum = $('#enemy_guild_battle_section_battle_list, #your_guild_battle_section_battle_list').attr('class').match(/\d/)[0];
        var _gateName='';
		if ($('#enemy_guild_battle_section_battle_list').length > 0) {
			$('#cabfStatType').html('Enemy');
		} else {
			$('#cabfStatType').html('Ally');
		}
		switch (_gateNum) {
        	case '1':  _gateName='North';		
                    break;
        	case '2':  _gateName='West';
                    break;
        	case '3':  _gateName='East';
                    break;
        	case '4':  _gateName='South';
                    break;
            default: _gateName=' ';
        } 
        $('#cabfStatTower span:last').html(_gateName+' Tower Stat');
		$('#cabfStatCleric span:last').html(_gateName+' Cleric Stat');
		$('#cabfStatMage span:last').html(_gateName+' Mage Stat');
		$('#cabfStatRogue span:last').html(_gateName+' Rogue Stat');
		$('#cabfStatWarrior span:last').html(_gateName+' Warrior Stat'); 
		$('#cabfStatActive span:last').html(_gateName+' Active Stat');   
		
        $('#enemy_new_guild_member_list > div > div, #your_new_guild_member_list > div > div').each(function(_i, _e) {
            var _text = $(_e).text().trim(), _FullHealth = true;
            if (_text && $(_e).text().trim().length > 0) {
				var _test = /(\d+)\/(\d+)/g.exec(_text);
				var _active = /Battle Points: [1-9]/g.exec(_text);	
				var winStat = '';
				if ($('input[name="target_id"]',_e).length>0) {
					var target_id=$('input[name="target_id"]',_e).attr("value");
					winStat=getTargetStat(target_id);
					addTargetTip(_e);
					
				}
				if (_test)
				{
					_FullHealth = (_test.length === 3 && _test[1] === _test[2]) ? true : false;
					if (_FullHealth)
						$(_e).append('<span class="GuildNumG">' + (_guildnum) + '</span>'+ '<br>' + winStat);
					else
						$(_e).append('<span class="GuildNumR">' + (_guildnum) + '</span>'+ '<br>' + winStat);
				} else {
					$(_e).append('<span class="GuildNum">' + (_guildnum) + '</span>'+ '<br>' + winStat);
				}					
				_guildnum += 1;	
				_count+=1;	
				_totalhealth+=eval(_test[2]);
				_totalhealthleft+=eval(_test[1]);
				if ($(_e).find('img[src*="/graphics/class_cleric.gif"]').length>0) {
					_clericcount+=1;
					_clerictotalhealth+=eval(_test[2]); 
					if (_test[1]>0) _clericlivecount+=1;
					_clerictotalhealthleft+=eval(_test[1]);
				}
				if ($(_e).find('img[src*="/graphics/class_mage.gif"]').length>0) {
					_magecount+=1;
					_magetotalhealth+=eval(_test[2]); 
					if (_test[1]>0) _magelivecount+=1;
					_magetotalhealthleft+=eval(_test[1]);
				}
				if ($(_e).find('img[src*="/graphics/class_rogue.gif"]').length>0) {
					_roguecount+=1;
					_roguetotalhealth+=eval(_test[2]); 
					if (_test[1]>0) _roguelivecount+=1;
					_roguetotalhealthleft+=eval(_test[1]);
				}
				if ($(_e).find('img[src*="/graphics/class_warrior.gif"]').length>0) {
					_warriorcount+=1;
					_warriortotalhealth+=eval(_test[2]); 
					if (_test[1]>0) _warriorlivecount+=1;
					_warriortotalhealthleft+=eval(_test[1]);
				}
				if (_active) {
					_activecount+=1;
					_activetotalhealth+=eval(_test[2]); 
					if (_test[1]>0) _activelivecount+=1;
					_activetotalhealthleft+=eval(_test[1]);
				}				
            } else {
                $(_e).remove();
            }
			_text = '';
			_test = [];
        });
		if (_count>0) {
			$('#cabfTotalHealth').html('Total Health: '+_totalhealth);
			$('#cabfAverageHealth').html('Average Health: '+(_totalhealth/_count).toFixed());
			$('#cabfHealthLeft').html('Health Left: '+_totalhealthleft);
			$('#cabfAverageHealthLeft').html('Average Health Left: '+(_totalhealthleft/(_clericlivecount+_magelivecount+_roguelivecount+_warriorlivecount)).toFixed());
			$('#cabfPercentageHealthLeft').html('Percentage Health Left: '+(_totalhealthleft*100/_totalhealth).toFixed(1)+'%');
			
			if (_clericcount>0) {
				$('#cabfClericTotalHealth').html('Total Health: '+_clerictotalhealth);
				$('#cabfClericAverageHealth').html('Average Health: '+(_clerictotalhealth/_clericcount).toFixed());
				$('#cabfClericHealthLeft').html('Health Left: '+_clerictotalhealthleft);
				if (_clericlivecount>0) {
					$('#cabfClericAverageHealthLeft').html('Average Health Left: '+(_clerictotalhealthleft/_clericlivecount).toFixed());
				} 
				$('#cabfClericPercentageHealthLeft').html('Percentage Health Left: '+(_clerictotalhealthleft*100/_clerictotalhealth).toFixed(1)+'%');
			}
			
			if (_magecount>0) {
				$('#cabfMageTotalHealth').html('Total Health: '+_magetotalhealth);
				$('#cabfMageAverageHealth').html('Average Health: '+(_magetotalhealth/_magecount).toFixed());
				$('#cabfMageHealthLeft').html('Health Left: '+_magetotalhealthleft);
				if (_magelivecount>0) {
					$('#cabfMageAverageHealthLeft').html('Average Health Left: '+(_magetotalhealthleft/_magelivecount).toFixed());
				} 
				$('#cabfMagePercentageHealthLeft').html('Percentage Health Left: '+(_magetotalhealthleft*100/_magetotalhealth).toFixed(1)+'%');
			}
			
			if (_roguecount>0) {
				$('#cabfRogueTotalHealth').html('Total Health: '+_roguetotalhealth);
				$('#cabfRogueAverageHealth').html('Average Health: '+(_roguetotalhealth/_roguecount).toFixed());
				$('#cabfRogueHealthLeft').html('Health Left: '+_roguetotalhealthleft);
				if (_roguelivecount>0) {
					$('#cabfRogueAverageHealthLeft').html('Average Health Left: '+(_roguetotalhealthleft/_roguelivecount).toFixed());
				} 
				$('#cabfRoguePercentageHealthLeft').html('Percentage Health Left: '+(_roguetotalhealthleft*100/_roguetotalhealth).toFixed(1)+'%');
			}
			
			if (_warriorcount>0) {
				$('#cabfWarriorTotalHealth').html('Total Health: '+_warriortotalhealth);
				$('#cabfWarriorAverageHealth').html('Average Health: '+(_warriortotalhealth/_warriorcount).toFixed());
				$('#cabfWarriorHealthLeft').html('Health Left: '+_warriortotalhealthleft);
				if (_warriorlivecount>0) {
					$('#cabfWarriorAverageHealthLeft').html('Average Health Left: '+(_warriortotalhealthleft/_warriorlivecount).toFixed());
				} 
				$('#cabfWarriorPercentageHealthLeft').html('Percentage Health Left: '+(_warriortotalhealthleft*100/_warriortotalhealth).toFixed(1)+'%');
			}
			
			if (_activecount>0) {
				$('#cabfActiveTotalHealth').html('Total Health: '+_activetotalhealth);
				$('#cabfActiveAverageHealth').html('Average Health: '+(_activetotalhealth/_activecount).toFixed());
				$('#cabfActiveHealthLeft').html('Health Left: '+_activetotalhealthleft);
				if (_activelivecount>0) {
					$('#cabfActiveAverageHealthLeft').html('Average Health Left: '+(_activetotalhealthleft/_activelivecount).toFixed());
				} 
				$('#cabfActivePercentageHealthLeft').html('Percentage Health Left: '+(_activetotalhealthleft*100/_activetotalhealth).toFixed(1)+'%');
			}
		} 
	} else {
		var _gateNum = $('#enemy_guild_battle_section_battle_list, #your_guild_battle_section_battle_list').attr('class').match(/\d/)[0];
		if ($('#enemy_guild_battle_section_battle_list').length > 0) {
			$('#cabfStatType').html('Enemy');
		} else {
			$('#cabfStatType').html('Ally');
		}
		switch (_gateNum) {
			case '1':  $('#cabfStatTower span:last').html('North Tower Stat');
					break;
			case '2':  $('#cabfStatTower span:last').html('West Tower Stat');
					break;
			case '3':  $('#cabfStatTower span:last').html('East Tower Stat');
					break;
			case '4':  $('#cabfStatTower span:last').html('South Tower Stat');
					break;
			default: $('#cabfStatTower span:last').html('Stat (Tower not Found)');
		}
	}
	
    // Saved filter settings
    var _storedClass = item.get('cabfPageGuildBattleClass', 'All');
    var _storedActivity = item.get('cabfPageGuildBattleActivity', 'All');
    var _storedStatus = item.get('cabfPageGuildBattleStatus', 'All');
    var _storedPoints = item.get('cabfPageGuildBattlePoints', 'All');
    
    // gate filter
    function filterGate() {
        var _count = 0;
        var _gateNum = $('#enemy_guild_battle_section_battle_list, #your_guild_battle_section_battle_list').attr('class').match(/\d/)[0];
        var _gate = $('#enemy_new_guild_tab_' + _gateNum + ' > div, #your_new_guild_tab_' + _gateNum + ' > div');
        $('#your_new_guild_member_list > div > div, #enemy_new_guild_member_list > div > div').each(function(_i, _e) {
            var _class = $('#cabfGateClassFilter').val();
            var _activ = new RegExp($('#cabfGateActivityFilter').val(), "g");
            var _state = $('#cabfGateStatusFilter').val();
            var _points = $('#cabfGatePointsFilter').val();            
            var _text = $(_e).text().trim(), _stateTest = true;
            switch (_state) {
                case 'FullHealth':
                    var _test = /(\d+)\/(\d+)/g.exec(_text);
                    _stateTest = (_test.length === 3 && _test[1] === _test[2]) ? true : false;
                    break;
                case 'GotHealth':
                    var _test = /(\d+)\/(\d+)/g.exec(_text);
                    _stateTest = (_test.length === 3 && !(eval(_test[1]) === 0)) ? true : false;
                    break;
                case 'NoHealth':
                    var _test = /(\d+)\/(\d+)/g.exec(_text);
                    _stateTest = (_test.length === 3 && eval(_test[1]) === 0) ? true : false;
                    break;
                default:
                    var _test = new RegExp(_state, "g");
                    _stateTest = _test.test(_text);
            }
            
            var _classTest = _class === 'all' ? 1 : $(_e).find('img[src*="/graphics/class_' + _class + '.gif"]').length;
            var _pointTest = _points === 'all' ? 1 : $(_e).find('img[title="Battle Points for Victory: ' + _points + '"]').length;
            if (_classTest > 0 && _activ.test(_text) && _pointTest > 0 && _stateTest === true) {
                $(_e).show();
                _count += 1;
            } else {
                $(_e).hide();
            }
            
        });
        _gate.html(_gate.html().replace(/\).*/, ')').replace(')', ')<br/><span style="font-size:14px;font-weight:bold;">Filtered: ' + _count + '</span>'));
    }
    
    // class filter
    var filterClass = {
        'All' : 'all',
        'Cleric' : 'cleric',
        'Mage' : 'mage',
        'Rogue' : 'rogue',
        'Warrior' : 'warrior'
    }, filterActivity = {
        'All' : '\.',
        'Active' : 'Battle Points: [1-9]',
        'Inactive' : 'Battle Points: 0'
    }, filterStatus = {
        'All' : '\.',
        'Full health' : 'FullHealth',
        'Got health' : 'GotHealth',
        'No health' : 'NoHealth',
        'Healthy' : 'Healthy',
        'Good' : 'Good',
        'Fair' : 'Fair',
        'Weakened' : 'Weakened',
        'Stunned' : 'Stunned'
    }, filterPoints = {
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
    }).click(function() {
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
    $.each(filterClass, function(_i, _e) {
        _sel.append('<option value="' + _e + '" ' + (_storedClass == _i ? 'selected = "selected"' : '') + ' >' + _i + '</option>');
    });
    _sel.change(function() {
        _storedClass = $(this).find("option:selected").text();
        item.set('cabfPageGuildBattleClass', _storedClass);
        filterGate();
    });
    // Activity filter
    $('#cabf_menu').append('<span class="cabfGateFilterTitle ui-state-default"> Activity </span><select id="cabfGateActivityFilter" class="cabfgatefiltertitle">');
    _sel = $('#cabfGateActivityFilter');
    $.each(filterActivity, function(_i, _e) {
        _sel.append('<option value="' + _e + '" ' + (_storedActivity == _i ? 'selected = "selected"' : '') + ' >' + _i + '</option>');
    });
    _sel.change(function() {
        _storedActivity = $(this).find("option:selected").text();
        item.set('cabfPageGuildBattleActivity', _storedActivity);
        filterGate();
    });
    // status filter
    $('#cabf_menu').append('<span class="cabfGateFilterTitle ui-state-default"> Status </span><select id="cabfGateStatusFilter" class="cabfgatefiltertitle">');
    _sel = $('#cabfGateStatusFilter');
    $.each(filterStatus, function(_i, _e) {
        _sel.append('<option value="' + _e + '" ' + (_storedStatus == _i ? 'selected = "selected"' : '') + ' >' + _i + '</option>');
    });
    _sel.change(function() {
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
    $.each(filterPoints, function(_i, _e) {
        _sel.prepend('<option value="' + _e + '" ' + (_storedPoints == _i ? 'selected = "selected"' : '') + ' >' + _i + '</option>');
    });
    _sel.change(function() {
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
    window.setTimeout(function() {
        filterGate();
    }, 10);
    
};
 
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
	addStatBoard('#guild_battle_guild_tabs');
    
    // add current tokens to result
    var _tokens = $('div.result div:contains("-1 Battle Tokens"):last');
    _tokens.text(_tokens.text() + ' (' + $('#guild_token_current_value').text() + ' left)');
    
    // reduce gate size and add number
    if ($('#your_new_guild_member_list:contains("No Soldiers Posted In This Position!"), #enemy_new_guild_member_list:contains("No Soldiers Posted In This Position!")').length === 0) {
        var _guildnum = 1, 
			_count = 0, 
			_totalhealth = 0, _totalhealthleft = 0, 
			_clericcount = 0, 
			_clerictotalhealth = 0, _clerictotalhealthleft = 0, 
			_magecount = 0, 
			_magetotalhealth = 0, _magetotalhealthleft = 0, 
			_roguecount = 0, 
			_roguetotalhealth = 0, _roguetotalhealthleft = 0, 
			_warriorcount = 0, 
			_warriortotalhealth = 0, _warriortotalhealthleft = 0;	
			_activecount = 0, _activelivecount = 0, 
			_activetotalhealth = 0, _activetotalhealthleft = 0;		
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
		
        $('#enemy_new_guild_member_list > div > div, #your_new_guild_member_list > div > div').each(function(_i, _e) {
            var _text = $(_e).text().trim(), _FullHealth = true;
            if (_text && $(_e).text().trim().length > 0) {
				var _test = /(\d+)\/(\d+)/g.exec(_text);
				var _active = /Battle Points: [1-9]/g.exec(_text);	
				var winStat = '';
				if ($('input[name="target_id"]',_e).length>0) {
					var target_id=$('input[name="target_id"]',_e).attr("value");
					winStat=getTargetStat(target_id);
					addTargetTip(_e);
				}
				if (_test)
				{
					_FullHealth = (_test.length === 3 && _test[1] === _test[2]) ? true : false;
					if (_FullHealth)
						$(_e).append('<span class="GuildNumG">' + (_guildnum) + '</span>'+ '<br>' + winStat);
					else
						$(_e).append('<span class="GuildNumR">' + (_guildnum) + '</span>'+ '<br>' + winStat);	
				} else {
					$(_e).append('<span class="GuildNum">' + (_guildnum) + '</span>'+ '<br>' + winStat);
				}					
				_guildnum += 1;	
				_count+=1;	
				_totalhealth+=eval(_test[2]);
				_totalhealthleft+=eval(_test[1]);
				if ($(_e).find('img[src*="/graphics/class_cleric.gif"]').length>0) {
					_clericcount+=1;
					_clerictotalhealth+=eval(_test[2]); 
					_clerictotalhealthleft+=eval(_test[1]);
				}
				if ($(_e).find('img[src*="/graphics/class_mage.gif"]').length>0) {
					_magecount+=1;
					_magetotalhealth+=eval(_test[2]); 
					_magetotalhealthleft+=eval(_test[1]);
				}
				if ($(_e).find('img[src*="/graphics/class_rogue.gif"]').length>0) {
					_roguecount+=1;
					_roguetotalhealth+=eval(_test[2]); 
					_roguetotalhealthleft+=eval(_test[1]);
				}
				if ($(_e).find('img[src*="/graphics/class_warrior.gif"]').length>0) {
					_warriorcount+=1;
					_warriortotalhealth+=eval(_test[2]); 
					_warriortotalhealthleft+=eval(_test[1]);
				}
				if (_active) {
					_activecount+=1;
					_activetotalhealth+=eval(_test[2]); 
					if (_test[1]>0) _activelivecount+=1;
					_activetotalhealthleft+=eval(_test[1]);
				}	
            } else {
                $(_e).remove();
            }
			_text = '';
			_test = [];
        });
		if (_count>0) {
			$('#cabfTotalHealth').html('Total Health: '+_totalhealth);
			$('#cabfAverageHealth').html('Average Health: '+(_totalhealth/_count).toFixed());
			$('#cabfHealthLeft').html('Health Left: '+_totalhealthleft);
			$('#cabfAverageHealthLeft').html('Average Health Left: '+(_totalhealthleft/_count).toFixed());
			$('#cabfPercentageHealthLeft').html('Percentage Health Left: '+(_totalhealthleft*100/_totalhealth).toFixed(1)+'%');
			
			if (_clericcount>0) {
				$('#cabfClericTotalHealth').html('Total Health: '+_clerictotalhealth);
				$('#cabfClericAverageHealth').html('Average Health: '+(_clerictotalhealth/_clericcount).toFixed());
				$('#cabfClericHealthLeft').html('Health Left: '+_clerictotalhealthleft);
				$('#cabfClericAverageHealthLeft').html('Average Health Left: '+(_clerictotalhealthleft/_clericcount).toFixed());
				$('#cabfClericPercentageHealthLeft').html('Percentage Health Left: '+(_clerictotalhealthleft*100/_clerictotalhealth).toFixed(1)+'%');
			}
			
			if (_magecount>0) {
				$('#cabfMageTotalHealth').html('Total Health: '+_magetotalhealth);
				$('#cabfMageAverageHealth').html('Average Health: '+(_magetotalhealth/_magecount).toFixed());
				$('#cabfMageHealthLeft').html('Health Left: '+_magetotalhealthleft);
				$('#cabfMageAverageHealthLeft').html('Average Health Left: '+(_magetotalhealthleft/_magecount).toFixed());
				$('#cabfMagePercentageHealthLeft').html('Percentage Health Left: '+(_magetotalhealthleft*100/_magetotalhealth).toFixed(1)+'%');
			}
			
			if (_roguecount>0) {
				$('#cabfRogueTotalHealth').html('Total Health: '+_roguetotalhealth);
				$('#cabfRogueAverageHealth').html('Average Health: '+(_roguetotalhealth/_roguecount).toFixed());
				$('#cabfRogueHealthLeft').html('Health Left: '+_roguetotalhealthleft);
				$('#cabfRogueAverageHealthLeft').html('Average Health Left: '+(_roguetotalhealthleft/_roguecount).toFixed());
				$('#cabfRoguePercentageHealthLeft').html('Percentage Health Left: '+(_roguetotalhealthleft*100/_roguetotalhealth).toFixed(1)+'%');
			}
			
			if (_warriorcount>0) {
				$('#cabfWarriorTotalHealth').html('Total Health: '+_warriortotalhealth);
				$('#cabfWarriorAverageHealth').html('Average Health: '+(_warriortotalhealth/_warriorcount).toFixed());
				$('#cabfWarriorHealthLeft').html('Health Left: '+_warriortotalhealthleft);
				$('#cabfWarriorAverageHealthLeft').html('Average Health Left: '+(_warriortotalhealthleft/_warriorcount).toFixed());
				$('#cabfWarriorPercentageHealthLeft').html('Percentage Health Left: '+(_warriortotalhealthleft*100/_warriortotalhealth).toFixed(1)+'%');
			}		
			
			if (_activecount>0) {
				$('#cabfActiveTotalHealth').html('Total Health: '+_activetotalhealth);
				$('#cabfActiveAverageHealth').html('Average Health: '+(_activetotalhealth/_activecount).toFixed());
				$('#cabfActiveHealthLeft').html('Health Left: '+_activetotalhealthleft);
				if (_activelivecount>0) {
					$('#cabfActiveAverageHealthLeft').html('Average Health Left: '+(_activetotalhealthleft/_activelivecount).toFixed());
				} 
				$('#cabfActivePercentageHealthLeft').html('Percentage Health Left: '+(_activetotalhealthleft*100/_activetotalhealth).toFixed(1)+'%');
			}
		} 
	}
	
	// Add refresh on enemy_guild_tab and your_guild_tab for 10vs10 battle
	if ($('a[href*="ten_battle.php?battle_id="]').length >0 ) {
		var _battleid = $('input[name="battle_id"]').attr('value');
        console.log('_battleid='+_battleid);
		if ($('#enemy_guild_tab').length > 0) {
			$('#enemy_guild_tab').css({"font-size":"15px","padding-top":"0px","text-align":"center"});
			$('#enemy_guild_tab').wrap('<a href="ten_battle.php?battle_id='+_battleid+'&view_allies=false" onclick="ajaxLinkSend(\'globalContainer\', \'ten_battle.php?battle_id='+_battleid+'&view_allies=false\'); return false;"></a>');
		}
		if ($('#your_guild_tab').length > 0) {
			$('#your_guild_tab').css({"font-size":"15px","padding-top":"0px","text-align":"center"});
			$('#your_guild_tab').wrap('<a href="ten_battle.php?battle_id='+_battleid+'&view_allies=true" onclick="ajaxLinkSend(\'globalContainer\', \'ten_battle.php?battle_id='+_battleid+'&view_allies=true\'); return false;"></a>');
		}
	}
	
    // Saved filter settings
    var _storedClass = item.get('cabfPageTenBattleClass', 'All');
    var _storedActivity = item.get('cabfPageTenBattleActivity', 'All');
    var _storedStatus = item.get('cabfPageTenBattleStatus', 'All');
    var _storedPoints = item.get('cabfPageTenBattlePoints', 'All');
    
    // gate filter
    function filterGate() {
        var _count = 0;
        $('#your_new_guild_member_list > div > div, #enemy_new_guild_member_list > div > div').each(function(_i, _e) {
            var _class = $('#cabfGateClassFilter').val();
            var _activ = new RegExp($('#cabfGateActivityFilter').val(), "g");
            var _state = $('#cabfGateStatusFilter').val();
            var _points = $('#cabfGatePointsFilter').val();            
            var _text = $(_e).text().trim(), _stateTest = true;
            switch (_state) {
                case 'FullHealth':
                    var _test = /(\d+)\/(\d+)/g.exec(_text);
                    _stateTest = (_test.length === 3 && _test[1] === _test[2]) ? true : false;
                    break;
                case 'GotHealth':
                    var _test = /(\d+)\/(\d+)/g.exec(_text);
                    _stateTest = (_test.length === 3 && !(eval(_test[1]) === 0)) ? true : false;
                    break;
                case 'NoHealth':
                    var _test = /(\d+)\/(\d+)/g.exec(_text);
                    _stateTest = (_test.length === 3 && eval(_test[1]) === 0) ? true : false;
                    break;
                default:
                    var _test = new RegExp(_state, "g");
                    _stateTest = _test.test(_text);
            }
            
            var _classTest = _class === 'all' ? 1 : $(_e).find('img[src*="/graphics/class_' + _class + '.gif"]').length;
            var _pointTest = _points === 'all' ? 1 : $(_e).find('img[title="Battle Points for Victory: ' + _points + '"]').length;
            if (_classTest > 0 && _activ.test(_text) && _pointTest > 0 && _stateTest === true) {
                $(_e).show();
                _count += 1;
            } else {
                $(_e).hide();
            }
            
        });
        $('#enemy_guild_tab,#your_guild_tab').append('<br><br><span style="font-size:14px;font-weight:bold;">Filtered: ' + _count + '</span>');
    }
    
    // class filter
    var filterClass = {
        'All' : 'all',
        'Cleric' : 'cleric',
        'Mage' : 'mage',
        'Rogue' : 'rogue',
        'Warrior' : 'warrior'
    }, filterActivity = {
        'All' : '\.',
        'Active' : 'Battle Points: [1-9]',
        'Inactive' : 'Battle Points: 0'
    }, filterStatus = {
        'All' : '\.',
        'Full health' : 'FullHealth',
        'Got health' : 'GotHealth',
        'No health' : 'NoHealth',
        'Healthy' : 'Healthy',
        'Good' : 'Good',
        'Fair' : 'Fair',
        'Weakened' : 'Weakened',
        'Stunned' : 'Stunned'
    }, filterPoints = {
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
    }).click(function() {
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
    $.each(filterClass, function(_i, _e) {
        _sel.append('<option value="' + _e + '" ' + (_storedClass == _i ? 'selected = "selected"' : '') + ' >' + _i + '</option>');
    });
    _sel.change(function() {
        _storedClass = $(this).find("option:selected").text();
        item.set('cabfPageTenBattleClass', _storedClass);
        filterGate();
    });
    // Activity filter
    $('#cabf_menu').append('<span class="cabfGateFilterTitle ui-state-default"> Activity </span><select id="cabfGateActivityFilter" class="cabfgatefiltertitle">');
    _sel = $('#cabfGateActivityFilter');
    $.each(filterActivity, function(_i, _e) {
        _sel.append('<option value="' + _e + '" ' + (_storedActivity == _i ? 'selected = "selected"' : '') + ' >' + _i + '</option>');
    });
    _sel.change(function() {
        _storedActivity = $(this).find("option:selected").text();
        item.set('cabfPageTenBattleActivity', _storedActivity);
        filterGate();
    });
    // status filter
    $('#cabf_menu').append('<span class="cabfGateFilterTitle ui-state-default"> Status </span><select id="cabfGateStatusFilter" class="cabfgatefiltertitle">');
    _sel = $('#cabfGateStatusFilter');
    $.each(filterStatus, function(_i, _e) {
        _sel.append('<option value="' + _e + '" ' + (_storedStatus == _i ? 'selected = "selected"' : '') + ' >' + _i + '</option>');
    });
    _sel.change(function() {
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
    $.each(filterPoints, function(_i, _e) {
        _sel.prepend('<option value="' + _e + '" ' + (_storedPoints == _i ? 'selected = "selected"' : '') + ' >' + _i + '</option>');
    });
    _sel.change(function() {
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
    window.setTimeout(function() {
        filterGate();
    }, 10);
};


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
	addStatBoard('#guild_battle_guild_tabs');
	
    // add current tokens to result
    var _tokens = $('div.result div:contains("-1 Battle Tokens"):last');
    _tokens.text(_tokens.text() + ' (' + $('#guild_token_current_value').text() + ' left)');
    
    // reduce gate size and add number
    var _guildnum = 1, 
			_count = 0, 
			_totalhealth = 0, _totalhealthleft = 0, 
			_clericcount = 0, 
			_clerictotalhealth = 0, _clerictotalhealthleft = 0, 
			_magecount = 0, 
			_magetotalhealth = 0, _magetotalhealthleft = 0, 
			_roguecount = 0, 
			_roguetotalhealth = 0, _roguetotalhealthleft = 0, 
			_warriorcount = 0, 
			_warriortotalhealth = 0, _warriortotalhealthleft = 0;	
			_activecount = 0, _activelivecount = 0, 
			_activetotalhealth = 0, _activetotalhealthleft = 0;		
	var _gateNum = $('#enemy_guild_battle_section_battle_list, #your_guild_battle_section_battle_list').attr('class').match(/\d/)[0];
	var _gateName='';
	if ($('#enemy_guild_battle_section_battle_list').length > 0) {
		$('#cabfStatType').html('Enemy');
	} else {
		$('#cabfStatType').html('Ally');
	}
	switch (_gateNum) {
		case '1':  _gateName='North';		
				break;
		case '2':  _gateName='West';
				break;
		case '3':  _gateName='East';
				break;
		case '4':  _gateName='South';
				break;
		default: _gateName=' ';
	} 
	$('#cabfStatTower span:last').html(_gateName+' Tower Stat');
	$('#cabfStatCleric span:last').html(_gateName+' Cleric Stat');
	$('#cabfStatMage span:last').html(_gateName+' Mage Stat');
	$('#cabfStatRogue span:last').html(_gateName+' Rogue Stat');
	$('#cabfStatWarrior span:last').html(_gateName+' Warrior Stat');  
	$('#cabfStatActive span:last').html(_gateName+' Active Stat');   
    $('#enemy_guild_member_list > div > div, #your_guild_member_list > div > div').each(function(_i, _e) {
		var _text = $(_e).text().trim(), _FullHealth = true;
		if (_text && $(_e).text().trim().length > 0) {
			var _test = /(\d+)\/(\d+)/g.exec(_text);
			var _active = /Battle Points: [1-9]/g.exec(_text);	
			var winStat = '';
			if ($('input[name="target_id"]',_e).length>0) {
				var target_id=$('input[name="target_id"]',_e).attr("value");
				winStat=getTargetStat(target_id);
				addTargetTip(_e);
			}
			if (_test)
			{
				_FullHealth = (_test.length === 3 && _test[1] === _test[2]) ? true : false;
				if (_FullHealth)
					$(_e).append('<span class="GuildNumG">' + (_guildnum) + '</span>'+ '<br>' + winStat);
				else
					$(_e).append('<span class="GuildNumR">' + (_guildnum) + '</span>'+ '<br>' + winStat);	
			} else {
				$(_e).append('<span class="GuildNum">' + (_guildnum) + '</span>'+ '<br>' + winStat);
			}					
			_guildnum += 1;	
			_count+=1;	
			_totalhealth+=eval(_test[2]);
			_totalhealthleft+=eval(_test[1]);
			if ($(_e).find('img[src*="/graphics/class_cleric.gif"]').length>0) {
				_clericcount+=1;
				_clerictotalhealth+=eval(_test[2]); 
				_clerictotalhealthleft+=eval(_test[1]);
			}
			if ($(_e).find('img[src*="/graphics/class_mage.gif"]').length>0) {
				_magecount+=1;
				_magetotalhealth+=eval(_test[2]); 
				_magetotalhealthleft+=eval(_test[1]);
			}
			if ($(_e).find('img[src*="/graphics/class_rogue.gif"]').length>0) {
				_roguecount+=1;
				_roguetotalhealth+=eval(_test[2]); 
				_roguetotalhealthleft+=eval(_test[1]);
			}
			if ($(_e).find('img[src*="/graphics/class_warrior.gif"]').length>0) {
				_warriorcount+=1;
				_warriortotalhealth+=eval(_test[2]); 
				_warriortotalhealthleft+=eval(_test[1]);
			}	
			if (_active) {
				_activecount+=1;
				_activetotalhealth+=eval(_test[2]); 
				if (_test[1]>0) _activelivecount+=1;
				_activetotalhealthleft+=eval(_test[1]);
			}	
		} else {
			$(_e).remove();
		}
		_text = '';
		_test = [];
    });
	if (_count>0) {
		$('#cabfTotalHealth').html('Total Health: '+_totalhealth);
		$('#cabfAverageHealth').html('Average Health: '+(_totalhealth/_count).toFixed());
		$('#cabfHealthLeft').html('Health Left: '+_totalhealthleft);
		$('#cabfAverageHealthLeft').html('Average Health Left: '+(_totalhealthleft/_count).toFixed());
		$('#cabfPercentageHealthLeft').html('Percentage Health Left: '+(_totalhealthleft*100/_totalhealth).toFixed(1)+'%');
		
		if (_clericcount>0) {
			$('#cabfClericTotalHealth').html('Total Health: '+_clerictotalhealth);
			$('#cabfClericAverageHealth').html('Average Health: '+(_clerictotalhealth/_clericcount).toFixed());
			$('#cabfClericHealthLeft').html('Health Left: '+_clerictotalhealthleft);
			$('#cabfClericAverageHealthLeft').html('Average Health Left: '+(_clerictotalhealthleft/_clericcount).toFixed());
			$('#cabfClericPercentageHealthLeft').html('Percentage Health Left: '+(_clerictotalhealthleft*100/_clerictotalhealth).toFixed(1)+'%');
		}
		
		if (_magecount>0) {
			$('#cabfMageTotalHealth').html('Total Health: '+_magetotalhealth);
			$('#cabfMageAverageHealth').html('Average Health: '+(_magetotalhealth/_magecount).toFixed());
			$('#cabfMageHealthLeft').html('Health Left: '+_magetotalhealthleft);
			$('#cabfMageAverageHealthLeft').html('Average Health Left: '+(_magetotalhealthleft/_magecount).toFixed());
			$('#cabfMagePercentageHealthLeft').html('Percentage Health Left: '+(_magetotalhealthleft*100/_magetotalhealth).toFixed(1)+'%');
		}
		
		if (_roguecount>0) {
			$('#cabfRogueTotalHealth').html('Total Health: '+_roguetotalhealth);
			$('#cabfRogueAverageHealth').html('Average Health: '+(_roguetotalhealth/_roguecount).toFixed());
			$('#cabfRogueHealthLeft').html('Health Left: '+_roguetotalhealthleft);
			$('#cabfRogueAverageHealthLeft').html('Average Health Left: '+(_roguetotalhealthleft/_roguecount).toFixed());
			$('#cabfRoguePercentageHealthLeft').html('Percentage Health Left: '+(_roguetotalhealthleft*100/_roguetotalhealth).toFixed(1)+'%');
		}
		
		if (_warriorcount>0) {
			$('#cabfWarriorTotalHealth').html('Total Health: '+_warriortotalhealth);
			$('#cabfWarriorAverageHealth').html('Average Health: '+(_warriortotalhealth/_warriorcount).toFixed());
			$('#cabfWarriorHealthLeft').html('Health Left: '+_warriortotalhealthleft);
			$('#cabfWarriorAverageHealthLeft').html('Average Health Left: '+(_warriortotalhealthleft/_warriorcount).toFixed());
			$('#cabfWarriorPercentageHealthLeft').html('Percentage Health Left: '+(_warriortotalhealthleft*100/_warriortotalhealth).toFixed(1)+'%');
		}
			
		if (_activecount>0) {
			$('#cabfActiveTotalHealth').html('Total Health: '+_activetotalhealth);
			$('#cabfActiveAverageHealth').html('Average Health: '+(_activetotalhealth/_activecount).toFixed());
			$('#cabfActiveHealthLeft').html('Health Left: '+_activetotalhealthleft);
			if (_activelivecount>0) {
				$('#cabfActiveAverageHealthLeft').html('Average Health Left: '+(_activetotalhealthleft/_activelivecount).toFixed());
			} 
			$('#cabfActivePercentageHealthLeft').html('Percentage Health Left: '+(_activetotalhealthleft*100/_activetotalhealth).toFixed(1)+'%');
		}
	} 
    
    // Saved filter settings
    var _storedClass = item.get('cabfPageFestGuildBattleClass', 'All');
    var _storedActivity = item.get('cabfPageFestGuildBattleActivity', 'All');
    var _storedStatus = item.get('cabfPageFestGuildBattleStatus', 'All');
    var _storedPoints = item.get('cabfPageFestGuildBattlePoints', 'All');
    
    // gate filter
    function filterGate() {
        var _count = 0;
        var _gateNum = $('#enemy_guild_battle_section_battle_list, #your_guild_battle_section_battle_list').attr('class').match(/\d/)[0];
        var _gate = $('#enemy_arena_tab_' + _gateNum + ' > div, #your_arena_tab_' + _gateNum + ' > div');
        $('#your_guild_member_list > div > div, #enemy_guild_member_list > div > div').each(function(_i, _e) {
            
            var _class = $('#cabfGateClassFilter').val();
            var _activ = new RegExp($('#cabfGateActivityFilter').val());
            var _state = $('#cabfGateStatusFilter').val();
            var _points = $('#cabfGatePointsFilter').val();
            var _text = $(_e).text().trim(), _stateTest = true;
            switch (_state) {
                case 'FullHealth':
                    var _test = /(\d+)\/(\d+)/g.exec(_text);
                    _stateTest = (_test.length === 3 && _test[1] === _test[2]) ? true : false;
                    break;
                case 'GotHealth':
                    var _test = /(\d+)\/(\d+)/g.exec(_text);
                    _stateTest = (_test.length === 3 && !(eval(_test[1]) === 0)) ? true : false;
                    break;
                case 'NoHealth':
                    var _test = /(\d+)\/(\d+)/g.exec(_text);
                    _stateTest = (_test.length === 3 && eval(_test[1]) === 0) ? true : false;
                    break;
                default:
                    var _test = new RegExp(_state, "g");
                    _stateTest = _test.test(_text);
            }
            
            var _classTest = _class === 'all' ? 1 : $(_e).find('img[src*="/graphics/class_' + _class + '.gif"]').length;
            var _pointTest = _points === 'all' ? 1 : $(_e).find('img[title="Battle Points for Victory: ' + _points + '"]').length;
            if (_classTest > 0 && _activ.test(_text) && _pointTest > 0 && _stateTest === true) {
                $(_e).show();
                _count += 1;
            } else {
                $(_e).hide();
            }
        });
       _gate.html(_gate.html().replace(/\).*/, ')').replace(')', ')<br/><span style="font-size:11px;font-weight:bold;">Filtered: ' + _count + '</span>'));
    }
	
    // class filter
    var filterClass = {
        'All' : 'all',
        'Cleric' : 'cleric',
        'Mage' : 'mage',
        'Rogue' : 'rogue',
        'Warrior' : 'warrior'
    }, filterActivity = {
        'All' : '\.*',
        'Active' : 'Battle Points: [1-9]',
        'Inactive' : 'Battle Points: 0'
    }, filterStatus = {
        'All' : '\.*',
        'Full health' : 'FullHealth',
        'Got health' : 'GotHealth',
        'No health' : 'NoHealth',
        'Healthy' : 'Healthy',
        'Good' : 'Good',
        'Fair' : 'Fair',
        'Weakened' : 'Weakened',
        'Stunned' : 'Stunned'
    }, filterPoints = {
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
    }).click(function() {
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
    $.each(filterClass, function(_i, _e) {
        _sel.append('<option value="' + _e + '" ' + (_storedClass == _i ? 'selected = "selected"' : '') + ' >' + _i + '</option>');
    });
    _sel.change(function() {
        _storedClass = $(this).find("option:selected").text();
        item.set('cabfPageFestGuildBattleClass', _storedClass);
        filterGate();
    });
    // Activity filter
    $('#cabf_menu').append('<span class="cabfGateFilterTitle ui-state-default"> Activity </span><select id="cabfGateActivityFilter" class="cabfgatefiltertitle">');
    _sel = $('#cabfGateActivityFilter');
    $.each(filterActivity, function(_i, _e) {
        _sel.append('<option value="' + _e + '" ' + (_storedActivity == _i ? 'selected = "selected"' : '') + ' >' + _i + '</option>');
    });
    _sel.change(function() {
        _storedActivity = $(this).find("option:selected").text();
        item.set('cabfPageFestGuildBattleActivity', _storedActivity);
        filterGate();
    });
    // status filter
    $('#cabf_menu').append('<span class="cabfGateFilterTitle ui-state-default"> Status </span><select id="cabfGateStatusFilter" class="cabfgatefiltertitle">');
    _sel = $('#cabfGateStatusFilter');
    $.each(filterStatus, function(_i, _e) {
        _sel.append('<option value="' + _e + '" ' + (_storedStatus == _i ? 'selected = "selected"' : '') + ' >' + _i + '</option>');
    });
    _sel.change(function() {
        _storedStatus = $(this).find("option:selected").text();
        item.set('cabfPageFestGuildBattleStatus', _storedStatus);
        filterGate();
    });
    // Battle activity points filter
    $('#cabf_menu').append('<span class="cabfGateFilterTitle ui-state-default"> Points </span><select id="cabfGatePointsFilter" class="cabfgatefiltertitle">');
    _sel = $('#cabfGatePointsFilter');
    $.each(filterPoints, function(_i, _e) {
        _sel.append('<option value="' + _e + '" ' + (_storedPoints == _i ? 'selected = "selected"' : '') + ' >' + _i + '</option>');
    });
    _sel.change(function() {
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
    window.setTimeout(function() {
        filterGate();
    }, 10);
};

/******************************************************************************************************************************************************************************
*******************************************************************************************************************************************************************************
*************    MONSTERS *****************************************************************************************************************************************************
*******************************************************************************************************************************************************************************
******************************************************************************************************************************************************************************/
function monsterBars() {
	var _monstername = null, _ret = [];
	// add percentage to top bars
	if ($('#app_body div[style*="nm_bars.jpg"], #app_body div[style*="nm_bars_cross.jpg"]').length > 0) {
		$('img[src*="monster_health_background.jpg"], [src*="nm_red.jpg"], [src*="nm_orange.jpg"]').each(function(_i, _e) {
			_monstername = $(_e).parent().parent().find('div:contains("\'s Life"):last, #app_body div:contains("\'s life"):last');
			var _health = $(_e).parent()[0];
			if (_health.style && _health.style.width !== "" && _monstername && _monstername.text()) {
				var _percentage = _health.style.width.substr(0, 5);
				_monstername.text(_monstername.text().trim() + ' (' + _percentage + (_percentage.indexOf('%') > -1 ? ')' : '%)'));
				_ret.push(_monstername.text());
			}
		});
	} else {
		$('img[src*="monster_health_background.jpg"], [src*="nm_red.jpg"]').each(function(_i, _e) {
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
};

function defenseBar() {
	// add percentage to defense/forcefield/..
	var _defense = $('img[src*="bar_dispel.gif"],[src*="nm_green.jpg"],[src*="seamonster_ship_health.jpg"]').parent()[0], _defRegs = [
			'^Castle Defense$', '^Ragnarok\'s Glacial Armor$', '^Your Ship\'s Defense$', '^Illvasa, Plateau City\'s Defense$', '^Skaar\'s Mana Forcefield$', '^Party Health\\/Strength$'
	], _defReg = new RegExp(_defRegs.join('|'));
	_defText = $('#app_body').find('div').filter(function() {
		return $(this).text().match(_defReg);
	});
	// _defText = $('#app_body').find('div:containsRegex(/' + _defRegs.join('|') + '/):first');
	if (_defense && _defense.style && _defense.style.width !== "" && _defText && _defText.text()) {
		var _percentage = _defense.style.width.substr(0, 5);
		var _maxHealth = false;
		if (/^Party Health\/Strength$/.test(_defText.text())) {
			_maxHealth = _defText.parent().prev().find('div:first')[0].style.width.substr(0, 5);
			_defText.css('left', 51).text('Party Health ' + _percentage + (_percentage.indexOf('%') > -1 ? '' : '%') + ' / Strength ' + _maxHealth + (_maxHealth.indexOf('%') > -1 ? '' : '%'));
		} else {
			_defText.css('left', 51).text(_defText.text() + '(' + _percentage + (_percentage.indexOf('%') > -1 ? ')' : '%)'));
		}
		return _defText.text();
	}
	return '';
};

function stunBar() {
	// add percentage to Cripple...
	var _stun = $('#app_body div > img[src$="nm_stun_bar.gif"]:first');
	if (_stun.length > 0) {
		var _text = _stun.parent().next().children('div:first'), _ret;
		_stun = _stun[0].style.width.substr(0, 5);
		_ret = _text.text() + ': ' + _stun + (_stun.indexOf('%') > -1 ? '' : '%').replace('Need ', '').replace('Fill to ', '').toLowerCase();
		_text.text(_text.text() + ' ' + _stun + (_stun.indexOf('%') > -1 ? '' : '%'));
		return _ret;
	}
	return '';
};

/******************************************************************************************************************************************************************************
*******************************************************************************************************************************************************************************
*************    STATS BATTLE *************************************************************************************************************************************************
*******************************************************************************************************************************************************************************
******************************************************************************************************************************************************************************/
var defaultStats={"targets":[{"target_id":"0","victory":0,"defeat":0}]};
function addTargetTip(_e) {
	$(_e).mouseover(function(e) {
		var stats=item.get('stats',defaultStats),
			target_id=$('input[name="target_id"]',this).attr("value"),
			indexTarget=0,
			victory=0,
			defeat=0;
		indexTarget=getTargetIndex(stats.targets,target_id);
		if (indexTarget>=0) {
			victory=stats.targets[indexTarget].victory;
			defeat=stats.targets[indexTarget].defeat;
		}
        var tip = $(this).attr('title');   
        $(this).attr('title',''); 
		$(this).append('<div id="tooltip"><div class="tipHeader"></div><div class="tipBody">' 
		+ 'Hits Numbers : '+ eval(victory+defeat) + '<br>'
		+ 'Victories : '+ victory + '<br>'
		+ 'Defeats : '+ defeat + '<br>'
		+ '</div><div class="tipFooter"></div></div>');  
        $('#tooltip').css('top', e.pageY + 10 );
        $('#tooltip').css('left', e.pageX + 20 );
        $('#tooltip').fadeIn('500');
        $('#tooltip').fadeTo('10',0.8);
    }).mousemove(function(e) {
        $('#tooltip').css('top', e.pageY + 10 );
        $('#tooltip').css('left', e.pageX + 20 );
    }).mouseout(function() {
        $(this).attr('title',$('.tipBody').html());
        $(this).children('div#tooltip').remove();
    });
}
function getTargetIndex(array, target_id) {
	for (var i = 0; i < array.length; i++){
		if (array[i].target_id===target_id) { 
			return i;
		}
	}
	return -1;
}
function getTargetStat(target_id) {
	var stats=item.get('stats',defaultStats);
	var indexTarget=getTargetIndex(stats.targets,target_id);
	if (indexTarget>=0) {
		var victory=eval(stats.targets[indexTarget].victory),
			defeat=eval(stats.targets[indexTarget].defeat);
		if ((victory+defeat)>0) {
			if ((victory-defeat)>0) {
				return '<span class="GuildNumG">'+Math.round(((victory-defeat)*100/(victory+defeat)))+'%</span><br><span class="KeepLink"><a href="keep.php?casuser=' + target_id + '">Keep</a></span>';
			} else {
				return '<span class="GuildNumR">'+Math.round(((victory-defeat)*100/(victory+defeat)))+'%</span><br><span class="KeepLink"><a href="keep.php?casuser=' + target_id + '">Keep</a></span>';
			}
		}
	}
	return '<span class="GuildNum">0%</span><br><span class="KeepLink"><a href="keep.php?casuser=' + target_id + '">Keep</a></span>';
}
function battleStats() {
	var stats=item.get('stats',defaultStats);
	if ($('#results_main_wrapper>div').length > 0 ) {
		console.log("Battle Stats");
		var target = $('#results_main_wrapper input[name="target_id"]'),target_id=0;
		console.log("target=",target);
		console.log("target.length=",target.length);
		console.log('target.attr("value")=',target.attr("value"));
		if (target.length > 0 ) {
			var target_id=target.attr("value"),indexTarget=0;
			indexTarget=getTargetIndex(stats.targets,target_id);
			if (indexTarget<0) {
				var newTarget={"target_id":target_id,"victory":0,"defeat":0};
				stats.targets.push(newTarget);
				indexTarget=getTargetIndex(stats.targets,target_id);
			}
			if ($('#results_main_wrapper>div:contains("VICTORY")').length > 0 ) {
				console.log("VICTORY");
				stats.targets[indexTarget].victory++;
			} else if ($('#results_main_wrapper>div:contains("DEFEAT")').length > 0 ) {
				console.log("DEFEAT");
				stats.targets[indexTarget].defeat++;
			} else if ($('#results_main_wrapper>div:contains("HEAL")').length > 0 ) {
				console.log("HEAL");
			} else if ($('#results_main_wrapper>div:contains("DISPEL")').length > 0 ) {
				console.log("DISPEL");
			} else if ($('#results_main_wrapper>div:contains("ILLUSION")').length > 0 ) {
				console.log("ILLUSION");
			} else if ($('#results_main_wrapper>img[src*="battle_defeat.gif"]')) {
				console.log("DEFEAT (battle_defeat.gif)");
				stats.targets[indexTarget].defeat++;
			} else if ($('#results_main_wrapper>img[src*="battle_victory.gif"]')) {
				console.log("VICTORY (battle_victory.gif)");
				stats.targets[indexTarget].victory++;
			} else {
				console.log("DEFEAT");
			}
		}
	}
	item.set('stats',stats);
	console.log("targets",stats.targets);
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
    /* Guild battle or 10vs10 battle*/
    if ($('#enemy_guild_tab,#your_guild_tab').length > 0) {
    
		// Switch between 10vs10 battle and Guild battle
		if ($('#enemy_new_guild_tab_1,#your_new_guild_tab_1').length >0 ) {
			console.log('Guild battle');
			battleStats();
			cabf_guildbattlefilter();
		} else {
			console.log('10vs10 battle');
			battleStats();
			cabf_tenbattlefilter();
		}
    } else     
    /* Festival battle */
    if ($('#enemy_team_tab').length > 0 || $('#your_team_tab').length > 0) {
        console.log('Festival battle');
		battleStats();
        cabf_festivalbattlefilter();
    } else    
    /* Earth land conquest battle */
    if ($('#tower_1,#tower_2,#tower_3,#tower_4').length > 0) {
        console.log('Earth land conquest battle');
		battleStats();
        cabf_conquestearthfilter();
    } else    
    /* Mist land conquest battle */
    if ($('#your_guild_member_list_1').length > 0) {
        console.log('Mist land conquest battle');
		battleStats();
        cabf_conquestmistfilter();
    } else    
    /* Normal battle */
    if ($('#blist_pulldown_select').length > 0) {
        console.log('Normal battle');
		battleStats();
    }
	
	
    /* monsters */
    if ($('img[src*="monster_health_background.jpg"], [src*="nm_red.jpg"], [src*="nm_orange.jpg"],[src*="bar_dispel.gif"],[src*="nm_green.jpg"],[src*="seamonster_ship_health.jpg"],[src$="nm_stun_bar.gif"]').length > 0 ) {
		monsterBars();
        defenseBar();
        stunBar();
    }
};

function init() {
    var globalContainer = document.querySelector('#globalContainer');
    
    
    if (!globalContainer) {
        if ($("input[src*='crusader2_btn_submit.gif']").length > 0) {
            
            setInterval(function () {
                var button = $("input[src*='crusader2_btn_submit.gif']");
            	console.log('Try Connection');
                button.click();
            }, 30000);
        }
    }
	
    globalContainer.addEventListener('click', function(event) {
        try {
            if(updated)
                window.location.href = clickUrl;
            
            var obj = event.target;
            
            while(obj && !obj.href)
                obj = obj.parentNode;
            
            if(obj && obj.href)
                clickUrl = obj.href;
        } catch (e) {
            console.error("Error in globalContainer Click",e);
        }
    }, true);
    
    globalContainer.addEventListener('DOMNodeInserted', function(event) {
        try {
            if (event.target.hasOwnProperty('id')) {
                if(event.target.id == 'main_bn' || event.target.querySelector("#main_bn")) {
                   setTimeout(function() {cabf_filters();}, 0);
                }           
            }
        } catch (e) {
            console.error("Error in globalContainer DOMNodeInserted",e);
        }
        
    }, true);
    
    GM_registerMenuCommand("Castle Age - Battle Filter", function() {init();});
    try {
        addCss ( "#cabfEarthFiltered1 {	color: #fff;}");
        addCss ( "#cabfEarthFiltered2 {	color: #fff;}");
        addCss ( "#cabfEarthFiltered3 {	color: #fff;}");
        addCss ( "#cabfEarthFiltered4 {	color: #fff;}");
        addCss ( "#cabfEarthAction1 {	color: #fff;}");
        addCss ( "#cabfEarthAction2 {	color: #fff;}");
        addCss ( "#cabfEarthAction3 {	color: #fff;}");
        addCss ( "#cabfEarthAction4 {	color: #fff;}");
        addCss ( "#cabfHealthAction {	position: absolute;	background: #000;	padding: 5px;	color: #fff;	width: 170px;	text-align: center;	opacity: 0.75;}");
        addCss ( "#cabfHealthActionEarth {	position: fixed;	background: #000;	padding: 5px;	color: #fff;	margin-top: 0px; width: 200px;	text-align: center;	opacity: 0.75; top: 58px; left: 0px;}");
        addCss ( "#cabfConquestEarthFilterContainer {	width: 740px;	position: fixed;	top: 0px;	left: 0px;	margin-bottom: 0px;	height: 57px; z-index: 99;}");
        addCss ( "#cabfConquestEarthFilter {	height: 30px;	border-bottom-left-radius: 8px;	border-bottom-right-radius: 8px;	box-shadow: 0 5px 5px #000;	padding: 0 11px 0 4px;	position: fixed;	width: 480px;	margin-left: 0px;	opacity: 0.75;}");
        addCss ( "#cabfConquestBattleFilterContainer {	background-image: url('https://castleagegame1-a.akamaihd.net/22284/graphics/conq2_insideland_midrepeat.jpg');	width: 740px;	position: relative;	top: -10px;	margin-bottom: -10px;	height: 57px;}");
        addCss ( "#cabfConquestBattleFilter {	height: 30px;	border-bottom-left-radius: 8px;	border-bottom-right-radius: 8px;	box-shadow: 0 5px 5px #000;	padding: 0 11px 0 4px;	position: relative;	width: 550px;	margin-left: 90px;}");
        addCss ( '.cabfGateFilterTitle {position: relative !important;left: 11px;top: 3px;float: left;font-size: 12px;height: 15px;padding: 4px !important;color: rgb(255, 255, 255);background-color: rgb(34, 34, 34);border: 1px solid rgb(68, 68, 68);}');
        addCss ( '#cabfGateClassFilter-button {color: white;top: 3px;left: 9px;position: relative;float: left;font-size: 12px;border-radius: 0;width: 90px !important;height: 23px;}');
        addCss ( '#cabfGateClassFilter-menu {font-size: 12px;width: 90px !important;}');
        addCss ( '#cabfGateActivityFilter-button {color: white;top: 3px;left: 9px;position: relative;float: left;font-size: 12px;border-radius: 0;width: 80px !important;height: 23px;}');
        addCss ( '#cabfGateActivityFilter-menu {font-size: 12px;width: 80px !important;}');
        addCss ( '#cabfGateStatusFilter-button {color: white;top: 3px;left: 9px;position: relative;float: left;font-size: 12px;border-radius: 0;width: 100px !important;height: 23px;}');
        addCss ( '#cabfGateStatusFilter-menu {font-size: 12px;width: 100px !important;}');
        addCss ( '#cabfGateClassFilter,#cabfGateStatusFilter,#cabfGatePointsFilter {	color: #fff;	height: 25px;	border: 1px solid #444444;	background-color: #222;	position: relative;	top: 3px;	left: 9px;	float: left;}');   
        addCss ( "#cabfHealthStatBoard {position:fixed;background:#000;padding:5px;color:#fff;margin-top:0px;width:275px;text-align:center;opacity:0.75;top:0px;left:0px;height:100%;overflow:auto;display:block;font-size:11px;}");
        addCss ( "#cabfStatType  {color:rosybrown; font-weight: bold;}");
        addCss ( "#cabfStatTower {color:rosybrown; font-weight: bold;}");
        addCss ( "#cabfStatCleric {color: yellow; font-weight: bold;}");
        addCss ( "#cabfStatMage {color: blueviolet; font-weight: bold;}");
        addCss ( "#cabfStatRogue {color: green; font-weight: bold;}");
        addCss ( "#cabfStatWarrior {color: royalblue; font-weight: bold;}");
        addCss ( "#cabfStatActive {color: red; font-weight: bold;}");
		
        addCss ( "#cabfTotalHealth       {color: #fff;text-align:end;}");
        addCss ( "#cabfAverageHealth     {color: #fff;text-align:end;}");
        addCss ( "#cabfHealthLeft        {color: #fff;text-align:end;}");
        addCss ( "#cabfAverageHealthLeft {color: #fff;text-align:end;}");
		addCss ( "#cabfPercentageHealthLeft {color: #fff;text-align:end;}");
		
        addCss ( "#cabfClericTotalHealth       {color: #fff;text-align:end;}");
        addCss ( "#cabfClericAverageHealth     {color: #fff;text-align:end;}");
        addCss ( "#cabfClericHealthLeft        {color: #fff;text-align:end;}");
        addCss ( "#cabfClericAverageHealthLeft {color: #fff;text-align:end;}");
		addCss ( "#cabfClericPercentageHealthLeft {color: #fff;text-align:end;}");
		
        addCss ( "#cabfMageTotalHealth       {color: #fff;text-align:end;}");
        addCss ( "#cabfMageAverageHealth     {color: #fff;text-align:end;}");
        addCss ( "#cabfMageHealthLeft        {color: #fff;text-align:end;}");
        addCss ( "#cabfMageAverageHealthLeft {color: #fff;text-align:end;}");
		addCss ( "#cabfMagePercentageHealthLeft {color: #fff;text-align:end;}");
		
        addCss ( "#cabfRogueTotalHealth       {color: #fff;text-align:end;}");
        addCss ( "#cabfRogueAverageHealth     {color: #fff;text-align:end;}");
        addCss ( "#cabfRogueHealthLeft        {color: #fff;text-align:end;}");
        addCss ( "#cabfRogueAverageHealthLeft {color: #fff;text-align:end;}");
		addCss ( "#cabfRoguePercentageHealthLeft {color: #fff;text-align:end;}");
		
        addCss ( "#cabfWarriorTotalHealth       {color: #fff;text-align:end;}");
        addCss ( "#cabfWarriorAverageHealth     {color: #fff;text-align:end;}");
        addCss ( "#cabfWarriorHealthLeft        {color: #fff;text-align:end;}");
        addCss ( "#cabfWarriorAverageHealthLeft {color: #fff;text-align:end;}");
		addCss ( "#cabfWarriorPercentageHealthLeft {color: #fff;text-align:end;}");
		
        addCss ( "#cabfActiveTotalHealth       {color: #fff;text-align:end;}");
        addCss ( "#cabfActiveAverageHealth     {color: #fff;text-align:end;}");
        addCss ( "#cabfActiveHealthLeft        {color: #fff;text-align:end;}");
        addCss ( "#cabfActiveAverageHealthLeft {color: #fff;text-align:end;}");
		addCss ( "#cabfActivePercentageHealthLeft {color: #fff;text-align:end;}");
		
        addCss ( '.GuildNum {	color:white;position:relative;top:-100px;left:15px;text-shadow: 0 0 1px black, 0 0 4px black;font-weight: bold;}');   
        addCss ( '.GuildNumG{	color:green;position:relative;top:-100px;left:15px;text-shadow: 0 0 1px black, 0 0 4px black;font-weight: bold;}');   
        addCss ( '.GuildNumR{	color:red;position:relative;top:-100px;left:15px;text-shadow: 0 0 1px black, 0 0 4px black;font-weight: bold;}');  
        addCss ( '.KeepLink {	color:white;position:relative;top:-100px;left:15px;text-shadow: 0 0 1px black, 0 0 4px black;font-weight: bold;}'); 
		
        addCss ( '#tooltip {position:absolute;z-index:9999;color:#fff;font-size:10px;width:180px;}');    
        addCss ( '#tooltip .tipHeader {height:8px;background:url(images/tipHeader.gif) no-repeat;}');     
        addCss ( '#tooltip .tipBody {background-color:#000;padding:5px 5px 5px 15px;}');    
        addCss ( '#tooltip .tipFooter {height:8px;background:url(images/tipFooter.gif) no-repeat;}');   
    } catch (e) {
        console.error("Error addCss",e);
    }
    
};

GM_addStyle (GM_getResourceText ("jqueryUiCss") );
//GM_addStyle (GM_getResourceText ("ca_cabfCss") );


function cabf_connect() {
    if ($("input[src*='crusader2_btn_submit.gif']").length > 0) {
        var button = $("input[src*='crusader2_btn_submit.gif']");
        console.log('Connection');
        if (document.getElementsByName("player_password")[0].value)
			button.click();
	}
}

/* Connection */
cabf_connect();
console.log('init()');
init();
