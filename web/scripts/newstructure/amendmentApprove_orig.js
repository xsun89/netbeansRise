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
var typeofApplication = parent.getQualifiedAttribute("customAttributes._attribute195.customAttributes._attribute0");
if ((parent.getQualifiedAttribute("customAttributes._attribute263")) != null) {
    var parentAnimalsUsed = parent.getQualifiedAttribute("customAttributes._attribute263").elements();
    var countAnimals = parentAnimalsUsed.count();
    for (var i = 1; i <= countAnimals; i++) {
        if (amended.getQualifiedAttribute("customAttributes._attribute263") != null) {
            var amendedAnimalsUsed = amended.getQualifiedAttribute("customAttributes._attribute263").elements();
            var countAnimalsUsed = amendedAnimalsUsed.count();
            for (var j = 1; j <= countAnimalsUsed; j++) {
                var strain;
                var housingLocation;
                if (typeofApplication != "Breeding") {
                    strain = "customAttributes.RequestedAnimals.customAttributes._attribute8";
                    housingLocation = "customAttributes.RequestedAnimals.customAttributes._attribute3";
                } else {
                    strain = "customAttributes.RequestedAnimalsBreeding.customAttributes._attribute12";
                    housingLocation = "customAttributes.RequestedAnimalsBreeding.customAttributes._attribute4";
                }
                if ((amendedAnimalsUsed(j).getQualifiedAttribute("customAttributes._attribute4") == parentAnimalsUsed(i).getQualifiedAttribute("customAttributes._attribute4")) 
                    && (amendedAnimalsUsed(j).getQualifiedAttribute(strain) == parentAnimalsUsed(i).getQualifiedAttribute(strain)) 
                    && (amendedAnimalsUsed(j).getQualifiedAttribute("customAttributes._attribute1") == parentAnimalsUsed(i).getQualifiedAttribute("customAttributes._attribute1"))
                    && (amendedAnimalsUsed(j).getQualifiedAttribute(housingLocation) == parentAnimalsUsed(i).getQualifiedAttribute(housingLocation))) 
                {
                    amendedAnimalsUsed(j).setQualifiedAttribute("customAttributes._attribute2", parentAnimalsUsed(i).getQualifiedAttribute("customAttributes._attribute2"));
                    amendedAnimalsUsed(j).setQualifiedAttribute("customAttributes._attribute3", parentAnimalsUsed(i).getQualifiedAttribute("customAttributes._attribute3"));
                    var parentHistory = parentAnimalsUsed(i).getQualifiedAttribute("customAttributes._attribute8");
                   if ((parentHistory != null) && (parentHistory != amendedAnimalsUsed(j).getQualifiedAttribute("customAttributes._attribute8"))) {
                        if (amendedAnimalsUsed(j).getQualifiedAttribute("customAttributes._attribute8") != null) amendedAnimalsUsed(j).getQualifiedAttribute("customAttributes._attribute8").removeAllElements();
                        parentHistory = parentHistory.elements();
                        for (var k = 1; k <= parentHistory.count(); k++) {
                            amendedAnimalsUsed(j).setQualifiedAttribute("customAttributes._attribute8", parentHistory(k), "add");
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

var animals = targetEntity.getQualifiedAttribute("customAttributes._attribute8.customAttributes._attribute329.customAttributes._attribute9");
if (animals != null) {
   var ss = animals.elements();
   for (var i=1; i<=ss.count(); i++) {
//      var fm = ss(i).getQualifiedAttribute("customAttributes._attribute3.customAttributes._attribute2");
      var fm = ss(i).getQualifiedAttribute("customAttributes._attribute3.customAttributes.FacilityManagers");
      if (fm!=null) {
         var fmResult = fm.elements();
         for (var j=1; j<=fmResult.count(); j++) {
            targetEntity.setQualifiedAttribute("customAttributes._attribute8.customAttributes._attribute306", fmResult(j), "add");
         }
      }
   }
}

var animalsBreeding = targetEntity.getQualifiedAttribute("customAttributes._attribute8.customAttributes._attribute330.customAttributes._attribute5");
if (animalsBreeding != null) {
   var ss = animalsBreeding.elements();
   for (var i=1; i<=ss.count(); i++) {
//      var fm = ss(i).getQualifiedAttribute("customAttributes._attribute4.customAttributes._attribute2");
      var fm = ss(i).getQualifiedAttribute("customAttributes._attribute4.customAttributes.FacilityManagers");
      if (fm!=null) {
         var fmResult = fm.elements();
         for (var j=1; j<=fmResult.count(); j++) {
            targetEntity.setQualifiedAttribute("customAttributes._attribute8.customAttributes._attribute306", fmResult(j), "add");
         }
      }
   }
}

// ------------------------------------------------------------------------------------------------------------------------------------------
// 4.  Copy changes back to application
targetEntity.approveAmendment();

// ------------------------------------------------------------------------------------------------------------------------------------------
// copy activties back to original application for new difference viewer in 5.5
var amended = targetEntity.getQualifiedAttribute("customAttributes._attribute8");
var protocol = targetEntity.getQualifiedAttribute("customAttributes._attribute9");
if (amended.activities!=null) {
   protocol.activities.addAll(amended.activities);
}

// ------------------------------------------------------------------------------------------------------------------------------------------
// log an activity on cloned protocol for version compare
var actType;
var actTypeSet = getElements("ActivityTypeForID", "ID", "_Protocol_Increase Minor Version for Amendment");
if (actTypeSet.count() != 1) {
   throw(new Error(-1, "Found "+actTypeSet.count() + " 'Increase Minor Version for Amendment' activity defined on Protocol"));
} else {   
   actType = actTypeSet(1);
}

var act = amended.logActivity(sch, actType, user);


// ------------------------------------------------------------------------------------------------------------------------------------------
// 5.  log an 'Amendment Completed' activity on parent protocol
var actType;
var actTypeSet = getElements("ActivityTypeForID", "ID", "_Protocol_Amendment Completed");
if (actTypeSet.count() != 1) {
   throw(new Error(-1, "Found "+actTypeSet.count() + " 'Amendment Completed' activity defined on Protocol"));
} else {   
   actType = actTypeSet(1);
}

var act = protocol.logActivity(sch, actType, user);
act.setQualifiedAttribute("customAttributes._attribute0", targetEntity);
act.setQualifiedAttribute("customAttributes._attribute1", "Approved");

// ---------------------------------------------------------------------------------------------------------------------------------------------
// 6. Spa 4/28/2004 set parent application template to Approved
//targetEntity.parentProject.resourceContainer.template=wom.getEntityFromString("com.webridge.entity.Entity[OID[2925B4C38B94FD4AB8EDF8A9175E7B16]]");

//---------------------------------------------------------------------------------
// 10. update name and number of species in "Number of Animals Used" activity. Added by David 01-26-2005
//     updated by Vlad. March 17, 2011
//     updated by David. May 14, 2013. Add Breeding logic
//     updated by Xin. March 26, 2014 
//----------------------------------------------------------------------------------
var today = new Date().getVarDate();
var parent = targetEntity.parentProject;
var approvedAnimalsUsed = parent.getQualifiedAttribute("customAttributes._attribute263");
var typeofApplication = parent.getQualifiedAttribute("customAttributes._attribute195.customAttributes._attribute0");
var animalInformation;
if (typeofApplication != "Breeding") 
{
  animalInformation = parent.getQualifiedAttribute("customAttributes._attribute329.customAttributes._attribute9");
} else 
{
  animalInformation = parent.getQualifiedAttribute("customAttributes._attribute330.customAttributes._attribute5");
}
if (animalInformation != null) 
{
  var animals = animalInformation.elements();
  var countAnimals = animals.count();

  for (var i = 1; i <= countAnimals; i++) 
  {
    var species = animals(i).getQualifiedAttribute("customAttributes._attribute0");
    var numAnimalRequestPerYear;
    var housingLocation;
    if (typeofApplication != "Breeding") 
    {
      numAnimalRequestPerYear = animals(i).getQualifiedAttribute("customAttributes._attribute2");
      housingLocation = animals(i).getQualifiedAttribute("customAttributes._attribute3");
    } 
    else 
    {
      numAnimalRequestPerYear = animals(i).getQualifiedAttribute("customAttributes._attribute1");
      housingLocation = animals(i).getQualifiedAttribute("customAttributes._attribute4");
    }
    if (approvedAnimalsUsed != null) 
    {
      var approvedAnimalsUsedItem;
      
      if (typeofApplication != "Breeding") 
      {
        approvedAnimalsUsedItem = approvedAnimalsUsed.query("customAttributes.RequestedAnimals= " + animals(i));
      } 
      else 
      {
        approvedAnimalsUsedItem = approvedAnimalsUsed.query("customAttributes.RequestedAnimalsBreeding= " + animals(i));
      }
      if (approvedAnimalsUsedItem != null) 
      {

        var approvedAnimalsUsedItemElm = approvedAnimalsUsedItem.elements();

        if (approvedAnimalsUsedItemElm.count() > 0) 
        {

          var isChanged = false;
          if (approvedAnimalsUsedItemElm(1).getQualifiedAttribute("customAttributes._attribute1") != numAnimalRequestPerYear) 
          {
            approvedAnimalsUsedItemElm(1).setQualifiedAttribute("customAttributes._attribute1", numAnimalRequestPerYear);
            isChanged = true;
          }
          if (approvedAnimalsUsedItemElm(1).getQualifiedAttribute("customAttributes._attribute4") != species) 
          {
            approvedAnimalsUsedItemElm(1).setQualifiedAttribute("customAttributes._attribute4", species);
            isChanged = true;
          }
          if (approvedAnimalsUsedItemElm(1).getQualifiedAttribute("customAttributes._attribute6") != housingLocation) 
          {
            approvedAnimalsUsedItemElm(1).setQualifiedAttribute("customAttributes._attribute6", housingLocation);
            isChanged = true;
          }

          if (isChanged == true)
            approvedAnimalsUsedItemElm(1).dateModified = today;

          continue;

        }
      }
    }

    // create a temp object
    var tempAnimalsUsed = wom.createEntity("_Approved Animals Used");
    tempAnimalsUsed.setQualifiedAttribute("customAttributes._attribute4", species);
    tempAnimalsUsed.setQualifiedAttribute("customAttributes._attribute1", numAnimalRequestPerYear);
    tempAnimalsUsed.setQualifiedAttribute("customAttributes._attribute6", housingLocation);
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
    parent.setQualifiedAttribute("customAttributes._attribute263", tempAnimalsUsed, "add");
  }
}
// ----------------------------------------------------------------------------------------------------------------------
// 11.  yong 2-19-2005 Update Study Coordinators for PI
CustomUtils.UBC_ChangePI_ACC(targetEntity.parentProject, false);

// update ethics set
CustomUtils.UBC_updateEthicsSet(targetEntity.parentProject);

// DY: 2014.04.10
// 13. copy old Animal Information Data Set to New AI Data Set
//amended.copyOldAIsetToNewAIset();
// 14. Update New Approved Animal Used with new AI Data Set
//amended.updateApprovedAnimalsUsedWithAnimalInformation();
