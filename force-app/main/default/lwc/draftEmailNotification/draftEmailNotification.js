import { LightningElement, api, wire } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { encodeDefaultFieldValues } from "lightning/pageReferenceUtils";

import { getRecord } from "lightning/uiRecordApi";
import CANDIDATE_FIELD from "@salesforce/schema/Job_Application__c.Candidate__c";
import CANDIDATE_EMAIL_FIELD from "@salesforce/schema/Candidate__c.Email__c";

const JOB_APP_FIELDS = [CANDIDATE_FIELD];
const CANDIDATE_FIELDS = [CANDIDATE_EMAIL_FIELD];

export default class DraftEmailNotification extends NavigationMixin(LightningElement) {
    @api recordId;
    jobApplication;
    candidateID;
    candidateEmail;

    @wire(getRecord, { recordId: "$recordId", fields: JOB_APP_FIELDS })
    wiredJobApplication({ error, data }) {
        if (data) {
            this.jobApplication = data;
            this.candidateID = this.jobApplication.fields.Candidate__c?.value;
        } else if (error) {
            console.error("Error retrieving job application record:", error);
        }
    }

    @wire(getRecord, { recordId: "$candidateID", fields: CANDIDATE_FIELDS })
    wiredCandidate({ error, data }) {
        if (data) {
            this.candidateEmail = data.fields.Email__c?.value;
        } else if (error) {
            console.error("Error retrieving candidate record:", error);
        }
    }

    handleEmail() {
        var pageRef = {
            type: "standard__quickAction",
            attributes: {
            apiName: "Global.SendEmail",
            },
            state: {
            recordId: this.recordId,
            defaultFieldValues: encodeDefaultFieldValues({
                Subject: 'Pre-populated Subject of the Email',
                ToAddress: this.candidateEmail,
                RelatedToId: this.candidateID,
            }),
            },
        };
        this[NavigationMixin.Navigate](pageRef);
    }
}