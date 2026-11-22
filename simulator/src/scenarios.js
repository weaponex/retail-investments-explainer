export const scenarioList = [
  {
    id: "TFSA-LIQUIDITY-01",
    title: "Money needed soon",
    subtitle: "A planned expense is coming up",
    description: "Open and fund a TFSA while keeping a portion available for an expense.",
    facts: {
      age: 34, legalName: "Jordan Example", dateOfBirth: "1992-04-15", sinToken: "SIM-SIN-042",
      sinProvided: true, residentialAddress: "100 Sample Street, Toronto, ON", province: "Ontario",
      taxResidency: "Canada", foreignTaxResidencies: "None reported", occupation: "Project coordinator",
      employer: "Example Design Co.", employerAddress: "200 Fictional Avenue, Toronto, ON",
      thirdParty: "No", pepStatus: "No", hioStatus: "No", investmentAmount: 10000,
      annualIncome: 82000, financialAssets: 65000, netWorth: 95000, liabilities: "No borrowing planned",
      fundingReference: "",
      reportedContributionRoom: "Unknown", goal: "Planned expense", horizonMonths: 18,
      liquidityNeedMonths: 12, liquidityNeedAmount: 5000, riskTolerance: "Low",
      riskCapacity: "Moderate", investmentKnowledge: "Basic",
      experience: "Some experience with savings products"
    },
    fundingMethod: "External cash contribution",
    prompts: {
      account: "I may need half this money in a year, and all of it in about 18 months.",
      funding: "I have not checked my TFSA room yet. How should we handle that before I contribute?",
      identity: "I can show fictional identification for this practice scenario.",
      needs: "I want the money to be there when I need it, and I am not comfortable seeing losses.",
      review: "Before we place anything, can you explain when I can access the money and what I might receive?"
    }
  },
  {
    id: "TFSA-LONG-01",
    title: "Long horizon, cautious investor",
    subtitle: "Time is available, but losses feel uncomfortable",
    description: "Explore how time horizon, investment knowledge and risk profile inform a discussion.",
    facts: {
      age: 42, legalName: "Morgan Example", dateOfBirth: "1984-08-22", sinToken: "SIM-SIN-084",
      sinProvided: true, residentialAddress: "25 Fictional Road, Ottawa, ON", province: "Ontario",
      taxResidency: "Canada", foreignTaxResidencies: "None reported", occupation: "Operations analyst",
      employer: "North Example Services", employerAddress: "40 Practice Lane, Ottawa, ON",
      thirdParty: "No", pepStatus: "No", hioStatus: "No", investmentAmount: 10000,
      annualIncome: 104000, financialAssets: 115000, netWorth: 165000, liabilities: "Mortgage; no borrowing to invest",
      fundingReference: "Fictional transfer ref TF-8042",
      reportedContributionRoom: "$14,000 (client-reported)", goal: "Long-term savings",
      horizonMonths: 96, liquidityNeedMonths: 60, liquidityNeedAmount: 0,
      riskTolerance: "Low", riskCapacity: "Moderate", investmentKnowledge: "Limited",
      experience: "Has held savings accounts; no mutual fund experience"
    },
    fundingMethod: "Direct TFSA-to-TFSA transfer",
    prompts: {
      account: "I have an existing TFSA at another institution and want to move some of it here.",
      funding: "My CRA account showed about $14,000 of room, but I want to transfer from my existing TFSA.",
      identity: "I am opening this account for myself.",
      needs: "I have time, but I do not want to see this investment lose value.",
      review: "Please explain how the choice fits my comfort with risk and what is not guaranteed."
    }
  }
];
