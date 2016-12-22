// ==UserScript==
// @name         Steamworks Item Management Utility
// @namespace    http://http://steamcommunity.com/
// @version      0.1
// @description  Add/Remove Items from a user.
// @author       Joshua Ashton
// @match        http://steamcommunity.com/*/inventory*
// @grant         GM_xmlhttpRequest
// ==/UserScript==

// Edit me to fit your needs
var config =
{
    validAppids: [123456],
    publisherKey: "YOUR_ASSET_OR_PUBLISHER_KEY_GOES_HERE",
    steamAPIKey: "YOUR_PUBLIC_STEAM_API_KEY_GOES_HERE"
};
////////////////////////////////

simuData = {
    accessedById: false,
    customURL: "",
    steamID64: "",
    currentAppId: 0,
    cachedItemDefs: {},
};

AddItem = function(appid, id, quantity, steamid)
{
    var addItemURL = "http://api.steampowered.com/IInventoryService/AddItem/v0001?key=" + config.publisherKey + "&appid=" + appid + "&steamid=" + steamid + "&notify=1&itemdefid[0]=" + id;
    console.log(addItemURL);
    GM_xmlhttpRequest({
        method: "POST",
        url: addItemURL,
        onload: function(response) {
        }
    });
};

AddItemModal = function()
{
    var Modal = ShowDialog("Add Item to Player...", '<div class="group_invite_throbber"><img src="http://community.edgecast.steamstatic.com/public/images/login/throbber.gif"></div>');

    var list = $J('<div/>', {'class': 'newmodal_content_innerbg'} );
    var itemList = $J('<div/>', {'class': 'group_list_results'}); list.append(itemList);

    for (var i = 0; i < simuData.cachedItemDefs[simuData.currentAppId].length; i++)
    {
        var ourItem = $J('<div/>', {'class': 'group_list_option', 'itemid': "" + simuData.cachedItemDefs[simuData.currentAppId][i].itemdefid }); itemList.append(ourItem);
        ourItem.click(function() {
            AddItem(simuData.currentAppId, $J(this).attr('itemid'), 1, simuData.steamID64);
            Modal.Dismiss();
        });

        var itemImageHolder = $J('<div/>', {'class': 'playerAvatar offline'}); ourItem.append(itemImageHolder);
        var itemImage = $J('<img/>', {'src': simuData.cachedItemDefs[simuData.currentAppId][i].icon_url}); itemImageHolder.append(itemImage);

        var itemName = $J('<div/>', {'class': 'group_list_groupname'}); itemName.html(simuData.cachedItemDefs[simuData.currentAppId][i].name); ourItem.append(itemName);
    }

    Modal.GetContent().find( '.newmodal_content').html('');
    Modal.GetContent().find( '.newmodal_content').append( list );
};

function InitSIMU()
{
    simuData.accessedById = (window.location.pathname.substring(1, 3)  == "id");
    simuData.currentAppId = parseInt(window.location.hash.substring(1));
    if (simuData.accessedById)
    {
        simuData.customURL = window.location.pathname.substring(4, window.location.pathname.substring(4).indexOf("/") + 4);
        var vanityResolveURL = "http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=" + config.steamAPIKey + "&format=json&vanityurl=" + simuData.customURL;

        GM_xmlhttpRequest({
            method: "GET",
            url: vanityResolveURL,
            onload: function(response) {
                var jsoned = JSON.parse(response.responseText);
                simuData.steamID64 = jsoned.response.steamid;
            }
        });
    }

    for (var i = 0; i < config.validAppids.length; i++)
    {
        var itemDefURL = "http://api.steampowered.com/IInventoryService/GetItemDefs/v0001?key=" + config.publisherKey + "&modifiedsince=&itemdefids=&workshopids=&format=json&appid=" + config.validAppids[i];
        GM_xmlhttpRequest({
            method: "GET",
            url: itemDefURL,
            onload: function(response) {
                var jsoned = JSON.parse(response.responseText);
                jsoned = JSON.parse(jsoned.response.itemdef_json);
                simuData.cachedItemDefs[jsoned[0].appid] = jsoned;
            }
        });
    }

    var AddItemsButton = $J('<a/>', {'class': 'btn_darkblue_white_innerfade btn_medium new_trade_offer_btn', 'href': 'javascript:AddItemModal()'});
    AddItemsButton.html('<span>Add Items</span>');
    $J(".inventory_rightnav").prepend(AddItemsButton);
}

InitSIMU();