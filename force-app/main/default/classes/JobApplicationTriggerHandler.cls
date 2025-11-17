public with sharing class JobApplicationTriggerHandler {
    
    public static void handleBeforeInsert(List<Job_Application__c> newJobApplications) {
        List<Job_Application__c> toValidate = new List<Job_Application__c>();
        for (Job_Application__c ja : newJobApplications) {
            if (ja.Candidate__c != null && ja.Position__c != null){
                toValidate.add(ja);
            }
        }
        preventDuplicateApplications(toValidate);
    }
    
    public static void handleBeforeUpdate(List<Job_Application__c> newJobApplications, Map<Id, Job_Application__c> oldJobApplicationsMap) {
        List<Job_Application__c> toValidate = new List<Job_Application__c>();
        
        for (Job_Application__c ja : newJobApplications) {
            if (ja.Candidate__c != oldJobApplicationsMap.get(ja.Id).Candidate__c ||
            ja.Position__c != oldJobApplicationsMap.get(ja.Id).Position__c) {
                ja.addError('Cannot change Candidate or Position on an existing Job Application.');
            } else {
                toValidate.add(ja);
            }
        }
        // preventDuplicateApplications(toValidate);
    }
    
    public static void preventDuplicateApplications(List<Job_Application__c> newJobApplications) {
        Set<Id> candidateIds = new Set<Id>();
        Set<Id> positionIds = new Set<Id>();
        Map<String, Job_Application__c> newAppMap = new Map<String, Job_Application__c>();
        
        for (Job_Application__c ja : newJobApplications) {
            if (ja.Candidate__c != null) candidateIds.add(ja.Candidate__c);
            if (ja.Position__c != null) positionIds.add(ja.Position__c);
        }

        List<String> existingJobsIdentifier = new List<String>();
        for (Job_Application__c existingJobApplicaton : [SELECT Candidate__c, Position__c FROM Job_Application__c WHERE Candidate__c IN :candidateIds AND Position__c IN :positionIds]) {
            // create a unique identifier
            String jobIdentifierKey = existingJobApplicaton.Candidate__c + '-' + existingJobApplicaton.Position__c;
            existingJobsIdentifier.add(jobIdentifierKey);
        }
        
        for (Job_Application__c jobApplication : newJobApplications) {
            String jobIdentifierKey = jobApplication.Candidate__c + '-' + jobApplication.Position__c;
            if (existingJobsIdentifier.contains(jobIdentifierKey)) {
                jobApplication.addError('A job application for this candidate and position already exists.');
            }
        }
    }
}