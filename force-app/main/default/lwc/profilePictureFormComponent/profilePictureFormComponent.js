import { api, LightningElement, wire } from 'lwc';
import Toast from 'lightning/toast';
import getContentVersionByDocumentId from '@salesforce/apex/BigJobsPortalController.getContentVersionByDocumentId';
import uploadCandiateProfilePicture from '@salesforce/apex/BigJobsPortalController.uploadCandiateProfilePicture';
import { getRecord } from 'lightning/uiRecordApi';

const ACCEPTED_FORMATS = ['.jpg', '.jpeg', '.png'];
const FILE_EXTENSIONS = ACCEPTED_FORMATS.map(ext => ext.replace('.', '').toLowerCase());

export default class ProfilePictureFormComponent extends LightningElement {
    @api candidateRecordId;
    // @api candidateRecordId = 'a01g5000001aGX7AAM';

    photoDocumentId = null;
    imageDoc = null;
    docIdError = null;
    isProcessing = false;

    @api clearImageData() {
        this.photoDocumentId = null;
        this.imageDoc = null;
        this.docIdError = null;
    }

    @wire(getRecord, { recordId: '$candidateRecordId', fields: ['Candidate__c.Photo_Document_Id__c'] })
    wiredCandidateRecord({ error, data }) {
        if (data) {
            this.photoDocumentId = data.fields.Photo_Document_Id__c.value;
        } else if (error) {
            this.photoDocumentId = null;
            this.docIdError = 'Error fetching candidate record: ' + JSON.stringify(error);
        }
    }

    @wire(getContentVersionByDocumentId, { contentDocumentId: '$photoDocumentId' })
    wiredContentVersion({ error, data }) {
        if (!this.photoDocumentId) {
            this.imageDoc = null;
            this.docIdError = null;
            return;
        }
        if (data) {
            this.docIdError = null;
            if (FILE_EXTENSIONS.includes(data.fileExtension?.toLowerCase())) {
                this.imageDoc = `data:image/${data.fileExtension};base64,${data.base64}`;
            } else {
                this.docIdError = 'The uploaded file is not a supported image format.';
                this.imageDoc = null;
            }
        } else if (error) {
            this.docIdError = 'Error: ' + JSON.stringify(error);
            this.imageDoc = null;
        }
    }

    async handleFileChange(event) {
        const file = event.target.files[0];
        if (!file) return;

        const fileExtension = file.name.split('.').pop().toLowerCase();
        if (!FILE_EXTENSIONS.includes(fileExtension)) {
            this.docIdError = `Invalid file format. Accepted formats: ${ACCEPTED_FORMATS.join(', ')}`;
            return;
        }

        const MAX_SIZE = 1024 * 1024; // 1 MB in bytes
        if (file.size > MAX_SIZE) {
            this.docIdError = 'File size exceeds 1 MB limit.';
            return;
        }

        this.docIdError = null;
        const newFileName = `CAND_${this.candidateRecordId || 'TEMP'}_PHOTO.${fileExtension}`;
        Object.defineProperty(file, 'name', { writable: true, value: newFileName });

        this.isProcessing = true;
        const reader = new FileReader();
        reader.onload = async () => {
            const base64 = reader.result.split(',')[1];
            const oldImageDoc = this.imageDoc;
            this.imageDoc = `data:image/${fileExtension};base64,${base64}`;
            if (this.candidateRecordId) {
                try {
                    const contentDocumentId = await uploadCandiateProfilePicture({
                        candidateId: this.candidateRecordId,
                        fileName: newFileName,
                        base64Data: base64,
                        previousDocumentId: this.photoDocumentId || null
                    });
                    this.photoDocumentId = contentDocumentId;
                    Toast.show({ label: 'Profile picture uploaded successfully.', variant: 'success' });
                    this.imageDoc = `data:image/${fileExtension};base64,${base64}`;
                } catch (e) {
                    this.docIdError = 'Error uploading file: ' + (e && e.body && e.body.message ? e.body.message : e.message);
                    this.imageDoc = oldImageDoc;
                    Toast.show({ label: this.docIdError, variant: 'error' });
                }
            } else {
                Toast.show({ label: 'Preview loaded. Submit to upload.', variant: 'info' });
            }
        };
        this.isProcessing = false;
        reader.readAsDataURL(file);
    }

    // Expose handleSubmit as a public method to be called from parent
    @api
    async handleSubmit() {
        // Check if image is loaded
        if (!this.imageDoc) {
            console.log('No image to upload');
            return;
        }
        
        // Check if candidateRecordId is set
        if (!this.candidateRecordId) {
            this.docIdError = 'Candidate record ID is missing.';
            Toast.show({ label: this.docIdError, variant: 'error' });
            return;
        }
        
        // Extract image data
        const matches = this.imageDoc.match(/^data:image\/(\w+);base64,(.+)$/);
        if (!matches) {
            this.docIdError = 'Invalid image data.';
            Toast.show({ label: this.docIdError, variant: 'error' });
            return;
        }
        
        const fileExtension = matches[1];
        const base64 = matches[2];
        const newFileName = `CAND_${this.candidateRecordId}_PHOTO.${fileExtension}`;
        
        try {
            const contentDocumentId = await uploadCandiateProfilePicture({
                candidateId: this.candidateRecordId,
                fileName: newFileName,
                base64Data: base64,
                previousDocumentId: this.photoDocumentId || null
            });
            this.photoDocumentId = contentDocumentId;
            Toast.show({ label: 'Profile picture uploaded successfully.', variant: 'success' });
        } catch (e) {
            this.docIdError = 'Error uploading file: ' + (e && e.body && e.body.message ? e.body.message : e.message);
            Toast.show({ label: this.docIdError, variant: 'error' });
        }
    }

    get acceptedFormats() {
        return ACCEPTED_FORMATS;
    }
}
