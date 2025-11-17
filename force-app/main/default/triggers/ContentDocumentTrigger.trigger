trigger ContentDocumentTrigger on ContentDocument (before delete) {
    switch on Trigger.operationType {
        when BEFORE_DELETE {
            // System.debug('ContentDocumentTrigger: BEFORE_DELETE fired with ' + Trigger.old.size() + ' records.');
            // System.debug('Trigger.old: ' + Trigger.old);
            ContentDocumentTriggerHandler.beforeDelete(Trigger.old);
        }
    }
    
}