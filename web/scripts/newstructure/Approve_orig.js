/**
 * 
 */
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
// 3.  set approval date and expiration date (Xin modified on 12/03/2014)
var conApproval = targetEntity.getQualifiedAttribute("customAttributes._attribute320.customAttributes._conditionalApproval");
if(conApproval == null)
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
// 9. update name and number of species in "Number of Animals Used" activity. Added by David 01-26-2005
//     updated by Vlad. March 17, 2011
//     updated by David. May 14, 2013 (For ACS project, including Breeding for Number of Animal Used)
//----------------------------------------------------------------------------------
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
        var housingLocation;

        if (typeofApplication != "Breeding")
        {
            numAnimalRequestPerYear = animals(i).getQualifiedAttribute("customAttributes._attribute2");
            housingLocation = animals(i).getQualifiedAttribute("customAttributes._attribute3");
        } else
        {
            numAnimalRequestPerYear = animals(i).getQualifiedAttribute("customAttributes._attribute1");
            housingLocation = animals(i).getQualifiedAttribute("customAttributes._attribute4");
        }

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
                    var isChanged = false;
                    if (approvedAnimalsUsedItemElm(1).getQualifiedAttribute("customAttributes._attribute1") != numAnimalRequestPerYear) {
                        approvedAnimalsUsedItemElm(1).setQualifiedAttribute("customAttributes._attribute1", numAnimalRequestPerYear);
                        isChanged = true;                    
                    }
                    if (approvedAnimalsUsedItemElm(1).getQualifiedAttribute("customAttributes._attribute4") != species) {
                       approvedAnimalsUsedItemElm(1).setQualifiedAttribute("customAttributes._attribute4", species);
                        isChanged = true;
                    }
                    if (approvedAnimalsUsedItemElm(1).getQualifiedAttribute("customAttributes._attribute6") != housingLocation) {
                       approvedAnimalsUsedItemElm(1).setQualifiedAttribute("customAttributes._attribute6", housingLocation);
                        isChanged = true;
                    }

                    if(isChanged == true)
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
        targetEntity.setQualifiedAttribute("customAttributes._attribute263", tempAnimalsUsed, "add");

    }
}
// ----------------------------------------------------------------------------------------------------------------------------------------------
// 6.  clone application to maintain a copy of originally approved application
// com.webridge.entity.Entity[OID[AD59C87C8A4B9640AA5CAD735F36C425]]  Reference to workspace

targetEntity.clone(targetEntity, "for original");

// DY: 2014.04.10
// 7. copy old Animal Information Data Set to New AI Data Set
//targetEntity.copyOldAIsetToNewAIset();
// 8. Update New Approved Animal Used with new AI Data Set
//targetEntity.updateApprovedAnimalsUsedWithAnimalInformation();
