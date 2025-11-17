List<ContentDocument> docsToDelete = [SELECT Id, Title FROM ContentDocument WHERE Title LIKE 'CAND_%'];
delete docsToDelete;