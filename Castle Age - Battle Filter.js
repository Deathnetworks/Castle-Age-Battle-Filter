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
// @version        1.1.0
// @copyright      2013+, Jigoku
// ==/UserScript==

var version = '1.1.0', clickUrl = '', updated = false;

/*
Changelog:
1.0.0 - Initial Script Release
*/

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

function cabf_conquestmistfilter() {
    
    try {
        var _defenderHealth = 0, _actions = parseInt(/\d+/.exec($('#app_body div:contains("ACTIONS LEFT:"):last').text()), 10);
        // Saved filter settings
        var _storedClass = item.get('cabfPageConquestBattleClass', 'All');
        var _storedStatus = item.get('cabfPageConquestBattleStatus', 'All');
        var _storedPoints = item.get('cabfPageConquestBattlePoints', 'All');
        
        $('#your_guild_member_list_1 > div').each(function(_i, _e) {
            var _text = $(_e).text().trim(), _health, _maxHealth, _fullhealth;
            
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
			
        console.log('test1 _i='+_i);
            if (_fullhealth) {
                $(_e, 'div > div').append('<span class="GuildNumG">' + (_i + 1) + '<span>');
            } else {
                $(_e, 'div > div').append('<span class="GuildNumR">' + (_i + 1) + '<span>');
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

function cabf_conquestearthfilter() {
    
    try {
        
        //var     _tower = parseInt(/\d+/.exec($('div[class="tower_tab"][style*="display:block"]').attr("id")), 10);
		var _towers = { 1:"Attack Tower",2:"Defense Tower",3:"Damage Tower",4:"Health Tower"};
		var     _tower = 1;
		if ($("#cabfHealthActionEarth").length>0) {
			$("#cabfHealthActionEarth").show();
		} else {
			$('#hinvite_help').after('<div id="cabfHealthActionEarth"><div>Attack Tower</div><div id="cabfEarthFiltered1">Filtered: 0</div><div id="cabfEarthAction1">Health/Action: 0</div><div><br></div><div>Defense Tower</div><div id="cabfEarthFiltered2">Filtered: 0</div><div id="cabfEarthAction2">Health/Action: 0</div><div><br></div><div>Damage Tower</div><div id="cabfEarthFiltered3">Filtered: 0</div><div id="cabfEarthAction3">Health/Action: 0</div><div><br></div><div>Health Tower</div><div id="cabfEarthFiltered4">Filtered: 0</div><div id="cabfEarthAction4">Health/Action: 0</div></div>');
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
                $('#tower_'+_x+' > div > div').each(function(_i, _e) {
                    var _text = $(_e).text().trim(), _health, _maxHealth, _fullhealth;
                    
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
                    if (_fullhealth) {
                        $(_e, 'div > div').append('<span class="GuildNumG">' + (_i + 1) + '<span>');
                    } else {
                        $(_e, 'div > div').append('<span class="GuildNumR">' + (_i + 1) + '<span>');
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
			$('#hinvite_help').after('<div id="cabfConquestEarthFilterContainer"><div id="cabfConquestEarthFilter" class="ui-state-default"></div></div>');
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
    $('#guild_battle_banner_section').css('height', 190).find('div:contains("VICTOR")').next().next().css('marginTop', 10).end();
    $('#guild_battle_banner_section > div:eq(2)').css('marginTop', 0);
    $('div:contains("The Battle Between"):last').parent().css('marginTop', 20);
    $('input[src*="collect_reward_button2.jpg"]').parents('div:eq(2)').css('marginTop', 0);
    
    // add current tokens to result
    var _tokens = $('div.result div:contains("-1 Battle Tokens"):last');
    _tokens.text(_tokens.text() + ' (' + $('#guild_token_current_value').text() + ' left)');
    
    // reduce gate size and add number
    if ($('#your_new_guild_member_list:contains("No Soldiers Posted In This Position!"), #enemy_new_guild_member_list:contains("No Soldiers Posted In This Position!")').length === 0) {
        var _guildnum = 1;      
        $('#enemy_new_guild_member_list > div > div, #your_new_guild_member_list > div > div').each(function(_i, _e) {
            var _text = $(_e).text().trim(), _FullHealth = true;
            if (_text && $(_e).text().trim().length > 0) {
				var _test = /(\d+)\/(\d+)/g.exec(_text);
        console.log('test3 _guildnum='+_guildnum);
				if (_test)
				{
					_FullHealth = (_test.length === 3 && _test[1] === _test[2]) ? true : false;
					if (_FullHealth)
						$(_e).append('<span class="GuildNumG">' + (_guildnum) + '<span>');
					else
						$(_e).append('<span class="GuildNumR">' + (_guildnum) + '<span>');	
				} else {
					$(_e).append('<span class="GuildNum">' + (_guildnum) + '<span>');
				}					
				_guildnum += 1;			
            } else {
                $(_e).remove();
            }
			_text = '';
			_test = [];
        });
    }
    
    // Saved filter settings
    var _storedClass = item.get('cabfPageGuildBattleClass', 'All');
    var _storedActivity = item.get('cabfPageGuildBattleActivity', 'All');
    var _storedStatus = item.get('cabfPageGuildBattleStatus', 'All');
    var _storedPoints = item.get('cabfPageGuildBattlePoints', 'All');
    
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
        var _gateNum = $('#enemy_guild_battle_section_battle_list, #your_guild_battle_section_battle_list').attr('class').match(/\d/)[0];
        var _gate = $('#enemy_new_guild_tab_' + _gateNum + ' > div, #your_new_guild_tab_' + _gateNum + ' > div');
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
    $('#enemy_guild_battle_section_battle_list, #your_guild_battle_section_battle_list').prepend('<div id="cabf_menu" style="padding: 0 0 10px 0;" >');
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
    $('#guild_battle_banner_section').css('height', 190).find('div:contains("VICTOR")').next().next().css('marginTop', 10).end();
    $('#guild_battle_banner_section > div:eq(2)').css('marginTop', 0);
    $('div:contains("The Battle Between"):last').parent().css('marginTop', 20);
    $('input[src*="collect_reward_button2.jpg"]').parents('div:eq(2)').css('marginTop', 0);
    
    // add current tokens to result
    var _tokens = $('div.result div:contains("-1 Battle Tokens"):last');
    _tokens.text(_tokens.text() + ' (' + $('#guild_token_current_value').text() + ' left)');
    
    // reduce gate size and add number
    var _guildnum = 1;
    $('#enemy_guild_member_list > div > div, #your_guild_member_list > div > div').each(function(_i, _e) {
		var _text = $(_e).text().trim(), _FullHealth = true;
		if (_text && $(_e).text().trim().length > 0) {
			var _test = /(\d+)\/(\d+)/g.exec(_text);
        console.log('test4 _guildnum='+_guildnum);
			if (_test)
			{
				_FullHealth = (_test.length === 3 && _test[1] === _test[2]) ? true : false;
				if (_FullHealth)
					$(_e).append('<span class="GuildNumG">' + (_guildnum) + '<span>');
				else
					$(_e).append('<span class="GuildNumR">' + (_guildnum) + '<span>');	
			} else {
				$(_e).append('<span class="GuildNum">' + (_guildnum) + '<span>');
			}					
			_guildnum += 1;			
		} else {
			$(_e).remove();
		}
		_text = '';
		_test = [];
    });
    
    // Saved filter settings
    var _storedClass = item.get('cabfPageFestGuildBattleClass', 'All');
    var _storedActivity = item.get('cabfPageFestGuildBattleActivity', 'All');
    var _storedStatus = item.get('cabfPageFestGuildBattleStatus', 'All');
    var _storedPoints = item.get('cabfPageFestGuildBattlePoints', 'All');
    
    // gate filter
    function filterGate() {
        var _count = 0;
        
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
        var _gateNum = $('#enemy_guild_battle_section_battle_list, #your_guild_battle_section_battle_list').attr('class').match(/\d/)[0];
        var _gate = $('#enemy_arena_tab_' + _gateNum + ' > div, #your_arena_tab_' + _gateNum + ' > div');
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
    // Class filter
    $('body > ul.ui-selectmenu-menu').remove();
    $('#guild_battle_health').append($('<button>Clear filters</button>').button().css({
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
    $('#guild_battle_health').append('<span class="cabfGateFilterTitle ui-state-default"> Class </span><select id="cabfGateClassFilter" class="cabfgatefiltertitle">');
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
    $('#guild_battle_health').append('<span class="cabfGateFilterTitle ui-state-default"> Activity </span><select id="cabfGateActivityFilter" class="cabfgatefiltertitle">');
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
    $('#guild_battle_health').append('<span class="cabfGateFilterTitle ui-state-default"> Status </span><select id="cabfGateStatusFilter" class="cabfgatefiltertitle">');
    _sel = $('#cabfGateStatusFilter');
    $.each(filterStatus, function(_i, _e) {
        _sel.append('<option value="' + _e + '" ' + (_storedStatus == _i ? 'selected = "selected"' : '') + ' >' + _i + '</option>');
    });
    _sel.change(function() {
        _storedStatus = $(this).find("option:selected").text();
        item.set('cabfPageFestGuildBattleStatus', _storedStatus);
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
    $('#guild_battle_health').append('<span class="cabfGateFilterTitle ui-state-default"> Points </span><select id="cabfGatePointsFilter" class="cabfgatefiltertitle">');
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

function cabf_filters() {
    
	cabf_connect();
    console.log("cabf_filters");
	    
	$("#cabfHealthActionEarth").hide();
	$("#cabfConquestEarthFilterContainer").hide();
    /* Guild battle */
    if ($('#enemy_guild_tab').length > 0 || $('#your_guild_tab').length > 0) {
        console.log('Guild battle');
        cabf_guildbattlefilter();
    } else     
    /* Festival battle */
    if ($('#enemy_team_tab').length > 0 || $('#your_team_tab').length > 0) {
        console.log('Festival battle');
        cabf_festivalbattlefilter();
    } else    
    /* Earth land conquest battle */
    if ($('#tower_1,#tower_2,#tower_3,#tower_4').length > 0) {
        console.log('Earth land conquest battle');
        cabf_conquestearthfilter();
    } else    
    /* Mist land conquest battle */
    if ($('#your_guild_member_list_1').length > 0) {
        console.log('Mist land conquest battle');
        cabf_conquestmistfilter();
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
        addCss ( "#cabfHealthActionEarth {	position: fixed;	background: #000;	padding: 5px;	color: #fff;	margin-top: 0px; width: 200px;	text-align: center;	opacity: 0.75; top: 58; left: 0;}");
        addCss ( "#cabfConquestEarthFilterContainer {	width: 740px;	position: fixed;	top: 0px;	margin-bottom: 0px;	height: 57px; z-index: 99;}");
        addCss ( "#cabfConquestEarthFilter {	height: 30px;	border-bottom-left-radius: 8px;	border-bottom-right-radius: 8px;	box-shadow: 0 5px 5px #000;	padding: 0 11px 0 4px;	position: fixed;	width: 450px;	margin-left: 0px;	opacity: 0.75;}");
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
        addCss ( '.GuildNum {	color:white;position:relative;top:-100px;left:15px;text-shadow: 0 0 1px black, 0 0 4px black;font-weight: bold;}');   
        addCss ( '.GuildNumG{	color:green;position:relative;top:-100px;left:15px;text-shadow: 0 0 1px black, 0 0 4px black;font-weight: bold;}');   
        addCss ( '.GuildNumR{	color:red;position:relative;top:-100px;left:15px;text-shadow: 0 0 1px black, 0 0 4px black;font-weight: bold;}');   
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
