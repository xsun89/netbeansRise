/**
 * Created by sun38 on 7/24/2014.
 */
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
            || true
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
