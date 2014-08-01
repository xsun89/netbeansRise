// -------------------------------------------------------------------------------------------------------------------------------------------------
// 1.  set approve letter
var newDC = targetEntity.docContentFromString(activity.notesAsStr, "html");
activity.setQualifiedAttribute("customAttributes._attribute0",newDC);

//Until we get Notification manager to read information from a file, we can use the following implementation.
activity.setQualifiedAttribute("customAttributes._attribute1",activity.notesAsStr);

//Load approval letter on the protocol
targetEntity.setQualifiedAttribute("customAttributes._attribute144",newDC);
activity.notesAsStr = "<a target=_blank href=\"" + newDC + "\">See Approval Letter</a>";

//Load approval letter to current approval certificate attribute (dy: Aug 15, 05)
targetEntity.setQualifiedAttribute("customAttributes._attribute320.customAttributes._attribute5",newDC);

//Put ACCA notes as new line into notesAsStr (add Vlad 03/03/2005)
var notesStr = activity.notifications;
if ((notesStr != "") && (notesStr != null))
{
      activity.notesAsStr += "<br>" + notesStr;
};
//activity.notifications = null;

// --------------------------------------------------------------------------------------------------------------------------------------------------
// 2.  clean up current agenda item,
targetEntity.setQualifiedAttribute("customAttributes._attribute134", null);

// -------------------------------------------------------------------------------------------------------------------------------------------------
// 3.  set approval date and expiration date
var conApproval = targetEntity.getQualifiedAttribute("customAttributes._attribute320.customAttributes._conditionalApproval");
if(conApproval == null || conApproval == false)
{
   var today = new Date().getVarDate();
   var projType = targetEntity.getQualifiedAttribute("customattributes._attribute195.customattributes._attribute0");

   // set 'Date Approved' (attr154) to today
   targetEntity.setQualifiedAttribute("customattributes._attribute154", today);

   // get 'A1B-6A Study Start Date' (attr271)
   var startDate = targetEntity.getQualifiedAttribute("customattributes._attribute271");

   // set 'Expiration Date' (attr141) based on today and startDate
   var exDate = today;
   if (exDate < startDate) exDate = startDate;
   exDate = new Date(Date.parse(exDate));

   var newExpirationDate;
   if (projType == "Pilot Project") {
      newExpirationDate = new Date(exDate.getFullYear(), exDate.getMonth()+3, exDate.getDate());
   } else {
      newExpirationDate = new Date(exDate.getFullYear()+1, exDate.getMonth(), exDate.getDate());
   }

   targetEntity.setQualifiedAttribute("customAttributes._attribute141", newExpirationDate);
}
// -------------------------------------------------------------------------------------------------------------------------------------------------
// 4.  Set facility managers for notifications.  added by yong 9-17-2004
var fms = targetEntity.getQualifiedAttribute("customAttributes._attribute306");
if (fms != null) {
   fms.removeAllElements();
}

var animals = targetEntity.getQualifiedAttribute("customAttributes._attribute329.customAttributes._attribute9");
if (animals != null) {
   var ss = animals.elements();
   for (var i=1; i<=ss.count(); i++) {
//      var fm = ss(i).getQualifiedAttribute("customAttributes._attribute3.customAttributes._attribute2");
      var fm = ss(i).getQualifiedAttribute("customAttributes._attribute3.customAttributes.FacilityManagers");
      if (fm!=null) {
         var fmResult = fm.elements();
         for (var j=1; j<=fmResult.count(); j++) {
            targetEntity.setQualifiedAttribute("customAttributes._attribute306", fmResult(j), "add");
         }
      }
   }
}

var animalsBreeding = targetEntity.getQualifiedAttribute("customAttributes._attribute330.customAttributes._attribute5");
if (animalsBreeding != null) {
   var ss = animalsBreeding.elements();
   for (var i=1; i<=ss.count(); i++) {
//      var fm = ss(i).getQualifiedAttribute("customAttributes._attribute4.customAttributes._attribute2");
      var fm = ss(i).getQualifiedAttribute("customAttributes._attribute4.customAttributes.FacilityManagers");
      if (fm!=null) {
         var fmResult = fm.elements();
         for (var j=1; j<=fmResult.count(); j++) {
            targetEntity.setQualifiedAttribute("customAttributes._attribute306", fmResult(j), "add");
         }
      }
   }
}

//---------------------------------------------------------------------------------
// 5. update name and number of species in "Number of Animals Used" activity. Added by David 01-26-2005
//     updated by Vlad. March 17, 2011
//     updated by David. May 14, 2013 (For ACS project, including Breeding for Number of Animal Used)
//----------------------------------------------------------------------------------
//xin 2014.02.20 create a temp entitySet and remove all items in the original Approved Animals Used attribute
var approvedAnimalsUsed = targetEntity.getQualifiedAttribute("customAttributes._attribute263");
var today = new Date().getVarDate();
var typeofApplication = targetEntity.getQualifiedAttribute("customAttributes._attribute195.customAttributes._attribute0");
var animalInformation;
if (typeofApplication != "Breeding")
{
    animalInformation = targetEntity.getQualifiedAttribute("customAttributes._attribute329.customAttributes._attribute9");
} else
{
    animalInformation = targetEntity.getQualifiedAttribute("customAttributes._attribute330.customAttributes._attribute5");
}
if (animalInformation != null) {
    var animals = animalInformation.elements();
    var countAnimals = animals.count();

    for (var i=1; i <= countAnimals; i++)
    {
        var species = animals(i).getQualifiedAttribute("customAttributes._attribute0");
        var numAnimalRequestPerYear;
        if (typeofApplication != "Breeding")
        {
            numAnimalRequestPerYear = animals(i).getQualifiedAttribute("customAttributes._attribute2");
        } else
        {
            numAnimalRequestPerYear = animals(i).getQualifiedAttribute("customAttributes._attribute1");
        }

        // create a temp object
        var tempAnimalsUsed = wom.createEntity("_Approved Animals Used");
        // Xin 2014.02.18 copy data to tempAnimalsUsed from existing Approved Animals Used attribute
        if(approvedAnimalsUsed != null)
        {
            var approvedAnimalsUsedItem;
            if (typeofApplication != "Breeding")
            {
                approvedAnimalsUsedItem = approvedAnimalsUsed.query("customAttributes.RequestedAnimals= " + animals(i));
            } else
            {
                approvedAnimalsUsedItem = approvedAnimalsUsed.query("customAttributes.RequestedAnimalsBreeding= " + animals(i));
            }
            if(approvedAnimalsUsedItem != null)
            {
                var approvedAnimalsUsedItemElm = approvedAnimalsUsedItem.elements();
                if(approvedAnimalsUsedItemElm.count() > 0)
                {
                    var currentNumAniUsed = approvedAnimalsUsedItemElm(1).getQualifiedAttribute("customAttributes._attribute2");
                    var currentNumAniUsedCalen = approvedAnimalsUsedItemElm(1).getQualifiedAttribute("customAttributes._attribute3");
                    var currentHistory = approvedAnimalsUsedItemElm(1).getQualifiedAttribute("customAttributes._attribute8");
                    var currentHousingLoc = approvedAnimalsUsedItemElm(1).getQualifiedAttribute("customAttributes._attribute6");

                    tempAnimalsUsed.setQualifiedAttribute("customAttributes._attribute2", currentNumAniUsed);
                    tempAnimalsUsed.setQualifiedAttribute("customAttributes._attribute3", currentNumAniUsedCalen);
                    tempAnimalsUsed.setQualifiedAttribute("customAttributes._attribute8", currentHistory);
                    tempAnimalsUsed.setQualifiedAttribute("customAttributes._attribute6", currentHousingLoc);
                    approvedAnimalsUsed.removeElement(approvedAnimalsUsedItemElm(1));
                }
            }
        }
        tempAnimalsUsed.setQualifiedAttribute("customAttributes._attribute4", species);
        tempAnimalsUsed.setQualifiedAttribute("customAttributes._attribute1", numAnimalRequestPerYear);
        if (typeofApplication != "Breeding")
        {
            tempAnimalsUsed.setQualifiedAttribute("customAttributes.RequestedAnimals", animals(i));
        } else
        {
            tempAnimalsUsed.setQualifiedAttribute("customAttributes.RequestedAnimalsBreeding", animals(i));
        }
        tempAnimalsUsed.owningEntity = targetEntity;
        tempAnimalsUsed.dateCreated = today;
        tempAnimalsUsed.dateModified = today;

        // insert the temp object into the set
        targetEntity.setQualifiedAttribute("customAttributes._attribute263", tempAnimalsUsed, "add");

    }
}
// 6. set Conditional Approval in A-ACC Application Extention to be true
targetEntity.setQualifiedAttribute("customAttributes._attribute320.customAttributes._conditionalApproval", true);

var ret = false;
var commmittee_ = targetEntity.getQualifiedAttribute("customAttributes.Committee");
if(commmittee_ != null && commmittee_.ID == "BCCA")
  ret = true;
ret;


  function UBCMeetingAssignment(sch, targetEntity, meetingType, agendaItemType)
{
	try {
		var projectType = targetEntity.getEntityTypeName();
		var committee, pi, dept, studyteam;
		var attrAgendaItem, attrPrimaryReviewer, attrSecondaryReviewer;

		switch (projectType)
		{
			case "_Protocol":
				committee = targetEntity.getQualifiedAttribute("customAttributes._attribute99");
				pi = targetEntity.getQualifiedAttribute("customAttributes._attribute0");
				dept = targetEntity.getQualifiedAttribute("customAttributes._attribute159");
				attrAgendaItem = "customAttributes._attribute134";
				attrPrimaryReviewer = "customAttributes._attribute125";
				attrSecondaryReviewer = "customAttributes._attribute126";
				//Added by S.B. 02-NOV-2004 (To notify reassigned reviewers)
				attrPrimaryReviewerOld = "customAttributes._attribute309";
				attrSecondaryReviewerOld = "customAttributes._attribute310";
				break;

			case "_Human": // 22 Aug, stanley: this block of case code is added for Human project. Some attributes are not setup completely, such as started with //**
				committee = targetEntity.getQualifiedAttribute("customAttributes._attribute4.customAttributes._attribute7.customAttributes._attribute1");
				pi = targetEntity.getQualifiedAttribute("customAttributes._attribute0.customAttributes._attribute0");
				dept = targetEntity.getQualifiedAttribute("customAttributes._attribute8");
				attrAgendaItem = "customAttributes._attribute24.customAttributes._attribute7";
				attrPrimaryReviewer = "customAttributes._attribute24.customAttributes._attribute3";
				attrSecondaryReviewer = "customAttributes._attribute24.customAttributes._attribute4";
				//Added by S.B. 02-NOV-2004 (To notify reassigned reviewers)
				attrPrimaryReviewerOld = "customAttributes._attribute24.customAttributes._attribute5";
				attrSecondaryReviewerOld = "customAttributes._attribute24.customAttributes._attribute6";
				break;

			case "_Human-Amendments": // Jan 30, 2006, Vlad
				committee = targetEntity.getQualifiedAttribute("customAttributes._attribute10.customAttributes._attribute4.customAttributes._attribute7.customAttributes._attribute1");
				pi = targetEntity.getQualifiedAttribute("customAttributes._attribute10.customAttributes._attribute0.customAttributes._attribute0");
				dept = targetEntity.getQualifiedAttribute("customAttributes._attribute10.customAttributes._attribute8");
				attrAgendaItem = "customAttributes._attribute23.customAttributes._attribute7";
				attrPrimaryReviewer = "customAttributes._attribute23.customAttributes._attribute3";
				attrSecondaryReviewer = "customAttributes._attribute23.customAttributes._attribute4";
				//Added by S.B. 02-NOV-2004 (To notify reassigned reviewers)
				attrPrimaryReviewerOld = "customAttributes._attribute23.customAttributes._attribute5";
				attrSecondaryReviewerOld = "customAttributes._attribute23.customAttributes._attribute6";
				break;

			case "_Amendment":
			case "_Continuing Review":
				committee = targetEntity.parentProject.getQualifiedAttribute("customAttributes._attribute99");
				pi = targetEntity.parentProject.getQualifiedAttribute("customAttributes._attribute0");
				dept = targetEntity.parentProject.getQualifiedAttribute("customAttributes._attribute159");
				attrAgendaItem = "customAttributes._attribute1";
				attrPrimaryReviewer = "customAttributes._attribute2";
				attrSecondaryReviewer = "customAttributes._attribute3";
				break;

			case "_Conflict of Interest":
				committee = targetEntity.getQualifiedAttribute("customAttributes._attribute20.customAttributes._attribute4");
				pi = targetEntity.getQualifiedAttribute("customAttributes._attribute14");
				dept = targetEntity.getQualifiedAttribute("customAttributes._attribute20.customAttributes._attribute3");
				attrAgendaItem = "customAttributes._attribute20.customAttributes._attribute6";
				attrPrimaryReviewer = null;
				attrSecondaryReviewer = null;
				break;

			case "_Conflict of Interest Amendment Renewal":
				var modCOI = targetEntity.getQualifiedAttribute("customAttributes._attribute0");
				committee = modCOI.getQualifiedAttribute("customAttributes._attribute20.customAttributes._attribute4");
				pi = modCOI.getQualifiedAttribute("customAttributes._attribute14");
				dept = modCOI.getQualifiedAttribute("customAttributes._attribute20.customAttributes._attribute3");
				attrAgendaItem = "customAttributes._attribute2";
				attrPrimaryReviewer = null;
				attrSecondaryReviewer = null;
				break;
			case "_Biosafety":
				committee = targetEntity.getQualifiedAttribute("customAttributes.BiosafetyExtension.customAttributes.Committee");
				pi = targetEntity.getQualifiedAttribute("customAttributes.View1StudyTeam.customAttributes.PrincipalInvestigator");
				dept = targetEntity.getQualifiedAttribute("customAttributes.BiosafetyExtension.customAttributes.ReqDeptApp");
				attrAgendaItem = "customAttributes.BiosafetyExtension.customAttributes.CurrentAgendaItem";
				attrPrimaryReviewer = "customAttributes.BiosafetyExtension.customAttributes.Reviewer_Primary";
				attrSecondaryReviewer = "customAttributes.BiosafetyExtension.customAttributes.Reviewer_Secondary";
				attrPrimaryReviewerOld = "customAttributes.BiosafetyExtension.customAttributes.R_Reviewer_Primary";
				attrSecondaryReviewerOld = "customAttributes.BiosafetyExtension.customAttributes.R_Reviewer_Secondary";
				break;
			case "_Biosafety PAA":
				committee = targetEntity.parentProject.getQualifiedAttribute("customAttributes.BiosafetyExtension.customAttributes.Committee");
				pi = targetEntity.parentProject.getQualifiedAttribute("customAttributes.View1StudyTeam.customAttributes.PrincipalInvestigator");
				dept = targetEntity.parentProject.getQualifiedAttribute("customAttributes.BiosafetyExtension.customAttributes.ReqDeptApp");
				attrAgendaItem = "customAttributes.PAAExtension.customAttributes.CurrentAgendaItem";
				attrPrimaryReviewer = "customAttributes.PAAExtension.customAttributes.Reviewer_Primary";
				attrSecondaryReviewer = "customAttributes.PAAExtension.customAttributes.Reviewer_Secondary";
				attrPrimaryReviewerOld = "customAttributes.PAAExtension.customAttributes.R_Reviewer_Primary";
				attrSecondaryReviewerOld = "customAttributes.PAAExtension.customAttributes.R_Reviewer_Secondary";
				break;

			default:
				throw(new Error(-1, "Not supported project type: "+projectType));
		}
	//********************************************************************************************************
	//********************************************************************************************************
	//********************************************************************************************************
	switch (projectType)
		{
			case "_Protocol":
				// find next available meeting depends on meeting type and deadline
				var allmeetings = committee.getQualifiedAttribute("customAttributes._attribute8");
				if (allmeetings==null) {
				   throw(new Error(-1, "No future meeting is scheduled, please go to "+committee.name+" Committee work space and create future meetings"));
				}
				var today = new Date().getTime();
				var allAvailableMeetings = allmeetings.query("customAttributes._attribute14>"+today+" and customAttributes._attribute15='"+meetingType+"'");
				allAvailableMeetings = allAvailableMeetings.sort("customAttributes._attribute0", 106, true).elements();
				if (allAvailableMeetings.count() == 0) {
				   throw(new Error(-1, "No future meeting is available, please go to "+committee.name+" Committee work space and create future meetings"));
				}
				var meeting = allAvailableMeetings(1);

				// create agenda item
				var agendaItem = wom.createEntity("_Agenda Item");
				//Jan 27, Stan:if the calling project is Human, then get the meeting value from user manually selected one
				//stan: The following condition need to be finished for the other project types for example, COI, PAA...
				if (projectType!="_Human")
					agendaItem.setQualifiedAttribute("customAttributes._attribute0", meeting);
				agendaItem.setQualifiedAttribute("customAttributes._attribute3", pi);
				agendaItem.setQualifiedAttribute("customAttributes._attribute26", agendaItemType);

				// set project on agenda item
				agendaItem.setQualifiedAttribute("customAttributes._attribute24", targetEntity);
				targetEntity.setQualifiedAttribute(attrAgendaItem, agendaItem);

				// Dec 2005 added by Yong
				// Since Human and HPAA doesn't use this method and COI doesn't need reviewers
				// following code only applies to Animal Care
				if (projectType=="_Protocol" || projectType=="_Amendment" || projectType=="_Continuing Review")
				{
					var app = targetEntity;
					if (projectType=="_Amendment" || projectType=="_Continuing Review") {
						app = targetEntity.parentProject;
					}
					// _attribute30 is a strong type reference of Animal Care. might set it for display purpose
					agendaItem.setQualifiedAttribute("customAttributes._attribute30", app);

					// Select the primary and secondary reviewers
					// Keep old reviewers if they exist
					var pr = targetEntity.getQualifiedAttribute(attrPrimaryReviewer);
					var sr = targetEntity.getQualifiedAttribute(attrSecondaryReviewer);

					if (meetingType == "Full ACC Review") {
						if (pr==null && sr==null && projectType=="_Protocol") {
							// if another app of this PI is in the meeting, pick the reviewer of it
							var itemsSet = meeting.getQualifiedAttribute("customAttributes._attribute2");
							if (itemsSet != null){
								var items = itemsSet.elements();
								for (var i=1; i<=items.count(); i++)
								{
									var temp=items(i).getQualifiedAttribute("customAttributes._attribute24");
									if (temp!=null && temp.getEntityTypeName()==projectType
										&& temp.getQualifiedAttribute("customAttributes._attribute0")==pi) {
										pr = temp.getQualifiedAttribute(attrPrimaryReviewer);
										sr = temp.getQualifiedAttribute(attrSecondaryReviewer);
										break;
									}
								}
							}
						}
						if (pr==null) pr = findReviewer(committee, dept, sr, app);
						if (sr==null) sr = findReviewer(committee, dept, pr, app);
					}
					else if (meetingType != "ACC Expedited Provisos Review") {
						// One line above. Vlad June 6, 2011. Issue 4076.

						// For Expedited Review, assign ACCC as Primary, ACCV as Secondary
						pr = null;
						sr = null;
					}

					targetEntity.setQualifiedAttribute(attrPrimaryReviewer, pr);
					targetEntity.setQualifiedAttribute(attrSecondaryReviewer, sr);

					//Added by S.B. 02-NOV-2004 (To notify reassigned reviewers)
					if (projectType=="_Protocol") {
						targetEntity.setQualifiedAttribute(attrPrimaryReviewerOld, pr);
						targetEntity.setQualifiedAttribute(attrSecondaryReviewerOld, sr);
					}

					// increase the number of application in review of reviewers
					// Vlad June 6, 2011. Issue 4076.
					if (meetingType != "ACC Expedited Provisos Review"){
						if (pr!=null) {
							var count=pr.getQualifiedAttribute("customAttributes._attribute12");
							pr.setQualifiedAttribute("customAttributes._attribute12", count+1);
							meeting.setQualifiedAttribute("customAttributes._attribute11", pr, "add");
						};
						if (sr!=null) {
							var count=sr.getQualifiedAttribute("customAttributes._attribute12");
							sr.setQualifiedAttribute("customAttributes._attribute12", count+1);
							meeting.setQualifiedAttribute("customAttributes._attribute11", sr, "add");
						};
					};

					// copy to agenda item
					agendaItem.setQualifiedAttribute("customAttributes._attribute4", pr);
					agendaItem.setQualifiedAttribute("customAttributes._attribute5", sr);
				}

				//add the agenda item to the set of agenda items on the meeting
				meeting.setQualifiedAttribute("customAttributes._attribute2", agendaItem, "add");
				sch.invalidateCache(""+meeting);
				break;

			case "_Human": // 22 Aug, stanley: this block of case code is added for Human project. Some attributes are not setup completely, such as started with //**
				// Get agenda item and meeting
				// find next available meeting depends on meeting type and deadline
				var agendaItem = targetEntity.getQualifiedAttribute(attrAgendaItem);
				if (agendaItem==null){
					var allmeetings = committee.getQualifiedAttribute("customAttributes._attribute8");
					if (allmeetings==null) {
					   throw(new Error(-1, "No future meeting is scheduled, please go to "+committee.name+" Committee work space and create future meetings"));
					}
					var today = new Date().getTime();
					var allAvailableMeetings = allmeetings.query("customAttributes._attribute14>"+today+" and customAttributes._attribute15='"+meetingType+"'");
					allAvailableMeetings = allAvailableMeetings.sort("customAttributes._attribute0", 106, true).elements();
					if (allAvailableMeetings.count() == 0) {
					   throw(new Error(-1, "No future meeting is available, please go to "+committee.name+" Committee work space and create future meetings"));
					}
					var meeting = allAvailableMeetings(1);

					// create agenda item
					var agendaItem = wom.createEntity("_Agenda Item");
					agendaItem.setQualifiedAttribute("customAttributes._attribute0", meeting)
					// set project on agenda item
					agendaItem.setQualifiedAttribute("customAttributes._attribute24", targetEntity);
					targetEntity.setQualifiedAttribute(attrAgendaItem, agendaItem);
					var agendaItem = targetEntity.getQualifiedAttribute(attrAgendaItem);

				};
				var meeting = agendaItem.getQualifiedAttribute("customAttributes._attribute0");
				// Vlad. Nov 06, 2006
				if (meeting==null){
					var allmeetings = committee.getQualifiedAttribute("customAttributes._attribute8");
					if (allmeetings==null) {
					   throw(new Error(-1, "No future meeting is scheduled, please go to "+committee.name+" Committee work space and create future meetings"));
					}
					var today = new Date().getTime();
					var allAvailableMeetings = allmeetings.query("customAttributes._attribute14>"+today+" and customAttributes._attribute15='"+meetingType+"'");
					allAvailableMeetings = allAvailableMeetings.sort("customAttributes._attribute0", 106, true).elements();
					if (allAvailableMeetings.count() == 0) {
					   throw(new Error(-1, "No future meeting is available, please go to "+committee.name+" Committee work space and create future meetings"));
					}
					var meeting = allAvailableMeetings(1);

					// set meeting on agenda item
					agendaItem.setQualifiedAttribute("customAttributes._attribute0", meeting)
				};

				// Set agenda item type
				agendaItem.setQualifiedAttribute("customAttributes._attribute26", agendaItemType);

				// set project on agenda item
				agendaItem.setQualifiedAttribute("customAttributes._attribute24", targetEntity);
				agendaItem.setQualifiedAttribute("customAttributes._attribute3", pi);

				//add the agenda item to the set of agenda items on the meeting
				meeting.setQualifiedAttribute("customAttributes._attribute2", agendaItem, "add");
				sch.invalidateCache(""+meeting);
				break;

			case "_Human-Amendments": // Jan 30, 2006, Vlad
				// Get agenda item and meeting
				var agendaItem = targetEntity.getQualifiedAttribute(attrAgendaItem);
				if (agendaItem==null){
					var allmeetings = committee.getQualifiedAttribute("customAttributes._attribute8");
					if (allmeetings==null) {
					   throw(new Error(-1, "No future meeting is scheduled, please go to "+committee.name+" Committee work space and create future meetings"));
					}
					var today = new Date().getTime();
					var allAvailableMeetings = allmeetings.query("customAttributes._attribute14>"+today+" and customAttributes._attribute15='"+meetingType+"'");
					allAvailableMeetings = allAvailableMeetings.sort("customAttributes._attribute0", 106, true).elements();
					if (allAvailableMeetings.count() == 0) {
					   throw(new Error(-1, "No future meeting is available, please go to "+committee.name+" Committee work space and create future meetings"));
					}
					var meeting = allAvailableMeetings(1);

					// create agenda item
					var agendaItem = wom.createEntity("_Agenda Item");
					agendaItem.setQualifiedAttribute("customAttributes._attribute0", meeting)
					// set project on agenda item
					agendaItem.setQualifiedAttribute("customAttributes._attribute24", targetEntity);
					targetEntity.setQualifiedAttribute(attrAgendaItem, agendaItem);
					var agendaItem = targetEntity.getQualifiedAttribute(attrAgendaItem);
				};
				var meeting = agendaItem.getQualifiedAttribute("customAttributes._attribute0");

				// Set agenda item type
				agendaItem.setQualifiedAttribute("customAttributes._attribute26", agendaItemType);
				agendaItem.setQualifiedAttribute("customAttributes.paa_type", targetEntity.getQualifiedAttribute("customAttributes._attribute8.customAttributes._attribute8"));
				agendaItem.setQualifiedAttribute("customAttributes._attribute3", pi);

				// set project on agenda item
				agendaItem.setQualifiedAttribute("customAttributes._attribute24", targetEntity);

				//add the agenda item to the set of agenda items on the meeting
				meeting.setQualifiedAttribute("customAttributes._attribute2", agendaItem, "add");
				sch.invalidateCache(""+meeting);
				break;

			case "_Amendment":
			case "_Continuing Review":
				// find next available meeting depends on meeting type and deadline
				var allmeetings = committee.getQualifiedAttribute("customAttributes._attribute8");
				if (allmeetings==null) {
				   throw(new Error(-1, "No future meeting is scheduled, please go to "+committee.name+" Committee work space and create future meetings"));
				}
				var today = new Date().getTime();
				var allAvailableMeetings = allmeetings.query("customAttributes._attribute14>"+today+" and customAttributes._attribute15='"+meetingType+"'");
				allAvailableMeetings = allAvailableMeetings.sort("customAttributes._attribute0", 106, true).elements();
				if (allAvailableMeetings.count() == 0) {
				   throw(new Error(-1, "No future meeting is available, please go to "+committee.name+" Committee work space and create future meetings"));
				}
				var meeting = allAvailableMeetings(1);

				// create agenda item
				var agendaItem = wom.createEntity("_Agenda Item");
				//Jan 27, Stan:if the calling project is Human, then get the meeting value from user manually selected one
				//stan: The following condition need to be finished for the other project types for example, COI, PAA...
				if (projectType!="_Human")
					agendaItem.setQualifiedAttribute("customAttributes._attribute0", meeting);
				agendaItem.setQualifiedAttribute("customAttributes._attribute3", pi);
				agendaItem.setQualifiedAttribute("customAttributes._attribute26", agendaItemType);

				// set project on agenda item
				agendaItem.setQualifiedAttribute("customAttributes._attribute24", targetEntity);
				targetEntity.setQualifiedAttribute(attrAgendaItem, agendaItem);

				// Dec 2005 added by Yong
				// Since Human and HPAA doesn't use this method and COI doesn't need reviewers
				// following code only applies to Animal Care
				if (projectType=="_Protocol" || projectType=="_Amendment" || projectType=="_Continuing Review")
				{
					var app = targetEntity;
					if (projectType=="_Amendment" || projectType=="_Continuing Review") {
						app = targetEntity.parentProject;
					}
					// _attribute30 is a strong type reference of Animal Care. might set it for display purpose
					agendaItem.setQualifiedAttribute("customAttributes._attribute30", app);

					// Select the primary and secondary reviewers
					// Keep old reviewers if they exist
					var pr = targetEntity.getQualifiedAttribute(attrPrimaryReviewer);
					var sr = targetEntity.getQualifiedAttribute(attrSecondaryReviewer);

					if (meetingType == "Full ACC Review") {
						if (pr==null && sr==null && projectType=="_Protocol") {
							// if another app of this PI is in the meeting, pick the reviewer of it
							var items = meeting.getQualifiedAttribute("customAttributes._attribute2").elements();
							for (var i=1; i<=items.count(); i++)
							{
								var temp=items(i).getQualifiedAttribute("customAttributes._attribute24");
								if (temp!=null && temp.getEntityTypeName()==projectType
									&& temp.getQualifiedAttribute("customAttributes._attribute0")==pi) {
									pr = temp.getQualifiedAttribute(attrPrimaryReviewer);
									sr = temp.getQualifiedAttribute(attrSecondaryReviewer);
									break;
								}
							}
						}
						if (pr==null) pr = findReviewer(committee, dept, sr, app);
						if (sr==null) sr = findReviewer(committee, dept, pr, app);
					}
					else {
						// For Expedited Review, assign ACCC as Primary, ACCV as Secondary
						pr = null;
						sr = null;
					}

					targetEntity.setQualifiedAttribute(attrPrimaryReviewer, pr);
					targetEntity.setQualifiedAttribute(attrSecondaryReviewer, sr);

					//Added by S.B. 02-NOV-2004 (To notify reassigned reviewers)
					if (projectType=="_Protocol") {
						targetEntity.setQualifiedAttribute(attrPrimaryReviewerOld, pr);
						targetEntity.setQualifiedAttribute(attrSecondaryReviewerOld, sr);
					}

					// increase the number of application in review of reviewres
					if (pr!=null) {
						var count=pr.getQualifiedAttribute("customAttributes._attribute12");
						pr.setQualifiedAttribute("customAttributes._attribute12", count+1);
						meeting.setQualifiedAttribute("customAttributes._attribute11", pr, "add");
					}
					if (sr!=null) {
						var count=sr.getQualifiedAttribute("customAttributes._attribute12");
						sr.setQualifiedAttribute("customAttributes._attribute12", count+1);
						meeting.setQualifiedAttribute("customAttributes._attribute11", sr, "add");
					}

					// copy to agenda item
					agendaItem.setQualifiedAttribute("customAttributes._attribute4", pr);
					agendaItem.setQualifiedAttribute("customAttributes._attribute5", sr);
				}

				//add the agenda item to the set of agenda items on the meeting
				meeting.setQualifiedAttribute("customAttributes._attribute2", agendaItem, "add");
				sch.invalidateCache(""+meeting);
				break;

			case "_Conflict of Interest":
				// find next available meeting depends on meeting type and deadline
				var allmeetings = committee.getQualifiedAttribute("customAttributes._attribute8");
				if (allmeetings==null) {
				   throw(new Error(-1, "No future meeting is scheduled, please go to "+committee.name+" Committee work space and create future meetings"));
				}
				var today = new Date().getTime();
				var allAvailableMeetings = allmeetings.query("customAttributes._attribute14>"+today+" and customAttributes._attribute15='"+meetingType+"'");
				allAvailableMeetings = allAvailableMeetings.sort("customAttributes._attribute0", 106, true).elements();
				if (allAvailableMeetings.count() == 0) {
				   throw(new Error(-1, "No future meeting is available, please go to "+committee.name+" Committee work space and create future meetings"));
				}
				var meeting = allAvailableMeetings(1);

				// create agenda item
				var agendaItem = wom.createEntity("_Agenda Item");
				//Jan 27, Stan:if the calling project is Human, then get the meeting value from user manually selected one
				//stan: The following condition need to be finished for the other project types for example, COI, PAA...
				if (projectType!="_Human")
					agendaItem.setQualifiedAttribute("customAttributes._attribute0", meeting);
				agendaItem.setQualifiedAttribute("customAttributes._attribute3", pi);
				agendaItem.setQualifiedAttribute("customAttributes._attribute26", agendaItemType);

				// set project on agenda item
				agendaItem.setQualifiedAttribute("customAttributes._attribute24", targetEntity);
				targetEntity.setQualifiedAttribute(attrAgendaItem, agendaItem);

				// Dec 2005 added by Yong
				// Since Human and HPAA doesn't use this method and COI doesn't need reviewers
				// following code only applies to Animal Care
				if (projectType=="_Protocol" || projectType=="_Amendment" || projectType=="_Continuing Review")
				{
					var app = targetEntity;
					if (projectType=="_Amendment" || projectType=="_Continuing Review") {
						app = targetEntity.parentProject;
					}
					// _attribute30 is a strong type reference of Animal Care. might set it for display purpose
					agendaItem.setQualifiedAttribute("customAttributes._attribute30", app);

					// Select the primary and secondary reviewers
					// Keep old reviewers if they exist
					var pr = targetEntity.getQualifiedAttribute(attrPrimaryReviewer);
					var sr = targetEntity.getQualifiedAttribute(attrSecondaryReviewer);

					if (meetingType == "Full ACC Review") {
						if (pr==null && sr==null && projectType=="_Protocol") {
							// if another app of this PI is in the meeting, pick the reviewer of it
							var items = meeting.getQualifiedAttribute("customAttributes._attribute2").elements();
							for (var i=1; i<=items.count(); i++)
							{
								var temp=items(i).getQualifiedAttribute("customAttributes._attribute24");
								if (temp!=null && temp.getEntityTypeName()==projectType
									&& temp.getQualifiedAttribute("customAttributes._attribute0")==pi) {
									pr = temp.getQualifiedAttribute(attrPrimaryReviewer);
									sr = temp.getQualifiedAttribute(attrSecondaryReviewer);
									break;
								}
							}
						}
						if (pr==null) pr = findReviewer(committee, dept, sr, app);
						if (sr==null) sr = findReviewer(committee, dept, pr, app);
					}
					else {
						// For Expedited Review, assign ACCC as Primary, ACCV as Secondary
						pr = null;
						sr = null;
					}

					targetEntity.setQualifiedAttribute(attrPrimaryReviewer, pr);
					targetEntity.setQualifiedAttribute(attrSecondaryReviewer, sr);

					//Added by S.B. 02-NOV-2004 (To notify reassigned reviewers)
					if (projectType=="_Protocol") {
						targetEntity.setQualifiedAttribute(attrPrimaryReviewerOld, pr);
						targetEntity.setQualifiedAttribute(attrSecondaryReviewerOld, sr);
					}

					// increase the number of application in review of reviewres
					if (pr!=null) {
						var count=pr.getQualifiedAttribute("customAttributes._attribute12");
						pr.setQualifiedAttribute("customAttributes._attribute12", count+1);
						meeting.setQualifiedAttribute("customAttributes._attribute11", pr, "add");
					}
					if (sr!=null) {
						var count=sr.getQualifiedAttribute("customAttributes._attribute12");
						sr.setQualifiedAttribute("customAttributes._attribute12", count+1);
						meeting.setQualifiedAttribute("customAttributes._attribute11", sr, "add");
					}

					// copy to agenda item
					agendaItem.setQualifiedAttribute("customAttributes._attribute4", pr);
					agendaItem.setQualifiedAttribute("customAttributes._attribute5", sr);
				}

				//add the agenda item to the set of agenda items on the meeting
				meeting.setQualifiedAttribute("customAttributes._attribute2", agendaItem, "add");
				sch.invalidateCache(""+meeting);
				break;

			case "_Conflict of Interest Amendment Renewal":
				// find next available meeting depends on meeting type and deadline
				var allmeetings = committee.getQualifiedAttribute("customAttributes._attribute8");
				if (allmeetings==null) {
				   throw(new Error(-1, "No future meeting is scheduled, please go to "+committee.name+" Committee work space and create future meetings"));
				}
				var today = new Date().getTime();
				var allAvailableMeetings = allmeetings.query("customAttributes._attribute14>"+today+" and customAttributes._attribute15='"+meetingType+"'");
				allAvailableMeetings = allAvailableMeetings.sort("customAttributes._attribute0", 106, true).elements();
				if (allAvailableMeetings.count() == 0) {
				   throw(new Error(-1, "No future meeting is available, please go to "+committee.name+" Committee work space and create future meetings"));
				}
				var meeting = allAvailableMeetings(1);
				// create agenda item
				var agendaItem = wom.createEntity("_Agenda Item");
				//Jan 27, Stan:if the calling project is Human, then get the meeting value from user manually selected one
				//stan: The following condition need to be finished for the other project types for example, COI, PAA...
				if (projectType!="_Human")
					agendaItem.setQualifiedAttribute("customAttributes._attribute0", meeting);
				agendaItem.setQualifiedAttribute("customAttributes._attribute3", pi);
				agendaItem.setQualifiedAttribute("customAttributes._attribute26", agendaItemType);

				// set project on agenda item
				agendaItem.setQualifiedAttribute("customAttributes._attribute24", targetEntity);
				targetEntity.setQualifiedAttribute(attrAgendaItem, agendaItem);

				// Dec 2005 added by Yong
				// Since Human and HPAA doesn't use this method and COI doesn't need reviewers
				// following code only applies to Animal Care
				if (projectType=="_Protocol" || projectType=="_Amendment" || projectType=="_Continuing Review")
				{
					var app = targetEntity;
					if (projectType=="_Amendment" || projectType=="_Continuing Review") {
						app = targetEntity.parentProject;
					}
					// _attribute30 is a strong type reference of Animal Care. might set it for display purpose
					agendaItem.setQualifiedAttribute("customAttributes._attribute30", app);

					// Select the primary and secondary reviewers
					// Keep old reviewers if they exist
					var pr = targetEntity.getQualifiedAttribute(attrPrimaryReviewer);
					var sr = targetEntity.getQualifiedAttribute(attrSecondaryReviewer);

					if (meetingType == "Full ACC Review") {
						if (pr==null && sr==null && projectType=="_Protocol") {
							// if another app of this PI is in the meeting, pick the reviewer of it
							var items = meeting.getQualifiedAttribute("customAttributes._attribute2").elements();
							for (var i=1; i<=items.count(); i++)
							{
								var temp=items(i).getQualifiedAttribute("customAttributes._attribute24");
								if (temp!=null && temp.getEntityTypeName()==projectType
									&& temp.getQualifiedAttribute("customAttributes._attribute0")==pi) {
									pr = temp.getQualifiedAttribute(attrPrimaryReviewer);
									sr = temp.getQualifiedAttribute(attrSecondaryReviewer);
									break;
								}
							}
						}
						if (pr==null) pr = findReviewer(committee, dept, sr, app);
						if (sr==null) sr = findReviewer(committee, dept, pr, app);
					}
					else {
						// For Expedited Review, assign ACCC as Primary, ACCV as Secondary
						pr = null;
						sr = null;
					}

					targetEntity.setQualifiedAttribute(attrPrimaryReviewer, pr);
					targetEntity.setQualifiedAttribute(attrSecondaryReviewer, sr);

					//Added by S.B. 02-NOV-2004 (To notify reassigned reviewers)
					if (projectType=="_Protocol") {
						targetEntity.setQualifiedAttribute(attrPrimaryReviewerOld, pr);
						targetEntity.setQualifiedAttribute(attrSecondaryReviewerOld, sr);
					}

					// increase the number of application in review of reviewres
					if (pr!=null) {
						var count=pr.getQualifiedAttribute("customAttributes._attribute12");
						pr.setQualifiedAttribute("customAttributes._attribute12", count+1);
						meeting.setQualifiedAttribute("customAttributes._attribute11", pr, "add");
					}
					if (sr!=null) {
						var count=sr.getQualifiedAttribute("customAttributes._attribute12");
						sr.setQualifiedAttribute("customAttributes._attribute12", count+1);
						meeting.setQualifiedAttribute("customAttributes._attribute11", sr, "add");
					}

					// copy to agenda item
					agendaItem.setQualifiedAttribute("customAttributes._attribute4", pr);
					agendaItem.setQualifiedAttribute("customAttributes._attribute5", sr);
				}

				//add the agenda item to the set of agenda items on the meeting
				meeting.setQualifiedAttribute("customAttributes._attribute2", agendaItem, "add");
				sch.invalidateCache(""+meeting);
				break;

			case "_Biosafety":
			case "_Biosafety PAA":

				// Find next available meeting depending on meeting type and deadline
				var allmeetings = committee.getQualifiedAttribute("customAttributes._attribute8");
				if (allmeetings==null) {
				   throw(new Error(-1, "No future meeting is scheduled, please go to "+committee.name+" Committee work space and create future meetings"));
				}
				var today = new Date().getTime();
				var allAvailableMeetings = allmeetings.query("customAttributes._attribute14>"+today+" and customAttributes._attribute15='"+meetingType+"'");
				allAvailableMeetings = allAvailableMeetings.sort("customAttributes._attribute0", 106, true).elements();
				if (allAvailableMeetings.count() == 0) {
				   throw(new Error(-1, "No future meeting is available, please go to "+committee.name+" Committee work space and create future meetings"));
				}
				var meeting = allAvailableMeetings(1);

				// Create agenda item
				var agendaItem = wom.createEntity("_Agenda Item");

				//Jan 27, Stan:if the calling project is Human, then get the meeting value from user manually selected one
				//stan: The following condition need to be finished for the other project types for example, COI, PAA...
				agendaItem.setQualifiedAttribute("customAttributes._attribute0", meeting);
				agendaItem.setQualifiedAttribute("customAttributes._attribute3", pi);
				agendaItem.setQualifiedAttribute("customAttributes._attribute26", agendaItemType);

				// Set project on agenda item
				agendaItem.setQualifiedAttribute("customAttributes._attribute24", targetEntity);
				targetEntity.setQualifiedAttribute(attrAgendaItem, agendaItem);

				// Assign Primary and Secondary Reviewers
				if (projectType=="_Biosafety" || projectType=="_Biosafety PAA")
				{
					var app = targetEntity;
					if (projectType=="_Biosafety PAA") {
						app = targetEntity.parentProject;
					}

					//Don't need it for Biosafety - remove later
					// _attribute30 is a strong type reference of Animal Care. might set it for display purpose
					//agendaItem.setQualifiedAttribute("customAttributes._attribute30", app);

					// Select the primary and secondary reviewers
					// Keep old reviewers if they exist
					var pr = targetEntity.getQualifiedAttribute(attrPrimaryReviewer);
					var sr = targetEntity.getQualifiedAttribute(attrSecondaryReviewer);

					if (meetingType == "Full BIO Review") {
						if (pr==null && sr==null && projectType=="_Biosafety") {
							// If another app of this PI is in the meeting, pick the reviewer of it
							var itemsSet = meeting.getQualifiedAttribute("customAttributes._attribute2");
							if (itemsSet != null){
								var items = itemsSet.elements();
								for (var i=1; i<=items.count(); i++)
								{
									var temp=items(i).getQualifiedAttribute("customAttributes._attribute24");
									if (temp!=null && temp.getEntityTypeName()==projectType
										&& temp.getQualifiedAttribute("customAttributes.View1StudyTeam.customAttributes.PrincipalInvestigator")==pi) {
										pr = temp.getQualifiedAttribute(attrPrimaryReviewer);
										sr = temp.getQualifiedAttribute(attrSecondaryReviewer);
										break;
									}
								}
							}
						}
						if (pr==null) pr = findBioReviewer(committee, dept, sr, app);
						if (sr==null) sr = findBioReviewer(committee, dept, pr, app);
					}
					else {
						// For Expedited Review, assign ACCC as Primary, ACCV as Secondary
						pr = null;
						sr = null;
					}

					targetEntity.setQualifiedAttribute(attrPrimaryReviewer, pr);
					targetEntity.setQualifiedAttribute(attrSecondaryReviewer, sr);

					// Notify reassigned reviewers)
					if (projectType=="_Biosafety"){
						targetEntity.setQualifiedAttribute(attrPrimaryReviewerOld, pr);
						targetEntity.setQualifiedAttribute(attrSecondaryReviewerOld, sr);
					}

					// Increase the number of application in review of reviewres
					if (pr!=null) {
						var count=pr.getQualifiedAttribute("customAttributes._attribute12");
						pr.setQualifiedAttribute("customAttributes._attribute12", count+1);
						meeting.setQualifiedAttribute("customAttributes._attribute11", pr, "add");
					}
					if (sr!=null) {
						var count=sr.getQualifiedAttribute("customAttributes._attribute12");
						sr.setQualifiedAttribute("customAttributes._attribute12", count+1);
						meeting.setQualifiedAttribute("customAttributes._attribute11", sr, "add");
					}

					// copy to agenda item
					agendaItem.setQualifiedAttribute("customAttributes._attribute4", pr);
					agendaItem.setQualifiedAttribute("customAttributes._attribute5", sr);
				}

				// Add the agenda item to the set of agenda items on the meeting
				meeting.setQualifiedAttribute("customAttributes._attribute2", agendaItem, "add");
				sch.invalidateCache(""+meeting);
				break;

			default:
				throw(new Error(-1, "Not supported project type: "+projectType));
		}

	}
	catch (e) {
		wom.log("EXCEPTION CustomUtils.UBCMeetingAssignment: " + e.description);
		throw(e);
	}
}

var apps = getResultSet("_protocol").query("id='A10-0171'").elements();
var targetEntity = apps(1);
var awardOfficer = targetEntity.getQualifiedAttribute("customAttributes._attribute35).elements();
?awardOfficer.count() + "\n";

//var ent = wom.getEntityFromString("com.webridge.entity.Entity[OID[138A5A2B8CE1494E9543AD8098D9CFC9]]");
//com.webridge.entity.Entity%5BOID%5B6275702FC6B5EA4E86A6D147D70911FB%5D%5D
//?ent.getEntityTypeName()+"\n";
//?ent.displayName+"\n";
//?"ent.ID: "+ent.ID+"\n";
//?ent.projecttype+"\n";
//?ent.template.name+"\n";
//?ent.template.ID+"\n";
//Shields, Bonnie <bshields@bccancer.bc.ca>
//var person = ApplicationEntity.getResultSet("Person").query("lastName='Graham' and firstName='Deborah'");
//? person.elements().item(1).firstName.toUpperCase() + "," + person.elements().item(1).lastName +"\n";
//? person.elements().item(1).ID + "\n";
var apps = getResultSet("_Amendment").query("id='A10-0171-A023'").elements();
var targetEntity = apps(1);
?targetEntity + "\n";
var awardOfficer = targetEntity.getQualifiedAttribute("customAttributes._attribute33");
?awardOfficer.count() + "\n";
? awardOfficer.elements().item(1).firstName.toUpperCase() + "," + awardOfficer.elements().item(1).lastName +"\n";

if((targetEntity.getQualifiedAttribute("customAttributes._attribute8.customAttributes._attribute270") != null) && ( targetEntity.getQualifiedAttribute("customAttributes._attribute36") != null))
   ?"first true" + "\n";

if(targetEntity.getQualifiedAttribute("customAttributes._attribute34") != null)
   ?"second true" + "\n";


/*Display only when the state is conditional approval*/
var boolRender = false;
var entProjectWorkspace = sch.currentEntity;
var targetEntity = entProjectWorkspace.resource;
var projState= targetEntity.status.ID;
if(projState == "ACC Staff Screening" || projState == "Assigned for Pre-Review" ||  projState == "Pre-Review Changes Requested" ||  projState == "Assigned for Full Review" ||  projState == "Assigned for Expedited Review" || projState == "Meeting Complete" || projState == "Proviso Meeting Complete" || projState == "Conditional Approval")
   boolRender = true;
var curUser = Person.getCurrentUser();
if(curUser != null){
    var userRoleSet = curUser.roles;
    var userRoleSetElements = userRoleSet.elements();
    for(var i=1; i<userRoleSetElements.count(); i++)
    {
        if(userRoleSetElements(i).ID == "ACC Administrator" && projState != "Approved"){
        	boolRender = true;
        	break;
        }                                           
    }
}
boolRender;

