public with sharing class ContentDocumentTriggerHandler {
    
    /**
     * Clear Candidate__c.Photo_Document_Id__c before Profile_Pic ContentDocument is deleted
     */
    public static void beforeDelete(List<ContentDocument> contentDocList) {
        
        Set<Id> contentDocumentIds = new Set<Id>();
        for (ContentDocument doc : contentDocList) {
            if (isImageFile(doc.FileType)) {
                contentDocumentIds.add(doc.Id);
            }
        }
        
        List<Candidate__c> candidatesToUpdate = [SELECT Id, Photo_Document_Id__c 
            FROM Candidate__c 
            WHERE Photo_Document_Id__c IN :contentDocumentIds
        ];
        
        for (Candidate__c candidate : candidatesToUpdate) {
            candidate.Photo_Document_Id__c = null;
        }
        if (!candidatesToUpdate.isEmpty()) {
            update candidatesToUpdate;
        }
    }
    
    /**
     * Check if file extension is an image format
     */
    private static Boolean isImageFile(String extension) {
        return !String.isBlank(extension) && new Set<String>{'jpg','jpeg','png'}.contains(extension.toLowerCase());
    }
}