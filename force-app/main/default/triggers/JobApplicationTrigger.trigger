trigger JobApplicationTrigger on Job_Application__c (before insert, before update) {
    switch on Trigger.operationType {
        when BEFORE_INSERT {
            JobApplicationTriggerHandler.handleBeforeInsert(Trigger.new);
        }
        when BEFORE_UPDATE {
            JobApplicationTriggerHandler.handleBeforeUpdate(Trigger.new, Trigger.oldMap);
        }
    }
}