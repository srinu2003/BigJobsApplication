public class JobOwnerEmailNotifier implements Database.Batchable<SObject>, Database.Stateful, Database.AllowsCallouts, Schedulable {
    
    public void execute(SchedulableContext sc) {
        // The Batch Size is set to 100 to match the Maximum Callouts in Single Transaction
        // The Batch Size is set to 10 to match the Maximum SendEmails calls in Single Transaction
        Database.executeBatch(this, 10);
    }
    
    public Database.QueryLocator start(Database.BatchableContext bc) {

        // System.debug('getLimitQueryRows()::' + Limits.getLimitQueryRows());
        return Database.getQueryLocator([
            SELECT Id, Name, Owner.Name, Owner.Email, Owner.Id, Notified_Owner__c
            FROM Position__c
            WHERE Notified_Owner__c = false
        ]);
    }
    
    public void execute(Database.BatchableContext bc, List<Position__c> scope) {
        
        List<Position__c> positionsToUpdate = new List<Position__c>();
        List<Messaging.SingleEmailMessage> emailsToSend = new List<Messaging.SingleEmailMessage>();

        // System.debug('getLimitEmailInvocations()::' + Limits.getLimitEmailInvocations());
        // System.debug('getLimitCallouts()::' + Limits.getLimitCallouts());
        // System.debug('getLimitQueryLocatorRows()::' + Limits.getLimitQueryLocatorRows());
        
        for (Position__c position : scope) {

            Id positionId = position.Id;
            String positionTitle = position.Name;
            String OwnerName = position.Owner.Name;
            String OwnerEmail = position.Owner.Email;
            Id OwnerId = position.Owner.Id;

            Integer Number_of_Applications = [SELECT COUNT() FROM Job_Application__c WHERE Position__c = :positionId];
            System.debug('Position Id: ' + positionId + ', Name: ' + positionTitle + ', Owner: ' + OwnerName + ', Email: ' + OwnerEmail
                + ', Number of Applications: ' + Number_of_Applications + ', Notified Owner Flag: ' + position.Notified_Owner__c);
            
            // Update Notification Flags
            if (Number_of_Applications > 200 && !position.Notified_Owner__c) {
                positionsToUpdate.add(new Position__c(Id = positionId, Notified_Owner__c = true));
            }
            
            String JobObjURL = URL.getOrgDomainUrl().toExternalForm() + '/' + positionId;
            
            // Callout to Get Short URL
            String jobShortURL = JobObjURL;
            try {
                Http httpCallout = new Http();
                HttpRequest req = new HttpRequest();
                req.setEndpoint(Label.SHORT_URL_END_POINT + '?url=' + JobObjURL);
                req.setMethod('GET');
                HttpResponse res = httpCallout.send(req);
                if (res.getStatusCode() == 200 && String.isNotBlank(res.getBody())) {
                    jobShortURL = res.getBody();
                } else {
                    System.debug('Callout Failed: ' + res.getStatus() + ':' + res.getStatusCode() + ', Body: ' + res.getBody());
                }
            } catch (Exception ex) {
                System.debug('Callout Failed: ' + ex.getMessage());
            }
            
            // Prepare SingleEmailMessagse for Each Job Owner
            Messaging.SingleEmailMessage email = new Messaging.SingleEmailMessage();
            email.setToAddresses(new String[] {OwnerEmail});
            email.setTargetObjectId(OwnerId);
            email.setSubject('Your Job Posting tittled "' + positionTitle + '" received too many Applications');
            email.setPlainTextBody('Hi ' + OwnerName + ',\n\n'
                + '\t Your job post, "' + positionTitle + '", has now received over ' + Number_of_Applications + ' applications.'
                + 'You may want to review and manage the applications to ensure timely responses.'
                + '\n View the job here: ' + jobShortURL + '\n'
                // 'This is a great response! You might consider closing the job or updating it if you\'re nearing a decision.');
                + '\n Thank you.');

            email.setSaveAsActivity(false);
            
            // Debug Email Content
            System.debug('Email to be sent to Owner Id: ' + OwnerId + ',\nSubject: ' + email.getSubject() + ',\nBody: ' + email.getPlainTextBody());

            emailsToSend.add(email);
        }
        if (!positionsToUpdate.isEmpty()){
            update positionsToUpdate;
        }
        
        if (!emailsToSend.isEmpty()) {
            // Max limit of 10 sendEmail methods per transaction
            System.debug('Emails to Send: ' + emailsToSend.size());
            List<Messaging.SendEmailResult> emailResultList = Messaging.sendEmail(emailsToSend, false);
            System.debug(emailResultList);
        }
    }
    
    public void finish(Database.BatchableContext bc) {

    }
}