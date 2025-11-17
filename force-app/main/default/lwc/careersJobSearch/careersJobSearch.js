import { LightningElement, wire } from 'lwc';
import { publish, MessageContext } from 'lightning/messageService';
import JOB_SEARCH_CHANNEL from '@salesforce/messageChannel/JobSearchChannel__c';
import getJobListings from '@salesforce/apex/BigJobsPortalController.getJobListings';

/** The delay used when debouncing event handlers before invoking Apex. */
const DELAY = 350;

export default class CareersJobSearch extends LightningElement {
    queryTerm = '';
    jobs;

    @wire(MessageContext)
    messageContext;

    handleKeyUp(event) {
        const isEnterKey = event.key === 'Enter';
        if (isEnterKey) {
            const inputElement = event.target;
            this.queryTerm = inputElement.value;
            console.log('Search query term:', this.queryTerm);
            this.fetchJobs();
        }
    }

    handleKeyChange(event) {
        // Debouncing this method: Do not actually invoke the Apex call as long as this function is
        // being called within a delay of DELAY. This is to avoid a very large number of Apex method calls.
        window.clearTimeout(this.delayTimeout);
        const searchKey = event.target.value;
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.delayTimeout = setTimeout(() => {
            this.queryTerm = searchKey;
            console.log('Search query term (debounced):', this.queryTerm);
            // this.fetchJobs();
        }, DELAY);
    }

    connectedCallback() {
        // Initial fetch with empty search term to load all jobs
        this.fetchJobs();
    }

    async fetchJobs() {
        try {
            this.jobs = await getJobListings({ searchTerm: this.queryTerm });
            console.log('Retrieved job listings:', this.jobs);
            
            const message = {
                jobs: this.jobs,
                searchTerm: this.queryTerm,
                filters: {}
            };
            publish(this.messageContext, JOB_SEARCH_CHANNEL, message);
        } catch (error) {
            console.error('Error retrieving job listings:', error);
            this.jobs = [];
            
            const message = {
                jobs: [],
                searchTerm: this.queryTerm,
                filters: {}
            };
            publish(this.messageContext, JOB_SEARCH_CHANNEL, message);
        }
    }
}