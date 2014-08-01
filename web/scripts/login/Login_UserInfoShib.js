function handleSubmit(sch, formEntity)
{
    try
    {
        function IsDate(strDate) {
            var strPattern = /^(\d{1,2})(\/|-)(\d{1,2})\2(\d{4})+(\ |)/;
            var arrPattern = strDate.match(strPattern);
            if (arrPattern == null) {
                return false;
            }

            var intMonth = arrPattern[1];
            var intDay = arrPattern[3];
            var intYear = arrPattern[4];

            if (intMonth < 1 || intMonth > 12) {
                return false;
            }

            if (intDay < 1 || intDay > 31) {
                return false;
            }

            if ((intMonth==4 || intMonth==6 || intMonth==9 || intMonth==11) && intDay==31) {
                return false;
            }

            if (intMonth == 2) {
                if (intDay>29 || (intDay==29 && !(intYear % 4 == 0 && (intYear % 100 != 0 || intYear % 400 == 0)))) {
                    return false;
                }
            }
            return true;
        }

        //var id = sch.querystring("webridge_number");
        //var id = wom.getSessionContext.getContextObject("RISeWebrID");
        //var cwlEmpNum = ExternalUBCXmlRpc.getIdentity(ticket, "employee_number");
        var cwlEmpNum = wom.getSessionContext.getContextObject("RISeCWLEmpNum");
        //var CWLUserName = sch.querystring("cwl");
        var CWLUserName = wom.getSessionContext.getContextObject("RISeCWLUserName");
        var CWLUserID = wom.getSessionContext.getContextObject("CWLUserID");
        //Xin Add to get puid
        var CWLPuID = wom.getSessionContext.getContextObject("CWLPuID");
        var persons = wom.getSessionContext.getContextObject("RISePerson");
        /*
         if (id)
         {
         var persons = getElements("PersonForID", "ID", id);
         wom.log("use RISe #");
         }
         else
         {
         var persons = getElements("PersonsForEmployeeNumber", "empNum", cwlEmpNum);
         wom.log("use Emp #");
         }
         */
        var firstname = sch.form("firstname");
        var lastname = sch.form("lastname");
        var email = sch.form("email");
        var primaryapp = sch.form("primaryapp");
        var site = sch.form("mainLab");
        var onlinenum = sch.form("onlinenum");
        var practicalNum = sch.form("practicalNum");
        var TCPS = sch.form("TCPS");
        var TCPSdate = sch.form("TCPSdate");
        var nserc = sch.form("nserc");
        var cihr = sch.form("cihr");
        var sshrc = sch.form("sshrc");
        var otherapp = new Array();
        otherapp[0] = sch.form("otherapp1");
        otherapp[1] = sch.form("otherapp2");
        otherapp[2] = sch.form("otherapp3");
        otherapp[3] = sch.form("otherapp4");
        otherapp[4] = sch.form("otherapp5");

        // check for empty fields
        var checkFields = true;
        if ((firstname==null) || (firstname=="") || (lastname==null) || (lastname=="") ||
            (email==null) || (email=="") || (primaryapp==null) || (primaryapp=="") || ((TCPS=="yes")&&((TCPSdate==null)||(TCPSdate==""))) || (((TCPSdate!=null)&&(TCPSdate!=""))&&(!IsDate(TCPSdate))))
        {
            sch.appendHtml("<DIV align=center>");
            sch.appendHtml("<TABLE cellSpacing=0 cellPadding=0 width=100% border=0 bgcolor=#D1D1E1>");
            sch.appendHtml("<TBODY><TR><TD align=left>");
            sch.appendHtml("<font color=red><strong>We had trouble processing the information. Please correct the field(s) listed below.</strong></font>");
            sch.appendHtml("<br>");
            sch.appendHtml("<UL>");
            checkFields = false;
        }
        if ((firstname==null) || (firstname==""))
        {
            sch.appendHtml("<LI>Please specify your <strong>First Name</strong>.</LI>");
        }
        if ((lastname==null) || (lastname==""))
        {
            sch.appendHtml("<LI>Please specify your <strong>Last Name</strong>.</LI>");
        }
        if ((email==null) || (email==""))
        {
            sch.appendHtml("<LI>Please specify your <strong>Email Address</strong>.</LI>");
        }
        if ((primaryapp==null) || (primaryapp==""))
        {
            sch.appendHtml("<LI>Please specify your <strong>UBC Academic Appointment or Affiliation</strong>.</LI>");
        }
//|| ((TCPS==true)&&((TCPSdate==null)||(TCPSdate=="")))
        if ((TCPS=="yes")&&((TCPSdate==null)||(TCPSdate=="")))
        {
            sch.appendHtml("<LI>Please specify your <strong>TCPS Completion Date</strong> field.</LI>");
        }
// || (((TCPSdate!=null)&&(TCPSdate!=""))&&(!IsDate(TCPSdate)))
        if (((TCPSdate!=null)&&(TCPSdate!=""))&&(!IsDate(TCPSdate)))
        {
            sch.appendHtml("<LI>Please check the date format in <strong>TCPS Completion Date</strong> field. You typed "+TCPSdate+". Correct format is mm/dd/yyyy.</LI>");
        }

        if (checkFields==false)
        {
            sch.appendHtml("</UL>");
            sch.appendHtml("<BR>");
            sch.appendHtml("</TD></TR></TBODY></TABLE></DIV>");
            return sch.FormReturnValues.ABORT_REPAINT;
        }
        else
        {
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//NEW CODE
            /*

             wom.getSessionContext.putContextObject("firstname", firstname, true);
             wom.getSessionContext.putContextObject("lastname", lastname, true);
             wom.getSessionContext.putContextObject("email", email, true);
             wom.getSessionContext.putContextObject("site", site, true);
             wom.getSessionContext.putContextObject("primaryapp", primaryapp, true);
             wom.getSessionContext.putContextObject("userID", persons.userID, true);
             wom.getSessionContext.putContextObject("otherapp", otherapp, true);
             wom.log("~~~~~~~~~~~~~~~~~~~~~~~~~LOGIN USERINFO");
             sch.redirectClientBrowser("./Login_Process");
             return true;
             */
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            var ticket = wom.getSessionContext.getContextObject("RISeTicket");
            //var webrID = ExternalUBCXmlRpc.getIdentity(ticket, "webridge_number");
            var webrID = wom.getSessionContext.getContextObject("RISeWebrID");
            var CWLwebrID = wom.getSessionContext.getContextObject("CWLWebrID");
            //var CWLwebrID = ExternalUBCXmlRpc.getIdentity(ticket, "webridge_number");
            if (!CWLwebrID)
            {
                // set webridgeID into CWL
                wom.log("Debug in /CustomLayouts/CWL/Login_UserInfo: Adding new user: ID="+webrID+" CWL="+CWLUserName +" CWL ID="+CWLUserID);
                wom.log("set RISe #: "+webrID+" to CWL!!!!! LAST STEP!");
                var ticket = wom.getSessionContext.getContextObject("RISeTicket");
                //ExternalUBCXmlRpc.addIdentity(ticket, "webridge_number", webrID);
                /*
                 var objMail = new ActiveXObject("CDONTS.NewMail");
                 objMail.To = "david.yeung@ors.ubc.ca";
                 objMail.From = "david.yeung@ors.ubc.ca";
                 objMail.Subject = "New User added to the system";
                 objMail.Body = "New User!! \nID: " + webrID + " \nCWL username: " + CWLUserName + " \nCWL ID: " + CWLUserID + " \nRISe username: " + firstname + " " + lastname;
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
                 objMail.Subject = "New User added to the system";
                 objMail.MIMEFormatted= true; //MIME format
                 objMail.TextBody = "New User!! \nID: " + webrID + " \nCWL username: " + CWLUserName + " \nCWL ID: " + CWLUserID + " \nRISe username: " + firstname + " " + lastname;
                 objMail.Send();
                 */
                var To = "david.yeung@ors.ubc.ca";
                var From = "david.yeung@ors.ubc.ca";
                var Subject = "New User added to the system";
                var MIMEFormatted= true; //MIME format
                var TextBody = "New User!! \nID: " + webrID + " \nCWL username: " + CWLUserName + " \nCWL ID: " + CWLUserID + " \nRISe username: " + firstname + " " + lastname;
                var objMail = CustomUtils.sendEmailCDO(To, null, null, From, Subject, null, TextBody, MIMEFormatted);

                objMail.Send();
                objMail = null;

                var employeenumber=persons.getQualifiedAttribute("customAttributes._attribute23");
                if (((cwlEmpNum!=null)&&(cwlEmpNum!=""))&&((employeenumber==null)||(employeenumber=="")))
                {
                    // No Employee Number in RISe; we will update RISe Employee Number with the one in CWL
                    persons.setQualifiedAttribute("customAttributes._attribute23", cwlEmpNum);
                    /*
                     var objMail = new ActiveXObject("CDONTS.NewMail");
                     objMail.To = "david.yeung@ors.ubc.ca";
                     objMail.From = "david.yeung@ors.ubc.ca";
                     objMail.Subject = "Emp # exists in CWL, not exists in RISe (new user)";
                     objMail.Body = "Emp # exists in CWL, not exists in RISe (new user)!! \nCWL=" +CWLUserName+" \nEmployee number(CWL): "+cwlEmpNum+" \nRISe Username= " + firstname + " " + lastname+" \nEmployee number(RISe): "+employeenumber+" \nID: "+webrID+" \nEmployee number is added to RISe!!!!!";
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
                     objMail.Subject = "Emp # exists in CWL, not exists in RISe (new user)";
                     objMail.MIMEFormatted= true; //MIME format
                     objMail.TextBody = "Emp # exists in CWL, not exists in RISe (new user)!! \nCWL=" +CWLUserName+" \nEmployee number(CWL): "+cwlEmpNum+" \nRISe Username= " + firstname + " " + lastname+" \nEmployee number(RISe): "+employeenumber+" \nID: "+webrID+" \nEmployee number is added to RISe!!!!!";
                     objMail.Send();
                     */
                    var To = "david.yeung@ors.ubc.ca";
                    var From = "david.yeung@ors.ubc.ca";
                    var Subject = "Emp # exists in CWL, not exists in RISe (new user)";
                    var MIMEFormatted= true; //MIME format
                    var TextBody = "Emp # exists in CWL, not exists in RISe (new user)!! \nCWL=" +CWLUserName+" \nEmployee number(CWL): "+cwlEmpNum+" \nRISe Username= " + firstname + " " + lastname+" \nEmployee number(RISe): "+employeenumber+" \nID: "+webrID+" \nEmployee number is added to RISe!!!!!";
                    var objMail = CustomUtils.sendEmailCDO(To, null, null, From, Subject, null, TextBody, MIMEFormatted);

                    objMail.Send();
                    objMail = null;
                }
            }


            // update RISe database with user's provided info
            persons.firstname=firstname;
            persons.lastname=lastname;
            persons.setQualifiedAttribute("contactinformation.emailPreferred.emailaddress", email);
            persons.setQualifiedAttribute("customAttributes._attribute33", site);
            persons.setQualifiedAttribute("employer",primaryapp);
            persons.setQualifiedAttribute("customAttributes._attribute21", onlinenum);
            persons.setQualifiedAttribute("customAttributes._attribute22", practicalNum);
            persons.setQualifiedAttribute("customAttributes._attribute26", TCPS);
            if (TCPSdate)
            {
                //tcpsdate=new Date(tcpsdate);
                persons.setQualifiedAttribute("customAttributes._attribute27", TCPSdate);
            }
            else
            {
                persons.setQualifiedAttribute("customAttributes._attribute27", null);
            }
            persons.setQualifiedAttribute("customAttributes._attribute30", nserc);
            persons.setQualifiedAttribute("customAttributes._attribute31", cihr);
            persons.setQualifiedAttribute("customAttributes._attribute32", sshrc);


            // remove all OTHER appointments and insert the new ones
            var oapps=persons.getQualifiedAttribute("customAttributes._attribute15");

            if (oapps!=null)
            {
                oapps.removeAllElements();
            }

            for (var i=0; i<5; i++)
            {
                if (otherapp[i]!=':00000000000000000000000000000000')
                {
                    var tempComp = wom.getEntityFromString(otherapp[i]);
                    persons.setQualifiedAttribute("customAttributes._attribute15", tempComp, "add");
                }
            }
            sch.appendHtml("</font>");

            //update the profile dateUpdate
            var now = new Date();
            //persons(1).setQualifiedAttribute("dateUpdated",now);
            persons.setQualifiedAttribute("dateUpdated",now);

            //david:2011-11-14
            persons.setQualifiedAttribute("customAttributes.CWLLastLoginDate", now);
            persons.setQualifiedAttribute("customAttributes.CWLUsername", CWLUserID);
            //Xin Added to save puid
            persons.setQualifiedAttribute("customAttributes.CWLPuID", CWLPuID);
            // Vlad. Nov 20, 2013. Set Page name as "Page for FirstName LastName"
            var firstName = persons.firstName;
            var lastName = persons.lastName;
            var name = "Page for";
            if (firstName != null) name = name + " " + firstName;
            if (lastName != null) name = name + " " + lastName;

            if (persons.getQualifiedAttribute("myRoom.name") != null) persons.setQualifiedAttribute("myRoom.name", name);

            //DY: 2014.05.20. Set VCHRI Upload attribute to False if it was True previously
            persons.UpdateVCHRIuploadAttribute();
            //VCHRIupload = persons.getQualifiedAttribute("customAttributes.VCHRIuploaded");
            //if (VCHRIupload == true) persons.setQualifiedAttribute("customAttributes.VCHRIuploaded", false);
            // perform login
            var session = wom.getSessionContext();
            var svc = session.service("/Webridge/UserLoginServices")
            var useSecureSession = false;
            var redirectBrowser = true;
            var status="Active";
            persons.setQualifiedAttribute("customAttributes._attribute25", status);
            svc.trustedLogin( useSecureSession, redirectBrowser, persons.userID,1);
            return sch.FormReturnValues.COMMIT_REPAINT;

        }
    }
    catch(e)
    {
        sch.appendHtml("<DIV align=center>");
        sch.appendHtml("<TABLE cellSpacing=0 cellPadding=0 width=100% border=0 bgcolor=#D1D1E1>");
        sch.appendHtml("<TBODY><TR><TD align=left>");
        if (((e.description).indexOf("addIdentity"))!=-1)
        {
            sch.appendHtml("<font color=red><strong>There is an error in processing your information.  Please close this window and try again.  If the problem persists, please contact the applicable board below. </strong></font><br>");
            sch.appendHtml("<br>Conflict of Interest / Conflict of Commitment - 604-822-8623 Email: <a href='mailto:conflict.of.interest@ubc.ca'>conflict.of.interest@ubc.ca</a>");
            sch.appendHtml("<br>Animal Ethics - 604-827-5115 Email: <a href='mailto:animalcare@ors.ubc.ca'>animalcare@ors.ubc.ca</a> ");
            sch.appendHtml("<br>BC Cancer Agency Research Ethics Board - (604) 877-6284 Email: <a href='mailto:reb@bccancer.bc.ca'>reb@bccancer.bc.ca</a>");
            sch.appendHtml("<br>Providence Health Care Research Ethics Board - (604) 604-806-8567 Email: <a href='mailto:LCameron@providencehealth.bc.ca'>LCameron@providencehealth.bc.ca</a>");
            sch.appendHtml("<br>Clinical Research Ethics Board - (604) 875-4167 Email: <a href='mailto:creb.rise@ors.ubc.ca'>creb.rise@ors.ubc.ca</a>");
            sch.appendHtml("<br>Behavioural Research Ethics Board - (604) 827-5114 Email: <a href='mailto:breb.rise@ors.ubc.ca'>breb.rise@ors.ubc.ca</a>");
            sch.appendHtml("<br>Children's and Women's Health Centre of BC - Email: <a href='mailto:rrc@cw.bc.ca'>rrc@cw.bc.ca</a><br>");
            sch.appendHtml("<br><font color=red><strong><UL><LI>This is not the CWL previously registered with RISe - Please login using the original CWL username and password associated with your last successful login to the RISe system.</LI></UL></strong></font>");
            /*
             var objMail = new ActiveXObject("CDONTS.NewMail");
             objMail.To = "david.yeung@ors.ubc.ca";
             objMail.From = "david.yeung@ors.ubc.ca";
             objMail.Subject = "Error with logging onto system (Duplicate User ID)";
             objMail.Body = "Duplicate User ID!! \nID: " + webrID + " \n CWL username: " + CWLUserName + " \nCWL ID: " + CWLUserID + "\nRISe username: " + firstname + " " + lastname;
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
             objMail.Subject = "Error with logging onto system (Duplicate User ID)";
             objMail.MIMEFormatted= true; //MIME format
             objMail.TextBody = "Duplicate User ID!! \nID: " + webrID + " \n CWL username: " + CWLUserName + " \nCWL ID: " + CWLUserID + "\nRISe username: " + firstname + " " + lastname;
             objMail.Send();
             */
            var To = "david.yeung@ors.ubc.ca";
            var From = "david.yeung@ors.ubc.ca";
            var Subject = "Error with logging onto system (Duplicate User ID)";
            var MIMEFormatted= true; //MIME format
            var TextBody = "Duplicate User ID!! \nID: " + webrID + " \n CWL username: " + CWLUserName + " \nCWL ID: " + CWLUserID + "\nRISe username: " + firstname + " " + lastname;
            var objMail = CustomUtils.sendEmailCDO(To, null, null, From, Subject, null, TextBody, MIMEFormatted);

            objMail.Send();
            objMail = null;
        }
        else
        {
            sch.appendHtml("<font color=red><strong>There is an error in processing your information.  Please close this window and try again in a few minutes.  If the problem persists, please contact the applicable board below. </strong></font><br>");
            sch.appendHtml("<br>Conflict of Interest / Conflict of Commitment - 604-822-8623 Email: <a href='mailto:conflict.of.interest@ubc.ca'>conflict.of.interest@ubc.ca</a>");
            sch.appendHtml("<br>Animal Ethics - 604-827-5115 Email: <a href='mailto:animalcare@ors.ubc.ca'>animalcare@ors.ubc.ca</a> ");
            sch.appendHtml("<br>BC Cancer Agency Research Ethics Board - (604) 877-6284 Email: <a href='mailto:reb@bccancer.bc.ca'>reb@bccancer.bc.ca</a>");
            sch.appendHtml("<br>Providence Health Care Research Ethics Board - (604) 604-806-8567 Email: <a href='mailto:LCameron@providencehealth.bc.ca'>LCameron@providencehealth.bc.ca</a>");
            sch.appendHtml("<br>Clinical Research Ethics Board - (604) 875-4167 Email: <a href='mailto:creb.rise@ors.ubc.ca'>creb.rise@ors.ubc.ca</a>");
            sch.appendHtml("<br>Behavioural Research Ethics Board - (604) 827-5114 Email: <a href='mailto:breb.rise@ors.ubc.ca'>breb.rise@ors.ubc.ca</a>");
            sch.appendHtml("<br>Children's and Women's Health Centre of BC - Email: <a href='mailto:rrc@cw.bc.ca'>rrc@cw.bc.ca</a><br>");
            /*
             var objMail = new ActiveXObject("CDONTS.NewMail");
             objMail.To = "david.yeung@ors.ubc.ca";
             objMail.From = "david.yeung@ors.ubc.ca";
             objMail.Subject = "Error with logging onto system";
             objMail.Body = "Error with logging onto system!! \nID: " + webrID + " \n CWL username: " + CWLUserName + " \nCWL ID: " + CWLUserID + "\nError description: " + e.description;
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
             objMail.Subject = "Error with logging onto system";
             objMail.MIMEFormatted= true; //MIME format
             objMail.TextBody = "Error with logging onto system!! \nID: " + webrID + " \n CWL username: " + CWLUserName + " \nCWL ID: " + CWLUserID + "\nError description: " + e.description;
             objMail.Send();
             */
            var To = "david.yeung@ors.ubc.ca";
            var From = "david.yeung@ors.ubc.ca";
            var Subject = "Error with logging onto system";
            var MIMEFormatted= true; //MIME format
            var TextBody = "Error with logging onto system!! \nID: " + webrID + " \n CWL username: " + CWLUserName + " \nCWL ID: " + CWLUserID + "\nError description: " + e.description;
            var objMail = CustomUtils.sendEmailCDO(To, null, null, From, Subject, null, TextBody, MIMEFormatted);

            objMail.Send();
            objMail = null;
        }
        sch.appendHtml("</TD></TR></TBODY></TABLE></DIV>");
        wom.log("Exception in /CustomLayouts/CWL/Login_UserInfo: "+e.description+" **Additional Info**: ID="+webrID+" CWL="+CWLUserName);
        //wom.putContext("error", "There is an error in processing your information.  Please try again.  If the problem persists, please contact Administration at ors@ors.ubc.ca.", true);
    }
    return sch.FormReturnValues.ABORT_REPAINT;
}

function getValue(sch)
{
    /*
     var id = sch.querystring("webridge_number");
     var persons = getElements("PersonForID", "ID", id);
     return persons(1).firstname;
     */
    var persons = wom.getSessionContext.getContextObject("RISePerson");
    return persons.firstname;
}

function getValue(sch)
{
    /*
     var id = sch.querystring("webridge_number");
     var persons = getElements("PersonForID", "ID", id);
     return persons(1).lastname;
     */
    var persons = wom.getSessionContext.getContextObject("RISePerson");
    return persons.lastname;
}

function getValue(sch)
{
    /*
     var id = sch.querystring("webridge_number");
     var persons = getElements("PersonForID", "ID", id);
     if ((persons(1).contactInformation == null) || (persons(1).contactInformation.emailPreferred == null) || (persons(1).contactInformation.emailPreferred.eMailAddress == null))
     {
     return "";
     }
     else
     {
     return persons(1).contactInformation.emailPreferred.eMailAddress;
     }
     */
    var persons = wom.getSessionContext.getContextObject("RISePerson");
    if ((persons.contactInformation == null) || (persons.contactInformation.emailPreferred == null) || (persons.contactInformation.emailPreferred.eMailAddress == null))
    {
        return "";
    }
    else
    {
        return persons.contactInformation.emailPreferred.eMailAddress;
    }
}

function SelectOptions(sch)
{
    // Generate the <option> tags for the <select> control
    var persons = wom.getSessionContext.getContextObject("RISePerson");
    var allOptions="";
    var sites = getElements("HospitalsAndSites");

    if (persons.getQualifiedAttribute("customAttributes._attribute33")!=null)
    {
        allOptions += "<option value=':00000000000000000000000000000000'>----";
    }
    else
    {
        allOptions += "<option SELECTED value=':00000000000000000000000000000000'>----";
    }

    for (var i=1; i<=sites.count(); i++)
    {
        if (persons.getQualifiedAttribute("customAttributes._attribute33") == sites(i))
        //if (sch.user.employer == companies(i))
        {
            allOptions += "<OPTION SELECTED value='"+sites(i)+"'>"+sites(i).getQualifiedAttribute("customAttributes._attribute0")+ " - "+sites(i).getQualifiedAttribute("customAttributes._attribute1");
        }
        else
        {
            allOptions += "<OPTION value='"+sites(i)+"'>"+sites(i).getQualifiedAttribute("customAttributes._attribute0")+ " - "+sites(i).getQualifiedAttribute("customAttributes._attribute1");
        }
    }
    return allOptions;
}

function SelectOptions(sch)
{
    /*
     var id = sch.querystring("webridge_number");
     var persons = getElements("PersonForID", "ID", id);

     var allOptions="";
     var companies = getElements("CompaniesByNameActive");

     for (var i=1; i<=companies.count(); i++)
     {
     if (persons(1).employer == companies(i))
     //if (sch.user.employer == companies(i))
     {
     allOptions += "<OPTION SELECTED value='"+companies(i)+"'>"+companies(i).name;
     }
     else
     {
     allOptions += "<OPTION value='"+companies(i)+"'>"+companies(i).name;
     }
     }
     */
    var persons = wom.getSessionContext.getContextObject("RISePerson");
    var allOptions="";
    var companies = getElements("CompaniesByNameActive");

    for (var i=1; i<=companies.count(); i++)
    {
        if (persons.employer == companies(i))
        //if (sch.user.employer == companies(i))
        {
            allOptions += "<OPTION SELECTED value='"+companies(i)+"'>"+companies(i).name;
        }
        else
        {
            allOptions += "<OPTION value='"+companies(i)+"'>"+companies(i).name;
        }
    }
    return allOptions;
}

function SelectOptions(sch)
{
    /*
     var id = sch.querystring("webridge_number");
     var persons = getElements("PersonForID", "ID", id);
     */
    var persons = wom.getSessionContext.getContextObject("RISePerson");

    var allOptions="";
    //allOptions += "<option value=':00000000000000000000000000000000'>----";
    var companies = getElements("CompaniesByNameActive");
    var appointment="";

    if (persons.getQualifiedAttribute("customAttributes._attribute15")!=null)
    {
        var appointmentset = persons.getQualifiedAttribute("customAttributes._attribute15").elements();
        if (appointmentset.count()<1)
        {
            allOptions += "<option SELECTED value=':00000000000000000000000000000000'>----";
        }
        else
        {
            allOptions += "<option value=':00000000000000000000000000000000'>----";
            appointment = appointmentset(1);
        }
    }
    else
    {
        allOptions += "<option SELECTED value=':00000000000000000000000000000000'>----";
    }

    for (var i=1; i<=companies.count(); i++)
    {
        if ((appointment!=null) && (appointment!="") && (appointment == companies(i)))
        //if (persons(1).employer == companies(i))
        //if (sch.user.employer == companies(i))
        {
            allOptions += "<OPTION SELECTED value='"+companies(i)+"'>"+companies(i).name;
        }
        else
        {
            allOptions += "<OPTION value='"+companies(i)+"'>"+companies(i).name;
        }
    }
    return allOptions;
}

function SelectOptions(sch)
{
    /*
     var id = sch.querystring("webridge_number");
     var persons = getElements("PersonForID", "ID", id);
     */
    var persons = wom.getSessionContext.getContextObject("RISePerson");

    var allOptions="";
    //allOptions += "<option value=':00000000000000000000000000000000'>----";
    var companies = getElements("CompaniesByNameActive");
    var appointment="";

    if (persons.getQualifiedAttribute("customAttributes._attribute15")!=null)
    {
        var appointmentset = persons.getQualifiedAttribute("customAttributes._attribute15").elements();

        if (appointmentset.count()<2)
        {
            allOptions += "<option SELECTED value=':00000000000000000000000000000000'>----";
        }
        else
        {
            allOptions += "<option value=':00000000000000000000000000000000'>----";
            appointment = appointmentset(2);
        }
    }
    else
    {
        allOptions += "<option SELECTED value=':00000000000000000000000000000000'>----";
    }

    for (var i=1; i<=companies.count(); i++)
    {
        if ((appointment!=null) && (appointment!="") && (appointment == companies(i)))
        //if (persons(1).employer == companies(i))
        //if (sch.user.employer == companies(i))
        {
            allOptions += "<OPTION SELECTED value='"+companies(i)+"'>"+companies(i).name;
        }
        else
        {
            allOptions += "<OPTION value='"+companies(i)+"'>"+companies(i).name;
        }
    }
    return allOptions;
}

function SelectOptions(sch)
{
    /*
     var id = sch.querystring("webridge_number");
     var persons = getElements("PersonForID", "ID", id);
     */
    var persons = wom.getSessionContext.getContextObject("RISePerson");

    var allOptions="";
    //allOptions += "<option value=':00000000000000000000000000000000'>----";
    var companies = getElements("CompaniesByNameActive");
    var appointment="";

    if (persons.getQualifiedAttribute("customAttributes._attribute15")!=null)
    {
        var appointmentset = persons.getQualifiedAttribute("customAttributes._attribute15").elements();

        if (appointmentset.count()<3)
        {
            allOptions += "<option SELECTED value=':00000000000000000000000000000000'>----";
        }
        else
        {
            allOptions += "<option value=':00000000000000000000000000000000'>----";
            appointment = appointmentset(3);
        }
    }
    else
    {
        allOptions += "<option SELECTED value=':00000000000000000000000000000000'>----";
    }

    for (var i=1; i<=companies.count(); i++)
    {
        if ((appointment!=null) && (appointment!="") && (appointment == companies(i)))
        //if (persons(1).employer == companies(i))
        //if (sch.user.employer == companies(i))
        {
            allOptions += "<OPTION SELECTED value='"+companies(i)+"'>"+companies(i).name;
        }
        else
        {
            allOptions += "<OPTION value='"+companies(i)+"'>"+companies(i).name;
        }
    }
    return allOptions;
}

function SelectOptions(sch)
{
    /*
     var id = sch.querystring("webridge_number");
     var persons = getElements("PersonForID", "ID", id);
     */
    var persons = wom.getSessionContext.getContextObject("RISePerson");

    var allOptions="";
    //allOptions += "<option value=':00000000000000000000000000000000'>----";
    var companies = getElements("CompaniesByNameActive");
    var appointment="";

    if (persons.getQualifiedAttribute("customAttributes._attribute15")!=null)
    {
        var appointmentset = persons.getQualifiedAttribute("customAttributes._attribute15").elements();

        if (appointmentset.count()<4)
        {
            allOptions += "<option SELECTED value=':00000000000000000000000000000000'>----";
        }
        else
        {
            allOptions += "<option value=':00000000000000000000000000000000'>----";
            appointment = appointmentset(4);
        }
    }
    else
    {
        allOptions += "<option SELECTED value=':00000000000000000000000000000000'>----";
    }

    for (var i=1; i<=companies.count(); i++)
    {
        if ((appointment!=null) && (appointment!="") && (appointment == companies(i)))
        //if (persons(1).employer == companies(i))
        //if (sch.user.employer == companies(i))
        {
            allOptions += "<OPTION SELECTED value='"+companies(i)+"'>"+companies(i).name;
        }
        else
        {
            allOptions += "<OPTION value='"+companies(i)+"'>"+companies(i).name;
        }
    }
    return allOptions;
}

function SelectOptions(sch)
{
    /*
     var id = sch.querystring("webridge_number");
     var persons = getElements("PersonForID", "ID", id);
     */
    var persons = wom.getSessionContext.getContextObject("RISePerson");

    var allOptions="";
    //allOptions += "<option value=':00000000000000000000000000000000'>----";
    var companies = getElements("CompaniesByNameActive");
    var appointment="";

    if (persons.getQualifiedAttribute("customAttributes._attribute15")!=null)
    {
        var appointmentset = persons.getQualifiedAttribute("customAttributes._attribute15").elements();

        if (appointmentset.count()<5)
        {
            allOptions += "<option SELECTED value=':00000000000000000000000000000000'>----";
        }
        else
        {
            allOptions += "<option value=':00000000000000000000000000000000'>----";
            appointment = appointmentset(5);
        }
    }
    else
    {
        allOptions += "<option SELECTED value=':00000000000000000000000000000000'>----";
    }


    for (var i=1; i<=companies.count(); i++)
    {
        if ((appointment!=null) && (appointment!="") && (appointment == companies(i)))
        //if (persons(1).employer == companies(i))
        //if (sch.user.employer == companies(i))
        {
            allOptions += "<OPTION SELECTED value='"+companies(i)+"'>"+companies(i).name;
        }
        else
        {
            allOptions += "<OPTION value='"+companies(i)+"'>"+companies(i).name;
        }
    }
    return allOptions;
}

function getValue(sch)
{
    // Return a string that will be used for
    // the value attribute of this control.
    var persons = wom.getSessionContext.getContextObject("RISePerson");
    return persons.getQualifiedAttribute("customAttributes._attribute21");
}

function getValue(sch)
{
    // Return a string that will be used for
    // the value attribute of this control.
    var persons = wom.getSessionContext.getContextObject("RISePerson");
    return persons.getQualifiedAttribute("customAttributes._attribute22");
}

function getCheckState(sch)
{
    // Return true to have the check box or radio button
    // checked or false to leave it unchecked.
    var persons = wom.getSessionContext.getContextObject("RISePerson");
    var tcpsbool=persons.getQualifiedAttribute("customAttributes._attribute26");
    if (tcpsbool)
    {
        return true;
    }
    else
    {
        return false;
    }
}

function getCheckState(sch)
{
    // Return true to have the check box or radio button
    // checked or false to leave it unchecked.
    var persons = wom.getSessionContext.getContextObject("RISePerson");
    var tcpsbool=persons.getQualifiedAttribute("customAttributes._attribute26");
    if (tcpsbool == null)
    {
        return false;
    }
    else if (!tcpsbool)
    {
        return true;
    }
    else
    {
        return false;
    }
}

function getValue(sch)
{
    // Return a string that will be used for
    // the value attribute of this control.
    var persons = wom.getSessionContext.getContextObject("RISePerson");
    var tcpsdate=persons.getQualifiedAttribute("customAttributes._attribute27");
    if ((tcpsdate!=null)&&(tcpsdate!=""))
    {
        tcpsdate=new Date(tcpsdate);
        return (tcpsdate.getMonth()+1)+"/"+tcpsdate.getDate()+"/"+tcpsdate.getFullYear();
    }
    else
    {
        return tcpsdate;
    }

}

function getValue(sch)
{
    // Return a string that will be used for
    // the value attribute of this control.
    var persons = wom.getSessionContext.getContextObject("RISePerson");
    return persons.getQualifiedAttribute("customAttributes._attribute30");
}

function getValue(sch)
{
    // Return a string that will be used for
    // the value attribute of this control.
    var persons = wom.getSessionContext.getContextObject("RISePerson");
    return persons.getQualifiedAttribute("customAttributes._attribute31");
}

function getValue(sch)
{
    // Return a string that will be used for
    // the value attribute of this control.
    var persons = wom.getSessionContext.getContextObject("RISePerson");
    return persons.getQualifiedAttribute("customAttributes._attribute32");
}