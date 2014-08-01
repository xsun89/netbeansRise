function generateHtml(sch)
{
    var projectType=sch.currentEntity.context.getTypeDisplayName();
    switch (projectType) {
        case "Animal Care":
            var ss = sch.CurrentEntity("context.customAttributes.AnimalInformation");
            if (ss != null) var animInfo = sch.CurrentEntity("context.customAttributes.AnimalInformation");
            break;
        case "Amendment":
            var ss = sch.CurrentEntity("context.customAttributes._attribute8.customAttributes.AnimalInformation");
            if (ss != null) var animInfo = sch.CurrentEntity("context.customAttributes._attribute8.customAttributes.AnimalInformation");
            break;
        case "Renewal":
            var ss = sch.CurrentEntity("context.customAttributes._attribute9.customAttributes.AnimalInformation");
            if (ss != null) var animInfo = sch.CurrentEntity("context.customAttributes._attribute9.customAttributes.AnimalInformation");
            break;
        default:
    };

    var html = "";
    if (ss != null) {
        if (animInfo != null) {
            animInfo = animInfo.elements();
            html += "<blockquote><table style='BORDER-RIGHT: DDDDDD 0.05cm groove; BORDER-TOP: DDDDDD 0.05cm groove; BACKGROUND: none transparent scroll repeat 0% 0%; BORDER-LEFT: DDDDDD 0.05cm groove; BORDER-BOTTOM: DDDDDD 0.05cm groove'>";
            for (var i=1; i<=animInfo.count(); i++) {
                html += "<tr><td>";
                var animSpec = animInfo(i).getQualifiedAttribute("customAttributes.Species.customAttributes._attribute0");
                if (animSpec != null) {
                    html += animSpec.toString() + " ";
                }
                var animStrain = animInfo(i).getQualifiedAttribute("customAttributes.Strain");
                if (animStrain != null) {
                    html += animStrain.toString() + " ";
                }
                var animNum = animInfo(i).getQualifiedAttribute("customAttributes.NumberOfAnimalsRequested");
                if (animNum != null) {
                    html += animNum.toString() + "<br>";
                }
                html += "</td></tr>";
            }
            html +="</table></blockquote>";
        }
    }
    else html= "N/A";
    return html;
}