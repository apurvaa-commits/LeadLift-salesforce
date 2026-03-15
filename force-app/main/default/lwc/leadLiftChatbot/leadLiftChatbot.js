import { LightningElement, track, api } from 'lwc';

export default class LeadLiftChatbot extends LightningElement {
    @api data = [];
    @track inputValue = '';
    @track isTyping = false;
    
    @track messages = [
        {
            id: 'msg-1',
            text: 'Hello! I am Lead Lift, your AI Sales Copilot. How can I help you prioritize your pipeline today?',
            isBot: true,
            cssClass: 'message bot',
            actions: [
                { label: 'Show top priorities', value: 'priorities' },
                { label: 'Summarize active deals', value: 'summary' }
            ]
        }
    ];

    handleClose() {
        this.dispatchEvent(new CustomEvent('close'));
    }

    handleInputChange(event) {
        this.inputValue = event.target.value;
    }

    get isSendDisabled() {
        return !this.inputValue || this.inputValue.trim().length === 0;
    }

    handleKeyPress(event) {
        if (event.key === 'Enter' && !this.isSendDisabled) {
            this.handleSend();
        }
    }

    handleActionClick(event) {
        const action = event.target.dataset.action;
        if (action === 'priorities') {
            this.sendMessage('Show top priorities');
        } else if (action === 'summary') {
            this.sendMessage('Summarize active deals');
        }
    }

    handleSend() {
        if (this.isSendDisabled) return;
        this.sendMessage(this.inputValue);
        this.inputValue = '';
    }

    sendMessage(text) {
        // Add User Message
        this.messages = [
            ...this.messages,
            {
                id: `msg-${Date.now()}`,
                text: text,
                isBot: false,
                cssClass: 'message user'
            }
        ];

        // Simulate AI Thinking
        this.isTyping = true;
        this.scrollToBottom();

        // Simulate AI Response Delay
        setTimeout(() => {
            this.isTyping = false;
            this.generateBotResponse(text);
        }, 1200);
    }

    generateBotResponse(userText) {
        const query = userText.toLowerCase();
        let responseText = "I'm connected to your CRM. Based on your active pipeline, let me analyze that for you.";
        let actions = null;

        if (query.includes('priorities') || query.includes('priority')) {
            const highRisk = this.data ? this.data.filter(d => d.risk === 'High' || d.probability <= 30) : [];
            if (highRisk.length > 0) {
                 responseText = `You have ${highRisk.length} accounts flagged as high risk by our ML models. I recommend focusing on ${highRisk[0].company} as the probability has dropped to ${highRisk[0].probability}% recently.`;
            } else {
                 responseText = "Great news! Currently, none of your top accounts are flagged as High Risk.";
            }
        } 
        else if (query.includes('summary') || query.includes('deals')) {
             if (this.data && this.data.length > 0) {
                 const bestDeal = this.data.reduce((prev, current) => (prev.probability > current.probability) ? prev : current);
                 responseText = `You have ${this.data.length} active opportunities. The most promising deal is with ${bestDeal.company} at ${bestDeal.formattedValue} with a win probability of ${bestDeal.probability}%.`;
             } else {
                 responseText = "Your data is currently empty. Please load data from Salesforce or generate a synthetic dataset in the Datasets tab.";
             }
        }
        else if (query.includes('hello') || query.includes('hi')) {
            responseText = "Hello! Ready to accelerate some closures today?";
        }

        this.messages = [
            ...this.messages,
            {
                id: `msg-${Date.now()}`,
                text: responseText,
                isBot: true,
                cssClass: 'message bot',
                actions: actions
            }
        ];
        
        this.scrollToBottom();
    }

    scrollToBottom() {
        // Use a short timeout to allow the DOM to render the new message
        setTimeout(() => {
            const messageContainer = this.template.querySelector('.chatbot-messages');
            if (messageContainer) {
                messageContainer.scrollTop = messageContainer.scrollHeight;
            }
        }, 50);
    }
}