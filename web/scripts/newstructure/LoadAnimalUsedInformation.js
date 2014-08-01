function test() {
    var executeScript = false;
    var today = new Date().getVarDate();
    var ACCStudies = getResultSet("_protocol").query("status.id!='Terminated' and (customAttributes._attribute330.customAttributes._attribute5 is not null OR customAttributes._attribute329.customAttributes._attribute9 is not null)").elements();
    var totalCount = ACCStudies.count();
//?totalCount + "\n";

    var appliedCount = 0;
    var initAppliCount = 1;
    var start = new Date().getTime();
    var end;
    var timespend;
    for (var i = initAppliCount; i <= totalCount; i++) {
        end = new Date().getTime();
        timespend = end - start;
        if (timespend >= 150000) {
            //?"Execution time: " + timespend + "\n";
            break;
        }
        var oldAau = ACCStudies(i).getQualifiedAttribute("customAttributes._attribute263");
        var newAau = ACCStudies(i).getQualifiedAttribute("customAttributes.ApprovedAnimalsUsed");
        var ai = ACCStudies(i).getQualifiedAttribute("customAttributes.AnimalInformation");
        if ((oldAau == null) || (oldAau.elements().count() == 0)) {
            continue;
        }
        var oldAauElements = oldAau.elements();
        var oldAauCount = oldAauElements.count();

        var approvedAnimalInfoMap = {};
        var animalUsedInfoMap = {};
        var speciesInAiMap = {};
        var animalUsedCalMap = {};
        for (var j = 1; j <= oldAauCount; j++) {
            var species = oldAauCount(i).getQualifiedAttribute("customAttributes._attribute4");
            animalUsedInfoMap[species.ID] = 0;
            approvedAnimalInfoMap[species.ID] = 0;
            speciesInAiMap[species.ID] = 0;
            animalUsedCalMap[species.ID] = 0;
        }
        for (var j = 1; j <= oldAauCount; j++) {
            newAau = ACCStudies(i).getQualifiedAttribute("customAttributes.ApprovedAnimalsUsed");
            var species = oldAauElements(i).getQualifiedAttribute("customAttributes._attribute4");
            var numAnimalApproved = oldAauElements(i).getQualifiedAttribute("customAttributes._attribute1");
            var preDateCreated = oldAauElements(j).dateCreated;
            var preDateModified = oldAauElements(j).dateModified;
            var oldAauHistory = oldAauElements(j).getQualifiedAttribute("customAttributes._attribute8");
            var newHistoryArray = [];
            var speciesInAi = ai.query("customAttributes.Species.ID='" + species.ID + "'");
            if (speciesInAi != null && speciesInAi.elements().count() > 0)
                speciesInAiMap[species.ID] = 1;
            if (oldAauHistory != null && oldAauHistory.elements().count() > 0) {
                var oldAauHisElements = oldAauHistory.elements();
                for (var k = 1; k < oldAauHisElements.count(); k++) {
                    var comments = oldAauHisElements(k).getQualifiedAttribute("customAttributes.Comments");
                    if (comments != null) {
                        comments = comments.trim();
                        if (comments.substring(0, 7) == "eSirius") {
                            continue;
                        }
                    }
                    var hisAnimalUsed = oldAauHisElements(k).getQualifiedAttribute("customAttributes._attribute1");
                    var hisDescription = oldAauHisElements(k).getQualifiedAttribute("customAttributes._attribute3");

                    var tempAnimalsUsedHist = wom.createEntity("_A-Approved Animals Used Transaction Log");
                    tempAnimalsUsedHist.setQualifiedAttribute("customAttributes.Comments", comments);
                    tempAnimalsUsedHist.setQualifiedAttribute("customAttributes.AnimalsUsed", hisAnimalUsed);
                    tempAnimalsUsedHist.setQualifiedAttribute("customAttributes.Description", hisDescription);
                    if (preDateCreated > getCompareDate(ACCStudies(i)))
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
                        animalUsedInfoMap[species.ID] += numAnimalApproved;
                        aauItemElments(1).setQualifiedAttribute("customAttributes.NumberOfAnimalsApproved", animalUsedInfoMap[species.ID]);
                        aauItemElments(1).dateModified = preDateModified;

                        if (newHistoryArray != null && newHistoryArray.length > 0) {
                            for (var index = 0; index < newHistoryArray.length; index++)
                                aauItemElments(1).setQualifiedAttribute("customAttributes.History", newHistoryArray[index], "add");
                        }
                        aauItemElments(1).setQualifiedAttribute("customAttributes.NumberOfAnimalsUsed", animalUsedInfoMap[species.ID]);
                        aauItemElments(1).setQualifiedAttribute("customAttributes.NumberOfAnimalsUsed", animalUsedCalMap[species.ID]);
                        if (speciesInAiMap[species.ID] == 0) {
                            aauItemElments(1).setQualifiedAttribute("customAttributes.HistoricAnimalUsedRecord", true);
                            aauItemElments(1).setQualifiedAttribute("customAttributes.HistoricAnimalUsedRecordDate", today);
                        }
                        continue;
                    }
                }
            }
            var tempAnimalsUsed = wom.createEntity("_A-Approved Animals Used Summary");
            tempAnimalsUsed.setQualifiedAttribute("customAttributes.Application", ACCStudies(i));
            tempAnimalsUsed.setQualifiedAttribute("customAttributes.Species", species);
            tempAnimalsUsed.setQualifiedAttribute("customAttributes.NumberOfAnimalsApproved", numAnimalApproved);
            tempAnimalsUsed.setQualifiedAttribute("customAttributes.NumberOfAnimalsUsed", animalUsedInfoMap[species.ID]);
            tempAnimalsUsed.setQualifiedAttribute("customAttributes.NumberOfAnimalsUsed", animalUsedCalMap[species.ID]);
            tempAnimalsUsed.dateCreated = preDateCreated;
            tempAnimalsUsed.dateModified = preDateModified;
            if (newHistoryArray != null && newHistoryArray.length > 0) {
                for (var index = 0; index < newHistoryArray.length; index++)
                    aauItemElments(1).setQualifiedAttribute("customAttributes.History", newHistoryArray[index], "add");
            }
            animalUsedInfoMap[species.ID] = numAnimalApproved;
            if (speciesInAiMap[species.ID] == 0) {
                aauItemElments(1).setQualifiedAttribute("customAttributes.HistoricAnimalUsedRecord", true);
                aauItemElments(1).setQualifiedAttribute("customAttributes.HistoricAnimalUsedRecordDate", today);
            } else {
                aauItemElments(1).setQualifiedAttribute("customAttributes.HistoricAnimalUsedRecord", false);
                aauItemElments(1).setQualifiedAttribute("customAttributes.HistoricAnimalUsedRecordDate", null);
            }
            ACCStudies(i).setQualifiedAttribute("customAttributes.ApprovedAnimalsUsed", tempAnimalsUsed, "add");
        }

    }
    function findLatestRenewalApprovalDate(approvedentProject) {
        var subProjs = approvedentProject.projects;
        if (subProjs != null && subProjs.count() > 0) {
            var subProjsElems = subProjs.elements();
            for (var i = 1; i <= subProjsElems.count(); i++) {
                var projId = subProjsElems(i).ID;
                if (projId.indexOf("-R") == -1)
                    subProjs.removeElement(subProjsElems(i));
            }
            if (subProjs != null && subProjs.count() > 0) {
                subProjs = subProjs.sort("ID", 105, 0);
                subProjsElems = subProjs.elements();
                var j = 1;
                for (; j <= subProjsElems.count(); j++) {
                    if (subProjsElems(j).status.ID == "Approved") {
                        var protocol = subProjsElems(j).getQualifiedAttribute("customattributes._attribute9");
                        if (protocol != null) {
                            var renewalApprovalDate = protocol.getQualifiedAttribute("customattributes._attribute154");
                            return renewalApprovalDate;
                        }
                    }
                }
            }
        }

        return null;
    }

    function getCompareDate(approvedentProject) {
        var ret = findLatestRenewalApprovalDate(approvedentProject);
        if (ret != null)
            return ret;
        var protocolStartDate = approvedentProject.getQualifiedAttribute("customAttributes._attribute271");
        var protocolApprovalDate = approvedentProject.getQualifiedAttribute("customAttributes._attribute154");
        //Need to ensure that the start date is before or on today
        if (protocolStartDate > protocolApprovalDate)
            return protocolStartDate;
        else
            return protocolApprovalDate;
    }
}
