// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Crowdfunding {

    struct Campaign {
        address payable recipient;  // Vem som ska få pengarna
        uint256 goalAmount;         // Målbelopp
        uint256 deadline;           // Deadline (timestamp)
        uint256 totalDonations;     // Totala donationer
        bool isClosed;              // Om insamlingen är stängd
    }

    // Mapping för att hålla koll på alla insamlingar
    mapping(uint256 => Campaign) public campaigns;
    // Mapping för att hålla reda på donationer per användare
    mapping(uint256 => mapping(address => uint256)) public donations;

    // Event för att logga händelser
    event CampaignCreated(uint256 campaignId, address recipient, uint256 goalAmount, uint256 deadline);
    event Donated(uint256 campaignId, address donor, uint256 amount);
    event CampaignClosed(uint256 campaignId, bool successful);

    uint256 public campaignCount; // Håller reda på antal skapade insamlingar

    // Modifier för att säkerställa att insamlingen inte är stängd
    modifier notClosed(uint256 campaignId) {
        require(!campaigns[campaignId].isClosed, "This campaign is already closed");
        _;
    }

    // Modifier för att kontrollera om deadline har passerat
    modifier deadlineNotPassed(uint256 campaignId) {
        require(block.timestamp < campaigns[campaignId].deadline, "The deadline has passed");
        _;
    }

    // Modifier för att säkerställa att endast skaparen av insamlingen kan stänga den
    modifier onlyRecipient(uint256 campaignId) {
        require(msg.sender == campaigns[campaignId].recipient, "Only the recipient can close the campaign");
        _;
    }

    // Constructor för att initialisera kontraktet
    constructor() {
        campaignCount = 0;
    }

    // Funktion för att skapa en ny insamling
    function createCampaign(address payable _recipient, uint256 _goalAmount, uint256 _deadline) external {
        require(_goalAmount > 0, "Goal amount must be greater than zero");
        require(_deadline > block.timestamp, "Deadline must be in the future");

        campaignCount++;
        campaigns[campaignCount] = Campaign({
            recipient: _recipient,
            goalAmount: _goalAmount,
            deadline: _deadline,
            totalDonations: 0,
            isClosed: false
        });

        emit CampaignCreated(campaignCount, _recipient, _goalAmount, _deadline);
    }

    // Funktion för att donera till en insamling
    function donate(uint256 campaignId) external payable notClosed(campaignId) deadlineNotPassed(campaignId) {
        Campaign storage campaign = campaigns[campaignId];
        require(msg.value > 0, "Donation must be greater than zero");

        // Uppdatera donationer
        campaign.totalDonations += msg.value;
        donations[campaignId][msg.sender] += msg.value;

        emit Donated(campaignId, msg.sender, msg.value);
    }

    // Funktion för att stänga en insamling och överföra pengarna om målet har nåtts
    function closeCampaign(uint256 campaignId) external onlyRecipient(campaignId) {
        Campaign storage campaign = campaigns[campaignId];
        require(!campaign.isClosed, "Campaign is already closed");

        if (campaign.totalDonations >= campaign.goalAmount) {
            // Om målet har nåtts, överför pengarna till mottagaren
            campaign.recipient.transfer(campaign.totalDonations);
            emit CampaignClosed(campaignId, true);
        } else {
            // Om målet inte har nåtts, återbetal alla bidragsgivare
            for (uint256 i = 1; i <= campaignCount; i++) {
                if (donations[campaignId][msg.sender] > 0) {
                    payable(msg.sender).transfer(donations[campaignId][msg.sender]);
                }
            }
            emit CampaignClosed(campaignId, false);
        }

        campaign.isClosed = true;
    }

    // Funktion för att återbetala donationer om insamlingen misslyckats
    function refund(uint256 campaignId) external {
        Campaign storage campaign = campaigns[campaignId];
        require(campaign.isClosed, "Campaign is not closed yet");
        require(campaign.totalDonations < campaign.goalAmount, "Goal amount was reached, no refund");

        uint256 donationAmount = donations[campaignId][msg.sender];
        require(donationAmount > 0, "No donations to refund");

        donations[campaignId][msg.sender] = 0; // Nollställ donationen
        payable(msg.sender).transfer(donationAmount);
    }
}
