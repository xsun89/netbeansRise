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
// 3.  set approval date and expiration date
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
//     Updated by xsun June 26, 2014 use new animal info data model
var fms = targetEntity.getQualifiedAttribute("customAttributes._attribute306");
if (fms != null) {
   fms.removeAllElements();
}

var animals = targetEntity.getQualifiedAttribute("customAttributes.AnimalInformation");
if (animals != null) {
   var ss = animals.elements();
   for (var i=1; i<=ss.count(); i++) {
      var fm = ss(i).getQualifiedAttribute("customAttributes.HousingLocation.customAttributes.FacilityManagers");
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
var approvedAnimalsUsed = targetEntity.getQualifiedAttribute("customAttributes.ApprovedAnimalsUsed");
var today = new Date().getVarDate();
var animalInformation = targetEntity.getQualifiedAttribute("customAttributes.AnimalInformation");
if (animalInformation != null) {
    var animals = animalInformation.elements();
    var countAnimals = animals.count();

    for (var i=1; i <= countAnimals; i++)
    {
        var species = animals(i).getQualifiedAttribute("customAttributes.Species");
        var numAnimalRequestPerYear = animals(i).getQualifiedAttribute("customAttributes.NumberOfAnimalsRequested");
        var housingLocation = animals(i).getQualifiedAttribute("customAttributes.HousingLocation");

        // Xin 2014.02.18 copy data to tempAnimalsUsed from existing Approved Animals Used attribute
        if(approvedAnimalsUsed != null)
        {
            var approvedAnimalsUsedItem = approvedAnimalsUsed.query("customAttributes.Species= " + species); 
            
            if(approvedAnimalsUsedItem != null)
            {
                
                var approvedAnimalsUsedItemElm = approvedAnimalsUsedItem.elements();
                
                if(approvedAnimalsUsedItemElm.count() > 0)
                {
                    if (approvedAnimalsUsedItemElm(1).getQualifiedAttribute("customAttributes.NumberOfAnimalsApproved") != numAnimalRequestPerYear) {
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
        targetEntity.setQualifiedAttribute("customAttributes.ApprovedAnimalsUsed", tempAnimalsUsed, "add");

    }
}

// 6. set 'Conditional Expiration Date' based on today
var today = new Date()
var dd = today.getDate();
var mm = today.getMonth()+2; 
var yyyy = today.getFullYear();
var conExpirationDate = new Date(yyyy, mm, dd); 
targetEntity.setQualifiedAttribute("customAttributes._attribute320.customAttributes._conditionalApprovalExpDate", conExpirationDate);

// DY: 2014.04.10
// 7. copy old Animal Information Data Set to New AI Data Set
//targetEntity.copyOldAIsetToNewAIset();
// 8. Update New Approved Animal Used with new AI Data Set
//targetEntity.updateApprovedAnimalsUsedWithAnimalInformation();
