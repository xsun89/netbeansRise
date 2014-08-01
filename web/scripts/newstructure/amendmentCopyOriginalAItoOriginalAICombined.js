/**
 * Created by sun38 on 7/29/2014.
 */
function amendmentCopyOriginalAItoOriginalAICombined()
{
    try {
        //DY: 2014.04.10: Copying the Animal Information from existing CDT to new CDT
        //1. Get the existing AI CDT (for non-Breeding: _att329._att9, for Breeding: _att330._att5)
        //2. Get the new AI CDT (AnimalInformation) and empty it
        //3. Loop through each record in the existing AI set. For each record, create a new record for the new AI and copy every attribute over
        wom.log("ACS info: start copying AI for " + this.ID);
        var parent = this.parentProject;
        var amended = this.getQualifiedAttribute("customAttributes._attribute8");
        var TypeofApplication = parent.getQualifiedAttribute("customAttributes._attribute195.customAttributes._attribute0");
        var existingAI;
        if (TypeofApplication=="Breeding")
        {
            existingAI = this.getQualifiedAttribute("customAttributes.OriginalAnimalInformationBreeding");
        }
        else
        {
            existingAI = this.getQualifiedAttribute("customAttributes.OriginalAnimalInformation");
        }
        var newAI = this.getQualifiedAttribute("customAttributes.OriginalAnimalInfoCombined");
        if (newAI!=null)
        {
            wom.log("ACS warning: Skip this protocol because new AI has something already " + this.ID);
            return;
        }
        if (existingAI != null)
        {
            existingAI = existingAI.elements();
            for (var i=1; i<=existingAI.count(); i++)
            {
                var newAIEntity = wom.createEntity("_A-Animal Information Combined");
                if (TypeofApplication=="Breeding")
                {
                    newAIEntity.setQualifiedAttribute("customAttributes.Application", amended);
                    newAIEntity.setQualifiedAttribute("customAttributes.CategoryOfInvasiveness", existingAI(i).getQualifiedAttribute("customAttributes.CategoryOfInvasiveness"));
                    newAIEntity.setQualifiedAttribute("customAttributes.HousingLocation", existingAI(i).getQualifiedAttribute("customAttributes._attribute4"));
                    newAIEntity.setQualifiedAttribute("customAttributes.HousingRoomNumber", existingAI(i).getQualifiedAttribute("customAttributes._attribute15"));
                    newAIEntity.setQualifiedAttribute("customAttributes.NumberOfAnimalsRequested", existingAI(i).getQualifiedAttribute("customAttributes._attribute1"));
                    newAIEntity.setQualifiedAttribute("customAttributes.Species", existingAI(i).getQualifiedAttribute("customAttributes._attribute0"));
                    newAIEntity.setQualifiedAttribute("customAttributes.Strain", existingAI(i).getQualifiedAttribute("customAttributes._attribute12"));
                    newAIEntity.setQualifiedAttribute("customAttributes.CategoryProtocolNumbers", existingAI(i).getQualifiedAttribute("customAttributes._attribute6"));
                    newAIEntity.setQualifiedAttribute("customAttributes.DNATransgeneOrGeneDisruputed", existingAI(i).getQualifiedAttribute("customAttributes.DNA_Transgene_Gene_Disrupted"));
                    newAIEntity.setQualifiedAttribute("customAttributes.EstimatedSurplusPerYear", existingAI(i).getQualifiedAttribute("customAttributes._attribute8"));
                    newAIEntity.setQualifiedAttribute("customAttributes.InvestigatorRequestingAnimals", existingAI(i).getQualifiedAttribute("customAttributes._attribute7"));
                    newAIEntity.setQualifiedAttribute("customAttributes.NumberOfOffspringUsed", existingAI(i).getQualifiedAttribute("customAttributes._attribute5"));
                    newAIEntity.setQualifiedAttribute("customAttributes.TransgenicKnockoutBeingCreated", existingAI(i).getQualifiedAttribute("customAttributes.Transgenic_Knockout_Being_Created"));
                    newAIEntity.setQualifiedAttribute("customAttributes.TransgenicOrKnockout", existingAI(i).getQualifiedAttribute("customAttributes._attribute3"));
                }
                else
                {
                    newAIEntity.setQualifiedAttribute("customAttributes.AnimalVendor", existingAI(i).getQualifiedAttribute("customAttributes._attribute6"));
                    newAIEntity.setQualifiedAttribute("customAttributes.Application", amended);
                    newAIEntity.setQualifiedAttribute("customAttributes.AttachmentForAlternativeHousing", existingAI(i).getQualifiedAttribute("customAttributes.Attachment_Alternative_Housing"));
                    newAIEntity.setQualifiedAttribute("customAttributes.CategoryOfInvasiveness", existingAI(i).getQualifiedAttribute("customAttributes.CategoryOfInvasiveness"));
                    newAIEntity.setQualifiedAttribute("customAttributes.ExperimentLocation", existingAI(i).getQualifiedAttribute("customAttributes._attribute4"));
                    newAIEntity.setQualifiedAttribute("customAttributes.ExperimentRoomNumber", existingAI(i).getQualifiedAttribute("customAttributes._attribute7"));
                    newAIEntity.setQualifiedAttribute("customAttributes.HousingLocation", existingAI(i).getQualifiedAttribute("customAttributes._attribute3"));
                    newAIEntity.setQualifiedAttribute("customAttributes.HousingRoomNumber", existingAI(i).getQualifiedAttribute("customAttributes._attribute9"));
                    newAIEntity.setQualifiedAttribute("customAttributes.NumberOfAnimalsRequested", existingAI(i).getQualifiedAttribute("customAttributes._attribute2"));
                    newAIEntity.setQualifiedAttribute("customAttributes.Sex", existingAI(i).getQualifiedAttribute("customAttributes.Sex"));
                    newAIEntity.setQualifiedAttribute("customAttributes.Species", existingAI(i).getQualifiedAttribute("customAttributes._attribute0"));
                    newAIEntity.setQualifiedAttribute("customAttributes.Strain", existingAI(i).getQualifiedAttribute("customAttributes._attribute8"));
                    newAIEntity.setQualifiedAttribute("customAttributes.ThreatenedSpecies", existingAI(i).getQualifiedAttribute("customAttributes._attribute13"));
                    newAIEntity.setQualifiedAttribute("customAttributes.WildAnimalsUsed", existingAI(i).getQualifiedAttribute("customAttributes._attribute10"));
                }
                newAIEntity.dateCreated = existingAI(i).dateCreated;
                newAIEntity.dateModified = existingAI(i).dateModified;
                newAIEntity.owningEntity = amended;
                this.setQualifiedAttribute("customAttributes.AnimalInformation", newAIEntity, "add");
            }
        }else
        {
            wom.log("ACS warning: skip this AI because no old AI " + this.ID);
        }
        wom.log("ACS info: finish copying AI for " + this.ID);
    }
    catch (e) {
        wom.log("ACS error: EXCEPTION _Protocol.copyOldAIsetToNewAIset: " + e.description);
        throw(e);
    }
}