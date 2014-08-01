/**
 * Created by sun38 on 7/4/2014.
 */
projects = projects.query("customAttributes._attribute320.customAttributes.PreReviewReviewer.*=" + Person.getCurrentUser());