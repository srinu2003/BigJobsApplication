import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class JobTile extends NavigationMixin(LightningElement) {
    @api position = {
        Id: 'MOCK1',
        Name: 'Frontend Developer',
        Location__c: 'New York, NY',
        Experience_Level__c: 'Mid-Level',
        Department__c: 'Engineering',
        Education__c: 'Bachelor\'s Degree in Computer Science',
        Job_Description__c: 'You can filter records based on field values, for example, to filter according to category or to query and retrieve changes that are tracked in a user\'s profile feed by using WITH filteringExpression. This optional clause can be added to a SELECT statement of a SOQL query.',
        Pay_Grade__c: 'P5',
        Salary_Range__c: '$80,000 - $120,000',
        CreatedDate: '2024-06-01',
        Application_Deadline__c: '2024-07-15',
        Skills_Required__c: 'JavaScript, HTML, CSS, LWC',
        Remaining_Openings__c: 3
    };

    connectedCallback() {
        // Set a mock position for testing/demo purposes
    }

    get hasOpenings() {
        return this.position?.Remaining_Openings__c && this.position.Remaining_Openings__c > 0;
    }

    get openingsLabel() {
        const count = this.position?.Remaining_Openings__c || 0;
        return count === 1 ? 'position available' : 'positions available';
    }

    handleViewDetails() {
        if (!this.position?.Id) {
            console.error('Position ID is required to view details');
            return;
        }

        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.position.Id,
                objectApiName: 'Position__c',
                actionName: 'view'
            }
        });

        // this.dispatchEvent(new CustomEvent('viewdetails', {
        //     detail: {
        //         positionId: this.position.Id,
        //         position: this.position
        //     },
        //     bubbles: true,
        //     composed: true
        // }));
    }

    handleApplyNow() {
        if (!this.position?.Id) {
            console.error('Position ID is required to apply');
            return;
        }

        // this.dispatchEvent(new CustomEvent('applynow', {
        //     detail: {
        //         positionId: this.position.Id,
        //         positionName: this.position.Name,
        //         positionLocation: this.position.Location__c,
        //         positionDepartment: this.position.Department__c,
        //         position: this.position
        //     },
        //     bubbles: true,
        //     composed: true
        // }));

        // Navigate to application page with position details
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
}
