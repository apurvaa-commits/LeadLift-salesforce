import { LightningElement, track } from 'lwc';

export default class LeadLiftApp extends LightningElement {
    @track activeView = 'dashboard';
    @track data = [];
    @track chatbotOpen = false;

    // Sidebar navigation handlers
    handleNavDashboard() { this.activeView = 'dashboard'; }
    handleNavDatasets() { this.activeView = 'datasets'; }
    handleNavEmail() { this.activeView = 'email'; }
    handleNavSettings() { this.activeView = 'settings'; }

    // Toggle Chatbot
    toggleChatbot() {
        this.chatbotOpen = !this.chatbotOpen;
    }

    // Handle dataset updates from child components
    handleDataUpdate(event) {
        this.data = event.detail.data;
    }

    // Getters for conditional rendering
    get isDashboard() { return this.activeView === 'dashboard'; }
    get isDatasets() { return this.activeView === 'datasets'; }
    get isEmail() { return this.activeView === 'email'; }
    get isSettings() { return this.activeView === 'settings'; }

    // Dynamic classes for sidebar active states
    get dashboardNavClass() { return this.activeView === 'dashboard' ? 'nav-item active' : 'nav-item'; }
    get datasetsNavClass() { return this.activeView === 'datasets' ? 'nav-item active' : 'nav-item'; }
    get emailNavClass() { return this.activeView === 'email' ? 'nav-item active' : 'nav-item'; }
    get settingsNavClass() { return this.activeView === 'settings' ? 'nav-item active' : 'nav-item'; }
}
