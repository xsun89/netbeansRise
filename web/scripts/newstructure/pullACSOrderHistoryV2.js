/**
 * Created by sun38 on 7/29/2014.
 */
function pullACSOrderHistory(txtJSON_ID) {
    try {
        //dy 2013.10.21: only run the webservices call if enable
        //if eSiriusWebSerivceEnable is false, exit (return) the function
        //if (!customutils.eSiriusWebSerivceEnable) return;
        var txtJSON;
        var eSiriusJSONEntity = null;

        var protocolEntity;

        wom.log("JSON string to retrieve from eSirius Log ID: " + txtJSON_ID);

        if (txtJSON_ID != null) {
            //Check the input parameter for a valid ID record identifier. PullAnimalCareServicesOrderHistory
            //may return a JSON string so that the webservice call can be displayed in the debug console
            //window. - FH - Dec 11, 2013
            if (txtJSON_ID.substring(0, 2) == "ID") {
                // Xin changed to use _A-eSirius Animal Transactions Pull Log
                eSiriusJSONEntity = getResultSet("_A-eSirius Animal Transactions Pull Log").query("ID='" + txtJSON_ID + "'").elements().item(1);
                txtJSON = eSiriusJSONEntity.getQualifiedAttribute("customAttributes.JSONString");
            }
            else {
                wom.log("Parameter received a JSON string instead of an ID value.");
                return;
            }
        }

        wom.log("JSON from eSirius: " + txtJSON);
        if (txtJSON == null || txtJSON.length == 0) {
            return;
        }

        // What happens if txtJSON is not a valid string. Does eval throw an error?
        // - FH - 20130524
        var objJSON = eval("(" + txtJSON + ")");

        wom.log("JSON properly evaluated");
        wom.log("Number of rows from eSiruis[" + objJSON.Rows.length + "]");
        if (objJSON.Rows.length == 1 && objJSON.Rows[0].prot_no == "") {
            wom.log("No Protocols to process.");
        }
        var actType;
        var actTypeSet = getElements("ActivityTypeForID", "ID", "_Protocol_Pull Data from ACS");
        if (actTypeSet.count() != 1) {
            throw(new Error(-1, "Found " + actTypeSet.count() + "  '_Protocol_Pull Data from ACS' activities defined on _Protocol"));
        } else {
            actType = actTypeSet(1);
        }
        //var sch = wom.getContext("_ScriptingContextHelper");
        var sch = ShadowSCH.getSCH();
        var user = Person.getCurrentUser();
        //var user = ApplicationEntity.getResultSet("Person").query("ID='SysAdmin'").elements().item(1);
        if (user == null) {
            wom.log("CustomUtils.pullAnimalCareServicesOrderHistory() user is null");
            throw new Error(-1, "CustomUtils.pullAnimalCareServicesOrderHistory() user is null");
        }

        var sessionContext = wom.getSessionContext();
        wom.log("current sessionContext is " + sessionContext);
        var replaceable = true;
        var proSpecInfoMap = {};
        var key;
        var protKey;
        var protMap = {};
        for (i = 0; i < objJSON.Rows.length; i++) {
            if (objJSON.Rows[i].prot_no == null || objJSON.Rows[i].prot_no == "") {
                wom.log("ACS warning: prot_no[" + objJSON.Rows[i].prot_no + "] sp_id[" + objJSON.Rows[i].sp_id + "] num[" + objJSON.Rows[i].num + "] are not correct, skip this protocol");
                continue;
            }
            key = objJSON.Rows[i].prot_no + "_" + objJSON.Rows[i].sp_id;
            if ((typeof (proSpecInfoMap[key]) == 'undefined') || (proSpecInfoMap[key] == null)) {
                proSpecInfoMap[key] = 0;
            }
            proSpecInfoMap[key] = Number(proSpecInfoMap[key]) + 1;
            protKey = objJSON.Rows[i].prot_no;
            if ((typeof (protMap[protKey]) == 'undefined') || (protMap[protKey] == null)) {
                protMap[protKey] = [];
            }
            var jsonString = JSON.stringify(objJSON.Rows[i], null, null);
            protMap[protKey].push(jsonString);

        }
        sessionContext.putContextObject("ProtocolSpecCountMap", proSpecInfoMap, replaceable);
        for (var protMapKey in protMap)
        {
            var protNo = protMapKey;
            if (protNo == null || protNo == "") {
                wom.log("ACS warning: prot_no[" + protNo + "] are not correct, skip this protocol");
                continue;
            }
            var protocolEntitySet = getResultSet("_Protocol").query("ID='" + protNo + "'");

            if (protocolEntitySet == null || protocolEntitySet.elements().count() == 0) {
                wom.log("Protocol[" + protNo + "] not found");
                throw(new Error(-1, "protocolEntity is null, please contact Site Manager for this issue"));
            }

            wom.log("Found ProtocolSet[" + protocolEntitySet.elements().count() + "]");
            protocolEntity = protocolEntitySet.elements().item(1);
            sessionContext.putContextObject("currentJsonObj", protMap[protNo], replaceable);
            sessionContext.putContextObject("eSiriusJSON", eSiriusJSONEntity, replaceable);
            var act = protocolEntity.logActivity(sch, actType, user);
            wom.log("++++++++++++++++++++++++++++++++++++++++++++Finished processing order prot_no[" + protNo + "]");
        }
        //put the result in the eSirius web service log
        eSiriusJSONEntity.setQualifiedAttribute("customAttributes.ImportResult", true);
        return;
    }
    catch (e) {

        var currentDate = new Date();
        var To = "fred.helm@ubc.ca; david.yeung@ubc.ca";
        //var Cc = "david.yeung@ors.ubc.ca";
        var Cc = "";
        var From = "david.yeung@ors.ubc.ca";
        var Subject = "eSirius data pull for" + currentDate;
        var HTMLBody = "Automatic generated email to transfer data from eSirius to RISe. Problem with Batch Id: " + txtJSON_ID + "\n" + e.description;
        var objMail = CustomUtils.sendEmailCDO(To, Cc, null, From, Subject, HTMLBody, null, null);

        objMail.Send();
        objMail = null;

        wom.log("EXCEPTION CustomUtils.pullAnimalCareServicesOrderHistory: " + e.description);
        throw(e);
    }
}