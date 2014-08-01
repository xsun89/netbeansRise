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
            persons.setQualifiedAttribute("customAttributes.puid", CWLPuID);

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