public without sharing class ContentVersionTriggerHandler {
    
    /**
     * Method to be called after ContentVersion insert
     * https://appiphony.com/blog/contentdocument-contentversion-and-contentdocumentlink
     */
    public static void afterInsert(List<ContentVersion> newCVs, Map<Id, ContentVersion> newCVMap) {
        // System.debug('afterInsert called with ' + newCVs.size() + ' ContentVersions');
        Map<Id, Id> candidateToDocId = new Map<Id, Id>();
        Set<Id> candidateIds = new Set<Id>();
        Set<Id> contentDocIdsToQuery = new Set<Id>();
        Map<Id, ContentVersion> contentDocIdToCVMap = new Map<Id, ContentVersion>();
        
        // Collect candidate IDs and ContentDocumentIds for Profile_Pic images
        for (ContentVersion cv : newCVs) {
            if (cv.Title != 'Profile_Pic') {
                continue;
            }
            
            String firstPublishLocationId = String.valueOf(cv.FirstPublishLocationId);
            
            // FirstPublishLocationId is not null
            if (firstPublishLocationId?.startsWith(Schema.SObjectType.Candidate__c.getKeyPrefix())) {
                if (!isImageFile(cv.FileType)) {
                    System.debug('Invalid file type for Profile_Pic: ' + cv.FileType);
                    continue;
                }
                candidateToDocId.put(firstPublishLocationId, cv.ContentDocumentId);
                candidateIds.add(firstPublishLocationId);
            }
            // FirstPublishLocationId is null
            else if (cv.FirstPublishLocationId == null && cv.ContentDocumentId != null) {
                contentDocIdsToQuery.add(cv.ContentDocumentId);
                contentDocIdToCVMap.put(cv.ContentDocumentId, cv);
            }
        }
        
        // Query ContentDocumentLink for FirstPublishLocationId is null
        if (!contentDocIdsToQuery.isEmpty()) {
            List<ContentDocumentLink> cdlList = [
                SELECT ContentDocumentId, LinkedEntityId
                FROM ContentDocumentLink
                WHERE ContentDocumentId IN :contentDocIdsToQuery
                WITH SECURITY_ENFORCED
            ];
            
            for (ContentDocumentLink cdl : cdlList) {
                String linkedEntityId = String.valueOf(cdl.LinkedEntityId);
                if (linkedEntityId.startsWith(Schema.SObjectType.Candidate__c.getKeyPrefix())) {
                    ContentVersion cv = contentDocIdToCVMap.get(cdl.ContentDocumentId);
                    if (!isImageFile(cv?.FileType)) {
                        cv.addError('Invalid file type for Profile_Pic. Allowed types are jpg, jpeg, png.');
                        continue;
                    }
                    candidateToDocId.put(cdl.LinkedEntityId, cdl.ContentDocumentId);
                    candidateIds.add(cdl.LinkedEntityId);
                }
            }
        }
        
        // Update Candidate__c.Photo_Document_Id__c
        if (!candidateToDocId.isEmpty()) {
            updateCandidatePhoto(candidateToDocId, candidateIds);
        }
    }
    
    /**
     * Update Candidate__C Photo_Document_Id__c after Profile_Pic is uploaded
     * AFTER_INSERT on ContentVersion
     */
    public static void updateCandidatePhoto(Map<Id, Id> candidateToDocId, Set<Id> candidateIds) {
        List<ContentDocument> docsToDelete = new List<ContentDocument>();
        
        // Get ContentDocumentIds from ContentDocumentLink where Title = 'Profile_Pic'
        if (!candidateIds.isEmpty()) {
            List<ContentDocumentLink> cdlList = [
                SELECT ContentDocumentId, LinkedEntityId, ContentDocument.Title
                FROM ContentDocumentLink
                WHERE LinkedEntityId IN :candidateIds
                AND ContentDocument.Title = 'Profile_Pic'
                AND ContentDocumentId NOT IN :candidateToDocId.values()
                WITH SECURITY_ENFORCED
            ];
            for (ContentDocumentLink cdl : cdlList) {
                docsToDelete.add(new ContentDocument(Id = cdl.ContentDocumentId));
            }
        }
        
        if (!docsToDelete.isEmpty()) {
            try {
                delete docsToDelete;
            } catch (Exception e) {
                System.debug('Error deleting existing Profile_Pic documents: ' + e.getMessage());
                // cv.addError('Unable to delete existing Profile_Pic. Please try again later.');
            }
        }
        
        List<Candidate__c> candidatesToUpdate = new List<Candidate__c>();
        for (Id candidateId : candidateToDocId.keySet()) {
            candidatesToUpdate.add(new Candidate__c(
                Id = candidateId,
            Photo_Document_Id__c = candidateToDocId.get(candidateId)
                ));
        }
        if (!candidatesToUpdate.isEmpty()) {
            update candidatesToUpdate;
            System.debug('Updated Candidates with new Profile_Pic ContentDocumentIds');
        }
    }
    
    /**
     * Check if file extension is an image format
     */
    private static Boolean isImageFile(String extension) {
        if (String.isBlank(extension)) {
            return false;
        }
        Set<String> imageExtensions = new Set<String>{
            'jpg', 'jpeg', 'png'
        };
        return imageExtensions.contains(extension.toLowerCase());
    }
}