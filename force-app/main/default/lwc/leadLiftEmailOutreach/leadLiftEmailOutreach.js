import { LightningElement, api, track } from 'lwc';

export default class LeadLiftEmailOutreach extends LightningElement {
    @api data = [];
    @track approvedEmailIds = [];

    get processedData() {
        if (!this.data) return [];
        return this.data.map(opp => {
            return {
                ...opp,
                lastEmail: opp.lastEmail ? opp.lastEmail : `Following up on the previous discussion regarding enterprise workflows for ${opp.company || 'your team'}.`,
                emailSummary: opp.emailSummary ? opp.emailSummary : `The technical team at ${opp.company || 'the prospect'} is satisfied, but needs executive approval on the ${opp.formattedValue || 'pricing'} proposal.`,
                draftResponse: opp.draftResponse ? opp.draftResponse : `Hi,\n\nI have attached the enterprise SLA and pricing options discussed.\nLet's review on a quick call to ensure everything aligns with your goals.\n\nThanks,\nLead Lift AI`,
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