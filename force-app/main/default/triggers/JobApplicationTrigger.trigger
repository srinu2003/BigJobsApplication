trigger JobApplicationTrigger on Job_Application__c (before insert, after insert, before update) {
    switch on Trigger.operationType {
        when BEFORE_INSERT {
            JobApplicationTriggerHandler.handleBeforeInsert(Trigger.new);
        }
        when AFTER_INSERT {
            System.debug('After Update Trigger:' + Trigger.new);
            JobApplicationTriggerHandler.handleAfterInsert(Trigger.new, Trigger.newMap);
        }
        when BEFORE_UPDATE {
            JobApplicationTriggerHandler.handleBeforeUpdate(Trigger.new, Trigger.oldMap);
        }
    }
}