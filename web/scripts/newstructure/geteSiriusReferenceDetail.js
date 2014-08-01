/**
 * Created by xsun on 2014-07-19.
 */
function geteSiriusReferenceDetail()
{
    //This function is design to work in custom searches to return a list of
    //eSirius order references that make up the animals used reference
    try {

        var protocolEntitySet;
        var protocolEntity;
        var protocolID;

        var approvedAnimalsUsedEntitySet;
        var approvedAnimalsUsedEntity;
        var speciesID;

        var eSiriusJSONEntity;
        var txtJSON;
        var objJSON;

        var CSVReference="";

        // Get the protocol ID for this Approved Animal Used History record because
        // we will be using this value to filter the eSirius JSON batch
        protocolEntitySet = getResultSet("_Protocol").query("customAttributes.ApprovedAnimalsUsed.*.customAttributes.History.* = " + this);

        if (protocolEntitySet == null || protocolEntitySet.elements().count() == 0) {
            strReturn = "No Protocol Found";
        }
        else {
            //If there are cloned protocols with shared custom attributes, protocolEntitySet will have a count > 1.
            //All the protocol numbers at least the first 8 digits will be the same.
            //Only need to get the protocol number from the first record.
            protocolEntity = protocolEntitySet.elements().item(1);

            if (protocolEntity.ID.length >=8 ) {
                protocolID = protocolEntity.ID.substring(0,8);
            }

            approvedAnimalsUsedEntitySet = getResultSet("_A-Approved Animals Used Summary").query("customAttributes.History.* = " + this).sort("ID",105,false);

            if (approvedAnimalsUsedEntitySet == null || approvedAnimalsUsedEntitySet.elements().count() == 0) {
                strReturn = "No Approved Animal Used Found";
                return strReturn;
            }
            else {

                //Only interested in Orders for a specific species
                approvedAnimalsUsedEntity = approvedAnimalsUsedEntitySet.elements().item(1);
                speciesID = approvedAnimalsUsedEntity.getQualifiedAttribute("customAttributes.Species.ID");

                //Now let's go and get the eSirius Batch JSON detail string
                eSiriusJSONEntity = this.getQualifiedAttribute("customAttributes.eSiriusPullLog");

                if (eSiriusJSONEntity == null) {
                    strReturn = "N/A";
                }
                else {

                    txtJSON = eSiriusJSONEntity.getQualifiedAttribute("customAttributes.JSONDetailString");
                    strReturn = txtJSON;

                    if ( txtJSON == null || txtJSON.length == 0 ) {
                        strReturn = "N/A";
                    }
                    else {
                        objJSON = eval("(" + txtJSON + ")");

                        if (objJSON.Rows.length == 1 && objJSON.Rows[0].prot_no == "") {
                            strReturn = "N/A";
                        }
                        else {
                            for (var i = 0; i < objJSON.Rows.length; i++) {

                                if ((objJSON.Rows[i].prot_no == protocolID || protocolID == "") &&
                                    (objJSON.Rows[i].sp_id == speciesID || speciesID == "")
                                    ) {
                                    wom.log("Protocol["+ objJSON.Rows[i].prot_no +"] i["+ i +"] sp_id["+ objJSON.Rows[i].sp_id +"] sp_nm[" + objJSON.Rows[i].sp_nm + "] qty_recvd[" + objJSON.Rows[i].num + "] reference["+objJSON.Rows[i].reference+"]");
                                    CSVReference += objJSON.Rows[i].src_trans + ": " + objJSON.Rows[i].reference + "<br />";
                                }

                            }
                        }
                        strReturn = CSVReference;
                    }
                }
            }
        }
        return strReturn;
    }
    catch (e) {
        wom.log("EXCEPTION _A- Approved Animals Used History.geteSiriusReferenceDetail: " + e.description);
        throw(e);
    }
}
