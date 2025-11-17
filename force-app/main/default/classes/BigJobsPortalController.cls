public without sharing class BigJobsPortalController {



    @AuraEnabled
    public static Id createJobApplication(Id candidateId, Id positionId, String source, String coverLetter) {
        try {
            if (candidateId == null || positionId == null) {
                throw new AuraHandledException('Candidate and Position are required.');
            }
            Job_Application__c jobApp = new Job_Application__c();
            jobApp.Candidate__c = candidateId;
            jobApp.Position__c = positionId;
            jobApp.Source__c = source;
            jobApp.Cover_Letter__c = coverLetter;
            insert jobApp;
            return jobApp.Id;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    
    @AuraEnabled
    public static Id uploadCandiateProfilePicture(Id candidateId, String fileName, String base64Data, Id previousDocumentId) {
        System.debug('uploadCandiateProfilePicture called with candidateId=' + candidateId + ', fileName=' + fileName + ', previousDocumentId=' + previousDocumentId);
        if (candidateId == null) {
            System.debug('Candidate Id is null.');
            throw new AuraHandledException('Candidate Id is required for uploading profile picture.');
        }
        if (String.isBlank(base64Data)) {
            System.debug('base64Data is blank.');
            throw new AuraHandledException('The picture is empty. Please select a valid file.');
        }
        try {
            // // Delete previous document
            // if (previousDocumentId != null) {
                //     System.debug('Deleting previous document with Id=' + previousDocumentId);
                //     List<ContentDocument> docsToDelete = [SELECT Id FROM ContentDocument WHERE Id = :previousDocumentId LIMIT 1];
                //     if (!docsToDelete.isEmpty()) {
                    //         System.debug('Deleting previous ContentDocument.');
                    //         delete docsToDelete;
                //     } else {
                    //         System.debug('No previous ContentDocument found to delete.');
                //     }
            // }
            
            ContentVersion cv = new ContentVersion();
            cv.Title = fileName;
            cv.PathOnClient = fileName;
            cv.VersionData = EncodingUtil.base64Decode(base64Data);
            insert cv;
            System.debug('Inserted ContentVersion with Id=' + cv.Id);
            
            // Get ContentDocumentId from ContentVersion
            Id contentDocumentId = [SELECT ContentDocumentId FROM ContentVersion WHERE Id = :cv.Id].ContentDocumentId;
            System.debug('Retrieved ContentDocumentId=' + contentDocumentId);
            
            // Link ContentDocument to Candidate__c
            ContentDocumentLink cdlink = new ContentDocumentLink();
            cdlink.ContentDocumentId = contentDocumentId;
            cdlink.LinkedEntityId = candidateId;
            cdlink.ShareType = 'V';
            cdlink.Visibility = 'AllUsers';
            insert cdlink;
            System.debug('Inserted ContentDocumentLink for candidateId=' + candidateId);
            
            // Update Candidate__c.Photo_Document_Id__c
            Candidate__c candidate = [SELECT Id, Photo_Document_Id__c FROM Candidate__c WHERE Id = :candidateId LIMIT 1];
            candidate.Photo_Document_Id__c = contentDocumentId;
            update candidate;
            System.debug('Updated Candidate__c.Photo_Document_Id__c for candidateId=' + candidateId);
            
            return contentDocumentId;
        } catch (Exception e) {
            System.debug('Exception in uploadCandiateProfilePicture: ' + e.getMessage());
            throw new AuraHandledException('Error uploading profile picture: ' + e.getMessage());
        }
    }

    /**
     * https://gist.github.com/mhamzas/d1b6dda6d12b7572745a9e55dda4439d
     */
    @AuraEnabled(cacheable=true)
    public static Object getContentVersionByDocumentId(Id contentDocumentId) {
        try {
            if (contentDocumentId == null) {
                return null;
            }
            ContentVersion v = [
                SELECT Id, ContentDocumentId, Title, FileExtension, FileType, PathOnClient, VersionDataUrl, IsLatest, VersionData
                FROM ContentVersion
                WHERE ContentDocumentId = :contentDocumentId AND IsLatest = true
                LIMIT 1
            ];
            Map<String, Object> fileInfo = new Map<String, Object>();
            fileInfo.put('id', v.Id);
            fileInfo.put('contentDocumentId', v.ContentDocumentId);
            fileInfo.put('title', v.Title);
            fileInfo.put('fileExtension', v.FileExtension);
            fileInfo.put('fileType', v.FileType);
            fileInfo.put('pathOnClient', v.PathOnClient);
            fileInfo.put('versionDataUrl', v.VersionDataUrl);
            fileInfo.put('isLatest', v.IsLatest);
            if (v.FileExtension != null &&
                (v.FileExtension.equalsIgnoreCase('jpg') ||
                v.FileExtension.equalsIgnoreCase('jpeg') ||
                v.FileExtension.equalsIgnoreCase('png') ||
                v.FileExtension.equalsIgnoreCase('pdf'))
            ) {
                fileInfo.put('base64', EncodingUtil.base64Encode(v.VersionData));
            } else {
                return null;
            }
            return fileInfo;
        } catch (Exception e) {
            throw new AuraHandledException('Error retrieving ContentVersion: ' + e.getMessage());
        }
    }
    
    /**
     * https://youtu.be/lVwo5ArH6-I
     */
    @AuraEnabled(cacheable=true)
    public static String getFieldSet(String objectName, String fieldSetName) {
        try {
            Schema.FieldSet fieldSet = Schema.getGlobalDescribe().get(objectName).getDescribe().fieldSets.getMap().get(fieldSetName);
            List<Map<String, Object>> fieldList = new List<Map<String, Object>>();
            return JSON.serialize(fieldSet.getFields());
        } catch (Exception e) {
            throw new AuraHandledException('Error retrieving field set: ' + e.getMessage());
        }
    }
    
    @AuraEnabled(cacheable=true)
    public static List<ContentDocumentLink> getContentDocuments(Id recordId) {
        try {
            return [
                SELECT ContentDocumentId,
                       ContentDocument.Title,
                       ContentDocument.LatestPublishedVersionId,
                       ContentDocument.FileType
                FROM ContentDocumentLink
                WHERE LinkedEntityId = :recordId
                ORDER BY ContentDocument.CreatedDate DESC
            ];
        } catch (Exception e) {
            throw new AuraHandledException('Error retrieving documents: ' + e.getMessage());
        }
    }
    
    @AuraEnabled(cacheable=true)
    public static Id checkExistingCandidate(String email) {
        try {
            if (String.isBlank(email)) {
                return null;
            }
            List<Candidate__c> candidates = [SELECT Id FROM Candidate__c WHERE Email__c = :email LIMIT 1];
            if (!candidates.isEmpty()) {
                return candidates[0].Id;
            }
            return null;
            
        } catch (Exception e) {
            throw new AuraHandledException('Error checking existing candidate: ' + e.getMessage());
        }
    }
    
    @AuraEnabled(cacheable=true)
    public static List<Position__c> getJobListings(String searchTerm){
        try {
            if (String.isBlank(searchTerm)) {
                return [SELECT 
                    Id,
                    NAME,
                    Location__c,
                    CreatedDate,
                    Application_Deadline__c,
                    Department__c,
                    Education__c,
                    Experience_Level__c,
                    Job_Description__c,
                    Salary_Range__c,
                    Skills_Required__c,
                    Remaining_Openings__c,
                    Pay_Grade__c
                    FROM Position__c
                    WHERE Application_Deadline__c >= TODAY
                    AND Remaining_Openings__c > 0
                    ORDER BY CreatedDate DESC
                ];
            }
            String searchKey = '*' + searchTerm + '*';
            List<List<SObject>> searchResults = [
                FIND :searchKey
                IN ALL FIELDS
                RETURNING Position__c(
                    Id,
                    NAME,
                    Location__c,
                    CreatedDate,
                    Application_Deadline__c,
                    Department__c,
                    Education__c,
                    Experience_Level__c,
                    Job_Description__c,
                    Salary_Range__c,
                    Skills_Required__c,
                    Remaining_Openings__c,
                    Pay_Grade__c
                    WHERE Application_Deadline__c >= TODAY
                    AND Remaining_Openings__c > 0
                    ORDER BY CreatedDate DESC
                )
            ];
            // Check if results exist before accessing
            if (searchResults != null && !searchResults.isEmpty()) {
                return (List<Position__c>)searchResults[0];
            }
            return new List<Position__c>();
        } catch (Exception e) {
            throw new AuraHandledException('Error fetching Job Listings:' + e.getMessage());
        }
    }
    // Add method to update Candidate__c details
    @AuraEnabled
    public static Id updateCandidateDetails(Map<String, Object> candidateData) {
        try {
            if (candidateData == null || !candidateData.containsKey('Id')) {
                throw new AuraHandledException('Candidate Id is required for update.');
            }
            Id candidateId = (Id)candidateData.get('Id');
            Candidate__c candidate = [SELECT Id FROM Candidate__c WHERE Id = :candidateId LIMIT 1];
            for (String key : candidateData.keySet()) {
                if (key != 'Id') {
                    candidate.put(key, candidateData.get(key));
                }
            }
            update candidate;
            return candidate.Id;
        } catch (Exception e) {
            throw new AuraHandledException('Error updating candidate: ' + e.getMessage());
        }
    }
}