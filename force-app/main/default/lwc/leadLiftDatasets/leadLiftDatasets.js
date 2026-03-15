import { LightningElement, api } from 'lwc';
import getPipelineData from '@salesforce/apex/LeadLiftController.getPipelineData';

export default class LeadLiftDatasets extends LightningElement {
    @api data = [];
    isGenerating = false;

    async loadFromSalesforce() {
        this.isGenerating = true;
        try {
            // Call the Apex Controller imperative method
            let data = await getPipelineData();
            
            // The dataset needs some mock email data to satisfy the Email Outreach view
            let formattedData = data.map(item => {
                return {
                    ...item,
                    lastEmail: `Discussing next steps for ${item.company} enterprise rollout...`,
                    emailSummary: `Prospect at ${item.company} is engaged but needs formal pricing and security documentation to proceed.`,
                    draftResponse: `Hi,\n\nPlease find attached the standard pricing tiers and security overview for ${item.company}.\nLet's schedule a call next week.\n\nBest,\nYour Lead Lift AI`
                };
            });
            
            this.dispatchEvent(new CustomEvent('dataupdate', {
                detail: { data: formattedData }
            }));
            
        } catch (error) {
            console.error('Error fetching data from Apex:', error);
            alert('Cannot connect to Salesforce backend. Ensure the LeadLiftController is deployed.');
        } finally {
            this.isGenerating = false;
        }
    }

    generateDummyData() {
        // Fallback dummy data generation exactly like React
        this.isGenerating = true;
        
        const formatINR = (value) => {
            return new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 0
            }).format(value);
        };

        const companies = ['Tata Consultancy', 'Reliance Industries', 'Infosys', 'Wipro', 'HDFC Bank', 'Bharti Airtel', 'Mahindra Group', 'Adani Enterprises'];
        const stages = ['Qualification', 'Discovery', 'Proposal', 'Negotiation', 'Closed Won'];
        const structuredData = [];
        
        for(let i=0; i < 15; i++) {
            const probability = Math.floor(Math.random() * 80) + 10;
            const value = Math.floor(Math.random() * 50000000) + 1000000;
            
            structuredData.push({
                id: `IND_OPP_${i+100}`,
                company: companies[Math.floor(Math.random() * companies.length)] + (i > 3 ? ` Div ${i}` : ''),
                value: value,
                formattedValue: formatINR(value),
                stage: stages[Math.floor(Math.random() * stages.length)],
                probability: probability,
                risk: probability > 70 ? 'Low' : probability > 40 ? 'Medium' : 'High',
                lastEmail: "Can we schedule a follow-up call to discuss the pricing model? The board needs clarification on the logistics module.",
                emailSummary: "Prospect is engaged but has specific questions about pricing and the logistics module integration.",
                draftResponse: "Hi there,\n\nI'd be happy to walk your board through our pricing tiers and how the logistics module integrates with your stack. Does tomorrow at 2 PM IST work for a quick call?\n\nBest regards,\nYour Lead Lift AI"
            });
        }

        setTimeout(() => {
            this.dispatchEvent(new CustomEvent('dataupdate', {
                detail: { data: structuredData }
            }));
            this.isGenerating = false;
        }, 800);
    }

    get hasData() {
        return this.data && this.data.length > 0;
    }
}
