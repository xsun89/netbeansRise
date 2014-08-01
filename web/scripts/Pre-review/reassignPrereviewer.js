/**
 * Created by sun38 on 7/9/2014.
 */
var preReviewer = targetEntity.getQualifiedAttribute("customAttributes._attribute320.customAttributes.AccPreReviewReviewer");


var pr = targetEntity.getQualifiedAttribute("customAttributes._attribute320.customAttributes.AccPreReviewReviewer");
targetEntity.setQualifiedAttribute("customAttributes._attribute320.customAttributes.PreAccPreReviewer", pr);


/*------------------------------------------------------------*/
var cur = targetEntity.getQualifiedAttribute("customAttributes._attribute320.customAttributes.PreAccPreReviewer");
var pr = targetEntity.getQualifiedAttribute("customAttributes._attribute320.customAttributes.AccPreReviewReviewer");
Assert.NotIdentical(cur, pr, "Previous per-review should be the same as newly selected one");
targetEntity.setQualifiedAttribute("customAttributes._attribute320.customAttributes.PreAccPreReviewer", pr);
