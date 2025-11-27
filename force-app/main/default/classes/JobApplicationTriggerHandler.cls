public with sharing class JobApplicationTriggerHandler {
    
    private static final Id TALENT_ACQUISITION_SCREENING_QUEUE_ID = '00Gg5000000qm0XEAQ';
    
    public static void handleBeforeInsert(List<Job_Application__c> newJobApplications) {
        List<Job_Application__c> toValidate = new List<Job_Application__c>();
        for (Job_Application__c ja : newJobApplications) {
            if (ja.Candidate__c != null && ja.Position__c != null){
                toValidate.add(ja);
            } else {
                ja.addError('Candidate and Position are mandatory for Job Application.');
            }
        }
        preventDuplicateApplications(toValidate);
    }
    
    /**
     * Assignes new Job Applicatons, to Screening.
     * By assigning job applications to Queue: Application_Screening.
     */
    public static void handleAfterInsert(List<Job_Application__c> newJobApplications, Map<Id, Job_Application__c> newJobApplicationsMap) {
        List<Job_Application__c> jobApplicationsToUpdate = new List<Job_Application__c>();
        
        for (Job_Application__c JobApplication : newJobApplications) {
            if (JobApplication.Candidate__c != null && JobApplication.Position__c != null && JobApplication.OwnerId != TALENT_ACQUISITION_SCREENING_QUEUE_ID) {
                Job_Application__c ja = new Job_Application__c(Id = JobApplication.Id, OwnerId = TALENT_ACQUISITION_SCREENING_QUEUE_ID);
                jobApplicationsToUpdate.add(ja);
            }
        }
        
        if (!jobApplicationsToUpdate.isEmpty()) {
            update jobApplicationsToUpdate;
        }
    }
    
    public static void handleBeforeUpdate(List<Job_Application__c> newJobApplications, Map<Id, Job_Application__c> oldJobApplicationsMap) {
        List<Job_Application__c> toValidate = new List<Job_Application__c>();
        
        for (Job_Application__c ja : newJobApplications) {
            Job_Application__c oldJa = oldJobApplicationsMap.get(ja.Id);
            // Perform Validations

            // 1. Candidate__c and Position__c can't be changed.
            if (ja.Candidate__c != oldJa.Candidate__c || ja.Position__c != oldJa.Position__c) {
                ja.addError('Cannot change Candidate or Position on an existing Job Application.');
            }

            // 2. Stage__c Path Validation.
            if (ja.Stage__c != oldJa.Stage__c) {
                if (oldJa.Stage__c == 'New' && ja.Stage__c != 'Screening') {
                    ja.addError('Stage__c', 'Next Stage after "New" must be "Screening".');
                } else if (oldJa.Stage__c == 'Screening' && ja.Stage__c != 'Technical Interview') {
                    ja.addError('Stage__c', 'Next Stage after "Screening" must be "Technical Interview".');
                }
            }
        }
        // preventDuplicateApplications(toValidate);
    }
    
    public static void preventDuplicateApplications(List<Job_Application__c> newJobApplications) {
        Set<Id> candidateIds = new Set<Id>();
        Set<Id> positionIds = new Set<Id>();
        
        for (Job_Application__c ja : newJobApplications) {
            if (ja.Candidate__c != null) candidateIds.add(ja.Candidate__c);
            if (ja.Position__c != null) positionIds.add(ja.Position__c);
        }
        
        Set<String> existingJobsIdentifier = new Set<String>();
        for (Job_Application__c existingJobApplicaton : [SELECT Candidate__c, Position__c FROM Job_Application__c WHERE Candidate__c IN :candidateIds AND Position__c IN :positionIds]) {
            // create a unique identifier
            String jobIdentifierKey = existingJobApplicaton.Candidate__c + '-' + existingJobApplicaton.Position__c;
            existingJobsIdentifier.add(jobIdentifierKey);
        }
        
        for (Job_Application__c jobApplication : newJobApplications) {
            String jobIdentifierKey = jobApplication.Candidate__c + '-' + jobApplication.Position__c;
            if (existingJobsIdentifier.contains(jobIdentifierKey)) {
                jobApplication.addError('A job application for this candidate and position already exists.');
            } else {
                existingJobsIdentifier.add(jobIdentifierKey);
                jobApplication.Stage__c = 'New';
            }
        }
    }
}