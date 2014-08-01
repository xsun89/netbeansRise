/**
 * Created by sun38 on 7/3/2014.
 */

function setApprovedAnimalUsedSummary()
{
    try {
        var months = new Array("January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December");
        var NumberOfAnimalsUsed = 0;
        var NumberOfAnimalsUsedPerCalendarYear = 0;
        var strReturn = "";
        var dtApprovedDate;
        var dtDateCreated;

        var AAUHEntitySet;
        var AAUHEntity;
        var sessionContext = wom.getSessionContext();
        var jsonString = sessionContext.getContextObject("currentJsonObj");
        var jsonObj = JSON.parse(jsonString, null);
        var eSiriusJSONEntity = sessionContext.getContextObject("eSiriusJSON");
        var protSpecCountMap = sessionContext.getContextObject("ProtocolSpecCountMap");
        var curProSpecCount = Number(protSpecCountMap[jsonObj.prot_no+"_"+jsonObj.sp_id]);
        var AnimalsUsed = Number(jsonObj.num);
        if (isNaN(AnimalsUsed)) {
            throw (new Error(-1, "AnimalsUsed in JSON is not a number, please contact Site Manager for this issue"));
        }
        //Negative numbers coming from eSirius means that is the number of animals ordered
        //therefore they become used in RISe
        AnimalsUsed = AnimalsUsed * -1;

        var dtApprovedDate = null;
        var strNewStringDate = "";

        if (jsonObj.d_trans.length >= 10) {

            strNewStringDate = jsonObj.d_trans.substr(0, 10).split('/');
            dtApprovedDate = new Date();
            dtApprovedDate.setFullYear(strNewStringDate[2]);
            dtApprovedDate.setMonth(Number(strNewStringDate[0]) - 1);
            dtApprovedDate.setDate(strNewStringDate[1]);
            dtApprovedDate.setHours(0);
            dtApprovedDate.setMinutes(0);
            dtApprovedDate.setSeconds(0);
            dtApprovedDate.setMilliseconds(0);

            wom.log("raw date: [" + jsonObj.d_trans + "] dtApprovedDate: [" + dtApprovedDate + "]");
        } else {
            throw (new Error(-1, "Transaction Date is not formatted properly in JSON, please contact Site Manager for this issue"));
        }

        //dtDateCreated = new Date(eSiriusJSONEntity.getQualifiedAttribute("dateCreated"));
        dtDateCreated = new Date();
        var Comments = "eSirius data pull from: " + months[dtDateCreated.getMonth()] + " " + dtDateCreated.getDate() + ", " + dtDateCreated.getFullYear();

        var AAUEntitySet = this.getQualifiedAttribute("customAttributes.ApprovedAnimalsUsed").query("customAttributes.Species.ID='" + jsonObj.sp_id + "'").sort("ID", 105, 1);

        if (AAUEntitySet == null || AAUEntitySet.elements().count() <= 0) {
            wom.log("AAU Not Exists");
            throw (new Error(-1, "Approved Animals Used record does not exist for species ID " + jsonObj.sp_id + " in protocol " + this.ID + ", please contact Site Manager for this issue"));
        }
        wom.log("Protocol[" + this.ID + "] Count of Species[" + AAUEntitySet.elements().count() + "] sp_id[" + jsonObj.sp_id + "] sp_nm[" + jsonObj.sp_nm + "] qty_recvd[" + jsonObj.num + "] dtApprovedDate[" + dtApprovedDate + "]");

        var AAUEntity = AAUEntitySet.elements().item(1);

        if (AAUEntity == null) {
            throw (new Error(-1, "Approved Animals Used record does not exist for " + AIEntity.getEntityTypeName() + " protocol " + this.ID + ", please contact Site Manager for this issue"));
        }
        wom.log("AAU.ID[" + AAUEntity.ID + "] Species[" + AAUEntity.getQualifiedAttribute("customAttributes.Species.ID") + "] Number of Animals Approved[" + AAUEntity.getQualifiedAttribute("customAttributes.NumberOfAnimalsApproved") + "]");

        //Check to see if we already downloaded this record
        AAUHEntitySet = AAUEntity.getQualifiedAttribute("customAttributes.History");
        if (AAUHEntitySet != null) {
            AAUHEntitySet = AAUHEntitySet.query("customAttributes.TransactionDate=" + jsonObj.d_trans + "");
            if (AAUHEntitySet.elements().count() >= curProSpecCount) {
                strReturn = "Already downloaded this record";
                wom.log(strReturn);
                wom.log(AAUHEntitySet.elements().count() + " already in the history, now you send " + curProSpecCount);
                throw (new Error(-1, strReturn));
            }
        }

        //We have not downloaded this record therefore create an Animal Used History record
        //and increase the animals used totals
        if (AnimalsUsed != 0 || jsonObj.num == "0") {
            var ApprovedAnimals = Number(AAUEntity.getQualifiedAttribute("customAttributes.NumberOfAnimalsApproved"));

            NumberOfAnimalsUsed = Number(AAUEntity.getQualifiedAttribute("customAttributes.NumberOfAnimalsUsed"));
            if (isNaN(NumberOfAnimalsUsed)) {
                NumberOfAnimalsUsed = 0;
            }

            NumberOfAnimalsUsedPerCalendarYear = Number(AAUEntity.getQualifiedAttribute("customAttributes.NumberOfAnimalsUsedPerCalendarYear"));
            if (isNaN(NumberOfAnimalsUsedPerCalendarYear)) {
                NumberOfAnimalsUsedPerCalendarYear = 0;
            }

            if ((AnimalsUsed >= 0) && (NumberOfAnimalsUsed + AnimalsUsed > ApprovedAnimals)) {
                strReturn = "Overage Exists. Too many animals ordered. Verify that the approved animals in RISe match with eSirius for protocol " + this.ID;
                wom.log(strReturn);
                //throw (new Error(-1, strReturn));

            } else if ((AnimalsUsed < 0) && (NumberOfAnimalsUsed + AnimalsUsed < 0)) {
                strReturn = "Underage Exists. Too few animals ordered. Verify that the approved animals in RISe match with eSirius for protocol " + this.ID;
                wom.log(strReturn);
                //throw (new Error(-1, strReturn));

            }

            var transactionType = jsonObj.type;
            wom.log("ApprovedAnimals[" + ApprovedAnimals + "] NumberOfAnimalsUsed[" + NumberOfAnimalsUsed + "] AnimalsUsed[" + AnimalsUsed + "]");
            wom.log("Writing values to database");
            AAUEntity.setQualifiedAttribute("customAttributes.NumberOfAnimalsUsed", NumberOfAnimalsUsed + AnimalsUsed);
            if(transactionType == "Reset") {
                AAUEntity.setQualifiedAttribute("customAttributes.NumberOfAnimalsUsedPerCalendarYear", NumberOfAnimalsUsedPerCalendarYear);
            } else {
                AAUEntity.setQualifiedAttribute("customAttributes.NumberOfAnimalsUsedPerCalendarYear", NumberOfAnimalsUsedPerCalendarYear + AnimalsUsed);
            }
            AAUHEntity = wom.createEntity("_A-Approved Animals Used Transaction Log");
            AAUHEntity.setQualifiedAttribute("dateCreated", new Date());
            AAUHEntity.setQualifiedAttribute("customAttributes.TransactionDate", dtApprovedDate);
            AAUHEntity.setQualifiedAttribute("customAttributes.AnimalsUsed", AnimalsUsed);
            AAUHEntity.setQualifiedAttribute("customAttributes.Comments", Comments);
            AAUHEntity.setQualifiedAttribute("customAttributes.TransactionType", transactionType);
            AAUHEntity.setQualifiedAttribute("customAttributes.eSiriusPullLog", eSiriusJSONEntity);

            AAUEntity.setQualifiedAttribute("customAttributes.History", AAUHEntity, "add");
            wom.log("+++++++++++++++++++++Done processing AAU.ID[" + AAUEntity.ID + "] Species[" + AAUEntity.getQualifiedAttribute("customAttributes.Species.customAttributes._attribute0") + "]");//We ran out of apporved animals used records for the species. Raise and error because
            return;
        }

    }
    catch(e) {
        wom.log("EXCEPTION setApprovedAnimalUsedSummary: " + e.description);
        throw(e);
    }
}
