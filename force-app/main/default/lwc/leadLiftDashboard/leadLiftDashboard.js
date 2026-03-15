import { LightningElement, api, track } from 'lwc';

export default class LeadLiftDashboard extends LightningElement {
    @api data = [];
    
    // Drawer State
    @track isDrawerOpen = false;
    @track selectedAccountId = null;
    get totalPipelineValue() {
        if (!this.data || this.data.length === 0) return '₹0';
        const total = this.data.reduce((sum, item) => sum + (item.value || 0), 0);
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(total);
    }

    get predictedClosuresCount() {
        if (!this.data) return 0;
        return this.data.filter(item => item.probability >= 70).length;
    }

    get atRiskCount() {
        if (!this.data) return 0;
        return this.data.filter(item => item.risk === 'High' || item.probability <= 30).length;
    }

    get opportunities() {
        return this.data || [];
    }

    handleRowClick(event) {
        // Implement row click logic to show insights drawer (or dispatch event)
        const rowId = event.currentTarget.dataset.id;
        this.selectedAccountId = rowId;
        this.isDrawerOpen = true;
        
        // Optional child dispatch if parent also needs to know
        const selectedEvent = new CustomEvent('rowclick', { detail: { id: rowId } });
        this.dispatchEvent(selectedEvent);
    }

    closeDrawer() {
        this.isDrawerOpen = false;
        this.selectedAccountId = null;
    }

    // --- Drawer Computations ---
    get selectedAccount() {
        if (!this.selectedAccountId || !this.data) return null;
        return this.data.find(item => String(item.id) === String(this.selectedAccountId));
    }

    get computedSummary() {
        if (!this.selectedAccount) return '';
        const acc = this.selectedAccount;
        return `${acc.company} has been in the ${acc.stage} stage. They exhibit a buying committee with high urgency. Recent interactions indicate strong interest, but pricing and integration remains a minor hurdle. Overall sentiment is cautiously optimistic given the ${acc.probability}% win probability.`;
    }

    get computedNBA() {
        const acc = this.selectedAccount;
        if (!acc) return { title: '', description: '' };
        
        if (acc.probability >= 70) {
            return {
                title: 'Send Final Proposal & Contract',
                description: 'The deal has high closure probability. Generate and send the final customized order form via the Copilot.'
            };
        } else if (acc.risk === 'High' || acc.probability <= 30) {
            return {
                title: 'Escalate to VP of Sales',
                description: 'Warning: Deal momentum has stalled. Executive alignment is urgently required to re-engage the primary stakeholders.'
            };
        } else {
            return {
                title: 'Schedule Technical Deep-Dive',
                description: 'To move past the current stage, arrange a 30-minute session with their engineering lead to validate our API capabilities.'
            };
        }
    }
}