//DY Comments: Can we combine the scripts into 1 (or put in the same activity)
//reason is we only need 1 Custom Search and 1 SBO
//if application is done, it is done for both AI and AAU
function test() {
    try {
        var today = new Date().getVarDate();
        var oldAau = this.getQualifiedAttribute("customAttributes._attribute263");
        var newAau = this.getQualifiedAttribute("customAttributes.ApprovedAnimalsUsed");
        if (newAau != null && newAau.elements().count() >= 0) {
            wom.log("Skip this protocol because new AAU has something already" + this.ID);
            return;
        }
        if ((oldAau == null) || (oldAau.elements().count() == 0)) {
            wom.log("Skip this protocol because old AAU is null" + this.ID);
            return;
        }

        var ai = this.getQualifiedAttribute("customAttributes.AnimalInformation");
        var oldAauElements = oldAau.elements();
        var oldAauCount = oldAauElements.count();

        var approvedAnimalInfoMap = {};
        var animalUsedInfoMap = {};
        var speciesInAiMap = {};
        var animalUsedCalMap = {};
        for (var j = 1; j <= oldAauCount; j++) {
            var species = oldAauElements(i).getQualifiedAttribute("customAttributes._attribute4");
            animalUsedInfoMap[species.ID] = 0;
            approvedAnimalInfoMap[species.ID] = 0;
            speciesInAiMap[species.ID] = 0;
            animalUsedCalMap[species.ID] = 0;
        }
        for (var j = 1; j <= oldAauCount; j++) {
            newAau = this.getQualifiedAttribute("customAttributes.ApprovedAnimalsUsed");
            var species = oldAauElements(j).getQualifiedAttribute("customAttributes._attribute4");
            var numAnimalApproved = oldAauElements(j).getQualifiedAttribute("customAttributes._attribute1");
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
                    if (preDateCreated > getCompareDate(this))
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
                        approvedAnimalInfoMap[species.ID] += numAnimalApproved;
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
                        } else {
                            aauItemElments(1).setQualifiedAttribute("customAttributes.HistoricAnimalUsedRecord", false);
                            aauItemElments(1).setQualifiedAttribute("customAttributes.HistoricAnimalUsedRecordDate", null);
                        }
                        continue;
                    }
                }
            }
            var tempAnimalsUsed = wom.createEntity("_A-Approved Animals Used Summary");
            tempAnimalsUsed.setQualifiedAttribute("customAttributes.Application", this);
            tempAnimalsUsed.setQualifiedAttribute("customAttributes.Species", species);
            tempAnimalsUsed.setQualifiedAttribute("customAttributes.NumberOfAnimalsApproved", numAnimalApproved);
            tempAnimalsUsed.setQualifiedAttribute("customAttributes.NumberOfAnimalsUsed", animalUsedInfoMap[species.ID]);
            tempAnimalsUsed.setQualifiedAttribute("customAttributes.NumberOfAnimalsUsedPerCalendarYear", animalUsedCalMap[species.ID]);
            tempAnimalsUsed.dateCreated = preDateCreated;
            tempAnimalsUsed.dateModified = preDateModified;
            if (newHistoryArray != null && newHistoryArray.length > 0) {
                for (var index = 0; index < newHistoryArray.length; index++)
                    tempAnimalsUsed.setQualifiedAttribute("customAttributes.History", newHistoryArray[index], "add");
            }
            approvedAnimalInfoMap[species.ID] = numAnimalApproved;
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
    function findLatestRenewalApprovalDate(approvedentProject) {
        var subProjs = approvedentProject.projects;
        if (subProjs != null && subProjs.count() > 0) {
            //DY Comments: var subProjsRenewal = subProjs.filterBySubtypeAndCast("_ContinuingReview").sort("ID", 105, 0);
            //
            var subProjsElems = subProjs.elements();
            for (var i = 1; i <= subProjsElems.count(); i++) {
                var projId = subProjsElems(i).ID;
                if (projId.indexOf("-R") == -1)
                //DY Comments: remove elements??? is it a copy or just a link???
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
        if (protocolStartDate > protocolApprovalDate)
            return protocolStartDate;
        else
            return protocolApprovalDate;
    }
}