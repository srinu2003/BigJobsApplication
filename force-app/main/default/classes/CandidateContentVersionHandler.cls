public without sharing class CandidateContentVersionHandler {
    
    public static void afterInsert(List<ContentVersion> newCVList, Map<Id, ContentVersion> newCVMap) {
        List<ContentVersion> resumeCVList = new List<ContentVersion>();
        for (ContentVersion cv : newCVList) {
            if (cv.Career_Guest_Record_fileupload__c != null) {
                String fieldValue = String.valueOf(cv.Career_Guest_Record_fileupload__c);
                if (fieldValue.startsWith('JOB_') && fieldValue.endsWith('_RESUME')) {
                    resumeCVList.add(cv);
                }
            }
        }
        handleResumeContentVersions(resumeCVList);
    }
    
    private static void handleResumeContentVersions(List<ContentVersion> cvList) {
        List<ContentDocumentLink> cdlToInsert = new List<ContentDocumentLink>();
        Set<Id> jobAppIds = new Set<Id>();
        Map<Id, Id> jobAppToCandidate = new Map<Id, Id>();
        
        System.debug('Starting handleResumeContentVersions with cvList size: ' + cvList.size());
        
        for (ContentVersion cv : cvList) {
            if (cv.ContentDocumentId != null) {
                String jobAppIdStr = String.valueOf(cv.Career_Guest_Record_fileupload__c).substringBetween('JOB_', '_RESUME');
                System.debug('Extracted jobAppIdStr: ' + jobAppIdStr + ' from ContentVersion Id: ' + cv.Id);
                if (jobAppIdStr != null) {
                    jobAppIds.add((Id)jobAppIdStr);
                }
            }
        }
        
        System.debug('Collected jobAppIds: ' + jobAppIds);
        
        if (!jobAppIds.isEmpty()) {
            for (Job_Application__c jobApp : [
                SELECT Id, Candidate__c FROM Job_Application__c WHERE Id IN :jobAppIds
            ]) {
                jobAppToCandidate.put(jobApp.Id, jobApp.Candidate__c);
                System.debug('Mapped Job_Application__c Id: ' + jobApp.Id + ' to Candidate__c Id: ' + jobApp.Candidate__c);
            }
        }
        
        // Avoid duplicate links by checking existing ContentDocumentLinks
        Map<String, Set<Id>> existingLinks = new Map<String, Set<Id>>();
        Set<Id> contentDocumentIds = new Set<Id>();
        for (ContentVersion cv : cvList) {
            if (cv.ContentDocumentId != null) {
                contentDocumentIds.add(cv.ContentDocumentId);
            }
        }
        System.debug('Collected contentDocumentIds: ' + contentDocumentIds);
        if (!contentDocumentIds.isEmpty()) {
            for (ContentDocumentLink cdl : [
                SELECT ContentDocumentId, LinkedEntityId FROM ContentDocumentLink WHERE ContentDocumentId IN :contentDocumentIds
            ]) {
                String key = cdl.ContentDocumentId;
                if (!existingLinks.containsKey(key)) {
                    existingLinks.put(key, new Set<Id>());
                }
                existingLinks.get(key).add(cdl.LinkedEntityId);
                System.debug('Existing link found: ContentDocumentId=' + cdl.ContentDocumentId + ', LinkedEntityId=' + cdl.LinkedEntityId);
            }
        }
        
        // Create ContentDocumentLinks
        for (ContentVersion cv : cvList) {
            String jobAppIdStr = String.valueOf(cv.Career_Guest_Record_fileupload__c).substringBetween('JOB_', '_RESUME');
            Id jobAppId = jobAppIdStr;
            Id candidateId = jobAppToCandidate.get(jobAppId);
            
            System.debug('Processing ContentVersion Id: ' + cv.Id + ', ContentDocumentId: ' + cv.ContentDocumentId + ', jobAppId: ' + jobAppId + ', candidateId: ' + candidateId);
            
            // Link to Job_Application__c
            if (jobAppId != null && !(existingLinks.get(cv.ContentDocumentId)?.contains(jobAppId) ?? true)) {
                cdlToInsert.add(new ContentDocumentLink(ContentDocumentId = cv.ContentDocumentId, LinkedEntityId = jobAppId, ShareType = 'V', Visibility = 'AllUsers'));
                System.debug('Adding ContentDocumentLink for Job_Application__c: ContentDocumentId=' + cv.ContentDocumentId + ', LinkedEntityId=' + jobAppId);
            }
            // Link to Candidate__c
            if (candidateId != null && !(existingLinks.get(cv.ContentDocumentId)?.contains(jobAppId) ?? false)) {
                cdlToInsert.add(new ContentDocumentLink(ContentDocumentId = cv.ContentDocumentId, LinkedEntityId = candidateId, ShareType = 'V',Visibility = 'AllUsers'));
                System.debug('Adding ContentDocumentLink for Candidate__c: ContentDocumentId=' + cv.ContentDocumentId + ', LinkedEntityId=' + candidateId);
            }
        }
        
        System.debug('Number of ContentDocumentLinks to insert: ' + cdlToInsert.size());
        if (!cdlToInsert.isEmpty()) {
            insert cdlToInsert;
            System.debug('Inserted ContentDocumentLinks.');
        }
    }
}