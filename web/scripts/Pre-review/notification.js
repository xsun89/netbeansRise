/**
 * 
 */

function generateHtml(sch) {
	var html = "";
	var targetEntity = sch.CurrentEntity.context;
	var committee = targetEntity.getQualifiedAttribute("customAttributes._attribute99");
	var meetingType = "Full ACC Review";
	var meeting;
	var allmeetings = committee.getQualifiedAttribute("customAttributes._attribute8");
	if (allmeetings != null) {
		/* for future use if we do not care about deadline 
		var t = new Date();
		var d = today.getDate() + 7;
		var m = today.getMpnth();
		var y = today.getFullYear();
		var today = new Date(y, m, d).getTime();
		*/
		var today = new Date().getTime();
		var allAvailableMeetings = allmeetings.query("customAttributes._attribute14>" + today + " and customAttributes._attribute15='" + meetingType + "'");
		allAvailableMeetings = allAvailableMeetings.sort("customAttributes._attribute0", 106, true).elements();
		if (allAvailableMeetings.count() != 0) {
			meeting = allAvailableMeetings(1);
		}
	}
	if (meeting != null) {
		var mydate = new Date(meeting.getQualifiedAttribute("customAttributes._attribute0"));
		var dd = mydate.getDate() - 7;
		var mm = mydate.getMonth();
		var yyyy = mydate.getFullYear();

		var conDate = new Date(yyyy, mm, dd);

		var theyear = conDate.getFullYear();
		var themonth = conDate.getMonth();
		var theday = conDate.getDate();
		var monthes = new Array("January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December");
		var month = monthes[themonth]
		html += "<b>" + month + " " + theday + ", " + theyear + "</b>";
	}
	return html;
}
