function pullACSOrderHistory(txtJSON_ID)
{
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

        //txtJSON = '{"Rows":[{"prot_no":"A14-0062","sp_id":"ID00000005","d_trans":"07/10/2014","num":"-3","type":"","comments":""},{"prot_no":"A14-0062","sp_id":"ID00000005","d_trans":"07/10/2014","num":"-2","type":"","comments":""},{"prot_no":"A14-0062","sp_id":"ID00000001","d_trans":"07/10/2014","num":"-2","type":"","comments":""}, {"prot_no":"A14-0062","sp_id":"ID00000001","d_trans":"07/10/2014","num":"-7","type":"","comments":""}]}';
        //txtJSON = '{"Rows":[{"prot_no":"A14-0062","sp_id":"ID00000005","d_trans":"07/01/2014","num":"-20","type":"","comments":""}]}';
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

        for (i=0 ; i < objJSON.Rows.length ; i++)
        {
            key = objJSON.Rows[i].prot_no + "_" + objJSON.Rows[i].sp_id;
            if (typeof(proSpecInfoMap[key]) == 'undefined' || proSpecInfoMap[key] == null)
            {
                proSpecInfoMap[key] = 0;
                wom.log("xsun " + proSpecInfoMap[key]);
            }
            proSpecInfoMap[key] = Number(proSpecInfoMap[key]) + 1;
        }
        sessionContext.putContextObject("ProtocolSpecCountMap", proSpecInfoMap, replaceable);
        for (var i = 0; i < objJSON.Rows.length; i++) {
            key = objJSON.Rows[i].prot_no + "_" + objJSON.Rows[i].sp_id;
            wom.log("prot_no[" + objJSON.Rows[i].prot_no + "] sp_id[" + objJSON.Rows[i].sp_id + "] num[" + objJSON.Rows[i].num + "]");
            wom.log("xsun send count=" + Number(proSpecInfoMap[key]));
            var protocolEntitySet = getResultSet("_Protocol").query("ID='" + objJSON.Rows[i].prot_no + "'");

            if (protocolEntitySet == null || protocolEntitySet.elements().count() == 0) {
                wom.log("Protocol[" + objJSON.Rows[i].prot_no + "] not found");
                throw(new Error(-1, "protocolEntity is null, please contact Site Manager for this issue"));
            }

            wom.log("Found ProtocolSet[" + protocolEntitySet.elements().count() + "]");
            protocolEntity = protocolEntitySet.elements().item(1);
            var jsonString = JSON.stringify(objJSON.Rows[i], null, null);
            sessionContext.putContextObject("currentJsonObj", jsonString, replaceable);
            sessionContext.putContextObject("eSiriusJSON", eSiriusJSONEntity, replaceable);
            var jsonObj = JSON.parse(jsonString, null);
            var act = protocolEntity.logActivity(sch, actType, user);
            wom.log("++++++++++++++++++++++++++++++++++++++++++++Finished processing order prot_no[" + jsonObj.prot_no + "] sp_id[" + jsonObj.sp_id + "]");
        }
        //put the result in the eSirius web service log
        //eSiriusJSONEntity.setQualifiedAttribute("customAttributes.ImportResult", true);
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

function pullAnimalCareServicesOrderHistory(txtJSON_ID)
{
    try {
        //dy 2013.10.21: only run the webservices call if enable
        //if eSiriusWebSerivceEnable is false, exit (return) the function
        if (!customutils.eSiriusWebSerivceEnable) return;

        var strReturn = "";

        var objJSON = null;
        var eSiriusJSONEntity = null;

        var protocolEntity;
        var AAU_AllSpeciesEntitySet;
        var AAUID;

        var NumberOfAnimalsUsed = 0;
        var NumberOfAnimalsUsedPerCalendarYear = 0;
        var AnimalsUsed = 0;
        var AnimalsUsedOverage = 0;
        var AnimalsUsedUnderage = 0;
        var Comments = null;

        var strNewStringDate;
        var dtApprovedDate;
        var dtDateCreated;

        var AAUHEntitySet;
        var AAUHEntity;

        var months = new Array("January","February","March","April","May","June","July","August","September","October","November","December");


        wom.log("JSON string to retrieve from eSirius Log ID: " + txtJSON_ID);

        if (txtJSON_ID != null)
        {
            //Check the input parameter for a valid ID record identifier. PullAnimalCareServicesOrderHistory
            //may return a JSON string so that the webservice call can be displayed in the debug console
            //window. - FH - Dec 11, 2013
            if (txtJSON_ID.substring(0,2) == "ID") {
                eSiriusJSONEntity = getResultSet("_A-eSirius Web Service Pull Log").query("ID='"+txtJSON_ID+"'").elements().item(1);
                txtJSON = eSiriusJSONEntity.getQualifiedAttribute("customAttributes.JSONString");
            }
            else {
                strReturn = "Parameter received a JSON string instead of an ID value.";
                return strReturn;
            }
        }

        wom.log("JSON from eSirius: " + txtJSON);

        if ( txtJSON == null || txtJSON.length == 0 ) {
            strReturn = "No JSON to process";
            return strReturn;
        }

        // What happens if txtJSON is not a valid string. Does eval throw an error?
        // - FH - 20130524
        objJSON = eval("(" + txtJSON + ")");

        wom.log("JSON properly evaluated");

        wom.log("Number of rows from eSiruis["+ objJSON.Rows.length + "]");
        if (objJSON.Rows.length == 1 && objJSON.Rows[0].prot_no == "") {
            wom.log("No Protocols to process.");
        }
        else {
            for (var i = 0; i < objJSON.Rows.length; i++) {

                wom.log("prot_no["+objJSON.Rows[i].prot_no+"] sp_id["+objJSON.Rows[i].sp_id+"] d_effect["+objJSON.Rows[i].d_effect+"] num["+objJSON.Rows[i].num+"]");
                protocolEntitySet = getResultSet("_Protocol").query("ID='"+objJSON.Rows[i].prot_no+"'");

                if (protocolEntitySet == null || protocolEntitySet.elements().count() == 0) {
                    wom.log("Protocol["+objJSON.Rows[i].prot_no+"] not found");
                    throw(new Error(-1, "protocolEntity is null, please contact Site Manager for this issue"));
                }

                wom.log("Found ProtocolSet["+protocolEntitySet.elements().count()+"]");
                protocolEntity = protocolEntitySet.elements().item(1);

                AnimalsUsed = Number(objJSON.Rows[i].num);
                if (isNaN(AnimalsUsed)) {
                    throw(new Error(-1, "AnimalsUsed in JSON is not a number, please contact Site Manager for this issue"));
                }
                //Negative numbers coming from eSirius means that is the number of animals ordered
                //therefore they become used in RISe
                AnimalsUsed = AnimalsUsed * -1;

                var dtApprovedDate = null;
                var dtAnimalReceivedDate = null;
                var strNewStringDate = "";

                if (objJSON.Rows[i].d_trans.length >= 10) {

                    strNewStringDate = objJSON.Rows[i].d_trans.substr(0,10).split('/');
                    dtApprovedDate = new Date();

                    //wom.log("dateparts strNewStringDate0["+strNewStringDate[0]+"] 1["+strNewStringDate[1]+"] 2["+strNewStringDate[2]+"]");

                    dtApprovedDate.setFullYear(strNewStringDate[2]);
                    dtApprovedDate.setMonth(Number(strNewStringDate[0])-1);
                    dtApprovedDate.setDate(strNewStringDate[1]);
                    dtApprovedDate.setHours(0);
                    dtApprovedDate.setMinutes(0);
                    dtApprovedDate.setSeconds(0);
                    dtApprovedDate.setMilliseconds(0);

                    wom.log("raw date: [" + objJSON.Rows[i].d_trans + "] dtApprovedDate: [" + dtApprovedDate + "]");
                }
                else {
                    throw(new Error(-1, "Transaction Date is not formatted properly in JSON, please contact Site Manager for this issue"));
                }

                dtDateCreated = new Date(eSiriusJSONEntity.getQualifiedAttribute("dateCreated"));

                Comments = "eSirius data pull from: " + months[dtDateCreated.getMonth()] + " " + dtDateCreated.getDate() + ", " + dtDateCreated.getFullYear();

                AAUEntitySet = protocolEntity.getQualifiedAttribute("customAttributes._attribute263").query("customAttributes._attribute4.ID='"+objJSON.Rows[i].sp_id+"'").sort("ID",105,1);

                wom.log("Protocol["+ protocolEntity.ID +"] i["+ i +"] Count of Species["+ AAUEntitySet.elements().count() + "] sp_id["+ objJSON.Rows[i].sp_id +"] sp_nm[" + objJSON.Rows[i].sp_nm + "] qty_recvd[" + objJSON.Rows[i].num + "] dtApprovedDate["+dtApprovedDate+"]");
                //			AAUEntitySet = getResultSet("_Approved Animals Used").query("ID='"+AAUID+"'");

                //Only expecting 1 record returned per species
                if ( AAUEntitySet.elements().count() == 0 ) {
                    wom.log("AAU Not Exists");
                    throw(new Error(-1, "Approved Animals Used record does not exist for species ID " + objJSON.Rows[i].sp_id + " in protocol " + protocolEntity.ID + ", please contact Site Manager for this issue"));
                }
                else {

                    if (AAUEntitySet.elements().count() == 0) {
                        //No AAU Records Found
                        wom.log("No AAU Records");
                    }
                    else if (AAUEntitySet.elements().count() == 1) {
                        //Single AAU Record Found
                        wom.log("Single AAU Record");
                    }
                    else {
                        //Multiple AAU Records Found
                        wom.log("Multiple AAU Records");
                    }

                    for (var j = 1; j <= AAUEntitySet.elements().count(); j++) {

                        AAUEntity = AAUEntitySet.elements().item(j);

                        if (AAUEntity == null) {
                            strReturn = "AAUEntity is null - " + AIEntity.getEntityTypeName();
                            throw(new Error(-1, "Approved Animals Used record does not exist for "+ AIEntity.getEntityTypeName() +" protocol " + protocolEntity.ID + ", please contact Site Manager for this issue"));
                        }

                        wom.log("AAU.ID[" +AAUEntity.ID+ "] Species["+ AAUEntity.getQualifiedAttribute("customAttributes._attribute4.ID") +"] Strain["+ AAUEntity.getQualifiedAttribute("customAttributes.RequestedAnimals.customAttributes._attribute8") +"] Number of Animals Approved["+AAUEntity.getQualifiedAttribute("customAttributes._attribute1")+"]");

                        //Check to see if we already downloaded this record
                        AAUHEntitySet = AAUEntity.getQualifiedAttribute("customAttributes._attribute8");
                        if (AAUHEntitySet != null) {
                            AAUHEntitySet = AAUHEntitySet.query("customAttributes._attribute0="+ objJSON.Rows[i].d_trans + "");
                            if (AAUHEntitySet.elements().count() > 0) {
                                strReturn = "Already downloaded this record";
                                wom.log(strReturn);
                                throw(new Error(-1, strReturn));
                            }
                        }

                        //We have not downloaded this record therefore create an Animal Used History record
                        //and increase the animals used totals
                        if (AnimalsUsed != 0 || objJSON.Rows[i].num == "0") {
                            ApprovedAnimals = Number(AAUEntity.getQualifiedAttribute("customAttributes._attribute1"));

                            NumberOfAnimalsUsed = Number(AAUEntity.getQualifiedAttribute("customAttributes._attribute2"));
                            if (isNaN(NumberOfAnimalsUsed)) {
                                NumberOfAnimalsUsed = 0;
                            }

                            NumberOfAnimalsUsedPerCalendarYear = Number(AAUEntity.getQualifiedAttribute("customAttributes._attribute3"));
                            if (isNaN(NumberOfAnimalsUsedPerCalendarYear)) {
                                NumberOfAnimalsUsedPerCalendarYear = 0;
                            }

                            //Test to see if the current order will push us over the approved number for this
                            //species approved animals used record. If an overage will exist carry over the overage
                            //to another approved animals used record for the same species. - FH - 20140212
                            if (AnimalsUsed >= 0) {
                                // Need to debit the protocol species
                                if (NumberOfAnimalsUsed + AnimalsUsed > ApprovedAnimals ) {
                                    // Only a partial amount will be applied otherwise we would go over.
                                    // There exists an overage
                                    AnimalsUsedOverage = (NumberOfAnimalsUsed + AnimalsUsed) - ApprovedAnimals;
                                    AnimalsUsed = AnimalsUsed - AnimalsUsedOverage;
                                }
                                else {
                                    // The full amount will be applied to this species record
                                    // No overage will exist
                                    AnimalsUsedOverage = 0;
                                }
                            } else if (AnimalsUsed < 0) {
                                // Need to credit the protocol species
                                if (NumberOfAnimalsUsed + AnimalsUsed < 0) {
                                    // Only a partial amount will be applied otherwise we would go over.
                                    // There exists an overage
                                    AnimalsUsedUnderage = (NumberOfAnimalsUsed + AnimalsUsed);
                                    AnimalsUsed = (AnimalsUsed - AnimalsUsedUnderage);
                                }
                                else {
                                    // The full credit amount will be applied to this species record
                                    // No underage will exist
                                    AnimalsUsedUnderage = 0;
                                }
                            }
                            else {
                                //This scenario will not exist
                            }

                            wom.log("ApprovedAnimals["+ApprovedAnimals+"] NumberOfAnimalsUsed["+NumberOfAnimalsUsed+"] AnimalsUsed["+AnimalsUsed+"] AnimalsUsedOverage["+AnimalsUsedOverage+"]");
                            wom.log("Writing values to database");
                            AAUEntity.setQualifiedAttribute("customAttributes._attribute2", NumberOfAnimalsUsed + AnimalsUsed );
                            AAUEntity.setQualifiedAttribute("customAttributes._attribute3", NumberOfAnimalsUsedPerCalendarYear + AnimalsUsed );

                            //Only insert a record when there is enough room to accommodate the order (AnimalsUsed>0 Overage==0)
                            // or the order exceeds the available room and overage will be transferred to next animals used species record (AnimalsUsed>0 Overage>0)
                            // or the order netted out to 0 (for example, eSirius could have debitted the protocol 10 and transferred 10 animals to
                            // another protocol in the same day) (AnimalsUsed==0 Overage==0)
                            //The only scenario that we should not record is when the animalUsed record is full (AnimalsUsed==Approved)
                            // and the entire order needs to be placed in another approved animals used record for the same
                            // species. (AnimalsUsed == 0 Overage > 0) - FH - 20140212
                            if ( AnimalsUsed != 0 || AnimalsUsedOverage == 0) {
                                AAUHEntity = wom.createEntity("_A- Approved Animals Used History");
                                AAUHEntity.setQualifiedAttribute("dateCreated", new Date() );
                                AAUHEntity.setQualifiedAttribute("customAttributes._attribute0", dtApprovedDate);
                                AAUHEntity.setQualifiedAttribute("customAttributes._attribute1", AnimalsUsed);
                                AAUHEntity.setQualifiedAttribute("customAttributes.Comments", Comments);
                                AAUHEntity.setQualifiedAttribute("customAttributes.eSiriusJSON", eSiriusJSONEntity);

                                AAUEntity.setQualifiedAttribute("customAttributes._attribute8", AAUHEntity, "add");
                                //						AAUEntity.setQualifiedAttribute("customAttributes._attribute8", AAUHEntity, "remove");
                            }

                            //Need to allocate the remaining Animals
                            AnimalsUsed = AnimalsUsedOverage;

                            wom.log("Remaining Animals Used to disperse (normally this value should be 0 but >0 not an error condition):"+AnimalsUsed);
                            if (AnimalsUsed == 0) {
                                //Skip processing any duplicate species record because AnimalsUsed (Ordered animals) is 0
                                //to force premature exit of for loop.
                                j = AAUEntitySet.elements().count() + 1;
                                wom.log("Skipping remaining Approved Animal Used species record for Species ID: " +objJSON.Rows[i].sp_id);
                            }
                        }

                        wom.log("+++++++++++++++++++++Done processing AAU.ID[" +AAUEntity.ID+ "] Species["+ AAUEntity.getQualifiedAttribute("customAttributes._attribute4.customAttributes._attribute1") +"]");

                    }
                    strReturn = "AAU Records";
                }

                //We ran out of apporved animals used records for the species. Raise and error because
                //an order has been place when it should not have been. - FH - 20140212
                if (AnimalsUsedOverage > 0) {
                    // This is an error condition and should never occur.
                    // Check the approved animals between RISe and eSirius.
                    strReturn = "Overage Exists. Too many animals ordered. Verify that the approved animals in RISe match with eSirius for protocol " + protocolEntity.ID;
                    wom.log(strReturn);
                    throw(new Error(-1, strReturn));
                }
                wom.log("++++++++++++++++++++++++++++++++++++++++++++Finished processing order prot_no["+objJSON.Rows[i].prot_no+"] sp_id["+objJSON.Rows[i].sp_id+"]");
            }
        }

        //put the result in the eSirius web service log
        eSiriusJSONEntity.setQualifiedAttribute("customAttributes.ImportResult", true);
        return strReturn;
    }
    catch (e) {

        var currentDate = new Date();
        var To = "fred.helm@ubc.ca; david.yeung@ubc.ca";
        //var Cc = "david.yeung@ors.ubc.ca";
        var Cc = "";
        var From = "david.yeung@ors.ubc.ca";
        var Subject = "eSirius data pull for"+currentDate;
        var HTMLBody = "Automatic generated email to transfer data from eSirius to RISe. Problem with Batch Id: " + txtJSON_ID + "\n" + e.description;
        var objMail = CustomUtils.sendEmailCDO(To, Cc, null, From, Subject, HTMLBody, null, null);

        objMail.Send();
        objMail = null;

        wom.log("EXCEPTION CustomUtils.pullAnimalCareServicesOrderHistory: " + e.description);
        throw(e);
    }
}

function pullAnimalCareServicesOrderHistoryJSON(ProtocolID, fromDate, toDate, bRecordWebServiceCallToLog)
{

    //Variables defined here so they are available in the catch block
    var txtJSONReturnMessage = null;
    var txtJSONDetailReturnMessage = null;

    try {
        //dy 2013.10.21: only run the webservices call if enable
        //if eSiriusWebSerivceEnable is false, exit (return) the function
        if (!customutils.eSiriusWebSerivceEnable) return;

        var strReturn = "Hello World!";
        var txtJSON = '';
        var txtJSONDetail = '';
        var txtJSONLog = '';
        var txtJSONDetailLog = '';
        //var txtUser = 'NTMCS';
        var txtUser = customutils.eSiriusWebServiceLogin;
        //var txtPassword = 'hello';
        var txtPassword = customutils.eSiriusWebServicePassword;
        var strWebService = customutils.eSiriusWebServiceURL.toLowerCase();
        var strWebMethod = "esApiQueryAnimalReceipt.wc?";
        var objJSON = null;
        var sch = wom.getContext("_ScriptingContextHelper"); //Get the ServerVariables


        //Verify fromDate string format is in mm/dd/yyyy
        var datePattern = /[0-1][0-9]\/[0-3][0-9]\/[1-2][0-9][0-9][0-9]/;
        if (!datePattern.test(fromDate)) {
            wom.log("From date [" + fromDate + "] not in format mm/dd/yyyy");
            throw(new Error(-1, "From date [" + fromDate + "] not in format mm/dd/yyyy, please contact Site Manager for this issue"));
        }

        //Verify toDate string format is in mm/dd/yyyy
        if (!datePattern.test(toDate)) {
            wom.log("To date [" + ToDate + "] not in format mm/dd/yyyy");
            throw(new Error(-1, "To date [" + ToDate + "] not in format mm/dd/yyyy, please contact Site Manager for this issue"));
        }

        txtJSON += '{';
        if (ProtocolID != null) {
            txtJSON += '"prot_no":"'+ProtocolID+'"';
            txtJSON += ',';
        }
        txtJSON += '"d_from":"'+fromDate+'"';
        txtJSON += ',';
        txtJSON += '"d_to":"'+toDate+'"';
        txtJSON += ',"rise_userid":"'+txtUser+'"'
        txtJSON += ',"rise_pwd":"'+txtPassword+'"'

        //Copy the summary version of the JSON to call a detailed version
        //The detail version interface was developed after the summary version and too much code would
        //need to be modified and retested. Lynn and Roger are only interested in the daily changes
        //and RISe should only make the daily changes visible. We are storing a detailed version for
        //reconciliation purposes between eSirius and RISe when numbers do not match.  To reconcile a
        //protocol, one will have to mine the eSirius Web Service Pull Log for all dates for the
        //specific protocol. Animals Used resets at the calendar point and protocol annual point will
        //make the task of reconciling challenging. -FH - 20130709
        txtJSONDetail = txtJSON;

        txtJSON += '}';

        txtJSONDetail += ',';
        txtJSONDetail += '"rpt_type":"audit"';
        txtJSONDetail += '}';

        wom.log("JSON to send to webservice: " + txtJSONLog);
        wom.log("JSON (Detail) to send to webservice: " + txtJSONDetailLog);

        //if ( true || sch.serverName()=="rise.ubc.ca" ) {
        if ( (sch.serverName().toLowerCase() == "rise.ubc.ca"      && strWebService == "https://esirius3g.as.it.ubc.ca/esirius3g/"   ) ||
            (sch.serverName().toLowerCase() == "test.rise.ubc.ca" && strWebService == "http://esirius3gtest.as.it.ubc.ca/esirius3g/")
            ) {

            //call the webservice only if this code is running in the production
            //environment. - FH - May 16, 2013

            //strWebService = CustomUtils.eSiriusWebServiceURL;
            //call the webservice
            //To build a JSON string that is compatiable with the C# proxy
            //txtJSON = txtJSON.replace(/[\"]/g, '\\\"');

            //strWebService = strWebService+strWebMethod+txtJSON;
            wom.log("Web Service Call: " + strWebService + strWebMethod + txtJSONLog);
            txtJSONReturnMessage = customUtils.pulleSiriusDataToRISe(strWebService, strWebMethod, txtJSON, CustomUtils.eSiriusWebServiceDebug);

            wom.log("Web Service Call: " + strWebService + strWebMethod + txtJSONDetailLog);
            txtJSONDetailReturnMessage = customUtils.pulleSiriusDataToRISe(strWebService, strWebMethod, txtJSONDetail, CustomUtils.eSiriusWebServiceDebug);

        }
        else {
            wom.log("Web Service Call: Web service not called. Check that web address of RISe is rise.ubc.ca instead of " + sch.serverName() );
            throw(new Error(-1, "Web Service Call: Web service not called. Check that web address of RISe is rise.ubc.ca instead of " + sch.serverName() + ", please contact Site Manager for this issue"));
        }

        //txtJSONReturnMessage = CustomUtils.pullAnimalCareServicesOrderHistoryJSON_Debug('A01-0198');

        //Sample returned JSON
        //txtJSONReturnMessage = '{}'
        //txtJSONReturnMessage = '{"Rows":[{"prot_no":"","sp_id":"","d_effect":"","num":""}]}'
        //txtJSONReturnMessage = '{"rows":[{"prot_no":"00030181","sp_id":"123456890","d_effect":"06/05/2013","num":"-5"},{"prot_no":"00030181","sp_id":"123456890","d_effect":"06/06/2013","num":"-5"},{"prot_no":"A13-0003","sp_id":"15","d_effect":"06/11/2013","num":"-10"},{"prot_no":"A13-0004","sp_id":"20","d_effect":"06/11/2013","num":"-5"},{"prot_no":"A13-0005","sp_id":"3","d_effect":"06/11/2013","num":"-10"}]}';

        //Process the summary web service JSON
        wom.log("Message JSON from eSirius: " + txtJSONReturnMessage);

        if ( txtJSONReturnMessage == null || txtJSONReturnMessage.length == 0 ) {
            txtJSONReturnMessage = '{"success":"false","message":"No JSON to process"}';
            wom.log("No JSON to process from webservice call");
        }
        else if ( txtJSONReturnMessage.substring(0,1) != '{' ) {
            // Not a valid JSON error message. For evaluating a string to JSON need to replace carriage returns and line feeds.
            txtJSONReturnMessage = '{"success":"false","message":"' + txtJSONReturnMessage.replace(/[\n\r]/g,' ') + '"}';
            wom.log("Repackage proxy dll error to be a proper JSON: " + txtJSONReturnMessage);
        }

        //Process the detail web service JSON
        wom.log("Message JSON (Detail) from eSirius: " + txtJSONDetailReturnMessage);

        if ( txtJSONDetailReturnMessage == null || txtJSONDetailReturnMessage.length == 0 ) {
            txtJSONDetailReturnMessage = '{"success":"false","message":"No JSON to process"}';
            wom.log("No JSON (Detail) to process from webservice call");
        }
        else if ( txtJSONReturnMessage.substring(0,1) != '{' ) {
            // Not a valid JSON error message. For evaluating a string to JSON need to replace carriage returns and line feeds.
            txtJSONReturnMessage = '{"success":"false","message":"' + txtJSONReturnMessage.replace(/[\r\n|\n|\r|\t]/gm,' ') + '"}';
            wom.log("Repackage proxy dll error to be a proper JSON: " + txtJSONReturnMessage);
        }
        else {
            txtJSONReturnMessage = txtJSONReturnMessage.replace(/[\r\n|\n|\r|\t]/gm,' ');
            wom.log("Remove proxy dll line feed error to be a proper JSON: " + txtJSONReturnMessage);
        }

        // What happens if txtJSON is not a valid string. Does eval throw an error?
        // - FH - 20130524
        objJSON = eval("(" + txtJSONReturnMessage + ")");
        //Validation code needs to be inserted

        wom.log("JSON string properly evaluated");

        objJSONDetail = eval("(" + txtJSONDetailReturnMessage + ")");

        wom.log("JSON (Detail) string properly evaluated");

        var eSiriusJSONEntity = null;
        var eSiriusFromDate = new Date(fromDate);
        var eSiriusToDate = new Date(toDate);

        if (bRecordWebServiceCallToLog) {
            //Xin 2014.07.09 Changed to _A-eSirius Animal Transactions Pull Log
            eSiriusJSONEntity = wom.createEntity("_A-eSirius Animal Transactions Pull Log");
            eSiriusJSONEntity.setQualifiedAttribute("dateCreated", new Date() );
            eSiriusJSONEntity.setQualifiedAttribute("customAttributes.FromDate", eSiriusFromDate);
            eSiriusJSONEntity.setQualifiedAttribute("customAttributes.ToDate", eSiriusToDate);
            eSiriusJSONEntity.setQualifiedAttribute("customAttributes.JSONString", txtJSONReturnMessage);
            eSiriusJSONEntity.setQualifiedAttribute("customAttributes.JSONDetailString", txtJSONDetailReturnMessage);

            wom.log("Finished recording JSON from eSirius to eSirius Web Service Pull log: " + eSiriusJSONEntity.ID);

            strReturn = eSiriusJSONEntity.ID;
        }
        else {
            strReturn = txtJSONReturnMessage;
        }
        return strReturn;

    }
    catch (e) {
        wom.log("EXCEPTION CustomUtils.pullAnimalCareServicesOrderHistoryJSON: " + e.description);

        var currentDate = new Date();
        var To = "fred.helm@ubc.ca; david.yeung@ubc.ca";
        //var Cc = "david.yeung@ors.ubc.ca";
        var Cc = "";
        var From = "david.yeung@ors.ubc.ca";
        var Subject = "eSirius data pull for "+ currentDate;
        var HTMLBody = "Automatic generated email to transfer data from eSirius to RISe. " + e.description;
        var objMail = CustomUtils.sendEmailCDO(To, Cc, null, From, Subject, HTMLBody, null, null);

        objMail.Send();
        objMail = null;

        var eSiriusJSONEntity = null;
        var eSiriusFromDate = new Date(fromDate);
        var eSiriusToDate = new Date(toDate);

        if (bRecordWebServiceCallToLog) {
            //Xin 2014.07.09 Changed to _A-eSirius Animal Transactions Pull Log
            eSiriusJSONEntity = wom.createEntity("_A-eSirius Animal Transactions Pull Log");
            eSiriusJSONEntity.setQualifiedAttribute("dateCreated", new Date() );
            eSiriusJSONEntity.setQualifiedAttribute("customAttributes.FromDate", eSiriusFromDate);
            eSiriusJSONEntity.setQualifiedAttribute("customAttributes.ToDate", eSiriusToDate);
            eSiriusJSONEntity.setQualifiedAttribute("customAttributes.JSONString", txtJSONReturnMessage);
            eSiriusJSONEntity.setQualifiedAttribute("customAttributes.JSONDetailString", txtJSONDetailReturnMessage);
        }

        throw(e);

    }
}

function pullAnimalCareServicesOrderHistoryJSON_Debug(ProtocolID)
{
    try {

//		var result = "Data Source=localhost; "
//		+"Initial Catalog=FMS_DS; "
//		+"Integrated Security=SSPI; ";
        var result = "dsn=fms_ds;";


        var txtJSON = 'Not initialized';

        //---- CursorTypeEnum Values ----
        var adOpenForwardOnly = 0;
        var adOpenKeyset = 1;
        var adOpenDynamic = 2;
        var adOpenStatic = 3;

        //---- LockTypeEnum Values ----
        var adLockReadOnly = 1
        var adLockPessimistic = 2
        var adLockOptimistic = 3
        var adLockBatchOptimistic = 4

        wom.log("+++++++++++++++++++++++++++++++++++++++++++ Point 1");
        //var ConnStr=CustomUtils.getDBConnStr();
        var ConnStr="dsn=RiseFramework;";

        var oConn = new ActiveXObject("ADODB.Connection");
        oConn.provider= "MSDASQL";

        oConn.Open(ConnStr);
        wom.log("+++++++++++++++++++++++++++++++++++++++++++ Point 2");

        var sql = "";
        /*
         sql += "SELECT [Application Number] ";
         //sql += ",[Approved Animals Used ID] ";
         //sql += ",[Strain ID] ";
         //sql += ",[Strain] ";
         sql += ",[Species ID] ";
         sql += ",[Species Name] ";
         //sql += ",[Approved Animal Used History ID] ";
         sql += ",Convert(varchar(10),getdate(),126) as [Date Approval] ";
         sql += ",Sum([Animals Used]) as [Animals Used] ";
         //sql += ",[Comments] ";
         sql += "FROM [dbo].[AnimalOrderHistory] ";
         sql += "Where 1=1 ";
         if (ProtocolID != null) {
         sql += "and [Application Number]='"+ProtocolID+"' ";
         }
         else {
         sql += "and [Application Number] in ('A11-0017','A11-0338') ";
         }
         sql += "and [Posted] = 0 ";
         sql += "Group By [Application Number]";
         sql += ",[Species ID]";
         sql += ",[Species Name]";
         */

        sql += "SELECT rtrim(e.[prot_no]) as [Application Number]";
        sql += ",s.ID as [Species ID]";
        sql += ",Convert(varchar(10),"
        sql += "Case When e.[prot_no] = 'A13-0022' ";
        sql += "Then Convert(date,'20131122') ";
        sql += "Else getdate() ";
        sql += "End,101) as [Date Approval]";
        sql += ",-1*[Amendment] as [Animals Used] ";
        sql += ",'reset' as [Order Type] ";
        sql += "FROM [dbo].[eSirius_Active_Protocol_Register] e ";
        sql += "Left Outer Join NewExR.[View___A-Species Strain] S on s.[Species Name] = e.[Species Name] ";
        sql += "Where 1=1 ";
        if (ProtocolID != null) {
            sql += "and e.[prot_no] like '"+ProtocolID+"' ";
        }
        sql += "and Amendment <> 0 ";
        sql += "Order By prot_no ";

        wom.log("sql: "+sql);

        var rs = new ActiveXObject("ADODB.Recordset");
        rs.open(sql, oConn, adOpenKeyset, adLockReadOnly);
        wom.log("+++++++++++++++++++++++++++++++++++++++++++ Point 3");
        wom.log("rs.RecordCount: " + rs.RecordCount);

        var AAUEntitySet = null;
        var AAUEntity = null;

        var protocol = '';
        var sp_id = '';
        var dateReceived = '';
        var order_no = '';
        var SpeciesName = '';
        var AnimalsUsed = '';
        var OrderType = '';

        for (var i = 1; i <= rs.RecordCount; i++) {

            if (i==1) {
                txtJSON = '{"Rows":[';
            }

            protocol = rs("Application Number").Value;
            sp_id = rs("Species ID").Value;
            dateReceived = rs("Date Approval").Value;
            order_no = 'From eSirius reset';
            //SpeciesName = rs("Species Name").Value;
            AnimalsUsed = rs("Animals Used").Value;
            OrderType = rs("Order Type").Value;


            //Build JSON Object Response Object
            txtJSON += '{"prot_no":"' + protocol + '"';
            txtJSON += ',"sp_id":"' + sp_id + '"'; // "Approved Animals Used ID"
            txtJSON += ',"d_trans":"' + dateReceived + '"';
            //txtJSON += ',"order_no":"' + order_no + '"'; // "Comments"
            //txtJSON += ',"sp_nm":"' + SpeciesName + '"';
            txtJSON += ',"num":"'+ AnimalsUsed + '"';
            txtJSON += ',"type":"' + OrderType + '"';

            if (i == rs.RecordCount) {
                txtJSON += '}';
            }
            else {
                txtJSON += '},';
            }
            rs.MoveNext;
        }

        if ( txtJSON.length > 0 ) {
            txtJSON += ']}';
        }
        wom.log("+++++++++++++++++++++++++++++++++++++++++++ Point 5");

        // What happens if txtJSON is not a valid string. Does eval throw an error?
        // - FH - 20130524
        objJSON = eval("(" + txtJSON + ")");
        //Validation code needs to be inserted

        wom.log("JSON string properly evaluated");

        var eSiriusJSONEntity = null;
        //var eSiriusFromDate = new Date(dateReceived);
        //var eSiriusToDate = new Date(toDate);

        //if (bRecordWebServiceCallToLog) {
        eSiriusJSONEntity = wom.createEntity("_A-eSirius Web Service Pull Log");
        eSiriusJSONEntity.setQualifiedAttribute("dateCreated", new Date() );
        eSiriusJSONEntity.setQualifiedAttribute("customAttributes.FromDate", dateReceived);
        eSiriusJSONEntity.setQualifiedAttribute("customAttributes.ToDate", dateReceived);
        eSiriusJSONEntity.setQualifiedAttribute("customAttributes.JSONString", txtJSON);
        eSiriusJSONEntity.setQualifiedAttribute("customAttributes.JSONDetailString", txtJSON);

        wom.log("Finished recording JSON from eSirius to eSirius Web Service Pull log: " + eSiriusJSONEntity.ID);

        strReturn = eSiriusJSONEntity.ID;
        //}
        //else {
        //    strReturn = txtJSONReturnMessage;
        //}
        return strReturn;

    }
    catch (e) {
        wom.log("EXCEPTION CustomUtils.pullAnimalCareServicesOrderHistoryJSON_Debug: " + e.description);
        throw(e);
    }
}

[eSiriusWebServicesClient]ubc.rise.eSirius.WebService.proxy

function pushACSProtocolJSON(ProtocolID, ProjectType)
{
    try {
        //wom.log("+++++++++++++++++++++++++++++++++++++++++++ Point 1");
        var strReturn = "Hello World";

        //Input parameter
        //var ProtocolID = "A10-0167";  //Research, Single Species
        //var ProtocolID = "A07-0109";  //Research, Multiple Species
        //var ProtocolID = "A10-0085";
        //var ProjectType = "Protocol";

        //Temporary Holding Variables
        var ProtocolEntitySet = null;
        var ProtocolEntity = null;
        var PrincipalInvestigatorEntity = null;
        var ApprovedAnimalsUsedEntitySet = null;
        var ApprovedAnimalsUsedEntity = null;
        var AnimalInformationEntitySet = null;
        var AnimalInformationEntity = null;

        var BreedingApplicationsEntity = null;
        var AnimalInformationBreedingEntitySet = null;
        var AnimalInformationBreedingEntity = null;

        var CCACCategoryEntity = null;
        var TypeofApplicationEntity = null;
        var CompanyEntity = null;

        //Outputs
        var txtJSON = "";
        var ApplicationNumber = "";
        var ProtocolName = "";
        var UserId = "";
        var FirstName = "";
        var LastName = "";
        var Email = "";
        var StudyStartDate = "";
        var StudyEndDate = "";
        var ExpirationDate = "";
        var ApprovalDate = "";

        var CCACCategoryEntity = null;
        var TypeofApplication = null;

        var CompanyID = "";
        var InstitutionName = "";
        var InstitutionID = "";
        var FacultyName = "";
        var FacultyID = "";
        var DepartmentName = "";
        var DepartmentID = "";
        var DivisionName = "";
        var DivisionID = "";

        var ProjectStatus = "";
        var TerminatedProtocolNumber = "";

        //ACS must stored this value to be sent back to RISe
        //var ApprovedAnimalsUsedID = "";

        var NumberofAnimalsApproved = -1;
        var Strain = "";
        var SpeciesID = "";
        var SpeciesName = "";
        var HousingLocationCode = "";
        var HousingLocationID = "";
        var HousingLocationName = "";

        //These variables are only required for sending over the animals used to eSirius
        var bSpeciesChanged = false;
        var prevSpeciesID = "";

        //var txtUser = 'NTMCS';
        var txtUser = customutils.eSiriusWebServiceLogin;
        //var txtPassword = 'hello';
        var txtPassword = customutils.eSiriusWebServicePassword;

        ProtocolEntitySet = getResultSet("_Protocol").query("ID='" + ProtocolID + "'");

        wom.log("+++++++++++++++++++++++++++++++++++++++++++ Point 2");

        if (ProtocolEntitySet.elements().count() > 0) {
            strReturn = "Protocol Found";

            // Only expecting 1 protocol record
            ProtocolEntity = ProtocolEntitySet.elements().item(1);
            ApplicationNumber = ProtocolEntity.getQualifiedAttribute("customAttributes._attribute307");

            var Name = ProtocolEntity.name;
            wom.log("+++++++++++++++++++++++++++++++++++++++++++ Point 2.1");

            StudyStartDate = new Date(ProtocolEntity.getQualifiedAttribute("customAttributes._attribute271"));
            wom.log("+++++++++++++++++++++++++++++++++++++++++++ Point 2.2");

            var strYear = String(StudyStartDate.getFullYear())
            var nMonth = StudyStartDate.getMonth() + 1;
            var strMonth, strDay;
            if (nMonth < 10) {
                strMonth = "0" + String(nMonth);
            }
            else {
                strMonth = String(nMonth);
            }
            if (StudyStartDate.getDate() < 10) {
                strDay = "0" + String(StudyStartDate.getDate());
            }
            else {
                strDay = String(StudyStartDate.getDate());
            }
            StudyStartDate = strMonth + '/' + strDay + '/' + strYear;
            wom.log("+++++++++++++++++++++++++++++++++++++++++++ Point 2.3");

            StudyEndDate = new Date(ProtocolEntity.getQualifiedAttribute("customAttributes._attribute272"));
            strYear = String(StudyEndDate.getFullYear())
            nMonth = StudyEndDate.getMonth() + 1;
            if (nMonth < 10) {
                strMonth = "0" + String(nMonth);
            }
            else {
                strMonth = String(nMonth);
            }
            if (StudyEndDate.getDate() < 10) {
                strDay = "0" + String(StudyEndDate.getDate());
            }
            else {
                strDay = String(StudyEndDate.getDate());
            }
            StudyEndDate = strMonth + '/' + strDay + '/' + strYear;
            wom.log("+++++++++++++++++++++++++++++++++++++++++++ Point 2.4");

            ExpirationDate = new Date(ProtocolEntity.getQualifiedAttribute("customAttributes._attribute141"));
            strYear = String(ExpirationDate.getFullYear())
            nMonth = ExpirationDate.getMonth() + 1;
            if (nMonth < 10) {
                strMonth = "0" + String(nMonth);
            }
            else {
                strMonth = String(nMonth);
            }
            if (ExpirationDate.getDate() < 10) {
                strDay = "0" + String(ExpirationDate.getDate());
            }
            else {
                strDay = String(ExpirationDate.getDate());
            }
            ExpirationDate = strMonth + '/' + strDay + '/' + strYear;
            wom.log("+++++++++++++++++++++++++++++++++++++++++++ Point 2.5");

            ApprovalDate = new Date(ProtocolEntity.getQualifiedAttribute("customAttributes._attribute154"));
            strYear = String(ApprovalDate.getFullYear())
            nMonth = ApprovalDate.getMonth() + 1;
            if (nMonth < 10) {
                strMonth = "0" + String(nMonth);
            }
            else {
                strMonth = String(nMonth);
            }
            if (ApprovalDate.getDate() < 10) {
                strDay = "0" + String(ApprovalDate.getDate());
            }
            else {
                strDay = String(ApprovalDate.getDate());
            }
            ApprovalDate = strMonth + '/' + strDay + '/' + strYear;
            wom.log("+++++++++++++++++++++++++++++++++++++++++++ Point 2.6");

        }
        else {
            strReturn = "Protocol Not Found";
            return strReturn;
        }

        wom.log("+++++++++++++++++++++++++++++++++++++++++++ Point 3");

        PrincipalInvestigatorEntity = ProtocolEntity.getQualifiedAttribute("customAttributes._attribute0");

        if (PrincipalInvestigatorEntity != null) {
            strReturn = "PI Found";

            UserId = isNull(PrincipalInvestigatorEntity.userId, "");
            FirstName = isNull(PrincipalInvestigatorEntity.firstName, "");
            LastName = isNull(PrincipalInvestigatorEntity.lastName, "");
            Email = isNull(PrincipalInvestigatorEntity.getQualifiedAttribute("contactInformation.emailPreferred.eMailAddress"), "");

        }
        else {
            strReturn = "No PI Found";
        }

        wom.log("+++++++++++++++++++++++++++++++++++++++++++ Point 4");

        CCACCategoryEntity = ProtocolEntity.getQualifiedAttribute("customAttributes._attribute163");
        var CCACCategory = "";
        if (CCACCategoryEntity != null) {
            strReturn = "Category of Invasiveness Found";

            CCACCategory = isNull(CCACCategoryEntity.getQualifiedAttribute("customAttributes._attribute1"), "");

        }
        else {
            strReturn = "No Category of Invasiveness Found";
        }

        wom.log("+++++++++++++++++++++++++++++++++++++++++++ Point 4.1");

        CompanyEntity = ProtocolEntity.getQualifiedAttribute("company");

        if (CompanyEntity != null) {
            strReturn = "Company Found";

            CompanyID = CompanyEntity.ID;
            var orgType = CompanyEntity.getQualifiedAttribute("customAttributes._attribute3");

            if (orgType == "Division") {
                DivisionID = CompanyID;
                DepartmentID = CompanyID.substr(0, 7) + '000';
                FacultyID = CompanyID.substr(0, 4) + '000000';
                InstitutionID = CompanyID.substr(0, 2) + '00000000';
            } else if (orgType == "Department") {
                DivisionID = "";
                DepartmentID = CompanyID.substr(0, 7) + '000';
                FacultyID = CompanyID.substr(0, 4) + '000000';
                InstitutionID = CompanyID.substr(0, 2) + '00000000';
            } else if (orgType == "Faculty") {
                DivisionID = "";
                DepartmentID = "";
                FacultyID = CompanyID.substr(0, 4) + '000000';
                InstitutionID = CompanyID.substr(0, 2) + '00000000';
            } else if (orgType == "Institution") {
                DivisionID = "";
                DepartmentID = "";
                FacultyID = "";
                InstitutionID = CompanyID.substr(0, 2) + '00000000';
            }

            InstitutionName = CompanyEntity.getInstitution();
            FacultyName = CompanyEntity.getFaculty();
            DepartmentName = CompanyEntity.getDepartment();
            DivisionName = CompanyEntity.getDivision();
        }
        else {
            strReturn = "No Company Found";
        }

        wom.log("+++++++++++++++++++++++++++++++++++++++++++ Point 4.3");
        //DY: 2014.03.26 - Using a Mapping State instead (For Conditional Approval Project)
        //ProjectStatus = isNull(ProtocolEntity.getQualifiedAttribute("status.ID"),"");
        ProjectStatus = isNull(ProtocolEntity.getQualifiedAttribute("status.customAttributes.MappingState"), "");

        wom.log("+++++++++++++++++++++++++++++++++++++++++++ Point 4.4");
        TerminatedProtocolNumber = isNull(ProtocolEntity.getQualifiedAttribute("customAttributes._attribute323"), "");
        TerminatedProtocolNumber = ""; //Currently do not want to send Continuation Emails from eSirius - FH - 2014-Feb-05

        wom.log("+++++++++++++++++++++++++++++++++++++++++++ Point 4.5");

        if (ProjectType == "Edits") {

            txtJSON = '[';
            txtJSON += '{';
            txtJSON += '"record_type":"' + ProjectType + '"';
            txtJSON += ',"rise_userid":"' + txtUser + '"'
            txtJSON += ',"rise_pwd":"' + txtPassword + '"'
            txtJSON += ',"prot_no":"' + ApplicationNumber + '"';
            txtJSON += ',"prot_title":"' + Name + '"';
            txtJSON += ',"d_approve":"' + ApprovalDate + '"';
            txtJSON += ',"d_start":"' + StudyStartDate + '"';
            txtJSON += ',"d_expire":"' + ExpirationDate + '"';
            txtJSON += ',"co_id":"' + UserId + '"';
            txtJSON += ',"fst_nm":"' + FirstName + '"';
            txtJSON += ',"lst_nm":"' + LastName + '"';
            txtJSON += ',"email_id":"' + Email + '"';
            txtJSON += ',"sp_nm":"' + SpeciesName + '"';
            txtJSON += ',"sp_id":"' + SpeciesID + '"';
            txtJSON += ',"pain_level":"' + CCACCategory + '"';
            txtJSON += ',"strain":"' + Strain + '"';
            txtJSON += ',"fclty_cd":"' + HousingLocationCode + '"';
            txtJSON += ',"num":"' + NumberofAnimalsApproved + '"';
            txtJSON += ',"tp_use":"' + TypeofApplication + '"';
            txtJSON += ',"status":"' + ProjectStatus + '"';
            txtJSON += ',"prev_prot_no":"' + TerminatedProtocolNumber + '"';
            txtJSON += ',"inst_id":"' + InstitutionID + '"';
            txtJSON += ',"inst_nm":"' + InstitutionName + '"';
            txtJSON += ',"faculty_id":"' + FacultyID + '"';
            txtJSON += ',"faculty_nm":"' + FacultyName + '"';
            txtJSON += ',"dept_id":"' + DepartmentID + '"';
            txtJSON += ',"dept_nm":"' + DepartmentName + '"';
            txtJSON += ',"div_id":"' + DivisionID + '"';
            txtJSON += ',"div_nm":"' + DivisionName + '"';
            txtJSON += '}';
            txtJSON += ']';

            return txtJSON;
        }
        /*
         TypeofApplicationEntity = ProtocolEntity.getQualifiedAttribute("customAttributes._attribute195");
         if (TypeofApplicationEntity != null) {
         strReturn = "Type of Application Found";

         TypeofApplication = TypeofApplicationEntity.getQualifiedAttribute("customAttributes._attribute0");

         }
         else {
         strReturn = "No Type of Application Found";
         }
         wom.log("+++++++++++++++++++++++++++++++++++++++++++ Point 4.6");
         wom.log("TypeofApplication[" + TypeofApplication + "]");
         */
        SpeciesID = "";
        SpeciesName = "";
        Strain = "";
        HousingLocationCode = "";
        NumberofAnimalsApproved = "";

        AnimalInformationEntitySet = ProtocolEntity.getQualifiedAttribute("customAttributes.AnimalInformation");

        wom.log("+++++++++++++++++++++++++++++++++++++++++++ Point 4.9.1");
        if (AnimalInformationEntitySet == null || AnimalInformationEntitySet.elements().count() == 0) {
            wom.log("+++++++++++++++++++++++++++++++++++++++++++ Point 4.9.2");
            strReturn = "No Animal Information Found";

        }
        else {
            strReturn = "Animal Information Found";

            wom.log("+++++++++++++++++++++++++++++++++++++++++++ Point 5");
            AnimalInformationEntitySet = AnimalInformationEntitySet.sort("customAttributes.Species.ID", 105, 1).elements();

            //These variables are initialize here for readability. Values should not have changed
            //since being declared.
            bSpeciesChanged = false;
            prevSpeciesID = "";

            for (var j = 1; j <= AnimalInformationEntitySet.count(); j++) {
                wom.log("+++++++++++++++++++++++++++++++++++++++++++ Point 5." + j);

                //Get the AnimalInformation record
                AnimalInformationEntity = AnimalInformationEntitySet(j);

                SpeciesID = AnimalInformationEntity.getQualifiedAttribute("customAttributes.Species.ID");
                if (j == 1 || SpeciesID != prevSpeciesID) {
                    //Detected a species changed
                    bSpeciesChanged = true;
                    prevSpeciesID = SpeciesID;
                }
                SpeciesName = isNull(AnimalInformationEntity.getQualifiedAttribute("customAttributes.Species.customAttributes._attribute0"), "");
                Strain = isNull(AnimalInformationEntity.getQualifiedAttribute("customAttributes.Strain"), "");
                HousingLocationCode = isNull(AnimalInformationEntity.getQualifiedAttribute("customAttributes.HousingLocation.customAttributes.LocationCode"), "");
                NumberofAnimalsApproved = AnimalInformationEntity.getQualifiedAttribute("customAttributes.NumberOfAnimalsRequested");
                // TODO: check to see if we need to keep this
                if (ProjectType == "Reset") {
                    //Impersonate the Number of Animals Approved with Actual number of animals already ordered and
                    //record this number on the first instance of the species. All other instances will be 0.
                    //This code is here only for the initial load of animals used into eSirius. Code can be removed
                    //once esirius is fully live as there will be no reason to send over the animals used from RISe
                    //as eSirius is the system of record for animals used (ordered). - FH - 20130828.
                    Strain = "" // Strain is not tracked in eSirius on initial load

                    if (bSpeciesChanged) {
                        NumberofAnimalsApproved = CustomUtils.pushAnimalCareServicesGetAnimalsUsed(ProtocolID, SpeciesID);
                        bSpeciesChanged = false;
                    }
                    else {
                        NumberofAnimalsApproved = 0;
                    }
                }
                // End TODO
                wom.log("+++++++++++++++++++++++++++++++++++++++++++ Point 7." + j);
                if (j == 1) {
                    txtJSON = '[';
                }

                txtJSON += '{';
                txtJSON += ' "record_type":"' + ProjectType + '"';
                txtJSON += ',"rise_userid":"' + txtUser + '"'
                txtJSON += ',"rise_pwd":"' + txtPassword + '"'
                txtJSON += ',"prot_no":"' + ApplicationNumber + '"';
                txtJSON += ',"prot_title":"' + Name + '"';
                txtJSON += ',"d_approve":"' + ApprovalDate + '"';
                txtJSON += ',"d_start":"' + StudyStartDate + '"';
                txtJSON += ',"d_expire":"' + ExpirationDate + '"';
                txtJSON += ',"co_id":"' + UserId + '"';
                txtJSON += ',"fst_nm":"' + FirstName + '"';
                txtJSON += ',"lst_nm":"' + LastName + '"';
                txtJSON += ',"email_id":"' + Email + '"';
                txtJSON += ',"sp_nm":"' + SpeciesName + '"';
                txtJSON += ',"sp_id":"' + SpeciesID + '"';
                txtJSON += ',"pain_level":"' + CCACCategory + '"';
                txtJSON += ',"strain":"' + Strain + '"';
                txtJSON += ',"fclty_cd":"' + HousingLocationCode + '"';
                txtJSON += ',"num":"' + NumberofAnimalsApproved + '"';
                txtJSON += ',"tp_use":"' + TypeofApplication + '"';
                txtJSON += ',"status":"' + ProjectStatus + '"';
                txtJSON += ',"prev_prot_no":"' + TerminatedProtocolNumber + '"';
                txtJSON += ',"inst_id":"' + InstitutionID + '"';
                txtJSON += ',"inst_nm":"' + InstitutionName + '"';
                txtJSON += ',"faculty_id":"' + FacultyID + '"';
                txtJSON += ',"faculty_nm":"' + FacultyName + '"';
                txtJSON += ',"dept_id":"' + DepartmentID + '"';
                txtJSON += ',"dept_nm":"' + DepartmentName + '"';
                txtJSON += ',"div_id":"' + DivisionID + '"';
                txtJSON += ',"div_nm":"' + DivisionName + '"';
                txtJSON += '}';

                if (j == AnimalInformationEntitySet.count()) {
                    txtJSON += ']';
                }
                else {
                    txtJSON += ',';
                }
                wom.log("+++++++++++++++++++++++++++++++++++++++++++ Point 8." + j);

            }
        }

        //strReturn = TypeofApplication;
        strReturn = txtJSON;
        return strReturn;
    }
    catch (e) {
        wom.log("EXCEPTION CustomUtils.pushAnimalCareServicesProtocolJSON: " + e.description);
        throw(e);
    }
}

function pushAnimalCareServicesApprovedAmendment(AmendmentID)
{
    try {
        //dy 2013.10.21: only run the webservices call if enable
        //if eSiriusWebSerivceEnable is false, exit (return) the function
        if (!customutils.eSiriusWebSerivceEnable) return;

//        var strWebService = "http://esiriusapi.ntmcs.com/eSirius3gUBC/";
        wom.log("+++++++++++++++++++++++++++++++++++++++++++ Point 1 ApprovedAmendment: "+AmendmentID);
        var strWebService = customutils.eSiriusWebServiceURL.toLowerCase();
        var strWebMethod = "esApiProtocolUpdate.wc?";
        var txtJSON = null;
        var txtJSONLog = null;
        var txtJSONReturnMessage = null;
        var objJSON = null;
        var AmendmentEntitySet;
        var AmendmentEntity;
        var ProtocolEntity;
        var ProtocolID;
        var ProtocolStartDate;
        var sch = wom.getContext("_ScriptingContextHelper"); //Get the ServerVariables

        AmendmentEntitySet = null;
        ProtocolEntity = null;
        AmendmentEntitySet = getResultSet("_Amendment").query("ID='"+AmendmentID+"'");
        if ( AmendmentEntitySet.elements().count() > 0 ) {
            strReturn = "Amendment Found";
            AmendmentEntity = AmendmentEntitySet.elements().item(1);
            if (AmendmentEntity != null) {
                ProtocolEntity = AmendmentEntity.getQualifiedAttribute("customAttributes._attribute8");
                ProtocolID = ProtocolEntity.getQualifiedAttribute("customAttributes._attribute307");
                ProtocolStartDate = ProtocolEntity.getQualifiedAttribute("customAttributes._attribute271");

                //Need to ensure that the start date is before or on today
                //if (ProtocolStartDate <= new Date()) {

                txtJSON = customUtils.pushAnimalCareServicesProtocolJSON(ProtocolID, "Amendment");
                txtJSONLog = customUtils.clearAnimalCareServicesJSONCredentials(txtJSON);
                wom.log("txtJSON: " + txtJSONLog);

                AmendmentEntity.setQualifiedAttribute("customAttributes.SentToACSJSON", txtJSONLog);

                if ( (sch.serverName().toLowerCase() == "rise.ubc.ca"      && strWebService == "https://esirius3g.as.it.ubc.ca/esirius3g/"   ) ||
                    (sch.serverName().toLowerCase() == "test.rise.ubc.ca" && strWebService == "http://esirius3gtest.as.it.ubc.ca/esirius3g/")
                    ) {
                    //call the webservice only if this code is running in the production
                    //environment. - FH - May 16, 2013

                    //strWebService = CustomUtils.eSiriusWebServiceURL;
                    //call the webservice
                    wom.log("Web Service Call: " + strWebService + strWebMethod + txtJSONLog);
                    txtJSONReturnMessage = CustomUtils.pushRISeDataToeSirius(strWebService, strWebMethod, txtJSON, CustomUtils.eSiriusWebServiceDebug);
                    //txtJSONReturnMessage = CustomUtils.eSiriusWebServiceCall("http://esiriusapi.ntmcs.com/eSirius3gUBC/","esApiProtocolUpdate.wc?", txtJSON);
                }
                else {
                    if (sch.serverName()=="rise.ubc.ca") {
                        wom.log("Web Service Call: Web service not called.");
                        if (sch.serverName()=="rise.ubc.ca") {
                            wom.log("Web Service Call: Check that web address of RISe is rise.ubc.ca instead of [" + sch.serverName() + "]");
                        }
                        else {
                        }
                        if (strWebService != "https://esirius3g.as.it.ubc.ca/esirius3g/") {
                            wom.log("Web Service Call: Check that webservice is https://esirius3g.as.it.ubc.ca/esirius3g/ instead of [" + strWebService + "]");
                        }
                        else {
                        }
                    } else if (sch.serverName()=="test.rise.ubc.ca") {
                        wom.log("Web Service Call: Web service not called. Server: "+sch.serverName().toLowerCase());
                        if (sch.serverName()!="test.rise.ubc.ca") {
                            wom.log("Web Service Call: Check that web address of RISe is test.rise.ubc.ca instead of [" + sch.serverName() +"]");
                        }
                        else {
                        }
                        if (strWebService != "http://esirius3gtest.as.it.ubc.ca/esirius3g/") {
                            wom.log("Web Service Call: Check that webservice is http://esirius3gtest.as.it.ubc.ca/esirius3g/ instead of [" + strWebService +"]");
                        }
                        else {
                        }
                    } else {
                        wom.log("Web Service Call: Web service not called.");
                    }
                }

                //Sample returned JSON
                //txtJSONReturnMessage = '{"success":"false","message":"Invalid Record Type: PROTOCOL"}';
                //txtJSONReturnMessage = '{"success":"false","message":"Required field [D_APPROVE] is missing"}';
                //txtJSONReturnMessage = '{"success":"false","message":"Housing Location [null] is not established in eSirius3G"}';
                //txtJSONReturnMessage = '{"success":"false","message":"Connectivity error: [Oracle][ODBC][Ora]ORA-02291: integrity constraint (ESIRIUS3GUBC.RELATION_363) violated - parent key not found"}';
                //txtJSONReturnMessage = '{"success":"false","message":"Required field [STRAIN] is missing"}';
                //txtJSONReturnMessage = '{"success":"true"}';

                wom.log("Message JSON from eSirius: " + txtJSONReturnMessage);

                if ( txtJSONReturnMessage == null || txtJSONReturnMessage.length == 0 ) {
                    txtJSONReturnMessage = '{"success":"false","message":"No JSON to process"}';
                    wom.log("No JSON to process from webservice call");
                }
                else if ( txtJSONReturnMessage.substring(0,1) != '{' ) {
                    // Not a valid JSON error message. For evaluating a string to JSON need to replace carriage returns and line feeds.
                    txtJSONReturnMessage = '{"success":"false","message":"' + txtJSONReturnMessage.replace(/[\r\n|\n|\r|\t]/gm,' ') + '"}';
                    wom.log("Repackage proxy dll error to be a proper JSON: " + txtJSONReturnMessage);
                }
                else {
                    txtJSONReturnMessage = txtJSONReturnMessage.replace(/[\r\n|\n|\r|\t]/gm,' ');
                    wom.log("Remove proxy dll line feed error to be a proper JSON: " + txtJSONReturnMessage);
                }

                // What happens if txtJSON is not a valid string. Does eval throw an error?
                // - FH - 20130524
                objJSON = eval("(" + txtJSONReturnMessage + ")");
                strReturn = "objJSON success[" + objJSON.success + "] message[" + objJSON.message + "]";

                if (objJSON.success == "true") {
                    AmendmentEntity.setQualifiedAttribute("customAttributes.UploadedToACS", true);
                }
                else {
                    AmendmentEntity.setQualifiedAttribute("customAttributes.UploadedToACS", false);
                    throw(new Error(-1, "ACS Data transfer error: "+objJSON.message+", please contact Site Manager for this issue"));
                }

                //}
            }
        }
        else {
            throw(new Error(-1, "Protocol Not Found for Amendment " + AmendmentID + ", please contact Site Manager for this issue"));
        }
    }
    catch (e) {
        wom.log("EXCEPTION CustomUtils.pushAnimalCareServicesApprovedAmendment: " + e.description);
        AmendmentEntity.setQualifiedAttribute("customAttributes.UploadedToACS", false);

        var currentDate = new Date();
        var To = "fred.helm@ubc.ca; david.yeung@ubc.ca";
        //var Cc = "david.yeung@ors.ubc.ca";
        var Cc = "";
        var From = "david.yeung@ors.ubc.ca";
        var Subject = "eSirius data push for Amendment "+AmendmentID;
        var HTMLBody = "Automatic generated email to transfer data from eSirius to RISe. " + e.description;
        var objMail = CustomUtils.sendEmailCDO(To, Cc, null, From, Subject, HTMLBody, null, null);

        /*
         objMail.AddAttachment (fileName1);
         objMail.AddAttachment (fileName2);
         objMail.AddAttachment (fileName3);
         objMail.AddAttachment (fileName4);
         objMail.AddAttachment (fileName5);
         objMail.AddAttachment (fileName6);
         */
        objMail.Send();
        objMail = null;
        //Don't throw an error because we want to have the approved activity to complete.
        //If the protocol did not get pushed, a nightly SBO job will pick up this protocol
        //and resubmit it.
        //throw(e);
    }
}

function pushAnimalCareServicesApprovedProtocol(ProtocolID)
{

    try {
        //dy 2013.10.21: only run the webservices call if enable
        //if eSiriusWebSerivceEnable is false, exit (return) the function
        //if (!customutils.eSiriusWebSerivceEnable) return;

        wom.log("+++++++++++++++++++++++++++++++++++++++++++ Point 1 ApprovedProtocol: "+ProtocolID);
        var strReturn = "Hello World";
        //var strWebService = "http://esiriusapi.ntmcs.com/eSirius3gUBC/";
        var strWebService = customutils.eSiriusWebServiceURL.toLowerCase();
        var strWebMethod = "esApiProtocolUpdate.wc?";
        var txtJSON = null;
        var txtJSONLog = null;
        var txtJSONReturnMessage = null;
        var objJSON = null;
        var ProtocolEntitySet = null;
        var ProtocolEntity = null;
        var ProtocolStartDate;
        var sch = wom.getContext("_ScriptingContextHelper"); //Get the ServerVariables

        ProtocolEntitySet = getResultSet("_Protocol").query("ID='"+ProtocolID+"'");
        if ( ProtocolEntitySet.elements().count() > 0 ) {
            ProtocolEntity = ProtocolEntitySet.elements().item(1);
            if (ProtocolEntity != null) {

                ProtocolStartDate = ProtocolEntity.getQualifiedAttribute("customAttributes._attribute271");

                //Need to ensure that the start date is before or on today
                if (ProtocolStartDate > new Date()) {
                    ProtocolEntity.setQualifiedAttribute("customAttributes._attribute320.customAttributes.UploadedToACS", false);
                }
                else {

                    wom.log("+++++++++++++++++++++++++++++++++++++++++++ Point 1.1");
                    //DY: 2014.03.26 - Need to check if protocol sent to eSirius previously
                    //If so, push as Amendment
                    //Xin 2014.07.08 Changed to use pushACSProtocolJSON function
                    var UploadedToACSCheck = ProtocolEntity.getQualifiedAttribute("customAttributes._attribute320.customAttributes.UploadedToACS");
                    if(UploadedToACSCheck != true)
                    {
                        txtJSON = CustomUtils.pushACSProtocolJSON( ProtocolID, "New" );
                    }
                    else
                    {
                        txtJSON = CustomUtils.pushACSProtocolJSON( ProtocolID, "Amendment" );
                    }
                    txtJSONLog = customUtils.clearAnimalCareServicesJSONCredentials(txtJSON);
                    wom.log("txtJSON: " + txtJSONLog);

                    ProtocolEntity.setQualifiedAttribute("customAttributes._attribute320.customAttributes.SentToACSJSON", txtJSONLog);
                    if ( (sch.serverName().toLowerCase() == "rise.ubc.ca"      && strWebService == "https://esirius3g.as.it.ubc.ca/esirius3g/"   ) ||
                        (sch.serverName().toLowerCase() == "test.rise.ubc.ca" && strWebService == "http://esirius3gtest.as.it.ubc.ca/esirius3g/")
                        ) {
                        //call the webservice only if this code is running in the production
                        //environment. - FH - May 16, 2013

                        //strWebService = CustomUtils.eSiriusWebServiceURL;
                        //call the webservice
                        //To build a JSON string that is compatiable with the C# proxy
                        //txtJSON = txtJSON.replace(/[\"]/g, '\\\"');

                        //strWebService = strWebService+strWebMethod+txtJSON;
                        wom.log("Web Service Call: " + strWebService + strWebMethod + txtJSONLog);
                        txtJSONReturnMessage = CustomUtils.pushRISeDataToeSirius(strWebService, strWebMethod, txtJSON, CustomUtils.eSiriusWebServiceDebug);
                        //txtJSONReturnMessage = CustomUtils.eSiriusWebServiceCall(strWebService, "","");
                    }
                    else {
                        if (sch.serverName()=="rise.ubc.ca") {
                            wom.log("Web Service Call: Web service not called.");
                            if (sch.serverName()=="rise.ubc.ca") {
                                wom.log("Web Service Call: Check that web address of RISe is rise.ubc.ca instead of [" + sch.serverName() + "]");
                            }
                            else {
                            }
                            if (strWebService != "https://esirius3g.as.it.ubc.ca/esirius3g/") {
                                wom.log("Web Service Call: Check that webservice is https://esirius3g.as.it.ubc.ca/esirius3g/ instead of [" + strWebService + "]");
                            }
                            else {
                            }
                        } else if (sch.serverName()=="test.rise.ubc.ca") {
                            wom.log("Web Service Call: Web service not called. Server: "+sch.serverName().toLowerCase());
                            if (sch.serverName()!="test.rise.ubc.ca") {
                                wom.log("Web Service Call: Check that web address of RISe is test.rise.ubc.ca instead of [" + sch.serverName() +"]");
                            }
                            else {
                            }
                            if (strWebService != "http://esirius3gtest.as.it.ubc.ca/esirius3g/") {
                                wom.log("Web Service Call: Check that webservice is http://esirius3gtest.as.it.ubc.ca/esirius3g/ instead of [" + strWebService +"]");
                            }
                            else {
                            }
                        } else {
                            wom.log("Web Service Call: Web service not called.");
                        }
                    }

                    //Sample returned JSON
                    //txtJSONReturnMessage = '{"success":"false","message":"Invalid Record Type: PROTOCOL"}';
                    //txtJSONReturnMessage = '{"success":"false","message":"Required field [D_APPROVE] is missing"}';
                    //txtJSONReturnMessage = '{"success":"false","message":"Housing Location [null] is not established in eSirius3G"}';
                    //txtJSONReturnMessage = '{"success":"false","message":"Connectivity error: [Oracle][ODBC][Ora]ORA-02291: integrity constraint (ESIRIUS3GUBC.RELATION_363) violated - parent key not found"}';
                    //txtJSONReturnMessage = '{"success":"false","message":"Required field [STRAIN] is missing"}';
                    //txtJSONReturnMessage = '{"success":"false","message":"New Protocol already exists in eSirius3G"}';
                    //txtJSONReturnMessage = '{"success":"true"}';

                    wom.log("Message JSON from eSirius: " + txtJSONReturnMessage);
                    wom.log("Line2");
                    if ( txtJSONReturnMessage == null || txtJSONReturnMessage.length == 0 ) {
                        txtJSONReturnMessage = '{"success":"false","message":"No JSON to process"}';
                        wom.log("No JSON to process from webservice call");
                    }
                    else if ( txtJSONReturnMessage.substring(0,1) != '{' ) {
                        // Not a valid JSON error message. For evaluating a string to JSON need to replace carriage returns and line feeds.
                        txtJSONReturnMessage = '{"success":"false","message":"' + txtJSONReturnMessage.replace(/[\r\n|\n|\r|\t]/gm,' ') + '"}';
                        wom.log("Repackage proxy dll error to be a proper JSON: " + txtJSONReturnMessage);
                    }
                    else {
                        txtJSONReturnMessage = txtJSONReturnMessage.replace(/[\r\n|\n|\r|\t]/gm,' ');
                        wom.log("Remove proxy dll line feed error to be a proper JSON: " + txtJSONReturnMessage);
                    }

                    // What happens if txtJSON is not a valid string. Does eval throw an error?
                    // - FH - 20130524
                    objJSON = eval("(" + txtJSONReturnMessage + ")");
                    strReturn = "objJSON success[" + objJSON.success + "] message[" + objJSON.message + "]";

                    if (objJSON.success == "true") {
                        ProtocolEntity.setQualifiedAttribute("customAttributes._attribute320.customAttributes.UploadedToACS", true);
                    }
                    else {
                        ProtocolEntity.setQualifiedAttribute("customAttributes._attribute320.customAttributes.UploadedToACS", false);
                        throw(new Error(-1, "ACS Data transfer error: "+objJSON.message+", please contact Site Manager for this issue"));
                    }

                }
            }
        }

        return strReturn;
    }
    catch (e) {
        wom.log("EXCEPTION CustomUtils.pushAnimalCareServicesApprovedProtocol: " + e.description);
        ProtocolEntity.setQualifiedAttribute("customAttributes._attribute320.customAttributes.UploadedToACS", false);

        var currentDate = new Date();
        var To = "fred.helm@ubc.ca; david.yeung@ubc.ca";
        //var Cc = "david.yeung@ors.ubc.ca";
        var Cc = "";
        var From = "david.yeung@ors.ubc.ca";
        var Subject = "eSirius data push for "+ProtocolID;
        var HTMLBody = "Automatic generated email to transfer data from eSirius to RISe. " + e.description;
        var objMail = CustomUtils.sendEmailCDO(To, Cc, null, From, Subject, HTMLBody, null, null);

        /*
         objMail.AddAttachment (fileName1);
         objMail.AddAttachment (fileName2);
         objMail.AddAttachment (fileName3);
         objMail.AddAttachment (fileName4);
         objMail.AddAttachment (fileName5);
         objMail.AddAttachment (fileName6);
         */
        objMail.Send();
        objMail = null;

        //throw(e);
    }
}

function pushAnimalCareServicesApprovedRenewal(RenewalID)
{
    try {
        //dy 2013.10.21: only run the webservices call if enable
        //if eSiriusWebSerivceEnable is false, exit (return) the function
        if (!customutils.eSiriusWebSerivceEnable) return;

        wom.log("+++++++++++++++++++++++++++++++++++++++++++ Point 1 ApprovedRenewal: "+RenewalID);
        var strReturn = "Hello World";
        //var strWebService = "http://esiriusapi.ntmcs.com/eSirius3gUBC/";
        var strWebService = customutils.eSiriusWebServiceURL.toLowerCase();
        var strWebMethod = "esApiProtocolUpdate.wc?";
        var txtJSON = null;
        var txtJSONLog = null;
        var txtJSONReturnMessage = null;
        var RenewalEntitySet;
        var RenewalEntity;
        var ProtocolEntity;
        var ProtocolID;
        var ProtocolStartDate;
        var sch = wom.getContext("_ScriptingContextHelper"); //Get the ServerVariables

        RenewalEntitySet = getResultSet("_Continuing Review").query("ID='"+RenewalID+"'");
        if ( RenewalEntitySet.elements().count() > 0 ) {
            RenewalEntity = RenewalEntitySet.elements().item(1);
            if (RenewalEntity != null) {
                strReturn = "Renewal Found";
                ProtocolEntity = RenewalEntity.getQualifiedAttribute("customAttributes._attribute9");
                ProtocolID = ProtocolEntity.ID;
                wom.log("Protocol ID["+ProtocolID+"]");
                ProtocolStartDate = ProtocolEntity.getQualifiedAttribute("customAttributes._attribute271");

                //Need to ensure that the start date is before or on today
                //if (ProtocolStartDate <= new Date()) {
                //Xin 2014.07.08 changed to use new function pushACSProtocolJSON
                txtJSON = customUtils.pushACSProtocolJSON(ProtocolID, "Renewal");
                txtJSONLog = customUtils.clearAnimalCareServicesJSONCredentials(txtJSON);
                wom.log("txtJSON: " + txtJSONLog);

                RenewalEntity.setQualifiedAttribute("customAttributes.SentToACSJSON", txtJSONLog);
                if ( (sch.serverName().toLowerCase() == "rise.ubc.ca"      && strWebService == "https://esirius3g.as.it.ubc.ca/esirius3g/"   ) ||
                    (sch.serverName().toLowerCase() == "test.rise.ubc.ca" && strWebService == "http://esirius3gtest.as.it.ubc.ca/esirius3g/")
                    ) {
                    //call the webservice only if this code is running in the production
                    //environment. - FH - May 16, 2013

                    //strWebService = CustomUtils.eSiriusWebServiceURL;
                    //call the webservice
                    wom.log("Web Service Call: " + strWebService + strWebMethod + txtJSONLog);
                    txtJSONReturnMessage = CustomUtils.pushRISeDataToeSirius(strWebService, strWebMethod, txtJSON, CustomUtils.eSiriusWebServiceDebug);
                    //txtJSONReturnMessage = CustomUtils.eSiriusWebServiceCall(strWebService, strWebMethod, txtJSON);
                }
                else {
                    if (sch.serverName()=="rise.ubc.ca") {
                        wom.log("Web Service Call: Web service not called.");
                        if (sch.serverName()=="rise.ubc.ca") {
                            wom.log("Web Service Call: Check that web address of RISe is rise.ubc.ca instead of [" + sch.serverName() + "]");
                        }
                        else {
                        }
                        if (strWebService != "https://esirius3g.as.it.ubc.ca/esirius3g/") {
                            wom.log("Web Service Call: Check that webservice is https://esirius3g.as.it.ubc.ca/esirius3g/ instead of [" + strWebService + "]");
                        }
                        else {
                        }
                    } else if (sch.serverName()=="test.rise.ubc.ca") {
                        wom.log("Web Service Call: Web service not called. Server: "+sch.serverName().toLowerCase());
                        if (sch.serverName()!="test.rise.ubc.ca") {
                            wom.log("Web Service Call: Check that web address of RISe is test.rise.ubc.ca instead of [" + sch.serverName() +"]");
                        }
                        else {
                        }
                        if (strWebService != "http://esirius3gtest.as.it.ubc.ca/esirius3g/") {
                            wom.log("Web Service Call: Check that webservice is http://esirius3gtest.as.it.ubc.ca/esirius3g/ instead of [" + strWebService +"]");
                        }
                        else {
                        }
                    } else {
                        wom.log("Web Service Call: Web service not called.");
                    }
                }

                //Sample returned JSON
                //txtJSONReturnMessage = '{"success":"false","message":"Invalid Record Type: PROTOCOL"}';
                //txtJSONReturnMessage = '{"success":"false","message":"Required field [D_APPROVE] is missing"}';
                //txtJSONReturnMessage = '{"success":"false","message":"Housing Location [null] is not established in eSirius3G"}';
                //txtJSONReturnMessage = '{"success":"false","message":"Connectivity error: [Oracle][ODBC][Ora]ORA-02291: integrity constraint (ESIRIUS3GUBC.RELATION_363) violated - parent key not found"}';
                //txtJSONReturnMessage = '{"success":"false","message":"Required field [STRAIN] is missing"}';
                //txtJSONReturnMessage = '{"success":"false","message":"New Protocol already exists in eSirius3G"}';
                //txtJSONReturnMessage = '{"success":"true"}';

                wom.log("Message JSON from eSirius: " + txtJSONReturnMessage);

                if ( txtJSONReturnMessage == null || txtJSONReturnMessage.length == 0 ) {
                    txtJSONReturnMessage = '{"success":"false","message":"No JSON to process"}';
                    wom.log("No JSON to process from webservice call");
                }
                else if ( txtJSONReturnMessage.substring(0,1) != '{' ) {
                    // Not a valid JSON error message. For evaluating a string to JSON need to replace carriage returns and line feeds.
                    txtJSONReturnMessage = '{"success":"false","message":"' + txtJSONReturnMessage.replace(/[\r\n|\n|\r|\t]/gm,' ') + '"}';
                    wom.log("Repackage proxy dll error to be a proper JSON: " + txtJSONReturnMessage);
                }
                else {
                    txtJSONReturnMessage = txtJSONReturnMessage.replace(/[\r\n|\n|\r|\t]/gm,' ');
                    wom.log("Remove proxy dll line feed error to be a proper JSON: " + txtJSONReturnMessage);
                }

                // What happens if txtJSON is not a valid string. Does eval throw an error?
                // - FH - 20130524
                objJSON = eval("(" + txtJSONReturnMessage + ")");
                strReturn = "objJSON success[" + objJSON.success + "] message[" + objJSON.message + "]";

                if (objJSON.success == "true") {
                    RenewalEntity.setQualifiedAttribute("customAttributes.UploadedToACS", true);
                }
                else {
                    RenewalEntity.setQualifiedAttribute("customAttributes.UploadedToACS", false);
                    throw(new Error(-1, "ACS Data transfer error: "+objJSON.message+", please contact Site Manager for this issue"));
                }

                //}
            }
        }
        return strReturn;
    }
    catch (e) {
        wom.log("EXCEPTION CustomUtils.pushAnimalCareServicesApprovedRenewal: " + e.description);
        RenewalEntity.setQualifiedAttribute("customAttributes.UploadedToACS", false);

        var currentDate = new Date();
        var To = "fred.helm@ubc.ca; david.yeung@ubc.ca";
        //var Cc = "david.yeung@ors.ubc.ca";
        var Cc = "";
        var From = "david.yeung@ors.ubc.ca";
        var Subject = "eSirius data push for Renewal "+RenewalID;
        var HTMLBody = "Automatic generated email to transfer data from eSirius to RISe. " + e.description;
        var objMail = CustomUtils.sendEmailCDO(To, Cc, null, From, Subject, HTMLBody, null, null);

        /*
         objMail.AddAttachment (fileName1);
         objMail.AddAttachment (fileName2);
         objMail.AddAttachment (fileName3);
         objMail.AddAttachment (fileName4);
         objMail.AddAttachment (fileName5);
         objMail.AddAttachment (fileName6);
         */
        objMail.Send();
        objMail = null;
        //Don't throw an error because we want to have the approved activity to complete.
        //If the protocol did not get pushed, a nightly SBO job will pick up this protocol
        //and resubmit it.
        //throw(e);
    }
}

function pushAnimalCareServicesBuildProtocolJSON()
{
    try {
        return "Hello World";
    }
    catch (e) {
        wom.log("EXCEPTION CustomUtils.pushAnimalCareServicesBuildProtocolJSON: " + e.description);
        throw(e);
    }
}

function pushAnimalCareServicesGetAnimalsUsed(ProtocolID, SpeciesID)
{
    try {

        var ProtocolEntitySet = null;
        var protocolEntity = null;
        var AAUEntitySet = null;
        var NumberOfAnimalsUsed = 0;    //Value to add to the running total
        var NumberOfAnimalsUsedRT = 0;  //Running Total

        ProtocolEntitySet = getResultSet("_Protocol").query("ID='"+ProtocolID+"'");
        if ( ProtocolEntitySet.elements().count() > 0 ) {
            protocolEntity = ProtocolEntitySet.elements().item(1);
        }

        //AAUEntitySet = protocolEntity.getQualifiedAttribute("customAttributes._attribute263").query("customAttributes._attribute4.ID='"+objJSON.Rows[i].sp_id+"'").sort("ID",105,1);
        AAUEntitySet = protocolEntity.getQualifiedAttribute("customAttributes._attribute263").query("customAttributes._attribute4.ID='"+SpeciesID+"'").sort("ID",105,1);

        wom.log("Protocol["+ protocolEntity.ID +"] Count of Species["+ AAUEntitySet.elements().count() + "] SpeciesID[" + SpeciesID +"]");

        //Only expecting 1 record returned per species
        if ( AAUEntitySet.elements().count() == 0 ) {
            wom.log("AAU Not Exists");
        }
        else {

            if (AAUEntitySet.elements().count() == 0) {
                //No AAU Records Found
                wom.log("No AAU Records");
            }
            else if (AAUEntitySet.elements().count() == 1) {
                //Single AAU Record Found
                wom.log("Single AAU Record");
            }
            else {
                //Multiple AAU Records Found
                wom.log("Multiple AAU Records");
            }

            for (var j = 1; j <= AAUEntitySet.elements().count(); j++) {

                AAUEntity = AAUEntitySet.elements().item(j);

                if (AAUEntity == null) {
                    strReturn = "AAUEntity is null - " + AIEntity.getEntityTypeName();
                    throw(new Error(-1, "Approved Animals Used record does not exist for "+ AIEntity.getEntityTypeName() +" protocol " + protocolEntity.ID + ", please contact Site Manager for this issue"));
                }

                wom.log("AAU.ID[" +AAUEntity.ID+ "] Species["+ AAUEntity.getQualifiedAttribute("customAttributes._attribute4.ID") +"] Strain["+ AAUEntity.getQualifiedAttribute("customAttributes.RequestedAnimals.customAttributes._attribute8") +"] Number of Animals Used["+AAUEntity.getQualifiedAttribute("customAttributes._attribute2")+"]");

                //ApprovedAnimals = Number(AAUEntity.getQualifiedAttribute("customAttributes._attribute1"));
                NumberOfAnimalsUsed = Number(AAUEntity.getQualifiedAttribute("customAttributes._attribute2"));
                if (!isNaN(NumberOfAnimalsUsed)) {
                    //We found a number
                    NumberOfAnimalsUsedRT += NumberOfAnimalsUsed;
                }
                wom.log("+++++++++++++++++++++Done processing AAU.ID[" +AAUEntity.ID+ "] Species["+ AAUEntity.getQualifiedAttribute("customAttributes._attribute4.customAttributes._attribute0") +"] NumberOfAnimalsUsed["+NumberOfAnimalsUsed+"] NumberOfAnimalsUsedRT["+NumberOfAnimalsUsedRT+"]");

            }
        }
        return NumberOfAnimalsUsedRT;
    }
    catch (e) {
        wom.log("EXCEPTION CustomUtils.pushAnimalCareServicesGetAnimalsUsed: " + e.description);
        throw(e);
    }
}

function pushAnimalCareServicesProtocolAdjustSentToJSONHistory( ProtocolID )
{
    try {

        var ProtocolEntitySet = null;
        var ProtocolEntity = null;

        wom.log("Copying JSON string to other related protocols: "+ProtocolID);

        ProtocolEntitySet = getResultSet("_Protocol").query("ID like '"+ProtocolID+"%'").sort("ID",105,1);
        if ( ProtocolEntitySet.elements().count() > 1 ) {

            wom.log("Found "+ ProtocolEntitySet.elements().count() +" protocols to update");

            //The sorted Protocol Entity Set so that the first one contains the JSON string
            //and flag to copy to the rest.
            for (var j=1; j <= ProtocolEntitySet.elements().count(); j++) {

                wom.log("Inside for loop j["+j+"]");
                ProtocolEntity = ProtocolEntitySet.elements().item(j);
                wom.log("Working with Protocol: " + ProtocolEntity.ID);
                if (j==1) {
                    SentToACSJSON = ProtocolEntity.getQualifiedAttribute("customAttributes._attribute320.customAttributes.SentToACSJSON");
                    UploadedToACS = ProtocolEntity.getQualifiedAttribute("customAttributes._attribute320.customAttributes.UploadedToACS");
                    wom.log("j["+j+"] Successfully loaded JSON variables to copy UploadedToACS ["+UploadedToACS+"] SentToACSJSON ["+SentToACSJSON+"]");
                }
                else {
                    ProtocolEntity.setQualifiedAttribute("customAttributes._attribute320.customAttributes.SentToACSJSON", SentToACSJSON );
                    ProtocolEntity.setQualifiedAttribute("customAttributes._attribute320.customAttributes.UploadedToACS", UploadedToACS );
                    wom.log("j["+j+"] loaded protocol " + ProtocolEntity.getQualifiedAttribute("ID"));
                }
            }
        }
        else if ( ProtocolEntitySet.elements().count() == 1) {
            wom.log("Nothing to do");
        }
        else {
            wom.log("We could not find any protocols including the original. This must be an error.");
        }


    }
    catch (e) {
        wom.log("EXCEPTION CustomUtils.pushAnimalCareServicesProtocolAdjustSentToJSONHistory: " + e.description);
        throw(e);
    }
}

function pushAnimalCareServicesProtocolAdministration(ProtocolID)
{
    try {
        //dy 2013.10.21: only run the webservices call if enable
        //if eSiriusWebSerivceEnable is false, exit (return) the function
        if (!customutils.eSiriusWebSerivceEnable) return;

        wom.log("+++++++++++++++++++++++++++++++++++++++++++ Point 1 ProtocolAdministration:" +ProtocolID);
        var strReturn = "Hello World";
        //var strWebService = "http://esiriusapi.ntmcs.com/eSirius3gUBC/";
        var strWebService = customutils.eSiriusWebServiceURL.toLowerCase();
        var strWebMethod = "esApiProtocolUpdate.wc?";
        var txtJSON = "";
        var txtJSONLog = "";
        var txtJSONReturnMessage = "";
        var objJSON = null;
        var ProtocolEntitySet = null;
        var ProtocolEntity = null;
        var ProtocolStartDate;
        var sch = wom.getContext("_ScriptingContextHelper"); //Get the ServerVariables

        ProtocolEntitySet = getResultSet("_Protocol").query("ID='"+ProtocolID+"'");
        if ( ProtocolEntitySet.elements().count() > 0 ) {
            ProtocolEntity = ProtocolEntitySet.elements().item(1);
            //DY: 2014.02.25 - Only call RISe-eSirius webservices when "UploadedToACS" flag is true
            //This is to ignore upload to eSirius if Protocol does not exist there
            //if (ProtocolEntity != null) {
            //Xin 2014.07.08 Changed to use new function pushACSProtocolJSON
            if ((ProtocolEntity != null) && (ProtocolEntity.getQualifiedAttribute("customAttributes._attribute320.customAttributes.UploadedToACS"))) {

                txtJSON = CustomUtils.pushACSProtocolJSON( ProtocolID, "Edits" );
                txtJSONLog = customUtils.clearAnimalCareServicesJSONCredentials(txtJSON);
                wom.log("txtJSON: " + txtJSONLog);

                ProtocolEntity.setQualifiedAttribute("customAttributes._attribute320.customAttributes.SentToACSJSON", txtJSONLog);
                if ( (sch.serverName().toLowerCase() == "rise.ubc.ca"      && strWebService == "https://esirius3g.as.it.ubc.ca/esirius3g/"   ) ||
                    (sch.serverName().toLowerCase() == "test.rise.ubc.ca" && strWebService == "http://esirius3gtest.as.it.ubc.ca/esirius3g/")
                    ) {
                    //call the webservice only if this code is running in the production
                    //environment. - FH - May 16, 2013

                    //strWebService = CustomUtils.eSiriusWebServiceURL;
                    //call the webservice
                    wom.log("Web Service Call: " + strWebService + strWebMethod + txtJSONLog);
                    //txtJSONReturnMessage = CustomUtils.eSiriusWebServiceCall(strWebService, strWebMethod, txtJSON);
                    txtJSONReturnMessage = CustomUtils.pushRISeDataToeSirius(strWebService, strWebMethod, txtJSON, CustomUtils.eSiriusWebServiceDebug);
                }
                else {
                    if (sch.serverName()=="rise.ubc.ca") {
                        wom.log("Web Service Call: Web service not called.");
                        if (sch.serverName()=="rise.ubc.ca") {
                            wom.log("Web Service Call: Check that web address of RISe is rise.ubc.ca instead of [" + sch.serverName() + "]");
                        }
                        else {
                        }
                        if (strWebService != "https://esirius3g.as.it.ubc.ca/esirius3g/") {
                            wom.log("Web Service Call: Check that webservice is https://esirius3g.as.it.ubc.ca/esirius3g/ instead of [" + strWebService + "]");
                        }
                        else {
                        }
                    } else if (sch.serverName()=="test.rise.ubc.ca") {
                        wom.log("Web Service Call: Web service not called. Server: "+sch.serverName().toLowerCase());
                        if (sch.serverName()!="test.rise.ubc.ca") {
                            wom.log("Web Service Call: Check that web address of RISe is test.rise.ubc.ca instead of [" + sch.serverName() +"]");
                        }
                        else {
                        }
                        if (strWebService != "http://esirius3gtest.as.it.ubc.ca/esirius3g/") {
                            wom.log("Web Service Call: Check that webservice is http://esirius3gtest.as.it.ubc.ca/esirius3g/ instead of [" + strWebService +"]");
                        }
                        else {
                        }
                    } else {
                        wom.log("Web Service Call: Web service not called.");
                    }
                }

                //Sample returned JSON
                //txtJSONReturnMessage = '{"success":"false","message":"Invalid Record Type: PROTOCOL"}';
                //txtJSONReturnMessage = '{"success":"false","message":"Required field [D_APPROVE] is missing"}';
                //txtJSONReturnMessage = '{"success":"false","message":"Housing Location [null] is not established in eSirius3G"}';
                //txtJSONReturnMessage = '{"success":"false","message":"Connectivity error: [Oracle][ODBC][Ora]ORA-02291: integrity constraint (ESIRIUS3GUBC.RELATION_363) violated - parent key not found"}';
                //txtJSONReturnMessage = '{"success":"false","message":"Required field [STRAIN] is missing"}';
                //txtJSONReturnMessage = '{"success":"false","message":"New Protocol already exists in eSirius3G"}';
                //txtJSONReturnMessage = '{"success":"true"}';

                wom.log("Message JSON from eSirius: " + txtJSONReturnMessage);

                if ( txtJSONReturnMessage == null || txtJSONReturnMessage.length == 0 ) {
                    txtJSONReturnMessage = '{"success":"false","message":"No JSON to process"}';
                    wom.log("No JSON to process from webservice call");
                }
                else if ( txtJSONReturnMessage.substring(0,1) != '{' ) {
                    // Not a valid JSON error message. For evaluating a string to JSON need to replace carriage returns and line feeds.
                    txtJSONReturnMessage = '{"success":"false","message":"' + txtJSONReturnMessage.replace(/[\r\n|\n|\r|\t]/gm,' ') + '"}';
                    wom.log("Repackage proxy dll error to be a proper JSON: " + txtJSONReturnMessage);
                }
                else {
                    txtJSONReturnMessage = txtJSONReturnMessage.replace(/[\r\n|\n|\r|\t]/gm,' ');
                    wom.log("Remove proxy dll line feed error to be a proper JSON: " + txtJSONReturnMessage);
                }

                // What happens if txtJSON is not a valid string. Does eval throw an error?
                // - FH - 20130524
                objJSON = eval("(" + txtJSONReturnMessage + ")");
                strReturn = "objJSON success[" + objJSON.success + "] message[" + objJSON.message + "]";

                if (objJSON.success == "true") {
                    ProtocolEntity.setQualifiedAttribute("customAttributes._attribute320.customAttributes.UploadedToACS", true);
                }
                else {
                    ProtocolEntity.setQualifiedAttribute("customAttributes._attribute320.customAttributes.UploadedToACS", false);
                    throw(new Error(-1, "ACS Data transfer error: "+objJSON.message+", please contact Site Manager for this issue"));
                }
            }
        }

        return strReturn;
    }
    catch (e) {
        wom.log("EXCEPTION CustomUtils.pushAnimalCareServicesProtocolAdministration: " + e.description);
        ProtocolEntity.setQualifiedAttribute("customAttributes._attribute320.customAttributes.UploadedToACS", false);

        var currentDate = new Date();
        var To = "fred.helm@ubc.ca; david.yeung@ubc.ca";
        //var Cc = "david.yeung@ors.ubc.ca";
        var Cc = "";
        var From = "david.yeung@ors.ubc.ca";
        var Subject = "eSirius data push for Administration "+ProtocolID;
        var HTMLBody = "Automatic generated email to transfer data from eSirius to RISe. " + e.description;
        var objMail = CustomUtils.sendEmailCDO(To, Cc, null, From, Subject, HTMLBody, null, null);

        objMail.Send();
        objMail = null;

        //DY: 2013.11.26
        //Change the logic to throw the error
        //This will affect the ACS Administration activity
        //And a few State Transitions including SBO from Approved to Expired/Terminated
        //DY: 2014.02.07
        //Change the logic again to NOT throw the error
        //Reason: some PI is inactivating a pre-submit protocol and is giving error
        //because protocol does not exist in eSirius
        //throw(e);
    }
}

function pushAnimalCareServicesProtocolAnimalOrderedBalance(ProtocolID)
{
    try {
        //dy 2013.10.21: only run the webservices call if enable
        //if eSiriusWebSerivceEnable is false, exit (return) the function
        if (!customutils.eSiriusWebSerivceEnable) return;

        wom.log("+++++++++++++++++++++++++++++++++++++++++++ Point 1: pushAnimalCareServicesProtocolAnimalOrderedBalance: "+ProtocolID);
        var strReturn = "Hello World";
        //var strWebService = "http://esiriusapi.ntmcs.com/eSirius3gUBC/";
        var strWebService = customutils.eSiriusWebServiceURL.toLowerCase();
        var strWebMethod = "esApiProtocolUpdate.wc?";
        var txtJSON = "";
        var txtJSONLog = "";
        var txtJSONReturnMessage = "";
        var objJSON = null;
        var ProtocolEntitySet = null;
        var ProtocolEntity = null;
        var ProtocolStartDate;
        var sch = wom.getContext("_ScriptingContextHelper"); //Get the ServerVariables

        ProtocolEntitySet = getResultSet("_Protocol").query("ID='"+ProtocolID+"'");
        if ( ProtocolEntitySet.elements().count() > 0 ) {
            ProtocolEntity = ProtocolEntitySet.elements().item(1);
            if (ProtocolEntity != null) {
                //Xin 2014.07.08 Xin Changed to use new function pushACSProtocolJSON
                txtJSON = CustomUtils.pushACSProtocolJSON( ProtocolID, "Reset" );
                txtJSONLog = customUtils.clearAnimalCareServicesJSONCredentials(txtJSON);
                wom.log("txtJSON: " + txtJSONLog);

                //ProtocolEntity.setQualifiedAttribute("customAttributes._attribute320.customAttributes.SentToACSJSON", txtJSONLog);
                //change to add the old JSON
                //Assumption is that the protocol has already been pushed to eSirius and that RISe has recorded the JSON string
                //sent to eSirius.  If RISe fails to record the JSON string then the assumption is that the protocol
                //was not pushed over to eSirius and the appending JSON code will fail because oldTxtJSONLog
                //will be NULL and concatenating a NULL string will cause an error.  But we have bigger problems. - FH - 2014-Feb-06
                var oldTxtJSONLog = ProtocolEntity.getQualifiedAttribute("customAttributes._attribute320.customAttributes.SentToACSJSON");
                ProtocolEntity.setQualifiedAttribute("customAttributes._attribute320.customAttributes.SentToACSJSON", oldTxtJSONLog+txtJSONLog);

                if ( (sch.serverName().toLowerCase() == "rise.ubc.ca"      && strWebService == "https://esirius3g.as.it.ubc.ca/esirius3g/"   ) ||
                    (sch.serverName().toLowerCase() == "test.rise.ubc.ca" && strWebService == "http://esirius3gtest.as.it.ubc.ca/esirius3g/")
                    ) {
                    //call the webservice only if this code is running in the production
                    //environment. - FH - May 16, 2013

                    //strWebService = CustomUtils.eSiriusWebServiceURL;
                    //call the webservice
                    wom.log("Web Service Call: " + strWebService + strWebMethod + txtJSONLog);
                    txtJSONReturnMessage = CustomUtils.pushRISeDataToeSirius(strWebService, strWebMethod, txtJSON, CustomUtils.eSiriusWebServiceDebug);
                }
                else {
                    if (sch.serverName()=="rise.ubc.ca") {
                        wom.log("Web Service Call: Web service not called.");
                        if (sch.serverName()=="rise.ubc.ca") {
                            wom.log("Web Service Call: Check that web address of RISe is rise.ubc.ca instead of [" + sch.serverName() + "]");
                        }
                        else {
                        }
                        if (strWebService != "https://esirius3g.as.it.ubc.ca/esirius3g/") {
                            wom.log("Web Service Call: Check that webservice is https://esirius3g.as.it.ubc.ca/esirius3g/ instead of [" + strWebService + "]");
                        }
                        else {
                        }
                    } else if (sch.serverName()=="test.rise.ubc.ca") {
                        wom.log("Web Service Call: Web service not called. Server: "+sch.serverName().toLowerCase());
                        if (sch.serverName()!="test.rise.ubc.ca") {
                            wom.log("Web Service Call: Check that web address of RISe is test.rise.ubc.ca instead of [" + sch.serverName() +"]");
                        }
                        else {
                        }
                        if (strWebService != "http://esirius3gtest.as.it.ubc.ca/esirius3g/") {
                            wom.log("Web Service Call: Check that webservice is http://esirius3gtest.as.it.ubc.ca/esirius3g/ instead of [" + strWebService +"]");
                        }
                        else {
                        }
                    } else {
                        wom.log("Web Service Call: Web service not called.");
                    }
                }

                //Sample returned JSON
                //txtJSONReturnMessage = '{"success":"false","message":"Invalid Record Type: PROTOCOL"}';
                //txtJSONReturnMessage = '{"success":"false","message":"Required field [D_APPROVE] is missing"}';
                //txtJSONReturnMessage = '{"success":"false","message":"Housing Location [null] is not established in eSirius3G"}';
                //txtJSONReturnMessage = '{"success":"false","message":"Connectivity error: [Oracle][ODBC][Ora]ORA-02291: integrity constraint (ESIRIUS3GUBC.RELATION_363) violated - parent key not found"}';
                //txtJSONReturnMessage = '{"success":"false","message":"Required field [STRAIN] is missing"}';
                //txtJSONReturnMessage = '{"success":"false","message":"New Protocol already exists in eSirius3G"}';
                //txtJSONReturnMessage = '{"success":"true"}';

                wom.log("Message JSON from eSirius: " + txtJSONReturnMessage);

                if ( txtJSONReturnMessage == null || txtJSONReturnMessage.length == 0 ) {
                    txtJSONReturnMessage = '{"success":"false","message":"No JSON to process"}';
                    wom.log("No JSON to process from webservice call: " + txtJSONReturnMessage);
                }
                else if ( txtJSONReturnMessage.substring(0,1) != '{' ) {
                    // Not a valid JSON error message. For evaluating a string to JSON need to replace carriage returns and line feeds.
                    txtJSONReturnMessage = '{"success":"false","message":"' + txtJSONReturnMessage.replace(/[\r\n|\n|\r|\t]/gm,' ') + '"}';
                    wom.log("Repackage proxy dll error to be a proper JSON: " + txtJSONReturnMessage);
                }
                else {
                    txtJSONReturnMessage = txtJSONReturnMessage.replace(/[\r\n|\n|\r|\t]/gm,' ');
                    wom.log("Remove proxy dll line feed error to be a proper JSON: " + txtJSONReturnMessage);
                }

                objJSON = eval("(" + txtJSONReturnMessage + ")");
                wom.log("after eval");
                strReturn = "objJSON success[" + objJSON.success + "] message[" + objJSON.message + "]";
                wom.log(strReturn);

                if (objJSON.success == "true") {
                    ProtocolEntity.setQualifiedAttribute("customAttributes._attribute320.customAttributes.UploadedToACS", true);

                    //Copy the JSON to the other versions of this protocol ex A__-____-003 etc.
                    CustomUtils.pushAnimalCareServicesProtocolAdjustSentToJSONHistory( ProtocolID );
                }
                else {
                    ProtocolEntity.setQualifiedAttribute("customAttributes._attribute320.customAttributes.UploadedToACS", false);
                    throw(new Error(-1, "ACS Data transfer error: "+objJSON.message+", please contact Site Manager for this issue"));
                }
            }
        }

        return strReturn;
    }
    catch (e) {
        wom.log("EXCEPTION CustomUtils.pushAnimalCareServicesProtocolAnimalOrderedBalance: " + e.description);
        ProtocolEntity.setQualifiedAttribute("customAttributes._attribute320.customAttributes.UploadedToACS", false);

        var currentDate = new Date();
        var To = "fred.helm@ubc.ca; david.yeung@ubc.ca";
        //var Cc = "david.yeung@ors.ubc.ca";
        var Cc = "";
        var From = "david.yeung@ors.ubc.ca";
        var Subject = "eSirius data push for Reset "+ProtocolID;
        var HTMLBody = "Automatic generated email to transfer data from eSirius to RISe. " + e.description;
        var objMail = CustomUtils.sendEmailCDO(To, Cc, null, From, Subject, HTMLBody, null, null);

        /*
         objMail.AddAttachment (fileName1);
         objMail.AddAttachment (fileName2);
         objMail.AddAttachment (fileName3);
         objMail.AddAttachment (fileName4);
         objMail.AddAttachment (fileName5);
         objMail.AddAttachment (fileName6);
         */
        objMail.Send();
        objMail = null;
        //Don't throw an error because we want to have the approved activity to complete.
        //If the protocol did not get pushed, a nightly SBO job will pick up this protocol
        //and resubmit it.
        //throw(e);
    }
}

function pushAnimalCareServicesProtocolJSON(ProtocolID, ProjectType)
{
    try {
        //wom.log("+++++++++++++++++++++++++++++++++++++++++++ Point 1");
        var strReturn = "Hello World";

        //Input parameter
        //var ProtocolID = "A10-0167";  //Research, Single Species
        //var ProtocolID = "A07-0109";  //Research, Multiple Species
        //var ProtocolID = "A10-0085";
        //var ProjectType = "Protocol";

        //Temporary Holding Variables
        var ProtocolEntitySet = null;
        var ProtocolEntity = null;
        var PrincipalInvestigatorEntity = null;
        var ApprovedAnimalsUsedEntitySet = null;
        var ApprovedAnimalsUsedEntity = null;
        var AnimalInformationEntitySet = null;
        var AnimalInformationEntity = null;

        var BreedingApplicationsEntity = null;
        var AnimalInformationBreedingEntitySet = null;
        var AnimalInformationBreedingEntity = null;

        var CCACCategoryEntity = null;
        var TypeofApplicationEntity = null;
        var CompanyEntity = null;

        //Outputs
        var txtJSON = "";
        var ApplicationNumber = "";
        var ProtocolName = "";
        var UserId = "";
        var FirstName = "";
        var LastName = "";
        var Email = "";
        var StudyStartDate = "";
        var StudyEndDate = "";
        var ExpirationDate = "";
        var ApprovalDate = "";

        var CCACCategoryEntity = null;
        var TypeofApplication = null;

        var CompanyID = "";
        var InstitutionName = "";
        var InstitutionID = "";
        var FacultyName = "";
        var FacultyID = "";
        var DepartmentName = "";
        var DepartmentID = "";
        var DivisionName = "";
        var DivisionID = "";

        var ProjectStatus = "";
        var TerminatedProtocolNumber = "";

        //ACS must stored this value to be sent back to RISe
        //var ApprovedAnimalsUsedID = "";

        var NumberofAnimalsApproved = -1;
        var Strain = "";
        var SpeciesID = "";
        var SpeciesName = "";
        var HousingLocationCode = "";
        var HousingLocationID = "";
        var HousingLocationName = "";

        //These variables are only required for sending over the animals used to eSirius
        var	bSpeciesChanged = false;
        var	prevSpeciesID = "";

        //var txtUser = 'NTMCS';
        var txtUser = customutils.eSiriusWebServiceLogin;
        //var txtPassword = 'hello';
        var txtPassword = customutils.eSiriusWebServicePassword;

        ProtocolEntitySet = getResultSet("_Protocol").query("ID='"+ProtocolID+"'");

        wom.log("+++++++++++++++++++++++++++++++++++++++++++ Point 2");

        if ( ProtocolEntitySet.elements().count() > 0 ) {
            strReturn = "Protocol Found";

            // Only expecting 1 protocol record
            ProtocolEntity = ProtocolEntitySet.elements().item(1);
            ApplicationNumber = ProtocolEntity.getQualifiedAttribute("customAttributes._attribute307");

            Name = ProtocolEntity.name;
            wom.log("+++++++++++++++++++++++++++++++++++++++++++ Point 2.1");

            StudyStartDate = new Date(ProtocolEntity.getQualifiedAttribute("customAttributes._attribute271"));
            wom.log("+++++++++++++++++++++++++++++++++++++++++++ Point 2.2");

            strYear = String(StudyStartDate.getFullYear())
            nMonth = StudyStartDate.getMonth()+1;
            if ( nMonth<10 ) {
                strMonth = "0" + String(nMonth);
            }
            else {
                strMonth = String(nMonth);
            }
            if ( StudyStartDate.getDate()<10 ) {
                strDay = "0" + String(StudyStartDate.getDate());
            }
            else {
                strDay = String(StudyStartDate.getDate());
            }
            StudyStartDate = strMonth + '/' + strDay + '/' + strYear;
            wom.log("+++++++++++++++++++++++++++++++++++++++++++ Point 2.3");

            StudyEndDate = new Date(ProtocolEntity.getQualifiedAttribute("customAttributes._attribute272"));
            strYear = String(StudyEndDate.getFullYear())
            nMonth = StudyEndDate.getMonth()+1;
            if ( nMonth<10 ) {
                strMonth = "0" + String(nMonth);
            }
            else {
                strMonth = String(nMonth);
            }
            if ( StudyEndDate.getDate()<10 ) {
                strDay = "0" + String(StudyEndDate.getDate());
            }
            else {
                strDay = String(StudyEndDate.getDate());
            }
            StudyEndDate = strMonth + '/' + strDay + '/' + strYear;
            wom.log("+++++++++++++++++++++++++++++++++++++++++++ Point 2.4");

            ExpirationDate = new Date(ProtocolEntity.getQualifiedAttribute("customAttributes._attribute141"));
            strYear = String(ExpirationDate.getFullYear())
            nMonth = ExpirationDate.getMonth()+1;
            if ( nMonth<10 ) {
                strMonth = "0" + String(nMonth);
            }
            else {
                strMonth = String(nMonth);
            }
            if ( ExpirationDate.getDate()<10 ) {
                strDay = "0" + String(ExpirationDate.getDate());
            }
            else {
                strDay = String(ExpirationDate.getDate());
            }
            ExpirationDate = strMonth + '/' + strDay + '/' + strYear;
            wom.log("+++++++++++++++++++++++++++++++++++++++++++ Point 2.5");

            ApprovalDate = new Date(ProtocolEntity.getQualifiedAttribute("customAttributes._attribute154"));
            strYear = String(ApprovalDate.getFullYear())
            nMonth = ApprovalDate.getMonth()+1;
            if ( nMonth<10 ) {
                strMonth = "0" + String(nMonth);
            }
            else {
                strMonth = String(nMonth);
            }
            if ( ApprovalDate.getDate()<10 ) {
                strDay = "0" + String(ApprovalDate.getDate());
            }
            else {
                strDay = String(ApprovalDate.getDate());
            }
            ApprovalDate = strMonth + '/' + strDay + '/' + strYear;
            wom.log("+++++++++++++++++++++++++++++++++++++++++++ Point 2.6");

        }
        else {
            strReturn = "Protocol Not Found";
            return strReturn;
        }

        wom.log("+++++++++++++++++++++++++++++++++++++++++++ Point 3");

        PrincipalInvestigatorEntity = ProtocolEntity.getQualifiedAttribute("customAttributes._attribute0");

        if (PrincipalInvestigatorEntity != null) {
            strReturn = "PI Found";

            UserId = isNull(PrincipalInvestigatorEntity.userId,"");
            FirstName = isNull(PrincipalInvestigatorEntity.firstName,"");
            LastName = isNull(PrincipalInvestigatorEntity.lastName,"");
            Email = isNull(PrincipalInvestigatorEntity.getQualifiedAttribute("contactInformation.emailPreferred.eMailAddress"),"");

        }
        else {
            strReturn = "No PI Found";
        }

        wom.log("+++++++++++++++++++++++++++++++++++++++++++ Point 4");

        CCACCategoryEntity = ProtocolEntity.getQualifiedAttribute("customAttributes._attribute163");
        if (CCACCategoryEntity != null) {
            strReturn = "Category of Invasiveness Found";

            CCACCategory = isNull(CCACCategoryEntity.getQualifiedAttribute("customAttributes._attribute1"),"");

        }
        else {
            strReturn = "No Category of Invasiveness Found";
        }

        wom.log("+++++++++++++++++++++++++++++++++++++++++++ Point 4.1");

        CompanyEntity = ProtocolEntity.getQualifiedAttribute("company");

        if (CompanyEntity != null) {
            strReturn = "Company Found";

            CompanyID = CompanyEntity.ID;
            orgType = CompanyEntity.getQualifiedAttribute("customAttributes._attribute3");

            if (orgType=="Division") {
                DivisionID = CompanyID;
                DepartmentID = CompanyID.substr(0,7) + '000';
                FacultyID = CompanyID.substr(0,4) + '000000';
                InstitutionID = CompanyID.substr(0,2) + '00000000';
            } else if (orgType=="Department") {
                DivisionID = "";
                DepartmentID = CompanyID.substr(0,7) + '000';
                FacultyID = CompanyID.substr(0,4) + '000000';
                InstitutionID = CompanyID.substr(0,2) + '00000000';
            } else if (orgType=="Faculty") {
                DivisionID = "";
                DepartmentID = "";
                FacultyID = CompanyID.substr(0,4) + '000000';
                InstitutionID = CompanyID.substr(0,2) + '00000000';
            } else if (orgType=="Institution") {
                DivisionID = "";
                DepartmentID = "";
                FacultyID = "";
                InstitutionID = CompanyID.substr(0,2) + '00000000';
            }

            InstitutionName = CompanyEntity.getInstitution();
            FacultyName = CompanyEntity.getFaculty();
            DepartmentName = CompanyEntity.getDepartment();
            DivisionName = CompanyEntity.getDivision();
        }
        else {
            strReturn = "No Company Found";
        }

        wom.log("+++++++++++++++++++++++++++++++++++++++++++ Point 4.3");
        //DY: 2014.03.26 - Using a Mapping State instead (For Conditional Approval Project)
        //ProjectStatus = isNull(ProtocolEntity.getQualifiedAttribute("status.ID"),"");
        ProjectStatus = isNull(ProtocolEntity.getQualifiedAttribute("status.customAttributes.MappingState"),"");

        wom.log("+++++++++++++++++++++++++++++++++++++++++++ Point 4.4");
        TerminatedProtocolNumber = isNull(ProtocolEntity.getQualifiedAttribute("customAttributes._attribute323"),"");
        TerminatedProtocolNumber = ""; //Currently do not want to send Continuation Emails from eSirius - FH - 2014-Feb-05

        wom.log("+++++++++++++++++++++++++++++++++++++++++++ Point 4.5");

        if (ProjectType == "Edits") {

            txtJSON = '[';
            txtJSON += '{';
            txtJSON += '"record_type":"' + ProjectType + '"';
            txtJSON += ',"rise_userid":"'+txtUser+'"'
            txtJSON += ',"rise_pwd":"'+txtPassword+'"'
            txtJSON += ',"prot_no":"' + ApplicationNumber + '"';
            txtJSON += ',"prot_title":"' + Name + '"';
            txtJSON += ',"d_approve":"' + ApprovalDate + '"';
            txtJSON += ',"d_start":"' + StudyStartDate + '"';
            txtJSON += ',"d_expire":"' + ExpirationDate + '"';
            txtJSON += ',"co_id":"' + UserId + '"';
            txtJSON += ',"fst_nm":"' + FirstName + '"';
            txtJSON += ',"lst_nm":"' + LastName + '"';
            txtJSON += ',"email_id":"' + Email + '"';
            txtJSON += ',"sp_nm":"' + SpeciesName + '"';
            txtJSON += ',"sp_id":"' + SpeciesID + '"';
            txtJSON += ',"pain_level":"' + CCACCategory + '"';
            txtJSON += ',"strain":"'+ Strain +'"';
            txtJSON += ',"fclty_cd":"'+ HousingLocationCode + '"';
            txtJSON += ',"num":"'+ NumberofAnimalsApproved + '"';
            txtJSON += ',"tp_use":"' + TypeofApplication + '"';
            txtJSON += ',"status":"'+ ProjectStatus + '"';
            txtJSON += ',"prev_prot_no":"'+ TerminatedProtocolNumber + '"';
            txtJSON += ',"inst_id":"'+ InstitutionID + '"';
            txtJSON += ',"inst_nm":"'+ InstitutionName + '"';
            txtJSON += ',"faculty_id":"'+ FacultyID + '"';
            txtJSON += ',"faculty_nm":"'+ FacultyName + '"';
            txtJSON += ',"dept_id":"'+ DepartmentID + '"';
            txtJSON += ',"dept_nm":"'+ DepartmentName + '"';
            txtJSON += ',"div_id":"'+ DivisionID + '"';
            txtJSON += ',"div_nm":"'+ DivisionName + '"';
            txtJSON += '}';
            txtJSON += ']';

            return txtJSON;
        }

        TypeofApplicationEntity = ProtocolEntity.getQualifiedAttribute("customAttributes._attribute195");
        if (TypeofApplicationEntity != null) {
            strReturn = "Type of Application Found";

            TypeofApplication = TypeofApplicationEntity.getQualifiedAttribute("customAttributes._attribute0");

        }
        else {
            strReturn = "No Type of Application Found";
        }
        wom.log("+++++++++++++++++++++++++++++++++++++++++++ Point 4.6");
        wom.log("TypeofApplication["+TypeofApplication+"]");

        SpeciesID = "";
        SpeciesName = "";
        Strain = "";
        HousingLocationCode = "";
        NumberofAnimalsApproved = "";

        if (TypeofApplication=="Breeding") {
            //Breeding Applications
            //customAttributes._attribute330 //Animal View 4 - Breeding Applications

            AnimalInformationEntitySet = ProtocolEntity.getQualifiedAttribute("customAttributes._attribute330.customAttributes._attribute5");
        }
        else {
            //Non-Breeding Application
            //customAttributes._attribute329 //Animal View 4 - Animal Information

            AnimalInformationEntitySet = ProtocolEntity.getQualifiedAttribute("customAttributes._attribute329.customAttributes._attribute9");
        }

        wom.log("+++++++++++++++++++++++++++++++++++++++++++ Point 4.9.1");
        if (AnimalInformationEntitySet == null || AnimalInformationEntitySet.elements().count() == 0) {
            wom.log("+++++++++++++++++++++++++++++++++++++++++++ Point 4.9.2");
            strReturn = "No Animal Information Found";

        }
        else {
            strReturn = "Animal Information Found";

            wom.log("+++++++++++++++++++++++++++++++++++++++++++ Point 5");
            AnimalInformationEntitySet = AnimalInformationEntitySet.sort("customAttributes._attribute0.ID",105,1).elements();

            //These variables are initialize here for readability. Values should not have changed
            //since being declared.
            bSpeciesChanged = false;
            prevSpeciesID = "";

            for (var j=1; j<=AnimalInformationEntitySet.count(); j++) {
                wom.log("+++++++++++++++++++++++++++++++++++++++++++ Point 5."+j);

                //Get the AnimalInformation record
                AnimalInformationEntity = AnimalInformationEntitySet(j);

                SpeciesID = AnimalInformationEntity.getQualifiedAttribute("customAttributes._attribute0.ID");
                if (j==1 || SpeciesID != prevSpeciesID) {
                    //Detected a species changed
                    bSpeciesChanged = true;
                    prevSpeciesID = SpeciesID;
                }
                SpeciesName = isNull(AnimalInformationEntity.getQualifiedAttribute("customAttributes._attribute0.customAttributes._attribute0"),"");

                if (TypeofApplication=="Breeding") {
                    Strain = isNull(AnimalInformationEntity.getQualifiedAttribute("customAttributes._attribute12"),"");
                    HousingLocationCode = isNull(AnimalInformationEntity.getQualifiedAttribute("customAttributes._attribute4.customAttributes.LocationCode"),"");
                    NumberofAnimalsApproved = AnimalInformationEntity.getQualifiedAttribute("customAttributes._attribute1");
                }
                else {
                    Strain = isNull(AnimalInformationEntity.getQualifiedAttribute("customAttributes._attribute8"),"");
                    HousingLocationCode = isNull(AnimalInformationEntity.getQualifiedAttribute("customAttributes._attribute3.customAttributes.LocationCode"),"");
                    NumberofAnimalsApproved = AnimalInformationEntity.getQualifiedAttribute("customAttributes._attribute2");
                }

                if (ProjectType == "Reset") {
                    //Impersonate the Number of Animals Approved with Actual number of animals already ordered and
                    //record this number on the first instance of the species. All other instances will be 0.
                    //This code is here only for the initial load of animals used into eSirius. Code can be removed
                    //once esirius is fully live as there will be no reason to send over the animals used from RISe
                    //as eSirius is the system of record for animals used (ordered). - FH - 20130828.
                    Strain = "" // Strain is not tracked in eSirius on initial load

                    if (bSpeciesChanged) {
                        NumberofAnimalsApproved = CustomUtils.pushAnimalCareServicesGetAnimalsUsed( ProtocolID, SpeciesID );
                        bSpeciesChanged = false;
                    }
                    else {
                        NumberofAnimalsApproved = 0;
                    }
                }

                wom.log("+++++++++++++++++++++++++++++++++++++++++++ Point 7."+j);
                if (j==1) {
                    txtJSON = '[';
                }

                txtJSON += '{';
                txtJSON += ' "record_type":"' + ProjectType + '"';
                txtJSON += ',"rise_userid":"'+txtUser+'"'
                txtJSON += ',"rise_pwd":"'+txtPassword+'"'
                txtJSON += ',"prot_no":"' + ApplicationNumber + '"';
                txtJSON += ',"prot_title":"' + Name + '"';
                txtJSON += ',"d_approve":"' + ApprovalDate + '"';
                txtJSON += ',"d_start":"' + StudyStartDate + '"';
                txtJSON += ',"d_expire":"' + ExpirationDate + '"';
                txtJSON += ',"co_id":"' + UserId + '"';
                txtJSON += ',"fst_nm":"' + FirstName + '"';
                txtJSON += ',"lst_nm":"' + LastName + '"';
                txtJSON += ',"email_id":"' + Email + '"';
                txtJSON += ',"sp_nm":"' + SpeciesName + '"';
                txtJSON += ',"sp_id":"' + SpeciesID + '"';
                txtJSON += ',"pain_level":"' + CCACCategory + '"';
                txtJSON += ',"strain":"'+ Strain +'"';
                txtJSON += ',"fclty_cd":"'+ HousingLocationCode + '"';
                txtJSON += ',"num":"'+ NumberofAnimalsApproved + '"';
                txtJSON += ',"tp_use":"' + TypeofApplication + '"';
                txtJSON += ',"status":"'+ ProjectStatus + '"';
                txtJSON += ',"prev_prot_no":"'+ TerminatedProtocolNumber + '"';
                txtJSON += ',"inst_id":"'+ InstitutionID + '"';
                txtJSON += ',"inst_nm":"'+ InstitutionName + '"';
                txtJSON += ',"faculty_id":"'+ FacultyID + '"';
                txtJSON += ',"faculty_nm":"'+ FacultyName + '"';
                txtJSON += ',"dept_id":"'+ DepartmentID + '"';
                txtJSON += ',"dept_nm":"'+ DepartmentName + '"';
                txtJSON += ',"div_id":"'+ DivisionID + '"';
                txtJSON += ',"div_nm":"'+ DivisionName + '"';
                txtJSON += '}';

                if (j==AnimalInformationEntitySet.count()) {
                    txtJSON += ']';
                }
                else {
                    txtJSON += ',';
                }
                wom.log("+++++++++++++++++++++++++++++++++++++++++++ Point 8."+j);

            }
        }

        //strReturn = TypeofApplication;
        strReturn = txtJSON;
        wom.log("dump json string");
        wom.log(txtJSON);
        return strReturn;
    }
    catch (e) {
        wom.log("EXCEPTION CustomUtils.pushAnimalCareServicesProtocolJSON: " + e.description);
        throw(e);
    }
}
