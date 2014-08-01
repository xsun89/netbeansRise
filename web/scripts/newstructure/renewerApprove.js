/**
 * 
 */
// ------------------------------------------------------------------------------------------------------------------------
// RQ 2004-10-18 Installed on RISe
// RQ 2004-09-07 check parent apps renewal counter to restrict number of
// renewals to two
// ------------------------------------------------------------------------------------------------------------------------
// var protocol = targetEntity.parentProject;
var protocol = targetEntity
		.getQualifiedAttribute("customattributes._attribute9");
var renewalCount = protocol
		.getQualifiedAttribute("customattributes._attribute305");
var projType = protocol
		.getQualifiedAttribute("customattributes._attribute195.customattributes._attribute0");

// RQ 2004-09-07 converted this to a variable for testing
var renewalLimit = 3;

// if application is a pilot project, only allow 1 renewal
if (projType == "Pilot Project")
	renewalLimit = 1;

// ------------------------------------------------------------------------------------------------------------
// Only applications within 3 years of first approval or start date should be
// allowed to renew
// added by David 01-26-2005
// change to 4 years (dy: march 30, 2009)
// ------------------------------------------------------------------------------------------------------------
var dateNow = new Date();
var dateToCheck = new Date(dateNow.getFullYear() - 4, dateNow.getMonth(),
		dateNow.getDate());
var dateApproved = protocol
		.getQualifiedAttribute("customattributes._attribute154");
var dateStarted = protocol
		.getQualifiedAttribute("customattributes._attribute271");
if (dateApproved <= dateStarted) {
	var dateToCheckAgainst = dateStarted;
} else {
	var dateToCheckAgainst = dateApproved;
}
if (dateToCheckAgainst <= dateToCheck) {
	throw (new Error(
			-1,
			"<p><div style='background-color: yellow'><big><b>This Renewal cannot be approved because the maximum application time period of 3 years has been exceeded</b></big></div><p>"));
}

if ((renewalCount >= renewalLimit)) {
	throw (new Error(-1,
			"<p><big><b>This Renewal cannot be approved because the maximum of "
					+ renewalLimit
					+ " renewal(s) has been reached</b></big><p>"));
} else {
	// update counter in parent App
	renewalCount++;
	protocol.setQualifiedAttribute("customattributes._attribute305",
			renewalCount);
}

// /////////////////////////////////////////////////////////////////////////////////////////
// set approve letter
var newDC = targetEntity.docContentFromString(activity.notesAsStr, "html");
activity.setQualifiedAttribute("customAttributes._attribute0", newDC);

// add by dy Aug 15, 2005
if ((((activity.notesAsStr).toLowerCase()).indexOf("animal care certificate")) != -1) {
	// Load approve letter to current approval certificate
	targetEntity
			.setQualifiedAttribute(
					"customAttributes._attribute9.customAttributes._attribute320.customAttributes._attribute5",
					newDC);
}

// Until we get Notification manager to read information from a file, we can use
// the following implementation.
activity.setQualifiedAttribute("customAttributes._attribute1",
		activity.notesAsStr);
activity.notesAsStr = "<a target=_blank href=\"" + newDC
		+ "\">See Approval Letter</a>";

// Put ACCA notes as new line into notesAsStr (add Vlad 04/26/2005)
var notesStr = activity.notifications;
if ((notesStr != "") && (notesStr != null)) {
	activity.notesAsStr += "<br>" + notesStr;
};
// activity.notifications = null;

// /////////////////////////////////////////////////////////////////////////////////////////
// clean up current agenda item
targetEntity.setQualifiedAttribute("customAttributes._attribute1", null);

// ////////////////////////////////////////////////////////////////////////////////////////
// log an 'Continuing Review Completed' activity on parent protocol
// var protocol = targetEntity.parentProject;
var actType;
var actTypeSet = getElements("ActivityTypeForID", "ID",
		"_Protocol_Continuing Report Completed");
if (actTypeSet.count() != 1) {
	throw (new Error(
			-1,
			"Found "
					+ actTypeSet.count()
					+ " 'Continuing Review Completed' activities defined on Protocol"));
} else {
	actType = actTypeSet(1);
}

var act = protocol.logActivity(sch, actType, user);
act.setQualifiedAttribute("customAttributes._attribute0", targetEntity);
act.setQualifiedAttribute("customAttributes._attribute1", "Approved");

// //
// ------------------------------------------------------------------------------------------------------------------------
// // Yong 2004-10-21 Update Approval Date and Expiration Date of parent
// application
// //
// ------------------------------------------------------------------------------------------------------------------------
// var today = new Date();
// var projType =
// protocol.getQualifiedAttribute("customattributes._attribute195.customattributes._attribute0");

// // set 'Date Approved' (attr154) to today

// protocol.setQualifiedAttribute("customattributes._attribute154", today);

// var newExpirationDate;
// if (projType == "Pilot Project") {
// newExpirationDate = new Date(today.getFullYear(), today.getMonth()+3,
// today.getDate());
// } else {
// newExpirationDate = new Date(today.getFullYear()+1, today.getMonth(),
// today.getDate());
// }
// var oldExpirationDate =
// protocol.getQualifiedAttribute("customAttributes._attribute141");
// if (oldExpirationDate!=null && oldExpirationDate>newExpirationDate) {
// newExpirationDate = oldExpirationDate;
// }
// protocol.setQualifiedAttribute("customAttributes._attribute141",
// newExpirationDate);

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Sergei changed - change dates for clones too (Yong 2004-10-21 Update Approval
// Date and Expiration Date of parent application)
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------
var today = new Date();
// var projType =
// protocol.getQualifiedAttribute("customattributes._attribute195.customattributes._attribute0");
var appID = protocol.getQualifiedAttribute("ID");

// DO NOT CHANGE DATE APPROVED. (Vlad Feb 27, 2006).
// We have to change date approved for current application and NOT approved
// amendments (Vlad May 26, 2006)
// set 'Date Approved' (attr154) to today
protocol.setQualifiedAttribute("customattributes._attribute154", today);

// DY: 2013.10.11 New Policy on expiration extention
// Instead of adding another year (or 3 months) as of the date of Renewal
// approval,
// add another year (or 3 months) to the previous expiration date
/*
 * if (projType == "Pilot Project") { newExpirationDate = new
 * Date(today.getFullYear(), today.getMonth()+3, today.getDate()); } else {
 * newExpirationDate = new Date(today.getFullYear()+1, today.getMonth(),
 * today.getDate()); }
 */

// Vlad. Feb 18, 2014. Issue 4603. Move Expiration date calculation to the
// Project Type method
var newExpirationDate = new Date(targetEntity.getExpirationDate());

/*
 * var oldExpirationDate =
 * protocol.getQualifiedAttribute("customAttributes._attribute141"); var
 * newExpirationDate=new Date(Date.parse(oldExpirationDate));; if (projType ==
 * "Pilot Project") { newExpirationDate = new
 * Date(newExpirationDate.getFullYear(), newExpirationDate.getMonth()+3,
 * newExpirationDate.getDate()); } else { newExpirationDate = new
 * Date(newExpirationDate.getFullYear()+1, newExpirationDate.getMonth(),
 * newExpirationDate.getDate()); }
 */

// DY: 2013.10.11 Commenting out the following code... unsure why it was there
/*
 * if (oldExpirationDate!=null && oldExpirationDate>newExpirationDate) {
 * newExpirationDate = oldExpirationDate; }
 */
protocol.setQualifiedAttribute("customAttributes._attribute141",
		newExpirationDate);

var clones = ApplicationEntity.getResultSet("_Protocol").query("ID like '"
		+ appID + "-%'");
var ces = clones.elements();
var countClones = ces.count();
// throw(new Error(-1, countClones+" "+ces(1).ID+" "+ces(2).ID));
for (var i = 1; i <= countClones; i++) {
	var clone = ces(i);
	// set Expiration date for clone
	clone.setQualifiedAttribute("customAttributes._attribute141",
			newExpirationDate);

	// DO NOT CHANGE DATE APPROVED. (Vlad Feb 27, 2006)
	// We have to change date approved for current application and NOT approved
	// amendments (Vlad May 26, 2006)
	// set date Approved for clone
	if (clone.status.id == "Modification Open")
		clone.setQualifiedAttribute("customattributes._attribute154", today);
	sch.invalidateCache("" + clone);
}

// ***************************************************************************************************
// Set number of Number of "Animals Used" back to 0 upon Renewal approval. Added
// by Vlad 03-10-2005
// ***************************************************************************************************

var animalsUsed = protocol
		.getQualifiedAttribute("customAttributes.ApprovedAnimalsUsed");

if (animalsUsed != null) {
	var animalsUsedResult = animalsUsed.elements();
	var countAnimalsUsed = animalsUsedResult.count();

	for (var j = 1; j <= countAnimalsUsed; j++) {
		// insert 0 into the field
		animalsUsedResult(j).setQualifiedAttribute(
				"customAttributes.NumberOfAnimalsUsed", 0);
	};
};

// ***************************************************************************************************
// set state for parent application to Approved. Vlad (Oct. 16, 2006).
// ***************************************************************************************************

var projstates = getResultSet("ProjectStatus")
		.query("ID='Approved' AND projectType='_Protocol'").elements();
if (projstates.count() != 1) {
	throw new Error(
			-1,
			"Change status for parent application: Failed to find projectstate 'Approved' for protocol project");
}
protocol.status = projstates.item(1);

// -------------------------------------------------------------------------------------------------------------------------------------------------
// Vlad. June 23, 2014. Issue 4690. Set facility managers for notifications
// (same logic as Animal application approve activity)

var fms = protocol.getQualifiedAttribute("customAttributes._attribute306");
if (fms != null) {
	fms.removeAllElements();
}
var animals = protocol
		.getQualifiedAttribute("customAttributes.AnimalInformation");
if (animals != null) {
	var ss = animals.elements();
	for (var i = 1; i <= ss.count(); i++) {
		var fm = ss(i)
				.getQualifiedAttribute("customAttributes.HousingLocation.customAttributes.FacilityManagers");
		if (fm != null) {
			var fmResult = fm.elements();
			for (var j = 1; j <= fmResult.count(); j++) {
				protocol.setQualifiedAttribute(
						"customAttributes._attribute306", fmResult(j), "add");
			}
		}
	}
}
