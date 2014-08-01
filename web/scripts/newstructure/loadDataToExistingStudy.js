/**
 * 
 */
var executeScript = false;

var ACCStudies = getResultSet("_protocol").query("status.id!='Terminated' and (customAttributes._attribute330.customAttributes._attribute5 is not null OR customAttributes._attribute329.customAttributes._attribute9 is not null)").elements();
var totalCount = ACCStudies.count();
//?totalCount + "\n";

var appliedCount = 0;
var initAppliCount = 1;
var start = new Date().getTime();
var end;
var timespend;

for (var i=initAppliCount; i<=totalCount ; i++)
{
   end = new Date().getTime();
   timespend = end - start;
   if(timespend >= 150000)
   {
      //?"Execution time: " + timespend + "\n";
      break;
   }
   var newAi = ACCStudies(i).getQualifiedAttribute("customAttributes.AnimalInformation");
   if(newAi != null || newAi.elements().count() > 0)
   {
       continue;
   }
   var ACCType = ACCStudies(i).getQualifiedAttribute("customAttributes._attribute195.customAttributes._attribute0");
   //? ACCStudies(i).ID + ": " + ACCType + ": " + ACCStudies(i).status.ID + "\n";
   if (ACCType=='Breeding')
   {
      var AnimalInformation = ACCStudies(i).getQualifiedAttribute("customAttributes._attribute330.customAttributes._attribute5");
      if (AnimalInformation)
      {
         AnimalInformation = AnimalInformation.elements();
         for (var j=1; j<=AnimalInformation.count(); j++)
         {
            //?"\t"+ AnimalInformation(j).getQualifiedAttribute("customAttributes._attribute0.customAttributes._attribute0")+ ": " +AnimalInformation(j).getQualifiedAttribute("customAttributes.CategoryOfInvasiveness")+"\n";
            if (executeScript) 
            {
            	var tempAnimalInfoCombined = wom.createEntity("_A-Animal Information Combined");
            	
            	var categoryOfInvasiveness = AnimalInformation(j).getQualifiedAttribute("customAttributes.CategoryOfInvasiveness");
            	var categoryProtocolNumbers = AnimalInformation(j).getQualifiedAttribute("customAttributes._attribute6");
            	var dnaTransgeneOrGeneDisruputed = AnimalInformation(j).getQualifiedAttribute("customAttributes.DNA_Transgene_Gene_Disrupted");
            	var estimatedSurplusPerYear = AnimalInformation(j).getQualifiedAttribute("customAttributes._attribute8");
            	var housingLocation = AnimalInformation(j).getQualifiedAttribute("customAttributes._attribute4");
            	var housingRoomNumber = AnimalInformation(j).getQualifiedAttribute("customAttributes._attribute15");
            	var investigatorRequestingAnimals = AnimalInformation(j).getQualifiedAttribute("customAttributes._attribute7");
            	var numberOfAnimalsRequested = AnimalInformation(j).getQualifiedAttribute("customAttributes._attribute1");
            	var numberOfOffspringUsed = AnimalInformation(j).getQualifiedAttribute("customAttributes._attribute5");
            	var species = AnimalInformation(j).getQualifiedAttribute("customAttributes._attribute0");
            	var strain = AnimalInformation(j).getQualifiedAttribute("customAttributes._attribute12");
            	var transgenicKnockoutBeingCreated = AnimalInformation(j).getQualifiedAttribute("customAttributes.Transgenic_Knockout_Being_Created");
            	var transgenicOrKnockout = AnimalInformation(j).getQualifiedAttribute("customAttributes._attribute3");
            	
            	tempAnimalInfoCombined.setQualifiedAttribute("customAttributes.Application", ACCStudies(i));
            	tempAnimalInfoCombined.setQualifiedAttribute("customAttributes.CategoryOfInvasiveness", categoryOfInvasiveness);
            	tempAnimalInfoCombined.setQualifiedAttribute("customAttributes.CategoryProtocolNumbers", categoryProtocolNumbers);
            	tempAnimalInfoCombined.setQualifiedAttribute("customAttributes.DNATransgeneOrGeneDisruputed", dnaTransgeneOrGeneDisruputed);
            	tempAnimalInfoCombined.setQualifiedAttribute("customAttributes.EstimatedSurplusPerYear", estimatedSurplusPerYear);
            	tempAnimalInfoCombined.setQualifiedAttribute("customAttributes.HousingLocation", housingLocation);
            	tempAnimalInfoCombined.setQualifiedAttribute("customAttributes.HousingRoomNumber", housingRoomNumber);
            	tempAnimalInfoCombined.setQualifiedAttribute("customAttributes.InvestigatorRequestingAnimals", investigatorRequestingAnimals);
            	tempAnimalInfoCombined.setQualifiedAttribute("customAttributes.NumberOfAnimalsRequested", numberOfAnimalsRequested);
            	tempAnimalInfoCombined.setQualifiedAttribute("customAttributes.NumberOfOffspringUsed", numberOfOffspringUsed);
            	tempAnimalInfoCombined.setQualifiedAttribute("customAttributes.Species", species);
            	tempAnimalInfoCombined.setQualifiedAttribute("customAttributes.Strain", strain);
            	tempAnimalInfoCombined.setQualifiedAttribute("customAttributes.TransgenicKnockoutBeingCreated", transgenicKnockoutBeingCreated);
            	tempAnimalInfoCombined.setQualifiedAttribute("customAttributes.TransgenicOrKnockout", transgenicOrKnockout);
            	
            	ACCStudies(i).setQualifiedAttribute("customAttributes.AnimalInformation", tempAnimalInfoCombined, "add");

            }	
         }
      }
   }else
   {
      var AnimalInformation = ACCStudies(i).getQualifiedAttribute("customAttributes._attribute329.customAttributes._attribute9");
      if (AnimalInformation)
      {
         AnimalInformation = AnimalInformation.elements();
         for (var j=1; j<=AnimalInformation.count(); j++)
         {
            //?"\t"+ AnimalInformation(j).getQualifiedAttribute("customAttributes._attribute0.customAttributes._attribute0")+ ": " +AnimalInformation(j).getQualifiedAttribute("customAttributes.CategoryOfInvasiveness")+"\n";
        	
            if (executeScript) 
            {
            	var tempAnimalInfoCombined = wom.createEntity("_A-Animal Information Combined");
            	
            	var animalVendor = AnimalInformation(j).getQualifiedAttribute("customAttributes._attribute6");
            	var attachmentForAlternativeHousing = AnimalInformation(j).getQualifiedAttribute("customAttributes.Attachment_Alternative_Housing");
            	var categoryOfInvasiveness = AnimalInformation(j).getQualifiedAttribute("customAttributes.CategoryOfInvasiveness");
            	var experimentLocation = AnimalInformation(j).getQualifiedAttribute("customAttributes._attribute4");
            	var experimentRoomNumber = AnimalInformation(j).getQualifiedAttribute("customAttributes._attribute7");
            	var housingLocation = AnimalInformation(j).getQualifiedAttribute("customAttributes._attribute3");
            	var housingRoomNumber = AnimalInformation(j).getQualifiedAttribute("customAttributes._attribute9");
            	var numberOfAnimalsRequested = AnimalInformation(j).getQualifiedAttribute("customAttributes._attribute2");
            	var sex = AnimalInformation(j).getQualifiedAttribute("customAttributes.Sex");
            	var species = AnimalInformation(j).getQualifiedAttribute("customAttributes._attribute0");
            	var strain = AnimalInformation(j).getQualifiedAttribute("customAttributes._attribute8");
            	var threatenedSpecies = AnimalInformation(j).getQualifiedAttribute("customAttributes._attribute13");
            	var wildAnimalsUsed = AnimalInformation(j).getQualifiedAttribute("customAttributes._attribute10");
            	
            	tempAnimalInfoCombined.setQualifiedAttribute("customAttributes.Application", ACCStudies(i));
            	tempAnimalInfoCombined.setQualifiedAttribute("customAttributes.AnimalVendor", animalVendor);
            	tempAnimalInfoCombined.setQualifiedAttribute("customAttributes.AttachmentForAlternativeHousing", attachmentForAlternativeHousing);
            	tempAnimalInfoCombined.setQualifiedAttribute("customAttributes.CategoryOfInvasiveness", categoryOfInvasiveness);
            	tempAnimalInfoCombined.setQualifiedAttribute("customAttributes.ExperimentLocation", experimentLocation);
            	tempAnimalInfoCombined.setQualifiedAttribute("customAttributes.ExperimentRoomNumber", experimentRoomNumber);
            	tempAnimalInfoCombined.setQualifiedAttribute("customAttributes.EstimatedSurplusPerYear", estimatedSurplusPerYear);
            	tempAnimalInfoCombined.setQualifiedAttribute("customAttributes.HousingLocation", housingLocation);
            	tempAnimalInfoCombined.setQualifiedAttribute("customAttributes.HousingRoomNumber", housingRoomNumber);
            	tempAnimalInfoCombined.setQualifiedAttribute("customAttributes.NumberOfAnimalsRequested", numberOfAnimalsRequested);
            	tempAnimalInfoCombined.setQualifiedAttribute("customAttributes.Sex", sex);
            	tempAnimalInfoCombined.setQualifiedAttribute("customAttributes.Species", species);
            	tempAnimalInfoCombined.setQualifiedAttribute("customAttributes.Strain", strain);
            	tempAnimalInfoCombined.setQualifiedAttribute("customAttributes.ThreatenedSpecies", threatenedSpecies);
            	tempAnimalInfoCombined.setQualifiedAttribute("customAttributes.WildAnimalsUsed", wildAnimalsUsed);
            	
            	ACCStudies(i).setQualifiedAttribute("customAttributes.AnimalInformation", tempAnimalInfoCombined, "add");
            }
         }
      }
   }
   end = new Date().getTime();
   timespend = end - start;
   if(timespend >= 150000)
   {
      //?"Execution time: " + timespend + "\n";
      break;
   }
   appliedCount += 1;
   initAppliCount += 1; 

}
//?initAppliCount + "\n";
//?appliedCount + "\n";

