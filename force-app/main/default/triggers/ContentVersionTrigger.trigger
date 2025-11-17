trigger ContentVersionTrigger on ContentVersion (after insert) {
    switch on Trigger.operationType {
        when AFTER_INSERT {
            // System.debug('ContentVersionTrigger: AFTER_INSERT fired with ' + Trigger.new.size() + ' records.');
            // System.debug('Trigger.new: ' + Trigger.new);
            CandidateContentVersionHandler.afterInsert(Trigger.new, Trigger.newMap);
        }
    }
}