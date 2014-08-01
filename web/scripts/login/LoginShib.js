function handleSubmit(sch, formEntity)
{
    try
    {
        var id = sch.form("webridge_number");
        //dy: 2013.11.29 Add Last Name as a initial login check
        var lastName = sch.form("lastName");
        wom.getSessionContext.putContextObject("RISeWebrID", id, true);
        var persons = getElements("PersonForID", "ID", id);
        //added by dy (apr 05)********************
        //var ticket = sch.querystring("ticket");
        var ticket = wom.getSessionContext.getContextObject("RISeTicket");
        //var CWLUserName = ExternalUBCXmlRpc.getPreferredName(ticket);
        var CWLUserName = wom.getSessionContext.getContextObject("RISeCWLUserName");
        var CWLUserID = wom.getSessionContext.getContextObject("CWLUserID");
        //****************************************

        if (persons.count()>0)
        {
            wom.log("CWL emp #: ?; RISe emp #: n; Login?: n --> using RISe #");
            //DY: 2013.11.29 Check if account is inactived or disabled
            var accountStatus = persons(1).getQualifiedAttribute("customAttributes._attribute25");
            var accountDisabled = persons(1).accountDisabled;
            if (accountStatus.indexOf("Active")==-1 || accountDisabled)
            {
                var To = "david.yeung@ors.ubc.ca";
                var From = "david.yeung@ors.ubc.ca";
                var Subject = "RISe Account is Inactived or Disabled";
                var MIMEFormatted= true; //MIME format
                var TextBody = "RISe Account is Inactived or Disabled!!(New User) \nCWL Username=" +CWLUserName+" \nCWL UserID(CWL): "+CWLUserID+" \nEmployee number(CWL): "+CWLEmpNum+" \nRISe Username=" +RISeUserName+" \nEmployee number(RISe): "+employeenumber+" \nID:"+persons(1).ID;
                var objMail = CustomUtils.sendEmailCDO(To, null, null, From, Subject, null, TextBody, MIMEFormatted);

                objMail.Send();
                objMail = null;

                sch.appendHtml("<DIV align=center><br><TABLE cellSpacing=0 cellPadding=0 width=650 border=0>");
                sch.appendHtml("<TBODY><TR><TD align=middle><IMG height=50 width=300 src=");
                sch.appendHTML(sch.fullUrlFromAssetUrl('Images/ubc_logo.gif'));
                sch.appendHtml("></TD></TR></TBODY></TABLE><BR><TABLE cellSpacing=0 cellPadding=0 width=650 border=0>");
                sch.appendHtml("<TBODY><TR><TD align=left><span class='Error'>Your account has been disabled.<BR>");
                sch.appendHtml("Please contact system administrator <a href='mailto:risesupport@ors.ubc.ca?subject=account has been disabled (CWL=" +CWLUserID+" and RISe="+persons(1).ID+")'>risesupport@ors.ubc.ca</a> and report the problem.</span>");
                sch.appendHtml("</TD></TR></TBODY></TABLE></DIV>");
                wom.log("CWL LOGIN: Account Disabled: CWL Username=" +CWLUserName+" CWL UserID(CWL): "+CWLUserID+" Employee number(CWL): "+CWLEmpNum+" RISe Username=" +RISeUserName+" Employee number(RISe): "+employeenumber+" ID:"+persons(1).ID);
                return false;
            }
            wom.getSessionContext.putContextObject("RISePerson", persons(1), true);
            // Added by DY (apr 05) *****************************
            var RISeUserName = persons(1).firstname.toUpperCase();
            RISeUserName += " ";
            RISeUserName += persons(1).lastname.toUpperCase();
            //DY: 2013.11.29 Compare the last name with User's input
            if (persons(1).lastname.toUpperCase()!=lastName.toUpperCase())
            {
                var To = "david.yeung@ors.ubc.ca";
                var From = "david.yeung@ors.ubc.ca";
                var Subject = "RISe Last Name not equal User Input";
                var MIMEFormatted= true; //MIME format
                var TextBody = "RISe Last Name not equal User Input!!(New User) \nCWL Username=" +CWLUserName+" \nCWL UserID(CWL): "+CWLUserID+" \nEmployee number(CWL): "+CWLEmpNum+" \nRISe Username=" +RISeUserName+" \nEmployee number(RISe): "+employeenumber+" \nID:"+persons(1).ID;
                var objMail = CustomUtils.sendEmailCDO(To, null, null, From, Subject, null, TextBody, MIMEFormatted);

                objMail.Send();
                objMail = null;

                sch.appendHtml("<DIV align=center><br><TABLE cellSpacing=0 cellPadding=0 width=650 border=0>");
                sch.appendHtml("<TBODY><TR><TD align=middle><IMG height=50 width=300 src=");
                sch.appendHTML(sch.fullUrlFromAssetUrl('Images/ubc_logo.gif'));
                sch.appendHtml("></TD></TR></TBODY></TABLE><BR><TABLE cellSpacing=0 cellPadding=0 width=650 border=0>");
                sch.appendHtml("<TBODY><TR><TD align=left><span class='Error'>There is an error when checking the identity.<BR>");
                sch.appendHtml("Please contact system administrator <a href='mailto:risesupport@ors.ubc.ca?subject=Error in checking the identity (CWL=" +CWLUserID+" and RISe="+persons(1).ID+")'>risesupport@ors.ubc.ca</a> and report the problem.</span>");
                sch.appendHtml("</TD></TR></TBODY></TABLE></DIV>");
                wom.log("CWL LOGIN: Wrong Last Name("+ lastName +"): CWL Username=" +CWLUserName+" CWL UserID(CWL): "+CWLUserID+" Employee number(CWL): "+CWLEmpNum+" RISe Username=" +RISeUserName+" Employee number(RISe): "+employeenumber+" ID:"+persons(1).ID);
                return false;
            }


//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//Moved here Dec 19, 2006
            var employeenumber=persons(1).getQualifiedAttribute("customAttributes._attribute23");
            var CWLEmpNum = wom.getSessionContext.getContextObject("RISeCWLEmpNum");

            //DY: 2013.11.29 If employee number exists in RISe, users need to login using faculty/staff account with Emp ID
            if (employeenumber!=null && CWLEmpNum==null)
            {
                var To = "david.yeung@ors.ubc.ca";
                var From = "david.yeung@ors.ubc.ca";
                var Subject = "Employee Number in RISe but not in CWL";
                var MIMEFormatted= true; //MIME format
                var TextBody = "Employee Number in RISe but not in CWL!!(New User) \nCWL Username=" +CWLUserName+" \nCWL UserID(CWL): "+CWLUserID+" \nEmployee number(CWL): "+CWLEmpNum+" \nRISe Username=" +RISeUserName+" \nEmployee number(RISe): "+employeenumber+" \nID:"+persons(1).ID;
                var objMail = CustomUtils.sendEmailCDO(To, null, null, From, Subject, null, TextBody, MIMEFormatted);

                objMail.Send();
                objMail = null;

                sch.appendHtml("<DIV align=center><br><TABLE cellSpacing=0 cellPadding=0 width=650 border=0>");
                sch.appendHtml("<TBODY><TR><TD align=middle><IMG height=50 width=300 src=");
                sch.appendHTML(sch.fullUrlFromAssetUrl('Images/ubc_logo.gif'));
                sch.appendHtml("></TD></TR></TBODY></TABLE><BR><TABLE cellSpacing=0 cellPadding=0 width=650 border=0>");
                sch.appendHtml("<TBODY><TR><TD align=left><span class='Error'>Please login with your CWL Faculty/Staff account.<BR>");
                sch.appendHtml("Please contact system administrator <a href='mailto:risesupport@ors.ubc.ca?subject=Error in checking the identity (CWL=" +CWLUserID+" and RISe="+persons(1).ID+")'>risesupport@ors.ubc.ca</a> and report the problem.</span>");
                sch.appendHtml("</TD></TR></TBODY></TABLE></DIV>");
                wom.log("CWL LOGIN: Emp # in RISe but not in CWL: CWL Username=" +CWLUserName+" CWL UserID(CWL): "+CWLUserID+" Employee number(CWL): "+CWLEmpNum+" RISe Username=" +RISeUserName+" Employee number(RISe): "+employeenumber+" ID:"+persons(1).ID);
                return false;

            }

            // Compare Employee # b/w CLW & RISe
            if (((employeenumber!=null && employeenumber!=""))&&((CWLEmpNum!=null)&&(CWLEmpNum!=""))&&(employeenumber!=CWLEmpNum)) //RISe emp# not equal CWL emp#
            {
                /*
                 var objMail = new ActiveXObject("CDONTS.NewMail");
                 objMail.To = "david.yeung@ors.ubc.ca";
                 objMail.From = "david.yeung@ors.ubc.ca";
                 objMail.Subject = "RISe employee number not equal CWL employee number";
                 objMail.Body = "RISe employee number not equal CWL employee number!!(New User) \nCWL Username=" +CWLUserName+" \nEmployee number(CWL): "+CWLEmpNum+" \nRISe Username=" +RISeUserName+" \nEmployee number(RISe): "+employeenumber+" \nID:"+persons(1).ID;
                 objMail.Send();
                 */
                /*
                 var iCfg=new ActiveXObject('CDO.Configuration');
                 iCfg.Fields.Item('http://schemas.microsoft.com/cdo/configuration/sendusing')=1;
                 iCfg.Fields.Item('http://schemas.microsoft.com/cdo/configuration/smtpserverpickupdirectory')='c:\\Inetpub\\mailroot\\pickup';
                 iCfg.Fields.Update();
                 var objMail = new ActiveXObject("CDO.Message");
                 objMail.Configuration=iCfg;
                 objMail.To = "david.yeung@ors.ubc.ca";
                 objMail.From = "david.yeung@ors.ubc.ca";
                 objMail.Subject = "RISe employee number not equal CWL employee number";
                 objMail.MIMEFormatted= true; //MIME format
                 objMail.TextBody = "RISe employee number not equal CWL employee number!!(New User) \nCWL Username=" +CWLUserName+" \nEmployee number(CWL): "+CWLEmpNum+" \nRISe Username=" +RISeUserName+" \nEmployee number(RISe): "+employeenumber+" \nID:"+persons(1).ID;
                 objMail.Send();
                 */
                var To = "david.yeung@ors.ubc.ca";
                var From = "david.yeung@ors.ubc.ca";
                var Subject = "RISe employee number not equal CWL employee number";
                var MIMEFormatted= true; //MIME format
                var TextBody = "RISe employee number not equal CWL employee number!!(New User) \nCWL Username=" +CWLUserName+" \nEmployee number(CWL): "+CWLEmpNum+" \nRISe Username=" +RISeUserName+" \nEmployee number(RISe): "+employeenumber+" \nID:"+persons(1).ID;
                var objMail = CustomUtils.sendEmailCDO(To, null, null, From, Subject, null, TextBody, MIMEFormatted);

                objMail.Send();
                objMail = null;

                sch.appendHtml("<DIV align=center><br><TABLE cellSpacing=0 cellPadding=0 width=650 border=0>");
                sch.appendHtml("<TBODY><TR><TD align=middle><IMG height=50 width=300 src=");
                sch.appendHTML(sch.fullUrlFromAssetUrl('Images/ubc_logo.gif'));
                sch.appendHtml("></TD></TR></TBODY></TABLE><BR><TABLE cellSpacing=0 cellPadding=0 width=650 border=0>");
                sch.appendHtml("<TBODY><TR><TD align=left><span class='Error'>There is an error when checking the identity.<BR>");
                sch.appendHtml("Please contact system administrator <a href='mailto:risesupport@ors.ubc.ca?subject=Error in checking the identity (CWL=" +CWLUserName+" and RISe="+persons(1).ID+")'>risesupport@ors.ubc.ca</a> and report the problem.</span>");
                sch.appendHtml("</TD></TR></TBODY></TABLE></DIV>");
                return false;
            }
//End Moved
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


            wom.getSessionContext.putContextObject("RISeUserName", RISeUserName, true);
            //Xin 2014.06.13 added
            wom.getSessionContext.putContextObject("RISeWebrID", webrID, true);
            wom.getSessionContext.putContextObject("CWLWebrID", webrID, true);

            if (CWLUserName == RISeUserName)
            {
                //go directly to the info page
                wom.log("CWL emp #: ?; RISe emp #: n; Login?: n --> using RISe #; name matches");
                //sch.redirectClientBrowser("./Login_UserInfo?webridge_number="+id+"&name="+RISeUserName+"&ticket="+ticket+"&cwl="+CWLUserName);
                sch.redirectClientBrowser("./Login_UserInfoShib");
            }
            else
            {
                //ask the user to confirm their identity
                wom.log("CWL emp #: ?; RISe emp #: n; Login?: n --> using RISe #; name not matches");
                //sch.redirectClientBrowser("./Login_Confirmation?webridge_number="+id+"&name="+RISeUserName+"&ticket="+ticket);
                sch.redirectClientBrowser("./Login_ConfirmationShib");
            }
            return sch.FormReturnValues.ABORT_REPAINT;
            //******************************************************

            /* These are the old codes
             // set webridgeID into CWL
             var ticket = sch.querystring("ticket");
             ExternalUBCXmlRpc.addIdentity(ticket, "webridge_number", id);

             // perform login
             var session = wom.getSessionContext();
             var svc = session.service("/Webridge/UserLoginServices")
             var useSecureSession = false;
             var redirectBrowser = true;
             svc.trustedLogin( useSecureSession, redirectBrowser, persons(1).userID,1);
             return sch.FormReturnValues.COMMIT_REPAINT;
             */
        }
        else
        {
            wom.log("Error in /CustomLayouts/CWL/Login: cannot find person ID as "+id);
            wom.putContext("error", "Cannot find your record!", true);
        }
    }
    catch(e)
    {
        wom.log("Exception in /CustomLayouts/CWL/Login: "+e.description);
        wom.putContext("error", "There is an error connecting your researcher number with your CWL account.  Typically this means your researcher number is already used by another user.  Please check the number again.  If it is right, please contact Administration at risesupport@ors.ubc.ca.", true);
    }
    return sch.FormReturnValues.ABORT_REPAINT;
}

function prerender(sch)
{
    // Xin 2014.06.13 change for Shibboleth integration Start
    //var ticket = sch.querystring("ticket");

    var ticket = sch.getServerVariable("HTTP_SHIB_SESSION_ID");
    if (ticket == null) {
        wom.log("*********************ticket is: null and is redirecting back to CWL login");
        if (sch.serverName() == "rise.ubc.ca") {
            sch.redirectClientBrowser("https://" + sch.serverName());
        }
        return false; //not render the rest of HTML
    }
    wom.getSessionContext.putContextObject("RISeTicket", ticket, true);

    var allAttr = sch.getServerVariable("ALL_HTTP");
    wom.log("allAttr=" + allAttr);

    //var webrID = ExternalUBCXmlRpc.getIdentity(ticket, "webridge_number");
    //var CWLUserName = ExternalUBCXmlRpc.getPreferredName(ticket);
    var CWLFirstName = sch.getServerVariable("HTTP_GIVENNAME");
    var CWLLastName = sch.getServerVariable("HTTP_SN");
    var CWLUserName = CWLFirstName.toUpperCase() + " " + CWLLastName.toUpperCase();
    wom.getSessionContext.putContextObject("RISeCWLUserName", CWLUserName, true);
    //var CWLEmpNum = ExternalUBCXmlRpc.getIdentity(ticket, "employee_number");
    var CWLEmpNum = sch.getServerVariable("HTTP_EMPLOYEENUMBER");
    wom.getSessionContext.putContextObject("RISeCWLEmpNum", CWLEmpNum, true);
    //var CWLUserID = ExternalUBCXmlRpc.getLoginName(ticket);
    var CWLUserID = sch.getServerVariable("HTTP_CWLLOGINNAME");
    wom.getSessionContext.putContextObject("CWLUserID", CWLUserID, true);
    var CWLPuID = sch.getServerVariable("HTTP_PUID");
    wom.getSessionContext.putContextObject("CWLPuID", CWLPuID, true);

    var persons;
    var loginPerson;
    var webrID;
    var personSet = ApplicationEntity.getResultSet("Person").query("customAttributes.CWLPuID='" + CWLPuID + "'");
    if ((personSet == null) || (personSet.elements().count() <= 0)) {
        personSet = ApplicationEntity.getResultSet("Person").query("customAttributes.CWLUsername='" + CWLUserID + "'");
    }

    if (personSet != null) {
        persons = personSet.elements();
        if (persons.count() > 0) {
            loginPerson = persons.item(1);
            webrID = loginPerson.ID;
            wom.getSessionContext.putContextObject("RISeWebrID", webrID, true);
            wom.getSessionContext.putContextObject("CWLWebrID", webrID, true);
        }
    }
    //var webrID = sch.getServerVariable("HTTP_WEBRIDGENUMBER");
    wom.log("*********************userID is: " + CWLUserID);
    wom.log("*********************webrID is: " + webrID);
    wom.log("*********************CWLUserName is: " + CWLUserName);
    wom.log("*********************CWLEmpNum is: " + CWLEmpNum);
    wom.log("*********************CWLPuID is: " + CWLPuID);
    // Xin 2014.06.13 Change End

    // redirect user to maintenance page****************

    var startDownTime = new Date("October 26, 2013 02:00:00");
    var endDownTime = new Date("October 26, 2013 12:00:00");
    var currentTime = new Date();
    if ((currentTime > startDownTime) && (currentTime < endDownTime))
    {
        //var ticket = sch.querystring("ticket");
        //var webrID = ExternalUBCXmlRpc.getIdentity(ticket, "webridge_number");
        //var webrID = sch.getServerVariable("HTTP_WEBRIDGENUMBER");
        //Vlad Franchuk: 23599
        //David Yeung: 23598
        //Deidra Casumpang: 25011
        //Snezana Milosevic: 31651
        //Fred Helm: 45245
        //Monika Garg: 22544
        //Xin Sun: 51469
        //Jonathan Lim: 51819
        //Sally Felkai: 47833
        if ((webrID!='23599')&&(webrID!='23598')&&(webrID!='35011')&&(webrID!='31651')&&(webrID!='22544')&&(webrID!='45245')&&(webrID!='51469')&&(webrID!='51819')&&(webrID!='47833'))
        {
            //sch.redirectClientBrowser("https://rise.ubc.ca/rise/Rooms/DisplayPages/LayoutInitial?Container=com.webridge.entity.Entity%5BOID%5B0D357FE77F70AC4A8009655207A1921B%5D%5D");
            sch.redirectClientBrowser("http://rise.ubc.ca/outage.asp");
            return false; //not render the rest of HTML
        }
    }

    // end of redirect *********************************

    if (sch.form("webridge_number")) {
        return true;
    }

    // for testing. delete later *********
    //if ((webrID == 23598) || (webrID == 300024))
    /*
     if (webrID == 23598)
     {
     //return true;
     if (webrID==23598){
     var RISeUserName="David H Yeung";
     }
     else
     {
     var RISeUserName="M. Garg";
     }
     sch.redirectClientBrowser("./Login_Confirmation?webridge_number="+webrID+"&name="+RISeUserName+"&ticket="+ticket);
     return false;//not render the html
     }
     */
    //************************************

    if (webrID) //if RISe # exists in CWL
    {
        //var persons = getElements("PersonForID", "ID", webrID);
        if (persons.count()>0)
        {
            var p = persons(1);
            wom.getSessionContext.putContextObject("RISePerson", persons(1), true);
            var RISeUserName = p.firstname.toUpperCase();
            RISeUserName += " ";
            RISeUserName += p.lastname.toUpperCase();
            wom.getSessionContext.putContextObject("RISeUserName", RISeUserName, true);

            // Check employee number, added by yong 11-3-2004
            try
            {
                /* //old script
                 var employeenumber=p.getQualifiedAttribute("customAttributes._attribute23");
                 if (employeenumber==null || employeenumber=="") {
                 // it's time consuming to call CWL again. need to redesign the API later
                 var en = ExternalUBCXmlRpc.getIdentity(ticket, "employee_number");
                 wom.log("Debug info /CustomLayouts/CWL/Login, prerender script. Employee Number: "+en+"  ID"+p.ID);
                 if (en!=null) {
                 p.setQualifiedAttribute("customAttributes._attribute23", en);
                 }
                 }
                 */

                var employeenumber=p.getQualifiedAttribute("customAttributes._attribute23");
                //var en = ExternalUBCXmlRpc.getIdentity(ticket, "employee_number");
                if (employeenumber!=null && employeenumber!="") //employee # exists in RISe
                {
                    // Compare Employee # b/w CLW & RISe
                    wom.log("Debug info /CustomLayouts/CWL/Login, prerender script. Employee #(CWL): "+CWLEmpNum+" Employee #(RISe): "+employeenumber+"  ID"+p.ID);
                    if (((CWLEmpNum!=null)&&(CWLEmpNum!=""))&&(employeenumber!=CWLEmpNum)) //RISe emp# not equal CWL emp#
                    {
                        wom.log("CWL emp #: y; RISe emp #: y; Login?: y; ERROR:CWL emp # != RISe emp #");
                        wom.log("ERROR: /CustomLayouts/CWL/Login, prerender script; RISe emp# not equal CWL emp#. CWL=" +CWLUserName+"; Employee #(CWL): "+CWLEmpNum+"; RISe Username=" +RISeUserName+"; Employee #(RISe): "+employeenumber+"; ID:"+p.ID);
                        /*
                         var objMail = new ActiveXObject("CDONTS.NewMail");
                         objMail.To = "david.yeung@ors.ubc.ca";
                         objMail.From = "david.yeung@ors.ubc.ca";
                         objMail.Subject = "RISe employee number not equal CWL employee number";
                         objMail.Body = "RISe employee number not equal CWL employee number!! \nCWL Username=" +CWLUserName+" \nEmployee number(CWL): "+CWLEmpNum+" \nRISe Username=" +RISeUserName+" \nEmployee number(RISe): "+employeenumber+" \nID:"+p.ID;
                         objMail.Send();
                         */
                        /*
                         var iCfg=new ActiveXObject('CDO.Configuration');
                         iCfg.Fields.Item('http://schemas.microsoft.com/cdo/configuration/sendusing')=1;
                         iCfg.Fields.Item('http://schemas.microsoft.com/cdo/configuration/smtpserverpickupdirectory')='c:\\Inetpub\\mailroot\\pickup';
                         iCfg.Fields.Update();
                         var objMail = new ActiveXObject("CDO.Message");
                         objMail.Configuration=iCfg;
                         objMail.To = "david.yeung@ors.ubc.ca";
                         objMail.From = "david.yeung@ors.ubc.ca";
                         objMail.Subject = "RISe employee number not equal CWL employee number";
                         objMail.MIMEFormatted= true; //MIME format
                         objMail.TextBody = "RISe employee number not equal CWL employee number!! \nCWL Username=" +CWLUserName+" \nEmployee number(CWL): "+CWLEmpNum+" \nRISe Username=" +RISeUserName+" \nEmployee number(RISe): "+employeenumber+" \nID:"+p.ID;
                         objMail.Send();
                         */
                        var To = "david.yeung@ors.ubc.ca";
                        var From = "david.yeung@ors.ubc.ca";
                        var Subject = "RISe employee number not equal CWL employee number";
                        var MIMEFormatted= true; //MIME format
                        var TextBody = "RISe employee number not equal CWL employee number!! \nCWL Username=" +CWLUserName+" \nEmployee number(CWL): "+CWLEmpNum+" \nRISe Username=" +RISeUserName+" \nEmployee number(RISe): "+employeenumber+" \nID:"+p.ID;
                        var objMail = CustomUtils.sendEmailCDO(To, null, null, From, Subject, null, TextBody, MIMEFormatted);

                        objMail.Send();
                        objMail = null;


                        sch.appendHtml("<DIV align=center><br><TABLE cellSpacing=0 cellPadding=0 width=650 border=0>");
                        sch.appendHtml("<TBODY><TR><TD align=middle><IMG height=50 width=300 src=");
                        sch.appendHTML(sch.fullUrlFromAssetUrl('Images/ubc_logo.gif'));
                        sch.appendHtml("></TD></TR></TBODY></TABLE><BR><TABLE cellSpacing=0 cellPadding=0 width=650 border=0>");
                        sch.appendHtml("<TBODY><TR><TD align=left><span class='Error'>There is an error when checking the identity.<BR>");
                        sch.appendHtml("Please contact system administrator <a href='mailto:risesupport@ors.ubc.ca?subject=Error in checking the identity (CWL=" +CWLUserName+" and RISe="+webrID+")'>risesupport@ors.ubc.ca</a> and report the problem.</span>");
                        sch.appendHtml("</TD></TR></TBODY></TABLE></DIV>");
                        return false;

                    }
                }
                else //employee # does not exist in RISe. Get it from CWL if exists there
                {
                    wom.log("Debug info /CustomLayouts/CWL/Login, prerender script. Employee #(CWL): "+CWLEmpNum+" Employee #(RISe): "+employeenumber+"  ID"+p.ID);
                    wom.log("CWL emp #: ?; RISe emp #: n; Login?: y");
                    if (CWLEmpNum!=null) {
                        // No Employee Number in RISe; we will update RISe Employee Number with the one in CWL
                        p.setQualifiedAttribute("customAttributes._attribute23", CWLEmpNum);
                        wom.log("Debug info /CustomLayouts/CWL/Login, prerender script; Emp # exists in CWL, not exists in RISe. Employee #(CWL): "+CWLEmpNum+" Employee #(RISe): "+employeenumber+"  ID"+p.ID);
                        /*
                         var objMail = new ActiveXObject("CDONTS.NewMail");
                         objMail.To = "david.yeung@ors.ubc.ca";
                         objMail.From = "david.yeung@ors.ubc.ca";
                         objMail.Subject = "Employee number exists in CWL, not exists in RISe (existing user)";
                         objMail.Body = "Employee number exists in CWL, not exists in RISe (existing user)!! \nCWL Username= " +CWLUserName+" \nEmployee number(CWL): "+CWLEmpNum+" \nRISe Username= " +RISeUserName+" \nEmployee number(RISe): "+employeenumber+" \nID: "+p.ID+" \nEmployee number is added to RISe!!!!!";
                         objMail.Send();
                         */
                        /*
                         var iCfg=new ActiveXObject('CDO.Configuration');
                         iCfg.Fields.Item('http://schemas.microsoft.com/cdo/configuration/sendusing')=1;
                         iCfg.Fields.Item('http://schemas.microsoft.com/cdo/configuration/smtpserverpickupdirectory')='c:\\Inetpub\\mailroot\\pickup';
                         iCfg.Fields.Update();
                         var objMail = new ActiveXObject("CDO.Message");
                         objMail.Configuration=iCfg;
                         objMail.To = "david.yeung@ors.ubc.ca";
                         objMail.From = "david.yeung@ors.ubc.ca";
                         objMail.Subject = "Employee number exists in CWL, not exists in RISe (existing user)";
                         objMail.MIMEFormatted= true; //MIME format
                         objMail.TextBody = "Employee number exists in CWL, not exists in RISe (existing user)!! \nCWL Username= " +CWLUserName+" \nEmployee number(CWL): "+CWLEmpNum+" \nRISe Username= " +RISeUserName+" \nEmployee number(RISe): "+employeenumber+" \nID: "+p.ID+" \nEmployee number is added to RISe!!!!!";
                         objMail.Send();
                         */
                        var To = "david.yeung@ors.ubc.ca";
                        var From = "david.yeung@ors.ubc.ca";
                        var Subject = "Employee number exists in CWL, not exists in RISe (existing user)";
                        var MIMEFormatted= true; //MIME format
                        var TextBody = "Employee number exists in CWL, not exists in RISe (existing user)!! \nCWL Username= " +CWLUserName+" \nEmployee number(CWL): "+CWLEmpNum+" \nRISe Username= " +RISeUserName+" \nEmployee number(RISe): "+employeenumber+" \nID: "+p.ID+" \nEmployee number is added to RISe!!!!!";
                        var objMail = CustomUtils.sendEmailCDO(To, null, null, From, Subject, null, TextBody, MIMEFormatted);

                        objMail.Send();
                        objMail = null;
                    }
                }
                //Xin Added to save puid
                p.setQualifiedAttribute("customAttributes.CWLPuID", CWLPuID);

                //check if profile update is needed
                var now = new Date();
                var ayearago = new Date(now.getFullYear()-1, now.getMonth(), now.getDate());
                //sch.appendHtml("now - 1 is: "+ayearago);
                //sch.appendHtml("<br>profile last update: "+p.dateUpdated);
                //return false; //for testing, delete later!
                if ((ayearago)>(p.dateUpdated) || p.id == '23598') //should be (ayearago)>(p.dateUpdated)
                {
                    //sch.redirectClientBrowser("./Login_UserInfo?webridge_number="+webrID+"&ticket="+ticket+"&cwl=");
                    sch.redirectClientBrowser("./Login_UserInfoShib");
                    return false;
                }

                //david:2011-11-14
                p.setQualifiedAttribute("customAttributes.CWLLastLoginDate", now);
                p.setQualifiedAttribute("customAttributes.CWLUsername", CWLUserID);

                wom.log("CWL emp #: ?; RISe emp #: ?; Login?: y; --> logging into the system");
                var session = wom.getSessionContext();
                var svc = session.service("/Webridge/UserLoginServices");
                var useSecureSession = false;
                var redirectBrowser = true;
                //var status="Active";
                //p.setQualifiedAttribute("customAttributes._attribute25", status);
                //DY: 2013.11.29 Check if account is inactived or disabled
                var accountStatus = p.getQualifiedAttribute("customAttributes._attribute25");
                var accountDisabled = p.accountDisabled;
                wom.log("accountstatus: "+ accountStatus + ", accountDisable: "+accountDisabled);
                wom.log("account index: "+accountStatus.indexOf("Active"));
                if (accountStatus.indexOf("Active")==-1 || accountDisabled)
                {
                    var To = "david.yeung@ors.ubc.ca";
                    var From = "david.yeung@ors.ubc.ca";
                    var Subject = "RISe Account is Inactived or Disabled";
                    var MIMEFormatted= true; //MIME format
                    var TextBody = "RISe Account is Inactived or Disabled!!(New User) \nCWL Username=" +CWLUserName+" \nCWL UserID(CWL): "+CWLUserID+" \nEmployee number(CWL): "+CWLEmpNum+" \nRISe Username=" +RISeUserName+" \nEmployee number(RISe): "+employeenumber+" \nID:"+persons(1).ID;
                    var objMail = CustomUtils.sendEmailCDO(To, null, null, From, Subject, null, TextBody, MIMEFormatted);

                    objMail.Send();
                    objMail = null;

                    sch.appendHtml("<DIV align=center><br><TABLE cellSpacing=0 cellPadding=0 width=650 border=0>");
                    sch.appendHtml("<TBODY><TR><TD align=middle><IMG height=50 width=300 src=");
                    sch.appendHTML(sch.fullUrlFromAssetUrl('Images/ubc_logo.gif'));
                    sch.appendHtml("></TD></TR></TBODY></TABLE><BR><TABLE cellSpacing=0 cellPadding=0 width=650 border=0>");
                    sch.appendHtml("<TBODY><TR><TD align=left><span class='Error'>Your account has been disabled.<BR>");
                    sch.appendHtml("Please contact system administrator <a href='mailto:risesupport@ors.ubc.ca?subject=account has been disabled (CWL=" +CWLUserID+" and RISe="+p.ID+")'>risesupport@ors.ubc.ca</a> and report the problem.</span>");
                    sch.appendHtml("</TD></TR></TBODY></TABLE></DIV>");
                    return false;
                }
                svc.trustedLogin(useSecureSession, redirectBrowser, persons(1).userID,1);

            }
            catch(e)
            {
                wom.log("Exception /CustomLayouts/CWL/Login, prerender script getting employee number"+e.description);
            }

        }
        else
        {
            wom.log("Error in /CustomLayouts/CWL/Login: cannot find person ID as "+webrID);
            sch.appendHtml("<span class='Error'>Cannot find your record, Please contact system administrator and report the problem.</span>");
        }
        return false;
    }
    else //No RISe # in CWL; check for Emp # in CWL
    {
        try
        {
            //var CWLEmpNum = ExternalUBCXmlRpc.getIdentity(ticket, "employee_number");
            if ((CWLEmpNum!=null)&&(CWLEmpNum!="")) //Emp # exists in CWL
            {
                var persons = getElements("PersonsForEmployeeNumber", "empNum", CWLEmpNum);
                if (persons.count()==1)
                {

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//NEW (moved to the next part)
                    /*
                     var employeenumber=persons(1).getQualifiedAttribute("customAttributes._attribute23");
                     // Compare Employee # b/w CLW & RISe
                     if (((employeenumber!=null && employeenumber!=""))&&((CWLEmpNum!=null)&&(CWLEmpNum!=""))&&(employeenumber!=CWLEmpNum)) //RISe emp# not equal CWL emp#
                     {
                     var objMail = new ActiveXObject("CDONTS.NewMail");
                     objMail.To = "david.yeung@ors.ubc.ca";
                     objMail.From = "david.yeung@ors.ubc.ca";
                     objMail.Subject = "RISe employee number not equal CWL employee number";
                     objMail.Body = "RISe employee number not equal CWL employee number!!(New User) \nCWL Username=" +CWLUserName+" \nEmployee number(CWL): "+CWLEmpNum+" \nRISe Username=" +RISeUserName+" \nEmployee number(RISe): "+employeenumber+" \nID:"+persons(1).ID;
                     objMail.Send();

                     sch.appendHtml("<DIV align=center><br><TABLE cellSpacing=0 cellPadding=0 width=650 border=0>");
                     sch.appendHtml("<TBODY><TR><TD align=middle><IMG height=50 width=300 src=");
                     sch.appendHTML(sch.fullUrlFromAssetUrl('Images/ubc_logo.gif'));
                     sch.appendHtml("></TD></TR></TBODY></TABLE><BR><TABLE cellSpacing=0 cellPadding=0 width=650 border=0>");
                     sch.appendHtml("<TBODY><TR><TD align=left><span class='Error'>There is an error when checking the identity.<BR>");
                     sch.appendHtml("Please contact system administrator <a href='mailto:ors@ors.ubc.ca?subject=Error in checking the identity (CWL=" +CWLUserName+" and RISe="+webrID+")'>ors@ors.ubc.ca</a> and report the problem.</span>");
                     sch.appendHtml("</TD></TR></TBODY></TABLE></DIV>");
                     return false;
                     }
                     */
//End NEW
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


                    //var p = persons(1);
                    wom.getSessionContext.putContextObject("RISePerson", persons(1), true);
                    var RISeUserName = persons(1).firstname.toUpperCase();
                    RISeUserName += " ";
                    RISeUserName += persons(1).lastname.toUpperCase();
                    wom.getSessionContext.putContextObject("RISeUserName", RISeUserName, true);
                    var webrID = persons(1).id;
                    wom.getSessionContext.putContextObject("RISeWebrID", webrID, true);
                    // Xin 2014.06.13 added to put webrID found through employee number into session context
                    wom.getSessionContext.putContextObject("CWLWebrID", webrID, true);
                    if (CWLUserName == RISeUserName)
                    {
                        //go directly to the info page
                        wom.log("CWL emp #: y; RISe emp #: y; Login?: n; CWL emp # = RISe emp # && name matches");
                        //sch.redirectClientBrowser("./Login_UserInfo?webridge_number="+id+"&name="+RISeUserName+"&ticket="+ticket+"&cwl="+CWLUserName);
                        sch.redirectClientBrowser("./Login_UserInfoShib");
                    }
                    else
                    {
                        //ask the user to confirm their identity
                        wom.log("CWL emp #: y; RISe emp #: y; Login?: n; CWL emp # = RISe emp # && name not matches");
                        //sch.redirectClientBrowser("./Login_Confirmation?webridge_number="+id+"&name="+RISeUserName+"&ticket="+ticket);
                        sch.redirectClientBrowser("./Login_ConfirmationShib");
                    }

                    return false;
                }
                else if(persons.count()>1)
                {
                    //throw errors (more than one person with the same employee number!)
                    /*
                     var objMail = new ActiveXObject("CDONTS.NewMail");
                     objMail.To = "david.yeung@ors.ubc.ca";
                     objMail.From = "david.yeung@ors.ubc.ca";
                     objMail.Subject = "More than one contacts in RISe with the same employee number!";
                     objMail.Body = "More than one contacts in RISe with the same employee number!!(New User) \nCWL Username=" +CWLUserName+" \n Employee number(CWL): "+CWLEmpNum;
                     objMail.Send();
                     */
                    /*
                     var iCfg=new ActiveXObject('CDO.Configuration');
                     iCfg.Fields.Item('http://schemas.microsoft.com/cdo/configuration/sendusing')=1;
                     iCfg.Fields.Item('http://schemas.microsoft.com/cdo/configuration/smtpserverpickupdirectory')='c:\\Inetpub\\mailroot\\pickup';
                     iCfg.Fields.Update();
                     var objMail = new ActiveXObject("CDO.Message");
                     objMail.Configuration=iCfg;
                     objMail.To = "david.yeung@ors.ubc.ca";
                     objMail.From = "david.yeung@ors.ubc.ca";
                     objMail.Subject = "More than one contacts in RISe with the same employee number!";
                     objMail.MIMEFormatted= true; //MIME format
                     objMail.TextBody = "More than one contacts in RISe with the same employee number!!(New User) \nCWL Username=" +CWLUserName+" \n Employee number(CWL): "+CWLEmpNum;
                     objMail.Send();
                     */
                    var To = "david.yeung@ors.ubc.ca";
                    var From = "david.yeung@ors.ubc.ca";
                    var Subject = "More than one contacts in RISe with the same employee number!";
                    var MIMEFormatted = true; //MIME format
                    var TextBody = "More than one contacts in RISe with the same employee number!!(New User) \nCWL Username=" +CWLUserName+" \n Employee number(CWL): "+CWLEmpNum;
                    var objMail = CustomUtils.sendEmailCDO(To, null, null, From, Subject, null, TextBody, MIMEFormatted);

                    objMail.Send();
                    objMail = null;

                    wom.log("CWL emp #: y; RISe emp #: y; Login?: n; CWL emp # = RISe emp #; MORE than one matches!!");
                    wom.log("ERROR: /CustomLayouts/CWL/Login, prerender script; more than one person with the same employee number. CWL=" +CWLUserName+"; Employee #: "+CWLEmpNum);
                    sch.appendHtml("<DIV align=center><br><TABLE cellSpacing=0 cellPadding=0 width=650 border=0>");
                    sch.appendHtml("<TBODY><TR><TD align=middle><IMG height=50 src='https://webridge_dev/Common/_test/Images/ubc_logo.gif'");
                    sch.appendHtml("width=300 border=0 _webrReplace_src='Images/ubc_logo.gif'imageHeight=50 imageWidth=300>");
                    sch.appendHtml("</TD></TR></TBODY></TABLE><BR><TABLE cellSpacing=0 cellPadding=0 width=650 border=0>");
                    sch.appendHtml("<TBODY><TR><TD align=left><span class='Error'>There is an error when looking up your profile.<BR>");
                    sch.appendHtml("Please contact system administrator <a href='mailto:risesupport@ors.ubc.ca?subject=Error in looking up your profile (CWL=" +CWLUserName+" and Employee #="+CWLEmpNum+")'>risesupport@ors.ubc.ca</a> and report the problem.</span>");
                    sch.appendHtml("</TD></TR></TBODY></TABLE></DIV>");
                    return false;
                }
            }
        }
        catch(e)
        {
            wom.log("Exception /CustomLayouts/CWL/Login, checking emp #: "+e.description);
        }
    }

    // Newly Added Just for debug purpose****************************************
    /*
     sch.appendHtml("<font color=red>Your webrID is: ");
     sch.appendHtml(webrID);
     sch.appendHtml("<br>Your loginKey is: ");
     sch.appendHtml(ExternalUBCXmlRpc.getLoginKey(ticket));
     sch.appendHtml("<br>Your loginName is: ");
     sch.appendHtml(ExternalUBCXmlRpc.getLoginName(ticket));
     sch.appendHtml("<br>Your PreferredName is: ");
     sch.appendHtml(ExternalUBCXmlRpc.getPreferredName(ticket));
     sch.appendHtml("<br>Your empID is: ");
     sch.appendHtml(ExternalUBCXmlRpc.getIdentity(ticket, "employee_number"));
     sch.appendHtml("</font><br>");
     */
    // **************************************************************************
    wom.log("CWL emp #: ?" +CWLEmpNum+"; RISe #: ?" +wom.getSessionContext.getContextObject("RISeWebrID")+"; Login?: n");
    return true;

}
