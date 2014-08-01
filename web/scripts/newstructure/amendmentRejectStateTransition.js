/**
 * 
 */
// Xin Copy Original Animal Info to Parent
var hadConditionalApproval = targetEntity.getQualifiedAttribute("customAttributes._conditionalApproval"); 
if(hadConditionalApproval == true)
{
   var parent = targetEntity.parentProject;
   var amended = targetEntity.getQualifiedAttribute("customAttributes._attribute8");
   var origAmendAnimalInfo = targetEntity.getQualifiedAttribute("customAttributes.OriginalAnimalInfoCombined");
   parent.setQualifiedAttribute("customAttributes.AnimalInformation", origAmendAnimalInfo);
   
   // Reset original value of Category of Invasiveness
   if (origAmendAnimalInfo !=null)
   {
      origAmendAnimalInfo = origAmendAnimalInfo.sort("customAttributes.CategoryOfInvasiveness.customAttributes._attribute1", 105, false).elements();
      if (origAmendAnimalInfo != null && origAmendAnimalInfo.count()>0)
      {
         var maxCCAC= origAmendAnimalInfo(1).getQualifiedAttribute("customAttributes.CategoryOfInvasiveness");
         wom.log("Original CCAC is " + maxCCAC);
         parent.setQualifiedAttribute("customAttributes._attribute163", maxCCAC);
      }
   }

   // ----------------------------------------------------------------------------------------------------------------------
   //  Send protocol to eSirius 
   // ----------------------------------------------------------------------------------------------------------------------
   customUtils.pushAnimalCareServicesApprovedProtocol(parent.ID); 
}
