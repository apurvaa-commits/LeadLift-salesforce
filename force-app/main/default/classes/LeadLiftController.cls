public with sharing class LeadLiftController {

    // Wrapper class to represent pipeline data in a structured way for LWC
    public class PipelineData {
        @AuraEnabled public Id id { get; set; }
        @AuraEnabled public String company { get; set; }
        @AuraEnabled public Decimal value { get; set; }
        @AuraEnabled public String formattedValue { get; set; }
        @AuraEnabled public String stage { get; set; }
        @AuraEnabled public Integer probability { get; set; }
        @AuraEnabled public String risk { get; set; }
        @AuraEnabled public Boolean isLowRisk { get; set; }
        @AuraEnabled public Boolean isMediumRisk { get; set; }
        @AuraEnabled public Boolean isHighRisk { get; set; }
    }

    @AuraEnabled(cacheable=true)
    public static List<PipelineData> getPipelineData() {
        List<PipelineData> results = new List<PipelineData>();
        
        // Query active Opportunities (Not Closed Won or Closed Lost)
        List<Opportunity> opps = [
            SELECT Id, Name, Account.Name, Amount, StageName, Probability 
            FROM Opportunity 
            WHERE IsClosed = false 
            ORDER BY Amount DESC NULLS LAST 
            LIMIT 50
        ];
        
        // If no records found (e.g. brand new dev org), return some dummy data to ensure the demo works
        if (opps.isEmpty()) {
            return generateFallbackData();
        }

        for (Opportunity opp : opps) {
            PipelineData pd = new PipelineData();
            pd.id = opp.Id;
            pd.company = String.isNotBlank(opp.Account?.Name) ? opp.Account.Name : opp.Name;
            pd.value = opp.Amount != null ? opp.Amount : 0;
            
            // Format to INR Currency String
            pd.formattedValue = '₹' + String.valueOf(pd.value.intValue().format());
            pd.stage = opp.StageName;
            
            // Probability - Ensure it's not null
            Decimal prob = opp.Probability != null ? opp.Probability : 50;
            pd.probability = prob.intValue();
            
            // --- Simulate AI Risk Engine ---
            // In the final architecture, this would query the custom ML inference endpoint
            if (pd.probability >= 70 && !pd.stage.contains('Hold')) {
                pd.risk = 'Low';
                pd.isLowRisk = true;
                pd.isMediumRisk = false;
                pd.isHighRisk = false;
            } else if (pd.probability <= 30 || pd.stage == 'Negotiation/Review') {
                pd.risk = 'High';
                pd.isLowRisk = false;
                pd.isMediumRisk = false;
                pd.isHighRisk = true;
            } else {
                pd.risk = 'Medium';
                pd.isLowRisk = false;
                pd.isMediumRisk = true;
                pd.isHighRisk = false;
            }
            
            results.add(pd);
        }
        
        return results;
    }

    // Helper method to generate fallback data if the Salesforce org has no Opportunities
    private static List<PipelineData> generateFallbackData() {
        List<PipelineData> fallbackList = new List<PipelineData>();
        
        String[] companies = new String[]{'Globex Corporation', 'Initech', 'Umbrella Corp', 'Stark Industries', 'Wayne Enterprises'};
        String[] stages = new String[]{'Prospecting', 'Qualification', 'Needs Analysis', 'Value Proposition', 'Negotiation/Review'};
        Integer[] probabilities = new Integer[]{20, 40, 60, 80, 10};
        Decimal[] values = new Decimal[]{1200000, 450000, 3100000, 890000, 5000000};
        
        for (Integer i = 0; i < 5; i++) {
            PipelineData pd = new PipelineData();
            pd.id = (Id)'00600000000000' + String.valueOf(i) + 'AAA'; // Fake Salesforce ID
            pd.company = companies[i];
            pd.value = values[i];
            pd.formattedValue = '₹' + String.valueOf(pd.value.intValue().format());
            pd.stage = stages[i];
            pd.probability = probabilities[i];
            
            if (pd.probability >= 70) {
                pd.risk = 'Low'; pd.isLowRisk = true; pd.isMediumRisk = false; pd.isHighRisk = false;
            } else if (pd.probability <= 30) {
                pd.risk = 'High'; pd.isLowRisk = false; pd.isMediumRisk = false; pd.isHighRisk = true;
            } else {
                pd.risk = 'Medium'; pd.isLowRisk = false; pd.isMediumRisk = true; pd.isHighRisk = false;
            }
            fallbackList.add(pd);
        }
        return fallbackList;
    }
}
