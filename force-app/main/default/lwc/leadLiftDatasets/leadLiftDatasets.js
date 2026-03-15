import { LightningElement, api } from 'lwc';
import getPipelineData from '@salesforce/apex/LeadLiftController.getPipelineData';

export default class LeadLiftDatasets extends LightningElement {
    @api data = [];
    isGenerating = false;
    isDragging = false; // Added to track drag hover state

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

    // --- File Upload Logic ---
    triggerFileUpload() {
        const fileInput = this.template.querySelector('.hidden-input');
        if (fileInput) fileInput.click();
    }

    handleFileUpload(event) {
        if (event.target.files.length > 0) {
            this.processFile(event.target.files[0]);
        }
    }

    handleDragEnter(event) {
        event.preventDefault();
        event.stopPropagation();
        this.isDragging = true;
    }

    handleDragOver(event) {
        event.preventDefault();
        event.stopPropagation();
        this.isDragging = true;
    }

    handleDragLeave(event) {
        event.preventDefault();
        event.stopPropagation();
        this.isDragging = false;
    }

    handleDrop(event) {
        event.preventDefault();
        event.stopPropagation();
        this.isDragging = false;
        if (event.dataTransfer && event.dataTransfer.files.length > 0) {
            this.processFile(event.dataTransfer.files[0]);
        }
    }

    get uploadZoneClass() {
        return this.isDragging ? 'upload-zone drag-active' : 'upload-zone';
    }

    processFile(file) {
        if (!file.name.toLowerCase().endsWith('.csv')) {
            alert('Please upload a valid CSV file.');
            return;
        }
        this.isGenerating = true;
        const reader = new FileReader();
        reader.onload = (e) => {
            this.parseCSV(e.target.result);
        };
        reader.onerror = () => {
            alert('Error reading file');
            this.isGenerating = false;
        };
        reader.readAsText(file);
    }

    parseCSV(csvText) {
        try {
            const lines = csvText.split('\n').filter(line => line.trim().length > 0);
            if (lines.length < 2) throw new Error('CSV is empty or missing data');
            
            const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
            const parsedData = [];
            
            for (let i = 1; i < lines.length; i++) {
                // Split respecting quotes
                const currentLine = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
                if (currentLine.length === headers.length) {
                    const company = currentLine[headers.indexOf('company')]?.replace(/"/g, '').trim() || 'Unknown';
                    const valueStr = currentLine[headers.indexOf('value')]?.replace(/"/g, '').trim() || '0';
                    const stage = currentLine[headers.indexOf('stage')]?.replace(/"/g, '').trim() || 'Prospecting';
                    const probStr = currentLine[headers.indexOf('probability')]?.replace(/"/g, '').trim() || '0';
                    const riskStr = currentLine[headers.indexOf('risk')]?.replace(/"/g, '').trim();
                    
                    const value = parseFloat(valueStr) || 0;
                    const probability = parseInt(probStr) || 0;
                    
                    let risk = riskStr || (probability > 70 ? 'Low' : probability > 40 ? 'Medium' : 'High');
                    
                    parsedData.push({
                        id: `CSV_OPP_${Date.now()}_${i}`,
                        company: company,
                        value: value,
                        formattedValue: new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value),
                        stage: stage,
                        probability: probability,
                        risk: risk,
                        isLowRisk: risk.toLowerCase() === 'low',
                        isMediumRisk: risk.toLowerCase() === 'medium',
                        isHighRisk: risk.toLowerCase() === 'high',
                        lastEmail: `Discussing next steps for ${company}...`,
                        emailSummary: `Prospect at ${company} is evaluating our offering based on the recent follow-up.`,
                        draftResponse: `Hi,\n\nFollowing up on our recent ${stage} discussions for ${company}. Let's secure a time to finalize details.\n\nBest,\nYour Lead Lift AI`
                    });
                }
            }
            
            this.dispatchEvent(new CustomEvent('dataupdate', { detail: { data: parsedData } }));
        } catch(error) {
            console.error('Error parsing CSV', error);
            alert('Error parsing CSV file. Please ensure it has headers: Company,Value,Stage,Probability,Risk');
        } finally {
            this.isGenerating = false;
        }
    }
}