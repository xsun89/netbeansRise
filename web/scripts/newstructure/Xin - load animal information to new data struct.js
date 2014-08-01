 var executeScript = true;

//DY Comments: need to move the filtering criteria and FOR LOOP to Custom Search
//Think about how to restart the migration after failure (mark it done somehow when successful?)

//DY Comments: Change comments from "?" to wom.log later

var ACCStudies = getResultSet("_protocol").query("id='A13-0033'").elements();
var totalCount = ACCStudies.count();

for (var i=initAppliCount; i<=totalCount ; i++)
{
   var newAi = this.getQualifiedAttribute("customAttributes.AnimalInformation");
   if(newAi != null)
   {
       continue;
   }
   var ACCType = this.getQualifiedAttribute("customAttributes._attribute195.customAttributes._attribute0");
   wom.log("start doing" + this.ID + ": " + ACCType + ": " + this.status.ID);
   if (ACCType=='Breeding')
   {
      var AnimalInformation = this.getQualifiedAttribute("customAttributes._attribute330.customAttributes._attribute5");
      if (AnimalInformation && AnimalInformation.elements().count() > 0)
      {
         AnimalInformation = AnimalInformation.elements();
         for (var j=1; j<=AnimalInformation.count(); j++)
         {
            wom.log(AnimalInformation(j).getQualifiedAttribute("customAttributes._attribute0.customAttributes._attribute0")+ ": " +AnimalInformation(j).getQualifiedAttribute("customAttributes.CategoryOfInvasiveness"));
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
                var dateCreated = AnimalInformation(j).dateCreated;
                var dateModified = AnimalInformation(j).dateModified;

                tempAnimalInfoCombined.setQualifiedAttribute("customAttributes.Application", this);
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
            	
               tempAnimalInfoCombined.dateCreated = dateCreated;
               tempAnimalInfoCombined.dateModified = dateModified;
               tempAnimalInfoCombined.owningEntity = this;
               this.setQualifiedAttribute("customAttributes.AnimalInformation", tempAnimalInfoCombined, "add");
            }
         }
      }
   }else
   {
      var AnimalInformation = this.getQualifiedAttribute("customAttributes._attribute329.customAttributes._attribute9");
      if (AnimalInformation && AnimalInformation.elements.count() > 0)
      {
         AnimalInformation = AnimalInformation.elements();
         for (var j=1; j<=AnimalInformation.count(); j++)
         {
            wom.log(AnimalInformation(j).getQualifiedAttribute("customAttributes._attribute0.customAttributes._attribute0")+ ": " +AnimalInformation(j).getQualifiedAttribute("customAttributes.CategoryOfInvasiveness"));
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
                var dateCreated = AnimalInformation(j).dateCreated;
                var dateModified = AnimalInformation(j).dateModified;

            	tempAnimalInfoCombined.setQualifiedAttribute("customAttributes.Application", this);
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
                tempAnimalInfoCombined.dateCreated = dateCreated;
                tempAnimalInfoCombined.dateModified = dateModified;
                tempAnimalInfoCombined.owningEntity = this;

            	this.setQualifiedAttribute("customAttributes.AnimalInformation", tempAnimalInfoCombined, "add");
             }
         }
      }
   }
}
