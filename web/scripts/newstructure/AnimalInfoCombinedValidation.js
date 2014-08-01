/**
 * 
 */

//DY: 2013.11.26: Need to calculate the Max Category of Invasiveness and populate the result to _att163

//1. get the protocol by using 'rootEntity'
//2. get the Animal Information set and find the Max Category of Invasiveness
//3. since the new CDT is not under rootEntity, need to compare the Max to the TargetEntity CCAC
//4. set the Max value to _att163

var newCDTCCAC = targetEntity.getQualifiedAttribute("customAttributes.CategoryOfInvasiveness");
var maxCCAC = newCDTCCAC;

var protocol = rootEntity;
wom.log("protocol is: "+protocol.id);
var setOfAnimalInfoCombined = protocol.getQualifiedAttribute("customAttributes.AnimalInformation");
if (setOfAnimalInfoCombined!=null)
{
   setOfAnimalInfoCombined = setOfAnimalInfoCombined.sort("customAttributes.CategoryOfInvasiveness.customAttributes._attribute1", 105, false).elements();
   if (setOfAnimalInfoCombined!=null && setOfAnimalInfoCombined.count()>0)
   {
      var currentMaxCCAC = setOfAnimalInfoCombined(1).getQualifiedAttribute("customAttributes.CategoryOfInvasiveness");
      if (newCDTCCAC.getQualifiedAttribute("customAttributes._attribute1") < currentMaxCCAC.getQualifiedAttribute("customAttributes._attribute1")) maxCCAC = currentMaxCCAC;
      wom.log("max CCAC: "+maxCCAC);
   }
}
protocol.setQualifiedAttribute("customAttributes._attribute163", maxCCAC);
