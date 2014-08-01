function migrateAauToAauSumary() {
    try {
        var debug = true;
        if(debug) wom.log("ACS info: Start for protocol " + this.ID);
        var today = new Date().getVarDate();
        var oldAau = this.getQualifiedAttribute("customAttributes._attribute263");

        var newAau = this.getQualifiedAttribute("customAttributes.ApprovedAnimalsUsed");
        if (newAau != null && newAau.elements().count() >= 0) {
            if(debug) wom.log("ACS warning: Skip this protocol because new AAU has something already for " + this.ID);
            return;
        }
        if ((oldAau == null)) {
            if(debug) wom.log("ACS warning: Skip this protocol because old AAU is null for " + this.ID);
            return;
        }
        oldAau = oldAau.query("customAttributes._attribute4 is not null");
        if (oldAau.elements().count() == 0) {
            if(debug) wom.log("ACS warning: Skip this protocol because there is no species for " + this.ID);
            return;
        }
        var ai = this.getQualifiedAttribute("customAttributes.AnimalInformation");
        if(ai == null || ai.elements().count() == 0)
        {
            if(debug) wom.log("ACS error: Animal information in protocol " + this.ID + " should not be null");
            return;
        }
        var typeofApplication = this.getQualifiedAttribute("customAttributes._attribute195.customAttributes._attribute0");
        var strain;
        var housingLocation;
        var categoryOfInvasiveness;
        if (typeofApplication != "Breeding") {
            strain = "customAttributes.RequestedAnimals.customAttributes._attribute8";
            housingLocation = "customAttributes.RequestedAnimals.customAttributes._attribute3";
            categoryOfInvasiveness = "customAttributes.RequestedAnimals.customAttributes.CategoryOfInvasiveness";
        } else {
            strain = "customAttributes.RequestedAnimalsBreeding.customAttributes._attribute12";
            housingLocation = "customAttributes.RequestedAnimalsBreeding.customAttributes._attribute4";
            categoryOfInvasiveness = "customAttributes.RequestedAnimalsBreeding.customAttributes.CategoryOfInvasiveness";
        }
        var oldAauElements = oldAau.elements();
        var oldAauCount = oldAauElements.count();
        var approvedAnimalInfoMap = {};
        var animalUsedInfoMap = {};
        var speciesInAiMap = {};
        var animalUsedCalMap = {};
        var findDuplicatsMap = {};
        for (var j = 1; j <= oldAauCount; j++) {
            wom.log("ACS info: initialize all map values");
            var species = oldAauElements(j).getQualifiedAttribute("customAttributes._attribute4");
            if(species.ID == null)
            {
                continue;
            }
            var oldAauStrain = oldAauElements(j).getQualifiedAttribute(strain);
            var oldAauApprovedNum = oldAauElements(j).getQualifiedAttribute("customAttributes._attribute1");
            var oldAauHousingLocation = oldAauElements(j).getQualifiedAttribute(housingLocation);
            var oldCategory = oldAauElements(j).getQualifiedAttribute(categoryOfInvasiveness);
            animalUsedInfoMap[species.ID] = 0;
            approvedAnimalInfoMap[species.ID] = 0;
            speciesInAiMap[species.ID] = 0;
            animalUsedCalMap[species.ID] = 0;

            var findDuplicatesKey = species.ID;
            if(oldAauApprovedNum != null)
                findDuplicatesKey += oldAauApprovedNum;
            if(oldAauStrain != null)
                findDuplicatesKey += oldAauStrain;
            if(oldCategory != null)
                findDuplicatesKey += oldCategory;
            if(oldAauHousingLocation != null)
                findDuplicatesKey = findDuplicatesKey + oldAauHousingLocation;
            if(debug) wom.log("ACS info: findDuplicatesKey is " + findDuplicatesKey);
            findDuplicatsMap[findDuplicatesKey] = 0;
        }
        wom.log("ACS info: starting loop through all old AAU");
        for (var j = 1; j <= oldAauCount; j++) {
            newAau = this.getQualifiedAttribute("customAttributes.ApprovedAnimalsUsed");
            var species = oldAauElements(j).getQualifiedAttribute("customAttributes._attribute4");
            if(species.ID == null)
            {
                continue;
            }
            var oldAauStrain = oldAauElements(j).getQualifiedAttribute(strain);
            var oldAauApprovedNum = oldAauElements(j).getQualifiedAttribute("customAttributes._attribute1");
            var oldAauHousingLocation = oldAauElements(j).getQualifiedAttribute(housingLocation);
            var oldCategory = oldAauElements(j).getQualifiedAttribute(categoryOfInvasiveness);
            var findDuplicatesKey = species.ID;
            if(oldAauApprovedNum != null)
                findDuplicatesKey += oldAauApprovedNum;
            if(oldAauStrain != null)
                findDuplicatesKey += oldAauStrain;
            if(oldCategory != null)
                findDuplicatesKey += oldCategory;
            if(oldAauHousingLocation != null)
                findDuplicatesKey = findDuplicatesKey + oldAauHousingLocation;
            if(findDuplicatsMap[findDuplicatesKey] == 0) {
                if (oldAauHousingLocation != null)
                    findDuplicatsMap[findDuplicatesKey] = 1;
            }
            else {
                if(debug) wom.log("ACS warning: skip this old AAU because of duplicates" + findDuplicatesKey);
                continue;
            }

            var preDateCreated = oldAauElements(j).dateCreated;
            var preDateModified = oldAauElements(j).dateModified;
            var oldAauHistory = oldAauElements(j).getQualifiedAttribute("customAttributes._attribute8");
            var newHistoryArray = new Array();
            var speciesInAi = ai.query("customAttributes.Species.ID='" + species.ID + "'");
            if (speciesInAi != null && speciesInAi.elements().count() > 0) {
                approvedAnimalInfoMap[species.ID] = 0;
                var speciesInAiElements = speciesInAi.elements();
                for(var sAi=1; sAi<=speciesInAi.elements().count(); sAi++)
                {
                    var approvedAnimalInAi = speciesInAiElements(sAi).getQualifiedAttribute("customAttributes.NumberOfAnimalsRequested");
                    approvedAnimalInfoMap[species.ID] += Number(approvedAnimalInAi);

                }
                if(debug) wom.log("ACS info: get approved animal number based on new AI " + approvedAnimalInfoMap[species.ID]);
                speciesInAiMap[species.ID] = 1;
            }else
            {
                var numAnimalApprovedInAau = oldAauElements(j).getQualifiedAttribute("customAttributes._attribute1");
                approvedAnimalInfoMap[species.ID] += Number(numAnimalApprovedInAau);
            }
            if(debug) wom.log("ACS info: starting loop through history in this AAU " + species.ID);
            if (oldAauHistory != null && oldAauHistory.elements().count() > 0) {
                var oldAauHisElements = oldAauHistory.elements();
                for (var k = 1; k <= oldAauHisElements.count(); k++) {
                    var comments = oldAauHisElements(k).getQualifiedAttribute("customAttributes.Comments");
                    if(debug) wom.log("ACS info: history comments " + comments);
                    if (comments != null) {
                        if (comments.substring(0, 7) == "eSirius") {
                            if(debug) wom.log("ACS info: Skip this history date and pull from eSirius");
                            continue;
                        }
                    }
                    var hisAnimalUsed = oldAauHisElements(k).getQualifiedAttribute("customAttributes._attribute1");
                    var hisDescription = oldAauHisElements(k).getQualifiedAttribute("customAttributes._attribute3");
                    var hisApprovalDate = oldAauHisElements(k).getQualifiedAttribute("customAttributes._attribute0");
                    var hisDateCreated = oldAauHisElements(k).dateCreated;
                    var hisDateModified = oldAauHisElements(k).dateModified;
                    //wom.log("hisApprovalDate date " + hisApprovalDate);
                    var tempAnimalsUsedHist = wom.createEntity("_A-Approved Animals Used Transaction Log");
                    tempAnimalsUsedHist.setQualifiedAttribute("customAttributes.Comments", comments);
                    tempAnimalsUsedHist.setQualifiedAttribute("customAttributes.AnimalsUsed", hisAnimalUsed);
                    tempAnimalsUsedHist.setQualifiedAttribute("customAttributes.Description", hisDescription);
                    tempAnimalsUsedHist.setQualifiedAttribute("customAttributes.TransactionDate", hisApprovalDate);
                    tempAnimalsUsedHist.dateCreated = hisDateCreated;
                    tempAnimalsUsedHist.dateModified = hisDateModified;
                    if(debug) wom.log("ACS info: created date " + hisDateCreated);
                    var compareDate = getCompareDate();
                    if(debug) wom.log("ACS info: find compareDate " + compareDate);
                    if (hisApprovalDate > compareDate){
                        if(debug) wom.log("ACS info: add animal used number for " + species.ID);
                        animalUsedInfoMap[species.ID] += Number(hisAnimalUsed);
                    }
                    if (hisApprovalDate >= new Date(new Date().getFullYear(), 0, 1)){
                        if(debug) wom.log("ACS info: add cal animal used number for " + species.ID);
                        animalUsedCalMap[species.ID] += Number(hisAnimalUsed);
                    }
                    newHistoryArray.push(tempAnimalsUsedHist);
                }
            }
            if (newAau != null) {
                var aauItem = newAau.query("customAttributes.Species.ID='" + species.ID + "'");

                if (aauItem != null) {
                    var aauItemElments = aauItem.elements();

                    if (aauItemElments.count() > 0) {
                        wom.log("ACS info: Found AAU Summary for species " + species.ID + " already created before");
                        aauItemElments(1).setQualifiedAttribute("customAttributes.NumberOfAnimalsApproved", approvedAnimalInfoMap[species.ID]);
                        aauItemElments(1).dateModified = preDateModified;

                        if (newHistoryArray != null && newHistoryArray.length > 0) {
                            for (var index = 0; index < newHistoryArray.length; index++)
                                aauItemElments(1).setQualifiedAttribute("customAttributes.History", newHistoryArray[index], "add");
                        }
                        aauItemElments(1).setQualifiedAttribute("customAttributes.NumberOfAnimalsUsed", animalUsedInfoMap[species.ID]);
                        aauItemElments(1).setQualifiedAttribute("customAttributes.NumberOfAnimalsUsedPerCalendarYear", animalUsedCalMap[species.ID]);
                        if (speciesInAiMap[species.ID] == 0) {
                            aauItemElments(1).setQualifiedAttribute("customAttributes.HistoricAnimalUsedRecord", true);
                            aauItemElments(1).setQualifiedAttribute("customAttributes.HistoricAnimalUsedRecordDate", null);
                        } else {
                            aauItemElments(1).setQualifiedAttribute("customAttributes.HistoricAnimalUsedRecord", false);
                            aauItemElments(1).setQualifiedAttribute("customAttributes.HistoricAnimalUsedRecordDate", null);
                        }
                        continue;
                    }
                }
            }
            if(debug) wom.log("ACS info: create AAU Summary for species " + species.ID);
            var tempAnimalsUsed = wom.createEntity("_A-Approved Animals Used Summary");
            tempAnimalsUsed.setQualifiedAttribute("customAttributes.Application", this);
            tempAnimalsUsed.setQualifiedAttribute("customAttributes.Species", species);
            tempAnimalsUsed.setQualifiedAttribute("customAttributes.NumberOfAnimalsApproved", approvedAnimalInfoMap[species.ID]);
            tempAnimalsUsed.setQualifiedAttribute("customAttributes.NumberOfAnimalsUsed", animalUsedInfoMap[species.ID]);
            tempAnimalsUsed.setQualifiedAttribute("customAttributes.NumberOfAnimalsUsedPerCalendarYear", animalUsedCalMap[species.ID]);
            tempAnimalsUsed.dateCreated = preDateCreated;
            tempAnimalsUsed.dateModified = preDateModified;
            if (newHistoryArray != null && newHistoryArray.length > 0) {
                for (var index = 0; index < newHistoryArray.length; index++)
                    tempAnimalsUsed.setQualifiedAttribute("customAttributes.History", newHistoryArray[index], "add");
            }

            if (speciesInAiMap[species.ID] == 0) {
                tempAnimalsUsed.setQualifiedAttribute("customAttributes.HistoricAnimalUsedRecord", true);
                tempAnimalsUsed.setQualifiedAttribute("customAttributes.HistoricAnimalUsedRecordDate", null);
            } else {
                tempAnimalsUsed.setQualifiedAttribute("customAttributes.HistoricAnimalUsedRecord", false);
                tempAnimalsUsed.setQualifiedAttribute("customAttributes.HistoricAnimalUsedRecordDate", null);
            }
            this.setQualifiedAttribute("customAttributes.ApprovedAnimalsUsed", tempAnimalsUsed, "add");

        }
        if(debug) wom.log("ACS info: Finish this protocol" + this.ID);
    }
    catch (e) {
        wom.log("ACS error: EXCEPTION _Protocol.migrateAauToAauSumary: " + e.description);
        throw(e);
    }
    function getCompareDate() {
        var debug = true;
        var subProjs = this.projects.query("type = '_Continuing Review' and Status.id = 'Approved'").sort("ID", 105, 0).elements();
        if (subProjs != null && subProjs.count() > 0) {
            for(var s=1; s<=subProjs.count(); s++) {
                var renewalApprovalDate = subProjs(s).dateEnteredState;
                if(debug) wom.log("ACS info: latest renewal approved date " + renewalApprovalDate);
                if (renewalApprovalDate != null && renewalApprovalDate < new Date(new Date().getFullYear(), 0, 25))
                    return renewalApprovalDate;
            }
        }
        var protocolStartDate = this.getQualifiedAttribute("customAttributes._attribute271");

        return protocolStartDate;
    }
}