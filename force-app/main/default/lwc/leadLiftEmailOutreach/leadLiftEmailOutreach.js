import { LightningElement, api, track } from 'lwc';

export default class LeadLiftEmailOutreach extends LightningElement {
    @api data = [];
    @track approvedEmailIds = [];

    get processedData() {
        if (!this.data) return [];
        return this.data.map(opp => {
            return {
                ...opp,
                isApproved: this.approvedEmailIds.includes(opp.id)
            };
        });
    }

    get hasData() {
        return this.data && this.data.length > 0;
    }

    get totalApproved() {
        return this.approvedEmailIds.length;
    }

    handleApprove(event) {
        const id = event.target.dataset.id;
        if (!this.approvedEmailIds.includes(id)) {
            this.approvedEmailIds = [...this.approvedEmailIds, id];
        }
    }
}
