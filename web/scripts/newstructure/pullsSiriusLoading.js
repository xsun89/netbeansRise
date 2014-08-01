//dy: 2013.06.19: pull the animal information back from eSirius
//CustomUtils.pullAnimalCareServicesOrderHistoryJSON(ProtocolID, "06/12/2013", "06/18/2013");
function pullsSiriusLoading(startDate, ) {
    //var yesterdayDate = DateForQuery();
    var txtJSON_ID = null;
    var bRecordWebServiceCallToLog = true;
    try {

        txtJSON_ID = CustomUtils.pullAnimalCareServicesOrderHistoryJSON("A%", yesterdayDate, yesterdayDate, bRecordWebServiceCallToLog);

    }
    catch (e) {

        var currentDate = new Date();
        var To = "fred.helm@ubc.ca; david.yeung@ubc.ca";
        var Cc = "";
        var From = "david.yeung@ors.ubc.ca";
        var Subject = "eSirius data pull for" + currentDate + " in person activity Pull Data From ACS";
        var HTMLBody = "Automatic generated email to transfer data from eSirius to RISe. Webservice Call failed. " + e.description;
        var objMail = CustomUtils.sendEmailCDO(To, Cc, null, From, Subject, HTMLBody, null, null);

        objMail.Send();
        objMail = null;

    }

    try {
        //Xin 2014.07.10 Changed
        CustomUtils.pullACSOrderHistory(txtJSON_ID);
    }
    catch (e) {

        var currentDate = new Date();
        var To = "fred.helm@ubc.ca; david.yeung@ubc.ca";
        var Cc = "";
        var From = "david.yeung@ors.ubc.ca";
        var Subject = "eSirius data pull for" + currentDate + " in person activity Pull Data From ACS";
        var HTMLBody = "Automatic generated email to transfer data from eSirius to RISe. " + e.description;
        var objMail = CustomUtils.sendEmailCDO(To, Cc, null, From, Subject, HTMLBody, null, null);

        objMail.Send();
        objMail = null;
        throw(new Error(-1, e.description));

    }

    function DateForQuery() {
        var mydate = new Date();
        mydate.setDate(mydate.getDate() - 1);

        var strYear = String(mydate.getFullYear());
        var strMonth;
        var strDay;
        var nMonth = mydate.getMonth() + 1;
        if (nMonth < 10) {
            strMonth = "0" + String(nMonth);
        }
        else {
            strMonth = String(nMonth);
        }
        if (mydate.getDate() < 10) {
            strDay = "0" + String(mydate.getDate());
        }
        else {
            strDay = String(mydate.getDate());
        }
        var currentDate = strMonth + '/' + strDay + '/' + strYear;
        return (currentDate);
    };

    function DateRangeForQuery(startDate, endDate) {
        var mydate = new Date();
        mydate.setDate(mydate.getDate() - 1);

        var strYear = String(mydate.getFullYear());
        var strMonth;
        var strDay;
        var nMonth = mydate.getMonth() + 1;
        if (nMonth < 10) {
            strMonth = "0" + String(nMonth);
        }
        else {
            strMonth = String(nMonth);
        }
        if (mydate.getDate() < 10) {
            strDay = "0" + String(mydate.getDate());
        }
        else {
            strDay = String(mydate.getDate());
        }
        var currentDate = strMonth + '/' + strDay + '/' + strYear;
        return (currentDate);
    };

}
