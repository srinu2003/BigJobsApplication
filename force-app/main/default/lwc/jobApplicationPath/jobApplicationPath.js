import { api, LightningElement, wire } from 'lwc';
import { getObjectInfo, getPicklistValues } from "lightning/uiObjectInfoApi";
import { getRecord } from 'lightning/uiRecordApi';
import Job_Application__c from '@salesforce/schema/Job_Application__c';
import Stage__c from '@salesforce/schema/Job_Application__c.Stage__c';

export default class JobApplicationPath extends LightningElement {
    @api recordId;
    @api objectApiName;

    stagePicklistValues = [];
    jobApplicationRecord;


    @wire(getObjectInfo, { objectApiName: '$objectApiName' })
    objectInfo;

    @wire(getPicklistValues, { recordTypeId: '$objectInfo.data.defaultRecordTypeId', fieldApiName: Stage__c })
    wiredStagePicklistValues({ data, error }) {
        if (data) {
            this.stagePicklistValues = data.values.slice(0, data.values.length - 4);
        } else if (error) {
            console.error('Error fetching picklist values: ', error);
        }
    }

    @wire(getRecord, { recordId: '$recordId', fields: [Stage__c] })
    jobApplicationRecord;

    get currentStage() {
        return this.jobApplicationRecord?.data?.fields?.Stage__c?.value;
    }

    get stagePicklistValues() {
        return this.wiredStagePicklistValues.data?.values || [];
    }

    handleClick(event) {
        event.preventDefault();
        const newStage = event.target.value;
        console.log('Step clicked, new stage: ' + newStage);
        // Additional logic can be added here to handle stage change
    }

    handleFocus(event) {
        const popovers = this.template.querySelectorAll('.slds-popover');
        popovers.forEach((popover, idx) => {
            if (event.target.value === this.stagePicklistValues[idx].value) {
                popover.style.visibility = 'visible';
            } else {
                popover.style.visibility = 'hidden';
            }
        });
    }

    handleStagePathUpdate(event) {
        const updatedStage = event.detail;
        console.log('Stage path updated to: ' + updatedStage);
        // Additional logic can be added here to handle stage path update
    }

    renderedCallback() {
        console.log('Record Id: ' + this.recordId);
        console.log('Object API Name: ' + this.objectApiName);
        console.log('Status Picklist Values: ');
        console.log(this.stagePicklistValues);
        console.log('Job Application Record: ');
        console.log(this.jobApplicationRecord?.data?.fields?.Stage__c?.value);
    }
}