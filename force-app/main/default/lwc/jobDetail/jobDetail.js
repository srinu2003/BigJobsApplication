import { LightningElement, wire } from 'lwc';
import { NavigationMixin, CurrentPageReference } from 'lightning/navigation';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import POSITION_NAME_FIELD from '@salesforce/schema/Position__c.Name';
import POSITION_DEPARTMENT_FIELD from '@salesforce/schema/Position__c.Department__c';
import POSITION_LOCATION_FIELD from '@salesforce/schema/Position__c.Location__c';
import POSITION_SALARY_RANGE_FIELD from '@salesforce/schema/Position__c.Salary_Range__c';
import POSITION_PAY_GRADE_FIELD from '@salesforce/schema/Position__c.Pay_Grade__c';
import POSITION_EXPERIENCE_LEVEL_FIELD from '@salesforce/schema/Position__c.Experience_Level__c';
import POSITION_STATUS_FIELD from '@salesforce/schema/Position__c.Status__c';
import POSITION_REMAINING_OPENINGS_FIELD from '@salesforce/schema/Position__c.Remaining_Openings__c';
import POSITION_APPLICATION_DEADLINE_FIELD from '@salesforce/schema/Position__c.Application_Deadline__c';
import POSITION_JOB_DESCRIPTION_FIELD from '@salesforce/schema/Position__c.Job_Description__c';
import POSITION_EDUCATION_FIELD from '@salesforce/schema/Position__c.Education__c';
import POSITION_SKILLS_REQUIRED_FIELD from '@salesforce/schema/Position__c.Skills_Required__c';

const FIELDS = [
    POSITION_NAME_FIELD,
    POSITION_DEPARTMENT_FIELD,
    POSITION_LOCATION_FIELD,
    POSITION_SALARY_RANGE_FIELD,
    POSITION_PAY_GRADE_FIELD,
    POSITION_EXPERIENCE_LEVEL_FIELD,
    POSITION_STATUS_FIELD,
    POSITION_REMAINING_OPENINGS_FIELD,
    POSITION_APPLICATION_DEADLINE_FIELD,
    POSITION_JOB_DESCRIPTION_FIELD,
    POSITION_EDUCATION_FIELD,
    POSITION_SKILLS_REQUIRED_FIELD
];

export default class JobDetail extends NavigationMixin(LightningElement) {
    recordId;
    position;
    error;
    isLoading = true;

    @wire(CurrentPageReference)
    getStateParameters(currentPageReference) {
        if (currentPageReference) {
            this.recordId = currentPageReference.attributes.recordId || 
                           currentPageReference.state?.recordId;
        }
    }

    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    wiredPosition({ error, data }) {
        this.isLoading = false;
        if (data) {
            this.position = {
                Id: data.id,
                Name: getFieldValue(data, POSITION_NAME_FIELD),
                Department__c: getFieldValue(data, POSITION_DEPARTMENT_FIELD),
                Location__c: getFieldValue(data, POSITION_LOCATION_FIELD),
                Salary_Range__c: getFieldValue(data, POSITION_SALARY_RANGE_FIELD),
                Pay_Grade__c: getFieldValue(data, POSITION_PAY_GRADE_FIELD),
                Experience_Level__c: getFieldValue(data, POSITION_EXPERIENCE_LEVEL_FIELD),
                Status__c: getFieldValue(data, POSITION_STATUS_FIELD),
                Remaining_Openings__c: getFieldValue(data, POSITION_REMAINING_OPENINGS_FIELD),
                Application_Deadline__c: getFieldValue(data, POSITION_APPLICATION_DEADLINE_FIELD),
                Job_Description__c: getFieldValue(data, POSITION_JOB_DESCRIPTION_FIELD),
                Education__c: getFieldValue(data, POSITION_EDUCATION_FIELD),
                Skills_Required__c: getFieldValue(data, POSITION_SKILLS_REQUIRED_FIELD)
            };
            this.error = undefined;
        } else if (error) {
            this.error = error.body?.message || 'An error occurred while loading the position details.';
            this.position = undefined;
            this.showErrorToast();
        }
    }

    handleApplyNow() {
        if (!this.position) {
            this.showErrorToast('Position details not available');
            return;
        }

        if (this.position.Status__c === 'Closed') {
            this.showWarningToast('This position is no longer accepting applications.');
            return;
        }

        const deadline = new Date(this.position.Application_Deadline__c);
        const today = new Date();
        if (deadline < today) {
            this.showWarningToast('The application deadline for this position has passed.');
            return;
        }

        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                name: 'Application__c' // Experience Cloud Application page API
            },
            state: {
                positionId: this.position.Id,
                positionName: this.position.Name,
                positionLocation: this.position.Location__c,
                positionDepartment: this.position.Department__c
            }
        });
    }

    showErrorToast(message) {
        const evt = new ShowToastEvent({
            title: 'Error',
            message: message || this.error,
            variant: 'error',
            mode: 'sticky'
        });
        this.dispatchEvent(evt);
    }

    showWarningToast(message) {
        const evt = new ShowToastEvent({
            title: 'Warning',
            message: message,
            variant: 'warning',
            mode: 'dismissable'
        });
        this.dispatchEvent(evt);
    }
}