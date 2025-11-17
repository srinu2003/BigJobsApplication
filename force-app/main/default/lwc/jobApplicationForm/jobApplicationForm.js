import { LightningElement, wire, track } from 'lwc';
import Toast from 'lightning/toast';
import { NavigationMixin, CurrentPageReference } from 'lightning/navigation';
import { getRecord, createRecord, updateRecord } from 'lightning/uiRecordApi';
import { getObjectInfo, getPicklistValues } from "lightning/uiObjectInfoApi";
import { refreshApex } from '@salesforce/apex';
import checkExistingCandidate from '@salesforce/apex/BigJobsPortalController.checkExistingCandidate';

import JOB_APPLICATION_OBJECT from "@salesforce/schema/Job_Application__c";
import CANDIDATE_OBJECT from "@salesforce/schema/Candidate__c";

import JOB_APPLICATION_SOURCE_FIELD from "@salesforce/schema/Job_Application__c.Source__c";

import ID_FIELD from "@salesforce/schema/Candidate__c.Id";
import SALUTATION_FIELD from "@salesforce/schema/Candidate__c.Salutation__c";
import FIRST_NAME_FIELD from "@salesforce/schema/Candidate__c.First_Name__c";
import LAST_NAME_FIELD from "@salesforce/schema/Candidate__c.Last_Name__c";
import DATE_OF_BIRTH_FIELD from "@salesforce/schema/Candidate__c.Date_of_Birth__c";
import EMAIL_FIELD from "@salesforce/schema/Candidate__c.Email__c";
import PHONE_FIELD from "@salesforce/schema/Candidate__c.Phone__c";
import MOBILE_FIELD from "@salesforce/schema/Candidate__c.Mobile__c";
import LINKEDIN_PROFILE_FIELD from "@salesforce/schema/Candidate__c.LinkedIn_Profile__c";
import STREET_ADDRESS_1_FIELD from "@salesforce/schema/Candidate__c.Street_Address_1__c";
import STREET_ADDRESS_2_FIELD from "@salesforce/schema/Candidate__c.Street_Address_2__c";
import CITY_FIELD from "@salesforce/schema/Candidate__c.City__c";
import STATE_PROVINCE_FIELD from "@salesforce/schema/Candidate__c.State_Province__c";
import ZIP_POSTAL_CODE_FIELD from "@salesforce/schema/Candidate__c.Zip_Postal_Code__c";
import COUNTRY_FIELD from "@salesforce/schema/Candidate__c.Country__c";
import YEARS_OF_EXPERIENCE_FIELD from "@salesforce/schema/Candidate__c.Years_of_Experience__c";
import HIGHEST_EDUCATION_LEVEL_FIELD from "@salesforce/schema/Candidate__c.Highest_Education_Level__c";
import CURRENTLY_EMPLOYED_FIELD from "@salesforce/schema/Candidate__c.Currently_Employed__c";
import CURRENT_EMPLOYER_FIELD from "@salesforce/schema/Candidate__c.Current_Employer__c";
import WORK_EXPERIENCE_NOTES_FIELD from "@salesforce/schema/Candidate__c.Work_Experience_Notes__c";
import IDENTITY_DOCUMENT_TYPE_FIELD from "@salesforce/schema/Candidate__c.Identity_Document_Type__c";
import IDENTITY_DOCUMENT_NUMBER_FIELD from "@salesforce/schema/Candidate__c.Identity_Document_Number__c";
import PAN_CARD_NUMBER_FIELD from "@salesforce/schema/Candidate__c.PAN_Card_Number__c";

const CANDIDATE_FIELDS = [
    ID_FIELD,
    SALUTATION_FIELD,
    FIRST_NAME_FIELD,
    LAST_NAME_FIELD,
    DATE_OF_BIRTH_FIELD,
    EMAIL_FIELD,
    PHONE_FIELD,
    MOBILE_FIELD,
    LINKEDIN_PROFILE_FIELD,
    STREET_ADDRESS_1_FIELD,
    STREET_ADDRESS_2_FIELD,
    CITY_FIELD,
    STATE_PROVINCE_FIELD,
    ZIP_POSTAL_CODE_FIELD,
    COUNTRY_FIELD,
    YEARS_OF_EXPERIENCE_FIELD,
    HIGHEST_EDUCATION_LEVEL_FIELD,
    CURRENTLY_EMPLOYED_FIELD,
    CURRENT_EMPLOYER_FIELD,
    WORK_EXPERIENCE_NOTES_FIELD,
    IDENTITY_DOCUMENT_TYPE_FIELD,
    IDENTITY_DOCUMENT_NUMBER_FIELD,
    PAN_CARD_NUMBER_FIELD,
];

import createJobApplication from '@salesforce/apex/BigJobsPortalController.createJobApplication';

export default class JobApplicationForm extends NavigationMixin(LightningElement) {

    candidateRecordId = null;
    positionId = null;
    positionName = null;
    positionLocation = null;
    positionDepartment = null;

    candidateObjectApiName = 'Candidate__c';
    wiredCandidateResult;

    @track candidateFormData = {
        Id: null,
        Email__c: 'sample.candidate@email.com',
        Salutation__c: 'Mr.',
        First_Name__c: 'John',
        Last_Name__c: 'Doe',
        Date_of_Birth__c: '1990-01-01',
        Phone__c: '1234567890',
        Mobile__c: '0987654321',
        LinkedIn_Profile__c: 'https://linkedin.com/in/johndoe',
        Street_Address_1__c: '123 Main St',
        Street_Address_2__c: 'Apt 4B',
        City__c: 'Sample City',
        State_Province__c: 'Sample State',
        Zip_Postal_Code__c: '12345',
        Country__c: 'Sample Country',
        Years_of_Experience__c: 5,
        Highest_Education_Level__c: 'PG',
        Currently_Employed__c: true,
        Current_Employer__c: 'Sample Corp',
        Work_Experience_Notes__c: 'Worked on multiple projects.',
        Identity_Document_Type__c: 'Passport',
        Identity_Document_Number__c: 'A1234567',
        PAN_Card_Number__c: 'ABCDE1234F',
    };

    @track applicationFormData = {
        Source__c: '',
        Cover_Letter__c: '',
    };

    currentStep = '1';
    isNewCandidate = true;
    isProcessing = false;

    salutationOptions;
    highestEducationOptions;
    identityDocTypeOptions;
    sourceOptions;

    touchedFields = new Set();

    resumeFile = null;
    identityDocFile = null;
    jobApplicationId = null;
    existingDocuments = [];
    selectedExistingDocumentId = null;
    fileTagValue = '';
    maxDateOfBirth;

    connectedCallback() {
        this.maxDateOfBirth = this.calculateMaxDateOfBirth();
    }

    calculateMaxDateOfBirth() {
        const today = new Date();
        const maxDate  = today.setFullYear(today.getFullYear() - 18);
        return new Date(maxDate).toISOString().split('T')[0];
    }

    @wire(CurrentPageReference)
    setCurrentPageReference(pageRef) {
        if (pageRef && pageRef.state) {
            this.positionId = pageRef.state.positionId || this.positionId;
            this.positionName = pageRef.state.positionName || this.positionName;
            this.positionLocation = pageRef.state.positionLocation || this.positionLocation;
            this.positionDepartment = pageRef.state.positionDepartment || this.positionDepartment;
        }
    }

    @wire(getObjectInfo, { objectApiName: CANDIDATE_OBJECT }) candidateObjectInfo;
    @wire(getObjectInfo, { objectApiName: JOB_APPLICATION_OBJECT }) jobApplicationObjectInfo;

    @wire(getRecord, { recordId: "$candidateRecordId", fields: CANDIDATE_FIELDS })
    wiredCandidateData(result) {
        this.wiredCandidateResult = result;
        const { error, data } = result;
        if (data) {
            for (let field of CANDIDATE_FIELDS) {
                const fieldName = field.fieldApiName;
                this.candidateFormData = {
                    ...this.candidateFormData,
                    [fieldName]: data.fields[fieldName]?.value || this.candidateFormData[fieldName]
                };
            }
        } else if (error) {
            console.error('Error fetching candidate data:', error);
        }
    }

    @wire(getPicklistValues, { recordTypeId: '012000000000000AAA', fieldApiName: SALUTATION_FIELD })
    wiredSalutationOptions({ data }) {
        this.salutationOptions = data
            ? [{ label: '-- None --', value: '' }, ...data.values.map(item => ({ label: item.label, value: item.value }))]
            : [];
    }

    @wire(getPicklistValues, { recordTypeId: '$candidateObjectInfo.data.defaultRecordTypeId', fieldApiName: HIGHEST_EDUCATION_LEVEL_FIELD })
    wiredEducationOptions({ data }) {
        this.highestEducationOptions = data
            ? [{ label: '-- None --', value: '' }, ...data.values.map(item => ({ label: item.label, value: item.value }))]
            : [];
    }

    @wire(getPicklistValues, { recordTypeId: '$candidateObjectInfo.data.defaultRecordTypeId', fieldApiName: IDENTITY_DOCUMENT_TYPE_FIELD })
    wiredIdentityDocTypeOptions({ data }) {
        this.identityDocTypeOptions = data
            ? [{ label: '-- None --', value: '' }, ...data.values.map(item => ({ label: item.label, value: item.value }))]
            : [];
    }

    @wire(getPicklistValues, { recordTypeId: '$jobApplicationObjectInfo.data.defaultRecordTypeId', fieldApiName: JOB_APPLICATION_SOURCE_FIELD })
    wiredJobApplicationSourceOptions({ data }) {
        this.sourceOptions = data
            ? [{ label: '-- None --', value: '' }, ...data.values.map(item => ({ label: item.label, value: item.value }))]
            : [];
    }

    get isStep1() { return this.currentStep === '1'; }
    get isStep2() { return this.currentStep === '2'; }
    get isStep3() { return this.currentStep === '3'; }
    get isStep4() { return this.currentStep === '4'; }
    get isStep5() { return this.currentStep === '5'; }

    handleApplicationInputChange = (event) => {
        const field = event.target.label === 'How did you hear about this position?' ? 'Source__c' : 'Cover_Letter__c';
        this.applicationFormData = { ...this.applicationFormData, [field]: event.target.value };
    }

    async handleSubmitApplication() {
        if (!this.validateCurrentStep()) return;
        this.isProcessing = true;
        try {
            const result = await createJobApplication({
                candidateId: this.candidateRecordId,
                positionId: this.positionId,
                source: this.applicationFormData.Source__c,
                coverLetter: this.applicationFormData.Cover_Letter__c
            });
            this.jobApplicationId = result;
            this.fileTagValue = `JOB_${result}_RESUME`;
            this.showToast('Success', 'Job Application created. Please upload your resume.', 'success');
            this.currentStep = '5';
        } catch (error) {
            this.showToast('Error', 'Error creating job application: ' + this.getErrorMessage(error), 'error');
        } finally {
            this.isProcessing = false;
        }
    }

    handleuploadfinished(event) {
        if (event && event.target && event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];
            console.log('Files Uploaded' + file.name + 'with documentId:' + file.documentId);
            // if (file.size > 5242880) {
            //     this.showToast('Error', 'File size should not exceed 5MB', 'error');
            //     return;
            // }
            this.resumeFile = file;
            this.showToast('Success', 'Resume uploaded successfully', 'success');
        } else {
            console.warn("No file selected or event object is malformed.");

        }
    }

    handleFinish = () => {
        this.showToast('Success', 'Successfullt Applied for the Job', 'success');
    }

    get progressLabel() {
        const steps = ['Email Verification', 'Personal Info', 'Professional Details', 'Documents', 'Review & Submit'];
        return steps[parseInt(this.currentStep, 10) - 1] || '';
    }

    customValidationRules = {
        'Email__c': (value) => {
            console.log('Custom Validating Email__c:', value);
            return '';
        },
        'Salutation__c': (value) => {
            console.log('Custom Validating Salutation__c:', value);
            return '';
        },
        'First_Name__c': (value) => {
            console.log('Custom Validating First_Name__c:', value);
            return '';
        },
        'Last_Name__c': (value) => {
            console.log('Custom Validating Last_Name__c:', value);
            return '';
        },
        'Date_of_Birth__c': (value) => {
            console.log('Custom Validating Date_of_Birth__c:', value);
            return '';
        },
        'Phone__c': (value) => {
            console.log('Custom Validating Phone__c:', value);
            return '';
        },
        'Mobile__c': (value) => {
            console.log('Custom Validating Mobile__c:', value);            
            return '';
        },
        'LinkedIn_Profile__c': (value) => {
            console.log('Custom Validating LinkedIn_Profile__c:', value);
            return '';
        },
        'Street_Address_1__c': (value) => {
            console.log('Custom Validating Street_Address_1__c:', value);
            return '';
        },
        'Street_Address_2__c': (value) => {
            console.log('Custom Validating Street_Address_2__c:', value);
            return '';
        },
        'City__c': (value) => {
            console.log('Custom Validating City__c:', value);
            return '';
        },
        'State_Province__c': (value) => {
            console.log('Custom Validating State_Province__c:', value);
            return '';
        },
        'Zip_Postal_Code__c': (value) => {
            console.log('Custom Validating Zip_Postal_Code__c:', value);
            return '';
        },
        'Country__c': (value) => {
            console.log('Custom Validating Country__c:', value);
            return '';
        },
        'Years_of_Experience__c': (value) => {
            console.log('Custom Validating Years_of_Experience__c:', value);
            return '';
        },
        'Highest_Education_Level__c': (value) => {
            console.log('Custom Validating Highest_Education_Level__c:', value);
            return '';
        },
        'Currently_Employed__c': (value) => {
            console.log('Custom Validating Currently_Employed__c:', value);
            return '';
        },
        'Current_Employer__c': (value) => {
            console.log('Custom Validating Current_Employer__c:', value);
            return '';
        },
        'Work_Experience_Notes__c': (value) => {
            console.log('Custom Validating Work_Experience_Notes__c:', value);
            return '';
        },
        'Identity_Document_Type__c': (value) => {
            console.log('Custom Validating Identity_Document_Type__c:', value);
            return '';
        },
        'Identity_Document_Number__c': (value) => {
            console.log('Custom Validating Identity_Document_Number__c:', value);
            return '';
        },
    }

    async refreshCandidateData() {
        if (this.wiredCandidateResult && this.candidateRecordId) {
            try {
                await refreshApex(this.wiredCandidateResult);
                return true;
            } catch (error) {
                console.error('Error refreshing candidate data:', error);
                return false;
            }
        }
        return false;
    }

    validateField(fieldName) {
        const input = this.template.querySelector(`[data-field="${fieldName}"]`);
        if (!input) return true;

        input.setCustomValidity('');

        // Standard validation
        if (!input.checkValidity()) {
            input.reportValidity();
            return false;
        }

        // Custom validation
        if (this.customValidationRules[fieldName]) {
            const value = this.candidateFormData[fieldName];
            const errorMessage = this.customValidationRules[fieldName](value);

            if (errorMessage) {
                input.setCustomValidity(errorMessage);
                input.reportValidity();
                return false;
            }
        }
        return true;
    }

    validateCurrentStep() {
        const step = parseInt(this.currentStep, 10);
        const fieldsToValidate = this.getStepFields(step);
        let allValid = true;

        fieldsToValidate.forEach(fieldName => {
            const isValid = this.validateField(fieldName);
            if (!isValid) {
                allValid = false;
            }
        });

        return allValid;
    }

    getStepFields(stepNumber) {
        const stepFields = {
            1: ['Email__c'],
            2: [
                'Salutation__c',
                'First_Name__c',
                'Last_Name__c',
                'Date_of_Birth__c',
                'Phone__c',
                'Mobile__c',
                'LinkedIn_Profile__c',
                'Street_Address_1__c',
                'Street_Address_2__c',
                'City__c',
                'State_Province__c',
                'Zip_Postal_Code__c',
                'Country__c'
            ],
            3: [
                'Years_of_Experience__c',
                'Highest_Education_Level__c',
                'Currently_Employed__c',
                'Current_Employer__c',
                'Work_Experience_Notes__c',
                'Identity_Document_Type__c',
                'Identity_Document_Number__c'],
        };
        return stepFields[stepNumber] || [];
    }


    showToast(title, message, variant, duration = 3000) {
        Toast.show({ label: title, message, variant, mode: 'dismissible', duration }, this);
    }

    getErrorMessage(error) {
        if (error.body && error.body.message) return error.body.message;
        if (error.message) return error.message;
        return 'An unknown error occurred';
    }

    async getCandidateByEmail() {
        // console.log('Candidate form data before checking:', this.candidateFormData);
        this.isProcessing = true;
        // console.log('Candidate form data after clearing:', this.candidateFormData);

        try {
            const candidateID = await checkExistingCandidate({ email: this.candidateFormData.Email__c });
            if (candidateID) {
                console.log('Existing candidateID data found:', candidateID);

                this.isNewCandidate = false;
                this.candidateRecordId = candidateID;
                await this.refreshCandidateData();
                this.showToast('Success', 'Welcome back! Please verify your information.', 'success');
                return true;
            }
            this.resetForm();
            this.isNewCandidate = true;
            this.showToast('Success', 'Please complete your registration.', 'success');
            return true;
        } catch (error) {
            this.showToast('Error', 'Error checking candidate: ' + this.getErrorMessage(error), 'error');
            return false;
        } finally {
            this.isProcessing = false;
        }
    }

    async submitCandidateInfo() {
        const stepFields = this.getStepFields(parseInt(this.currentStep, 10));
        this.isProcessing = true;

        console.log('Data before processing:', this.candidateFormData);
        console.log('Processing started');
        try {
            if (!this.isNewCandidate && this.candidateRecordId) {
                // Update Candidate
                console.log('Updating existing candidate:', this.candidateRecordId);
                const fields = {};
                CANDIDATE_FIELDS.forEach(field => {
                    // const fieldName = field.fieldApiName;
                    const value = this.candidateFormData[field.fieldApiName];
                    if (field.fieldApiName !== 'Id' && value !== undefined && value !== null) {
                        fields[field.fieldApiName] = value;
                    }
                });
                fields[ID_FIELD.fieldApiName] = this.candidateRecordId;
                await updateRecord({ fields });
                console.log('Candidate updated:', this.candidateRecordId);
                await this.refreshCandidateData();
            } else {
                const fieldsToCreate = {};
                stepFields.forEach(field => {
                    const value = this.candidateFormData[field.fieldApiName];
                    console.log(field.fieldApiName);
                    if (field.fieldApiName !== 'Id' &&
                        value !== undefined &&
                        value !== null &&
                        !(typeof value === 'string' && value.trim() === '')
                    ) {
                        fieldsToCreate[field.fieldApiName] = value;
                    }
                });
                const recordInput = { apiName: this.candidateObjectApiName, fields: fieldsToCreate };
                const createResult = await createRecord(recordInput);
                console.log('Candidate created:', createResult);
                this.candidateRecordId = createResult.id;
                this.candidateFormData = { ...this.candidateFormData, Id: createResult.id };
                this.isNewCandidate = false;
                await this.refreshCandidateData();
            }
            console.log('Update/Create operation completed successfully with field data:', stepFields);
            console.log('Data after operation:', this.candidateFormData);
            this.showToast('Success', 'Information saved.', 'success');
            return true;
        } catch (error) {
            console.error('Error in submitCandidateInfo:', error);
            this.showToast('Error', 'Error saving information: ' + this.getErrorMessage(error), 'error');
            return false;
        } finally {
            this.isProcessing = false;
        }
    }

    handleInputChange(event) {
        const field = event.target.dataset.field;
        const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
        this.candidateFormData = { ...this.candidateFormData, [field]: value };

        // console.log('Field changed:', field, 'New value:', value);

        const input = event.target;
        if (input.checkValidity()) {
            input.setCustomValidity('');
            input.reportValidity();
        }
    }

    handleFieldBlur(event) {
        const field = event.target.dataset.field;
        this.touchedFields.add(field);
        this.validateField(field);
    }

    async handleEmailKeyDown(event) {
        if (event.key === 'Enter') this.handleNext();
    }

    async handleNext() {
        const step = parseInt(this.currentStep, 10);
        console.log('handleNext called. Current step:', step);

        if (!this.validateCurrentStep()) {
            console.log('Validation failed for step:', step);
            // this.showToast('Error', 'Please correct the errors before proceeding.', 'error');
            return;
        }
        try {
            switch (step) {
                case 1: {
                    const status = await this.getCandidateByEmail();
                    if (!status) return;
                    break;
                }
                case 2: {
                    await this.submitCandidateInfo();
                    console.log('Candidate Details Submitted...');
                    if (this.candidateRecordId && this.isNewCandidate) {
                        const profilePicComponent = this.template.querySelector('c-profile-picture-form-component');
                        if (profilePicComponent) {
                            profilePicComponent.candidateRecordId = this.candidateRecordId;
                            await profilePicComponent.handleSubmit();
                        }
                    }
                    break;
                }
                case 3: {
                    const input = this.template.querySelector('[data-field="Data_Privacy_Consent"]');
                    if (!input.checkValidity()) {
                        input.reportValidity();
                        return;
                    }
                    const status = await this.submitCandidateInfo();
                    if (!status) return;
                    break;
                }
                case 4: {
                    const input = this.template.querySelector('[data-field="Data_Privacy_Consent"]');
                    if (!input.checkValidity()) {
                        input.reportValidity();
                        return;
                    }
                    break;
                }
                case 5:
                    console.log('Step 5');
                    break;
                default:
                    break;
            }
        } catch (error) {
            console.error('Error in handleNext:', error);
            this.showToast('Error', 'An error occurred: ' + this.getErrorMessage(error), 'error');
            return;
        }
        this.currentStep = String(step + 1);
        console.log('Moved to step:', this.currentStep);
    }

    handleCancel() {
        this.dispatchEvent(new CustomEvent('cancel'));
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Position__c',
                actionName: 'list'
            }
        });
    }

    handlePrevious() {
        const step = parseInt(this.currentStep, 10);
        if (step > 1) this.currentStep = String(step - 1);
    }

    async handleSubmit() {
        if (!this.validateCurrentStep()) {
            // this.showToast('Error', 'Please complete all required fields correctly before submitting.', 'error');
            return;
        }
        this.isProcessing = true;
        try {

            this.resetForm();
        } catch (error) {
            this.showToast('Error', 'Error submitting application: ' + this.getErrorMessage(error), 'error');
        } finally {
            this.isProcessing = false;
        }
    }

    resetForm() {
        this.currentStep = '1';
        this.candidateRecordId = null;
        this.isNewCandidate = true;
        for (let field of CANDIDATE_FIELDS) {
            const fieldName = field.fieldApiName;
            this.candidateFormData = {
                ...this.candidateFormData,
                [fieldName]: (fieldName === 'Email__c') ? this.candidateFormData.Email__c : (typeof this.candidateFormData[fieldName] === 'boolean') ? false : (typeof this.candidateFormData[fieldName] === 'number') ? null : ''
            };
        }
        const profilePicComponent = this.template.querySelector('c-profile-picture-form-component');
        if (profilePicComponent) profilePicComponent.clearImageData();
    }
}
