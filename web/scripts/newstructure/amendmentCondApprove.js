/**
 * 
 */
//---------------------------------------------------------------------------------
// 1. update Number of Animals Used, history from parent application. Added by Vlad September 9, 2011
// Update: David on May 14, 2013. Removed the constrain 'typeofApplication!=Breeding'
// Updated: Xin on March 26, 2014. Add Housing location in Animal information comparision. 
//----------------------------------------------------------------------------------
var today = new Date().getVarDate();
var parent = targetEntity.parentProject;
var amended = targetEntity.getQualifiedAttribute("customAttributes._attribute8");
if ((parent.getQualifiedAttribute("customAttributes.ApprovedAnimalsUsed")) != null) {
    var parentAnimalsUsed = parent.getQualifiedAttribute("customAttributes.ApprovedAnimalsUsed").elements();
    var countAnimals = parentAnimalsUsed.count();
    for (var i = 1; i <= countAnimals; i++) {
        if (amended.getQualifiedAttribute("customAttributes.ApprovedAnimalsUsed") != null) {
            var amendedAnimalsUsed = amended.getQualifiedAttribute("customAttributes.ApprovedAnimalsUsed").elements();
            var countAnimalsUsed = amendedAnimalsUsed.count();
            for (var j = 1; j <= countAnimalsUsed; j++) {
                if ((amendedAnimalsUsed(j).getQualifiedAttribute("customAttributes.Species") == parentAnimalsUsed(i).getQualifiedAttribute("customAttributes.Species")) 
                    && (amendedAnimalsUsed(j).getQualifiedAttribute("customAttributes.NumberOfAnimalsApproved") == parentAnimalsUsed(i).getQualifiedAttribute("customAttributes.NumberOfAnimalsApproved"))) 
                {
                    amendedAnimalsUsed(j).setQualifiedAttribute("customAttributes.NumberOfAnimalsUsed", parentAnimalsUsed(i).getQualifiedAttribute("customAttributes.NumberOfAnimalsUsed"));
                    amendedAnimalsUsed(j).setQualifiedAttribute("customAttributes.NumberOfAnimalsUsedPerCalendarYear", parentAnimalsUsed(i).getQualifiedAttribute("customAttributes.NumberOfAnimalsUsedPerCalendarYear"));
                    var parentHistory = parentAnimalsUsed(i).getQualifiedAttribute("customAttributes.History");
                    if ((parentHistory != null) && (parentHistory != amendedAnimalsUsed(j).getQualifiedAttribute("customAttributes.History"))) 
                    {
                        if (amendedAnimalsUsed(j).getQualifiedAttribute("customAttributes.History") != null) 
                        	amendedAnimalsUsed(j).getQualifiedAttribute("customAttributes.History").removeAllElements();
                        
                        parentHistory = parentHistory.elements();
                        for (var k = 1; k <= parentHistory.count(); k++) {
                            amendedAnimalsUsed(j).setQualifiedAttribute("customAttributes.History", parentHistory(k), "add");
                        };
                    };
                    amendedAnimalsUsed(j).dateModified = today;
                };
            };
        };
    };
};
// ----------------------------------------------------------------------------------------------------------------------------------------
// 2. set approve letter
var newDC=targetEntity.docContentFromString(activity.notesAsStr, "html");
activity.setQualifiedAttribute("customAttributes._attribute0",newDC);

// add by dy Aug 15, 2005
if ((((activity.notesAsStr).toLowerCase()).indexOf("animal care certificate"))!=-1)
{
   //Load approval letter to current approval certificate
   targetEntity.setQualifiedAttribute("customAttributes._attribute8.customAttributes._attribute320.customAttributes._attribute5",newDC);
}
else
{
   //make sure we have the current certificate on the modified protocol (added by dy July 3, 2007)
   targetEntity.setQualifiedAttribute("customAttributes._attribute8.customAttributes._attribute320.customAttributes._attribute5",targetEntity.getQualifiedAttribute("customAttributes._attribute9.customAttributes._attribute320.customAttributes._attribute5"));
}

//Until we get Notification manager to read information from a file, we can use the following implementation.
activity.setQualifiedAttribute("customAttributes._attribute1",activity.notesAsStr);
activity.notesAsStr="<a target=_blank href=\"" + newDC + "\">See Approval Letter</a>";

//Put ACCA notes as new line into notesAsStr (add Vlad 04/26/2005)
var notesStr = activity.notifications;
if ((notesStr != "") && (notesStr != null))
{
      activity.notesAsStr += "<br>" + notesStr;
};
//activity.notifications = null;

// ----------------------------------------------------------------------------------------------------------------------------------------
// 3. clean up current agenda item
targetEntity.setQualifiedAttribute("customAttributes._attribute1", null);

// -------------------------------------------------------------------------------------------------------------------------------------------------
//Set facility managers for notifications.  added by dy Oct 2005 (same logic as Animal application approve activity)
var fms = targetEntity.getQualifiedAttribute("customAttributes._attribute8.customAttributes._attribute306");
if (fms != null) {
   fms.removeAllElements();
}

var animals = targetEntity.getQualifiedAttribute("customAttributes._attribute8.customAttributes.AnimalInformation");
if (animals != null) {
   var ss = animals.elements();
   for (var i=1; i<=ss.count(); i++) {
      var fm = ss(i).getQualifiedAttribute("customAttributes.HousingLocation.customAttributes.FacilityManagers");
      if (fm!=null) {
         var fmResult = fm.elements();
         for (var j=1; j<=fmResult.count(); j++) {
            targetEntity.setQualifiedAttribute("customAttributes._attribute8.customAttributes._attribute306", fmResult(j), "add");
         }
      }
   }
}

// ---------------------------------------------------------------------------------------------------------------------------------------------
// 6. Spa 4/28/2004 set parent application template to Approved
//targetEntity.parentProject.resourceContainer.template=wom.getEntityFromString("com.webridge.entity.Entity[OID[2925B4C38B94FD4AB8EDF8A9175E7B16]]");

// 7. Xin Save Parent Animal Information when the first conditional approval activity and Copy Animal Info from Amendment to Parent
var hadConditionalApproval = targetEntity.getQualifiedAttribute("customAttributes._conditionalApproval"); 
var parentAnimalInfo = parent.getQualifiedAttribute("customAttributes.AnimalInformation");
var amendAnimalInfo = amended.getQualifiedAttribute("customAttributes.AnimalInformation");
if(hadConditionalApproval == null)
{ 
	targetEntity.setQualifiedAttribute("customAttributes.OriginalAnimalInfoCombined", parentAnimalInfo);
} 
parent.setQualifiedAttribute("customAttributes.AnimalInformation", amendAnimalInfo);

//8. Xin 2014.04.08 Set amendment CCAC to parent
var amendCCAC = amended.getQualifiedAttribute("customAttributes._attribute163");
parent.setQualifiedAttribute("customAttributes._attribute163", amendCCAC);

//---------------------------------------------------------------------------------
// 10. update name and number of species in "Number of Animals Used" activity. Added by David 01-26-2005
//     updated by Vlad. March 17, 2011
//     updated by David. May 14, 2013. Add Breeding logic
//     updated by Xin March 26, 2014
//----------------------------------------------------------------------------------
var today = new Date().getVarDate();
var parent = targetEntity.parentProject;
var approvedAnimalsUsed = amended.getQualifiedAttribute("customAttributes.ApprovedAnimalsUsed");
var animalInformation = amended.getQualifiedAttribute("customAttributes.AnimalInformation");
if (animalInformation != null) 
{
  var animals = animalInformation.elements();
  var countAnimals = animals.count();

  for (var i = 1; i <= countAnimals; i++) 
  {
    var species = animals(i).getQualifiedAttribute("customAttributes.Species");
    var numAnimalRequestPerYear = animals(i).getQualifiedAttribute("customAttributes.NumberOfAnimalsRequested");
    var housingLocation = animals(i).getQualifiedAttribute("customAttributes.HousingLocation");

    if (approvedAnimalsUsed != null) 
    {
      var approvedAnimalsUsedItem = approvedAnimalsUsed.query("customAttributes.Species= " + species);
      if (approvedAnimalsUsedItem != null) 
      {
        var approvedAnimalsUsedItemElm = approvedAnimalsUsedItem.elements();
        if (approvedAnimalsUsedItemElm.count() > 0) 
        {
          if (approvedAnimalsUsedItemElm(1).getQualifiedAttribute("customAttributes.NumberOfAnimalsApproved") != numAnimalRequestPerYear) 
          {
        	  approvedAnimalsUsedItemElm(1).setQualifiedAttribute("customAttributes.NumberOfAnimalsApproved", numAnimalRequestPerYear);
        	  approvedAnimalsUsedItemElm(1).dateModified = today;
          }
          continue;
        }
      }
    }

    // create a temp object
    var tempAnimalsUsed = wom.createEntity("_A-Approved Animals Used Summary");
    tempAnimalsUsed.setQualifiedAttribute("customAttributes.Species", species);
    tempAnimalsUsed.setQualifiedAttribute("customAttributes.NumberOfAnimalsApproved", numAnimalRequestPerYear);
    tempAnimalsUsed.dateCreated = today;
    tempAnimalsUsed.dateModified = today;

    // insert the temp object into the set
    amended.setQualifiedAttribute("customAttributes._attribute263", tempAnimalsUsed, "add");
  }
}
parent.setQualifiedAttribute("customAttributes._attribute263", approvedAnimalsUsed);
// ----------------------------------------------------------------------------------------------------------------------
// 11.  yong 2-19-2005 Update Study Coordinators for PI
CustomUtils.UBC_ChangePI_ACC(targetEntity.parentProject, false);

// update ethics set
CustomUtils.UBC_updateEthicsSet(targetEntity.parentProject);

// 7. set Conditional Approval to be true
targetEntity.setQualifiedAttribute("customAttributes._conditionalApproval", true);

// 7. set 'Conditional Expiration Date' based on today
var today = new Date();
var dd = today.getDate();
var mm = today.getMonth()+2; 
var yyyy = today.getFullYear();
var conExpirationDate = new Date(yyyy, mm, dd); 
targetEntity.setQualifiedAttribute("customAttributes._conditionalApprovalExpDate", conExpirationDate);

// DY: 2014.04.10
// 13. copy old Animal Information Data Set to New AI Data Set
//amended.copyOldAIsetToNewAIset();
// 14. Update New Approved Animal Used with new AI Data Set
//amended.updateApprovedAnimalsUsedWithAnimalInformation();
