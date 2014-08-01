/**
 * Created by sun38 on 7/28/2014.
 */
var executeThis = false;
var applicationId = "";
var newNumberOfAnimalsUsed = -1;
var newNumberOfAnimalsUsedPerCal = -1;
var speciesID = ""
var apps=ApplicationEntity.getResultSet("_Protocol").query("id='" + applicationId + "'").elements();
if(apps == null || apps.count() <= 0)
{
    //? "app is null or empty") + "\n";
    return;
}
var newAau = apps(1).getQualifiedAttribute("customAttributes.ApprovedAnimalsUsed");
if (newAau == null && newAau.count() < 0) {
    //? "entire new aau is null or empty") + "\n";
    return;
}

newAau = newAau.query("customAttributes.Species.ID='" + speciesID + "'").elements();
if (newAau == null && newAau.count() != 1) {
    //? "new aau for this species is null or more than 1") + "\n";
}
// fix the animal used number
var oldAAUNumber = newAau.getQualifiedAttribute("customAttributes.NumberOfAnimalsUsed");
var oldAAUNumberPerCal = newAau.getQualifiedAttribute("customAttributes.NumberOfAnimalsUsedPerCalendarYear");
//? "old animal used number=" + oldAAUNumber +"\n";
//? "old animal used number per calendar year=" + oldAAUNumberPerCal +"\n";
if(newNumberOfAnimalsUsed != -1 && executeThis == true)
    newAau.setQualifiedAttribute("customAttributes.NumberOfAnimalsUsed", newNumberOfAnimalsUsed);
if(newNumberOfAnimalsUsedPerCal != -1 && executeThis == true)
    newAau.setQualifiedAttribute("customAttributes.NumberOfAnimalsUsedPerCalendarYear", newNumberOfAnimalsUsedPerCal);
