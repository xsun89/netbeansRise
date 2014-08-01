function migrateAauToAauSumary() {
    try {
        wom.log("running for protocol " + this.ID);
        var today = new Date().getVarDate();
        var oldAau = this.getQualifiedAttribute("customAttributes._attribute263");
        var newAau = this.getQualifiedAttribute("customAttributes.ApprovedAnimalsUsed");
        if (newAau != null && newAau.elements().count() >= 0) {
            wom.log("Skip this protocol because new AAU has something already" + this.ID);
            return;
        }
        if (oldAau == null ) {
            wom.log("Skip this protocol because old AAU is null" + this.ID);
            return;
        }
        oldAau = oldAau.query("customAttributes._attribute4 is not null");
        if(oldAau.elements().count() == 0) {
            wom.log("Skip this protocol because old AAU is empty" + this.ID);
            return;
        }
        var ai = this.getQualifiedAttribute("customAttributes.AnimalInformation");
        if(ai == null || ai.elements().count() == 0)
        {
            wom.log("bug: Animal information in protocol " + this.ID + " should not be null");
            return;
        }
        var typeofApplication = this.getQualifiedAttribute("customAttributes._attribute195.customAttributes._attribute0");
        var strain;
        var housingLocation;
        if (typeofApplication != "Breeding") {
            strain = "customAttributes.RequestedAnimals.customAttributes._attribute8";
            housingLocation = "customAttributes.RequestedAnimals.customAttributes._attribute3";
        } else {
            strain = "customAttributes.RequestedAnimalsBreeding.customAttributes._attribute12";
            housingLocation = "customAttributes.RequestedAnimalsBreeding.customAttributes._attribute4";
        }
        var oldAauElements = oldAau.elements();
        var oldAauCount = oldAauElements.count();
        var approvedAnimalInfoMap = {};
        var animalUsedInfoMap = {};
        var speciesInAiMap = {};
        var animalUsedCalMap = {};
        var findDuplicatsMap = {};
        for (var j = 1; j <= oldAauCount; j++) {
            wom.log("initialize all map values");
            var species = oldAauElements(j).getQualifiedAttribute("customAttributes._attribute4");
            if(species.ID == null)
            {
                continue;
            }
            var oldAauStrain = oldAauElements(j).getQualifiedAttribute(strain);
            var oldAauApprovedNum = oldAauElements(j).getQualifiedAttribute("customAttributes._attribute1");
            var oldAauHousingLocation = oldAauElements(j).getQualifiedAttribute(housingLocation);
            animalUsedInfoMap[species.ID] = 0;
            approvedAnimalInfoMap[species.ID] = 0;
            speciesInAiMap[species.ID] = 0;
            animalUsedCalMap[species.ID] = 0;
            var findDuplicatesKey = species.ID + oldAauApprovedNum + oldAauStrain;
            if(oldAauHousingLocation != null)
                findDuplicatesKey = findDuplicatesKey + oldAauHousingLocation;
            wom.log("findDuplicatesKey is " + findDuplicatesKey);
            findDuplicatsMap[findDuplicatesKey] = 0;
        }
        wom.log("starting loop through all old AAU");
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
            var findDuplicatesKey = species.ID + oldAauApprovedNum + oldAauStrain;
            if(oldAauHousingLocation != null)
                findDuplicatesKey = findDuplicatesKey + oldAauHousingLocation;
            if(findDuplicatsMap[findDuplicatesKey] == 0)
                findDuplicatsMap[findDuplicatesKey] = 1;
            else {
                wom.log("skip this old AAU because of duplicates" + findDuplicatesKey);
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
                    var approvedAnimalInAi = speciesInAiElements(sAi).getQualifiedAttribute("customAttributes.ApprovedAnimalsUsed");
                    approvedAnimalInfoMap[species.ID] += Number(approvedAnimalInAi);

                }
                speciesInAiMap[species.ID] = 1;
            }else
            {
                var numAnimalApprovedInAau = oldAauElements(j).getQualifiedAttribute("customAttributes._attribute1");
                approvedAnimalInfoMap[species.ID] += Number(numAnimalApprovedInAau);
            }
            wom.log("starting loop through history in this AAU " + species.ID);
            if (oldAauHistory != null && oldAauHistory.elements().count() > 0) {
                var oldAauHisElements = oldAauHistory.elements();
                for (var k = 1; k < oldAauHisElements.count(); k++) {
                    var comments = oldAauHisElements(k).getQualifiedAttribute("customAttributes.Comments");
                    if (comments != null) {
                        if (comments.substring(0, 7) == "eSirius") {
                            continue;
                        }
                    }
                    var hisAnimalUsed = oldAauHisElements(k).getQualifiedAttribute("customAttributes._attribute1");
                    var hisDescription = oldAauHisElements(k).getQualifiedAttribute("customAttributes._attribute3");
                    var hisApprovalDate = oldAauHisElements(k).getQualifiedAttribute("customAttributes._attribute0");
                    var hisDateCreated = oldAauHisElements(k).dateCreated;
                    var hisDateModified = oldAauHisElements(k).dateModified;

                    var tempAnimalsUsedHist = wom.createEntity("_A-Approved Animals Used Transaction Log");
                    tempAnimalsUsedHist.setQualifiedAttribute("customAttributes.Comments", comments);
                    tempAnimalsUsedHist.setQualifiedAttribute("customAttributes.AnimalsUsed", hisAnimalUsed);
                    tempAnimalsUsedHist.setQualifiedAttribute("customAttributes.Description", hisDescription);
                    tempAnimalsUsedHist.setQualifiedAttribute("customAttributes.TransactionDate", hisApprovalDate);
                    tempAnimalsUsedHist.dateCreated = hisDateCreated;
                    tempAnimalsUsedHist.dateModified = hisDateModified;
                    var compareDate = getCompareDate(this);
                    wom.log("find compareDate " + compareDate);
                    if (preDateCreated > compareDate)
                        animalUsedInfoMap[species.ID] += Number(hisAnimalUsed);

                    if (preDateCreated >= new Date(new Date().getFullYear(), 0, 1))
                        animalUsedCalMap[species.ID] += Number(hisAnimalUsed);
                    newHistoryArray.push(tempAnimalsUsedHist);
                }
            }
            if (newAau != null) {
                var aauItem = newAau.query("customAttributes.Species.ID='" + species.ID + "'");

                if (aauItem != null) {
                    var aauItemElments = aauItem.elements();

                    if (aauItemElments.count() > 0) {
                        wom.log("Found AAU Summary for species " + species.ID + " already created before");
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
                            aauItemElments(1).setQualifiedAttribute("customAttributes.HistoricAnimalUsedRecordDate", today);
                        }
                        continue;
                    }
                }
            }
            wom.log("create AAU Summary for species" + species.ID);
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
                tempAnimalsUsed.setQualifiedAttribute("customAttributes.HistoricAnimalUsedRecordDate", today);
            } else {
                tempAnimalsUsed.setQualifiedAttribute("customAttributes.HistoricAnimalUsedRecord", false);
                tempAnimalsUsed.setQualifiedAttribute("customAttributes.HistoricAnimalUsedRecordDate", null);
            }
            this.setQualifiedAttribute("customAttributes.ApprovedAnimalsUsed", tempAnimalsUsed, "add");
        }
    }
    catch (e) {
        wom.log("EXCEPTION _Protocol.migrateAauToAauSumary: " + e.description);
        throw(e);
    }
    function getCompareDate(currentObject) {
        if (this.ID.length == 8 ) {
            var subProjs = this.projects.query("type = '_Continuing Review' and Status.id = 'Approved'").sort("ID", 105, 0).elements();
            if (subProjs != null && subProjs.count() > 0) {
                wom.log("found renewal sub-protocol " + subProjs(1).ID);
                var protocol = subProjs(1).getQualifiedAttribute("customattributes._attribute9");
                if (protocol != null) {
                    wom.log("renewal parent protocol " + protocol.ID);
                    var renewalApprovalDate = protocol.getQualifiedAttribute("customattributes._attribute154");
                    wom.log("latest renewal approved date " + renewalApprovalDate);
                    if (renewalApprovalDate != null)
                        return renewalApprovalDate;
                }
            }
        }
        var protocolStartDate = currentObject.getQualifiedAttribute("customAttributes._attribute271");
        var protocolApprovalDate = currentObject.getQualifiedAttribute("customAttributes._attribute154");

        if (protocolStartDate > protocolApprovalDate)
            return protocolStartDate;
        else
            return protocolApprovalDate;
    }
}
